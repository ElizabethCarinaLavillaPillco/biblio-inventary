<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LibroController;
use App\Http\Controllers\AutorController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ColeccionController;
use App\Http\Controllers\UbicacionController;
use App\Http\Controllers\PrestamoController;
use App\Http\Controllers\CatalogoPublicoController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\ExportacionController;
use App\Http\Controllers\PlantillaController;
use App\Http\Controllers\AuditController;

Route::get('/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
});

// ========================================
// AUTENTICACIÓN UNIFICADA (PÚBLICO)
// ========================================
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/check', [AuthController::class, 'check']);

// ========================================
// RUTAS PÚBLICAS - CATÁLOGO (SIN AUTH)
// ========================================
Route::prefix('publico')->group(function () {
    Route::get('/libros', [CatalogoPublicoController::class, 'index']);
    Route::get('/libros/{id}', [CatalogoPublicoController::class, 'show']);
    Route::get('/categorias', [CatalogoPublicoController::class, 'categorias']);
    Route::get('/clasificaciones-cdd', [CatalogoPublicoController::class, 'clasificacionesCdd']);
    Route::get('/autores', [CatalogoPublicoController::class, 'autores']);
    Route::get('/colecciones', [CatalogoPublicoController::class, 'colecciones']);
    Route::get('/estadisticas', [CatalogoPublicoController::class, 'estadisticas']);
    Route::get('/libros/{id}/exportar/{formato}', [CatalogoPublicoController::class, 'exportar']);
});

// ========================================
// RUTAS PROTEGIDAS - CLIENTE (CON AUTH)
// ========================================
Route::middleware(\App\Http\Middleware\AuthCliente::class)->group(function () {
    Route::get('/perfil', [AuthController::class, 'perfil']);
    Route::put('/perfil', [AuthController::class, 'update']);
    Route::post('/reservas', [ReservaController::class, 'crearReserva']);
    Route::get('/reservas', [ReservaController::class, 'misReservas']);
    Route::get('/reservas/{id}', [ReservaController::class, 'detalleReserva']);
    Route::delete('/reservas/{id}', [ReservaController::class, 'cancelarReserva']);
});

// ========================================
// RUTAS PROTEGIDAS - STAFF (CON AUTH)
// ========================================
Route::middleware(\App\Http\Middleware\SimpleAuth::class)->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Usuarios (solo admin)
    Route::get('/usuarios', [UserController::class, 'index']);
    Route::post('/usuarios', [UserController::class, 'store']);
    Route::get('/usuarios/{id}', [UserController::class, 'show']);
    Route::put('/usuarios/{id}', [UserController::class, 'update']);
    Route::delete('/usuarios/{id}', [UserController::class, 'destroy']);
    Route::put('/usuarios/{id}/toggle-activo', [UserController::class, 'toggleActivo']);
    Route::post('usuarios/{id}/restablecer-password', [UserController::class, 'restablecerPassword'])
      ->name('usuarios.restablecer-password');

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

    // Colecciones
    Route::get('/colecciones', [ColeccionController::class, 'index']);
    Route::post('/colecciones', [ColeccionController::class, 'store']);
    Route::get('/colecciones/search', [ColeccionController::class, 'search']);
    Route::get('/colecciones/all', [ColeccionController::class, 'all']);
    Route::get('/colecciones/{id}', [ColeccionController::class, 'show']);
    Route::put('/colecciones/{id}', [ColeccionController::class, 'update']);
    Route::delete('/colecciones/{id}', [ColeccionController::class, 'destroy']);

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
    Route::get('/libros/ver-copias', [LibroController::class, 'verCopias']); // AGREGADO - debe estar ANTES de {id}
    Route::get('/libros/{id}', [LibroController::class, 'show']);
    Route::put('/libros/{id}', [LibroController::class, 'update']);
    Route::delete('/libros/{id}', [LibroController::class, 'destroy']);

    // Préstamos (staff) - CORREGIDO: Agregar rutas faltantes
    Route::get('/prestamos', [PrestamoController::class, 'index']);
    Route::post('/prestamos', [PrestamoController::class, 'store']);
    Route::get('/prestamos/estadisticas', [PrestamoController::class, 'estadisticas']); // AGREGADO
    Route::get('/prestamos/libros-disponibles', [PrestamoController::class, 'librosDisponibles']); // AGREGADO
    Route::get('/prestamos/vencidos', [PrestamoController::class, 'vencidos']);
    Route::get('/prestamos/{id}', [PrestamoController::class, 'show']);
    Route::put('/prestamos/{id}/devuelto', [PrestamoController::class, 'marcarDevuelto']);
    Route::put('/prestamos/{id}/perdido', [PrestamoController::class, 'marcarPerdido']);

    // Gestión de reservas (staff)
    Route::get('/reservas/pendientes', [ReservaController::class, 'listarReservasPendientes']);
    Route::put('/reservas/{id}/aprobar', [ReservaController::class, 'aprobarReserva']);
    Route::put('/reservas/{id}/rechazar', [ReservaController::class, 'rechazarReserva']);
    Route::put('/reservas/{id}/iniciar', [ReservaController::class, 'iniciarPrestamo']);
    Route::put('/reservas/{id}/vencido', [ReservaController::class, 'marcarVencido']);

    // Exportaciones BNP
    Route::get('/exportaciones/csv', [ExportacionController::class, 'exportarCSV']);
    Route::get('/exportaciones/excel', [ExportacionController::class, 'exportarExcel']);
    Route::get('/exportaciones/marc', [ExportacionController::class, 'exportarMARC']);
    Route::get('/exportaciones/estadisticas', [ExportacionController::class, 'exportarEstadisticas']);

    Route::get('/plantilla/descargar', [PlantillaController::class, 'descargarPlantilla']);

    // Auditoría (solo admin)
    Route::get('/auditoria', [AuditController::class, 'index']);
    Route::get('/auditoria/estadisticas', [AuditController::class, 'estadisticas']);
    Route::get('/auditoria/exportar', [AuditController::class, 'exportar']);
});
