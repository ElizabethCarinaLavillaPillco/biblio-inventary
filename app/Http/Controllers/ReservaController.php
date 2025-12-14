<?php

namespace App\Http\Controllers;

use App\Models\Prestamo;
use App\Models\Libro;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReservaController extends Controller
{
    public function crearReserva(Request $request)
    {
        $clienteId = Session::get('cliente_id');
        
        if (!$clienteId) {
            return response()->json(['message' => 'Debe iniciar sesión para hacer una reserva'], 401);
        }

        $validator = Validator::make($request->all(), [
            'libro_id' => 'required|exists:libros,id',
            'fecha_inicio' => 'required|date|after_or_equal:today',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'tipo_prestamo' => 'required|in:en biblioteca,a domicilio',
            'garantia' => 'required_if:tipo_prestamo,a domicilio|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $cliente = Cliente::findOrFail($clienteId);
        $libro = Libro::findOrFail($request->libro_id);

        // Verificar si el cliente puede reservar
        $puedeReservar = $cliente->puedeReservarLibro($request->libro_id);
        
        if (!$puedeReservar['puede']) {
            return response()->json([
                'message' => $puedeReservar['mensaje']
            ], 422);
        }

        // Verificar disponibilidad del libro
        if (!$libro->estaDisponible()) {
            $fechaEstimada = $libro->getFechaDisponibilidadEstimada();
            
            // Verificar si la fecha solicitada es después de la fecha estimada de disponibilidad
            if ($fechaEstimada && Carbon::parse($request->fecha_inicio)->lessThan($fechaEstimada)) {
                return response()->json([
                    'message' => "El libro no estará disponible hasta el " . $fechaEstimada->format('d/m/Y') . " (fecha estimada). Por favor, selecciona una fecha posterior.",
                    'fecha_estimada' => $fechaEstimada->format('Y-m-d')
                ], 422);
            }
        }

        try {
            DB::beginTransaction();

            // Calcular días
            $totalDias = Carbon::parse($request->fecha_inicio)->diffInDays(Carbon::parse($request->fecha_fin));

            // Crear la reserva/préstamo
            $prestamo = Prestamo::create([
                'libro_id' => $request->libro_id,
                'cliente_id' => $clienteId,
                'nombres' => $cliente->nombres,
                'apellidos' => $cliente->apellidos,
                'dni' => $cliente->dni,
                'fecha_nacimiento' => $cliente->fecha_nacimiento,
                'edad' => $cliente->edad,
                'telefono' => $cliente->telefono,
                'domicilio' => $cliente->domicilio,
                'fecha_inicio' => $request->fecha_inicio,
                'fecha_fin' => $request->fecha_fin,
                'total_dias' => $totalDias,
                'garantia' => $request->garantia ?? 'N/A',
                'tipo_prestamo' => $request->tipo_prestamo,
                'estado' => 'pendiente',
                'prestado_por' => null, // Se asignará cuando el bibliotecario apruebe
            ]);

            DB::commit();

            $prestamo->load(['libro.autor', 'cliente']);

            return response()->json([
                'message' => '¡Reserva creada exitosamente! El bibliotecario revisará tu solicitud.',
                'prestamo' => $prestamo
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear la reserva',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function misReservas()
    {
        $clienteId = Session::get('cliente_id');
        
        if (!$clienteId) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $reservas = Prestamo::with(['libro.autor', 'prestadoPor', 'recibidoPor'])
            ->where('cliente_id', $clienteId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($reservas);
    }

    public function detalleReserva($id)
    {
        $clienteId = Session::get('cliente_id');
        
        if (!$clienteId) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $reserva = Prestamo::with([
            'libro.autor',
            'libro.categoria',
            'libro.coleccion',
            'prestadoPor',
            'recibidoPor'
        ])
        ->where('cliente_id', $clienteId)
        ->findOrFail($id);

        return response()->json($reserva);
    }

    public function cancelarReserva($id)
    {
        $clienteId = Session::get('cliente_id');
        
        if (!$clienteId) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $reserva = Prestamo::where('cliente_id', $clienteId)
            ->where('id', $id)
            ->firstOrFail();

        // Solo se puede cancelar si está pendiente
        if ($reserva->estado !== 'pendiente') {
            return response()->json([
                'message' => 'Solo puedes cancelar reservas que están pendientes de aprobación'
            ], 422);
        }

        $reserva->update([
            'estado' => 'rechazado',
            'motivo_rechazo' => 'Cancelado por el cliente',
            'fecha_rechazo' => now()
        ]);

        return response()->json([
            'message' => 'Reserva cancelada exitosamente',
            'prestamo' => $reserva
        ]);
    }

    // Métodos para el bibliotecario
    public function listarReservasPendientes()
    {
        $reservas = Prestamo::with(['libro.autor', 'cliente'])
            ->where('estado', 'pendiente')
            ->orderBy('created_at', 'asc')
            ->paginate(50);

        return response()->json($reservas);
    }

    public function aprobarReserva(Request $request, $id)
    {
        $reserva = Prestamo::findOrFail($id);

        if ($reserva->estado !== 'pendiente') {
            return response()->json([
                'message' => 'Esta reserva ya fue procesada'
            ], 422);
        }

        $libro = $reserva->libro;

        try {
            DB::beginTransaction();

            // Actualizar reserva
            $reserva->update([
                'estado' => 'aprobado',
                'fecha_aprobacion' => now(),
                'prestado_por' => Session::get('user_id')
            ]);

            // Actualizar estado del libro
            $libro->update([
                'estado_actual' => 'prestado',
                'tipo_prestamo' => $reserva->tipo_prestamo
            ]);

            DB::commit();

            $reserva->load(['libro', 'cliente', 'prestadoPor']);

            return response()->json([
                'message' => 'Reserva aprobada exitosamente',
                'prestamo' => $reserva
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al aprobar la reserva',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function rechazarReserva(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'motivo_rechazo' => 'required|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $reserva = Prestamo::findOrFail($id);

        if ($reserva->estado !== 'pendiente') {
            return response()->json([
                'message' => 'Esta reserva ya fue procesada'
            ], 422);
        }

        $reserva->update([
            'estado' => 'rechazado',
            'motivo_rechazo' => $request->motivo_rechazo,
            'fecha_rechazo' => now()
        ]);

        return response()->json([
            'message' => 'Reserva rechazada',
            'prestamo' => $reserva
        ]);
    }

    public function iniciarPrestamo($id)
    {
        $reserva = Prestamo::findOrFail($id);

        if ($reserva->estado !== 'aprobado') {
            return response()->json([
                'message' => 'La reserva debe estar aprobada primero'
            ], 422);
        }

        $reserva->update(['estado' => 'en_curso']);

        return response()->json([
            'message' => 'Préstamo iniciado',
            'prestamo' => $reserva
        ]);
    }

    public function marcarVencido($id)
    {
        $reserva = Prestamo::findOrFail($id);

        if ($reserva->estado !== 'en_curso') {
            return response()->json([
                'message' => 'El préstamo debe estar en curso'
            ], 422);
        }

        // Calcular días de retraso
        $diasRetraso = now()->diffInDays($reserva->fecha_fin, false);
        
        if ($diasRetraso < 0) {
            $diasRetraso = abs($diasRetraso);
        } else {
            return response()->json([
                'message' => 'El préstamo aún no está vencido'
            ], 422);
        }

        $reserva->update([
            'estado' => 'en_falta',
            'dias_retraso' => $diasRetraso
        ]);

        // Opcional: sancionar automáticamente al cliente si tiene muchos días de retraso
        if ($diasRetraso > 30) {
            $cliente = $reserva->cliente;
            if ($cliente) {
                $cliente->update([
                    'sancionado' => true,
                    'fecha_fin_sancion' => now()->addMonths(3),
                    'motivo_sancion' => "Préstamo vencido por {$diasRetraso} días del libro: {$reserva->libro->titulo}"
                ]);
            }
        }

        return response()->json([
            'message' => 'Préstamo marcado como vencido',
            'prestamo' => $reserva,
            'dias_retraso' => $diasRetraso
        ]);
    }
}