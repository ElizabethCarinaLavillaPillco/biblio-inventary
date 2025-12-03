<?php

namespace App\Http\Controllers;

use App\Models\Libro;
use App\Models\Prestamo;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExportacionController extends Controller
{
    /**
     * Exportar catálogo en formato MARC21 simplificado
     */
    public function exportarMARC21()
    {
        $libros = Libro::with(['autor', 'categoria', 'ubicacion'])->get();
        
        $marc = "";
        
        foreach ($libros as $libro) {
            // MARC21 básico - campos mínimos
            $marc .= "=LDR  00000nam  2200000Ia 4500\n";
            $marc .= "=001  BIB{$libro->id}\n";
            $marc .= "=020  \\\\$a{$libro->isbn}\n"; // ISBN
            $marc .= "=100  1\\$a{$libro->autor->nombre}\n"; // Autor principal
            $marc .= "=245  10$a{$libro->titulo}\n"; // Título
            $marc .= "=260  \\\\$b{$libro->editorial}$c{$libro->anio_publicacion}\n"; // Editorial y año
            $marc .= "=300  \\\\$a{$libro->numero_paginas} p.\n"; // Páginas
            $marc .= "=650  \\4$a{$libro->categoria->nombre}\n"; // Materia
            $marc .= "=852  \\\\$a{$libro->ubicacion?->codigo}$h{$libro->signatura}\n"; // Ubicación
            $marc .= "=942  \\\\$c{$libro->estado_actual}\n"; // Estado
            $marc .= "\n";
        }
        
        return response($marc, 200, [
            'Content-Type' => 'text/plain',
            'Content-Disposition' => 'attachment; filename="catalogo_marc21_' . now()->format('Y-m-d') . '.mrc"',
        ]);
    }

    /**
     * Exportar catálogo en CSV estándar
     */
    public function exportarCSV()
    {
        $libros = Libro::with(['autor', 'categoria', 'ubicacion', 'registradoPor'])->get();
        
        $csv = "ID,ISBN,Título,Autor,Categoría,Editorial,Año,Páginas,Signatura,Ubicación,Estado,Precio,Registrado Por,Fecha Registro\n";
        
        foreach ($libros as $libro) {
            $csv .= sprintf(
                "%d,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                $libro->id,
                $libro->isbn ?? '',
                str_replace(',', ';', $libro->titulo),
                str_replace(',', ';', $libro->autor->nombre),
                str_replace(',', ';', $libro->categoria->nombre),
                str_replace(',', ';', $libro->editorial ?? ''),
                $libro->anio_publicacion ?? '',
                $libro->numero_paginas ?? '',
                $libro->signatura ?? '',
                $libro->ubicacion?->codigo ?? '',
                $libro->estado_actual,
                $libro->precio ?? '0.00',
                $libro->registradoPor?->name ?? 'Sistema',
                $libro->created_at->format('Y-m-d')
            );
        }
        
        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="catalogo_' . now()->format('Y-m-d') . '.csv"',
        ]);
    }

    /**
     * Reporte estadístico para la BNP (Biblioteca Nacional del Perú)
     */
    public function reporteBNP(Request $request)
    {
        $anio = $request->anio ?? now()->year;
        
        $reporte = [
            'institucion' => [
                'nombre' => env('BIBLIOTECA_NOMBRE', 'Biblioteca Municipal'),
                'ubigeo' => env('BIBLIOTECA_UBIGEO', ''),
                'direccion' => env('BIBLIOTECA_DIRECCION', ''),
                'telefono' => env('BIBLIOTECA_TELEFONO', ''),
                'email' => env('BIBLIOTECA_EMAIL', ''),
            ],
            'coleccion' => [
                'total_titulos' => Libro::count(),
                'total_volumen' => Libro::count(), // Asumir 1 ejemplar por título
                'libros_disponibles' => Libro::where('estado_actual', 'en biblioteca')->count(),
                'libros_prestados' => Libro::where('estado_actual', 'prestado')->count(),
                'libros_perdidos' => Libro::where('estado_actual', 'perdido')->count(),
            ],
            'adquisiciones_anio' => [
                'total' => Libro::whereYear('created_at', $anio)->count(),
                'por_mes' => Libro::whereYear('created_at', $anio)
                    ->select(DB::raw('MONTH(created_at) as mes'), DB::raw('count(*) as total'))
                    ->groupBy('mes')
                    ->get(),
                'por_procedencia' => Libro::whereYear('created_at', $anio)
                    ->select('procedencia', DB::raw('count(*) as total'))
                    ->groupBy('procedencia')
                    ->get(),
            ],
            'servicios_anio' => [
                'total_prestamos' => Prestamo::whereYear('created_at', $anio)->count(),
                'prestamos_domicilio' => Prestamo::whereYear('created_at', $anio)
                    ->where('tipo_prestamo', 'a domicilio')->count(),
                'prestamos_sala' => Prestamo::whereYear('created_at', $anio)
                    ->where('tipo_prestamo', 'en biblioteca')->count(),
                'usuarios_activos' => Prestamo::whereYear('created_at', $anio)
                    ->distinct('dni')->count('dni'),
                'libros_devueltos' => Prestamo::whereYear('created_at', $anio)
                    ->where('estado', 'devuelto')->count(),
                'libros_perdidos' => Prestamo::whereYear('created_at', $anio)
                    ->where('estado', 'perdido')->count(),
            ],
            'coleccion_por_categoria' => Categoria::withCount('libros')
                ->having('libros_count', '>', 0)
                ->orderBy('libros_count', 'desc')
                ->get(),
        ];

        return response()->json($reporte);
    }

    /**
     * Exportar reporte BNP a CSV
     */
    public function reporteBNPCSV(Request $request)
    {
        $reporte = $this->reporteBNP($request)->getData();
        
        $csv = "REPORTE ESTADÍSTICO ANUAL - BIBLIOTECA NACIONAL DEL PERÚ\n";
        $csv .= "Año: " . ($request->anio ?? now()->year) . "\n";
        $csv .= "Fecha de generación: " . now()->format('d/m/Y H:i') . "\n\n";
        
        $csv .= "DATOS DE LA INSTITUCIÓN\n";
        $csv .= "Nombre," . $reporte->institucion->nombre . "\n";
        $csv .= "Ubigeo," . $reporte->institucion->ubigeo . "\n";
        $csv .= "Dirección," . $reporte->institucion->direccion . "\n";
        $csv .= "Teléfono," . $reporte->institucion->telefono . "\n";
        $csv .= "Email," . $reporte->institucion->email . "\n\n";
        
        $csv .= "COLECCIÓN TOTAL\n";
        $csv .= "Total Títulos," . $reporte->coleccion->total_titulos . "\n";
        $csv .= "Disponibles," . $reporte->coleccion->libros_disponibles . "\n";
        $csv .= "Prestados," . $reporte->coleccion->libros_prestados . "\n";
        $csv .= "Perdidos," . $reporte->coleccion->libros_perdidos . "\n\n";
        
        $csv .= "SERVICIOS DEL AÑO\n";
        $csv .= "Total Préstamos," . $reporte->servicios_anio->total_prestamos . "\n";
        $csv .= "Préstamos a Domicilio," . $reporte->servicios_anio->prestamos_domicilio . "\n";
        $csv .= "Préstamos en Sala," . $reporte->servicios_anio->prestamos_sala . "\n";
        $csv .= "Usuarios Activos," . $reporte->servicios_anio->usuarios_activos . "\n\n";
        
        $csv .= "COLECCIÓN POR CATEGORÍA\n";
        $csv .= "Categoría,Cantidad\n";
        foreach ($reporte->coleccion_por_categoria as $cat) {
            $csv .= $cat->nombre . "," . $cat->libros_count . "\n";
        }
        
        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="reporte_bnp_' . ($request->anio ?? now()->year) . '.csv"',
        ]);
    }
}