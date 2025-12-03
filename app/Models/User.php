<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Traits\Auditable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, Auditable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'dni',
        'telefono',
        'activo',
        'rol',
        'creado_por',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'activo' => 'boolean',
    ];

    // Relaciones
    public function librosRegistrados()
    {
        return $this->hasMany(Libro::class, 'registrado_por');
    }

    public function prestamosRealizados()
    {
        return $this->hasMany(Prestamo::class, 'prestado_por');
    }

    public function prestamosRecibidos()
    {
        return $this->hasMany(Prestamo::class, 'recibido_por');
    }

    public function creadoPor()
    {
        return $this->belongsTo(User::class, 'creado_por');
    }

    public function usuariosCreados()
    {
        return $this->hasMany(User::class, 'creado_por');
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }

    public function scopeAdmins($query)
    {
        return $query->where('rol', 'admin');
    }

    public function scopeBibliotecarios($query)
    {
        return $query->where('rol', 'bibliotecario');
    }

    // Métodos auxiliares
    public function isAdmin()
    {
        return $this->rol === 'admin';
    }

    public function isBibliotecario()
    {
        return $this->rol === 'bibliotecario';
    }
}
