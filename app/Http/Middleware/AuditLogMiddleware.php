<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class AuditLogMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        $usuario = $request->user();

        Log::channel(config('logging.default'))->info('API_AUDIT', [
            'usuario_id' => $usuario?->id_usuario,
            'usuario' => $usuario?->nombre_usuario,
            'rol' => $usuario?->rol,
            'metodo' => $request->method(),
            'ruta' => $request->path(),
            'ip' => $request->ip(),
            'status' => $response->getStatusCode(),
            'fecha' => now()->toIso8601String(),
        ]);

        return $response;
    }
}
