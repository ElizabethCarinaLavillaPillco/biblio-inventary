<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Consentimiento extends Model
{
    use HasFactory;

    protected $table = 'consentimientos';

    protected $fillable = [
        'nombre_completo',
        'dni',
        'acepta_tratamiento_datos',
        'fecha_aceptacion',
        'ip_address',
        'documento_firmado'
    ];

    protected $casts = [
        'acepta_tratamiento_datos' => 'boolean',
        'fecha_aceptacion' => 'datetime'
    ];

    // Verificar si hay consentimiento para un DNI
    public static function tieneConsentimiento($dni)
    {
        return self::where('dni', $dni)
            ->where('acepta_tratamiento_datos', true)
            ->exists();
    }
}