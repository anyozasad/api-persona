<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class ReporteController extends Controller
{
    public function clientesMembresias()
    {
        return response()->json(
            DB::table('vista_clientes_membresias')->get()
        );
    }

    public function stock()
    {
        return response()->json(
            DB::table('vista_stock')->get()
        );
    }

    public function ventas()
    {
        return response()->json(
            DB::table('vista_ventas')->get()
        );
    }
}
