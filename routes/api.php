<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LibroController;
use App\Http\Controllers\AutorController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\UbicacionController;
use App\Http\Controllers\PrestamoController;

Route::get('/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
});

// Autenticación
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/check', [AuthController::class, 'check']);

// Usuario actual
Route::get('/user', function() {
    if (session()->has('user_id')) {
        return response()->json(\App\Models\User::find(session('user_id')));
    }
    return response()->json(null);
});

Route::middleware(['debug.session'])->group(function () {
    Route::post('/libros', [LibroController::class, 'store']);
});

// Dashboard
Route::get('/dashboard', [DashboardController::class, 'index']);

// Usuarios
Route::get('/usuarios', [UserController::class, 'index']);
Route::post('/usuarios', [UserController::class, 'store']);
Route::get('/usuarios/{id}', [UserController::class, 'show']);
Route::put('/usuarios/{id}', [UserController::class, 'update']);
Route::delete('/usuarios/{id}', [UserController::class, 'destroy']);
Route::put('/usuarios/{id}/toggle-activo', [UserController::class, 'toggleActivo']);

// Autores
Route::get('/autores', [AutorController::class, 'index']);
Route::post('/autores', [AutorController::class, 'store']);
Route::get('/autores/search', [AutorController::class, 'search']);
Route::get('/autores/{id}', [AutorController::class, 'show']);
Route::put('/autores/{id}', [AutorController::class, 'update']);
Route::delete('/autores/{id}', [AutorController::class, 'destroy']);

// Categorías
Route::get('/categorias', [CategoriaController::class, 'index']);
Route::post('/categorias', [CategoriaController::class, 'store']);
Route::get('/categorias/all', [CategoriaController::class, 'all']);
Route::get('/categorias/{id}', [CategoriaController::class, 'show']);
Route::put('/categorias/{id}', [CategoriaController::class, 'update']);
Route::delete('/categorias/{id}', [CategoriaController::class, 'destroy']);

// Ubicaciones
Route::get('/ubicaciones', [UbicacionController::class, 'index']);
Route::post('/ubicaciones', [UbicacionController::class, 'store']);
Route::get('/ubicaciones/activas', [UbicacionController::class, 'activas']);
Route::get('/ubicaciones/{id}', [UbicacionController::class, 'show']);
Route::put('/ubicaciones/{id}', [UbicacionController::class, 'update']);
Route::delete('/ubicaciones/{id}', [UbicacionController::class, 'destroy']);

// Libros
Route::get('/libros', [LibroController::class, 'index']);
Route::post('/libros', [LibroController::class, 'store']);
Route::post('/libros/carga-masiva', [LibroController::class, 'cargaMasiva']);
Route::get('/libros/{id}', [LibroController::class, 'show']);
Route::put('/libros/{id}', [LibroController::class, 'update']);
Route::delete('/libros/{id}', [LibroController::class, 'destroy']);

// Préstamos
Route::get('/prestamos', [PrestamoController::class, 'index']);
Route::post('/prestamos', [PrestamoController::class, 'store']);
Route::get('/prestamos/vencidos', [PrestamoController::class, 'vencidos']);
Route::get('/prestamos/{id}', [PrestamoController::class, 'show']);
Route::put('/prestamos/{id}/devuelto', [PrestamoController::class, 'marcarDevuelto']);
Route::put('/prestamos/{id}/perdido', [PrestamoController::class, 'marcarPerdido']);
