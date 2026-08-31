<?php

namespace App\Http\Middleware;

use App\Models\Auditoria;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class AuditLogMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);
        $usuario = $request->user();

        $datos = [
            'id_usuario' => $usuario?->id_usuario,
            'usuario' => $usuario?->nombre_usuario,
            'rol' => $usuario?->rol,
            'metodo' => $request->method(),
            'ruta' => $request->path(),
            'ip' => $request->ip(),
            'status' => $response->getStatusCode(),
            'fecha' => now(),
        ];

        try {
            if (Schema::hasTable('auditorias')) {
                Auditoria::create($datos);
            }
        } catch (Throwable $e) {
            Log::warning('No se pudo guardar auditoría en base de datos', [
                'error' => $e->getMessage(),
            ]);
        }

        Log::channel(config('logging.default'))->info('API_AUDIT', [
            ...$datos,
            'fecha' => now()->toIso8601String(),
        ]);

        return $response;
    }
}
