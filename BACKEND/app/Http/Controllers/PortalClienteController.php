<?php

namespace App\Http\Controllers;

use App\Models\Asistencia;
use App\Models\Cliente;
use App\Models\ClienteMembresia;
use App\Models\DetalleSesionEntrenamiento;
use App\Models\PagoMembresia;
use App\Models\Rutina;
use App\Models\SesionEntrenamientoCasa;
use App\Models\Venta;
use App\Services\ComprobanteMembresiaService;
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
            'membresia_proxima' => $this->membresiaProxima($cliente->id_cliente),
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
            'proxima' => $this->membresiaProxima($cliente->id_cliente),
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

    public function comprobante(Request $request, string $idPago, ComprobanteMembresiaService $comprobantes)
    {
        $cliente = $this->clienteDelUsuario($request);

        $pago = PagoMembresia::with(['clienteMembresia.membresia', 'clienteMembresia.cliente'])
            ->where('id_pago', $idPago)
            ->whereHas('clienteMembresia', fn ($q) => $q->where('id_cliente', $cliente->id_cliente))
            ->firstOrFail();

        return response()->json([
            'empresa' => $comprobantes->formatear($pago)['empresa'],
            'comprobante' => $comprobantes->formatear($pago),
        ]);
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

    public function entrenamientoCasa(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);

        $membresia = ClienteMembresia::with('membresia')
            ->where('id_cliente', $cliente->id_cliente)
            ->where('estado', 'Activo')
            ->whereDate('fecha_inicio', '<=', today())
            ->whereDate('fecha_fin', '>=', today())
            ->orderByDesc('fecha_fin')
            ->first();

        $rutina = Rutina::with(['entrenador', 'detalles'])
            ->where('id_cliente', $cliente->id_cliente)
            ->where('estado', 'Activo')
            ->whereDate('fecha_inicio', '<=', today())
            ->where(function ($q) {
                $q->whereNull('fecha_fin')->orWhereDate('fecha_fin', '>=', today());
            })
            ->orderByDesc('fecha_inicio')
            ->first();

        return response()->json([
            'membresia' => $membresia,
            'rutina' => $rutina,
            'historial' => SesionEntrenamientoCasa::with(['rutina', 'detalles.detalleRutina'])
                ->where('id_cliente', $cliente->id_cliente)
                ->orderByDesc('fecha')
                ->limit(20)
                ->get(),
            'reglas' => [
                'requiere_membresia' => true,
                'requiere_rutina' => true,
                'mensaje' => 'El entrenamiento usa únicamente la rutina activa asignada por Mallqui Gym.',
            ],
        ]);
    }

    public function registrarSesionEntrenamientoCasa(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);

        $datos = $request->validate([
            'id_rutina' => 'required|integer|exists:rutinas,id_rutina',
            'duracion_segundos' => 'required|integer|min:1|max:14400',
            'ejercicios' => 'required|array|min:1|max:50',
            'ejercicios.*.id_detalle_rutina' => 'required|integer|distinct|exists:detalle_rutina,id_detalle_rutina',
            'ejercicios.*.series_realizadas' => 'required|integer|min:0|max:30',
            'ejercicios.*.repeticiones_realizadas' => 'required|integer|min:0|max:500',
            'ejercicios.*.peso_utilizado' => 'nullable|numeric|min:0|max:1000',
            'ejercicios.*.completado' => 'required|boolean',
        ]);

        $membresia = ClienteMembresia::query()
            ->where('id_cliente', $cliente->id_cliente)
            ->where('estado', 'Activo')
            ->whereDate('fecha_inicio', '<=', today())
            ->whereDate('fecha_fin', '>=', today())
            ->first();

        if (!$membresia) {
            return response()->json([
                'mensaje' => 'Necesitas una membresía vigente para guardar un entrenamiento.',
            ], 422);
        }

        $rutina = Rutina::with('detalles')
            ->where('id_rutina', $datos['id_rutina'])
            ->where('id_cliente', $cliente->id_cliente)
            ->where('estado', 'Activo')
            ->whereDate('fecha_inicio', '<=', today())
            ->where(function ($q) {
                $q->whereNull('fecha_fin')->orWhereDate('fecha_fin', '>=', today());
            })
            ->first();

        if (!$rutina) {
            return response()->json([
                'mensaje' => 'La rutina indicada no está activa o no pertenece a tu cuenta.',
            ], 422);
        }

        $idsPermitidos = $rutina->detalles->pluck('id_detalle_rutina')->map(fn ($id) => (int) $id)->all();
        $idsRecibidos = collect($datos['ejercicios'])->pluck('id_detalle_rutina')->map(fn ($id) => (int) $id)->all();

        if (array_diff($idsRecibidos, $idsPermitidos)) {
            return response()->json([
                'mensaje' => 'Uno o más ejercicios no pertenecen a la rutina asignada.',
            ], 422);
        }

        $completados = collect($datos['ejercicios'])->where('completado', true)->count();

        if ($completados < 1) {
            return response()->json([
                'mensaje' => 'Debes completar al menos un ejercicio antes de guardar la sesión.',
            ], 422);
        }

        $sesion = DB::transaction(function () use ($cliente, $rutina, $datos, $completados) {
            $sesion = SesionEntrenamientoCasa::create([
                'id_cliente' => $cliente->id_cliente,
                'id_rutina' => $rutina->id_rutina,
                'zona' => 'rutina',
                'fecha' => now(),
                'duracion_segundos' => $datos['duracion_segundos'],
                'ejercicios_total' => count($datos['ejercicios']),
                'ejercicios_completados' => $completados,
                'estado' => $completados === count($datos['ejercicios']) ? 'Completada' : 'Parcial',
            ]);

            foreach ($datos['ejercicios'] as $ejercicio) {
                DetalleSesionEntrenamiento::create([
                    'id_sesion_casa' => $sesion->id_sesion_casa,
                    'id_detalle_rutina' => $ejercicio['id_detalle_rutina'],
                    'series_realizadas' => $ejercicio['series_realizadas'],
                    'repeticiones_realizadas' => $ejercicio['repeticiones_realizadas'],
                    'peso_utilizado' => $ejercicio['peso_utilizado'] ?? null,
                    'completado' => (bool) $ejercicio['completado'],
                ]);
            }

            return $sesion;
        });

        return response()->json([
            'mensaje' => 'Entrenamiento registrado correctamente en tu progreso.',
            'sesion' => $sesion->load(['rutina', 'detalles.detalleRutina']),
        ], 201);
    }

    private function clienteDelUsuario(Request $request): Cliente
    {
        $usuario = $request->user();

        $cliente = $usuario?->id_cliente
            ? Cliente::find($usuario->id_cliente)
            : null;

        // Compatibilidad con cuentas creadas antes de la relación directa.
        if (!$cliente && $usuario?->dni) {
            $cliente = Cliente::where('dni', trim((string) $usuario->dni))->first();
        }

        if (!$cliente) {
            throw new NotFoundHttpException('No se encontró el cliente asociado a tu cuenta.');
        }

        if (mb_strtolower((string) $cliente->estado) !== 'activo') {
            abort(403, 'El cliente se encuentra inactivo.');
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

    private function membresiaProxima(int $idCliente): ?ClienteMembresia
    {
        return ClienteMembresia::with(['membresia', 'pagos'])
            ->where('id_cliente', $idCliente)
            ->where('estado', 'Activo')
            ->whereDate('fecha_inicio', '>', today())
            ->orderBy('fecha_inicio')
            ->first();
    }
}
