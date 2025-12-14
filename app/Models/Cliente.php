<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Carbon\Carbon;

class Cliente extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'nombres',
        'apellidos',
        'dni',
        'email',
        'password',
        'fecha_nacimiento',
        'edad',
        'telefono',
        'domicilio',
        'distrito',
        'provincia',
        'activo',
        'sancionado',
        'fecha_fin_sancion',
        'motivo_sancion',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'activo' => 'boolean',
        'sancionado' => 'boolean',
        'fecha_nacimiento' => 'date',
        'fecha_fin_sancion' => 'date',
    ];

    // Relaciones
    public function prestamos()
    {
        return $this->hasMany(Prestamo::class);
    }

    public function prestamosPendientes()
    {
        return $this->hasMany(Prestamo::class)->where('estado', 'pendiente');
    }

    public function prestamosActivos()
    {
        return $this->hasMany(Prestamo::class)->whereIn('estado', ['aprobado', 'en_curso', 'en_falta']);
    }

    // Métodos auxiliares
    public function getNombreCompletoAttribute()
    {
        return "{$this->nombres} {$this->apellidos}";
    }

    public function estaSancionado()
    {
        if (!$this->sancionado) {
            return false;
        }

        if ($this->fecha_fin_sancion && Carbon::now()->greaterThan($this->fecha_fin_sancion)) {
            // La sanción ha expirado
            $this->update([
                'sancionado' => false,
                'fecha_fin_sancion' => null,
                'motivo_sancion' => null
            ]);
            return false;
        }

        return true;
    }

    public function puedeReservarLibro($libroId)
    {
        // Verificar si está sancionado
        if ($this->estaSancionado()) {
            return [
                'puede' => false,
                'mensaje' => 'No puedes hacer reservas porque estás sancionado hasta ' . $this->fecha_fin_sancion->format('d/m/Y')
            ];
        }

        // Verificar préstamos activos (máximo 3)
        $prestamosActivos = $this->prestamosActivos()->count();
        if ($prestamosActivos >= 3) {
            return [
                'puede' => false,
                'mensaje' => 'Has alcanzado el límite de 3 préstamos activos simultáneos'
            ];
        }

        // Verificar si tiene préstamos vencidos
        $prestamosVencidos = $this->hasMany(Prestamo::class)
            ->where('estado', 'en_falta')
            ->count();

        if ($prestamosVencidos > 0) {
            return [
                'puede' => false,
                'mensaje' => 'Tienes préstamos vencidos. Por favor devuélvelos antes de hacer nuevas reservas.'
            ];
        }

        // Verificar si ya tiene una solicitud pendiente para este libro
        $yaTieneSolicitud = $this->prestamos()
            ->where('libro_id', $libroId)
            ->whereIn('estado', ['pendiente', 'aprobado', 'en_curso'])
            ->exists();

        if ($yaTieneSolicitud) {
            return [
                'puede' => false,
                'mensaje' => 'Ya tienes una solicitud activa para este libro'
            ];
        }

        return ['puede' => true];
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }

    public function scopeSancionados($query)
    {
        return $query->where('sancionado', true);
    }
}