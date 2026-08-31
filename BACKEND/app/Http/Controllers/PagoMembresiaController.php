<?php

namespace App\Http\Controllers;

use App\Models\PagoMembresia;

class PagoMembresiaController extends Controller
{
    public function index()
    {
        return response()->json(
            PagoMembresia::with(['clienteMembresia.cliente', 'clienteMembresia.membresia'])
                ->orderByDesc('fecha_pago')
                ->get()
        );
    }

    public function show(string $id)
    {
        return response()->json(
            PagoMembresia::with(['clienteMembresia.cliente', 'clienteMembresia.membresia'])
                ->findOrFail($id)
        );
    }
}
