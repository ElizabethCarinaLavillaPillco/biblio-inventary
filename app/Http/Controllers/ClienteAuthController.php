<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Session;
use Carbon\Carbon;

class ClienteAuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombres' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'dni' => 'required|string|size:8|unique:clientes,dni',
            'email' => 'required|email|unique:clientes,email',
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

        // Buscar cliente por email
        $cliente = Cliente::where('email', $request->email)->first();

        if (!$cliente || !Hash::check($request->password, $cliente->password)) {
            return response()->json([
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        // Verificar si el cliente está activo
        if (!$cliente->activo) {
            return response()->json([
                'message' => 'Tu cuenta está inactiva. Contacta a la biblioteca.'
            ], 403);
        }

        // Limpiar sesión anterior
        Session::flush();
        
        // Iniciar nueva sesión
        Session::regenerate();
        
        // Guardar en sesión
        Session::put('cliente_id', $cliente->id);
        Session::put('cliente', $cliente);
        Session::put('user_type', 'cliente');

        return response()->json([
            'message' => 'Inicio de sesión exitoso',
            'cliente' => $cliente,
            'user_type' => 'cliente'
        ]);
    }

    public function logout(Request $request)
    {
        Session::flush();
        Session::regenerate(true);
        
        return response()->json([
            'message' => 'Sesión cerrada exitosamente'
        ]);
    }

    public function check()
    {
        if (Session::has('cliente_id')) {
            $cliente = Cliente::find(Session::get('cliente_id'));
            
            if ($cliente) {
                // Verificar si está sancionado
                $cliente->estaSancionado();
                
                return response()->json([
                    'authenticated' => true,
                    'cliente' => $cliente,
                    'user_type' => 'cliente'
                ]);
            }
        }

        return response()->json([
            'authenticated' => false
        ]);
    }

    public function perfil()
    {
        $clienteId = Session::get('cliente_id');
        
        if (!$clienteId) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $cliente = Cliente::with([
            'prestamos' => function($query) {
                $query->with('libro.autor')->orderBy('created_at', 'desc');
            }
        ])
        ->withCount([
            'prestamosActivos',
            'prestamos as prestamos_completados_count' => function($query) {
                $query->where('estado', 'devuelto');
            }
        ])
        ->findOrFail($clienteId);

        return response()->json($cliente);
    }

    public function actualizarPerfil(Request $request)
    {
        $clienteId = Session::get('cliente_id');
        
        if (!$clienteId) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $cliente = Cliente::findOrFail($clienteId);

        $validator = Validator::make($request->all(), [
            'nombres' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'telefono' => 'required|string|max:15',
            'domicilio' => 'required|string|max:255',
            'distrito' => 'nullable|string|max:100',
            'provincia' => 'nullable|string|max:100',
            'password' => 'nullable|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $data = [
            'nombres' => $request->nombres,
            'apellidos' => $request->apellidos,
            'telefono' => $request->telefono,
            'domicilio' => $request->domicilio,
            'distrito' => $request->distrito,
            'provincia' => $request->provincia,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $cliente->update($data);

        return response()->json([
            'message' => 'Perfil actualizado exitosamente',
            'cliente' => $cliente
        ]);
    }
}