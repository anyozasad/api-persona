<?php

namespace App\Http\Controllers;

use App\Models\Asistencia;
use App\Models\Cliente;
use App\Models\ClienteMembresia;
use App\Models\PagoMembresia;
use App\Models\Rutina;
use App\Models\Venta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class PortalClienteController extends Controller
{
    public function resumen(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);
        $membresia = $this->membresiaActual($cliente->id_cliente);

        return response()->json([
            'cliente' => $cliente,
            'membresia_actual' => $membresia,
            'ultimos_pagos' => PagoMembresia::query()
                ->with('clienteMembresia.membresia')
                ->whereHas('clienteMembresia', fn ($q) => $q->where('id_cliente', $cliente->id_cliente))
                ->orderByDesc('fecha_pago')
                ->limit(5)
                ->get(),
            'rutina_actual' => Rutina::with(['entrenador', 'detalles'])
                ->where('id_cliente', $cliente->id_cliente)
                ->where('estado', 'Activo')
                ->orderByDesc('fecha_inicio')
                ->first(),
            'asistencias_mes' => Asistencia::where('id_cliente', $cliente->id_cliente)
                ->whereBetween('fecha_hora_entrada', [now()->startOfMonth(), now()->endOfMonth()])
                ->count(),
        ]);
    }

    public function perfil(Request $request)
    {
        return response()->json($this->clienteDelUsuario($request));
    }

    public function actualizarPerfil(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);
        $usuario = $request->user();

        $datos = $request->validate([
            'nombres' => 'sometimes|required|string|max:100',
            'apellidos' => 'sometimes|required|string|max:100',
            'telefono' => 'sometimes|nullable|string|max:25',
            'correo' => [
                'sometimes', 'required', 'email', 'max:150',
                Rule::unique('clientes', 'correo')->ignore($cliente->id_cliente, 'id_cliente'),
                Rule::unique('usuarios', 'correo')->ignore($usuario->id_usuario, 'id_usuario'),
            ],
            'direccion' => 'sometimes|nullable|string|max:255',
            'fecha_nacimiento' => 'sometimes|nullable|date|before:today',
            'sexo' => 'sometimes|nullable|string|max:20',
        ]);

        DB::transaction(function () use ($cliente, $usuario, $datos) {
            $cliente->update($datos);

            $datosUsuario = array_intersect_key($datos, array_flip([
                'nombres', 'apellidos', 'telefono', 'correo',
            ]));

            if ($datosUsuario) {
                $usuario->update($datosUsuario);
            }
        });

        return response()->json([
            'mensaje' => 'Perfil actualizado correctamente.',
            'cliente' => $cliente->fresh(),
            'usuario' => $usuario->fresh(),
        ]);
    }

    public function membresia(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);

        return response()->json([
            'actual' => $this->membresiaActual($cliente->id_cliente),
            'historial' => ClienteMembresia::with(['membresia', 'pagos'])
                ->where('id_cliente', $cliente->id_cliente)
                ->orderByDesc('fecha_fin')
                ->get(),
        ]);
    }

    public function pagos(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);

        return response()->json(
            PagoMembresia::query()
                ->with('clienteMembresia.membresia')
                ->whereHas('clienteMembresia', fn ($q) => $q->where('id_cliente', $cliente->id_cliente))
                ->orderByDesc('fecha_pago')
                ->get()
        );
    }

    public function rutinas(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);

        return response()->json(
            Rutina::with(['entrenador', 'detalles'])
                ->where('id_cliente', $cliente->id_cliente)
                ->orderByDesc('fecha_inicio')
                ->get()
        );
    }

    public function asistencias(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);

        return response()->json(
            Asistencia::where('id_cliente', $cliente->id_cliente)
                ->orderByDesc('fecha_hora_entrada')
                ->get()
        );
    }

    public function compras(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);

        return response()->json(
            Venta::with('detalles.producto')
                ->where('id_cliente', $cliente->id_cliente)
                ->orderByDesc('fecha_venta')
                ->get()
        );
    }

    private function clienteDelUsuario(Request $request): Cliente
    {
        $usuario = $request->user();
        $dni = trim((string) ($usuario?->dni ?? ''));

        if ($dni === '') {
            throw new NotFoundHttpException('Tu cuenta todavía no está vinculada a un cliente mediante DNI.');
        }

        $cliente = Cliente::where('dni', $dni)->first();

        if (!$cliente) {
            throw new NotFoundHttpException('No se encontró el registro de cliente asociado a tu cuenta.');
        }

        return $cliente;
    }

    private function membresiaActual(int $idCliente): ?ClienteMembresia
    {
        ClienteMembresia::query()
            ->where('id_cliente', $idCliente)
            ->where('estado', 'Activo')
            ->whereDate('fecha_fin', '<', today())
            ->update(['estado' => 'Vencido']);

        return ClienteMembresia::with('membresia')
            ->where('id_cliente', $idCliente)
            ->where('estado', 'Activo')
            ->whereDate('fecha_inicio', '<=', today())
            ->whereDate('fecha_fin', '>=', today())
            ->orderByDesc('fecha_fin')
            ->first();
    }
}
