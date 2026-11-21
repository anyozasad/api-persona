<?php

namespace App\Http\Controllers;

use App\Models\Asistencia;
use App\Models\Cliente;
use App\Models\ClienteMembresia;
use App\Models\PagoMembresia;
use App\Models\Reserva;
use App\Models\Rutina;
use App\Models\SesionEntrenamientoCasa;
use App\Models\SolicitudSoporte;
use App\Models\Venta;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class ClienteFichaController extends Controller
{
    public function show(string $id)
    {
        // La ficha del cliente debe abrirse aunque otros módulos aún no
        // tengan sus tablas creadas en una instalación antigua de XAMPP.
        $cliente = Cliente::findOrFail($id);
        $avisos = [];

        $consultar = function (string $modulo, array $tablas, callable $consulta, $vacio) use (&$avisos) {
            try {
                foreach ($tablas as $tabla) {
                    if (!Schema::hasTable($tabla)) {
                        $avisos[$modulo] = 'Información de '.$modulo.' no disponible: falta preparar MySQL.';
                        return $vacio;
                    }
                }
                return $consulta();
            } catch (\Throwable $e) {
                // Los mensajes SQL no deben exponerse en una ventana del cliente.
                Log::error('Ficha de socio: consulta de módulo fallida.', [
                    'modulo' => $modulo,
                    'error' => $e->getMessage(),
                ]);
                $avisos[$modulo] = 'Información de '.$modulo.' no disponible. Revisa el esquema en el administrador.';
                return $vacio;
            }
        };

        $membresiaActual = $consultar('membresías', ['cliente_membresia', 'membresias'], function () use ($cliente) {
            return ClienteMembresia::with('membresia')
                ->where('id_cliente', $cliente->id_cliente)
                ->where('estado', 'Activo')
                ->whereDate('fecha_inicio', '<=', today())
                ->whereDate('fecha_fin', '>=', today())
                ->orderByDesc('fecha_fin')->first();
        }, null);

        $pagos = $consultar('pagos', ['pagos_membresia', 'cliente_membresia', 'membresias'], function () use ($cliente) {
            return PagoMembresia::with('clienteMembresia.membresia')
                ->whereHas('clienteMembresia', fn ($q) => $q->where('id_cliente', $cliente->id_cliente))
                ->orderByDesc('fecha_pago')->limit(10)->get();
        }, collect());

        $asistencias = $consultar('asistencias', ['asistencias'], fn () => Asistencia::where('id_cliente', $cliente->id_cliente)
            ->orderByDesc('fecha_hora_entrada')->limit(10)->get(), collect());

        $rutinas = $consultar('rutinas', ['rutinas', 'entrenadores', 'detalle_rutina'], fn () => Rutina::with(['entrenador', 'detalles'])
            ->where('id_cliente', $cliente->id_cliente)
            ->orderByDesc('fecha_inicio')->limit(10)->get(), collect());

        $reservas = $consultar('reservas', ['reservas', 'clases', 'entrenadores'], fn () => Reserva::with(['clase.entrenador'])
            ->where('id_cliente', $cliente->id_cliente)
            ->orderByDesc('fecha_clase')->limit(10)->get(), collect());

        $sesionesCasa = $consultar('sesiones en casa', ['sesiones_entrenamiento_casa', 'rutinas', 'detalle_sesion_entrenamiento', 'detalle_rutina'],
            fn () => SesionEntrenamientoCasa::with(['rutina', 'detalles.detalleRutina'])
                ->where('id_cliente', $cliente->id_cliente)
                ->orderByDesc('fecha')->limit(10)->get(), collect());

        $ventas = $consultar('ventas', ['ventas'], fn () => Venta::where('id_cliente', $cliente->id_cliente)
            ->where(fn ($q) => $q->whereNull('estado')->orWhere('estado', '!=', 'Anulado'))
            ->orderByDesc('fecha_venta')->limit(10)->get(), collect());

        $soporte = $consultar('soporte', ['solicitudes_soporte'], fn () => SolicitudSoporte::where('id_cliente', $cliente->id_cliente)
            ->orderByDesc('fecha')->limit(10)->get(), collect());

        $resumen = [
            'asistencias_mes' => $consultar('asistencias', ['asistencias'], fn () => Asistencia::where('id_cliente', $cliente->id_cliente)
                ->whereMonth('fecha_hora_entrada', now()->month)
                ->whereYear('fecha_hora_entrada', now()->year)->count(), 0),
            'reservas_activas' => $consultar('reservas', ['reservas'], fn () => Reserva::where('id_cliente', $cliente->id_cliente)
                ->where('estado', 'Reservada')->count(), 0),
            'rutinas_activas' => $consultar('rutinas', ['rutinas'], fn () => Rutina::where('id_cliente', $cliente->id_cliente)
                ->where('estado', 'Activo')->count(), 0),
            'sesiones_casa_mes' => $consultar('sesiones en casa', ['sesiones_entrenamiento_casa'],
                fn () => SesionEntrenamientoCasa::where('id_cliente', $cliente->id_cliente)
                    ->whereMonth('fecha', now()->month)->whereYear('fecha', now()->year)
                    ->where('estado', 'Completada')->count(), 0),
            'total_ventas' => $consultar('ventas', ['ventas'], fn () => (float) Venta::where('id_cliente', $cliente->id_cliente)
                ->where(fn ($q) => $q->whereNull('estado')->orWhere('estado', '!=', 'Anulado'))->sum('total'), 0),
            'soporte_pendiente' => $consultar('soporte', ['solicitudes_soporte'], fn () => SolicitudSoporte::where('id_cliente', $cliente->id_cliente)
                ->where('estado', 'Pendiente')->count(), 0),
        ];
        $resumen['sesiones_gym_mes'] = $resumen['sesiones_casa_mes'];

        return response()->json([
            'cliente' => $cliente,
            'membresia_actual' => $membresiaActual,
            'resumen' => $resumen,
            'pagos' => $pagos,
            'asistencias' => $asistencias,
            'rutinas' => $rutinas,
            'reservas' => $reservas,
            'sesiones_gym' => $sesionesCasa,
            'sesiones_casa' => $sesionesCasa,
            'ventas' => $ventas,
            'soporte' => $soporte,
            'advertencias' => array_values($avisos),
        ]);
    }
}
