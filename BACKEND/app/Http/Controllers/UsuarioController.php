<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\Entrenador;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UsuarioController extends Controller
{
    public function index()
    {
        return response()->json(Usuario::with(['cliente', 'entrenador'])->orderBy('id_usuario', 'desc')->get());
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'nombre_usuario' => 'required|string|max:80|unique:usuarios,nombre_usuario',
            'contrasena' => 'required|string|min:8|max:100',
            'nombres' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'dni' => 'required|string|max:15|unique:usuarios,dni',
            'telefono' => 'nullable|string|max:25',
            'correo' => 'required|email|max:150|unique:usuarios,correo',
            'rol' => ['required', 'string', Rule::in(['Administrador', 'Cliente', 'Entrenador'])],
            'estado' => ['nullable', 'string', Rule::in(['Activo', 'Inactivo'])],
            'fecha_registro' => 'nullable|date',
        ]);

        $datos['contrasena'] = Hash::make($datos['contrasena']);
        $datos['estado'] = $datos['estado'] ?? 'Activo';
        $datos['fecha_registro'] = $datos['fecha_registro'] ?? now();

        if ($datos['rol'] === 'Cliente') {
            $cliente = Cliente::where('dni', $datos['dni'])->first();
            if (!$cliente) {
                throw ValidationException::withMessages(['dni' => ['No existe un cliente con ese DNI.']]);
            }
            $datos['id_cliente'] = $cliente->id_cliente;
        }

        if ($datos['rol'] === 'Entrenador') {
            $entrenador = Entrenador::where('dni', $datos['dni'])->first();
            if (!$entrenador) {
                throw ValidationException::withMessages(['dni' => ['No existe un entrenador con ese DNI.']]);
            }
            $datos['id_entrenador'] = $entrenador->id_entrenador;
        }

        return response()->json(Usuario::create($datos)->load(['cliente', 'entrenador']), 201);
    }

    public function show(string $id)
    {
        return response()->json(
            Usuario::with(['compras', 'ventas', 'cliente', 'entrenador'])->findOrFail($id)
        );
    }

    public function update(Request $request, string $id)
    {
        $usuario = Usuario::findOrFail($id);

        $datos = $request->validate([
            'nombre_usuario' => [
                'sometimes', 'string', 'max:80',
                Rule::unique('usuarios', 'nombre_usuario')->ignore($usuario->id_usuario, 'id_usuario'),
            ],
            'contrasena' => 'sometimes|nullable|string|min:8|max:100',
            'nombres' => 'sometimes|string|max:100',
            'apellidos' => 'sometimes|string|max:100',
            'dni' => [
                'sometimes', 'string', 'max:15',
                Rule::unique('usuarios', 'dni')->ignore($usuario->id_usuario, 'id_usuario'),
            ],
            'telefono' => 'sometimes|nullable|string|max:25',
            'correo' => [
                'sometimes', 'email', 'max:150',
                Rule::unique('usuarios', 'correo')->ignore($usuario->id_usuario, 'id_usuario'),
            ],
            'rol' => ['sometimes', 'string', Rule::in(['Administrador', 'Cliente', 'Entrenador'])],
            'estado' => ['sometimes', 'string', Rule::in(['Activo', 'Inactivo'])],
            'fecha_registro' => 'sometimes|date',
        ]);

        $esMismoUsuario = (int) $request->user()->id_usuario === (int) $usuario->id_usuario;

        if ($esMismoUsuario && isset($datos['rol']) && $datos['rol'] !== 'Administrador') {
            throw ValidationException::withMessages(['rol' => ['No puedes quitarte tu propio rol de Administrador.']]);
        }

        if ($esMismoUsuario && isset($datos['estado']) && $datos['estado'] !== 'Activo') {
            throw ValidationException::withMessages(['estado' => ['No puedes desactivar tu propio usuario administrador.']]);
        }

        $rolFinal = $datos['rol'] ?? $usuario->rol;
        $dniFinal = $datos['dni'] ?? $usuario->dni;

        $datos['id_cliente'] = null;
        $datos['id_entrenador'] = null;

        if ($rolFinal === 'Cliente') {
            $cliente = Cliente::where('dni', $dniFinal)->first();
            if (!$cliente) {
                throw ValidationException::withMessages(['dni' => ['No existe un cliente con ese DNI.']]);
            }
            $datos['id_cliente'] = $cliente->id_cliente;
        }

        if ($rolFinal === 'Entrenador') {
            $entrenador = Entrenador::where('dni', $dniFinal)->first();
            if (!$entrenador) {
                throw ValidationException::withMessages(['dni' => ['No existe un entrenador con ese DNI.']]);
            }
            $datos['id_entrenador'] = $entrenador->id_entrenador;
        }

        $cambioContrasena = false;
        if (array_key_exists('contrasena', $datos)) {
            if ($datos['contrasena']) {
                $datos['contrasena'] = Hash::make($datos['contrasena']);
                $cambioContrasena = true;
            } else {
                unset($datos['contrasena']);
            }
        }

        $usuario->update($datos);

        if ($cambioContrasena || ($datos['estado'] ?? null) === 'Inactivo') {
            $usuario->tokens()->delete();
        }

        return response()->json($usuario->fresh(['cliente', 'entrenador']));
    }

    public function destroy(Request $request, string $id)
    {
        $usuario = Usuario::findOrFail($id);

        if ((int) $request->user()->id_usuario === (int) $usuario->id_usuario) {
            throw ValidationException::withMessages(['usuario' => ['No puedes desactivar tu propio usuario administrador.']]);
        }

        $usuario->update(['estado' => 'Inactivo']);
        $usuario->tokens()->delete();

        return response()->json([
            'mensaje' => 'Usuario desactivado. Se conservó su historial de operaciones.',
            'usuario' => $usuario->fresh(),
        ]);
    }
}
