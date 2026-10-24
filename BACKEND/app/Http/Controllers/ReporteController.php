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
        return response()->json(DB::table('vista_clientes_membresias')->get());
    }

    public function stock()
    {
        return response()->json(DB::table('vista_stock')->get());
    }

    public function ventas()
    {
        return response()->json(DB::table('vista_ventas')->get());
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
            ->where(fn ($q) => $q->whereNull('estado')->orWhere('estado', '!=', 'Anulado'))
            ->sum('total');

        $anio = (int) $hasta->year;
        $membresiasPorMes = PagoMembresia::query()
            ->selectRaw('MONTH(fecha_pago) as mes, SUM(monto) as total')
            ->where('estado_pago', 'Completado')
            ->whereYear('fecha_pago', $anio)
            ->groupByRaw('MONTH(fecha_pago)')
            ->pluck('total', 'mes');

        $ventasPorMes = Venta::query()
            ->selectRaw('MONTH(fecha_venta) as mes, SUM(total) as total')
            ->whereYear('fecha_venta', $anio)
            ->where(fn ($q) => $q->whereNull('estado')->orWhere('estado', '!=', 'Anulado'))
            ->groupByRaw('MONTH(fecha_venta)')
            ->pluck('total', 'mes');

        $porMes = collect(range(1, 12))->map(function ($mes) use ($membresiasPorMes, $ventasPorMes) {
            $membresias = (float) ($membresiasPorMes[$mes] ?? 0);
            $ventas = (float) ($ventasPorMes[$mes] ?? 0);

            return [
                'mes' => $mes,
                'membresias' => round($membresias, 2),
                'ventas_productos' => round($ventas, 2),
                'total' => round($membresias + $ventas, 2),
            ];
        })->values();

        $totalAnual = (float) $porMes->sum('total');
        $membresiasAnual = (float) $porMes->sum('membresias');
        $ventasAnual = (float) $porMes->sum('ventas_productos');

        return response()->json([
            'desde' => $desde->toDateString(),
            'hasta' => $hasta->toDateString(),
            'anio' => $anio,
            'membresias' => round((float) $pagosMembresia, 2),
            'ventas_productos' => round((float) $ventas, 2),
            'total_ingresos' => round((float) $pagosMembresia + (float) $ventas, 2),
            'membresias_anual' => round($membresiasAnual, 2),
            'ventas_productos_anual' => round($ventasAnual, 2),
            'total_anual' => round($totalAnual, 2),
            'por_mes' => $porMes,
        ]);
    }

    public function vencimientos(Request $request)
    {
        $datos = $request->validate(['dias' => 'nullable|integer|min:1|max:90']);
        $dias = (int) ($datos['dias'] ?? 7);

        return response()->json(
            ClienteMembresia::with(['cliente', 'membresia'])
                ->where('estado', 'Activo')
                ->whereBetween('fecha_fin', [today()->toDateString(), today()->copy()->addDays($dias)->toDateString()])
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
