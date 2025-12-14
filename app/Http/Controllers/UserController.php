<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('dni', 'like', "%{$search}%");
            });
        }

        if ($request->has('activo')) {
            $query->where('activo', $request->activo);
        }

        $usuarios = $query->with('creadoPor')
            ->withCount(['librosRegistrados', 'prestamosRealizados'])
            ->latest()
            ->paginate(20);

        // Obtener el rol del usuario actual
        $currentUser = User::find(session('user_id'));
        $currentUserRol = $currentUser ? $currentUser->rol : null;

        return response()->json([
            'usuarios' => $usuarios,
            'current_user_rol' => $currentUserRol
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'dni' => 'required|string|size:8|unique:users,dni',
            'password' => 'required|string|min:6',
            'telefono' => 'nullable|string|max:15',
            'rol' => 'required|in:admin,bibliotecario',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $usuario = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'dni' => $request->dni,
            'password' => Hash::make($request->password),
            'telefono' => $request->telefono,
            'rol' => $request->rol,
            'activo' => true,
            'creado_por' => session('user_id'),
        ]);

        return response()->json([
            'message' => 'Usuario registrado exitosamente',
            'usuario' => $usuario
        ], 201);
    }

    public function show($id)
    {
        $usuario = User::with([
            'creadoPor',
            'librosRegistrados.categoria',
            'prestamosRealizados.libro'
        ])
        ->withCount(['librosRegistrados', 'prestamosRealizados', 'prestamosRecibidos'])
        ->findOrFail($id);

        return response()->json($usuario);
    }

    public function update(Request $request, $id)
    {
        $usuario = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'dni' => 'required|string|size:8|unique:users,dni,' . $id,
            'telefono' => 'nullable|string|max:15',
            'activo' => 'boolean',
            'password' => 'nullable|string|min:6',
            'rol' => 'nullable|in:admin,bibliotecario',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'dni' => $request->dni,
            'telefono' => $request->telefono,
            'activo' => $request->activo ?? true,
        ];

        if ($request->filled('rol')) {
            $data['rol'] = $request->rol;
        }

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $usuario->update($data);

        return response()->json([
            'message' => 'Usuario actualizado exitosamente',
            'usuario' => $usuario
        ]);
    }

    public function destroy($id)
    {
        $usuario = User::findOrFail($id);

        if ($usuario->librosRegistrados()->count() > 0 || 
            $usuario->prestamosRealizados()->count() > 0) {
            return response()->json([
                'message' => 'No se puede eliminar el usuario porque tiene registros asociados (libros o préstamos)'
            ], 422);
        }

        if ($usuario->id === session("user_id")) {
            return response()->json([
                'message' => 'No puedes eliminar tu propio usuario'
            ], 422);
        }

        $usuario->delete();

        return response()->json([
            'message' => 'Usuario eliminado exitosamente'
        ]);
    }

    public function toggleActivo($id)
    {
        $usuario = User::findOrFail($id);

        if ($usuario->id === session("user_id")) {
            return response()->json([
                'message' => 'No puedes desactivar tu propio usuario'
            ], 422);
        }

        $usuario->activo = !$usuario->activo;
        $usuario->save();

        return response()->json([
            'message' => $usuario->activo ? 'Usuario activado' : 'Usuario desactivado',
            'usuario' => $usuario
        ]);
    }

    /**
     * NUEVO: Restablecer contraseña a DNI
     */
    public function restablecerPassword($id)
    {
        $usuario = User::findOrFail($id);

        // Verificar que quien hace la petición es admin
        $currentUser = User::find(session('user_id'));
        if (!$currentUser || $currentUser->rol !== 'admin') {
            return response()->json([
                'message' => 'Solo los administradores pueden restablecer contraseñas'
            ], 403);
        }

        // Establecer la contraseña al DNI del usuario
        $usuario->password = Hash::make($usuario->dni);
        $usuario->save();

        return response()->json([
            'message' => 'Contraseña restablecida exitosamente',
            'usuario' => $usuario,
            'nueva_password' => $usuario->dni
        ]);
    }
}