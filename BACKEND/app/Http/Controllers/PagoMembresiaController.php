<?php

namespace App\Http\Controllers;

use App\Models\PagoMembresia;
use Illuminate\Support\Facades\Schema;

class PagoMembresiaController extends Controller
{
    public function index()
    {
        // Nunca confundir "no hay pagos" con una consulta fallida por tablas
        // ausentes, que fue el problema del dashboard en XAMPP.
        $requeridas = [
            'pagos_membresia' => ['id_pago','id_cliente_membresia','monto','fecha_pago','metodo_pago','estado_pago'],
            'cliente_membresia' => ['id_cliente_membresia','id_cliente','id_membresia'],
            'clientes' => ['id_cliente','nombres','apellidos'],
            'membresias' => ['id_membresia','nombre'],
        ];
        $faltantes = [];
        foreach ($requeridas as $tabla => $columnas) {
            if (!Schema::hasTable($tabla)) {
                $faltantes[] = 'tabla:'.$tabla;
                continue;
            }
            foreach ($columnas as $columna) {
                if (!Schema::hasColumn($tabla, $columna)) {
                    $faltantes[] = $tabla.'.'.$columna;
                }
            }
        }
        if ($faltantes !== []) {
            return response()->json([
                'codigo' => 'PAGOS_ESQUEMA_INCOMPLETO',
                'mensaje' => 'El historial de pagos no está disponible porque faltan tablas o columnas en MySQL.',
                'faltantes' => $faltantes,
            ], 503);
        }

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
