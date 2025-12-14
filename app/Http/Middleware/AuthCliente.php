<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthCliente
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!session()->has('cliente_id')) {
            return response()->json(['message' => 'Debe iniciar sesión como cliente.'], 401);
        }

        return $next($request);
    }
}