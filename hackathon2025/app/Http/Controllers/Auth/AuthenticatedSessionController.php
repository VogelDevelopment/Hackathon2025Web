<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $user = $request->validateCredentials();

        if (Features::enabled(Features::twoFactorAuthentication()) && $user->hasEnabledTwoFactorAuthentication()) {
            $request->session()->put([
                'login.id' => $user->getKey(),
                'login.remember' => $request->boolean('remember'),
            ]);

            return to_route('two-factor.login');
        }

        Auth::login($user, $request->boolean('remember'));

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    public function extLogin(LoginRequest $request): JsonResponse
    {
        // Your secret key (must be 32 bytes for AES-256)
        $secretKey = env('AES_SECRET_KEY'); // Store your key in .env

        // Get the encrypted password (Base64)
        $encryptedBase64 = $request->input('password');

        // Decode Base64
        $encryptedBytes = base64_decode($encryptedBase64);

        // Decrypt using AES-256-ECB (no IV, zero padding)
        $decryptedPassword = openssl_decrypt(
            $encryptedBytes,
            'aes-256-ecb',
            $secretKey,
            OPENSSL_RAW_DATA | OPENSSL_ZERO_PADDING
        );

        // Remove any trailing null bytes from zero padding
        $decryptedPassword = rtrim($decryptedPassword, "\0");


        // Replace the encrypted password with decrypted one for validation
        $request->merge(['password' => $decryptedPassword]);
        $user = $request->validateCredentials();

        // Issue API token, e.g., using Sanctum
        $token = $user->createToken($request->device_name ?? 'api')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'username' => $user->name,
            'group_name' => $user->group_name,
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
