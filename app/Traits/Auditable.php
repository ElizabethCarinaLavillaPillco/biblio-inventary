<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

trait Auditable
{
    protected static function bootAuditable()
    {
        static::created(function ($model) {
            static::logAudit('crear', $model, null, $model->toArray());
        });

        static::updated(function ($model) {
            static::logAudit('editar', $model, $model->getOriginal(), $model->getChanges());
        });

        static::deleted(function ($model) {
            static::logAudit('eliminar', $model, $model->toArray(), null);
        });
    }

    protected static function logAudit($accion, $model, $datosAnteriores, $datosNuevos)
    {
        // Obtener user_id desde la sesión
        $userId = session('user_id');
        
        AuditLog::create([
            'user_id' => $userId,
            'accion' => $accion,
            'modelo' => get_class($model),
            'modelo_id' => $model->id,
            'datos_anteriores' => $datosAnteriores ? json_encode($datosAnteriores) : null,
            'datos_nuevos' => $datosNuevos ? json_encode($datosNuevos) : null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    public static function logCustomAudit($accion, $modelo, $modeloId, $descripcion = null)
    {
        $userId = session('user_id');
        
        AuditLog::create([
            'user_id' => $userId,
            'accion' => $accion,
            'modelo' => $modelo,
            'modelo_id' => $modeloId,
            'datos_nuevos' => $descripcion ? json_encode(['descripcion' => $descripcion]) : null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}