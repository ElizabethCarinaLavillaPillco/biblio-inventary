<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'accion',
        'modelo',
        'modelo_id',
        'datos_anteriores',
        'datos_nuevos',
        'ip_address',
        'user_agent'
    ];

    protected $casts = [
        'datos_anteriores' => 'array',
        'datos_nuevos' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scope para filtrar por fecha
    public function scopeEntreFechas($query, $desde, $hasta)
    {
        return $query->whereBetween('created_at', [$desde, $hasta]);
    }

    // Scope para filtrar por usuario
    public function scopeDeUsuario($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // Scope para filtrar por modelo
    public function scopeDelModelo($query, $modelo)
    {
        return $query->where('modelo', $modelo);
    }
}