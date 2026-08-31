<?php

namespace App\Http\Controllers;

use App\Models\Entrenador;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EntrenadorController extends Controller
{
    public function index()
    {
        return response()->json(
            Entrenador::withCount(['rutinas', 'clases'])
                ->orderBy('nombres')
                ->orderBy('apellidos')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'dni' => 'required|string|max:15|unique:entrenadores,dni',
            'nombres' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'telefono' => 'nullable|string|max:25',
            'correo' => 'nullable|email|max:150',
            'especialidad' => 'nullable|string|max:150',
            'fecha_contratacion' => 'required|date',
            'salario' => 'required|numeric|min:0',
            'estado' => ['nullable', Rule::in(['Activo', 'Inactivo'])],
        ]);

        $datos['estado'] = $datos['estado'] ?? 'Activo';

        return response()->json(Entrenador::create($datos), 201);
    }

    public function show(string $id)
    {
        return response()->json(
            Entrenador::with(['rutinas.cliente', 'clases'])->findOrFail($id)
        );
    }

    public function update(Request $request, string $id)
    {
        $entrenador = Entrenador::findOrFail($id);

        $datos = $request->validate([
            'dni' => [
                'sometimes', 'string', 'max:15',
                Rule::unique('entrenadores', 'dni')->ignore($entrenador->id_entrenador, 'id_entrenador'),
            ],
            'nombres' => 'sometimes|string|max:100',
            'apellidos' => 'sometimes|string|max:100',
            'telefono' => 'sometimes|nullable|string|max:25',
            'correo' => 'sometimes|nullable|email|max:150',
            'especialidad' => 'sometimes|nullable|string|max:150',
            'fecha_contratacion' => 'sometimes|date',
            'salario' => 'sometimes|numeric|min:0',
            'estado' => ['sometimes', Rule::in(['Activo', 'Inactivo'])],
        ]);

        $entrenador->update($datos);

        return response()->json($entrenador->fresh());
    }

    public function destroy(string $id)
    {
        $entrenador = Entrenador::findOrFail($id);
        $entrenador->update(['estado' => 'Inactivo']);

        return response()->json([
            'mensaje' => 'Entrenador desactivado. Se conserva su historial de rutinas y clases.',
            'entrenador' => $entrenador->fresh(),
        ]);
    }
}
