<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Auditable;

class Libro extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
        'titulo',
        'isbn',
        'autor_id',
        'categoria_id',
        'precio',
        'ubicacion_id',
        'signatura',
        'numero_paginas',
        'editorial',
        'anio_publicacion',
        'tamanio',
        'color_forro',
        'procedencia',
        'estado_libro',
        'destino_mal_estado',
        'estado_actual',
        'tipo_prestamo',
        'notas',
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

    // Generar signatura automática si no existe
    public static function generarSignatura($categoriaId, $autorId)
    {
        $categoria = Categoria::find($categoriaId);
        $autor = Autor::find($autorId);
        
        if (!$categoria || !$autor) {
            return null;
        }

        // Ejemplo: FICT-GAR-001 (Ficción - García - número correlativo)
        $prefijoCat = strtoupper(substr($categoria->nombre, 0, 4));
        $prefijoAut = strtoupper(substr($autor->nombre, 0, 3));
        
        $ultimo = self::where('categoria_id', $categoriaId)
            ->where('autor_id', $autorId)
            ->orderBy('id', 'desc')
            ->first();
        
        $numero = $ultimo ? (intval(substr($ultimo->signatura, -3)) + 1) : 1;
        
        return $prefijoCat . '-' . $prefijoAut . '-' . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }
}