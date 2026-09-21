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
            'dni' => 'required|string|max:15|unique:usuarios,dni',
            'telefono' => 'nullable|string|max:25',
            'correo' => 'required|email|max:150|unique:usuarios,correo',
            'contrasena' => 'required|string|min:8|max:100',
        ], [
            'nombre_usuario.unique' => 'Ya existe una cuenta asociada a estos datos.',
            'dni.required' => 'Ingresa tu DNI.',
            'dni.unique' => 'Este DNI ya tiene una cuenta de acceso. Inicia sesión o recupera tu contraseña.',
            'correo.required' => 'Ingresa tu correo.',
            'correo.email' => 'Ingresa un correo válido.',
            'correo.unique' => 'Este correo ya tiene una cuenta. Inicia sesión o recupera tu contraseña.',
            'contrasena.required' => 'Ingresa una contraseña.',
            'contrasena.min' => 'La contraseña debe tener al menos 8 caracteres.',
        ]);

        [$usuario, $cliente] = DB::transaction(function () use ($datos) {
            $correo = mb_strtolower(trim($datos['correo']));
            $cliente = Cliente::where('dni', $datos['dni'])->lockForUpdate()->first();

            if ($cliente) {
                $correoCliente = mb_strtolower(trim((string) $cliente->correo));

                if ($correoCliente !== '' && $correoCliente !== $correo) {
                    throw ValidationException::withMessages([
                        'dni' => ['Este DNI ya pertenece a un cliente registrado con otro correo. Usa el correo registrado o solicita ayuda al administrador.'],
                    ]);
                }

                if (Usuario::where('id_cliente', $cliente->id_cliente)->exists()) {
                    throw ValidationException::withMessages([
                        'dni' => ['Este cliente ya tiene una cuenta de acceso. Inicia sesión o recupera tu contraseña.'],
                    ]);
                }

                $cliente->update([
                    'nombres' => $datos['nombres'],
                    'apellidos' => $datos['apellidos'],
                    'telefono' => $datos['telefono'] ?? $cliente->telefono,
                    'correo' => $correo,
                    'estado' => 'Activo',
                ]);
            } else {
                $cliente = Cliente::create([
                    'dni' => $datos['dni'],
                    'nombres' => $datos['nombres'],
                    'apellidos' => $datos['apellidos'],
                    'telefono' => $datos['telefono'] ?? null,
                    'correo' => $correo,
                    'fecha_registro' => now(),
                    'estado' => 'Activo',
                ]);
            }

            $datosUsuario = $datos;
            $datosUsuario['correo'] = $correo;
            $datosUsuario['contrasena'] = Hash::make($datosUsuario['contrasena']);
            $datosUsuario['rol'] = 'Cliente';
            $datosUsuario['estado'] = 'Activo';
            $datosUsuario['fecha_registro'] = now();
            $datosUsuario['id_cliente'] = $cliente->id_cliente;

            $usuario = Usuario::create($datosUsuario);

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

        $loginNormalizado = mb_strtolower($login);

        $usuario = Usuario::query()
            ->whereRaw('LOWER(correo) = ?', [$loginNormalizado])
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
        $cliente = $usuario->id_cliente
            ? Cliente::find($usuario->id_cliente)
            : ($usuario->dni ? Cliente::where('dni', $usuario->dni)->first() : null);

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
        $cliente = $usuario->id_cliente
            ? Cliente::find($usuario->id_cliente)
            : ($usuario->dni ? Cliente::where('dni', $usuario->dni)->first() : null);

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

    public function recoveryByDni(Request $request)
    {
        $datos = $request->validate([
            'dni' => ['required', 'string', 'min:8', 'max:15', 'regex:/^[0-9]+$/'],
        ], [
            'dni.required' => 'Ingresa tu DNI.',
            'dni.regex' => 'El DNI solo debe contener números.',
            'dni.min' => 'El DNI ingresado no es válido.',
        ]);

        $dni = trim($datos['dni']);

        $usuario = Usuario::where('dni', $dni)->first();

        if (!$usuario) {
            $cliente = Cliente::where('dni', $dni)->first();
            if ($cliente) {
                $usuario = Usuario::where('id_cliente', $cliente->id_cliente)->first();
            }
        }

        if (!$usuario || mb_strtolower((string) $usuario->estado) !== 'activo') {
            return response()->json([
                'mensaje' => 'No encontramos una cuenta activa asociada a ese DNI.',
            ], 404);
        }

        $correo = mb_strtolower(trim((string) $usuario->correo));

        if ($correo === '') {
            return response()->json([
                'mensaje' => 'La cuenta no tiene un correo registrado. Comunícate con el administrador.',
            ], 422);
        }

        $codigo = (string) random_int(100000, 999999);
        $challenge = Str::random(64);
        $cacheKey = $this->passwordRecoveryDniKey($challenge);

        Cache::put($cacheKey, [
            'usuario_id' => $usuario->id_usuario,
            'correo' => $correo,
            'codigo_hash' => hash('sha256', $codigo),
            'intentos' => 0,
        ], now()->addMinutes(10));

        try {
            Mail::raw(
                "Mallqui Gym\n\nTu código para recuperar la contraseña es: {$codigo}\n\nEste código vence en 10 minutos.\n\nSi no realizaste esta solicitud, ignora este mensaje.",
                function ($message) use ($correo) {
                    $message->to($correo)->subject('Código de recuperación - Mallqui Gym');
                }
            );
        } catch (Throwable $e) {
            Cache::forget($cacheKey);

            Log::error('No se pudo enviar código de recuperación por DNI', [
                'usuario_id' => $usuario->id_usuario,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'mensaje' => 'No se pudo enviar el código de recuperación. Revisa la configuración de correo del sistema.',
            ], 503);
        }

        $respuesta = [
            'mensaje' => 'Encontramos tu cuenta. Enviamos un código de 6 dígitos al correo registrado.',
            'correo' => $this->maskEmail($correo),
            'challenge' => $challenge,
            'expira_en_minutos' => 10,
        ];

        if (app()->environment('local') && config('mail.default') === 'log') {
            $respuesta['codigo_desarrollo'] = $codigo;
        }

        return response()->json($respuesta);
    }

    public function resetPasswordByDni(Request $request)
    {
        $datos = $request->validate([
            'challenge' => 'required|string|min:32|max:255',
            'codigo' => ['required', 'string', 'regex:/^[0-9]{6}$/'],
            'contrasena' => 'required|string|min:8|max:100|confirmed',
        ], [
            'codigo.required' => 'Ingresa el código de recuperación.',
            'codigo.regex' => 'El código debe tener 6 dígitos.',
            'contrasena.required' => 'Ingresa la nueva contraseña.',
            'contrasena.min' => 'La nueva contraseña debe tener al menos 8 caracteres.',
            'contrasena.confirmed' => 'Las contraseñas no coinciden.',
        ]);

        $cacheKey = $this->passwordRecoveryDniKey($datos['challenge']);
        $reset = Cache::get($cacheKey);

        if (!$reset) {
            throw ValidationException::withMessages([
                'codigo' => ['La solicitud de recuperación venció. Vuelve a ingresar tu DNI.'],
            ]);
        }

        $intentos = (int) ($reset['intentos'] ?? 0);

        if ($intentos >= 5) {
            Cache::forget($cacheKey);
            throw ValidationException::withMessages([
                'codigo' => ['Se superó el número de intentos. Solicita un nuevo código.'],
            ]);
        }

        if (!hash_equals((string) ($reset['codigo_hash'] ?? ''), hash('sha256', $datos['codigo']))) {
            $reset['intentos'] = $intentos + 1;
            Cache::put($cacheKey, $reset, now()->addMinutes(10));

            throw ValidationException::withMessages([
                'codigo' => ['El código ingresado no es correcto.'],
            ]);
        }

        $usuario = Usuario::find($reset['usuario_id'] ?? 0);

        if (!$usuario || mb_strtolower((string) $usuario->estado) !== 'activo') {
            Cache::forget($cacheKey);
            throw ValidationException::withMessages([
                'codigo' => ['La cuenta ya no está disponible para recuperación.'],
            ]);
        }

        $usuario->update([
            'contrasena' => Hash::make($datos['contrasena']),
        ]);

        $usuario->tokens()->delete();
        Cache::forget($cacheKey);

        return response()->json([
            'mensaje' => 'Contraseña actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.',
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

    private function passwordRecoveryDniKey(string $challenge): string
    {
        return 'password_recovery_dni:'.hash('sha256', $challenge);
    }

    private function maskEmail(string $correo): string
    {
        [$usuario, $dominio] = array_pad(explode('@', $correo, 2), 2, '');

        if ($usuario === '' || $dominio === '') {
            return 'correo registrado';
        }

        $visible = mb_substr($usuario, 0, min(2, mb_strlen($usuario)));
        $ocultos = str_repeat('*', max(3, mb_strlen($usuario) - mb_strlen($visible)));

        return $visible.$ocultos.'@'.$dominio;
    }

    private function passwordResetKey(string $correo): string
    {
        return 'password_reset:'.hash('sha256', $correo);
    }
}
