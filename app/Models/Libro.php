<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Libro extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'titulo',
        'autor_id',
        'categoria_id',
        'precio',
        'ubicacion_id',
        'numero_paginas',
        'editorial',
        'tamanio',
        'color_forro',
        'procedencia',
        'estado_libro',
        'destino_mal_estado',
        'estado_actual',
        'tipo_prestamo',
        'registrado_por'
    ];

    protected $casts = [
        'precio' => 'decimal:2',
        'numero_paginas' => 'integer'
    ];

    // Relaciones
    public function autor()
    {
        return $this->belongsTo(Autor::class);
    }

    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }

    public function ubicacion()
    {
        return $this->belongsTo(Ubicacion::class);
    }

    public function registradoPor()
    {
        return $this->belongsTo(User::class, 'registrado_por');
    }

    public function prestamos()
    {
        return $this->hasMany(Prestamo::class);
    }

    public function prestamoActivo()
    {
        return $this->hasOne(Prestamo::class)->where('estado', 'activo')->latest();
    }

    // Scopes
    public function scopeDisponibles($query)
    {
        return $query->where('estado_actual', 'en biblioteca');
    }

    public function scopePrestados($query)
    {
        return $query->where('estado_actual', 'prestado');
    }

    public function scopePerdidos($query)
    {
        return $query->where('estado_actual', 'perdido');
    }

    // Métodos auxiliares
    public function getEstadoColorAttribute()
    {
        return match($this->estado_actual) {
            'en biblioteca' => 'success',
            'prestado' => 'warning',
            'perdido' => 'danger',
            'biblioteca comunitaria' => 'secondary',
            default => 'info'
        };
    }
}
