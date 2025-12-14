<?php

namespace App\Http\Controllers;

use App\Models\Libro;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class ExportacionController extends Controller
{
    /**
     * Exportar catálogo completo en formato CSV para BNP
     */
    public function exportarCSV()
    {
        try {
            $libros = Libro::with(['autor', 'categoria', 'ubicacion', 'coleccion'])
                ->get();

            $headers = [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename="catalogo_biblioteca_' . date('Y-m-d') . '.csv"',
            ];

            $callback = function() use ($libros) {
                $file = fopen('php://output', 'w');
                
                // BOM para UTF-8
                fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
                
                // Encabezados según estándar BNP
                fputcsv($file, [
                    'ID',
                    'Titulo',
                    'Autor',
                    'ISBN',
                    'ISSN',
                    'Tipo_Material',
                    'Clasificacion_Dewey',
                    'Codigo_Dewey',
                    'Editorial',
                    'Ano_Publicacion',
                    'Idioma',
                    'Numero_Paginas',
                    'Categoria',
                    'Coleccion',
                    'Estado_Fisico',
                    'Estado_Actual',
                    'Ubicacion',
                    'Precio',
                    'Procedencia',
                    'Fecha_Registro'
                ]);

                foreach ($libros as $libro) {
                    fputcsv($file, [
                        $libro->id,
                        $libro->titulo,
                        $libro->autor->nombre ?? '',
                        $libro->isbn ?? '',
                        $libro->issn ?? '',
                        $libro->tipo_item,
                        $libro->clasificacion_cdd ?? '',
                        $libro->codigo_cdd ?? '',
                        $libro->editorial ?? '',
                        $libro->anio_publicacion ?? '',
                        $libro->idioma ?? '',
                        $libro->numero_paginas ?? '',
                        $libro->categoria->nombre ?? '',
                        $libro->coleccion->nombre ?? '',
                        $libro->estado_libro,
                        $libro->estado_actual,
                        $libro->ubicacion->codigo ?? '',
                        $libro->precio ?? '',
                        $libro->procedencia ?? '',
                        $libro->created_at->format('Y-m-d')
                    ]);
                }

                fclose($file);
            };

            return Response::stream($callback, 200, $headers);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al generar exportación CSV',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Exportar en formato MARC21 (simplificado)
     */
    public function exportarMARC()
    {
        try {
            $libros = Libro::with(['autor', 'categoria', 'ubicacion', 'coleccion'])
                ->get();

            $marcContent = '';

            foreach ($libros as $libro) {
                $marcContent .= "=LDR  00000nam  2200000   4500\n";
                $marcContent .= "=001  " . str_pad($libro->id, 9, '0', STR_PAD_LEFT) . "\n";
                $marcContent .= "=005  " . date('YmdHis') . ".0\n";
                $marcContent .= "=008  " . date('ymd') . "s" . ($libro->anio_publicacion ?? '    ') . "    pe            000 0 spa d\n";
                
                // ISBN
                if ($libro->isbn) {
                    $marcContent .= "=020  \$a{$libro->isbn}\n";
                }
                
                // ISSN
                if ($libro->issn) {
                    $marcContent .= "=022  \$a{$libro->issn}\n";
                }
                
                // Clasificación Dewey
                if ($libro->clasificacion_cdd || $libro->codigo_cdd) {
                    $marcContent .= "=082  \$a" . ($libro->codigo_cdd ?? $libro->clasificacion_cdd) . "\n";
                }
                
                // Autor
                if ($libro->autor) {
                    $marcContent .= "=100  1\$a{$libro->autor->nombre}\n";
                }
                
                // Título
                $marcContent .= "=245  10\$a{$libro->titulo}\n";
                
                // Editorial, año, páginas
                $publicacion = '';
                if ($libro->editorial) $publicacion .= "\$b{$libro->editorial}";
                if ($libro->anio_publicacion) $publicacion .= "\$c{$libro->anio_publicacion}";
                if ($publicacion) {
                    $marcContent .= "=260  \$aPeru" . $publicacion . "\n";
                }
                
                // Descripción física
                if ($libro->numero_paginas) {
                    $marcContent .= "=300  \$a{$libro->numero_paginas} p.\n";
                }
                
                // Notas
                if ($libro->resumen) {
                    $marcContent .= "=520  \$a{$libro->resumen}\n";
                }
                
                $marcContent .= "\n";
            }

            return Response::make($marcContent, 200, [
                'Content-Type' => 'text/plain; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename="catalogo_marc21_' . date('Y-m-d') . '.mrc"',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al generar exportación MARC',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Exportar estadísticas para reportes BNP
     */
    public function exportarEstadisticas()
    {
        try {
            $stats = [
                'fecha_reporte' => date('Y-m-d H:i:s'),
                'biblioteca' => config('app.name', 'BiblioSystem'),
                'total_materiales' => Libro::count(),
                
                'por_tipo' => Libro::select('tipo_item', \DB::raw('count(*) as total'))
                    ->groupBy('tipo_item')
                    ->get()
                    ->pluck('total', 'tipo_item'),
                
                'por_clasificacion_dewey' => Libro::select('clasificacion_cdd', \DB::raw('count(*) as total'))
                    ->whereNotNull('clasificacion_cdd')
                    ->groupBy('clasificacion_cdd')
                    ->get()
                    ->pluck('total', 'clasificacion_cdd'),
                
                'por_idioma' => Libro::select('idioma', \DB::raw('count(*) as total'))
                    ->whereNotNull('idioma')
                    ->groupBy('idioma')
                    ->get()
                    ->pluck('total', 'idioma'),
                
                'por_estado_fisico' => Libro::select('estado_libro', \DB::raw('count(*) as total'))
                    ->groupBy('estado_libro')
                    ->get()
                    ->pluck('total', 'estado_libro'),
                
                'por_estado_actual' => Libro::select('estado_actual', \DB::raw('count(*) as total'))
                    ->groupBy('estado_actual')
                    ->get()
                    ->pluck('total', 'estado_actual'),
                
                'con_isbn' => Libro::whereNotNull('isbn')->count(),
                'con_issn' => Libro::whereNotNull('issn')->count(),
                'con_clasificacion_dewey' => Libro::whereNotNull('clasificacion_cdd')->count(),
                
                'antiguedad' => [
                    'antes_1900' => Libro::where('anio_publicacion', '<', 1900)->count(),
                    '1900_1949' => Libro::whereBetween('anio_publicacion', [1900, 1949])->count(),
                    '1950_1999' => Libro::whereBetween('anio_publicacion', [1950, 1999])->count(),
                    '2000_2024' => Libro::whereBetween('anio_publicacion', [2000, 2024])->count(),
                    '2025_adelante' => Libro::where('anio_publicacion', '>=', 2025)->count(),
                ],
            ];

            return Response::json($stats, 200, [], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al generar estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Exportar listado simple en Excel
     */
    public function exportarExcel()
    {
        try {
            $libros = Libro::with(['autor', 'categoria'])->get();

            $headers = [
                'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename="catalogo_biblioteca_' . date('Y-m-d') . '.xls"',
            ];

            $callback = function() use ($libros) {
                echo "\xEF\xBB\xBF"; // UTF-8 BOM
                echo "<table border='1'>";
                echo "<tr>";
                echo "<th>ID</th>";
                echo "<th>Título</th>";
                echo "<th>Autor</th>";
                echo "<th>ISBN</th>";
                echo "<th>Categoría</th>";
                echo "<th>Estado</th>";
                echo "</tr>";

                foreach ($libros as $libro) {
                    echo "<tr>";
                    echo "<td>{$libro->id}</td>";
                    echo "<td>{$libro->titulo}</td>";
                    echo "<td>" . ($libro->autor->nombre ?? '') . "</td>";
                    echo "<td>{$libro->isbn}</td>";
                    echo "<td>" . ($libro->categoria->nombre ?? '') . "</td>";
                    echo "<td>{$libro->estado_actual}</td>";
                    echo "</tr>";
                }

                echo "</table>";
            };

            return Response::stream($callback, 200, $headers);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al generar exportación Excel',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}