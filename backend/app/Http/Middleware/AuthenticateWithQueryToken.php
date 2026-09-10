<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateWithQueryToken
{
    /**
     * Promote query string ?token= to Authorization: Bearer header for iframe previews & direct downloads.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($token = $request->query('token')) {
            $request->headers->set('Authorization', 'Bearer '.$token);
        }

        return $next($request);
    }
}
