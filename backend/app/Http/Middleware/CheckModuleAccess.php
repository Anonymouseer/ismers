<?php

namespace App\Http\Middleware;

use App\Models\ActivityLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckModuleAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$modules
     */
    public function handle(Request $request, Closure $next, string ...$modules): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Client accounts and external users do not have staff module access
        if (! ($user instanceof \App\Models\User)) {
            return response()->json([
                'message' => 'Forbidden: Staff user credentials required.',
            ], 403);
        }

        // Administrators have universal module access
        if (method_exists($user, 'isAdmin') && $user->isAdmin()) {
            return $next($request);
        }

        // Check if user has access to at least one of the modules specified
        $hasAccess = false;
        foreach ($modules as $module) {
            foreach (preg_split('/[|,]/', $module) as $m) {
                $trimmed = trim($m);
                if ($trimmed !== '' && $user->hasModuleAccess($trimmed)) {
                    $hasAccess = true;
                    break 2;
                }
            }
        }

        if (! $hasAccess) {
            ActivityLog::record(
                action: "Unauthorized module access attempt: {$user->role} attempted access to [" . implode(', ', $modules) . "]",
                module: 'Access Control',
                details: [
                    'user_id' => $user->id,
                    'user_role' => $user->role,
                    'allowed_modules' => $user->allowed_modules,
                    'requested_modules' => $modules,
                    'path' => $request->path(),
                    'method' => $request->method(),
                ],
                request: $request,
                user: $user,
                status: 'Warning'
            );

            return response()->json([
                'message' => 'Forbidden: You do not have permission to access this module.',
                'required_modules' => $modules,
            ], 403);
        }

        return $next($request);
    }
}
