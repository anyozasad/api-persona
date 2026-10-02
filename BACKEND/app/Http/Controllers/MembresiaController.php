<?php

namespace App\Http\Controllers;

use App\Models\Membresia;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MembresiaController extends Controller
{
    public function index()
    {
        return response()->json(
            Membresia::withCount('clienteMembresias')
                ->orderBy('precio')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'nombre' => 'required|string|max:100|unique:membresias,nombre',
            'duracion_meses' => 'required|integer|min:1|max:36',
            'precio' => 'required|numeric|min:0',
            'descripcion' => 'nullable|string|max:500',
            'beneficios' => 'nullable|array|max:12',
            'beneficios.*' => 'required|string|max:150',
            'permite_reservas' => 'nullable|boolean',
            'estado' => ['nullable', Rule::in(['Activo', 'Inactivo'])],
        ]);

        $datos['estado'] = $datos['estado'] ?? 'Activo';
        $datos['permite_reservas'] = $datos['permite_reservas'] ?? true;

        return response()->json(Membresia::create($datos), 201);
    }

    public function show(Membresia $membresia)
    {
        return response()->json(
            $membresia->load(['clienteMembresias.cliente', 'clienteMembresias.pagos'])
        );
    }

    public function update(Request $request, Membresia $membresia)
    {
        $datos = $request->validate([
            'nombre' => [
                'sometimes', 'string', 'max:100',
                Rule::unique('membresias', 'nombre')->ignore($membresia->id_membresia, 'id_membresia'),
            ],
            'duracion_meses' => 'sometimes|integer|min:1|max:36',
            'precio' => 'sometimes|numeric|min:0',
            'descripcion' => 'sometimes|nullable|string|max:500',
            'beneficios' => 'sometimes|nullable|array|max:12',
            'beneficios.*' => 'required|string|max:150',
            'permite_reservas' => 'sometimes|boolean',
            'estado' => ['sometimes', Rule::in(['Activo', 'Inactivo'])],
        ]);

        $membresia->update($datos);

        return response()->json($membresia->fresh());
    }

    public function destroy(Membresia $membresia)
    {
        $membresia->update(['estado' => 'Inactivo']);

        return response()->json([
            'mensaje' => 'Membresía desactivada. Se conserva el historial de clientes y pagos.',
            'membresia' => $membresia->fresh(),
        ]);
    }
}
