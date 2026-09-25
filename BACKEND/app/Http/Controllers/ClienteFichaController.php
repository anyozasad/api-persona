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

class ClienteFichaController extends Controller
{
    public function show(string $id)
    {
        $cliente = Cliente::findOrFail($id);

        $membresiaActual = ClienteMembresia::with('membresia')
            ->where('id_cliente', $cliente->id_cliente)
            ->where('estado', 'Activo')
            ->whereDate('fecha_inicio', '<=', today())
            ->whereDate('fecha_fin', '>=', today())
            ->orderByDesc('fecha_fin')
            ->first();

        $pagos = PagoMembresia::with('clienteMembresia.membresia')
            ->whereHas('clienteMembresia', fn ($q) => $q->where('id_cliente', $cliente->id_cliente))
            ->orderByDesc('fecha_pago')
            ->limit(10)
            ->get();

        $asistencias = Asistencia::where('id_cliente', $cliente->id_cliente)
            ->orderByDesc('fecha_hora_entrada')
            ->limit(10)
            ->get();

        $rutinas = Rutina::with(['entrenador', 'detalles'])
            ->where('id_cliente', $cliente->id_cliente)
            ->orderByDesc('fecha_inicio')
            ->limit(10)
            ->get();

        $reservas = Reserva::with(['clase.entrenador'])
            ->where('id_cliente', $cliente->id_cliente)
            ->orderByDesc('fecha_clase')
            ->limit(10)
            ->get();

        $sesionesCasa = SesionEntrenamientoCasa::where('id_cliente', $cliente->id_cliente)
            ->orderByDesc('fecha')
            ->limit(10)
            ->get();

        $ventas = Venta::where('id_cliente', $cliente->id_cliente)
            ->where(function ($q) {
                $q->whereNull('estado')->orWhere('estado', '!=', 'Anulado');
            })
            ->orderByDesc('fecha_venta')
            ->limit(10)
            ->get();

        $soporte = SolicitudSoporte::where('id_cliente', $cliente->id_cliente)
            ->orderByDesc('fecha')
            ->limit(10)
            ->get();

        return response()->json([
            'cliente' => $cliente,
            'membresia_actual' => $membresiaActual,
            'resumen' => [
                'asistencias_mes' => Asistencia::where('id_cliente', $cliente->id_cliente)
                    ->whereMonth('fecha_hora_entrada', now()->month)
                    ->whereYear('fecha_hora_entrada', now()->year)
                    ->count(),
                'reservas_activas' => Reserva::where('id_cliente', $cliente->id_cliente)
                    ->where('estado', 'Reservada')->count(),
                'rutinas_activas' => Rutina::where('id_cliente', $cliente->id_cliente)
                    ->where('estado', 'Activo')->count(),
                'sesiones_casa_mes' => SesionEntrenamientoCasa::where('id_cliente', $cliente->id_cliente)
                    ->whereMonth('fecha', now()->month)
                    ->whereYear('fecha', now()->year)
                    ->where('estado', 'Completada')->count(),
                'total_ventas' => (float) Venta::where('id_cliente', $cliente->id_cliente)
                    ->where(function ($q) {
                        $q->whereNull('estado')->orWhere('estado', '!=', 'Anulado');
                    })->sum('total'),
                'soporte_pendiente' => SolicitudSoporte::where('id_cliente', $cliente->id_cliente)
                    ->where('estado', 'Pendiente')->count(),
            ],
            'pagos' => $pagos,
            'asistencias' => $asistencias,
            'rutinas' => $rutinas,
            'reservas' => $reservas,
            'sesiones_casa' => $sesionesCasa,
            'ventas' => $ventas,
            'soporte' => $soporte,
        ]);
    }
}
