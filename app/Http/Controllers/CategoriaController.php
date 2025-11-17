<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategoriaController extends Controller
{
    public function index(Request $request)
    {
        $query = Categoria::query();

        // Búsqueda
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('nombre', 'like', "%{$search}%");
        }

        $categorias = $query->withCount('libros')
            ->orderBy('nombre')
            ->paginate(50);

        return response()->json($categorias);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:100|unique:categorias,nombre'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $categoria = Categoria::create($request->all());

        return response()->json([
            'message' => 'Categoría registrada exitosamente',
            'categoria' => $categoria
        ], 201);
    }

    public function show($id)
    {
        $categoria = Categoria::with('libros.autor')->findOrFail($id);
        return response()->json($categoria);
    }

    public function update(Request $request, $id)
    {
        $categoria = Categoria::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:100|unique:categorias,nombre,' . $id
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $categoria->update($request->all());

        return response()->json([
            'message' => 'Categoría actualizada exitosamente',
            'categoria' => $categoria
        ]);
    }

    public function destroy($id)
    {
        $categoria = Categoria::findOrFail($id);

        if ($categoria->libros()->count() > 0) {
            return response()->json([
                'message' => 'No se puede eliminar la categoría porque tiene libros asociados'
            ], 422);
        }

        $categoria->delete();

        return response()->json([
            'message' => 'Categoría eliminada exitosamente'
        ]);
    }

    // Para select/dropdown
    public function all()
    {
        $categorias = Categoria::orderBy('nombre')->get(['id', 'nombre']);
        return response()->json($categorias);
    }
}
