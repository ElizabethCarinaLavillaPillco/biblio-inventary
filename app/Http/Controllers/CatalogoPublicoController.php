<?php

namespace App\Http\Controllers;

use App\Models\Libro;
use App\Models\Categoria;
use App\Models\Autor;
use App\Models\Coleccion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CatalogoPublicoController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Query base: solo libros que NO están perdidos ni en biblioteca comunitaria
            $query = Libro::with(['autor', 'categoria', 'coleccion'])
                ->whereNotIn('estado_actual', ['perdido', 'biblioteca comunitaria']);

            // Búsqueda general
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('titulo', 'like', "%{$search}%")
                      ->orWhere('isbn', 'like', "%{$search}%")
                      ->orWhere('issn', 'like', "%{$search}%")
                      ->orWhere('codigo_cdd', 'like', "%{$search}%")
                      ->orWhereHas('autor', function($q) use ($search) {
                          $q->where('nombre', 'like', "%{$search}%");
                      });
                });
            }

            // Filtro por clasificación CDD
            if ($request->filled('clasificacion_cdd')) {
                $query->where('clasificacion_cdd', $request->clasificacion_cdd);
            }

            // Filtro por categoría
            if ($request->filled('categoria_id')) {
                $query->where('categoria_id', $request->categoria_id);
            }

            // Filtro por autor
            if ($request->filled('autor_id')) {
                $query->where('autor_id', $request->autor_id);
            }

            // Filtro por colección
            if ($request->filled('coleccion_id')) {
                $query->where('coleccion_id', $request->coleccion_id);
            }

            // Filtro por tipo de item
            if ($request->filled('tipo_item')) {
                $query->where('tipo_item', $request->tipo_item);
            }

            // Filtro por disponibilidad
            if ($request->filled('disponible')) {
                if ($request->disponible === 'true' || $request->disponible === true) {
                    $query->where('estado_actual', 'en biblioteca');
                }
            }

            // Ordenar por fecha de creación (más recientes primero)
            $query->orderBy('created_at', 'desc');

            // Limitar a 6 resultados
            $limit = $request->get('limit', 6);
            $libros = $query->limit($limit)->get();

            return response()->json([
                'data' => $libros,
                'total' => $libros->count(),
                'message' => 'Últimos libros registrados'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error en CatalogoPublicoController@index: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al cargar libros',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $libro = Libro::with([
                'autor',
                'categoria',
                'coleccion',
                'ubicacion'
            ])
            ->whereNotIn('estado_actual', ['perdido', 'biblioteca comunitaria'])
            ->findOrFail($id);

            $stockInfo = [
                'stock_total' => $libro->stock_total,
                'stock_disponible' => $libro->stock_disponible,
                'stock_prestado' => $libro->stock_prestado,
                'stock_perdido' => $libro->stock_perdido,
            ];

            // Verificar disponibilidad
            $disponibilidad = [
                'disponible' => $libro->estado_actual === 'en biblioteca',
                'fecha_estimada' => null,
            ];

            // Si está prestado, buscar fecha estimada
            if ($libro->estado_actual === 'prestado') {
                $prestamo = DB::table('prestamos')
                    ->where('libro_id', $libro->id)
                    ->where('estado', 'activo')
                    ->first();

                $disponibilidad['fecha_estimada'] = $prestamo ? $prestamo->fecha_fin : null;
            }

            return response()->json([
                'libro' => $libro,
                'disponibilidad' => $disponibilidad,
                'stock_info' => $stockInfo
            ]);

        } catch (\Exception $e) {
            \Log::error('Error en CatalogoPublicoController@show: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al cargar libro',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function categorias()
    {
        try {
            // Obtener categorías que tienen al menos un libro público
            $categorias = Categoria::select('categorias.*')
                ->join('libros', 'categorias.id', '=', 'libros.categoria_id')
                ->whereNotIn('libros.estado_actual', ['perdido', 'biblioteca comunitaria'])
                ->groupBy('categorias.id', 'categorias.nombre', 'categorias.created_at', 'categorias.updated_at')
                ->selectRaw('categorias.*, COUNT(libros.id) as libros_publicos_count')
                ->having('libros_publicos_count', '>', 0)
                ->orderBy('categorias.nombre')
                ->get();

            return response()->json($categorias);

        } catch (\Exception $e) {
            \Log::error('Error en CatalogoPublicoController@categorias: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al cargar categorías',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function clasificacionesCdd()
    {
        try {
            $clasificaciones = DB::table('libros')
                ->select('clasificacion_cdd')
                ->selectRaw('COUNT(*) as total')
                ->whereNotIn('estado_actual', ['perdido', 'biblioteca comunitaria'])
                ->whereNotNull('clasificacion_cdd')
                ->groupBy('clasificacion_cdd')
                ->get()
                ->map(function($item) {
                    $nombres = [
                        '000' => 'Ciencias de la Computación, Información y Obras Generales',
                        '100' => 'Filosofía y Psicología',
                        '200' => 'Religión y Teología',
                        '300' => 'Ciencias Sociales',
                        '400' => 'Lenguas',
                        '500' => 'Ciencias Naturales y Matemáticas',
                        '600' => 'Tecnología y Ciencias Aplicadas',
                        '700' => 'Artes y Recreación',
                        '800' => 'Literatura',
                        '900' => 'Historia y Geografía'
                    ];

                    return [
                        'codigo' => $item->clasificacion_cdd,
                        'nombre' => $nombres[$item->clasificacion_cdd] ?? 'Sin nombre',
                        'total' => $item->total
                    ];
                });

            return response()->json($clasificaciones);

        } catch (\Exception $e) {
            \Log::error('Error en CatalogoPublicoController@clasificacionesCdd: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al cargar clasificaciones',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function autores()
    {
        try {
            $autores = Autor::select('autores.*')
                ->join('libros', 'autores.id', '=', 'libros.autor_id')
                ->whereNotIn('libros.estado_actual', ['perdido', 'biblioteca comunitaria'])
                ->groupBy('autores.id', 'autores.nombre', 'autores.created_at', 'autores.updated_at')
                ->selectRaw('autores.*, COUNT(libros.id) as libros_publicos_count')
                ->having('libros_publicos_count', '>', 0)
                ->orderBy('autores.nombre')
                ->get();

            return response()->json($autores);

        } catch (\Exception $e) {
            \Log::error('Error en CatalogoPublicoController@autores: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al cargar autores',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function colecciones()
    {
        try {
            // Verificar si la tabla colecciones existe
            if (!DB::getSchemaBuilder()->hasTable('colecciones')) {
                return response()->json([]);
            }

            $colecciones = Coleccion::select('colecciones.*')
                ->join('libros', 'colecciones.id', '=', 'libros.coleccion_id')
                ->whereNotIn('libros.estado_actual', ['perdido', 'biblioteca comunitaria'])
                ->groupBy('colecciones.id', 'colecciones.nombre', 'colecciones.created_at', 'colecciones.updated_at')
                ->selectRaw('colecciones.*, COUNT(libros.id) as libros_publicos_count')
                ->having('libros_publicos_count', '>', 0)
                ->orderBy('colecciones.nombre')
                ->get();

            return response()->json($colecciones);

        } catch (\Exception $e) {
            \Log::error('Error en CatalogoPublicoController@colecciones: ' . $e->getMessage());
            // Si falla, retornar array vacío en lugar de error
            return response()->json([]);
        }
    }

    public function estadisticas()
    {
        try {
            $stats = [
                'total_libros' => DB::table('libros')
                    ->whereNotIn('estado_actual', ['perdido', 'biblioteca comunitaria'])
                    ->count(),

                'libros_disponibles' => DB::table('libros')
                    ->where('estado_actual', 'en biblioteca')
                    ->count(),

                'total_autores' => DB::table('autores')
                    ->whereExists(function($query) {
                        $query->select(DB::raw(1))
                            ->from('libros')
                            ->whereColumn('libros.autor_id', 'autores.id')
                            ->whereNotIn('libros.estado_actual', ['perdido', 'biblioteca comunitaria']);
                    })
                    ->count(),

                'total_categorias' => DB::table('categorias')
                    ->whereExists(function($query) {
                        $query->select(DB::raw(1))
                            ->from('libros')
                            ->whereColumn('libros.categoria_id', 'categorias.id')
                            ->whereNotIn('libros.estado_actual', ['perdido', 'biblioteca comunitaria']);
                    })
                    ->count(),

                'total_colecciones' => 0, // Por defecto 0
            ];

            // Contar colecciones solo si la tabla existe
            if (DB::getSchemaBuilder()->hasTable('colecciones')) {
                $stats['total_colecciones'] = DB::table('colecciones')
                    ->whereExists(function($query) {
                        $query->select(DB::raw(1))
                            ->from('libros')
                            ->whereColumn('libros.coleccion_id', 'colecciones.id')
                            ->whereNotIn('libros.estado_actual', ['perdido', 'biblioteca comunitaria']);
                    })
                    ->count();
            }

            return response()->json($stats);

        } catch (\Exception $e) {
            \Log::error('Error en CatalogoPublicoController@estadisticas: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al cargar estadísticas',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function exportar($id, $formato)
    {
        try {
            $libro = Libro::with(['autor', 'categoria', 'coleccion'])
                ->whereNotIn('estado_actual', ['perdido', 'biblioteca comunitaria'])
                ->findOrFail($id);

            switch ($formato) {
                case 'bibtex':
                    return $this->exportarBibTeX($libro);
                case 'ris':
                    return $this->exportarRIS($libro);
                default:
                    return response()->json(['message' => 'Formato no soportado'], 400);
            }

        } catch (\Exception $e) {
            \Log::error('Error en CatalogoPublicoController@exportar: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al exportar',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function exportarBibTeX($libro)
    {
        $tipo = $libro->tipo_item === 'libro' ? 'book' : 'misc';
        $key = strtolower(str_replace(' ', '', $libro->autor->nombre ?? 'desconocido')) . ($libro->anio_publicacion ?? 'nd');

        $bibtex = "@{$tipo}{{$key},\n";
        $bibtex .= "  title = {{{$libro->titulo}}},\n";
        if ($libro->autor) {
            $bibtex .= "  author = {{{$libro->autor->nombre}}},\n";
        }
        if ($libro->anio_publicacion) {
            $bibtex .= "  year = {{{$libro->anio_publicacion}}},\n";
        }
        if ($libro->editorial) {
            $bibtex .= "  publisher = {{{$libro->editorial}}},\n";
        }
        if ($libro->isbn) {
            $bibtex .= "  isbn = {{{$libro->isbn}}},\n";
        }
        $bibtex .= "}\n";

        return response($bibtex)
            ->header('Content-Type', 'application/x-bibtex')
            ->header('Content-Disposition', "attachment; filename=\"{$key}.bib\"");
    }

    private function exportarRIS($libro)
    {
        $ris = "TY  - BOOK\n";
        $ris .= "TI  - {$libro->titulo}\n";
        if ($libro->autor) {
            $ris .= "AU  - {$libro->autor->nombre}\n";
        }
        if ($libro->anio_publicacion) {
            $ris .= "PY  - {$libro->anio_publicacion}\n";
        }
        if ($libro->editorial) {
            $ris .= "PB  - {$libro->editorial}\n";
        }
        if ($libro->isbn) {
            $ris .= "SN  - {$libro->isbn}\n";
        }
        $ris .= "ER  - \n";

        return response($ris)
            ->header('Content-Type', 'application/x-research-info-systems')
            ->header('Content-Disposition', "attachment; filename=\"libro-{$libro->id}.ris\"");
    }
}
