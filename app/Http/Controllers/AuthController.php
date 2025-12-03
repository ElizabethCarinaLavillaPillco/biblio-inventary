<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Session;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        // Buscar usuario por email
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        // Verificar si el usuario está activo
        if (!$user->activo) {
            return response()->json([
                'message' => 'Tu cuenta está inactiva. Contacta al administrador.'
            ], 403);
        }

        // ⚡ SOLUCIÓN: Migrar sesión y forzar guardado
        Session::migrate(); // Regenera el ID de sesión
        Session::put('user_id', $user->id);
        Session::put('user_email', $user->email);
        Session::put('user_name', $user->name);
        Session::put('user_rol', $user->rol);
        Session::save(); // ⬅️ CRÍTICO: Fuerza el guardado inmediato

        // Log para verificar
        \Log::info('Login exitoso', [
            'user_id' => $user->id,
            'session_id' => Session::getId(),
            'session_data' => Session::all()
        ]);

        return response()->json([
            'message' => 'Inicio de sesión exitoso',
            'user' => $user,
            'session_id' => Session::getId() // Para debug
        ]);
    }

    public function logout(Request $request)
    {
        // Limpiar toda la sesión
        Session::flush();

        // Regenerar el ID de la sesión
        Session::regenerate();

        return response()->json([
            'message' => 'Sesión cerrada exitosamente'
        ]);
    }

    public function check()
    {
        $userId = Session::get('user_id');

        // Log para debug
        \Log::info('Check session', [
            'user_id' => $userId,
            'session_all' => Session::all()
        ]);

        if ($userId) {
            $user = User::find($userId);

            if ($user) {
                return response()->json([
                    'authenticated' => true,
                    'user' => $user
                ]);
            }
        }

        return response()->json([
            'authenticated' => false
        ]);
    }
}
