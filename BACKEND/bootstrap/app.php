<?php

use App\Http\Middleware\AuditLogMiddleware;
use App\Http\Middleware\JwtMiddleware;
use App\Http\Middleware\RolMiddleware;
use App\Http\Middleware\SyncGymSystemMirror;
use App\Console\Commands\VerificarSprintsMallqui;
use App\Console\Commands\ImportarFotosProductos;
use App\Console\Commands\ReconciliarEsquemaRealMallqui;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withCommands([
        VerificarSprintsMallqui::class,
        ImportarFotosProductos::class,
        ReconciliarEsquemaRealMallqui::class,
    ])
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->appendToGroup('api', SyncGymSystemMirror::class);
        $middleware->alias([
            'rol' => RolMiddleware::class,
            'auditoria' => AuditLogMiddleware::class,
            'jwt' => JwtMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Respuestas consistentes para errores SQL que afectan a un módulo.
        // No exponer consultas, rutas locales ni contraseñas en la interfaz.
        $exceptions->render(function (QueryException $e, Request $request) {
            if (!$request->is('api/*')) {
                return null;
            }

            $sqlState = (string) ($e->errorInfo[0] ?? $e->getCode());
            $driverCode = (int) ($e->errorInfo[1] ?? 0);
            $esEsquema = in_array($sqlState, ['42S02', '42S22'], true)
                || in_array($driverCode, [1146, 1054], true);

            report($e);

            return response()->json([
                'codigo' => $esEsquema ? 'ESQUEMA_MODULO_INCOMPLETO' : 'DB_OPERACION_FALLIDA',
                'mensaje' => $esEsquema
                    ? 'Faltan tablas o columnas para esta función. Haz un respaldo y completa el esquema de MySQL desde el diagnóstico del administrador.'
                    : 'MySQL no pudo completar la operación. Consulta el registro de Laravel y vuelve a intentar cuando el servidor esté corregido.',
            ], $esEsquema ? 503 : 500);
        });
    })->create();
