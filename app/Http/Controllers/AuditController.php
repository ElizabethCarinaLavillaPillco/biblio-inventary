<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuditController extends Controller
{
    // Obtener logs de auditoría con filtros
    public function index(Request $request)
    {
        $query = AuditLog::with('user');

        // Filtros
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('modelo')) {
            $query->where('modelo', $request->modelo);
        }

        if ($request->filled('accion')) {
            $query->where('accion', $request->accion);
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('created_at', '>=', $request->fecha_desde);
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('created_at', '<=', $request->fecha_hasta);
        }

        $logs = $query->latest()->paginate(50);

        return response()->json($logs);
    }

    // Estadísticas de auditoría
    public function estadisticas(Request $request)
    {
        $fechaDesde = $request->fecha_desde ?? now()->subMonth();
        $fechaHasta = $request->fecha_hasta ?? now();

        $stats = [
            'total_acciones' => AuditLog::entreFechas($fechaDesde, $fechaHasta)->count(),
            'por_accion' => AuditLog::entreFechas($fechaDesde, $fechaHasta)
                ->select('accion', DB::raw('count(*) as total'))
                ->groupBy('accion')
                ->get(),
            'por_usuario' => AuditLog::with('user')
                ->entreFechas($fechaDesde, $fechaHasta)
                ->select('user_id', DB::raw('count(*) as total'))
                ->groupBy('user_id')
                ->orderBy('total', 'desc')
                ->limit(10)
                ->get(),
            'por_modelo' => AuditLog::entreFechas($fechaDesde, $fechaHasta)
                ->select('modelo', DB::raw('count(*) as total'))
                ->groupBy('modelo')
                ->get(),
        ];

        return response()->json($stats);
    }

    // Exportar logs a CSV
    public function exportar(Request $request)
    {
        $logs = AuditLog::with('user')
            ->when($request->fecha_desde, fn($q) => $q->whereDate('created_at', '>=', $request->fecha_desde))
            ->when($request->fecha_hasta, fn($q) => $q->whereDate('created_at', '<=', $request->fecha_hasta))
            ->latest()
            ->get();

        $csv = "Usuario,Acción,Modelo,ID Modelo,Fecha,IP\n";
        
        foreach ($logs as $log) {
            $csv .= sprintf(
                "%s,%s,%s,%s,%s,%s\n",
                $log->user ? $log->user->name : 'Sistema',
                $log->accion,
                $log->modelo,
                $log->modelo_id ?? 'N/A',
                $log->created_at->format('Y-m-d H:i:s'),
                $log->ip_address
            );
        }

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="auditoria_' . now()->format('Y-m-d') . '.csv"',
        ]);
    }
}