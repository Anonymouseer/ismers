<?php

namespace App\Http\Middleware;

use App\Models\ActivityLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Parse roles if passed as pipe-delimited or comma-delimited strings
        $allowedRoles = [];
        foreach ($roles as $role) {
            foreach (preg_split('/[|,]/', $role) as $r) {
                $trimmed = trim($r);
                if ($trimmed !== '') {
                    $allowedRoles[] = $trimmed;
                }
            }
        }

        if (! $user->hasRole($allowedRoles)) {
            ActivityLog::record(
                action: "Unauthorized role access attempt: {$user->role} attempted action requiring [" . implode(', ', $allowedRoles) . "]",
                module: 'Access Control',
                details: [
                    'user_id' => $user->id,
                    'user_role' => $user->role,
                    'required_roles' => $allowedRoles,
                    'path' => $request->path(),
                    'method' => $request->method(),
                ],
                request: $request,
                user: $user,
                status: 'Warning'
            );

            return response()->json([
                'message' => 'Forbidden: You do not possess the required staff role for this action.',
                'required_roles' => $allowedRoles,
            ], 403);
        }

        return $next($request);
    }
}
