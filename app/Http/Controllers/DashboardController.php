<?php

namespace App\Http\Controllers;

use App\Models\Libro;
use App\Models\Prestamo;
use App\Models\Autor;
use App\Models\Categoria;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_libros' => Libro::count(),
            'libros_disponibles' => Libro::where('estado_actual', 'en biblioteca')->count(),
            'libros_prestados' => Libro::where('estado_actual', 'prestado')->count(),
            'libros_perdidos' => Libro::where('estado_actual', 'perdido')->count(),
            'total_autores' => Autor::count(),
            'total_categorias' => Categoria::count(),
            'prestamos_activos' => Prestamo::where('estado', 'activo')->count(),
            'prestamos_vencidos' => Prestamo::where('estado', 'activo')
                ->whereDate('fecha_fin', '<', now())
                ->count(),
        ];

        // Últimos libros registrados
        $ultimos_libros = Libro::with(['autor', 'categoria'])
            ->latest()
            ->take(5)
            ->get();

        // Préstamos activos recientes
        $prestamos_recientes = Prestamo::with(['libro', 'prestadoPor'])
            ->where('estado', 'activo')
            ->latest()
            ->take(5)
            ->get();

        // Libros por categoría
        $libros_por_categoria = Categoria::withCount('libros')
            ->having('libros_count', '>', 0)
            ->orderBy('libros_count', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'stats' => $stats,
            'ultimos_libros' => $ultimos_libros,
            'prestamos_recientes' => $prestamos_recientes,
            'libros_por_categoria' => $libros_por_categoria
        ]);
    }
}
