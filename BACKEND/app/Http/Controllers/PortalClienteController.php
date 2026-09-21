<?php

namespace App\Http\Controllers;

use App\Models\Asistencia;
use App\Models\Cliente;
use App\Models\ClienteMembresia;
use App\Models\PagoMembresia;
use App\Models\PlanEntrenamientoCasa;
use App\Models\Rutina;
use App\Models\SesionEntrenamientoCasa;
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

    public function comprobante(Request $request, string $idPago)
    {
        $cliente = $this->clienteDelUsuario($request);

        $pago = PagoMembresia::with(['clienteMembresia.membresia', 'clienteMembresia.cliente'])
            ->where('id_pago', $idPago)
            ->whereHas('clienteMembresia', fn ($q) => $q->where('id_cliente', $cliente->id_cliente))
            ->firstOrFail();

        return response()->json([
            'empresa' => ['nombre' => 'Mallqui Gym', 'moneda' => 'PEN'],
            'comprobante' => [
                'id_pago' => $pago->id_pago,
                'fecha' => optional($pago->fecha_pago)->toDateTimeString(),
                'cliente' => trim($cliente->nombres.' '.$cliente->apellidos),
                'dni' => $cliente->dni,
                'membresia' => $pago->clienteMembresia?->membresia?->nombre,
                'periodo' => [
                    'inicio' => optional($pago->clienteMembresia?->fecha_inicio)->toDateString(),
                    'fin' => optional($pago->clienteMembresia?->fecha_fin)->toDateString(),
                ],
                'monto' => $pago->monto,
                'metodo_pago' => $pago->metodo_pago,
                'numero_operacion' => $pago->numero_operacion,
                'estado' => $pago->estado_pago,
            ],
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

        $plan = PlanEntrenamientoCasa::firstOrCreate(
            ['id_cliente' => $cliente->id_cliente],
            [
                'dias' => ['Lunes', 'Miércoles', 'Viernes'],
                'zonas' => ['piernas', 'brazos', 'core'],
                'activo' => true,
            ]
        );

        return response()->json([
            'plan' => $plan,
            'catalogo' => $this->catalogoEntrenamientoCasa(),
            'historial' => SesionEntrenamientoCasa::query()
                ->where('id_cliente', $cliente->id_cliente)
                ->orderByDesc('fecha')
                ->limit(12)
                ->get(),
            'reglas' => [
                'max_dias_semana' => 4,
                'mensaje' => 'Sesiones cortas y moderadas. Detente si sientes dolor o mareo.',
            ],
        ]);
    }

    public function guardarPlanEntrenamientoCasa(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);

        $datos = $request->validate([
            'dias' => 'required|array|min:1|max:4',
            'dias.*' => ['required', 'string', Rule::in([
                'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo',
            ])],
            'zonas' => 'required|array|min:1|max:3',
            'zonas.*' => ['required', 'string', Rule::in(['piernas', 'brazos', 'core'])],
        ], [
            'dias.max' => 'Puedes programar hasta 4 días de entrenamiento en casa por semana.',
            'zonas.required' => 'Selecciona al menos una zona de entrenamiento.',
        ]);

        $plan = PlanEntrenamientoCasa::updateOrCreate(
            ['id_cliente' => $cliente->id_cliente],
            [
                'dias' => array_values(array_unique($datos['dias'])),
                'zonas' => array_values(array_unique($datos['zonas'])),
                'activo' => true,
            ]
        );

        return response()->json([
            'mensaje' => 'Plan semanal guardado correctamente.',
            'plan' => $plan->fresh(),
        ]);
    }

    public function registrarSesionEntrenamientoCasa(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);

        $datos = $request->validate([
            'zona' => ['required', 'string', Rule::in(['piernas', 'brazos', 'core'])],
            'duracion_segundos' => 'required|integer|min:1|max:7200',
            'ejercicios_total' => 'required|integer|min:1|max:20',
            'ejercicios_completados' => 'required|integer|min:1|max:20',
        ]);

        if ($datos['ejercicios_completados'] > $datos['ejercicios_total']) {
            return response()->json([
                'mensaje' => 'Los ejercicios completados no pueden superar el total.',
            ], 422);
        }

        $sesion = SesionEntrenamientoCasa::create([
            'id_cliente' => $cliente->id_cliente,
            'zona' => $datos['zona'],
            'fecha' => now(),
            'duracion_segundos' => $datos['duracion_segundos'],
            'ejercicios_total' => $datos['ejercicios_total'],
            'ejercicios_completados' => $datos['ejercicios_completados'],
            'estado' => 'Completada',
        ]);

        return response()->json([
            'mensaje' => 'Entrenamiento completado y guardado.',
            'sesion' => $sesion,
        ], 201);
    }

    private function catalogoEntrenamientoCasa(): array
    {
        return [
            'piernas' => [
                [
                    'id' => 'sentadilla_silla',
                    'nombre' => 'Sentadilla a silla',
                    'segundos' => 40,
                    'descanso' => 20,
                    'icono' => '🦵',
                    'instrucciones' => [
                        'Coloca una silla estable detrás de ti y separa los pies al ancho de los hombros.',
                        'Baja despacio llevando la cadera hacia atrás hasta tocar suavemente la silla.',
                        'Vuelve a subir con control y mantén las rodillas alineadas con los pies.',
                    ],
                ],
                [
                    'id' => 'puente_gluteos',
                    'nombre' => 'Puente de cadera',
                    'segundos' => 40,
                    'descanso' => 20,
                    'icono' => '↥',
                    'instrucciones' => [
                        'Acuéstate boca arriba con las rodillas flexionadas y los pies apoyados.',
                        'Eleva la cadera con control hasta formar una línea cómoda entre hombros y rodillas.',
                        'Baja despacio sin dejarte caer.',
                    ],
                ],
                [
                    'id' => 'zancada_asistida',
                    'nombre' => 'Zancada asistida',
                    'segundos' => 30,
                    'descanso' => 25,
                    'icono' => '⇅',
                    'instrucciones' => [
                        'Apóyate ligeramente en una pared o silla estable.',
                        'Da un paso hacia atrás y baja solo hasta donde puedas mantener el equilibrio.',
                        'Regresa al centro y alterna la pierna.',
                    ],
                ],
                [
                    'id' => 'talones',
                    'nombre' => 'Elevación de talones',
                    'segundos' => 40,
                    'descanso' => 20,
                    'icono' => '↑',
                    'instrucciones' => [
                        'Párate derecho cerca de una pared por seguridad.',
                        'Eleva los talones lentamente y mantén un segundo arriba.',
                        'Baja con control y repite.',
                    ],
                ],
                [
                    'id' => 'marcha',
                    'nombre' => 'Marcha activa',
                    'segundos' => 40,
                    'descanso' => 20,
                    'icono' => '◉',
                    'instrucciones' => [
                        'Marcha en el sitio a un ritmo cómodo.',
                        'Mantén el torso erguido y mueve los brazos de forma natural.',
                        'No necesitas elevar demasiado las rodillas.',
                    ],
                ],
            ],
            'brazos' => [
                [
                    'id' => 'flexion_pared',
                    'nombre' => 'Flexiones en pared',
                    'segundos' => 40,
                    'descanso' => 20,
                    'icono' => '💪',
                    'instrucciones' => [
                        'Coloca las manos en una pared a la altura del pecho.',
                        'Acerca el pecho a la pared manteniendo el cuerpo alineado.',
                        'Empuja suavemente para volver a la posición inicial.',
                    ],
                ],
                [
                    'id' => 'circulos_brazos',
                    'nombre' => 'Círculos de brazos',
                    'segundos' => 35,
                    'descanso' => 20,
                    'icono' => '↻',
                    'instrucciones' => [
                        'Extiende los brazos hacia los lados sin bloquear los codos.',
                        'Haz círculos pequeños y controlados hacia adelante.',
                        'Cambia el sentido a la mitad del tiempo.',
                    ],
                ],
                [
                    'id' => 'empuje_palmas',
                    'nombre' => 'Presión de palmas',
                    'segundos' => 35,
                    'descanso' => 20,
                    'icono' => '◇',
                    'instrucciones' => [
                        'Junta las palmas delante del pecho.',
                        'Presiona una contra otra de forma firme pero cómoda.',
                        'Mantén hombros relajados y respira normalmente.',
                    ],
                ],
                [
                    'id' => 'elevacion_lateral',
                    'nombre' => 'Elevación lateral sin peso',
                    'segundos' => 35,
                    'descanso' => 20,
                    'icono' => '↔',
                    'instrucciones' => [
                        'De pie, deja los brazos a los lados.',
                        'Eleva los brazos hasta una altura cómoda, sin superar los hombros.',
                        'Baja lentamente y repite con control.',
                    ],
                ],
                [
                    'id' => 'plancha_pared',
                    'nombre' => 'Plancha en pared',
                    'segundos' => 35,
                    'descanso' => 20,
                    'icono' => '▰',
                    'instrucciones' => [
                        'Apoya los antebrazos en una pared y da un pequeño paso hacia atrás.',
                        'Mantén el cuerpo alineado sin contener la respiración.',
                        'Sostén la posición sin forzar hombros ni espalda.',
                    ],
                ],
            ],
            'core' => [
                [
                    'id' => 'dead_bug',
                    'nombre' => 'Dead bug básico',
                    'segundos' => 35,
                    'descanso' => 20,
                    'icono' => '◎',
                    'instrucciones' => [
                        'Acuéstate boca arriba con rodillas flexionadas y brazos arriba.',
                        'Baja lentamente un brazo y la pierna contraria sin despegar la espalda del suelo.',
                        'Regresa y alterna el lado.',
                    ],
                ],
                [
                    'id' => 'bird_dog',
                    'nombre' => 'Bird-dog',
                    'segundos' => 40,
                    'descanso' => 20,
                    'icono' => '✦',
                    'instrucciones' => [
                        'Colócate en cuatro apoyos con manos debajo de hombros.',
                        'Extiende un brazo y la pierna contraria sin arquear la espalda.',
                        'Vuelve al centro y cambia de lado.',
                    ],
                ],
                [
                    'id' => 'puente_core',
                    'nombre' => 'Puente controlado',
                    'segundos' => 40,
                    'descanso' => 20,
                    'icono' => '⌒',
                    'instrucciones' => [
                        'Acuéstate boca arriba con pies apoyados.',
                        'Eleva la cadera de forma suave manteniendo el abdomen estable.',
                        'Baja lentamente y repite.',
                    ],
                ],
                [
                    'id' => 'rodilla_mano',
                    'nombre' => 'Rodilla a mano de pie',
                    'segundos' => 35,
                    'descanso' => 20,
                    'icono' => '↗',
                    'instrucciones' => [
                        'Párate derecho y lleva una rodilla hacia la mano contraria.',
                        'Vuelve al centro y alterna el lado.',
                        'Mantén un ritmo cómodo y estable.',
                    ],
                ],
                [
                    'id' => 'respiracion_core',
                    'nombre' => 'Respiración y estabilidad',
                    'segundos' => 40,
                    'descanso' => 15,
                    'icono' => '◌',
                    'instrucciones' => [
                        'Acuéstate o siéntate en una posición cómoda.',
                        'Inhala de forma tranquila y activa suavemente el abdomen al exhalar.',
                        'Mantén hombros y cuello relajados.',
                    ],
                ],
            ],
        ];
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
}
