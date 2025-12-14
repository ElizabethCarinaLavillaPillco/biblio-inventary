<?php

namespace App\Http\Controllers;

use App\Models\Prestamo;
use App\Models\Libro;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PrestamoController extends Controller
{
    public function index(Request $request)
    {
        $query = Prestamo::with(['libro.autor', 'libro.categoria', 'prestadoPor', 'recibidoPor', 'cliente']);

        // Filtros por estado
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('tipo_prestamo')) {
            $query->where('tipo_prestamo', $request->tipo_prestamo);
        }

        // Por defecto mostrar activos y pendientes
        if (!$request->has('todos')) {
            $query->whereIn('estado', ['pendiente', 'activo']); // SOLO ESTOS DOS
        }

        $prestamos = $query->latest()->paginate(20);

        return response()->json($prestamos);
    }

    // ⚡ Endpoint de estadísticas
    public function estadisticas()
    {
        $activos = Prestamo::where('estado', 'activo')->count();

        $vencidos = Prestamo::where('estado', 'activo')
            ->whereDate('fecha_fin', '<', now())
            ->count();

        $devueltos_hoy = Prestamo::where('estado', 'devuelto')
            ->whereDate('fecha_devolucion', today())
            ->count();

        return response()->json([
            'activos' => $activos,
            'vencidos' => $vencidos,
            'devueltos_hoy' => $devueltos_hoy
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'libro_id' => 'required|exists:libros,id',
            'nombres' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'dni' => 'required|string|size:8',
            'fecha_nacimiento' => 'required|date',
            'telefono' => 'required|string|max:15',
            'domicilio' => 'required|string|max:255',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'garantia' => 'required|string|max:100',
            'tipo_prestamo' => 'required|in:en biblioteca,a domicilio',
            'acepta_proteccion_datos' => 'required|boolean|accepted',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar que el libro esté disponible
        $libro = Libro::findOrFail($request->libro_id);

        if ($libro->estado_actual !== 'en biblioteca') {
            return response()->json([
                'message' => 'El libro no está disponible para préstamo'
            ], 422);
        }

        // Verificar si ya tiene un préstamo activo
        if ($libro->prestamos()->where('estado', 'activo')->exists()) {
            return response()->json([
                'message' => 'El libro ya tiene un préstamo activo'
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Calcular edad y días
            $edad = Prestamo::calcularEdad($request->fecha_nacimiento);
            $totalDias = Prestamo::calcularTotalDias($request->fecha_inicio, $request->fecha_fin);

            // Buscar cliente por DNI si existe
            $cliente = Cliente::where('dni', $request->dni)->first();
            
            // Crear préstamo - ESTADO: 'activo' directamente (no 'pendiente')
            $prestamo = Prestamo::create([
                'libro_id' => $request->libro_id,
                'cliente_id' => $cliente ? $cliente->id : null,
                'nombres' => $request->nombres,
                'apellidos' => $request->apellidos,
                'dni' => $request->dni,
                'fecha_nacimiento' => $request->fecha_nacimiento,
                'edad' => $edad,
                'telefono' => $request->telefono,
                'domicilio' => $request->domicilio,
                'fecha_inicio' => $request->fecha_inicio,
                'fecha_fin' => $request->fecha_fin,
                'total_dias' => $totalDias,
                'garantia' => $request->garantia,
                'tipo_prestamo' => $request->tipo_prestamo,
                'estado' => 'activo', // CREACIÓN DIRECTA COMO ACTIVO
                'fecha_aprobacion' => now(), // APRUEBA AUTOMÁTICAMENTE
                'prestado_por' => session("user_id")
            ]);

            // Actualizar estado del libro
            $libro->update([
                'estado_actual' => 'prestado',
                'tipo_prestamo' => $request->tipo_prestamo
            ]);

            DB::commit();

            $prestamo->load(['libro.autor', 'prestadoPor', 'cliente']);

            return response()->json([
                'message' => 'Préstamo registrado exitosamente',
                'prestamo' => $prestamo
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al registrar el préstamo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $prestamo = Prestamo::with([
            'libro.autor',
            'libro.categoria',
            'libro.ubicacion',
            'prestadoPor',
            'recibidoPor',
            'cliente'
        ])->findOrFail($id);

        return response()->json($prestamo);
    }

    public function marcarDevuelto($id)
    {
        $prestamo = Prestamo::findOrFail($id);

        // Solo se puede marcar devuelto si está activo
        if ($prestamo->estado !== 'activo') {
            return response()->json([
                'message' => 'Solo se pueden devolver préstamos activos'
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Calcular días de retraso si hay
            $diasRetraso = 0;
            if (now()->gt($prestamo->fecha_fin)) {
                $diasRetraso = now()->diffInDays($prestamo->fecha_fin);
            }

            // Actualizar préstamo
            $prestamo->update([
                'estado' => 'devuelto',
                'fecha_devolucion' => now(),
                'dias_retraso' => $diasRetraso,
                'recibido_por' => session("user_id")
            ]);

            // Actualizar libro
            $prestamo->libro->update([
                'estado_actual' => 'en biblioteca',
                'tipo_prestamo' => 'n/a'
            ]);

            DB::commit();

            $prestamo->load(['libro', 'recibidoPor']);

            return response()->json([
                'message' => 'Libro marcado como devuelto exitosamente',
                'prestamo' => $prestamo
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al marcar como devuelto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function marcarPerdido($id)
    {
        $prestamo = Prestamo::findOrFail($id);

        // Solo se puede marcar perdido si está activo
        if ($prestamo->estado !== 'activo') {
            return response()->json([
                'message' => 'Solo se pueden marcar perdidos préstamos activos'
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Actualizar préstamo
            $prestamo->update([
                'estado' => 'perdido',
                'recibido_por' => session("user_id")
            ]);

            // Actualizar libro
            $prestamo->libro->update([
                'estado_actual' => 'perdido',
                'tipo_prestamo' => 'n/a'
            ]);

            DB::commit();

            $prestamo->load(['libro', 'recibidoPor']);

            return response()->json([
                'message' => 'Libro marcado como perdido',
                'prestamo' => $prestamo
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al marcar como perdido',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Obtener préstamos vencidos
    public function vencidos()
    {
        $prestamos = Prestamo::with(['libro.autor', 'prestadoPor', 'cliente'])
            ->where('estado', 'activo')
            ->whereDate('fecha_fin', '<', now())
            ->latest()
            ->get();

        return response()->json($prestamos);
    }

    // ⚡ Obtener libros disponibles para préstamo
    public function librosDisponibles()
    {
        $libros = Libro::with(['autor', 'categoria', 'ubicacion'])
            ->where('estado_actual', 'en biblioteca')
            ->orderBy('titulo')
            ->get();

        return response()->json($libros);
    }

    // ⚡ NUEVO: Aprobar préstamo pendiente
    public function aprobar($id)
    {
        $prestamo = Prestamo::findOrFail($id);

        if ($prestamo->estado !== 'pendiente') {
            return response()->json([
                'message' => 'Solo se pueden aprobar préstamos pendientes'
            ], 422);
        }

        try {
            DB::beginTransaction();

            $prestamo->update([
                'estado' => 'activo',
                'fecha_aprobacion' => now(),
                'prestado_por' => session("user_id")
            ]);

            // Actualizar libro
            $prestamo->libro->update([
                'estado_actual' => 'prestado'
            ]);

            DB::commit();

            $prestamo->load(['libro', 'prestadoPor']);

            return response()->json([
                'message' => 'Préstamo aprobado exitosamente',
                'prestamo' => $prestamo
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al aprobar el préstamo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ⚡ NUEVO: Rechazar préstamo pendiente
    public function rechazar(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'motivo_rechazo' => 'required|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $prestamo = Prestamo::findOrFail($id);

        if ($prestamo->estado !== 'pendiente') {
            return response()->json([
                'message' => 'Solo se pueden rechazar préstamos pendientes'
            ], 422);
        }

        try {
            DB::beginTransaction();

            $prestamo->update([
                'estado' => 'rechazado',
                'fecha_rechazo' => now(),
                'motivo_rechazo' => $request->motivo_rechazo,
                'prestado_por' => session("user_id") // Otra opción: tener campo 'rechazado_por'
            ]);

            DB::commit();

            $prestamo->load(['libro', 'prestadoPor']);

            return response()->json([
                'message' => 'Préstamo rechazado exitosamente',
                'prestamo' => $prestamo
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al rechazar el préstamo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ⚡ NUEVO: Cancelar préstamo pendiente
    public function cancelar($id)
    {
        $prestamo = Prestamo::findOrFail($id);

        if ($prestamo->estado !== 'pendiente') {
            return response()->json([
                'message' => 'Solo se pueden cancelar préstamos pendientes'
            ], 422);
        }

        try {
            DB::beginTransaction();

            $prestamo->update([
                'estado' => 'rechazado',
                'fecha_rechazo' => now(),
                'motivo_rechazo' => 'Cancelado por el usuario'
            ]);

            DB::commit();

            $prestamo->load(['libro']);

            return response()->json([
                'message' => 'Préstamo cancelado exitosamente',
                'prestamo' => $prestamo
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al cancelar el préstamo',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}