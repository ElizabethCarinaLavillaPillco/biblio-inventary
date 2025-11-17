<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ubicacion extends Model
{
    use HasFactory;

    protected $table = 'ubicaciones';

    protected $fillable = [
        'anaquel',
        'lado',
        'nivel',
        'seccion',
        'codigo',
        'activo'
    ];

    protected $casts = [
        'activo' => 'boolean',
        'nivel' => 'integer'
    ];

    public function libros()
    {
        return $this->hasMany(Libro::class);
    }

    // Generar código automáticamente
    public static function generarCodigo($anaquel, $lado, $nivel, $seccion)
    {
        return $anaquel . $lado . $nivel . $seccion;
    }

    // Obtener descripción legible
    public function getDescripcionAttribute()
    {
        $ladoNombre = $this->lado == 'A' ? 'Izquierdo' : 'Derecho';
        return "Anaquel {$this->anaquel} - Lado {$ladoNombre} - {$this->nivel}° Nivel - Sección {$this->seccion}";
    }
}
