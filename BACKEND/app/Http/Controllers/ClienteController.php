<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ClienteController extends Controller
{
    public function index()
    {
        return response()->json(
            Cliente::orderBy('nombres')->orderBy('apellidos')->get()
        );
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'dni' => 'required|string|max:15|unique:clientes,dni',
            'nombres' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'sexo' => 'nullable|string|max:20',
            'telefono' => 'nullable|string|max:25',
            'correo' => 'nullable|email|max:150|unique:clientes,correo',
            'direccion' => 'nullable|string|max:255',
            'fecha_nacimiento' => 'nullable|date|before:today',
            'fecha_registro' => 'nullable|date',
            'estado' => ['nullable', Rule::in(['Activo', 'Inactivo'])],
        ]);

        $datos['fecha_registro'] = $datos['fecha_registro'] ?? now();
        $datos['estado'] = $datos['estado'] ?? 'Activo';

        return response()->json(Cliente::create($datos), 201);
    }

    public function show(string $id)
    {
        return response()->json(
            Cliente::with([
                'clienteMembresias.membresia',
                'clienteMembresias.pagos',
                'asistencias',
                'rutinas.entrenador',
                'ventas.detalles.producto',
            ])->findOrFail($id)
        );
    }

    public function update(Request $request, string $id)
    {
        $cliente = Cliente::findOrFail($id);
        $usuario = Usuario::where('id_cliente', $cliente->id_cliente)->first();

        $datos = $request->validate([
            'dni' => [
                'sometimes', 'string', 'max:15',
                Rule::unique('clientes', 'dni')->ignore($cliente->id_cliente, 'id_cliente'),
                Rule::unique('usuarios', 'dni')->ignore($usuario?->id_usuario ?? 0, 'id_usuario'),
            ],
            'nombres' => 'sometimes|string|max:100',
            'apellidos' => 'sometimes|string|max:100',
            'sexo' => 'sometimes|nullable|string|max:20',
            'telefono' => 'sometimes|nullable|string|max:25',
            'correo' => [
                'sometimes', 'nullable', 'email', 'max:150',
                Rule::unique('clientes', 'correo')->ignore($cliente->id_cliente, 'id_cliente'),
                Rule::unique('usuarios', 'correo')->ignore($usuario?->id_usuario ?? 0, 'id_usuario'),
            ],
            'direccion' => 'sometimes|nullable|string|max:255',
            'fecha_nacimiento' => 'sometimes|nullable|date|before:today',
            'estado' => ['sometimes', Rule::in(['Activo', 'Inactivo'])],
        ]);

        DB::transaction(function () use ($cliente, $usuario, $datos) {
            $cliente->update($datos);

            if ($usuario) {
                $sincronizar = array_intersect_key($datos, array_flip([
                    'dni', 'nombres', 'apellidos', 'telefono', 'correo', 'estado',
                ]));
                if ($sincronizar) {
                    $usuario->update($sincronizar);
                    if (($sincronizar['estado'] ?? null) === 'Inactivo') {
                        $usuario->tokens()->delete();
                    }
                }
            }
        });

        return response()->json($cliente->fresh());
    }

    public function destroy(string $id)
    {
        $cliente = Cliente::findOrFail($id);

        DB::transaction(function () use ($cliente) {
            $cliente->update(['estado' => 'Inactivo']);

            Usuario::where(function ($q) use ($cliente) {
                $q->where('id_cliente', $cliente->id_cliente)
                  ->orWhere(function ($q2) use ($cliente) {
                      $q2->whereNull('id_cliente')->where('dni', $cliente->dni)->where('rol', 'Cliente');
                  });
            })->get()->each(function (Usuario $usuario) {
                $usuario->update(['estado' => 'Inactivo']);
                $usuario->tokens()->delete();
            });
        });

        return response()->json([
            'mensaje' => 'Cliente y acceso asociados fueron desactivados. El historial fue conservado.',
            'cliente' => $cliente->fresh(),
        ]);
    }
}
