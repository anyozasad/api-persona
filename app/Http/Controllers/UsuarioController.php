<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UsuarioController extends Controller
{
    public function index()
    {
        return response()->json(Usuario::orderBy('id_usuario', 'desc')->get());
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'nombre_usuario' => 'required|string|max:80|unique:usuarios,nombre_usuario',
            'contrasena' => 'required|string|min:8|max:100',
            'nombres' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'dni' => 'nullable|string|max:15|unique:usuarios,dni',
            'telefono' => 'nullable|string|max:25',
            'correo' => 'required|email|max:150|unique:usuarios,correo',
            'rol' => ['required', 'string', Rule::in(['Administrador', 'Cliente', 'Entrenador'])],
            'estado' => ['nullable', 'string', Rule::in(['Activo', 'Inactivo'])],
            'fecha_registro' => 'nullable|date',
        ]);

        $datos['contrasena'] = Hash::make($datos['contrasena']);
        $datos['estado'] = $datos['estado'] ?? 'Activo';
        $datos['fecha_registro'] = $datos['fecha_registro'] ?? now();

        return response()->json(Usuario::create($datos), 201);
    }

    public function show(string $id)
    {
        return response()->json(
            Usuario::with(['compras', 'ventas'])->findOrFail($id)
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
                'sometimes', 'nullable', 'string', 'max:15',
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
            throw ValidationException::withMessages([
                'rol' => ['No puedes quitarte tu propio rol de Administrador.'],
            ]);
        }

        if ($esMismoUsuario && isset($datos['estado']) && $datos['estado'] !== 'Activo') {
            throw ValidationException::withMessages([
                'estado' => ['No puedes desactivar tu propio usuario administrador.'],
            ]);
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

        if ($cambioContrasena) {
            $usuario->tokens()->delete();
        }

        return response()->json($usuario->fresh());
    }

    public function destroy(Request $request, string $id)
    {
        $usuario = Usuario::findOrFail($id);

        if ((int) $request->user()->id_usuario === (int) $usuario->id_usuario) {
            throw ValidationException::withMessages([
                'usuario' => ['No puedes eliminar tu propio usuario administrador.'],
            ]);
        }

        $usuario->tokens()->delete();
        $usuario->delete();

        return response()->json(null, 204);
    }
}
