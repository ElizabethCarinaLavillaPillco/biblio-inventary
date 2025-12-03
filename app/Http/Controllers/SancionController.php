<?php

namespace App\Http\Controllers;

use App\Models\Sancion;
use App\Models\Prestamo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SancionController extends Controller
{
    public function index(Request $request)
    {
        $query = Sancion::with(['prestamo.libro', 'usuario']);

        // Filtros
        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('tipo')) {
            $query->where('tipo', $request->tipo);
        }

        if ($request->filled('usuario_id')) {
            $query->where('usuario_sancionado', $request->usuario_id);
        }

        $sanciones = $query->latest()->paginate(20);

        return response()->json($sanciones);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'prestamo_id' => 'required|exists:prestamos,id',
            'usuario_sancionado' => 'required|exists:users,id',
            'tipo' => 'required|in:perdida,dano,retraso_grave',
            'monto_multa' => 'nullable|numeric|min:0',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'nullable|date|after:fecha_inicio',
            'observaciones' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $sancion = Sancion::create($request->all());
        $sancion->load(['prestamo.libro', 'usuario']);

        return response()->json([
            'message' => 'Sanción registrada exitosamente',
            'sancion' => $sancion
        ], 201);
    }

    public function show($id)
    {
        $sancion = Sancion::with(['prestamo.libro', 'usuario'])->findOrFail($id);
        return response()->json($sancion);
    }

    public function update(Request $request, $id)
    {
        $sancion = Sancion::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'estado' => 'required|in:activa,cumplida,perdonada',
            'monto_multa' => 'nullable|numeric|min:0',
            'fecha_fin' => 'nullable|date',
            'observaciones' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $sancion->update($request->all());
        $sancion->load(['prestamo.libro', 'usuario']);

        return response()->json([
            'message' => 'Sanción actualizada exitosamente',
            'sancion' => $sancion
        ]);
    }

    public function marcarCumplida($id)
    {
        $sancion = Sancion::findOrFail($id);
        
        $sancion->update([
            'estado' => 'cumplida',
            'fecha_fin' => now()
        ]);

        return response()->json([
            'message' => 'Sanción marcada como cumplida',
            'sancion' => $sancion
        ]);
    }

    public function perdonar($id, Request $request)
    {
        $sancion = Sancion::findOrFail($id);
        
        $sancion->update([
            'estado' => 'perdonada',
            'observaciones' => $request->observaciones ?? 'Sanción perdonada',
            'fecha_fin' => now()
        ]);

        return response()->json([
            'message' => 'Sanción perdonada',
            'sancion' => $sancion
        ]);
    }

    // Obtener sanciones de un usuario específico
    public function sancionesUsuario($userId)
    {
        $sanciones = Sancion::with(['prestamo.libro'])
            ->where('usuario_sancionado', $userId)
            ->latest()
            ->get();

        $activas = $sanciones->where('estado', 'activa')->count();
        $total_multas = $sanciones->where('estado', 'activa')->sum('monto_multa');

        return response()->json([
            'sanciones' => $sanciones,
            'resumen' => [
                'total_sanciones' => $sanciones->count(),
                'activas' => $activas,
                'total_multas_pendientes' => $total_multas
            ]
        ]);
    }
}