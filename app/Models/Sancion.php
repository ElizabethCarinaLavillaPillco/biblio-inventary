<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Sancion extends Model
{
    use HasFactory, Auditable;

    protected $table = 'sanciones';

    protected $fillable = [
        'prestamo_id',
        'usuario_sancionado',
        'tipo',
        'monto_multa',
        'fecha_inicio',
        'fecha_fin',
        'estado',
        'observaciones'
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'monto_multa' => 'decimal:2'
    ];

    public function prestamo()
    {
        return $this->belongsTo(Prestamo::class);
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_sancionado');
    }

    // Scope para sanciones activas
    public function scopeActivas($query)
    {
        return $query->where('estado', 'activa');
    }

    // Verificar si la sanción está vencida
    public function isVencida()
    {
        if ($this->fecha_fin && $this->estado === 'activa') {
            return now()->greaterThan($this->fecha_fin);
        }
        return false;
    }
}