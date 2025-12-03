<?php

namespace App\Http\Controllers;

use App\Models\Libro;
use App\Models\Autor;
use App\Models\Categoria;
use App\Models\Ubicacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;

class LibroController extends Controller
{
    public function index(Request $request)
    {
        $query = Libro::with(['autor', 'categoria', 'ubicacion']);

        // Búsqueda
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('titulo', 'like', "%{$search}%")
                ->orWhereHas('autor', function($q) use ($search) {
                    $q->where('nombre', 'like', "%{$search}%");
                });
            });
        }

        // Filtros
        if ($request->filled('categoria_id')) {
            $query->where('categoria_id', $request->categoria_id);
        }

        if ($request->filled('estado_actual')) {
            $query->where('estado_actual', $request->estado_actual);
        }

        if ($request->filled('autor_id')) {
            $query->where('autor_id', $request->autor_id);
        }

        if ($request->filled('ubicacion_id')) {
            $query->where('ubicacion_id', $request->ubicacion_id);
        }

        $libros = $query->latest()->paginate(20);

        return response()->json($libros);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'titulo' => 'required|string|max:255',
            'autor_id' => 'required|exists:autores,id',
            'categoria_id' => 'required|exists:categorias,id',
            'precio' => 'nullable|numeric|min:0',
            'ubicacion_id' => 'nullable|exists:ubicaciones,id',
            'numero_paginas' => 'nullable|integer|min:1',
            'editorial' => 'nullable|string|max:100',
            'tamanio' => 'nullable|in:pequeño,mediano,grande',
            'color_forro' => 'nullable|string|max:50',
            'procedencia' => 'nullable|in:ministerio de cultura,donaciones',
            'estado_libro' => 'required|in:nuevo,normal,mal estado',
            'destino_mal_estado' => 'nullable|in:aun en biblioteca,descartado a biblioteca comunitaria,n/a',
            'estado_actual' => 'required|in:en biblioteca,prestado,perdido,biblioteca comunitaria',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        // Obtener el ID del usuario desde la sesión
        $userId = session('user_id');

        // Debug: Log para ver qué está pasando
        \Log::info('Intentando registrar libro', [
            'session_user_id' => $userId,
            'session_all' => session()->all(),
            'request_cookies' => $request->cookies->all()
        ]);

        if (!$userId) {
            return response()->json([
                'message' => 'Sesión no válida. Por favor, cierra sesión e inicia nuevamente.',
                'debug' => [
                    'session_id' => session()->getId(),
                    'has_user_id' => session()->has('user_id')
                ]
            ], 401);
        }

        $data = $request->all();
        $data['registrado_por'] = $userId;

        // Si está en mal estado y se descarta a biblioteca comunitaria, quitar ubicación
        if ($request->estado_libro === 'mal estado' &&
            $request->destino_mal_estado === 'descartado a biblioteca comunitaria') {
            $data['ubicacion_id'] = null;
            $data['estado_actual'] = 'biblioteca comunitaria';
        }

        $libro = Libro::create($data);
        $libro->load(['autor', 'categoria', 'ubicacion', 'registradoPor']);

        return response()->json([
            'message' => 'Libro registrado exitosamente',
            'libro' => $libro
        ], 201);
    }

    public function show($id)
    {
        $libro = Libro::with([
            'autor',
            'categoria',
            'ubicacion',
            'registradoPor',
            'prestamoActivo.prestadoPor'
        ])->findOrFail($id);

        return response()->json($libro);
    }

    public function update(Request $request, $id)
    {
        $libro = Libro::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'titulo' => 'required|string|max:255',
            'autor_id' => 'required|exists:autores,id',
            'categoria_id' => 'required|exists:categorias,id',
            'precio' => 'nullable|numeric|min:0',
            'ubicacion_id' => 'nullable|exists:ubicaciones,id',
            'numero_paginas' => 'nullable|integer|min:1',
            'editorial' => 'nullable|string|max:100',
            'tamanio' => 'nullable|in:pequeño,mediano,grande',
            'color_forro' => 'nullable|string|max:50',
            'procedencia' => 'nullable|in:ministerio de cultura,donaciones',
            'estado_libro' => 'required|in:nuevo,normal,mal estado',
            'destino_mal_estado' => 'nullable|in:aun en biblioteca,descartado a biblioteca comunitaria,n/a',
            'estado_actual' => 'required|in:en biblioteca,prestado,perdido,biblioteca comunitaria',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $data = [
            'titulo' => $request->titulo,
            'autor_id' => $request->autor_id,
            'categoria_id' => $request->categoria_id,
            'precio' => $request->precio,
            'ubicacion_id' => $request->ubicacion_id,
            'numero_paginas' => $request->numero_paginas,
            'editorial' => $request->editorial,
            'tamanio' => $request->tamanio,
            'color_forro' => $request->color_forro,
            'procedencia' => $request->procedencia,
            'estado_libro' => $request->estado_libro,
            'destino_mal_estado' => $request->destino_mal_estado,
            'estado_actual' => $request->estado_actual,
        ];

        // Si está en mal estado y se descarta a biblioteca comunitaria, quitar ubicación
        if ($request->estado_libro === 'mal estado' &&
            $request->destino_mal_estado === 'descartado a biblioteca comunitaria') {
            $data['ubicacion_id'] = null;
            $data['estado_actual'] = 'biblioteca comunitaria';
        }

        $libro->update($data);
        $libro->load(['autor', 'categoria', 'ubicacion', 'registradoPor']);

        return response()->json([
            'message' => 'Libro actualizado exitosamente',
            'libro' => $libro
        ]);
    }

    public function destroy($id)
    {
        $libro = Libro::findOrFail($id);

        if ($libro->prestamos()->where('estado', 'activo')->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar el libro porque tiene préstamos activos'
            ], 422);
        }

        $libro->delete();

        return response()->json([
            'message' => 'Libro eliminado exitosamente'
        ]);
    }

    public function cargaMasiva(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'archivo' => 'required|file|mimes:xlsx,xls,csv'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar sesión
        $userId = session('user_id');
        if (!$userId) {
            return response()->json([
                'message' => 'Sesión no válida para carga masiva.'
            ], 401);
        }

        try {
            $file = $request->file('archivo');
            $spreadsheet = IOFactory::load($file->getPathname());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();

            $registrados = [];
            $duplicados = [];
            $sinDatos = [];
            $errores = [];

            for ($i = 1; $i < count($rows); $i++) {
                $row = $rows[$i];

                $titulo = trim($row[0] ?? '');
                $autorNombre = trim($row[1] ?? '');
                $precio = $row[2] ?? null;

                if (empty($titulo) || empty($autorNombre)) {
                    $sinDatos[] = [
                        'fila' => $i + 1,
                        'titulo' => $titulo ?: 'Sin título',
                        'autor' => $autorNombre ?: 'Sin autor'
                    ];
                    continue;
                }

                $existe = Libro::where('titulo', $titulo)
                    ->whereHas('autor', function($q) use ($autorNombre) {
                        $q->where('nombre', $autorNombre);
                    })
                    ->first();

                if ($existe) {
                    $duplicados[] = [
                        'fila' => $i + 1,
                        'titulo' => $titulo,
                        'autor' => $autorNombre,
                        'libro_id' => $existe->id
                    ];
                    continue;
                }

                try {
                    $autor = Autor::firstOrCreate(['nombre' => $autorNombre]);

                    $libro = Libro::create([
                        'titulo' => $titulo,
                        'autor_id' => $autor->id,
                        'categoria_id' => 1,
                        'precio' => $precio ? floatval($precio) : null,
                        'estado_libro' => 'normal',
                        'estado_actual' => 'en biblioteca',
                        'registrado_por' => $userId
                    ]);

                    $registrados[] = [
                        'fila' => $i + 1,
                        'titulo' => $titulo,
                        'libro_id' => $libro->id
                    ];

                } catch (\Exception $e) {
                    $errores[] = [
                        'fila' => $i + 1,
                        'titulo' => $titulo,
                        'error' => $e->getMessage()
                    ];
                }
            }

            return response()->json([
                'message' => 'Carga masiva procesada',
                'resumen' => [
                    'total_procesados' => count($rows) - 1,
                    'registrados' => count($registrados),
                    'duplicados' => count($duplicados),
                    'sin_datos' => count($sinDatos),
                    'errores' => count($errores)
                ],
                'registrados' => $registrados,
                'duplicados' => $duplicados,
                'sin_datos' => $sinDatos,
                'errores' => $errores
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al procesar el archivo',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
