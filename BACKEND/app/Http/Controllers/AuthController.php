<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $datos = $request->validate([
            'nombre_usuario' => 'required|string|max:80|unique:usuarios,nombre_usuario',
            'nombres' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'dni' => 'required|string|max:15|unique:usuarios,dni|unique:clientes,dni',
            'telefono' => 'nullable|string|max:25',
            'correo' => 'required|email|max:150|unique:usuarios,correo',
            'contrasena' => 'required|string|min:8|max:100',
        ]);

        [$usuario, $cliente] = DB::transaction(function () use ($datos) {
            $datosUsuario = $datos;
            $datosUsuario['contrasena'] = Hash::make($datosUsuario['contrasena']);
            $datosUsuario['rol'] = 'Cliente';
            $datosUsuario['estado'] = 'Activo';
            $datosUsuario['fecha_registro'] = now();

            $usuario = Usuario::create($datosUsuario);

            $cliente = Cliente::create([
                'dni' => $datos['dni'],
                'nombres' => $datos['nombres'],
                'apellidos' => $datos['apellidos'],
                'telefono' => $datos['telefono'] ?? null,
                'correo' => $datos['correo'],
                'fecha_registro' => now(),
                'estado' => 'Activo',
            ]);

            return [$usuario, $cliente];
        });

        $token = $usuario->createToken('sesion-api')->plainTextToken;

        return response()->json([
            'mensaje' => 'Usuario registrado correctamente',
            'token_type' => 'Bearer',
            'access_token' => $token,
            'usuario' => $usuario,
            'cliente' => $cliente,
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
        $cliente = $usuario->dni ? Cliente::where('dni', $usuario->dni)->first() : null;

        return response()->json([
            'mensaje' => 'Inicio de sesión correcto',
            'token_type' => 'Bearer',
            'access_token' => $token,
            'usuario' => $usuario,
            'cliente' => $cliente,
        ]);
    }

    public function me(Request $request)
    {
        /** @var Usuario $usuario */
        $usuario = $request->user();
        $cliente = $usuario->dni ? Cliente::where('dni', $usuario->dni)->first() : null;

        return response()->json([
            'usuario' => $usuario,
            'cliente' => $cliente,
        ]);
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

        $usuario->tokens()->delete();
        $token = $usuario->createToken('sesion-api')->plainTextToken;

        return response()->json([
            'mensaje' => 'Contraseña actualizada correctamente',
            'token_type' => 'Bearer',
            'access_token' => $token,
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $datos = $request->validate([
            'correo' => 'required|email|max:150',
        ]);

        $correo = mb_strtolower(trim($datos['correo']));
        $usuario = Usuario::whereRaw('LOWER(correo) = ?', [$correo])->first();

        if ($usuario && mb_strtolower((string) $usuario->estado) === 'activo') {
            $token = Str::random(64);
            $cacheKey = $this->passwordResetKey($correo);

            Cache::put($cacheKey, [
                'token_hash' => hash('sha256', $token),
                'usuario_id' => $usuario->id_usuario,
            ], now()->addMinutes(30));

            $url = url('/restablecer').'?token='.urlencode($token).'&email='.urlencode($correo);

            try {
                Mail::raw(
                    "Se solicitó restablecer la contraseña de tu cuenta.\n\nAbre este enlace (válido por 30 minutos):\n{$url}\n\nSi no realizaste esta solicitud, ignora este mensaje.",
                    function ($message) use ($correo) {
                        $message->to($correo)->subject('Restablecer contraseña');
                    }
                );
            } catch (Throwable $e) {
                Log::error('No se pudo enviar correo de recuperación', [
                    'usuario_id' => $usuario->id_usuario,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return response()->json([
            'mensaje' => 'Si el correo está registrado, recibirás un enlace de recuperación válido por 30 minutos.',
        ]);
    }

    public function resetPassword(Request $request)
    {
        $datos = $request->validate([
            'correo' => 'required|email|max:150',
            'token' => 'required|string|min:32|max:255',
            'contrasena' => 'required|string|min:8|max:100|confirmed',
        ]);

        $correo = mb_strtolower(trim($datos['correo']));
        $cacheKey = $this->passwordResetKey($correo);
        $reset = Cache::get($cacheKey);

        if (!$reset || !hash_equals((string) ($reset['token_hash'] ?? ''), hash('sha256', $datos['token']))) {
            throw ValidationException::withMessages([
                'token' => ['El enlace de recuperación no es válido o ya venció.'],
            ]);
        }

        $usuario = Usuario::where('id_usuario', $reset['usuario_id'] ?? 0)
            ->whereRaw('LOWER(correo) = ?', [$correo])
            ->first();

        if (!$usuario) {
            Cache::forget($cacheKey);
            throw ValidationException::withMessages([
                'token' => ['El enlace de recuperación no es válido o ya venció.'],
            ]);
        }

        $usuario->update([
            'contrasena' => Hash::make($datos['contrasena']),
        ]);
        $usuario->tokens()->delete();
        Cache::forget($cacheKey);

        return response()->json([
            'mensaje' => 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.',
        ]);
    }

    private function passwordResetKey(string $correo): string
    {
        return 'password_reset:'.hash('sha256', $correo);
    }
}
