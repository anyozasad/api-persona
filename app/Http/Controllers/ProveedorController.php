<?php

namespace App\Http\Controllers;

use App\Models\Proveedor;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProveedorController extends Controller
{
    public function index()
    {
        return response()->json(
            Proveedor::withCount('compras')->orderBy('razon_social')->get()
        );
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'ruc' => 'required|string|max:20|unique:proveedores,ruc',
            'razon_social' => 'required|string|max:180',
            'contacto' => 'nullable|string|max:150',
            'telefono' => 'nullable|string|max:25',
            'correo' => 'nullable|email|max:150',
            'direccion' => 'nullable|string|max:255',
            'estado' => ['nullable', Rule::in(['Activo', 'Inactivo'])],
        ]);

        $datos['estado'] = $datos['estado'] ?? 'Activo';

        return response()->json(Proveedor::create($datos), 201);
    }

    public function show(string $id)
    {
        return response()->json(
            Proveedor::with(['compras.detalles.producto'])->findOrFail($id)
        );
    }

    public function update(Request $request, string $id)
    {
        $proveedor = Proveedor::findOrFail($id);

        $datos = $request->validate([
            'ruc' => [
                'sometimes', 'string', 'max:20',
                Rule::unique('proveedores', 'ruc')->ignore($proveedor->id_proveedor, 'id_proveedor'),
            ],
            'razon_social' => 'sometimes|string|max:180',
            'contacto' => 'sometimes|nullable|string|max:150',
            'telefono' => 'sometimes|nullable|string|max:25',
            'correo' => 'sometimes|nullable|email|max:150',
            'direccion' => 'sometimes|nullable|string|max:255',
            'estado' => ['sometimes', Rule::in(['Activo', 'Inactivo'])],
        ]);

        $proveedor->update($datos);

        return response()->json($proveedor->fresh());
    }

    public function destroy(string $id)
    {
        $proveedor = Proveedor::findOrFail($id);
        $proveedor->update(['estado' => 'Inactivo']);

        return response()->json([
            'mensaje' => 'Proveedor desactivado. Se conserva el historial de compras.',
            'proveedor' => $proveedor->fresh(),
        ]);
    }
}
