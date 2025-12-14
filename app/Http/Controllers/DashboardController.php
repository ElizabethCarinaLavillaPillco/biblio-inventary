<?php

namespace App\Http\Controllers;

use App\Models\Libro;
use App\Models\Prestamo;
use App\Models\Autor;
use App\Models\Categoria;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            // =================== STATS GENERALES ===================
            $stats = [
                'total_libros' => Libro::count(),
                'libros_disponibles' => Libro::where('estado_actual', 'en biblioteca')->count(),
                'libros_prestados' => Libro::where('estado_actual', 'prestado')->count(),
                'libros_perdidos' => Libro::where('estado_actual', 'perdido')->count(),
                'libros_comunidad' => Libro::where('estado_actual', 'biblioteca comunitaria')->count(),
                'total_autores' => Autor::count(),
                'total_categorias' => Categoria::count(),
                'prestamos_activos' => Prestamo::where('estado', 'activo')->count(),
                'prestamos_devueltos' => Prestamo::where('estado', 'devuelto')->count(),
                'prestamos_perdidos' => Prestamo::where('estado', 'perdido')->count(),
                'prestamos_vencidos' => Prestamo::where('estado', 'activo')
                    ->whereDate('fecha_fin', '<', now())
                    ->count(),
                'total_usuarios' => User::where('activo', true)->count(),
            ];

            // =================== STATS DEL MES ===================
            $mesActual = Carbon::now()->month;
            $anioActual = Carbon::now()->year;
            
            $stats_mes = [
                'prestamos_por_mes' => Prestamo::whereMonth('created_at', $mesActual)
                    ->whereYear('created_at', $anioActual)
                    ->count(),
                'devoluciones_mes' => Prestamo::where('estado', 'devuelto')
                    ->whereMonth('fecha_devolucion', $mesActual)
                    ->whereYear('fecha_devolucion', $anioActual)
                    ->count(),
                'libros_registrados_mes' => Libro::whereMonth('created_at', $mesActual)
                    ->whereYear('created_at', $anioActual)
                    ->count(),
            ];

            // =================== PRÉSTAMOS POR MES (ÚLTIMOS 6 MESES) ===================
            $prestamosPorMes = [];
            for ($i = 5; $i >= 0; $i--) {
                $mes = Carbon::now()->subMonths($i);
                $total = Prestamo::whereMonth('created_at', $mes->month)
                    ->whereYear('created_at', $mes->year)
                    ->count();
                
                $prestamosPorMes[] = [
                    'mes' => $mes->locale('es')->monthName,
                    'total' => $total,
                ];
            }

            // =================== LIBROS MÁS PRESTADOS (TOP 5) ===================
            $librosMasPrestados = Libro::with(['autor'])
                ->withCount(['prestamos' => function($query) {
                    $query->whereIn('estado', ['devuelto', 'activo']);
                }])
                ->having('prestamos_count', '>', 0)
                ->orderBy('prestamos_count', 'desc')
                ->take(5)
                ->get();

            // =================== CATEGORÍAS POPULARES (TOP 5) ===================
            $categoriasPopulares = Categoria::withCount('libros')
                ->having('libros_count', '>', 0)
                ->orderBy('libros_count', 'desc')
                ->take(5)
                ->get();

            // =================== ÚLTIMOS LIBROS REGISTRADOS ===================
            $ultimosLibros = Libro::with(['autor', 'categoria', 'registradoPor'])
                ->latest()
                ->take(10)
                ->get();

            // =================== PRÉSTAMOS ACTIVOS RECIENTES ===================
            $prestamosRecientes = Prestamo::with(['libro'])
                ->where('estado', 'activo')
                ->latest()
                ->take(10)
                ->get();

            // =================== PRÉSTAMOS POR TIPO (ESTE MES) ===================
            $prestamosPorTipo = Prestamo::select('tipo_prestamo', DB::raw('COUNT(*) as total'))
                ->whereMonth('created_at', $mesActual)
                ->whereYear('created_at', $anioActual)
                ->groupBy('tipo_prestamo')
                ->get()
                ->map(function($item) {
                    return [
                        'tipo_prestamo' => $item->tipo_prestamo,
                        'total' => $item->total
                    ];
                });

            return response()->json([
                'stats' => $stats,
                'stats_mes' => $stats_mes,
                'prestamos_por_mes' => $prestamosPorMes,
                'libros_mas_prestados' => $librosMasPrestados,
                'categorias_populares' => $categoriasPopulares,
                'ultimos_libros' => $ultimosLibros,
                'prestamos_recientes' => $prestamosRecientes,
                'prestamos_por_tipo' => $prestamosPorTipo,
                'success' => true,
                'message' => 'Datos del dashboard cargados correctamente'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error en Dashboard: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al cargar el dashboard',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }
}