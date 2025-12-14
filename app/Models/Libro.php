<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;
use App\Traits\Auditable;

class Libro extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
        'titulo',
        'tipo_item',
        'autor_id',
        'isbn',
        'issn',
        'coleccion_id',
        'categoria_id',
        'clasificacion_cdd',
        'codigo_cdd',
        'precio',
        'ubicacion_id',
        'numero_paginas',
        'editorial',
        'anio_publicacion',
        'idioma',
        'resumen',
        'notas',
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
        'numero_paginas' => 'integer',
        'anio_publicacion' => 'integer'
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

    public function coleccion()
    {
        return $this->belongsTo(Coleccion::class);
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
        return $this->hasOne(Prestamo::class)->whereIn('estado', ['aprobado', 'en_curso'])->latest();
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

    public function scopePublicos($query)
    {
        return $query->whereNotIn('estado_actual', ['perdido', 'biblioteca comunitaria']);
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

    public function estaDisponible()
    {
        return $this->estado_actual === 'en biblioteca';
    }

    public function getFechaDisponibilidadEstimada()
    {
        if ($this->estaDisponible()) {
            return now();
        }

        $prestamoActivo = $this->prestamoActivo;
        if ($prestamoActivo) {
            // Agregar 5 días de margen después de la fecha de devolución
            return $prestamoActivo->fecha_fin->addDays(5);
        }

        return null;
    }

    public function getClasificacionCddNombreAttribute()
    {
        $nombres = [
            '000' => 'Ciencias de la Computación, Información y Obras Generales',
            '100' => 'Filosofía y Psicología',
            '200' => 'Religión y Teología',
            '300' => 'Ciencias Sociales',
            '400' => 'Lenguas',
            '500' => 'Ciencias Naturales y Matemáticas',
            '600' => 'Tecnología y Ciencias Aplicadas',
            '700' => 'Artes y Recreación',
            '800' => 'Literatura',
            '900' => 'Historia y Geografía'
        ];

        return $nombres[$this->clasificacion_cdd] ?? 'Sin clasificar';
    }

    public function getCodigoCddCompletoAttribute()
    {
        if ($this->clasificacion_cdd && $this->codigo_cdd) {
            return $this->clasificacion_cdd . '/' . $this->codigo_cdd;
        }
        return null;
    }
}