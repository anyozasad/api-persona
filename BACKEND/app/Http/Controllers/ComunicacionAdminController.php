<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\NotificacionCliente;
use App\Models\SolicitudSoporte;
use Illuminate\Http\Request;

class ComunicacionAdminController extends Controller
{
    public function notificaciones()
    {
        return response()->json(
            NotificacionCliente::with('cliente')
                ->orderByDesc('fecha')
                ->limit(100)
                ->get()
        );
    }

    public function enviarNotificacion(Request $request)
    {
        $datos = $request->validate([
            'id_cliente' => 'nullable|integer|exists:clientes,id_cliente',
            'titulo' => 'required|string|max:150',
            'mensaje' => 'required|string|min:3|max:2000',
            'tipo' => 'nullable|string|max:30',
        ]);

        $tipo = $datos['tipo'] ?? 'Informacion';

        $clientes = isset($datos['id_cliente'])
            ? Cliente::where('id_cliente', $datos['id_cliente'])->where('estado', 'Activo')->get()
            : Cliente::where('estado', 'Activo')->get();

        if ($clientes->isEmpty()) {
            return response()->json([
                'mensaje' => 'No hay clientes activos para recibir la notificación.',
            ], 422);
        }

        $creadas = 0;
        foreach ($clientes as $cliente) {
            NotificacionCliente::create([
                'id_cliente' => $cliente->id_cliente,
                'titulo' => $datos['titulo'],
                'mensaje' => $datos['mensaje'],
                'tipo' => $tipo,
                'leida' => false,
                'fecha' => now(),
            ]);
            $creadas++;
        }

        return response()->json([
            'mensaje' => $creadas === 1
                ? 'Notificación enviada correctamente.'
                : 'Notificación enviada a '.$creadas.' clientes.',
            'enviadas' => $creadas,
        ], 201);
    }

    public function eliminarNotificacion(string $id)
    {
        $notificacion = NotificacionCliente::findOrFail($id);
        $notificacion->delete();

        return response()->json(['mensaje' => 'Notificación eliminada.']);
    }

    public function soporte()
    {
        return response()->json(
            SolicitudSoporte::with('cliente')
                ->orderByRaw("CASE WHEN estado = 'Pendiente' THEN 0 WHEN estado = 'Respondido' THEN 1 ELSE 2 END")
                ->orderByDesc('fecha')
                ->get()
        );
    }

    public function responderSoporte(Request $request, string $id)
    {
        $datos = $request->validate([
            'respuesta' => 'required|string|min:3|max:3000',
            'estado' => 'nullable|string|in:Respondido,Cerrado',
        ]);

        $solicitud = SolicitudSoporte::findOrFail($id);
        $solicitud->update([
            'respuesta' => $datos['respuesta'],
            'estado' => $datos['estado'] ?? 'Respondido',
            'fecha_respuesta' => now(),
        ]);

        NotificacionCliente::create([
            'id_cliente' => $solicitud->id_cliente,
            'titulo' => 'Respuesta de soporte',
            'mensaje' => 'El gimnasio respondió tu consulta: '.$solicitud->asunto,
            'tipo' => 'Soporte',
            'leida' => false,
            'fecha' => now(),
        ]);

        return response()->json([
            'mensaje' => 'Respuesta guardada y cliente notificado.',
            'solicitud' => $solicitud->fresh('cliente'),
        ]);
    }

    public function cerrarSoporte(string $id)
    {
        $solicitud = SolicitudSoporte::findOrFail($id);
        $solicitud->update([
            'estado' => 'Cerrado',
            'fecha_respuesta' => $solicitud->fecha_respuesta ?? now(),
        ]);

        return response()->json([
            'mensaje' => 'Solicitud de soporte cerrada.',
            'solicitud' => $solicitud->fresh('cliente'),
        ]);
    }
}
