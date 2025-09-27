<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Certificate;
use App\Enums\UserGroup;
use App\Enums\CertificateStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with([
            'certificates' => function ($query) {
                $query->withPivot('status', 'url');
            },
            'dataSources'
        ])->orderBy('created_at', 'desc')->get();

        return Inertia::render('profiles', [
            'users' => $users
        ]);
    }

    public function create()
    {
        $certificates = Certificate::orderBy('name')->get();

        return Inertia::render('profile/createOrUpdate', [
            'certificates' => $certificates
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'group_name' => 'required|in:admin,operator,user',
            'certificate_ids' => 'array',
            'certificate_ids.*' => 'exists:certificates,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'group_name' => UserGroup::from($validated['group_name']),
            'email_verified_at' => now(),
        ]);

        // If admin wants to pre-assign certificates (without user's file), set status to approved, url null
        if (!empty($validated['certificate_ids'])) {
            $certificateData = [];
            foreach ($validated['certificate_ids'] as $certId) {
                $certificateData[$certId] = [
                    'status' => CertificateStatus::APPROVED,
                    'url' => null
                ];
            }
            $user->certificates()->attach($certificateData);
        }

        return redirect('/profile/' . $user->id)
            ->with('success', 'Benutzer erfolgreich erstellt!');
    }

    public function show(User $profile)
    {
        $profile->load([
            'certificates' => function ($query) {
                $query->withPivot('status', 'url');
            },
            'dataSources',
        ]);
        return Inertia::render('profile/show', [
            'user' => $profile
        ]);
    }

    public function edit(User $profile)
    {
        $certificates = Certificate::orderBy('name')->get();
        $profile->load([
            'certificates' => function ($query) {
                $query->withPivot('status', 'url');
            }
        ]);
        return Inertia::render('profile/createOrUpdate', [
            'user' => $profile,
            'certificates' => $certificates
        ]);
    }

    public function update(Request $request, User $profile)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $profile->id,
            'password' => 'nullable|string|min:8|confirmed',
            'group_name' => 'required|in:admin,operator,user',
            'certificate_ids' => 'array',
            'certificate_ids.*' => 'exists:certificates,id'
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'group_name' => UserGroup::from($validated['group_name']),
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $profile->update($updateData);

        // Only admins should do this: pre-assign certificates without file, status = approved, url null
        if (isset($validated['certificate_ids'])) {
            // Get existing user certificates as array [certificate_id => ['status'=>..., 'url'=>...]]
            $existingCertificates = $profile->certificates->keyBy('id')->map(function ($cert) {
                return [
                    'status' => $cert->pivot->status,
                    'url' => $cert->pivot->url,
                ];
            })->toArray();

            $certificateData = [];
            foreach ($validated['certificate_ids'] as $certId) {
                if (array_key_exists($certId, $existingCertificates)) {
                    // Preserve existing status and url
                    $certificateData[$certId] = [
                        'status' => $existingCertificates[$certId]['status'],
                        'url' => $existingCertificates[$certId]['url'],
                    ];
                } else {
                    // New assignment defaults to approved or requested? Choose as needed.
                    $certificateData[$certId] = [
                        'status' => CertificateStatus::APPROVED,
                        'url' => null,
                    ];
                }
            }

            $profile->certificates()->sync($certificateData);
        } else {
            $profile->certificates()->detach();
        }

        return redirect('/profile/' . $profile->id)
            ->with('success', 'Benutzer erfolgreich aktualisiert!');
    }

    public function destroy(User $profile)
    {
        if ($profile->id === auth()->id()) {
            return back()->with('error', 'Du kannst dich nicht selbst löschen!');
        }

        $profile->delete();

        return redirect('/profiles')
            ->with('success', 'Benutzer erfolgreich gelöscht!');
    }

    // --- NEW: User uploads their own certificate version ---
    public function uploadCertificate(Request $request)
    {
        $validated = $request->validate([
            'certificate_id' => 'required|exists:certificates,id',
            'url' => 'required|url'
        ]);

        $user = auth()->user();

        $existing = $user->certificates()->where('certificate_id', $validated['certificate_id'])->first();
        if ($existing) {
            $user->certificates()->updateExistingPivot($validated['certificate_id'], [
                'status' => CertificateStatus::REQUESTED,
                'url' => $validated['url'],
            ]);
        } else {
            $user->certificates()->attach($validated['certificate_id'], [
                'status' => CertificateStatus::REQUESTED,
                'url' => $validated['url'],
            ]);
        }

        return back()->with('success', 'Ihr Zertifikat wurde eingereicht und wartet auf Freigabe.');
    }

    // Approve user certificate (admin/operator only) ---
    public function approveUserCertificate($userId, $certificateId)
    {
        $user = User::findOrFail($userId);
        $user->certificates()->updateExistingPivot($certificateId, [
            'status' => CertificateStatus::APPROVED,
        ]);
        return back()->with('success', 'Zertifikat genehmigt.');
    }

    // Reject user certificate (admin/operator only) ---
    public function rejectUserCertificate($userId, $certificateId)
    {
        $user = User::findOrFail($userId);
        $user->certificates()->updateExistingPivot($certificateId, [
            'status' => CertificateStatus::REJECTED,
        ]);
        return back()->with('success', 'Zertifikat abgelehnt.');
    }// In UserController.php

    public function deleteUserCertificate(User $user, Certificate $certificate)
    {
        // Authorization: only admins or the user themselves can delete
        $currentUser = auth()->user();
        if ((!$currentUser->group_name === 'admin' || !$currentUser->group_name === 'operator') && $currentUser->id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        $user->certificates()->detach($certificate->id);

        return back()->with('success', 'Zertifikat wurde entfernt.');
    }
}
