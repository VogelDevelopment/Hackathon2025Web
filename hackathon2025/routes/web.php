<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DataSourceController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CertificateController;

Route::get('/', function () {
    return Inertia::render('dashboard');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('marketplace', function () {
        return Inertia::render('marketplace');
    })->name('marketplace');

    // DataSource routes
    Route::get('datasources', [DataSourceController::class, 'index']);
    Route::get('datasources/create', [DataSourceController::class, 'create']);
    Route::post('datasources', [DataSourceController::class, 'store']); // Changed from /new
    Route::get('datasources/{dataSource}/edit', [DataSourceController::class, 'edit']);
    Route::get('datasources/{dataSource}', [DataSourceController::class, 'show']);
    Route::put('datasources/{dataSource}', [DataSourceController::class, 'update']);
    Route::patch('datasources/{dataSource}', [DataSourceController::class, 'update']);
    Route::post('datasources/{dataSource}/request-access', [DataSourceController::class, 'requestAccess']);
    Route::post('datasources/{dataSource}/approve-access', [DataSourceController::class, 'approveAccess'])->middleware('auth');
    Route::post('datasources/{dataSource}/deny-access', [DataSourceController::class, 'denyAccess'])->middleware('auth');
    Route::post('datasources/{dataSource}/revoke-access', [DataSourceController::class, 'revokeAccess'])->middleware('auth');


    // Cerrtificate routes
    Route::get('certificates', [CertificateController::class, 'index']);
    Route::get('certificates/create', [CertificateController::class, 'create']);
    Route::post('certificates', [CertificateController::class, 'store']); // Changed from /new
    Route::get('certificates/{certificate}/edit', [CertificateController::class, 'edit']);
    Route::get('certificates/{certificate}', [CertificateController::class, 'show']);
    Route::put('certificates/{certificate}', [CertificateController::class, 'update']);
    Route::patch('certificates/{certificate}', [CertificateController::class, 'update']);

    // User-profile routes
    Route::get('profiles', [UserController::class, 'index']);
    Route::get('profile/create', [UserController::class, 'create']);
    Route::post('profile', [UserController::class, 'store']); // Changed from /new
    Route::get('profile/{profile}/edit', [UserController::class, 'edit']);
    Route::get('profile/{profile}', [UserController::class, 'show']);
    Route::put('profile/{profile}', [UserController::class, 'update']);
    Route::patch('profile/{profile}', [UserController::class, 'update']);

    Route::post('profile/certificate-upload', [UserController::class, 'uploadCertificate'])->name('user.certificate.upload');

    // For admin/operator review:
    Route::patch('profile/{user}/certificate/{certificate}/approve', [UserController::class, 'approveUserCertificate'])->name('user.certificate.approve');
    Route::patch('profile/{user}/certificate/{certificate}/reject', [UserController::class, 'rejectUserCertificate'])->name('user.certificate.reject');
    Route::delete('profile/{user}/certificate/{certificate}', [UserController::class, 'deleteUserCertificate'])->name('user.certificate.delete');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
