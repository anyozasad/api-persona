<?php

namespace App\Http\Controllers;

use App\Models\Asistencia;
use App\Models\Caja;
use App\Models\Cliente;
use App\Models\ClienteMembresia;
use App\Models\DetalleVenta;
use App\Models\PagoMembresia;
use App\Models\Producto;
use App\Models\Reserva;
use App\Models\Venta;
use App\Models\SolicitudSoporte;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function resumen()
    {
        $hoy = today();
        $inicioMes = now()->startOfMonth();
        $finMes = now()->endOfMonth();
        $inicioMesAnterior = now()->subMonthNoOverflow()->startOfMonth();
        $finMesAnterior = now()->subMonthNoOverflow()->endOfMonth();

        $ventasValidas = fn ($query) => $query->where(function ($q) {
            $q->whereNull('estado')->orWhere('estado', '!=', 'Anulado');
        });

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

        $ingresosMembresiasMesAnterior = PagoMembresia::query()
            ->where('estado_pago', 'Completado')
            ->whereBetween('fecha_pago', [$inicioMesAnterior, $finMesAnterior])
            ->sum('monto');

        $ventasMesQuery = Venta::query()->whereBetween('fecha_venta', [$inicioMes, $finMes]);
        $ventasValidas($ventasMesQuery);
        $ventasMes = (float) $ventasMesQuery->sum('total');

        $ventasMesAnteriorQuery = Venta::query()->whereBetween('fecha_venta', [$inicioMesAnterior, $finMesAnterior]);
        $ventasValidas($ventasMesAnteriorQuery);
        $ventasMesAnterior = (float) $ventasMesAnteriorQuery->sum('total');

        $ventasHoyQuery = Venta::query()->whereDate('fecha_venta', $hoy);
        $ventasValidas($ventasHoyQuery);
        $ventasHoyTotal = (float) (clone $ventasHoyQuery)->sum('total');
        $ventasHoyCantidad = (clone $ventasHoyQuery)->count();

        $totalMes = (float) $ingresosMembresiasMes + $ventasMes;
        $totalMesAnterior = (float) $ingresosMembresiasMesAnterior + $ventasMesAnterior;
        $variacion = $totalMesAnterior > 0
            ? (($totalMes - $totalMesAnterior) / $totalMesAnterior) * 100
            : ($totalMes > 0 ? 100 : 0);

        $pagosPendientes = PagoMembresia::with(['clienteMembresia.cliente', 'clienteMembresia.membresia'])
            ->where('estado_pago', 'Pendiente')
            ->orderBy('fecha_pago')
            ->get();

        $reservasHoy = Reserva::with(['cliente', 'clase.entrenador'])
            ->whereDate('fecha_clase', $hoy)
            ->where('estado', 'Reservada')
            ->orderBy('id_clase')
            ->get();

        $ventasRecientes = Venta::with('cliente')
            ->where(function ($q) {
                $q->whereNull('estado')->orWhere('estado', '!=', 'Anulado');
            })
            ->orderByDesc('fecha_venta')
            ->limit(6)
            ->get();

        $topProductos = DetalleVenta::query()
            ->select('productos.id_producto', 'productos.nombre_producto')
            ->selectRaw('SUM(detalle_venta.cantidad) as cantidad')
            ->selectRaw('SUM(detalle_venta.subtotal) as importe')
            ->join('productos', 'productos.id_producto', '=', 'detalle_venta.id_producto')
            ->join('ventas', 'ventas.id_venta', '=', 'detalle_venta.id_venta')
            ->whereBetween('ventas.fecha_venta', [$inicioMes, $finMes])
            ->where(function ($q) {
                $q->whereNull('ventas.estado')->orWhere('ventas.estado', '!=', 'Anulado');
            })
            ->groupBy('productos.id_producto', 'productos.nombre_producto')
            ->orderByDesc('cantidad')
            ->limit(5)
            ->get();

        $cajaActual = Caja::with('usuarioApertura')
            ->where('estado', 'Abierta')
            ->orderByDesc('fecha_apertura')
            ->first();

        // Datos históricos para gráficas del dashboard.
        $ingresosSeisMeses = collect();
        for ($i = 5; $i >= 0; $i--) {
            $mes = now()->copy()->subMonthsNoOverflow($i);
            $desde = $mes->copy()->startOfMonth();
            $hasta = $mes->copy()->endOfMonth();

            $membresias = (float) PagoMembresia::query()
                ->where('estado_pago', 'Completado')
                ->whereBetween('fecha_pago', [$desde, $hasta])
                ->sum('monto');

            $ventasQuery = Venta::query()->whereBetween('fecha_venta', [$desde, $hasta]);
            $ventasValidas($ventasQuery);
            $ventas = (float) $ventasQuery->sum('total');

            $ingresosSeisMeses->push([
                'mes' => ucfirst($mes->locale('es')->translatedFormat('M')),
                'anio' => $mes->format('Y'),
                'membresias' => round($membresias, 2),
                'ventas' => round($ventas, 2),
                'total' => round($membresias + $ventas, 2),
            ]);
        }

        $asistenciasSieteDias = collect();
        for ($i = 6; $i >= 0; $i--) {
            $dia = today()->copy()->subDays($i);
            $asistenciasSieteDias->push([
                'dia' => ucfirst($dia->locale('es')->translatedFormat('D')),
                'fecha' => $dia->format('d/m'),
                'total' => Asistencia::whereDate('fecha_hora_entrada', $dia)->count(),
            ]);
        }

        $membresiasPorPlan = ClienteMembresia::query()
            ->select('membresias.nombre')
            ->selectRaw('COUNT(*) as total')
            ->join('membresias', 'membresias.id_membresia', '=', 'cliente_membresia.id_membresia')
            ->where('cliente_membresia.estado', 'Activo')
            ->whereDate('cliente_membresia.fecha_inicio', '<=', $hoy)
            ->whereDate('cliente_membresia.fecha_fin', '>=', $hoy)
            ->groupBy('membresias.nombre')
            ->orderByDesc('total')
            ->get();

        $soportePendiente = SolicitudSoporte::where('estado', 'Pendiente')->count();
        $alertasTotal = $porVencer->count() + $stockBajo->count() + $pagosPendientes->count() + $soportePendiente;

        return response()->json([
            'periodo' => [
                'fecha' => $hoy->format('d/m/Y'),
                'mes' => now()->translatedFormat('F Y'),
            ],
            'clientes' => [
                'total' => Cliente::count(),
                'activos' => Cliente::where('estado', 'Activo')->count(),
                'nuevos_mes' => Cliente::whereBetween('fecha_registro', [$inicioMes, $finMes])->count(),
            ],
            'membresias' => [
                'activas' => $membresiasActivas,
                'por_vencer_7_dias' => $porVencer->count(),
                'detalle_por_vencer' => $porVencer,
                'pagos_pendientes' => $pagosPendientes->count(),
                'detalle_pagos_pendientes' => $pagosPendientes,
            ],
            'asistencias' => [
                'hoy' => Asistencia::whereDate('fecha_hora_entrada', $hoy)->count(),
                'dentro_ahora' => Asistencia::whereNull('fecha_hora_salida')->count(),
            ],
            'reservas' => [
                'hoy' => $reservasHoy->count(),
                'detalle_hoy' => $reservasHoy,
            ],
            'ventas' => [
                'hoy_total' => round($ventasHoyTotal, 2),
                'hoy_cantidad' => $ventasHoyCantidad,
                'mes_cantidad' => Venta::whereBetween('fecha_venta', [$inicioMes, $finMes])
                    ->where(function ($q) {
                        $q->whereNull('estado')->orWhere('estado', '!=', 'Anulado');
                    })->count(),
                'recientes' => $ventasRecientes,
                'top_productos' => $topProductos,
            ],
            'ingresos' => [
                'membresias_mes' => round((float) $ingresosMembresiasMes, 2),
                'ventas_mes' => round($ventasMes, 2),
                'total_mes' => round($totalMes, 2),
                'mes_anterior' => round($totalMesAnterior, 2),
                'variacion_mes' => round($variacion, 1),
            ],
            'inventario' => [
                'productos_stock_bajo' => $stockBajo->count(),
                'detalle_stock_bajo' => $stockBajo,
                'valor_stock_compra' => round((float) Producto::query()
                    ->selectRaw('SUM(stock * precio_compra) as total')
                    ->value('total'), 2),
            ],
            'caja' => [
                'abierta' => (bool) $cajaActual,
                'detalle' => $cajaActual,
            ],
            'tendencias' => [
                'ingresos_6_meses' => $ingresosSeisMeses,
                'asistencias_7_dias' => $asistenciasSieteDias,
                'membresias_por_plan' => $membresiasPorPlan,
            ],
            'alertas' => [
                'total' => $alertasTotal,
                'soporte_pendiente' => $soportePendiente,
            ],
        ]);
    }
}
