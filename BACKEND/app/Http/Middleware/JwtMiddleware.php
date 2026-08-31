<?php

namespace App\Http\Middleware;

use App\Models\Usuario;
use App\Services\JwtService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class JwtMiddleware
{
    public function __construct(private JwtService $jwt)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'mensaje' => 'JWT no enviado. Usa Authorization: Bearer <token>.',
            ], 401);
        }

        try {
            $claims = $this->jwt->decodificar($token);
        } catch (Throwable $e) {
            return response()->json([
                'mensaje' => 'JWT inválido o vencido.',
                'detalle' => $e->getMessage(),
            ], 401);
        }

        $usuario = Usuario::find((int) $claims['sub']);

        if (!$usuario || mb_strtolower((string) $usuario->estado) !== 'activo') {
            return response()->json([
                'mensaje' => 'El usuario del JWT no existe o está inactivo.',
            ], 401);
        }

        // Evita aceptar un token cuyo rol ya no coincide con el rol actual en BD.
        if (($claims['rol'] ?? null) !== (string) $usuario->rol) {
            return response()->json([
                'mensaje' => 'El rol del JWT ya no coincide con el usuario actual. Inicia sesión nuevamente.',
            ], 401);
        }

        $request->attributes->set('jwt_claims', $claims);
        $request->setUserResolver(fn () => $usuario);

        return $next($request);
    }
}
