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
        $users = User::with(['certificates' => function($query) {
            $query->withPivot('status');
        }])->orderBy('created_at', 'desc')->get();

        error_log($users);

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
            'certificate_status' => 'in:requested,approved',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'group_name' => UserGroup::from($validated['group_name']),
            'email_verified_at' => now(), // Auto-verify for admin-created users
        ]);

        // Attach certificates if provided
        if (!empty($validated['certificate_ids'])) {
            $status = $validated['certificate_status'] ?? 'requested';
            $certificateData = [];
            foreach ($validated['certificate_ids'] as $certId) {
                $certificateData[$certId] = ['status' => CertificateStatus::from($status)];
            }
            $user->certificates()->attach($certificateData);
        }

        return redirect('/profile/' . $user->id)
            ->with('success', 'Benutzer erfolgreich erstellt!');
    }

    public function show(User $profile)
    {
        error_log($profile);
        $profile->load([
            'certificates' => function($query) {
                $query->withPivot('status');
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
        $profile->load(['certificates' => function($query) {
            $query->withPivot('status');
        }]);

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
            'certificate_ids.*' => 'exists:certificates,id',
            'certificate_status' => 'in:requested,approved',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'group_name' => UserGroup::from($validated['group_name']),
        ];

        // Only update password if provided
        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $profile->update($updateData);

        // Sync certificates with status
        if (isset($validated['certificate_ids'])) {
            $status = $validated['certificate_status'] ?? 'requested';
            $certificateData = [];
            foreach ($validated['certificate_ids'] as $certId) {
                $certificateData[$certId] = ['status' => CertificateStatus::from($status)];
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
        // Prevent deleting the current user
        if ($profile->id === auth()->id()) {
            return back()->with('error', 'Du kannst dich nicht selbst löschen!');
        }

        $profile->delete();

        return redirect('/profiles')
            ->with('success', 'Benutzer erfolgreich gelöscht!');
    }
}
