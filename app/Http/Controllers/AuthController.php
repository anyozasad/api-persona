<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $datos = $request->validate([
            'nombre_usuario' => 'required|string|max:80|unique:usuarios,nombre_usuario',
            'nombres' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'dni' => 'nullable|string|max:15|unique:usuarios,dni',
            'telefono' => 'nullable|string|max:25',
            'correo' => 'required|email|max:150|unique:usuarios,correo',
            'contrasena' => 'required|string|min:8|max:100',
        ]);

        $datos['contrasena'] = Hash::make($datos['contrasena']);
        $datos['rol'] = 'Cliente';
        $datos['estado'] = 'Activo';
        $datos['fecha_registro'] = now();

        $usuario = Usuario::create($datos);
        $token = $usuario->createToken('sesion-api')->plainTextToken;

        return response()->json([
            'mensaje' => 'Usuario registrado correctamente',
            'token_type' => 'Bearer',
            'access_token' => $token,
            'usuario' => $usuario,
        ], 201);
    }

    public function login(Request $request)
    {
        $login = trim((string) (
            $request->input('login')
            ?? $request->input('correo')
            ?? $request->input('email')
        ));

        $contrasena = (string) (
            $request->input('contrasena')
            ?? $request->input('password')
        );

        if ($login === '' || $contrasena === '') {
            throw ValidationException::withMessages([
                'login' => ['Ingresa tu correo o nombre de usuario.'],
                'contrasena' => ['Ingresa tu contraseña.'],
            ]);
        }

        $usuario = Usuario::query()
            ->where('correo', $login)
            ->orWhere('nombre_usuario', $login)
            ->first();

        // Se usa el mismo mensaje para usuario inexistente y contraseña incorrecta.
        if (!$usuario || !Hash::check($contrasena, $usuario->contrasena)) {
            throw ValidationException::withMessages([
                'login' => ['Las credenciales ingresadas no son correctas.'],
            ]);
        }

        if (mb_strtolower((string) $usuario->estado) !== 'activo') {
            return response()->json([
                'mensaje' => 'El usuario se encuentra inactivo.',
            ], 403);
        }

        $token = $usuario->createToken('sesion-api')->plainTextToken;

        return response()->json([
            'mensaje' => 'Inicio de sesión correcto',
            'token_type' => 'Bearer',
            'access_token' => $token,
            'usuario' => $usuario,
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'mensaje' => 'Sesión cerrada correctamente',
        ]);
    }

    public function logoutTodos(Request $request)
    {
        /** @var Usuario $usuario */
        $usuario = $request->user();
        $usuario->tokens()->delete();

        return response()->json([
            'mensaje' => 'Todas las sesiones fueron cerradas correctamente',
        ]);
    }

    public function cambiarContrasena(Request $request)
    {
        $datos = $request->validate([
            'contrasena_actual' => 'required|string',
            'contrasena_nueva' => 'required|string|min:8|max:100|different:contrasena_actual',
        ]);

        /** @var Usuario $usuario */
        $usuario = $request->user();

        if (!Hash::check($datos['contrasena_actual'], $usuario->contrasena)) {
            throw ValidationException::withMessages([
                'contrasena_actual' => ['La contraseña actual no es correcta.'],
            ]);
        }

        $usuario->update([
            'contrasena' => Hash::make($datos['contrasena_nueva']),
        ]);

        // Al cambiar la contraseña se invalidan todas las sesiones anteriores.
        $usuario->tokens()->delete();
        $token = $usuario->createToken('sesion-api')->plainTextToken;

        return response()->json([
            'mensaje' => 'Contraseña actualizada correctamente',
            'token_type' => 'Bearer',
            'access_token' => $token,
        ]);
    }
}
