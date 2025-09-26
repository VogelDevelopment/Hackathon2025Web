<?php

namespace App\Http\Controllers;

use App\Models\DataSource;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DataSourceController extends Controller
{
    public function index()
    {
        $dataSources = DataSource::with(['user', 'certificates', 'comments'])
            ->orderBy('created_at', 'desc')
            ->get();

        $certificates = Certificate::orderBy('name')->get();

        return Inertia::render('datasources', [
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
        $dataSource->load(['user', 'certificates', 'comments.user']);
        
        return Inertia::render('datasource/show', [
            'dataSource' => $dataSource
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
}