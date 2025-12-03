<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DebugSession
{
    public function handle(Request $request, Closure $next): Response
    {
        \Log::info('DEBUG SESSION', [
            'session_id' => session()->getId(),
            'user_id' => session('user_id'),
            'all_session' => session()->all(),
            'path' => $request->path(),
            'method' => $request->method(),
            'cookies' => $request->cookies->all()
        ]);

        return $next($request);
    }
}
