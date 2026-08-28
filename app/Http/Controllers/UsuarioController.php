<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    public function index()
    {
        return response()->json(Usuario::all());
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'nombre_usuario' => 'required|string|max:80|unique:usuarios,nombre_usuario',
            'contrasena' => 'required|string|min:6',
            'nombres' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'dni' => 'required|string|max:15|unique:usuarios,dni',
            'telefono' => 'nullable|string|max:25',
            'correo' => 'nullable|email|max:150',
            'rol' => 'required|string|max:50',
            'estado' => 'nullable|string|max:30',
            'fecha_registro' => 'nullable|date',
        ]);

        $datos['contrasena'] = Hash::make($datos['contrasena']);

        return response()->json(Usuario::create($datos), 201);
    }

    public function show(string $id)
    {
        return response()->json(Usuario::with(['compras', 'ventas'])->findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $usuario = Usuario::findOrFail($id);
        $datos = $request->only($usuario->getFillable());

        if (isset($datos['contrasena']) && $datos['contrasena'] !== '') {
            $datos['contrasena'] = Hash::make($datos['contrasena']);
        } else {
            unset($datos['contrasena']);
        }

        $usuario->update($datos);

        return response()->json($usuario);
    }

    public function destroy(string $id)
    {
        Usuario::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
