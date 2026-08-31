<?php

namespace App\Http\Controllers;

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

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid email address or password. Please verify your credentials.',
            ], 401);
        }

        // Session window: 8 hours from login
        $expiresAt = now()->addHours(8);

        // Generate Sanctum plain text token with an absolute expiry
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
                'defaultRoute'   => $user->default_route ?? '/client-management',
            ],
            'message' => 'Authentication successful.',
        ]);
    }

    /**
     * POST /api/v1/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'ok' => true,
            'message' => 'Logged out successfully.',
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
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role ?? 'hr_administrator',
            'roleLabel' => $user->role_label ?? 'HR Administrator',
            'department' => $user->department ?? 'HR Management',
            'allowedModules' => $user->allowed_modules ?? [],
            'defaultRoute' => $user->default_route ?? '/client-management',
        ]);
    }
}
