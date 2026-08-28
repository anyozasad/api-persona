<?php

namespace App\Http\Controllers;

use App\Models\Asistencia;
use App\Models\Cliente;
use App\Models\ClienteMembresia;
use App\Models\PagoMembresia;
use App\Models\Producto;
use App\Models\Venta;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function resumen()
    {
        $hoy = today();
        $inicioMes = now()->startOfMonth();
        $finMes = now()->endOfMonth();

        $membresiasActivas = ClienteMembresia::query()
            ->where('estado', 'Activo')
            ->whereDate('fecha_inicio', '<=', $hoy)
            ->whereDate('fecha_fin', '>=', $hoy)
            ->count();

        $porVencer = ClienteMembresia::with(['cliente', 'membresia'])
            ->where('estado', 'Activo')
            ->whereBetween('fecha_fin', [$hoy->toDateString(), $hoy->copy()->addDays(7)->toDateString()])
            ->orderBy('fecha_fin')
            ->get();

        $stockBajo = Producto::query()
            ->whereColumn('stock', '<=', 'stock_minimo')
            ->where('estado', 'Activo')
            ->orderBy('stock')
            ->get();

        $ingresosMembresiasMes = PagoMembresia::query()
            ->where('estado_pago', 'Completado')
            ->whereBetween('fecha_pago', [$inicioMes, $finMes])
            ->sum('monto');

        $ventasMes = Venta::query()
            ->whereBetween('fecha_venta', [$inicioMes, $finMes])
            ->sum('total');

        return response()->json([
            'clientes' => [
                'total' => Cliente::count(),
                'activos' => Cliente::where('estado', 'Activo')->count(),
            ],
            'membresias' => [
                'activas' => $membresiasActivas,
                'por_vencer_7_dias' => $porVencer->count(),
                'detalle_por_vencer' => $porVencer,
            ],
            'asistencias' => [
                'hoy' => Asistencia::whereDate('fecha_hora_entrada', $hoy)->count(),
                'dentro_ahora' => Asistencia::whereNull('fecha_hora_salida')->count(),
            ],
            'ingresos' => [
                'membresias_mes' => round((float) $ingresosMembresiasMes, 2),
                'ventas_mes' => round((float) $ventasMes, 2),
                'total_mes' => round((float) $ingresosMembresiasMes + (float) $ventasMes, 2),
            ],
            'inventario' => [
                'productos_stock_bajo' => $stockBajo->count(),
                'detalle_stock_bajo' => $stockBajo,
                'valor_stock_compra' => round((float) Producto::query()
                    ->selectRaw('SUM(stock * precio_compra) as total')
                    ->value('total'), 2),
            ],
        ]);
    }
}
