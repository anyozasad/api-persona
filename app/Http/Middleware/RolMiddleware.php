<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RolMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $usuario = $request->user();

        if (!$usuario) {
            return response()->json([
                'mensaje' => 'No autenticado.',
            ], 401);
        }

        $rolesPermitidos = array_map(
            fn (string $rol) => mb_strtolower(trim($rol)),
            $roles
        );

        $rolUsuario = mb_strtolower(trim((string) $usuario->rol));

        if (!in_array($rolUsuario, $rolesPermitidos, true)) {
            return response()->json([
                'mensaje' => 'No tienes permisos para realizar esta acción.',
            ], 403);
        }

        return $next($request);
    }
}
