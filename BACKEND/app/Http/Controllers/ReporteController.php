<?php

namespace App\Http\Controllers;

use App\Models\Asistencia;
use App\Models\ClienteMembresia;
use App\Models\PagoMembresia;
use App\Models\Venta;
use Carbon\Carbon;
use Illuminate\Http\Request;
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

    public function ingresos(Request $request)
    {
        $datos = $request->validate([
            'desde' => 'nullable|date',
            'hasta' => 'nullable|date|after_or_equal:desde',
        ]);

        $desde = isset($datos['desde']) ? Carbon::parse($datos['desde'])->startOfDay() : now()->startOfMonth();
        $hasta = isset($datos['hasta']) ? Carbon::parse($datos['hasta'])->endOfDay() : now()->endOfMonth();

        $pagosMembresia = PagoMembresia::query()
            ->where('estado_pago', 'Completado')
            ->whereBetween('fecha_pago', [$desde, $hasta])
            ->sum('monto');

        $ventas = Venta::query()
            ->whereBetween('fecha_venta', [$desde, $hasta])
            ->sum('total');

        return response()->json([
            'desde' => $desde->toDateString(),
            'hasta' => $hasta->toDateString(),
            'membresias' => round((float) $pagosMembresia, 2),
            'ventas_productos' => round((float) $ventas, 2),
            'total_ingresos' => round((float) $pagosMembresia + (float) $ventas, 2),
        ]);
    }

    public function vencimientos(Request $request)
    {
        $datos = $request->validate([
            'dias' => 'nullable|integer|min:1|max:90',
        ]);

        $dias = (int) ($datos['dias'] ?? 7);

        return response()->json(
            ClienteMembresia::with(['cliente', 'membresia'])
                ->where('estado', 'Activo')
                ->whereBetween('fecha_fin', [today()->toDateString(), today()->addDays($dias)->toDateString()])
                ->orderBy('fecha_fin')
                ->get()
        );
    }

    public function asistencias(Request $request)
    {
        $datos = $request->validate([
            'desde' => 'nullable|date',
            'hasta' => 'nullable|date|after_or_equal:desde',
        ]);

        $desde = $datos['desde'] ?? now()->startOfMonth()->toDateString();
        $hasta = $datos['hasta'] ?? now()->endOfMonth()->toDateString();

        $porDia = Asistencia::query()
            ->selectRaw('DATE(fecha_hora_entrada) as fecha, COUNT(*) as total')
            ->whereRaw('DATE(fecha_hora_entrada) BETWEEN ? AND ?', [$desde, $hasta])
            ->groupByRaw('DATE(fecha_hora_entrada)')
            ->orderBy('fecha')
            ->get();

        return response()->json([
            'desde' => $desde,
            'hasta' => $hasta,
            'total' => $porDia->sum('total'),
            'por_dia' => $porDia,
        ]);
    }
}
