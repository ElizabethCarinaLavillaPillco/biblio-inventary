<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Registrar los alias de middleware
        $middleware->alias([
            'auth.simple' => \App\Http\Middleware\SimpleAuth::class,
            'admin.only' => \App\Http\Middleware\AdminOnly::class,
        ]);

        // ⚡ AGREGAR: Configuración para sesiones con SPA
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
