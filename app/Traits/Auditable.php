<?php

namespace App\Traits;

use App\Models\AuditLog;

trait Auditable
{
    /**
     * Boot del trait - registra eventos de Eloquent
     */
    protected static function bootAuditable()
    {
        // Evento: Crear
        static::created(function ($model) {
            static::registrarAuditoria('crear', $model, null, $model->getAttributes());
        });

        // Evento: Actualizar
        static::updated(function ($model) {
            $cambios = $model->getChanges();
            $original = $model->getOriginal();
            
            // Solo auditar si hubo cambios reales
            if (!empty($cambios)) {
                static::registrarAuditoria('editar', $model, $original, $cambios);
            }
        });

        // Evento: Eliminar
        static::deleted(function ($model) {
            static::registrarAuditoria('eliminar', $model, $model->getAttributes(), null);
        });
    }

    /**
     * Registrar acción personalizada de auditoría
     */
    public static function auditarAccion($accion, $modelo, $modeloId = null, $datosAnteriores = null, $datosNuevos = null)
    {
        AuditLog::create([
            'user_id' => session('user_id'),
            'accion' => $accion,
            'modelo' => is_object($modelo) ? class_basename($modelo) : $modelo,
            'modelo_id' => $modeloId ?? ($modelo->id ?? null),
            'datos_anteriores' => $datosAnteriores ? json_encode($datosAnteriores, JSON_UNESCAPED_UNICODE) : null,
            'datos_nuevos' => $datosNuevos ? json_encode($datosNuevos, JSON_UNESCAPED_UNICODE) : null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Método privado para registrar auditoría
     */
    private static function registrarAuditoria($accion, $model, $datosAnteriores = null, $datosNuevos = null)
    {
        // Filtrar campos sensibles que no deben auditarse
        $camposExcluidos = ['password', 'remember_token', 'email_verified_at'];
        
        if ($datosAnteriores) {
            $datosAnteriores = array_diff_key($datosAnteriores, array_flip($camposExcluidos));
        }
        
        if ($datosNuevos) {
            $datosNuevos = array_diff_key($datosNuevos, array_flip($camposExcluidos));
        }

        AuditLog::create([
            'user_id' => session('user_id'),
            'accion' => $accion,
            'modelo' => class_basename($model),
            'modelo_id' => $model->id ?? null,
            'datos_anteriores' => $datosAnteriores ? json_encode($datosAnteriores, JSON_UNESCAPED_UNICODE) : null,
            'datos_nuevos' => $datosNuevos ? json_encode($datosNuevos, JSON_UNESCAPED_UNICODE) : null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}