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
        'registrado_por',
        'codigo_inventario',
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

    // ===== NUEVOS MÉTODOS PARA GESTIÓN DE STOCK =====

    /**
     * Obtener todas las copias del mismo libro (mismo título + autor)
     */
    public function copias()
    {
        return static::where('titulo', $this->titulo)
            ->where('autor_id', $this->autor_id)
            ->where('id', '!=', $this->id);
    }

    /**
     * Obtener stock total (todas las copias del mismo libro)
     */
    public function getStockTotalAttribute()
    {
        return static::where('titulo', $this->titulo)
            ->where('autor_id', $this->autor_id)
            ->count();
    }

    /**
     * Obtener stock disponible (copias en biblioteca)
     */
    public function getStockDisponibleAttribute()
    {
        return static::where('titulo', $this->titulo)
            ->where('autor_id', $this->autor_id)
            ->where('estado_actual', 'en biblioteca')
            ->count();
    }

    /**
     * Obtener stock prestado
     */
    public function getStockPrestadoAttribute()
    {
        return static::where('titulo', $this->titulo)
            ->where('autor_id', $this->autor_id)
            ->where('estado_actual', 'prestado')
            ->count();
    }

    /**
     * Obtener stock perdido
     */
    public function getStockPerdidoAttribute()
    {
        return static::where('titulo', $this->titulo)
            ->where('autor_id', $this->autor_id)
            ->where('estado_actual', 'perdido')
            ->count();
    }

    /**
     * Obtener todas las copias físicas con detalles
     */
    public function getTodasLasCopiasAttribute()
    {
        return static::where('titulo', $this->titulo)
            ->where('autor_id', $this->autor_id)
            ->with(['ubicacion', 'prestamoActivo'])
            ->orderBy('estado_actual', 'asc') // Disponibles primero
            ->orderBy('codigo_inventario', 'asc')
            ->get();
    }

    /**
     * Verificar si hay copias disponibles para préstamo
     */
    public function hayCopiasDisponibles()
    {
        return $this->stock_disponible > 0;
    }

    /**
     * Obtener primera copia disponible
     */
    public static function obtenerPrimeraCopiaDisponible($titulo, $autor_id)
    {
        return static::where('titulo', $titulo)
            ->where('autor_id', $autor_id)
            ->where('estado_actual', 'en biblioteca')
            ->first();
    }


    public static function generarCodigoInventario($forceUnique = false)
    {
        $year = date('Y');
        $prefix = 'LIB-' . $year . '-';

        if ($forceUnique) {
            // Generar un código completamente único usando timestamp
            return $prefix . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT) . '-' . time();
        }

        // Buscar el último código del año actual
        $ultimoCodigo = static::where('codigo_inventario', 'LIKE', $prefix . '%')
            ->orderBy('codigo_inventario', 'desc')
            ->first();

        if ($ultimoCodigo) {
            // Extraer el número y aumentar
            $numero = intval(substr($ultimoCodigo->codigo_inventario, -4)) + 1;
        } else {
            $numero = 1;
        }

        return $prefix . str_pad($numero, 4, '0', STR_PAD_LEFT);
    }

    public static function buscarDuplicados($titulo, $autor_id)
    {
        return static::where('titulo', $titulo)
            ->where('autor_id', $autor_id)
            ->get();
    }


    // ===== NUEVO SCOPE: Agrupar por libro (título + autor) =====
    public function scopeAgrupadoPorLibro($query)
    {
        return $query->select(
            'titulo',
            'autor_id',
            'categoria_id',
            \DB::raw('COUNT(*) as total_copias'),
            \DB::raw('SUM(CASE WHEN estado_actual = "en biblioteca" THEN 1 ELSE 0 END) as copias_disponibles'),
            \DB::raw('SUM(CASE WHEN estado_actual = "prestado" THEN 1 ELSE 0 END) as copias_prestadas'),
            \DB::raw('MIN(id) as libro_id') // ID de una copia para ver detalles
        )
        ->groupBy('titulo', 'autor_id', 'categoria_id');
    }
}
