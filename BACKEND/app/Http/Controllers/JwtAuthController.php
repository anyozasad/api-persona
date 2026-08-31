<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Services\JwtService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class JwtAuthController extends Controller
{
    public function __construct(private JwtService $jwt)
    {
    }

    public function login(Request $request)
    {
        $datos = $request->validate([
            'login' => 'required|string|max:150',
            'contrasena' => 'required|string|max:100',
        ]);

        $usuario = Usuario::query()
            ->where('correo', trim($datos['login']))
            ->orWhere('nombre_usuario', trim($datos['login']))
            ->first();

        if (!$usuario || !Hash::check($datos['contrasena'], $usuario->contrasena)) {
            throw ValidationException::withMessages([
                'login' => ['Las credenciales ingresadas no son correctas.'],
            ]);
        }

        if (mb_strtolower((string) $usuario->estado) !== 'activo') {
            return response()->json([
                'mensaje' => 'El usuario se encuentra inactivo.',
            ], 403);
        }

        $jwt = $this->jwt->generar($usuario);

        return response()->json([
            'mensaje' => 'JWT generado correctamente.',
            'token_type' => 'Bearer',
            'access_token' => $jwt['token'],
            'expires_in' => $jwt['expires_in'],
            'usuario' => $usuario,
            // Se devuelve solo para fines académicos, para que el profesor
            // pueda ver exactamente qué claims fueron incluidos en el JWT.
            'claims' => $jwt['claims'],
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'mensaje' => 'JWT válido.',
            'usuario' => $request->user(),
            'claims' => $request->attributes->get('jwt_claims', []),
        ]);
    }

    public function claims(Request $request)
    {
        return response()->json([
            'explicacion' => [
                'sub' => 'Identificador principal almacenado en el JWT: id_usuario.',
                'claims_adicionales' => ['id_usuario', 'nombre_usuario', 'correo', 'rol'],
                'claims_estandar' => ['iss', 'aud', 'iat', 'nbf', 'exp', 'jti'],
            ],
            'claims' => $request->attributes->get('jwt_claims', []),
        ]);
    }

    public function soloAdministrador(Request $request)
    {
        return response()->json([
            'mensaje' => 'Acceso autorizado mediante JWT y claim de rol Administrador.',
            'usuario' => $request->user(),
            'claims' => $request->attributes->get('jwt_claims', []),
        ]);
    }
}
