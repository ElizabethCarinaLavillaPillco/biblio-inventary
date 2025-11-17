<?php

namespace App\Http\Controllers;

use App\Models\Autor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AutorController extends Controller
{
    public function index(Request $request)
    {
        $query = Autor::query();

        // Búsqueda
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('nombre', 'like', "%{$search}%");
        }

        $autores = $query->withCount('libros')
            ->orderBy('nombre')
            ->paginate(50);

        return response()->json($autores);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255|unique:autores,nombre'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $autor = Autor::create($request->all());

        return response()->json([
            'message' => 'Autor registrado exitosamente',
            'autor' => $autor
        ], 201);
    }

    public function show($id)
    {
        $autor = Autor::with('libros.categoria')->findOrFail($id);
        return response()->json($autor);
    }

    public function update(Request $request, $id)
    {
        $autor = Autor::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255|unique:autores,nombre,' . $id
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $autor->update($request->all());

        return response()->json([
            'message' => 'Autor actualizado exitosamente',
            'autor' => $autor
        ]);
    }

    public function destroy($id)
    {
        $autor = Autor::findOrFail($id);

        if ($autor->libros()->count() > 0) {
            return response()->json([
                'message' => 'No se puede eliminar el autor porque tiene libros asociados'
            ], 422);
        }

        $autor->delete();

        return response()->json([
            'message' => 'Autor eliminado exitosamente'
        ]);
    }

    // Búsqueda rápida para autocompletado
    public function search(Request $request)
    {
        $search = $request->get('q', '');
        
        $autores = Autor::where('nombre', 'like', "%{$search}%")
            ->orderBy('nombre')
            ->limit(10)
            ->get(['id', 'nombre']);

        return response()->json($autores);
    }
}
