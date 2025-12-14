<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Session;
use Carbon\Carbon;

class AuthController extends Controller
{
    /**
     * Login unificado para Staff y Clientes
     */
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

        // Limpiar sesión anterior
        Session::flush();
        Session::regenerate();

        // Primero intentar con Staff (usuarios del sistema)
        $user = User::where('email', $request->email)->first();
        
        if ($user && Hash::check($request->password, $user->password)) {
            // Es un usuario staff
            if (!$user->activo) {
                return response()->json([
                    'message' => 'Tu cuenta está inactiva. Contacta al administrador.'
                ], 403);
            }

            Session::put('user_id', $user->id);
            Session::put('user', $user);
            Session::put('user_type', 'staff');

            return response()->json([
                'message' => 'Inicio de sesión exitoso',
                'user' => $user,
                'user_type' => 'staff',
                'rol' => $user->rol
            ]);
        }

        // Si no es staff, intentar con Cliente
        $cliente = Cliente::where('email', $request->email)->first();
        
        if ($cliente && Hash::check($request->password, $cliente->password)) {
            // Es un cliente
            if (!$cliente->activo) {
                return response()->json([
                    'message' => 'Tu cuenta está inactiva. Contacta a la biblioteca.'
                ], 403);
            }

            Session::put('cliente_id', $cliente->id);
            Session::put('cliente', $cliente);
            Session::put('user_type', 'cliente');

            return response()->json([
                'message' => 'Inicio de sesión exitoso',
                'cliente' => $cliente,
                'user_type' => 'cliente'
            ]);
        }

        // Credenciales incorrectas
        return response()->json([
            'message' => 'Credenciales incorrectas'
        ], 401);
    }

    /**
     * Registro de clientes
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombres' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'dni' => 'required|string|size:8|unique:clientes,dni',
            'email' => 'required|email|unique:clientes,email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'fecha_nacimiento' => 'required|date|before:today',
            'telefono' => 'required|string|max:15',
            'domicilio' => 'required|string|max:255',
            'distrito' => 'nullable|string|max:100',
            'provincia' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        // Calcular edad
        $edad = Carbon::parse($request->fecha_nacimiento)->age;

        $cliente = Cliente::create([
            'nombres' => $request->nombres,
            'apellidos' => $request->apellidos,
            'dni' => $request->dni,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'fecha_nacimiento' => $request->fecha_nacimiento,
            'edad' => $edad,
            'telefono' => $request->telefono,
            'domicilio' => $request->domicilio,
            'distrito' => $request->distrito,
            'provincia' => $request->provincia,
            'activo' => true,
        ]);

        return response()->json([
            'message' => '¡Registro exitoso! Ya puedes iniciar sesión.',
            'cliente' => $cliente
        ], 201);
    }

    /**
     * Logout unificado
     */
    public function logout(Request $request)
    {
        Session::flush();
        Session::regenerate(true);
        
        return response()->json([
            'message' => 'Sesión cerrada exitosamente'
        ]);
    }

    /**
     * Check unificado - verifica qué tipo de usuario está logueado
     */
    public function check()
    {
        $userType = Session::get('user_type');

        if ($userType === 'staff') {
            $userId = Session::get('user_id');
            if ($userId) {
                $user = User::find($userId);
                if ($user) {
                    return response()->json([
                        'authenticated' => true,
                        'user' => $user,
                        'user_type' => 'staff',
                        'rol' => $user->rol
                    ]);
                }
            }
        } elseif ($userType === 'cliente') {
            $clienteId = Session::get('cliente_id');
            if ($clienteId) {
                $cliente = Cliente::find($clienteId);
                if ($cliente) {
                    return response()->json([
                        'authenticated' => true,
                        'cliente' => $cliente,
                        'user_type' => 'cliente'
                    ]);
                }
            }
        }

        return response()->json([
            'authenticated' => false
        ]);
    }

    /**
     * Perfil de cliente
     */
    public function perfil()
    {
        $clienteId = Session::get('cliente_id');
        
        if (!$clienteId) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $cliente = Cliente::withCount([
            'prestamos as prestamos_activos_count' => function($query) {
                $query->whereIn('estado', ['pendiente', 'aprobado', 'en_curso']);
            },
            'prestamos as reservas_pendientes_count' => function($query) {
                $query->where('estado', 'pendiente');
            }
        ])->findOrFail($clienteId);

        return response()->json($cliente);
    }

    /**
     * Actualizar perfil de cliente
     */
    public function update(Request $request)
    {
        $clienteId = Session::get('cliente_id');
        
        if (!$clienteId) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $cliente = Cliente::findOrFail($clienteId);

        $validator = Validator::make($request->all(), [
            'nombres' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'email' => 'required|email|unique:clientes,email,' . $clienteId . '|unique:users,email',
            'telefono' => 'required|string|max:15',
            'domicilio' => 'required|string|max:255',
            'distrito' => 'nullable|string|max:100',
            'provincia' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $cliente->update($request->only([
            'nombres',
            'apellidos',
            'email',
            'telefono',
            'domicilio',
            'distrito',
            'provincia'
        ]));

        // Actualizar en sesión
        Session::put('cliente', $cliente);

        return response()->json([
            'message' => 'Perfil actualizado exitosamente',
            'cliente' => $cliente
        ]);
    }
}