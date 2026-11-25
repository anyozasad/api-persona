<?php

use App\Http\Middleware\AuditLogMiddleware;
use App\Http\Middleware\JwtMiddleware;
use App\Http\Middleware\RolMiddleware;
use App\Http\Middleware\SyncGymSystemMirror;
use App\Console\Commands\VerificarSprintsMallqui;
use App\Console\Commands\ImportarFotosProductos;
use App\Console\Commands\ReconciliarEsquemaRealMallqui;
use App\Console\Commands\RepararMallquiLocal;
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
        RepararMallquiLocal::class,
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

            // El frontend no debe mostrar "MySQL no pudo completar" para
            // cualquier causa. Informar un motivo seguro sin exponer SQL,
            // rutas locales, datos personales ni credenciales de XAMPP.
            $mensaje = match (true) {
                $esEsquema => 'Faltan tablas o columnas en MySQL. Crea un respaldo y repara el esquema desde Configuración del administrador.',
                in_array($driverCode, [1364, 1048], true) =>
                    'MySQL rechazó un campo obligatorio que la base antigua necesita. Comprueba y repara las columnas de ventas y caja antes de repetir el cobro.',
                $driverCode === 1452 =>
                    'No se guardó el cobro: el socio, usuario, producto o caja de la venta no coincide con un registro válido de MySQL.',
                $driverCode === 1062 =>
                    'El comprobante o identificador ya existe. No repitas el cobro sin comprobar primero el historial de ventas.',
                in_array($driverCode, [1205, 1213], true) =>
                    'La base de datos estaba ocupada procesando otra operación. Comprueba el historial antes de volver a cobrar.',
                in_array($driverCode, [1044, 1045, 1049, 2002, 2003], true) =>
                    'Laravel no tiene conexión o permisos sobre la base MySQL configurada. Comprueba MySQL en XAMPP y BACKEND/.env.',
                default => 'La operación fue rechazada por MySQL. Consulta el código de error y el registro de Laravel antes de repetir el cobro.',
            };

            report($e);

            return response()->json([
                'codigo' => $esEsquema ? 'ESQUEMA_MODULO_INCOMPLETO' : 'DB_OPERACION_FALLIDA',
                'mensaje' => $mensaje,
                'mysql_codigo' => $driverCode > 0 ? $driverCode : null,
            ], $esEsquema ? 503 : 500);
        });
    })->create();
