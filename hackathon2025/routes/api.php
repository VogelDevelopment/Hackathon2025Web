<?php
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;

Route::get('login', function () {
    return response()->json(['message' => 'Login endpoint - GET unsupported']);
});

Route::post('login', function (LoginRequest $request) {
    $controller = app()->make(AuthenticatedSessionController::class);
    return $controller->extLogin($request);
});

Route::post('debug-login', function (Request $request) {
    $debug_data = [
        'content_type' => $request->header('Content-Type'),
        'accept' => $request->header('Accept'),
        'raw_content' => $request->getContent(),
        'all_input' => $request->all(),
        'has_email' => $request->has('email'),
        'has_password' => $request->has('password'),
        'email_value' => $request->input('email'),
        'method' => $request->method(),
        'all_headers' => $request->headers->all(),
    ];
    
    error_log(json_encode($debug_data, JSON_PRETTY_PRINT));
    
    return response()->json(['message' => 'Debug data logged']);
});