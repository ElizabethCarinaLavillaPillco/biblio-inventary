<?php

namespace App\Http\Controllers;

use App\Models\Libro;
use App\Models\Categoria;
use App\Models\Autor;
use App\Models\Coleccion;
use Illuminate\Http\Request;

class CatalogoPublicoController extends Controller
{
    public function index(Request $request)
    {
        $query = Libro::with(['autor', 'categoria', 'coleccion'])
            ->publicos(); // Solo libros no perdidos ni en biblioteca comunitaria

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
                  })
                  ->orWhereHas('coleccion', function($q) use ($search) {
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
                $query->disponibles();
            }
        }

        // Filtro por año
        if ($request->filled('anio_desde')) {
            $query->where('anio_publicacion', '>=', $request->anio_desde);
        }
        if ($request->filled('anio_hasta')) {
            $query->where('anio_publicacion', '<=', $request->anio_hasta);
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'titulo');
        $sortOrder = $request->get('sort_order', 'asc');
        
        switch ($sortBy) {
            case 'titulo':
                $query->orderBy('titulo', $sortOrder);
                break;
            case 'autor':
                $query->join('autores', 'libros.autor_id', '=', 'autores.id')
                      ->orderBy('autores.nombre', $sortOrder)
                      ->select('libros.*');
                break;
            case 'anio':
                $query->orderBy('anio_publicacion', $sortOrder);
                break;
            default:
                $query->orderBy('titulo', $sortOrder);
        }

        $libros = $query->paginate(20);

        return response()->json($libros);
    }

    public function show($id)
    {
        $libro = Libro::with([
            'autor',
            'categoria',
            'coleccion',
            'ubicacion',
            'prestamoActivo.cliente'
        ])->publicos()->findOrFail($id);

        // Verificar disponibilidad y fecha estimada
        $disponibilidad = [
            'disponible' => $libro->estaDisponible(),
            'fecha_estimada' => $libro->getFechaDisponibilidadEstimada(),
        ];

        return response()->json([
            'libro' => $libro,
            'disponibilidad' => $disponibilidad
        ]);
    }

    public function categorias()
    {
        // Obtener categorías con conteo de libros públicos
        $categorias = Categoria::withCount(['libros as libros_publicos_count' => function($query) {
            $query->publicos();
        }])
        ->having('libros_publicos_count', '>', 0)
        ->orderBy('nombre')
        ->get();

        return response()->json($categorias);
    }

    public function clasificacionesCdd()
    {
        // Obtener clasificaciones CDD disponibles con conteo
        $clasificaciones = Libro::select('clasificacion_cdd')
            ->publicos()
            ->whereNotNull('clasificacion_cdd')
            ->groupBy('clasificacion_cdd')
            ->selectRaw('clasificacion_cdd, count(*) as total')
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
    }

    public function autores()
    {
        $autores = Autor::withCount(['libros as libros_publicos_count' => function($query) {
            $query->publicos();
        }])
        ->having('libros_publicos_count', '>', 0)
        ->orderBy('nombre')
        ->get();

        return response()->json($autores);
    }

    public function colecciones()
    {
        $colecciones = Coleccion::withCount(['libros as libros_publicos_count' => function($query) {
            $query->publicos();
        }])
        ->having('libros_publicos_count', '>', 0)
        ->orderBy('nombre')
        ->get();

        return response()->json($colecciones);
    }

    public function estadisticas()
    {
        $stats = [
            'total_libros' => Libro::publicos()->count(),
            'libros_disponibles' => Libro::disponibles()->count(),
            'total_autores' => Autor::has('libros')->count(),
            'total_categorias' => Categoria::has('libros')->count(),
            'total_colecciones' => Coleccion::has('libros')->count(),
        ];

        return response()->json($stats);
    }

    // Método para exportar en diferentes formatos bibliográficos
    public function exportar($id, $formato)
    {
        $libro = Libro::with(['autor', 'categoria', 'coleccion'])
            ->publicos()
            ->findOrFail($id);

        switch ($formato) {
            case 'bibtex':
                return $this->exportarBibTeX($libro);
            case 'dublin-core':
                return $this->exportarDublinCore($libro);
            case 'marcxml':
                return $this->exportarMARCXML($libro);
            case 'marc':
                return $this->exportarMARC($libro, false);
            case 'marc-utf8':
                return $this->exportarMARC($libro, true);
            case 'mods':
                return $this->exportarMODS($libro);
            case 'ris':
                return $this->exportarRIS($libro);
            default:
                return response()->json(['message' => 'Formato no soportado'], 400);
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
        if ($libro->numero_paginas) {
            $bibtex .= "  pages = {{{$libro->numero_paginas}}},\n";
        }
        $bibtex .= "}\n";

        return response($bibtex)
            ->header('Content-Type', 'application/x-bibtex')
            ->header('Content-Disposition', "attachment; filename=\"{$key}.bib\"");
    }

    private function exportarDublinCore($libro)
    {
        $xml = new \SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"></metadata>');
        
        $xml->addChild('dc:title', htmlspecialchars($libro->titulo), 'http://purl.org/dc/elements/1.1/');
        if ($libro->autor) {
            $xml->addChild('dc:creator', htmlspecialchars($libro->autor->nombre), 'http://purl.org/dc/elements/1.1/');
        }
        if ($libro->anio_publicacion) {
            $xml->addChild('dc:date', $libro->anio_publicacion, 'http://purl.org/dc/elements/1.1/');
        }
        if ($libro->editorial) {
            $xml->addChild('dc:publisher', htmlspecialchars($libro->editorial), 'http://purl.org/dc/elements/1.1/');
        }
        if ($libro->isbn) {
            $xml->addChild('dc:identifier', 'ISBN:' . $libro->isbn, 'http://purl.org/dc/elements/1.1/');
        }
        if ($libro->resumen) {
            $xml->addChild('dc:description', htmlspecialchars($libro->resumen), 'http://purl.org/dc/elements/1.1/');
        }
        $xml->addChild('dc:language', $libro->idioma ?? 'Español', 'http://purl.org/dc/elements/1.1/');
        $xml->addChild('dc:type', ucfirst($libro->tipo_item), 'http://purl.org/dc/elements/1.1/');

        return response($xml->asXML())
            ->header('Content-Type', 'application/xml')
            ->header('Content-Disposition', "attachment; filename=\"dublin-core-{$libro->id}.xml\"");
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
        if ($libro->resumen) {
            $ris .= "AB  - {$libro->resumen}\n";
        }
        $ris .= "LA  - " . ($libro->idioma ?? 'Español') . "\n";
        $ris .= "ER  - \n";

        return response($ris)
            ->header('Content-Type', 'application/x-research-info-systems')
            ->header('Content-Disposition', "attachment; filename=\"libro-{$libro->id}.ris\"");
    }

    // Simplificación de MARC y MODS (requeriría bibliotecas especializadas para implementación completa)
    private function exportarMARCXML($libro)
    {
        // Implementación simplificada
        return response()->json([
            'message' => 'La exportación MARCXML completa requiere implementación adicional',
            'libro' => $libro
        ]);
    }

    private function exportarMARC($libro, $utf8 = false)
    {
        return response()->json([
            'message' => 'La exportación MARC completa requiere implementación adicional',
            'libro' => $libro
        ]);
    }

    private function exportarMODS($libro)
    {
        return response()->json([
            'message' => 'La exportación MODS completa requiere implementación adicional',
            'libro' => $libro
        ]);
    }
}