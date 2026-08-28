<?php

namespace App\Http\Controllers;

use App\Models\Asistencia;
use App\Models\Cliente;
use App\Models\ClienteMembresia;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AsistenciaController extends Controller
{
    public function index()
    {
        return response()->json(
            Asistencia::with('cliente')
                ->orderByDesc('fecha_hora_entrada')
                ->get()
        );
    }

    public function show(string $id)
    {
        return response()->json(
            Asistencia::with('cliente')->findOrFail($id)
        );
    }

    public function entrada(Request $request)
    {
        $datos = $request->validate([
            'id_cliente' => 'required|integer|exists:clientes,id_cliente',
            'observacion' => 'nullable|string|max:500',
        ]);

        $cliente = Cliente::findOrFail($datos['id_cliente']);

        if (mb_strtolower((string) $cliente->estado) !== 'activo') {
            throw ValidationException::withMessages([
                'id_cliente' => ['El cliente no se encuentra activo.'],
            ]);
        }

        $membresiaVigente = ClienteMembresia::query()
            ->where('id_cliente', $cliente->id_cliente)
            ->where('estado', 'Activo')
            ->whereDate('fecha_inicio', '<=', today())
            ->whereDate('fecha_fin', '>=', today())
            ->exists();

        if (!$membresiaVigente) {
            throw ValidationException::withMessages([
                'id_cliente' => ['El cliente no tiene una membresía vigente y no puede registrar ingreso.'],
            ]);
        }

        $entradaAbierta = Asistencia::query()
            ->where('id_cliente', $cliente->id_cliente)
            ->whereNull('fecha_hora_salida')
            ->exists();

        if ($entradaAbierta) {
            throw ValidationException::withMessages([
                'id_cliente' => ['El cliente ya tiene un ingreso abierto. Primero registra su salida.'],
            ]);
        }

        $asistencia = Asistencia::create([
            'id_cliente' => $cliente->id_cliente,
            'fecha_hora_entrada' => now(),
            'fecha_hora_salida' => null,
            'observacion' => $datos['observacion'] ?? null,
            'estado' => 'Dentro',
        ]);

        return response()->json([
            'mensaje' => 'Entrada registrada correctamente.',
            'asistencia' => $asistencia->load('cliente'),
        ], 201);
    }

    public function salida(Request $request)
    {
        $datos = $request->validate([
            'id_cliente' => 'required|integer|exists:clientes,id_cliente',
            'observacion' => 'nullable|string|max:500',
        ]);

        $asistencia = Asistencia::query()
            ->where('id_cliente', $datos['id_cliente'])
            ->whereNull('fecha_hora_salida')
            ->orderByDesc('fecha_hora_entrada')
            ->first();

        if (!$asistencia) {
            throw ValidationException::withMessages([
                'id_cliente' => ['No existe una entrada abierta para este cliente.'],
            ]);
        }

        $observacion = $datos['observacion'] ?? $asistencia->observacion;

        $asistencia->update([
            'fecha_hora_salida' => now(),
            'observacion' => $observacion,
            'estado' => 'Completado',
        ]);

        return response()->json([
            'mensaje' => 'Salida registrada correctamente.',
            'asistencia' => $asistencia->fresh('cliente'),
        ]);
    }

    public function historial(string $idCliente)
    {
        Cliente::findOrFail($idCliente);

        return response()->json(
            Asistencia::where('id_cliente', $idCliente)
                ->orderByDesc('fecha_hora_entrada')
                ->get()
        );
    }
}
