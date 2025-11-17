<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        // Limpiar sesión anterior
        Session::flush();
        
        // Iniciar nueva sesión
        Session::regenerate();
        
        // Guardar en sesión
        Session::put('user_id', $user->id);
        Session::put('user', $user);

        return response()->json([
            'message' => 'Inicio de sesión exitoso',
            'user' => $user
        ]);
    }

    public function logout(Request $request)
    {
        // Limpiar toda la sesión
        Session::flush();
        
        // Regenerar el ID de la sesión
        Session::regenerate(true);
        
        return response()->json([
            'message' => 'Sesión cerrada exitosamente'
        ]);
    }

    public function check()
    {
        if (Session::has('user_id')) {
            $user = User::find(Session::get('user_id'));
            return response()->json([
                'authenticated' => true,
                'user' => $user
            ]);
        }

        return response()->json([
            'authenticated' => false
        ]);
    }
}