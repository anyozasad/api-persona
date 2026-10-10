<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Support\Facades\DB;
use Throwable;

class DashboardController extends Controller
{
    private ConnectionInterface $db;
    private $schema;
    private array $columnCache = [];

    public function __construct()
    {
        /*
         * Fuente única de verdad:
         * el dashboard administrativo debe leer la misma base de datos que
         * usa el portal del cliente y los CRUD del administrador.
         *
         * Antes intentaba abrir otra base (gym_system), por eso un cambio hecho
         * por el usuario podía existir en el portal pero no aparecer en el dashboard.
         */
        $this->db = DB::connection();
        $this->schema = $this->db->getSchemaBuilder();
    }

    public function resumen()
    {
        $hoy = today();
        $inicioMes = now()->startOfMonth();
        $finMes = now()->endOfMonth();

        $tablas = [
            'socios' => $this->tabla(['socios', 'clientes']),
            'planes' => $this->tabla(['planes', 'membresias']),
            'suscripciones' => $this->tabla(['suscripciones', 'cliente_membresia']),
            'pagos' => $this->tabla(['pagos_membresia']),
            'asistencias' => $this->tabla(['asistencias']),
            'ventas' => $this->tabla(['ventas']),
            'detalle_ventas' => $this->tabla(['detalle_ventas', 'detalle_venta']),
            'productos' => $this->tabla(['productos']),
            'gastos' => $this->tabla(['gastos', 'movimientos_caja']),
            'cajas' => $this->tabla(['cajas']),
            'reservas' => $this->tabla(['reservas']),
            'soporte' => $this->tabla(['solicitudes_soporte']),
        ];

        $socios = $this->resumenSocios($tablas['socios'], $inicioMes, $finMes);
        $suscripciones = $this->resumenSuscripciones(
            $tablas['suscripciones'],
            $tablas['planes'],
            $tablas['socios'],
            $hoy
        );

        $ventasMes = $this->ventasTotalPeriodo($tablas['ventas'], $inicioMes, $finMes);
        $ventasHoy = $this->ventasTotalPeriodo($tablas['ventas'], $hoy->copy()->startOfDay(), $hoy->copy()->endOfDay());
        $ventasHoyCantidad = $this->ventasCantidadPeriodo($tablas['ventas'], $hoy->copy()->startOfDay(), $hoy->copy()->endOfDay());

        $ingresosSuscripciones = $this->ingresosSuscripcionesPeriodo(
            $tablas['pagos'],
            $tablas['suscripciones'],
            $tablas['planes'],
            $inicioMes,
            $finMes
        );

        $gastosMes = $this->gastosPeriodo($tablas['gastos'], $inicioMes, $finMes);
        $ingresosMes = $ventasMes + $ingresosSuscripciones;
        $utilidadMes = $ingresosMes - $gastosMes;

        $inicioMesAnterior = now()->subMonthNoOverflow()->startOfMonth();
        $finMesAnterior = now()->subMonthNoOverflow()->endOfMonth();
        $ventasAnterior = $this->ventasTotalPeriodo($tablas['ventas'], $inicioMesAnterior, $finMesAnterior);
        $suscripcionesAnterior = $this->ingresosSuscripcionesPeriodo(
            $tablas['pagos'],
            $tablas['suscripciones'],
            $tablas['planes'],
            $inicioMesAnterior,
            $finMesAnterior
        );
        $totalAnterior = $ventasAnterior + $suscripcionesAnterior;
        $variacion = $totalAnterior > 0
            ? (($ingresosMes - $totalAnterior) / $totalAnterior) * 100
            : ($ingresosMes > 0 ? 100 : 0);

        $asistenciaHoy = $this->asistenciasEnFecha($tablas['asistencias'], $hoy);
        $dentroAhora = $this->personasDentro($tablas['asistencias']);
        $stock = $this->resumenInventario($tablas['productos']);
        $caja = $this->cajaActual($tablas['cajas']);
        $reservas = $this->reservasHoy($tablas['reservas'], $hoy);
        $ventasRecientes = $this->ventasRecientes($tablas['ventas'], $tablas['socios']);
        $topProductos = $this->topProductos(
            $tablas['detalle_ventas'],
            $tablas['ventas'],
            $tablas['productos'],
            $inicioMes,
            $finMes
        );

        $ingresosSeisMeses = collect();
        for ($i = 5; $i >= 0; $i--) {
            $mes = now()->copy()->subMonthsNoOverflow($i);
            $desde = $mes->copy()->startOfMonth();
            $hasta = $mes->copy()->endOfMonth();
            $membresias = $this->ingresosSuscripcionesPeriodo(
                $tablas['pagos'],
                $tablas['suscripciones'],
                $tablas['planes'],
                $desde,
                $hasta
            );
            $ventas = $this->ventasTotalPeriodo($tablas['ventas'], $desde, $hasta);

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
                'total' => $this->asistenciasEnFecha($tablas['asistencias'], $dia),
            ]);
        }

        $soportePendiente = $this->soportePendiente($tablas['soporte']);
        $rutinasPendientes = $this->rutinasPendientes($tablas['soporte']);
        $opinionesPendientes = $this->opinionesPendientes();
        $actividadPortal = $this->actividadPortal();
        $pagosRegistrados = $tablas['pagos'] ? (int) $this->db->table($tablas['pagos'])->count() : 0;

        // Las compras del portal del cliente se completan automáticamente.
        // El dato heredado se conserva solo por compatibilidad, pero ya no requiere acción del administrador.
        $pagosPendientes = $suscripciones['pagos_pendientes'];
        $alertasTotal = count($suscripciones['detalle_por_vencer'])
            + $stock['productos_stock_bajo']
            + $soportePendiente
            + $opinionesPendientes;

        return response()->json([
            'fuente' => [
                'base_datos' => $this->db->getDatabaseName(),
                'tablas_detectadas' => array_values(array_filter($tablas)),
                'modo' => 'base_principal_compartida',
            ],
            'periodo' => [
                'fecha' => $hoy->format('d/m/Y'),
                'mes' => now()->locale('es')->translatedFormat('F Y'),
            ],
            'clientes' => [
                'total' => $socios['total'],
                'activos' => $socios['activos'],
                'nuevos_mes' => $socios['nuevos_mes'],
            ],
            'membresias' => [
                'activas' => $suscripciones['activas'],
                'por_vencer_7_dias' => count($suscripciones['detalle_por_vencer']),
                'detalle_por_vencer' => $suscripciones['detalle_por_vencer'],
                'pagos_pendientes' => $pagosPendientes,
                'pagos_registrados' => $pagosRegistrados,
                'detalle_pagos_pendientes' => [],
            ],
            'asistencias' => [
                'hoy' => $asistenciaHoy,
                'dentro_ahora' => $dentroAhora,
            ],
            'reservas' => [
                'hoy' => count($reservas),
                'detalle_hoy' => $reservas,
            ],
            'ventas' => [
                'hoy_total' => round($ventasHoy, 2),
                'hoy_cantidad' => $ventasHoyCantidad,
                'mes_cantidad' => $this->ventasCantidadPeriodo($tablas['ventas'], $inicioMes, $finMes),
                'recientes' => $ventasRecientes,
                'top_productos' => $topProductos,
            ],
            'ingresos' => [
                'membresias_mes' => round($ingresosSuscripciones, 2),
                'ventas_mes' => round($ventasMes, 2),
                'total_mes' => round($ingresosMes, 2),
                'mes_anterior' => round($totalAnterior, 2),
                'variacion_mes' => round($variacion, 1),
            ],
            'gastos' => [
                'total_mes' => round($gastosMes, 2),
            ],
            'utilidad' => [
                'total_mes' => round($utilidadMes, 2),
            ],
            'inventario' => [
                'productos_stock_bajo' => $stock['productos_stock_bajo'],
                'detalle_stock_bajo' => $stock['detalle_stock_bajo'],
                'valor_stock_compra' => $stock['valor_stock_compra'],
            ],
            'caja' => [
                'abierta' => (bool) $caja,
                'detalle' => $caja,
            ],
            'tendencias' => [
                'ingresos_6_meses' => $ingresosSeisMeses,
                'asistencias_7_dias' => $asistenciasSieteDias,
                'membresias_por_plan' => $suscripciones['por_plan'],
            ],
            'alertas' => [
                'total' => $alertasTotal,
                'soporte_pendiente' => $soportePendiente,
                'rutinas_pendientes' => $rutinasPendientes,
                'opiniones_pendientes' => $opinionesPendientes,
            ],
            'portal_clientes' => [
                'actividad_reciente' => $actividadPortal,
                'soporte_pendiente' => $soportePendiente,
                'rutinas_pendientes' => $rutinasPendientes,
                'opiniones_pendientes' => $opinionesPendientes,
                'ultima_sincronizacion' => now()->toIso8601String(),
            ],
        ]);
    }

    private function tabla(array $candidatas): ?string
    {
        foreach ($candidatas as $tabla) {
            try {
                if ($this->schema->hasTable($tabla)) {
                    return $tabla;
                }
            } catch (\Throwable $e) {
                return null;
            }
        }
        return null;
    }

    private function columnas(string $tabla): array
    {
        if (!isset($this->columnCache[$tabla])) {
            try {
                $this->columnCache[$tabla] = $this->schema->getColumnListing($tabla);
            } catch (\Throwable $e) {
                $this->columnCache[$tabla] = [];
            }
        }
        return $this->columnCache[$tabla];
    }

    private function columna(?string $tabla, array $candidatas): ?string
    {
        if (!$tabla) {
            return null;
        }

        $columnas = $this->columnas($tabla);
        $mapa = [];
        foreach ($columnas as $columna) {
            $mapa[strtolower($columna)] = $columna;
        }

        foreach ($candidatas as $candidata) {
            $clave = strtolower($candidata);
            if (isset($mapa[$clave])) {
                return $mapa[$clave];
            }
        }

        return null;
    }

    private function valor($fila, array $candidatas, $defecto = null)
    {
        if (!$fila) {
            return $defecto;
        }

        foreach ($candidatas as $candidata) {
            if (isset($fila->{$candidata}) || property_exists($fila, $candidata)) {
                return $fila->{$candidata};
            }
        }

        return $defecto;
    }

    private function aplicarActivo($query, ?string $tabla): void
    {
        $estado = $this->columna($tabla, ['estado', 'status', 'estatus', 'activo']);
        if (!$estado) {
            return;
        }

        $query->where(function ($q) use ($estado) {
            $q->whereIn($estado, ['Activo', 'ACTIVO', 'activo', 'Activa', 'ACTIVA', 'activa', 'Active', 'ACTIVE', 1, '1', 'Si', 'Sí'])
                ->orWhereNull($estado);
        });
    }

    private function aplicarVentaValida($query, ?string $tabla): void
    {
        $estado = $this->columna($tabla, ['estado', 'status', 'estatus']);
        if (!$estado) {
            return;
        }

        $query->where(function ($q) use ($estado) {
            $q->whereNull($estado)
                ->orWhereNotIn($estado, ['Anulado', 'ANULADO', 'anulado', 'Cancelado', 'CANCELADO', 'cancelado']);
        });
    }

    private function resumenSocios(?string $tabla, Carbon $inicio, Carbon $fin): array
    {
        if (!$tabla) {
            return ['total' => 0, 'activos' => 0, 'nuevos_mes' => 0];
        }

        $total = $this->db->table($tabla)->count();
        $activosQuery = $this->db->table($tabla);
        $this->aplicarActivo($activosQuery, $tabla);
        $activos = $activosQuery->count();

        $fecha = $this->columna($tabla, ['fecha_registro', 'fecha_alta', 'fecha_creacion', 'created_at']);
        $nuevos = $fecha
            ? $this->db->table($tabla)->whereBetween($fecha, [$inicio, $fin])->count()
            : 0;

        return compact('total', 'activos') + ['nuevos_mes' => $nuevos];
    }

    private function resumenSuscripciones(?string $tabla, ?string $planes, ?string $socios, Carbon $hoy): array
    {
        $resultado = [
            'activas' => 0,
            'detalle_por_vencer' => [],
            'pagos_pendientes' => 0,
            'por_plan' => [],
        ];

        if (!$tabla) {
            return $resultado;
        }

        $inicio = $this->columna($tabla, ['fecha_inicio', 'inicio', 'fecha_suscripcion']);
        $fin = $this->columna($tabla, ['fecha_fin', 'fecha_vencimiento', 'vencimiento', 'fin']);
        $estado = $this->columna($tabla, ['estado', 'status', 'estatus']);

        $activas = $this->db->table($tabla);
        if ($inicio) {
            $activas->whereDate($inicio, '<=', $hoy);
        }
        if ($fin) {
            $activas->whereDate($fin, '>=', $hoy);
        }
        $this->aplicarActivo($activas, $tabla);
        $resultado['activas'] = $activas->count();

        if ($estado) {
            $resultado['pagos_pendientes'] = $this->db->table($tabla)
                ->whereIn($estado, ['Pendiente', 'PENDIENTE', 'pendiente'])
                ->count();
        }

        if ($fin) {
            $vence = $this->db->table($tabla)
                ->whereBetween($fin, [$hoy->toDateString(), $hoy->copy()->addDays(7)->toDateString()])
                ->orderBy($fin)
                ->limit(8);
            $this->aplicarActivo($vence, $tabla);

            $idSocioCol = $this->columna($tabla, ['id_socio', 'id_cliente']);
            $idPlanCol = $this->columna($tabla, ['id_plan', 'id_membresia']);
            $socioId = $this->columna($socios, ['id_socio', 'id_cliente', 'id']);
            $planId = $this->columna($planes, ['id_plan', 'id_membresia', 'id']);

            foreach ($vence->get() as $fila) {
                $socio = null;
                $plan = null;

                if ($socios && $idSocioCol && $socioId) {
                    $socio = $this->db->table($socios)
                        ->where($socioId, $this->valor($fila, [$idSocioCol]))
                        ->first();
                }

                if ($planes && $idPlanCol && $planId) {
                    $plan = $this->db->table($planes)
                        ->where($planId, $this->valor($fila, [$idPlanCol]))
                        ->first();
                }

                $resultado['detalle_por_vencer'][] = [
                    'fecha_fin' => $this->valor($fila, [$fin]),
                    'cliente' => $this->normalizarPersona($socio),
                    'membresia' => [
                        'nombre' => $this->valor($plan, ['nombre', 'nombre_plan', 'plan'], 'Plan'),
                    ],
                ];
            }
        }

        if ($planes) {
            $idPlanSub = $this->columna($tabla, ['id_plan', 'id_membresia']);
            $idPlan = $this->columna($planes, ['id_plan', 'id_membresia', 'id']);
            $nombrePlan = $this->columna($planes, ['nombre', 'nombre_plan', 'plan']);

            if ($idPlanSub && $idPlan && $nombrePlan) {
                $q = $this->db->table($tabla . ' as s')
                    ->join($planes . ' as p', 'p.' . $idPlan, '=', 's.' . $idPlanSub)
                    ->select('p.' . $nombrePlan . ' as nombre')
                    ->selectRaw('COUNT(*) as total')
                    ->groupBy('p.' . $nombrePlan)
                    ->orderByDesc('total');

                if ($estado) {
                    $q->whereIn('s.' . $estado, ['Activo', 'ACTIVO', 'activo', 1, '1']);
                }
                if ($inicio) {
                    $q->whereDate('s.' . $inicio, '<=', $hoy);
                }
                if ($fin) {
                    $q->whereDate('s.' . $fin, '>=', $hoy);
                }

                $resultado['por_plan'] = $q->get();
            }
        }

        return $resultado;
    }

    private function ingresosSuscripcionesPeriodo(?string $pagos, ?string $suscripciones, ?string $planes, Carbon $desde, Carbon $hasta): float
    {
        if ($pagos) {
            $monto = $this->columna($pagos, ['monto', 'total', 'importe']);
            $fecha = $this->columna($pagos, ['fecha_pago', 'fecha', 'created_at']);
            if ($monto) {
                $q = $this->db->table($pagos);
                if ($fecha) {
                    $q->whereBetween($fecha, [$desde, $hasta]);
                }
                $estado = $this->columna($pagos, ['estado_pago', 'estado', 'status']);
                if ($estado) {
                    $q->whereIn($estado, ['Completado', 'COMPLETADO', 'completado', 'Pagado', 'PAGADO', 'pagado', 1, '1']);
                }
                return (float) $q->sum($monto);
            }
        }

        if (!$suscripciones) {
            return 0;
        }

        $monto = $this->columna($suscripciones, ['monto', 'total', 'importe', 'precio']);
        $fecha = $this->columna($suscripciones, ['fecha_pago', 'fecha_suscripcion', 'fecha_inicio', 'fecha', 'created_at']);
        if ($monto) {
            $q = $this->db->table($suscripciones);
            if ($fecha) {
                $q->whereBetween($fecha, [$desde, $hasta]);
            }
            return (float) $q->sum($monto);
        }

        if ($planes) {
            $idPlanSub = $this->columna($suscripciones, ['id_plan', 'id_membresia']);
            $idPlan = $this->columna($planes, ['id_plan', 'id_membresia', 'id']);
            $precio = $this->columna($planes, ['precio', 'precio_plan', 'costo']);
            if ($idPlanSub && $idPlan && $precio) {
                $q = $this->db->table($suscripciones . ' as s')
                    ->join($planes . ' as p', 'p.' . $idPlan, '=', 's.' . $idPlanSub);
                if ($fecha) {
                    $q->whereBetween('s.' . $fecha, [$desde, $hasta]);
                }
                return (float) $q->sum('p.' . $precio);
            }
        }

        return 0;
    }

    private function ventasTotalPeriodo(?string $tabla, Carbon $desde, Carbon $hasta): float
    {
        if (!$tabla) {
            return 0;
        }

        $fecha = $this->columna($tabla, ['fecha_venta', 'fecha', 'created_at']);
        $total = $this->columna($tabla, ['total', 'monto_total', 'importe_total', 'monto']);
        if (!$total) {
            return 0;
        }

        $q = $this->db->table($tabla);
        if ($fecha) {
            $q->whereBetween($fecha, [$desde, $hasta]);
        }
        $this->aplicarVentaValida($q, $tabla);

        return (float) $q->sum($total);
    }

    private function ventasCantidadPeriodo(?string $tabla, Carbon $desde, Carbon $hasta): int
    {
        if (!$tabla) {
            return 0;
        }

        $fecha = $this->columna($tabla, ['fecha_venta', 'fecha', 'created_at']);
        $q = $this->db->table($tabla);
        if ($fecha) {
            $q->whereBetween($fecha, [$desde, $hasta]);
        }
        $this->aplicarVentaValida($q, $tabla);

        return (int) $q->count();
    }

    private function gastosPeriodo(?string $tabla, Carbon $desde, Carbon $hasta): float
    {
        if (!$tabla) {
            return 0;
        }

        $monto = $this->columna($tabla, ['monto', 'total', 'importe', 'cantidad']);
        $fecha = $this->columna($tabla, ['fecha_gasto', 'fecha_movimiento', 'fecha', 'created_at']);
        if (!$monto) {
            return 0;
        }

        $q = $this->db->table($tabla);
        if ($fecha) {
            $q->whereBetween($fecha, [$desde, $hasta]);
        }

        if ($tabla === 'movimientos_caja') {
            $tipo = $this->columna($tabla, ['tipo']);
            if ($tipo) {
                $q->whereIn($tipo, ['Egreso', 'EGRESO', 'egreso', 'Gasto', 'GASTO', 'gasto']);
            }
        }

        $estado = $this->columna($tabla, ['estado', 'status']);
        if ($tabla === 'gastos' && $estado) {
            $q->where(function ($w) use ($estado) {
                $w->whereNull($estado)
                    ->orWhereNotIn($estado, ['Anulado', 'ANULADO', 'anulado']);
            });
        }

        return (float) $q->sum($monto);
    }

    private function asistenciasEnFecha(?string $tabla, Carbon $dia): int
    {
        if (!$tabla) {
            return 0;
        }

        $fecha = $this->columna($tabla, ['fecha_hora_entrada', 'fecha_entrada', 'fecha_asistencia', 'fecha', 'created_at']);
        if (!$fecha) {
            return 0;
        }

        return (int) $this->db->table($tabla)->whereDate($fecha, $dia)->count();
    }

    private function personasDentro(?string $tabla): int
    {
        if (!$tabla) {
            return 0;
        }

        $salida = $this->columna($tabla, ['fecha_hora_salida', 'fecha_salida', 'hora_salida']);
        if (!$salida) {
            return 0;
        }

        return (int) $this->db->table($tabla)->whereNull($salida)->count();
    }

    private function ventasRecientes(?string $ventas, ?string $socios): array
    {
        if (!$ventas) {
            return [];
        }

        $fecha = $this->columna($ventas, ['fecha_venta', 'fecha', 'created_at']);
        $idSocioVenta = $this->columna($ventas, ['id_socio', 'id_cliente']);
        $idSocio = $this->columna($socios, ['id_socio', 'id_cliente', 'id']);

        $q = $this->db->table($ventas);
        $this->aplicarVentaValida($q, $ventas);
        if ($fecha) {
            $q->orderByDesc($fecha);
        }

        $resultado = [];
        foreach ($q->limit(6)->get() as $fila) {
            $socio = null;
            if ($socios && $idSocioVenta && $idSocio) {
                $socio = $this->db->table($socios)
                    ->where($idSocio, $this->valor($fila, [$idSocioVenta]))
                    ->first();
            }

            $resultado[] = [
                'numero_comprobante' => $this->valor($fila, ['numero_comprobante', 'nro_comprobante', 'comprobante', 'id_venta'], '-'),
                'fecha_venta' => $this->valor($fila, ['fecha_venta', 'fecha', 'created_at']),
                'metodo_pago' => $this->valor($fila, ['metodo_pago', 'metodo', 'forma_pago'], '-'),
                'total' => (float) $this->valor($fila, ['total', 'monto_total', 'importe_total', 'monto'], 0),
                'cliente' => $this->normalizarPersona($socio),
            ];
        }

        return $resultado;
    }

    private function topProductos(?string $detalle, ?string $ventas, ?string $productos, Carbon $desde, Carbon $hasta): array
    {
        if (!$detalle || !$ventas || !$productos) {
            return [];
        }

        $idVentaDetalle = $this->columna($detalle, ['id_venta']);
        $idProductoDetalle = $this->columna($detalle, ['id_producto']);
        $cantidad = $this->columna($detalle, ['cantidad', 'cantidad_vendida']);
        $subtotal = $this->columna($detalle, ['subtotal', 'importe', 'total']);
        $precio = $this->columna($detalle, ['precio_unitario', 'precio', 'precio_venta']);
        $idVenta = $this->columna($ventas, ['id_venta', 'id']);
        $idProducto = $this->columna($productos, ['id_producto', 'id']);
        $nombreProducto = $this->columna($productos, ['nombre_producto', 'nombre', 'producto']);
        $fechaVenta = $this->columna($ventas, ['fecha_venta', 'fecha', 'created_at']);

        if (!$idVentaDetalle || !$idProductoDetalle || !$cantidad || !$idVenta || !$idProducto || !$nombreProducto) {
            return [];
        }

        $q = $this->db->table($detalle . ' as dv')
            ->join($productos . ' as p', 'p.' . $idProducto, '=', 'dv.' . $idProductoDetalle)
            ->join($ventas . ' as v', 'v.' . $idVenta, '=', 'dv.' . $idVentaDetalle)
            ->select('p.' . $idProducto . ' as id_producto', 'p.' . $nombreProducto . ' as nombre_producto')
            ->selectRaw('SUM(dv.' . $cantidad . ') as cantidad');

        if ($subtotal) {
            $q->selectRaw('SUM(dv.' . $subtotal . ') as importe');
        } elseif ($precio) {
            $q->selectRaw('SUM(dv.' . $cantidad . ' * dv.' . $precio . ') as importe');
        } else {
            $q->selectRaw('0 as importe');
        }

        if ($fechaVenta) {
            $q->whereBetween('v.' . $fechaVenta, [$desde, $hasta]);
        }

        $estado = $this->columna($ventas, ['estado', 'status', 'estatus']);
        if ($estado) {
            $q->where(function ($w) use ($estado) {
                $w->whereNull('v.' . $estado)
                    ->orWhereNotIn('v.' . $estado, ['Anulado', 'ANULADO', 'anulado', 'Cancelado', 'CANCELADO', 'cancelado']);
            });
        }

        return $q
            ->groupBy('p.' . $idProducto, 'p.' . $nombreProducto)
            ->orderByDesc('cantidad')
            ->limit(5)
            ->get()
            ->all();
    }

    private function resumenInventario(?string $tabla): array
    {
        $resultado = [
            'productos_stock_bajo' => 0,
            'detalle_stock_bajo' => [],
            'valor_stock_compra' => 0,
        ];

        if (!$tabla) {
            return $resultado;
        }

        $stock = $this->columna($tabla, ['stock', 'cantidad', 'existencia']);
        if (!$stock) {
            return $resultado;
        }

        $minimo = $this->columna($tabla, ['stock_minimo', 'minimo', 'stock_alerta']);
        $q = $this->db->table($tabla);
        $this->aplicarActivo($q, $tabla);

        if ($minimo) {
            $q->whereColumn($stock, '<=', $minimo);
        } else {
            $q->where($stock, '<=', 5);
        }

        $resultado['detalle_stock_bajo'] = $q->orderBy($stock)->limit(10)->get()->all();
        $resultado['productos_stock_bajo'] = count($resultado['detalle_stock_bajo']);

        $precioCompra = $this->columna($tabla, ['precio_compra', 'costo', 'precio_costo']);
        if ($precioCompra) {
            $resultado['valor_stock_compra'] = round((float) $this->db->table($tabla)
                ->selectRaw('SUM(' . $stock . ' * ' . $precioCompra . ') as total')
                ->value('total'), 2);
        }

        return $resultado;
    }

    private function cajaActual(?string $tabla)
    {
        if (!$tabla) {
            return null;
        }

        $estado = $this->columna($tabla, ['estado', 'status']);
        $fecha = $this->columna($tabla, ['fecha_apertura', 'fecha', 'created_at']);
        $q = $this->db->table($tabla);

        if ($estado) {
            $q->whereIn($estado, ['Abierta', 'ABIERTA', 'abierta', 'Abierto', 'ABIERTO', 'abierto', 1, '1']);
        }
        if ($fecha) {
            $q->orderByDesc($fecha);
        }

        return $q->first();
    }

    private function reservasHoy(?string $tabla, Carbon $hoy): array
    {
        if (!$tabla) {
            return [];
        }

        $fecha = $this->columna($tabla, ['fecha_clase', 'fecha_reserva', 'fecha', 'created_at']);
        if (!$fecha) {
            return [];
        }

        return $this->db->table($tabla)
            ->whereDate($fecha, $hoy)
            ->limit(8)
            ->get()
            ->map(function ($fila) {
                return [
                    'clase' => [
                        'nombre' => $this->valor($fila, ['nombre_clase', 'clase', 'actividad'], 'Reserva'),
                        'hora_inicio' => $this->valor($fila, ['hora_inicio', 'hora', 'fecha_clase'], ''),
                    ],
                    'cliente' => [
                        'nombres' => $this->valor($fila, ['nombre_socio', 'nombre_cliente', 'nombres'], 'Socio'),
                        'apellidos' => $this->valor($fila, ['apellidos'], ''),
                    ],
                ];
            })
            ->all();
    }

    private function soportePendiente(?string $tabla): int
    {
        if (!$tabla) {
            return 0;
        }

        $estado = $this->columna($tabla, ['estado', 'status']);
        if (!$estado) {
            return 0;
        }

        return (int) $this->db->table($tabla)
            ->whereIn($estado, ['Pendiente', 'PENDIENTE', 'pendiente'])
            ->count();
    }

    private function rutinasPendientes(?string $tabla): int
    {
        if (!$tabla) {
            return 0;
        }

        $estado = $this->columna($tabla, ['estado', 'status']);
        $asunto = $this->columna($tabla, ['asunto', 'titulo', 'subject']);
        if (!$estado || !$asunto) {
            return 0;
        }

        return (int) $this->db->table($tabla)
            ->whereIn($estado, ['Pendiente', 'PENDIENTE', 'pendiente'])
            ->whereRaw('LOWER('.$asunto.') LIKE ?', ['%rutina%'])
            ->count();
    }

    private function opinionesPendientes(): int
    {
        try {
            if (!$this->schema->hasTable('opiniones_cliente')) {
                return 0;
            }

            return (int) $this->db->table('opiniones_cliente')
                ->whereIn('estado', ['Enviada', 'ENVIADA', 'enviada'])
                ->count();
        } catch (Throwable $e) {
            return 0;
        }
    }

    private function actividadPortal(): array
    {
        $actividad = collect();

        try {
            if ($this->schema->hasTable('solicitudes_soporte')) {
                $rows = $this->db->table('solicitudes_soporte as s')
                    ->leftJoin('clientes as c', 'c.id_cliente', '=', 's.id_cliente')
                    ->select(
                        's.id_soporte as id',
                        's.id_cliente',
                        's.asunto',
                        's.mensaje',
                        's.estado',
                        's.fecha',
                        'c.nombres',
                        'c.apellidos'
                    )
                    ->orderByDesc('s.fecha')
                    ->limit(8)
                    ->get();

                foreach ($rows as $r) {
                    $esRutina = str_contains(mb_strtolower((string) $r->asunto), 'rutina');
                    $actividad->push([
                        'tipo' => $esRutina ? 'rutina' : 'soporte',
                        'id' => (int) $r->id,
                        'id_cliente' => (int) $r->id_cliente,
                        'titulo' => $esRutina ? 'Solicitud de rutina' : (string) $r->asunto,
                        'detalle' => (string) $r->mensaje,
                        'estado' => (string) $r->estado,
                        'fecha' => $r->fecha,
                        'cliente' => trim((string) $r->nombres.' '.(string) $r->apellidos),
                    ]);
                }
            }
        } catch (Throwable $e) {
            // El dashboard no debe fallar completo si una tabla opcional no existe.
        }

        try {
            if ($this->schema->hasTable('reservas')) {
                $q = $this->db->table('reservas as r')
                    ->leftJoin('clientes as c', 'c.id_cliente', '=', 'r.id_cliente');

                if ($this->schema->hasTable('clases')) {
                    $q->leftJoin('clases as cl', 'cl.id_clase', '=', 'r.id_clase');
                }

                $select = [
                    'r.id_reserva as id',
                    'r.id_cliente',
                    'r.estado',
                    'r.fecha_clase',
                    'r.fecha_reserva',
                    'c.nombres',
                    'c.apellidos',
                ];
                if ($this->schema->hasTable('clases')) {
                    $select[] = 'cl.nombre as clase_nombre';
                    $select[] = 'cl.hora_inicio';
                }

                foreach ($q->select($select)->orderByDesc('r.fecha_reserva')->limit(8)->get() as $r) {
                    $actividad->push([
                        'tipo' => 'reserva',
                        'id' => (int) $r->id,
                        'id_cliente' => (int) $r->id_cliente,
                        'titulo' => 'Reserva de clase',
                        'detalle' => trim(((string) ($r->clase_nombre ?? 'Clase')).' · '.((string) $r->fecha_clase).' '.((string) ($r->hora_inicio ?? ''))),
                        'estado' => (string) $r->estado,
                        'fecha' => $r->fecha_reserva ?: $r->fecha_clase,
                        'cliente' => trim((string) $r->nombres.' '.(string) $r->apellidos),
                    ]);
                }
            }
        } catch (Throwable $e) {
        }

        try {
            if ($this->schema->hasTable('pagos_membresia')
                && $this->schema->hasTable('cliente_membresia')) {
                $q = $this->db->table('pagos_membresia as p')
                    ->join('cliente_membresia as cm', 'cm.id_cliente_membresia', '=', 'p.id_cliente_membresia')
                    ->leftJoin('clientes as c', 'c.id_cliente', '=', 'cm.id_cliente');

                if ($this->schema->hasTable('membresias')) {
                    $q->leftJoin('membresias as m', 'm.id_membresia', '=', 'cm.id_membresia');
                }

                $select = [
                    'p.id_pago as id',
                    'cm.id_cliente',
                    'p.monto',
                    'p.metodo_pago',
                    'p.estado_pago',
                    'p.fecha_pago',
                    'c.nombres',
                    'c.apellidos',
                ];
                if ($this->schema->hasTable('membresias')) {
                    $select[] = 'm.nombre as membresia_nombre';
                }

                foreach ($q->select($select)->orderByDesc('p.fecha_pago')->limit(8)->get() as $r) {
                    $actividad->push([
                        'tipo' => 'pago',
                        'id' => (int) $r->id,
                        'id_cliente' => (int) $r->id_cliente,
                        'titulo' => 'Pago de membresía',
                        'detalle' => trim(((string) ($r->membresia_nombre ?? 'Membresía')).' · S/ '.number_format((float) $r->monto, 2)),
                        'estado' => (string) $r->estado_pago,
                        'fecha' => $r->fecha_pago,
                        'cliente' => trim((string) $r->nombres.' '.(string) $r->apellidos),
                    ]);
                }
            }
        } catch (Throwable $e) {
        }

        try {
            if ($this->schema->hasTable('opiniones_cliente')) {
                $rows = $this->db->table('opiniones_cliente as o')
                    ->leftJoin('clientes as c', 'c.id_cliente', '=', 'o.id_cliente')
                    ->select(
                        'o.id_opinion as id',
                        'o.id_cliente',
                        'o.categoria',
                        'o.calificacion',
                        'o.comentario',
                        'o.estado',
                        'o.fecha',
                        'c.nombres',
                        'c.apellidos'
                    )
                    ->orderByDesc('o.fecha')
                    ->limit(8)
                    ->get();

                foreach ($rows as $r) {
                    $actividad->push([
                        'tipo' => 'opinion',
                        'id' => (int) $r->id,
                        'id_cliente' => (int) $r->id_cliente,
                        'titulo' => 'Opinión del cliente · '.((int) $r->calificacion).'/5',
                        'detalle' => trim(((string) $r->categoria).' · '.((string) $r->comentario)),
                        'estado' => (string) $r->estado,
                        'fecha' => $r->fecha,
                        'cliente' => trim((string) $r->nombres.' '.(string) $r->apellidos),
                    ]);
                }
            }
        } catch (Throwable $e) {
        }

        return $actividad
            ->sortByDesc(function ($item) {
                try {
                    return Carbon::parse($item['fecha'])->timestamp;
                } catch (Throwable $e) {
                    return 0;
                }
            })
            ->take(12)
            ->values()
            ->all();
    }

    private function normalizarPersona($fila): array
    {
        if (!$fila) {
            return ['nombres' => 'Público general', 'apellidos' => ''];
        }

        $nombres = $this->valor($fila, ['nombres', 'nombre', 'nombre_socio', 'nombre_cliente'], '');
        $apellidos = $this->valor($fila, ['apellidos', 'apellido', 'apellido_socio', 'apellido_cliente'], '');

        if (!$apellidos && is_string($nombres) && str_contains(trim($nombres), ' ')) {
            $partes = preg_split('/\s+/', trim($nombres), 2);
            $nombres = $partes[0] ?? '';
            $apellidos = $partes[1] ?? '';
        }

        return [
            'nombres' => (string) $nombres,
            'apellidos' => (string) $apellidos,
        ];
    }
}
