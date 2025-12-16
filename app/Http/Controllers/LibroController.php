<?php

namespace App\Http\Controllers;

use App\Models\Libro;
use App\Models\Autor;
use App\Models\Categoria;
use App\Models\Coleccion;
use App\Models\Ubicacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;

class LibroController extends Controller
{
    public function index(Request $request)
    {
        $query = Libro::with(['autor', 'categoria', 'coleccion']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('titulo', 'like', "%{$search}%")
                ->orWhere('isbn', 'like', "%{$search}%")
                ->orWhere('issn', 'like', "%{$search}%")
                ->orWhereHas('autor', function($q) use ($search) {
                    $q->where('nombre', 'like', "%{$search}%");
                });
            });
        }

        if ($request->filled('categoria_id')) {
            $query->where('categoria_id', $request->categoria_id);
        }

        if ($request->filled('estado_actual')) {
            $query->where('estado_actual', $request->estado_actual);
        }

        if ($request->filled('autor_id')) {
            $query->where('autor_id', $request->autor_id);
        }

        if ($request->filled('coleccion_id')) {
            $query->where('coleccion_id', $request->coleccion_id);
        }

        $librosAgrupados = $query
            ->select(
                'titulo',
                'autor_id',
                'categoria_id',
                'coleccion_id',
                DB::raw('MIN(id) as id_representativo'),
                DB::raw('COUNT(*) as stock_total'),
                DB::raw('SUM(CASE WHEN estado_actual = "en biblioteca" THEN 1 ELSE 0 END) as stock_disponible'),
                DB::raw('SUM(CASE WHEN estado_actual = "prestado" THEN 1 ELSE 0 END) as stock_prestado'),
                DB::raw('SUM(CASE WHEN estado_actual = "perdido" THEN 1 ELSE 0 END) as stock_perdido'),
                DB::raw('AVG(precio) as precio_promedio'),
                DB::raw('MAX(created_at) as fecha_ultima_copia')
            )
            ->groupBy('titulo', 'autor_id', 'categoria_id', 'coleccion_id')
            ->orderBy('fecha_ultima_copia', 'desc')
            ->paginate(20);

        $librosAgrupados->getCollection()->transform(function ($libro) {
            $libroRepresentativo = Libro::with(['autor', 'categoria', 'coleccion', 'ubicacion'])
                ->find($libro->id_representativo);

            $libro->autor = $libroRepresentativo->autor;
            $libro->categoria = $libroRepresentativo->categoria;
            $libro->coleccion = $libroRepresentativo->coleccion;
            $libro->ubicacion = $libroRepresentativo->ubicacion;

            return $libro;
        });

        return response()->json($librosAgrupados);
    }

    public function store(Request $request)
    {
        // ===== VALIDACIÓN: Solo título y autor son OBLIGATORIOS =====
        $rules = [
            'titulo' => 'required|string|max:255',
            'autor_id' => 'required|exists:autores,id',
            'categoria_id' => 'required|exists:categorias,id',

            // Campos opcionales
            'tipo_item' => 'nullable|in:libro,folleto,traduccion,revista,tesis,manual,diccionario,otro',
            'coleccion_id' => 'nullable|exists:colecciones,id',
            'ubicacion_id' => 'nullable|exists:ubicaciones,id',
            'precio' => 'nullable|numeric|min:0',
            'numero_paginas' => 'nullable|integer|min:1',
            'editorial' => 'nullable|string|max:100',
            'anio_publicacion' => 'nullable|integer|min:1000|max:' . (date('Y') + 10),
            'idioma' => 'nullable|string|max:50',
            'resumen' => 'nullable|string',
            'notas' => 'nullable|string',
            'tamanio' => 'nullable|in:pequeño,mediano,grande',
            'color_forro' => 'nullable|string|max:50',
            'procedencia' => 'nullable|in:ministerio de cultura,donaciones',
            'clasificacion_cdd' => 'nullable|in:000,100,200,300,400,500,600,700,800,900',
            'codigo_cdd' => 'nullable|string|max:50',
            'signatura' => 'nullable|string|max:50',
            'estado_libro' => 'required|in:nuevo,normal,mal estado',
            'destino_mal_estado' => 'nullable|in:aun en biblioteca,descartado a biblioteca comunitaria,n/a',
            'estado_actual' => 'required|in:en biblioteca,prestado,perdido,biblioteca comunitaria',
        ];

        // ===== VALIDACIÓN ESPECIAL: ISBN/ISSN únicos si se proporcionan =====
        if ($request->filled('isbn')) {
            $rules['isbn'] = 'nullable|string|max:20|unique:libros,isbn';
        }
        if ($request->filled('issn')) {
            $rules['issn'] = 'nullable|string|max:20|unique:libros,issn';
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->all();
        $data['registrado_por'] = session('user_id');

        if (!$data['registrado_por']) {
            return response()->json(['message' => 'Usuario no autenticado'], 401);
        }

        // Generar código de inventario único
        $data['codigo_inventario'] = Libro::generarCodigoInventario();

        // Verificar duplicados
        $copiasExistentes = Libro::buscarDuplicados($request->titulo, $request->autor_id);
        $esDuplicado = $copiasExistentes->count() > 0;

        // Lógica de mal estado
        if ($request->estado_libro === 'mal estado' &&
            $request->destino_mal_estado === 'descartado a biblioteca comunitaria') {
            $data['ubicacion_id'] = null;
            $data['estado_actual'] = 'biblioteca comunitaria';
        }

        // ===== LIMPIAR CAMPOS VACÍOS (convertir "" a NULL) =====
        $camposOpcionales = [
            'isbn', 'issn', 'coleccion_id', 'ubicacion_id', 'precio', 'numero_paginas',
            'editorial', 'anio_publicacion', 'idioma', 'resumen', 'notas',
            'tamanio', 'color_forro', 'procedencia', 'clasificacion_cdd', 'codigo_cdd', 'signatura'
        ];

        foreach ($camposOpcionales as $campo) {
            if (isset($data[$campo]) && $data[$campo] === '') {
                $data[$campo] = null;
            }
        }

        $libro = Libro::create($data);
        $libro->load(['autor', 'categoria', 'coleccion', 'ubicacion', 'registradoPor']);

        $stockInfo = [
            'es_duplicado' => $esDuplicado,
            'stock_total' => $libro->stock_total,
            'stock_disponible' => $libro->stock_disponible,
            'stock_prestado' => $libro->stock_prestado,
            'codigo_inventario' => $libro->codigo_inventario
        ];

        $message = $esDuplicado
            ? "Nueva copia registrada. Ahora hay {$stockInfo['stock_total']} copias de este libro."
            : "Libro registrado exitosamente como nuevo título.";

        return response()->json([
            'message' => $message,
            'libro' => $libro,
            'stock_info' => $stockInfo
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $libro = Libro::findOrFail($id);

        $rules = [
            'titulo' => 'required|string|max:255',
            'autor_id' => 'required|exists:autores,id',
            'categoria_id' => 'required|exists:categorias,id',
            'tipo_item' => 'nullable|in:libro,folleto,traduccion,revista,tesis,manual,diccionario,otro',
            'coleccion_id' => 'nullable|exists:colecciones,id',
            'ubicacion_id' => 'nullable|exists:ubicaciones,id',
            'precio' => 'nullable|numeric|min:0',
            'numero_paginas' => 'nullable|integer|min:1',
            'editorial' => 'nullable|string|max:100',
            'anio_publicacion' => 'nullable|integer|min:1000|max:' . (date('Y') + 10),
            'idioma' => 'nullable|string|max:50',
            'resumen' => 'nullable|string',
            'notas' => 'nullable|string',
            'tamanio' => 'nullable|in:pequeño,mediano,grande',
            'color_forro' => 'nullable|string|max:50',
            'procedencia' => 'nullable|in:ministerio de cultura,donaciones',
            'clasificacion_cdd' => 'nullable|in:000,100,200,300,400,500,600,700,800,900',
            'codigo_cdd' => 'nullable|string|max:50',
            'signatura' => 'nullable|string|max:50',
            'estado_libro' => 'required|in:nuevo,normal,mal estado',
            'destino_mal_estado' => 'nullable|in:aun en biblioteca,descartado a biblioteca comunitaria,n/a',
            'estado_actual' => 'required|in:en biblioteca,prestado,perdido,biblioteca comunitaria',
        ];

        // Validar ISBN/ISSN únicos excepto el libro actual
        if ($request->filled('isbn')) {
            $rules['isbn'] = 'nullable|string|max:20|unique:libros,isbn,' . $id;
        }
        if ($request->filled('issn')) {
            $rules['issn'] = 'nullable|string|max:20|unique:libros,issn,' . $id;
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Construir datos actualizables
        $data = $request->only([
            'titulo', 'autor_id', 'categoria_id', 'tipo_item', 'isbn', 'issn',
            'coleccion_id', 'ubicacion_id', 'precio', 'numero_paginas', 'editorial',
            'anio_publicacion', 'idioma', 'resumen', 'notas', 'tamanio', 'color_forro',
            'procedencia', 'clasificacion_cdd', 'codigo_cdd', 'signatura',
            'estado_libro', 'destino_mal_estado', 'estado_actual'
        ]);

        // Limpiar campos vacíos
        foreach ($data as $key => $value) {
            if ($value === '') {
                $data[$key] = null;
            }
        }

        if ($request->estado_libro === 'mal estado' &&
            $request->destino_mal_estado === 'descartado a biblioteca comunitaria') {
            $data['ubicacion_id'] = null;
            $data['estado_actual'] = 'biblioteca comunitaria';
        }

        $libro->update($data);
        $libro->load(['autor', 'categoria', 'coleccion', 'ubicacion', 'registradoPor']);

        return response()->json([
            'message' => 'Libro actualizado exitosamente',
            'libro' => $libro,
            'stock_info' => [
                'stock_total' => $libro->stock_total,
                'stock_disponible' => $libro->stock_disponible,
                'stock_prestado' => $libro->stock_prestado,
            ]
        ]);
    }

    public function show($id)
    {
        $libro = Libro::with([
            'autor',
            'categoria',
            'coleccion',
            'ubicacion',
            'registradoPor',
            'prestamoActivo.prestadoPor'
        ])->findOrFail($id);

        $stockInfo = [
            'stock_total' => $libro->stock_total,
            'stock_disponible' => $libro->stock_disponible,
            'stock_prestado' => $libro->stock_prestado,
            'stock_perdido' => $libro->stock_perdido,
        ];

        return response()->json([
            'libro' => $libro,
            'stock_info' => $stockInfo
        ]);
    }

    public function destroy($id)
    {
        $libro = Libro::findOrFail($id);

        if ($libro->prestamos()->where('estado', 'activo')->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar esta copia porque tiene un préstamo activo'
            ], 422);
        }

        $titulo = $libro->titulo;
        $autorId = $libro->autor_id;
        $libro->delete();

        $stockRestante = Libro::where('titulo', $titulo)->where('autor_id', $autorId)->count();

        return response()->json([
            'message' => $stockRestante > 0
                ? "Copia eliminada. Quedan {$stockRestante} copias."
                : "Última copia eliminada. El libro ya no está en el catálogo.",
            'stock_restante' => $stockRestante
        ]);
    }

    public function verCopias(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'titulo' => 'required|string',
            'autor_id' => 'required|exists:autores,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $copias = Libro::where('titulo', $request->titulo)
            ->where('autor_id', $request->autor_id)
            ->with(['ubicacion', 'coleccion', 'prestamoActivo.prestadoPor'])
            ->orderByRaw("FIELD(estado_actual, 'en biblioteca', 'prestado', 'perdido', 'biblioteca comunitaria')")
            ->orderBy('codigo_inventario', 'asc')
            ->get();

        return response()->json([
            'total_copias' => $copias->count(),
            'disponibles' => $copias->where('estado_actual', 'en biblioteca')->count(),
            'prestadas' => $copias->where('estado_actual', 'prestado')->count(),
            'perdidas' => $copias->where('estado_actual', 'perdido')->count(),
            'copias' => $copias
        ]);
    }

    /**
     * Carga masiva completa - CORREGIDO para años históricos
     */
    public function cargaMasiva(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'archivo' => 'required|file|mimes:xlsx,xls,csv'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $file = $request->file('archivo');
            $spreadsheet = IOFactory::load($file->getPathname());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();

            $registrados = [];
            $sinDatos = [];
            $errores = [];

            // Empezar desde la fila 2 (fila 1 es encabezado)
            for ($i = 1; $i < count($rows); $i++) {
                $row = $rows[$i];

                // ===== EXTRAER TODOS LOS CAMPOS =====
                $titulo = trim($row[0] ?? '');
                $autorNombre = trim($row[1] ?? '');
                $categoriaNombre = trim($row[2] ?? '') ?: 'Sin categoría';

                $tipoItem = trim($row[3] ?? '') ?: 'libro';
                $isbn = trim($row[4] ?? '') ?: null;
                $issn = trim($row[5] ?? '') ?: null;
                $coleccionNombre = trim($row[6] ?? '') ?: null;

                $clasificacionCdd = trim($row[7] ?? '') ?: null;
                $codigoCdd = trim($row[8] ?? '') ?: null;
                $signatura = trim($row[9] ?? '') ?: null;

                $editorial = trim($row[10] ?? '') ?: null;
                $anio = $row[11] ?? null;
                $idioma = trim($row[12] ?? '') ?: 'Español';

                $precio = $row[13] ?? null;

                $numeroPaginas = $row[14] ?? null;
                $tamanio = trim($row[15] ?? '') ?: null;
                $colorForro = trim($row[16] ?? '') ?: null;

                $resumen = trim($row[17] ?? '') ?: null;
                $notas = trim($row[18] ?? '') ?: null;

                $procedencia = trim($row[19] ?? '') ?: null;
                $estadoLibro = trim($row[20] ?? '') ?: 'normal';

                // ===== VALIDACIÓN DE DATOS MÍNIMOS =====
                if (empty($titulo) || empty($autorNombre)) {
                    $sinDatos[] = [
                        'fila' => $i + 1,
                        'titulo' => $titulo ?: 'Sin título',
                        'autor' => $autorNombre ?: 'Sin autor',
                        'error' => 'Faltan campos obligatorios (Título y Autor)'
                    ];
                    continue;
                }

                try {
                    // ===== BUSCAR O CREAR RELACIONES =====
                    $autor = Autor::firstOrCreate(['nombre' => $autorNombre]);
                    $categoria = Categoria::firstOrCreate(['nombre' => $categoriaNombre]);

                    $coleccionId = null;
                    if ($coleccionNombre) {
                        $coleccion = Coleccion::firstOrCreate(['nombre' => $coleccionNombre]);
                        $coleccionId = $coleccion->id;
                    }

                    // ===== VALIDAR Y LIMPIAR DATOS =====

                    // ⚠️ CORRECCIÓN: Año de publicación - Permitir desde 1000 hasta año actual + 10
                    $anioValido = null;
                    if ($anio && is_numeric($anio)) {
                        $anioNum = intval($anio);
                        // ✅ Rango ampliado: 1000 - (año actual + 10)
                        if ($anioNum >= 1000 && $anioNum <= (date('Y') + 10)) {
                            $anioValido = $anioNum;
                        }
                    }

                    // ISBN único
                    if ($isbn && Libro::where('isbn', $isbn)->exists()) {
                        $isbn = null;
                    }

                    // ISSN único
                    if ($issn && Libro::where('issn', $issn)->exists()) {
                        $issn = null;
                    }

                    // Validar tipo de item
                    $tiposValidos = ['libro', 'folleto', 'traduccion', 'revista', 'tesis', 'manual', 'diccionario', 'otro'];
                    if (!in_array($tipoItem, $tiposValidos)) {
                        $tipoItem = 'libro';
                    }

                    // Validar clasificación CDD
                    $cddValidos = ['000', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
                    if ($clasificacionCdd && !in_array($clasificacionCdd, $cddValidos)) {
                        $clasificacionCdd = null;
                    }

                    // Validar tamaño
                    $tamaniosValidos = ['pequeño', 'mediano', 'grande'];
                    if ($tamanio && !in_array($tamanio, $tamaniosValidos)) {
                        $tamanio = null;
                    }

                    // Validar procedencia
                    $procedenciasValidas = ['ministerio de cultura', 'donaciones'];
                    if ($procedencia && !in_array($procedencia, $procedenciasValidas)) {
                        $procedencia = null;
                    }

                    // Validar estado del libro
                    $estadosValidos = ['nuevo', 'normal', 'mal estado'];
                    if (!in_array($estadoLibro, $estadosValidos)) {
                        $estadoLibro = 'normal';
                    }

                    // Validar número de páginas
                    $paginasValidas = null;
                    if ($numeroPaginas && is_numeric($numeroPaginas) && $numeroPaginas > 0) {
                        $paginasValidas = intval($numeroPaginas);
                    }

                    // Validar precio
                    $precioValido = null;
                    if ($precio && is_numeric($precio) && $precio >= 0) {
                        $precioValido = floatval($precio);
                    }

                    // ===== CREAR LIBRO CON TODOS LOS CAMPOS =====
                    $libro = Libro::create([
                        'titulo' => $titulo,
                        'autor_id' => $autor->id,
                        'categoria_id' => $categoria->id,

                        'tipo_item' => $tipoItem,
                        'isbn' => $isbn,
                        'issn' => $issn,
                        'coleccion_id' => $coleccionId,
                        'codigo_inventario' => Libro::generarCodigoInventario(),

                        'clasificacion_cdd' => $clasificacionCdd,
                        'codigo_cdd' => $codigoCdd,
                        'signatura' => $signatura,

                        'editorial' => $editorial,
                        'anio_publicacion' => $anioValido, // ✅ Ya validado correctamente
                        'idioma' => $idioma,

                        'precio' => $precioValido,

                        'numero_paginas' => $paginasValidas,
                        'tamanio' => $tamanio,
                        'color_forro' => $colorForro,

                        'resumen' => $resumen,
                        'notas' => $notas,

                        'procedencia' => $procedencia,
                        'estado_libro' => $estadoLibro,
                        'destino_mal_estado' => 'n/a',
                        'estado_actual' => 'en biblioteca',
                        'tipo_prestamo' => 'n/a',

                        'registrado_por' => session("user_id")
                    ]);

                    $registrados[] = [
                        'fila' => $i + 1,
                        'titulo' => $titulo,
                        'libro_id' => $libro->id,
                        'codigo_inventario' => $libro->codigo_inventario
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
                'message' => 'Carga masiva procesada con éxito',
                'resumen' => [
                    'total_procesados' => count($rows) - 1,
                    'registrados' => count($registrados),
                    'sin_datos' => count($sinDatos),
                    'errores' => count($errores)
                ],
                'registrados' => $registrados,
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

    public function buscarCopiaDisponible(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'titulo' => 'required|string',
            'autor_id' => 'required|exists:autores,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $copiaDisponible = Libro::obtenerPrimeraCopiaDisponible($request->titulo, $request->autor_id);

        if (!$copiaDisponible) {
            return response()->json([
                'message' => 'No hay copias disponibles',
                'disponible' => false
            ], 404);
        }

        return response()->json([
            'disponible' => true,
            'copia' => $copiaDisponible->load(['ubicacion', 'coleccion'])
        ]);
    }

    public function estadisticasStock()
    {
        $stats = [
            'total_titulos_unicos' => Libro::select('titulo', 'autor_id')
                ->groupBy('titulo', 'autor_id')
                ->get()
                ->count(),
            'total_copias_fisicas' => Libro::count(),
            'copias_disponibles' => Libro::where('estado_actual', 'en biblioteca')->count(),
            'copias_prestadas' => Libro::where('estado_actual', 'prestado')->count(),
            'copias_perdidas' => Libro::where('estado_actual', 'perdido')->count(),
        ];

        return response()->json($stats);
    }
}
