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
        $currentUserId = session('user_id');
        $currentUser = User::find($currentUserId);

        $query = User::query();

        // Búsqueda
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('dni', 'like', "%{$search}%");
            });
        }

        // Filtro de activos
        if ($request->has('activo')) {
            $query->where('activo', $request->activo);
        }

        $usuarios = $query->with('creadoPor')
            ->withCount(['librosRegistrados', 'prestamosRealizados'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'usuarios' => $usuarios,
            'current_user_rol' => $currentUser->rol ?? null
        ]);
    }

    public function store(Request $request)
    {
        // Verificar que el usuario actual sea admin
        $currentUserId = session('user_id');
        $currentUser = User::find($currentUserId);

        if (!$currentUser || !$currentUser->isAdmin()) {
            return response()->json([
                'message' => 'Solo los administradores pueden crear usuarios.'
            ], 403);
        }

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
            'creado_por' => $currentUserId,
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
        $currentUserId = session('user_id');
        $currentUser = User::find($currentUserId);
        $usuario = User::findOrFail($id);

        // Verificar permisos: Admin puede editar cualquiera, Bibliotecario solo su propio perfil
        if (!$currentUser->isAdmin() && $currentUserId != $id) {
            return response()->json([
                'message' => 'Solo puedes editar tu propio perfil.'
            ], 403);
        }

        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'dni' => 'required|string|size:8|unique:users,dni,' . $id,
            'telefono' => 'nullable|string|max:15',
            'password' => 'nullable|string|min:6',
        ];

        // Solo admin puede cambiar rol y estado activo
        if ($currentUser->isAdmin()) {
            $rules['activo'] = 'boolean';
            $rules['rol'] = 'required|in:admin,bibliotecario';
        }

        $validator = Validator::make($request->all(), $rules);

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
        ];

        // Solo admin puede actualizar estos campos
        if ($currentUser->isAdmin()) {
            $data['activo'] = $request->activo ?? true;
            $data['rol'] = $request->rol;
        }

        // Actualizar password si se proporciona
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
        // Solo admin puede eliminar usuarios
        $currentUserId = session('user_id');
        $currentUser = User::find($currentUserId);

        if (!$currentUser || !$currentUser->isAdmin()) {
            return response()->json([
                'message' => 'Solo los administradores pueden eliminar usuarios.'
            ], 403);
        }

        $usuario = User::findOrFail($id);

        // No permitir eliminar si tiene registros asociados
        if ($usuario->librosRegistrados()->count() > 0 ||
            $usuario->prestamosRealizados()->count() > 0) {
            return response()->json([
                'message' => 'No se puede eliminar el usuario porque tiene registros asociados (libros o préstamos)'
            ], 422);
        }

        // No permitir que un usuario se elimine a sí mismo
        if ($usuario->id === $currentUserId) {
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
        // Solo admin puede cambiar estado
        $currentUserId = session('user_id');
        $currentUser = User::find($currentUserId);

        if (!$currentUser || !$currentUser->isAdmin()) {
            return response()->json([
                'message' => 'Solo los administradores pueden cambiar el estado de usuarios.'
            ], 403);
        }

        $usuario = User::findOrFail($id);

        // No permitir desactivar el propio usuario
        if ($usuario->id === $currentUserId) {
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

    // Obtener usuario autenticado actual
    public function me()
    {
        $userId = session('user_id');
        $usuario = User::with('creadoPor')
            ->withCount(['librosRegistrados', 'prestamosRealizados'])
            ->find($userId);

        return response()->json($usuario);
    }
}
