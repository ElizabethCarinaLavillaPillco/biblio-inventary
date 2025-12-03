<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\User;

class AdminOnly
{
    public function handle(Request $request, Closure $next): Response
    {
        $userId = session('user_id');
        
        if (!$userId) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        $user = User::find($userId);
        
        if (!$user || $user->rol !== 'admin') {
            return response()->json([
                'message' => 'Acceso denegado. Solo administradores pueden realizar esta acción.'
            ], 403);
        }

        return $next($request);
    }
}