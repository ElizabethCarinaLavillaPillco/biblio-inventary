<?php

namespace App\Http\Controllers;

use App\Models\Prestamo;
use App\Models\Libro;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PrestamoController extends Controller
{
    public function index(Request $request)
    {
        $query = Prestamo::with(['libro.autor', 'libro.categoria', 'prestadoPor', 'recibidoPor']);

        // Filtros
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('tipo_prestamo')) {
            $query->where('tipo_prestamo', $request->tipo_prestamo);
        }

        // Solo activos por defecto
        if (!$request->has('todos')) {
            $query->where('estado', 'activo');
        }

        $prestamos = $query->latest()->paginate(20);

        return response()->json($prestamos);
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

            // Crear préstamo
            $prestamo = Prestamo::create([
                'libro_id' => $request->libro_id,
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
                'estado' => 'activo',
                'prestado_por' => session("user_id")
            ]);

            // Actualizar estado del libro
            $libro->update([
                'estado_actual' => 'prestado',
                'tipo_prestamo' => $request->tipo_prestamo
            ]);

            DB::commit();

            $prestamo->load(['libro.autor', 'prestadoPor']);

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
            'recibidoPor'
        ])->findOrFail($id);

        return response()->json($prestamo);
    }

    public function marcarDevuelto($id)
    {
        $prestamo = Prestamo::findOrFail($id);

        if ($prestamo->estado !== 'activo') {
            return response()->json([
                'message' => 'El préstamo no está activo'
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Actualizar préstamo
            $prestamo->update([
                'estado' => 'devuelto',
                'fecha_devolucion' => now(),
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

        if ($prestamo->estado !== 'activo') {
            return response()->json([
                'message' => 'El préstamo no está activo'
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
        $prestamos = Prestamo::with(['libro.autor', 'prestadoPor'])
            ->where('estado', 'activo')
            ->whereDate('fecha_fin', '<', now())
            ->latest()
            ->get();

        return response()->json($prestamos);
    }
}
