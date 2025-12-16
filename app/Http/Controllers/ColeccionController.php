<?php

namespace App\Http\Controllers;

use App\Models\Coleccion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ColeccionController extends Controller
{
    public function index(Request $request)
    {
        $query = Coleccion::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('nombre', 'like', "%{$search}%");
        }

        $colecciones = $query->withCount('libros')
            ->orderBy('nombre')
            ->paginate(50);

        return response()->json($colecciones);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255|unique:colecciones,nombre'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $coleccion = Coleccion::create($request->all());

        return response()->json([
            'message' => 'Colección registrada exitosamente',
            'coleccion' => $coleccion
        ], 201);
    }

    public function show($id)
    {
        $coleccion = Coleccion::with('libros.autor', 'libros.categoria')->findOrFail($id);
        return response()->json($coleccion);
    }

    public function update(Request $request, $id)
    {
        $coleccion = Coleccion::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255|unique:colecciones,nombre,' . $id
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $coleccion->update($request->all());

        return response()->json([
            'message' => 'Colección actualizada exitosamente',
            'coleccion' => $coleccion
        ]);
    }

    public function destroy($id)
    {
        $coleccion = Coleccion::findOrFail($id);

        if ($coleccion->libros()->count() > 0) {
            return response()->json([
                'message' => 'No se puede eliminar la colección porque tiene libros asociados'
            ], 422);
        }

        $coleccion->delete();

        return response()->json([
            'message' => 'Colección eliminada exitosamente'
        ]);
    }

    public function search(Request $request)
    {
        $search = $request->get('q', '');

        $colecciones = Coleccion::where('nombre', 'like', "%{$search}%")
            ->orderBy('nombre')
            ->limit(10)
            ->get(['id', 'nombre']);

        return response()->json($colecciones);
    }

    public function all()
    {
        $colecciones = Coleccion::orderBy('nombre')->get(['id', 'nombre']);
        return response()->json($colecciones);
    }
}
