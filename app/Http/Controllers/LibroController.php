<?php

namespace App\Http\Controllers;

use App\Models\Libro;
use App\Models\Autor;
use App\Models\Categoria;
use App\Models\Ubicacion;
use App\Models\Coleccion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;

class LibroController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Libro::with(['autor', 'categoria', 'coleccion', 'ubicacion']);

            // Búsqueda
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('titulo', 'like', "%{$search}%")
                    ->orWhere('isbn', 'like', "%{$search}%")
                    ->orWhere('issn', 'like', "%{$search}%")
                    ->orWhere('editorial', 'like', "%{$search}%")
                    ->orWhereHas('autor', function($q) use ($search) {
                        $q->where('nombre', 'like', "%{$search}%");
                    })
                    ->orWhereHas('categoria', function($q) use ($search) {
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

            if ($request->filled('tipo_item')) {
                $query->where('tipo_item', $request->tipo_item);
            }

            if ($request->filled('estado_libro')) {
                $query->where('estado_libro', $request->estado_libro);
            }

            $libros = $query->latest()->paginate($request->get('per_page', 20));

            return response()->json($libros);

        } catch (\Exception $e) {
            Log::error('Error en LibroController@index: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'message' => 'Error al cargar libros',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'titulo' => 'required|string|max:255',
            'tipo_item' => 'required|in:libro,folleto,traduccion,revista,tesis,manual,diccionario,otro',
            'autor_id' => 'required|exists:autores,id',
            'isbn' => 'nullable|string|max:20|unique:libros,isbn',
            'issn' => 'nullable|string|max:20|unique:libros,issn',
            'coleccion_id' => 'nullable|exists:colecciones,id',
            'categoria_id' => 'required|exists:categorias,id',
            'clasificacion_cdd' => 'nullable|in:000,100,200,300,400,500,600,700,800,900',
            'codigo_cdd' => 'nullable|string|max:50',
            'precio' => 'nullable|numeric|min:0',
            'ubicacion_id' => 'nullable|exists:ubicaciones,id',
            'numero_paginas' => 'nullable|integer|min:1',
            'editorial' => 'nullable|string|max:100',
            'anio_publicacion' => 'nullable|integer|min:1000|max:' . (date('Y') + 1),
            'idioma' => 'nullable|string|max:50',
            'resumen' => 'nullable|string',
            'notas' => 'nullable|string',
            'tamanio' => 'nullable|in:pequeño,mediano,grande',
            'color_forro' => 'nullable|string|max:50',
            'procedencia' => 'nullable|in:ministerio de cultura,donaciones,compra,otro',
            'estado_libro' => 'required|in:nuevo,normal,mal estado',
            'destino_mal_estado' => 'nullable|in:aun en biblioteca,descartado a biblioteca comunitaria,n/a',
            'estado_actual' => 'required|in:en biblioteca,prestado,perdido,biblioteca comunitaria',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Obtener el ID del usuario desde la sesión
            $userId = session('user_id');

            if (!$userId) {
                return response()->json([
                    'message' => 'Sesión no válida. Por favor, cierra sesión e inicia nuevamente.'
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
            $libro->load(['autor', 'categoria', 'ubicacion', 'registradoPor', 'coleccion']);

            return response()->json([
                'message' => 'Libro registrado exitosamente',
                'libro' => $libro
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error en LibroController@store: ' . $e->getMessage());
            Log::error('Datos enviados: ' . json_encode($request->all()));

            return response()->json([
                'message' => 'Error al registrar el libro',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $libro = Libro::with([
                'autor',
                'categoria',
                'ubicacion',
                'registradoPor',
                'coleccion',
                'prestamoActivo.prestadoPor',
                'prestamos' => function($query) {
                    $query->orderBy('created_at', 'desc')->limit(10);
                }
            ])->findOrFail($id);

            return response()->json($libro);

        } catch (\Exception $e) {
            Log::error('Error en LibroController@show: ' . $e->getMessage());

            return response()->json([
                'message' => 'Error al cargar el libro',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $libro = Libro::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'titulo' => 'required|string|max:255',
                'tipo_item' => 'required|in:libro,folleto,traduccion,revista,tesis,manual,diccionario,otro',
                'autor_id' => 'required|exists:autores,id',
                'isbn' => 'nullable|string|max:20|unique:libros,isbn,' . $id,
                'issn' => 'nullable|string|max:20|unique:libros,issn,' . $id,
                'coleccion_id' => 'nullable|exists:colecciones,id',
                'categoria_id' => 'required|exists:categorias,id',
                'clasificacion_cdd' => 'nullable|in:000,100,200,300,400,500,600,700,800,900',
                'codigo_cdd' => 'nullable|string|max:50',
                'precio' => 'nullable|numeric|min:0',
                'ubicacion_id' => 'nullable|exists:ubicaciones,id',
                'numero_paginas' => 'nullable|integer|min:1',
                'editorial' => 'nullable|string|max:100',
                'anio_publicacion' => 'nullable|integer|min:1000|max:' . (date('Y') + 1),
                'idioma' => 'nullable|string|max:50',
                'resumen' => 'nullable|string',
                'notas' => 'nullable|string',
                'tamanio' => 'nullable|in:pequeño,mediano,grande',
                'color_forro' => 'nullable|string|max:50',
                'procedencia' => 'nullable|in:ministerio de cultura,donaciones,compra,otro',
                'estado_libro' => 'required|in:nuevo,normal,mal estado',
                'destino_mal_estado' => 'nullable|in:aun en biblioteca,descartado a biblioteca comunitaria,n/a',
                'estado_actual' => 'required|in:en biblioteca,prestado,perdido,biblioteca comunitaria',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->all();

            // Si está en mal estado y se descarta a biblioteca comunitaria, quitar ubicación
            if ($request->estado_libro === 'mal estado' &&
                $request->destino_mal_estado === 'descartado a biblioteca comunitaria') {
                $data['ubicacion_id'] = null;
                $data['estado_actual'] = 'biblioteca comunitaria';
            }

            // Actualizar todos los campos del modelo
            $libro->update($data);
            
            // Recargar relaciones actualizadas
            $libro->load(['autor', 'categoria', 'ubicacion', 'registradoPor', 'coleccion']);

            return response()->json([
                'message' => 'Libro actualizado exitosamente',
                'libro' => $libro
            ]);

        } catch (\Exception $e) {
            Log::error('Error en LibroController@update: ' . $e->getMessage());
            Log::error('Datos para actualizar: ' . json_encode($request->all()));

            return response()->json([
                'message' => 'Error al actualizar el libro',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $libro = Libro::findOrFail($id);

            // Verificar si tiene préstamos activos
            if ($libro->prestamos()->where('estado', 'activo')->exists()) {
                return response()->json([
                    'message' => 'No se puede eliminar el libro porque tiene préstamos activos'
                ], 422);
            }

            // Verificar si tiene historial de préstamos
            if ($libro->prestamos()->exists()) {
                // Opcional: Podrías querer hacer un soft delete en lugar de eliminar físicamente
                return response()->json([
                    'message' => 'No se puede eliminar el libro porque tiene historial de préstamos. Considere archivarlo en lugar de eliminarlo.'
                ], 422);
            }

            $libro->delete();

            return response()->json([
                'message' => 'Libro eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            Log::error('Error en LibroController@destroy: ' . $e->getMessage());

            return response()->json([
                'message' => 'Error al eliminar el libro',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function cargaMasiva(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'archivo' => 'required|file|mimes:xlsx,xls,csv|max:10240' // 10MB máximo
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $userId = session('user_id');
            if (!$userId) {
                return response()->json([
                    'message' => 'Sesión no válida para carga masiva.'
                ], 401);
            }

            $file = $request->file('archivo');
            $spreadsheet = IOFactory::load($file->getPathname());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();

            $registrados = [];
            $duplicados = [];
            $sinDatos = [];
            $errores = [];

            DB::beginTransaction();

            // Obtener cabeceras si existen
            $headers = $rows[0] ?? [];
            $startRow = 1;

            for ($i = $startRow; $i < count($rows); $i++) {
                $row = $rows[$i];
                
                // Asignar valores según estructura de columnas
                $titulo = trim($row[0] ?? '');
                $autorNombre = trim($row[1] ?? '');
                $isbn = trim($row[2] ?? '');
                $categoriaNombre = trim($row[3] ?? 'General');
                $precio = $row[4] ?? null;
                $editorial = trim($row[5] ?? '');
                $anioPublicacion = $row[6] ?? null;

                if (empty($titulo) || empty($autorNombre)) {
                    $sinDatos[] = [
                        'fila' => $i + 1,
                        'titulo' => $titulo ?: 'Sin título',
                        'autor' => $autorNombre ?: 'Sin autor'
                    ];
                    continue;
                }

                // Verificar si ya existe por ISBN o título+autor
                $existe = null;
                if (!empty($isbn)) {
                    $existe = Libro::where('isbn', $isbn)->first();
                }
                
                if (!$existe) {
                    $existe = Libro::where('titulo', $titulo)
                        ->whereHas('autor', function($q) use ($autorNombre) {
                            $q->where('nombre', 'like', '%' . $autorNombre . '%');
                        })
                        ->first();
                }

                if ($existe) {
                    $duplicados[] = [
                        'fila' => $i + 1,
                        'titulo' => $titulo,
                        'autor' => $autorNombre,
                        'isbn' => $isbn,
                        'libro_id' => $existe->id
                    ];
                    continue;
                }

                try {
                    // Buscar o crear autor
                    $autor = Autor::firstOrCreate(['nombre' => $autorNombre]);

                    // Buscar o crear categoría
                    $categoria = Categoria::firstOrCreate(['nombre' => $categoriaNombre]);

                    $libroData = [
                        'titulo' => $titulo,
                        'autor_id' => $autor->id,
                        'categoria_id' => $categoria->id,
                        'isbn' => !empty($isbn) ? $isbn : null,
                        'precio' => $precio ? floatval($precio) : null,
                        'editorial' => !empty($editorial) ? $editorial : null,
                        'anio_publicacion' => $anioPublicacion ? intval($anioPublicacion) : null,
                        'estado_libro' => 'normal',
                        'estado_actual' => 'en biblioteca',
                        'tipo_item' => 'libro',
                        'registrado_por' => $userId
                    ];

                    $libro = Libro::create($libroData);

                    $registrados[] = [
                        'fila' => $i + 1,
                        'titulo' => $titulo,
                        'autor' => $autorNombre,
                        'libro_id' => $libro->id
                    ];

                } catch (\Exception $e) {
                    $errores[] = [
                        'fila' => $i + 1,
                        'titulo' => $titulo,
                        'autor' => $autorNombre,
                        'error' => $e->getMessage()
                    ];
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Carga masiva procesada exitosamente',
                'resumen' => [
                    'total_procesados' => count($rows) - $startRow,
                    'registrados' => count($registrados),
                    'duplicados' => count($duplicados),
                    'sin_datos' => count($sinDatos),
                    'errores' => count($errores)
                ],
                'detalles' => [
                    'registrados' => $registrados,
                    'duplicados' => $duplicados,
                    'sin_datos' => $sinDatos,
                    'errores' => $errores
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error en LibroController@cargaMasiva: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'message' => 'Error al procesar el archivo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Método para obtener estadísticas
    public function estadisticas()
    {
        try {
            $totalLibros = Libro::count();
            $enBiblioteca = Libro::where('estado_actual', 'en biblioteca')->count();
            $prestados = Libro::where('estado_actual', 'prestado')->count();
            $porCategoria = Categoria::withCount('libros')->get();
            $porEstadoLibro = Libro::select('estado_libro', DB::raw('count(*) as total'))
                ->groupBy('estado_libro')
                ->get();
            $porTipoItem = Libro::select('tipo_item', DB::raw('count(*) as total'))
                ->groupBy('tipo_item')
                ->get();

            return response()->json([
                'total_libros' => $totalLibros,
                'en_biblioteca' => $enBiblioteca,
                'prestados' => $prestados,
                'por_categoria' => $porCategoria,
                'por_estado_libro' => $porEstadoLibro,
                'por_tipo_item' => $porTipoItem,
            ]);

        } catch (\Exception $e) {
            Log::error('Error en LibroController@estadisticas: ' . $e->getMessage());

            return response()->json([
                'message' => 'Error al cargar estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}