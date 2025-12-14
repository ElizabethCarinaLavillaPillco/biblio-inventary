<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use App\Traits\Auditable;

class Prestamo extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'libro_id',
        'cliente_id',
        'nombres',
        'apellidos',
        'dni',
        'fecha_nacimiento',
        'edad',
        'telefono',
        'domicilio',
        'fecha_inicio',
        'fecha_fin',
        'total_dias',
        'dias_retraso',
        'garantia',
        'tipo_prestamo',
        'estado',
        'fecha_devolucion',
        'fecha_aprobacion',
        'fecha_rechazo',
        'motivo_rechazo',
        'prestado_por',
        'recibido_por'
    ];

    protected $casts = [
        'fecha_nacimiento' => 'date',
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'fecha_devolucion' => 'date',
        'fecha_aprobacion' => 'datetime',
        'fecha_rechazo' => 'datetime',
        'edad' => 'integer',
        'total_dias' => 'integer',
        'dias_retraso' => 'integer',
    ];

    // Relaciones
    public function libro()
    {
        return $this->belongsTo(Libro::class);
    }

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function prestadoPor()
    {
        return $this->belongsTo(User::class, 'prestado_por');
    }

    public function recibidoPor()
    {
        return $this->belongsTo(User::class, 'recibido_por');
    }

    // Métodos auxiliares
    public static function calcularEdad($fechaNacimiento)
    {
        return Carbon::parse($fechaNacimiento)->age;
    }

    public static function calcularTotalDias($fechaInicio, $fechaFin)
    {
        return Carbon::parse($fechaInicio)->diffInDays(Carbon::parse($fechaFin));
    }

    public function getNombreCompletoAttribute()
    {
        return "{$this->nombres} {$this->apellidos}";
    }

    public function getEstadoColorAttribute()
    {
        return match($this->estado) {
            'pendiente' => 'info',
            'activo' => 'warning',
            'devuelto' => 'success',
            'perdido' => 'danger',
            'rechazado' => 'muted',
            default => 'info'
        };
    }

    public function getEstadoTextoAttribute()
    {
        return match($this->estado) {
            'pendiente' => 'Pendiente',
            'activo' => 'Activo',
            'devuelto' => 'Devuelto',
            'perdido' => 'Perdido',
            'rechazado' => 'Rechazado',
            default => 'Pendiente'
        };
    }

    public function isVencido()
    {
        if ($this->estado === 'activo') {
            return Carbon::now()->greaterThan($this->fecha_fin);
        }
        return false;
    }

    public function getDiasRestantesAttribute()
    {
        if ($this->estado === 'activo') {
            $dias = Carbon::now()->diffInDays($this->fecha_fin, false);
            return $dias > 0 ? $dias : 0;
        }
        return 0;
    }

    // Verificar si está vencido y actualizar días de retraso
    public function verificarVencimiento()
    {
        if ($this->estado === 'activo' && $this->isVencido()) {
            $diasRetraso = Carbon::now()->diffInDays($this->fecha_fin);
            $this->update(['dias_retraso' => $diasRetraso]);
        }
    }
}