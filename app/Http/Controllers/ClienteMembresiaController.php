<?php

namespace App\Http\Controllers;

use App\Models\ClienteMembresia;

class ClienteMembresiaController extends Controller
{
    public function index()
    {
        return response()->json(
            ClienteMembresia::with(['cliente', 'membresia', 'pagos'])
                ->orderByDesc('fecha_fin')
                ->get()
        );
    }

    public function show(string $id)
    {
        return response()->json(
            ClienteMembresia::with(['cliente', 'membresia', 'pagos'])
                ->findOrFail($id)
        );
    }
}
