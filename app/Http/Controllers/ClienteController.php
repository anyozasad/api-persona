<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Http\Request;
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
            'correo' => 'nullable|email|max:150',
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

        $datos = $request->validate([
            'dni' => [
                'sometimes', 'string', 'max:15',
                Rule::unique('clientes', 'dni')->ignore($cliente->id_cliente, 'id_cliente'),
            ],
            'nombres' => 'sometimes|string|max:100',
            'apellidos' => 'sometimes|string|max:100',
            'sexo' => 'sometimes|nullable|string|max:20',
            'telefono' => 'sometimes|nullable|string|max:25',
            'correo' => 'sometimes|nullable|email|max:150',
            'direccion' => 'sometimes|nullable|string|max:255',
            'fecha_nacimiento' => 'sometimes|nullable|date|before:today',
            'estado' => ['sometimes', Rule::in(['Activo', 'Inactivo'])],
        ]);

        $cliente->update($datos);

        return response()->json($cliente->fresh());
    }

    public function destroy(string $id)
    {
        $cliente = Cliente::findOrFail($id);

        // Se conserva el historial financiero y de asistencias.
        $cliente->update(['estado' => 'Inactivo']);

        return response()->json([
            'mensaje' => 'Cliente dado de baja correctamente. Su historial fue conservado.',
            'cliente' => $cliente->fresh(),
        ]);
    }
}
