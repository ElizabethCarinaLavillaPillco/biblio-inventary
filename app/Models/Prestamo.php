<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Prestamo extends Model
{
    use HasFactory;

    protected $fillable = [
        'libro_id',
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
        'garantia',
        'tipo_prestamo',
        'estado',
        'fecha_devolucion',
        'prestado_por',
        'recibido_por'
    ];

    protected $casts = [
        'fecha_nacimiento' => 'date',
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'fecha_devolucion' => 'date',
        'edad' => 'integer',
        'total_dias' => 'integer'
    ];

    // Relaciones
    public function libro()
    {
        return $this->belongsTo(Libro::class);
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
            'activo' => 'warning',
            'devuelto' => 'success',
            'perdido' => 'danger',
            default => 'info'
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
}
