<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * POST /api/v1/auth/login
     * Authenticate any of the 5 internal team roles against the PostgreSQL database.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $email = strtolower(trim($request->email));
        $user  = User::where('email', $email)->first();

        $valid = $user && Hash::check($request->password, $user->password);

        if (! $valid) {
            ActivityLog::record(
                action: "Failed authentication attempt for email: {$request->email}",
                module: 'Authentication',
                details: ['attempted_email' => $request->email],
                request: $request,
                status: 'Warning'
            );

            return response()->json([
                'message' => 'Invalid email address or password. Please verify your credentials.',
            ], 401);
        }

        // Record successful login in audit trail
        ActivityLog::record(
            action: "User logged into PRIMEPOWER HR portal successfully",
            module: 'Authentication',
            details: ['role' => $user->role, 'department' => $user->department],
            request: $request,
            user: $user,
            status: 'Success'
        );

        // Workday shift session window: 8 hours from login
        $expiresAt = now()->addHours(8);

        // Generate Sanctum plain text token with 8-hour expiry
        $token = $user->createToken(
            'primepower-session',
            ['*'],
            $expiresAt
        )->plainTextToken;

        return response()->json([
            'token'      => $token,
            'expires_at' => $expiresAt->toIso8601String(),
            'user'       => [
                'id'             => $user->id,
                'name'           => $user->name,
                'email'          => $user->email,
                'role'           => $user->role ?? 'hr_administrator',
                'roleLabel'      => $user->role_label ?? 'HR Administrator',
                'department'     => $user->department ?? 'HR Management',
                'allowedModules' => $user->allowed_modules ?? [
                    'client-management',
                    'job-order-management',
                    'applicant-registration',
                    'recruitment-selection',
                    'deployment-assignment',
                    'ai-analytics',
                    'settings',
                ],
                'defaultRoute'   => $user->default_route ?? '/dashboard',
                'photo'          => $user->photo,
            ],
            'message' => 'Authentication successful.',
        ]);
    }

    /**
     * POST /api/v1/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user) {
            ActivityLog::record(
                action: "User signed out from system session",
                module: 'Authentication',
                request: $request,
                user: $user,
                status: 'Info'
            );
            $user->currentAccessToken()->delete();
        }

        return response()->json([
            'ok' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * POST /api/v1/auth/refresh
     * Extend Sanctum token for another 8-hour workday window.
     */
    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $request->user()->currentAccessToken()->delete();

        $expiresAt = now()->addHours(8);
        $token = $user->createToken(
            'primepower-session',
            ['*'],
            $expiresAt
        )->plainTextToken;

        return response()->json([
            'token'      => $token,
            'expires_at' => $expiresAt->toIso8601String(),
            'message'    => 'Session extended successfully.',
        ]);
    }

    /**
     * GET /api/v1/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        return response()->json([
            'id'             => $user->id,
            'name'           => $user->name,
            'email'          => $user->email,
            'role'           => $user->role ?? 'hr_administrator',
            'roleLabel'      => $user->role_label ?? 'HR Administrator',
            'department'     => $user->department ?? 'HR Management',
            'allowedModules' => $user->allowed_modules ?? [],
            'defaultRoute'   => $user->default_route ?? '/dashboard',
            'photo'          => $user->photo,
        ]);
    }

    /**
     * PUT /api/v1/auth/profile
     * Persist staff profile changes (name, photo, preferences) permanently in MySQL.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $validated = $request->validate([
            'name'          => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'photo'         => 'nullable|string',
            'default_route' => 'nullable|string|max:100',
        ]);

        if (array_key_exists('name', $validated) && $validated['name']) {
            $user->name = $validated['name'];
        }
        if (array_key_exists('photo', $validated)) {
            $user->photo = $validated['photo'];
        }
        if (array_key_exists('default_route', $validated) && $validated['default_route']) {
            $user->default_route = $validated['default_route'];
        }
        $user->save();

        ActivityLog::record(
            action: "Updated staff profile: {$user->name}",
            module: 'Authentication',
            details: ['name' => $user->name, 'has_photo' => !empty($user->photo)],
            request: $request,
            user: $user,
            status: 'Success'
        );

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'user'    => [
                'id'             => $user->id,
                'name'           => $user->name,
                'email'          => $user->email,
                'role'           => $user->role ?? 'hr_administrator',
                'roleLabel'      => $user->role_label ?? 'HR Administrator',
                'department'     => $user->department ?? 'HR Management',
                'allowedModules' => $user->allowed_modules ?? [],
                'defaultRoute'   => $user->default_route ?? '/dashboard',
                'photo'          => $user->photo,
            ],
        ]);
    }
}
