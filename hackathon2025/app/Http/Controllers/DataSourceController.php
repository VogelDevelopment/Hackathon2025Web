<?php

namespace App\Http\Controllers;

use App\Models\DataSource;
use App\Models\Certificate;
use App\Enums\CertificateStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DataSourceController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $dataSources = DataSource::with(['user', 'certificates', 'comments', 'grantedUsers', 'grantedAccessUsers'])
            ->orderBy('created_at', 'desc')
            ->withCount([
                'accessRequests as open_requests_count' => function ($query) {
                    $query->where('datasource_user_access.granted', false);
                }
            ])
            ->get()
            ->map(function ($ds) use ($user) {
                $ds->access_request_status = $ds->accessRequests()
                    ->where('user_id', $user->id)
                    ->exists() ? 'pending' : null;
                // Optionally add 'approved', 'rejected' states if modeled
    
                return $ds;
            });

        $certificates = Certificate::orderBy('name')->get();
        $profile = $user;
        $profile->load([
            'certificates' => function ($query) {
                $query->withPivot('status', 'url');
            },
            'dataSources',
        ]);
        return Inertia::render('datasources', [
            'user' => $user,
            'dataSources' => $dataSources,
            'certificates' => $certificates,
        ]);
    }

    public function create()
    {
        $certificates = Certificate::orderBy('name')->get();

        return Inertia::render('datasource/createOrUpdate', [
            'certificates' => $certificates
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'requested_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'justification' => 'nullable|string',
            'expected_url' => 'nullable|url',
            'certificate_ids' => 'array',
            'certificate_ids.*' => 'exists:certificates,id',
            'needs_clearance' => 'boolean',
        ]);

        $dataSource = DataSource::create([
            'name' => $validated['requested_name'],
            'description' => $validated['description'],
            'justification' => $validated['justification'],
            'url' => $validated['expected_url'],
            'needs_clearance' => $validated['needs_clearance'] ?? false,
            'user_id' => auth()->id(),
        ]);

        // Attach certificates if provided
        if (!empty($validated['certificate_ids'])) {
            $dataSource->certificates()->attach($validated['certificate_ids']);
        }

        $dataSource->save();

        return redirect('/datasources')
            ->with('success', 'Data source created successfully!');
    }

    public function show(DataSource $dataSource)
    {
        $user = auth()->user();

        // Load all necessary relationships upfront
        $dataSource->load(['certificates', 'user', 'comments', 'grantedAccessUsers', 'accessRequests']);
        
        error_log($dataSource);

        // Check if current user is admin, operator, or owner
        if (in_array($user->group_name, ['admin', 'operator']) || $user->id === $dataSource->user_id) {
            // Operators have implicit access
            // Pass all necessary data, including pending access requests (where granted is false)
            $pendingRequests = $dataSource->accessRequests()->wherePivot('granted', false)->get();

            return Inertia::render('datasource/show', [
                'dataSource' => $dataSource,
                'accessRequests' => $pendingRequests,
            ]);
        }

        // For regular users, verify certificates
        $requiredCertIds = $dataSource->certificates()->pluck('certificates.id')->toArray();
        $userCertIds = $user->certificates()
            ->wherePivot('status', CertificateStatus::APPROVED)
            ->pluck('certificates.id')->toArray();

        $hasAllCerts = empty(array_diff($requiredCertIds, $userCertIds));

        if (!$hasAllCerts) {
            return redirect('/datasources')
                ->with('error', 'Zugriff verweigert: Es fehlen erforderliche Zertifikate.');
        }

        // If clearance needed, check if granted
        if ($dataSource->needs_clearance) {
            $accessGranted = $dataSource->grantedUsers()
                ->where('user_id', $user->id)
                ->wherePivot('granted', true)
                ->exists();

            if (!$accessGranted) {
                return redirect('/datasources')
                    ->with('error', 'Zugriff verweigert: Zugang muss genehmigt werden.');
            }
        }

        // For allowed users, render view without access requests (or empty list)
        return Inertia::render('datasource/show', [
            'dataSource' => $dataSource,
            'accessRequests' => collect(), // no pending requests for regular users
        ]);
    }


    public function edit(DataSource $dataSource)
    {
        $certificates = Certificate::orderBy('name')->get();
        $dataSource->load('certificates');

        return Inertia::render('datasource/createOrUpdate', [
            'dataSource' => $dataSource,
            'certificates' => $certificates
        ]);
    }

    public function update(Request $request, DataSource $dataSource)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'justification' => 'nullable|string',
            'url' => 'nullable|url',
            'needs_clearance' => 'boolean',
            'certificate_ids' => 'array',
            'certificate_ids.*' => 'exists:certificates,id',
        ]);

        $dataSource->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'justification' => $validated['justification'],
            'url' => $validated['url'],
            'needs_clearance' => $validated['needs_clearance'] ?? false,
        ]);

        // Sync certificates
        $dataSource->certificates()->sync($validated['certificate_ids'] ?? []);

        return redirect('/datasources')
            ->with('success', 'Data source updated successfully!');
    }
    
    public function requestAccess(DataSource $dataSource)
    {
        $user = auth()->user();

        if ($dataSource->grantedUsers()->where('user_id', $user->id)->wherePivot('granted', true)->exists()) {
            return redirect('/datasources')->with('error', 'Access already granted');
        }

        if ($dataSource->accessRequests()->where('user_id', $user->id)->exists()) {
            return redirect('/datasources')->with('error', 'Access request already sent');
        }

        $dataSource->accessRequests()->syncWithoutDetaching([$user->id]);

        return redirect('/datasources')->with('success', 'Access request submitted');
    }

    public function approveAccess(DataSource $dataSource, Request $request)
    {
        $userId = $request->input('user_id');

        $dataSource->grantedUsers()->syncWithoutDetaching([$userId => ['granted' => true]]);
        // Remove from accessRequests since now granted
        $dataSource->accessRequests()->detach($userId);

        return redirect()->back()->with('success', 'Zugriffsanfrage genehmigt.');
    }

    public function denyAccess(DataSource $dataSource, Request $request)
    {
        $userId = $request->input('user_id');
        // Remove request (deny)
        $dataSource->accessRequests()->detach($userId);

        return redirect()->back()->with('success', 'Zugriffsanfrage abgelehnt.');
    }

    public function revokeAccess(DataSource $dataSource, Request $request)
    {
        $userId = $request->input('user_id');

        // Only allow admin or owner
        $user = auth()->user();
        if (!in_array($user->group_name, ['admin', 'operator']) && $user->id !== $dataSource->user_id) {
            abort(403, 'Unauthorized.');
        }

        // Detach granted user from access pivot
        $dataSource->grantedUsers()->detach($userId);

        return redirect()->back()->with('success', 'Zugriff wurde entzogen.');
    }

}