<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CertificateController extends Controller
{
    public function index()
    {
        $certificates = Certificate::withCount('users', 'dataSources')
            ->orderBy('name')
            ->get();

        return Inertia::render('certificates', [
            'certificates' => $certificates
        ]);
    }

    public function create()
    {
        return Inertia::render('certificate/createOrUpdate');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:certificates',
            'url' => 'required|url',
        ]);

        $certificate = Certificate::create($validated);
        $certificate->save();

        return redirect('/certificates')
            ->with('success', 'Certificate created successfully!');
    }

    public function show(Certificate $certificate)
    {
        $certificate->load(['users' => function($query) {
            $query->withPivot('status');
        }, 'dataSources']);
    
        // Debug output - remove after fixing
        \Log::info('Certificate Show Debug:', [
            'id' => $certificate->id,
            'name' => $certificate->name,
            'url' => $certificate->url,
            'users_count' => $certificate->users->count(),
            'datasources_count' => $certificate->dataSources->count(),
        ]);
        
        return Inertia::render('certificate/show', [
            'certificate' => $certificate
        ]);
    }

    public function edit(Certificate $certificate)
    {
        return Inertia::render('certificate/createOrUpdate', [
            'certificate' => $certificate
        ]);
    }

    public function update(Request $request, Certificate $certificate)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:certificates,name,' . $certificate->id,
            'url' => 'required|url',
        ]);

        $certificate->update($validated);

        return redirect('/certificates')
            ->with('success', 'Certificate updated successfully!');
    }

    public function destroy(Certificate $certificate)
    {
        $certificate->delete();

        return redirect('/certificates')
            ->with('success', 'Certificate deleted successfully!');
    }
}