<?php

namespace App\Http\Controllers;

use App\Models\Ubicacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UbicacionController extends Controller
{
    public function index(Request $request)
    {
        $query = Ubicacion::query();

        // Filtros
        if ($request->has('anaquel')) {
            $query->where('anaquel', $request->anaquel);
        }

        if ($request->has('activo')) {
            $query->where('activo', $request->activo);
        }

        $ubicaciones = $query->withCount('libros')
            ->orderBy('anaquel')
            ->orderBy('lado')
            ->orderBy('nivel')
            ->orderBy('seccion')
            ->paginate(50);

        return response()->json($ubicaciones);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'anaquel' => 'required|string|max:10',
            'lado' => 'required|string|max:10',
            'nivel' => 'required|integer|min:1',
            'seccion' => 'required|string|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        // Generar código automático
        $codigo = Ubicacion::generarCodigo(
            $request->anaquel,
            $request->lado,
            $request->nivel,
            $request->seccion
        );

        // Verificar si ya existe
        if (Ubicacion::where('codigo', $codigo)->exists()) {
            return response()->json([
                'message' => 'Ya existe una ubicación con ese código: ' . $codigo
            ], 422);
        }

        $ubicacion = Ubicacion::create([
            'anaquel' => $request->anaquel,
            'lado' => $request->lado,
            'nivel' => $request->nivel,
            'seccion' => $request->seccion,
            'codigo' => $codigo,
            'activo' => true
        ]);

        return response()->json([
            'message' => 'Ubicación registrada exitosamente',
            'ubicacion' => $ubicacion
        ], 201);
    }

    public function show($id)
    {
        $ubicacion = Ubicacion::with('libros.autor')->findOrFail($id);
        return response()->json($ubicacion);
    }

    public function update(Request $request, $id)
    {
        $ubicacion = Ubicacion::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'anaquel' => 'required|string|max:10',
            'lado' => 'required|string|max:10',
            'nivel' => 'required|integer|min:1',
            'seccion' => 'required|string|max:10',
            'activo' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        // Generar nuevo código
        $codigo = Ubicacion::generarCodigo(
            $request->anaquel,
            $request->lado,
            $request->nivel,
            $request->seccion
        );

        // Verificar si ya existe (excepto la actual)
        if (Ubicacion::where('codigo', $codigo)->where('id', '!=', $id)->exists()) {
            return response()->json([
                'message' => 'Ya existe una ubicación con ese código: ' . $codigo
            ], 422);
        }

        $ubicacion->update([
            'anaquel' => $request->anaquel,
            'lado' => $request->lado,
            'nivel' => $request->nivel,
            'seccion' => $request->seccion,
            'codigo' => $codigo,
            'activo' => $request->activo ?? true
        ]);

        return response()->json([
            'message' => 'Ubicación actualizada exitosamente',
            'ubicacion' => $ubicacion
        ]);
    }

    public function destroy($id)
    {
        $ubicacion = Ubicacion::findOrFail($id);

        if ($ubicacion->libros()->count() > 0) {
            return response()->json([
                'message' => 'No se puede eliminar la ubicación porque tiene libros asociados'
            ], 422);
        }

        $ubicacion->delete();

        return response()->json([
            'message' => 'Ubicación eliminada exitosamente'
        ]);
    }

    // Para select/dropdown - solo activas
    public function activas()
    {
        $ubicaciones = Ubicacion::where('activo', true)
            ->orderBy('codigo')
            ->get(['id', 'codigo', 'anaquel', 'lado', 'nivel', 'seccion']);

        return response()->json($ubicaciones);
    }
}
