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
                'objetivo' => 'fuerza',
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
            'zonas' => 'required|array|min:1|max:7',
            'zonas.*' => ['required', 'string', Rule::in(['piernas', 'brazos', 'pecho', 'espalda', 'hombros', 'gluteos', 'core'])],
            'objetivo' => ['required', 'string', Rule::in(['fuerza', 'resistencia', 'movilidad'])],
        ], [
            'dias.max' => 'Puedes programar hasta 4 días de entrenamiento en casa por semana.',
            'zonas.required' => 'Selecciona al menos una zona de entrenamiento.',
        ]);

        $plan = PlanEntrenamientoCasa::updateOrCreate(
            ['id_cliente' => $cliente->id_cliente],
            [
                'dias' => array_values(array_unique($datos['dias'])),
                'zonas' => array_values(array_unique($datos['zonas'])),
                'objetivo' => $datos['objetivo'],
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
            'zona' => ['required', 'string', Rule::in(['piernas', 'brazos', 'pecho', 'espalda', 'hombros', 'gluteos', 'core'])],
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
                    'modo' => 'repeticiones',
                    'repeticiones' => 10,
                    'por_lado' => false,
                    'series' => 1,
                    'segundos' => 45,
                    'descanso' => 25,
                    'icono' => '🦵',
                    'instrucciones' => [
                        'Coloca una silla estable detrás de ti y separa los pies al ancho de los hombros.',
                        'Baja con control llevando la cadera hacia atrás hasta tocar suavemente la silla.',
                        'Vuelve a subir sin rebotar y mantén las rodillas alineadas con los pies.',
                    ],
                ],
                [
                    'id' => 'zancada_asistida',
                    'nombre' => 'Zancada asistida',
                    'modo' => 'repeticiones',
                    'repeticiones' => 8,
                    'por_lado' => true,
                    'series' => 1,
                    'segundos' => 50,
                    'descanso' => 30,
                    'icono' => '⇅',
                    'instrucciones' => [
                        'Apóyate ligeramente en una pared o silla estable.',
                        'Da un paso hacia atrás y baja solo hasta donde mantengas el equilibrio.',
                        'Haz las repeticiones indicadas con una pierna y luego cambia de lado.',
                    ],
                ],
                [
                    'id' => 'talones',
                    'nombre' => 'Elevación de talones',
                    'modo' => 'repeticiones',
                    'repeticiones' => 12,
                    'por_lado' => false,
                    'series' => 1,
                    'segundos' => 40,
                    'descanso' => 20,
                    'icono' => '↑',
                    'instrucciones' => [
                        'Párate derecho cerca de una pared por seguridad.',
                        'Eleva los talones lentamente y mantén un segundo arriba.',
                        'Baja con control y repite sin apresurarte.',
                    ],
                ],
                [
                    'id' => 'marcha',
                    'nombre' => 'Marcha activa',
                    'modo' => 'tiempo',
                    'repeticiones' => 0,
                    'por_lado' => false,
                    'series' => 1,
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
                    'id' => 'flexion_pared_brazos',
                    'nombre' => 'Flexiones en pared',
                    'modo' => 'repeticiones',
                    'repeticiones' => 10,
                    'por_lado' => false,
                    'series' => 1,
                    'segundos' => 45,
                    'descanso' => 25,
                    'icono' => '💪',
                    'instrucciones' => [
                        'Coloca las manos en una pared a la altura del pecho.',
                        'Acerca el pecho a la pared manteniendo el cuerpo alineado.',
                        'Empuja con control para volver a la posición inicial.',
                    ],
                ],
                [
                    'id' => 'circulos_brazos',
                    'nombre' => 'Círculos de brazos',
                    'modo' => 'tiempo',
                    'repeticiones' => 0,
                    'por_lado' => false,
                    'series' => 1,
                    'segundos' => 30,
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
                    'modo' => 'repeticiones',
                    'repeticiones' => 8,
                    'por_lado' => false,
                    'series' => 1,
                    'segundos' => 35,
                    'descanso' => 20,
                    'icono' => '◇',
                    'instrucciones' => [
                        'Junta las palmas delante del pecho.',
                        'Presiona una contra otra durante dos segundos y relaja.',
                        'Mantén hombros relajados y respira normalmente.',
                    ],
                ],
                [
                    'id' => 'extension_triceps_pared',
                    'nombre' => 'Extensión de tríceps en pared',
                    'modo' => 'repeticiones',
                    'repeticiones' => 8,
                    'por_lado' => false,
                    'series' => 1,
                    'segundos' => 40,
                    'descanso' => 25,
                    'icono' => '↗',
                    'instrucciones' => [
                        'Apoya las manos en la pared un poco más juntas que los hombros.',
                        'Flexiona los codos lentamente acercando la frente a la pared.',
                        'Empuja de nuevo hasta extender los brazos sin bloquear los codos.',
                    ],
                ],
            ],
            'pecho' => [
                [
                    'id' => 'flexion_pared_pecho',
                    'nombre' => 'Flexión de pecho en pared',
                    'modo' => 'repeticiones',
                    'repeticiones' => 10,
                    'por_lado' => false,
                    'series' => 1,
                    'segundos' => 45,
                    'descanso' => 25,
                    'icono' => '◆',
                    'instrucciones' => [
                        'Coloca las manos en la pared un poco más abiertas que los hombros.',
                        'Lleva el pecho hacia la pared manteniendo el cuerpo recto.',
                        'Regresa con control y sin contener la respiración.',
                    ],
                ],
                [
                    'id' => 'presion_pecho',
                    'nombre' => 'Presión de pecho',
                    'modo' => 'repeticiones',
                    'repeticiones' => 10,
                    'por_lado' => false,
                    'series' => 1,
                    'segundos' => 35,
                    'descanso' => 20,
                    'icono' => '◈',
                    'instrucciones' => [
                        'Junta las palmas delante del pecho.',
                        'Presiona firmemente durante dos segundos.',
                        'Relaja y vuelve a repetir sin subir los hombros.',
                    ],
                ],
                [
                    'id' => 'apertura_brazos',
                    'nombre' => 'Apertura de brazos sin peso',
                    'modo' => 'repeticiones',
                    'repeticiones' => 10,
                    'por_lado' => false,
                    'series' => 1,
                    'segundos' => 40,
                    'descanso' => 20,
                    'icono' => '↔',
                    'instrucciones' => [
                        'Párate derecho con los brazos al frente.',
                        'Abre los brazos hacia los lados sin forzar los hombros.',
                        'Vuelve al centro lentamente y repite.',
                    ],
                ],
                [
                    'id' => 'plancha_pared_pecho',
                    'nombre' => 'Plancha inclinada en pared',
                    'modo' => 'tiempo',
                    'repeticiones' => 0,
                    'por_lado' => false,
                    'series' => 1,
                    'segundos' => 30,
                    'descanso' => 25,
                    'icono' => '▰',
                    'instrucciones' => [
                        'Apoya las manos en la pared y da un pequeño paso hacia atrás.',
                        'Mantén el cuerpo alineado y el abdomen suavemente activo.',
                        'Respira normal durante todo el tiempo.',
                    ],
                ],
            ],
            'espalda' => [
                [
                    'id' => 'bird_dog_espalda',
                    'nombre' => 'Bird-dog',
                    'modo' => 'repeticiones',
                    'repeticiones' => 8,
                    'por_lado' => true,
                    'series' => 1,
                    'segundos' => 50,
                    'descanso' => 25,
                    'icono' => '✦',
                    'instrucciones' => [
                        'Colócate en cuatro apoyos con manos debajo de hombros.',
                        'Extiende un brazo y la pierna contraria sin arquear la espalda.',
                        'Completa las repeticiones alternando ambos lados.',
                    ],
                ],
                [
                    'id' => 'angel_pared',
                    'nombre' => 'Ángeles en pared',
                    'modo' => 'repeticiones',
                    'repeticiones' => 8,
                    'por_lado' => false,
                    'series' => 1,
                    'segundos' => 40,
                    'descanso' => 20,
                    'icono' => '↕',
                    'instrucciones' => [
                        'Apoya la espalda contra una pared de forma cómoda.',
                        'Desliza los brazos hacia arriba sin forzar el rango de movimiento.',
                        'Baja lentamente y repite.',
                    ],
                ],
                [
                    'id' => 'remo_isometrico',
                    'nombre' => 'Remo isométrico sin peso',
                    'modo' => 'repeticiones',
                    'repeticiones' => 10,
                    'por_lado' => false,
                    'series' => 1,
                    'segundos' => 40,
                    'descanso' => 20,
                    'icono' => '⇤',
                    'instrucciones' => [
                        'Lleva los codos hacia atrás como si quisieras juntar suavemente los omóplatos.',
                        'Mantén la contracción un segundo sin sacar el pecho en exceso.',
                        'Relaja y repite con control.',
                    ],
                ],
                [
                    'id' => 'cobra_suave',
                    'nombre' => 'Cobra suave',
                    'modo' => 'tiempo',
                    'repeticiones' => 0,
                    'por_lado' => false,
                    'series' => 1,
                    'segundos' => 25,
                    'descanso' => 25,
                    'icono' => '⌁',
                    'instrucciones' => [
                        'Acuéstate boca abajo con las manos cerca de los hombros.',
                        'Eleva ligeramente el pecho sin forzar la zona lumbar.',
                        'Mantén una respiración tranquila y baja si aparece molestia.',
                    ],
                ],
            ],
            'hombros' => [
                [
                    'id' => 'elevacion_lateral_hombros',
                    'nombre' => 'Elevación lateral sin peso',
                    'modo' => 'repeticiones',
                    'repeticiones' => 10,
                    'por_lado' => false,
                    'series' => 1,
                    'segundos' => 40,
                    'descanso' => 20,
                    'icono' => '↔',
                    'instrucciones' => [
                        'De pie, deja los brazos relajados a los lados.',
                        'Eleva ambos brazos hasta una altura cómoda, sin superar los hombros.',
                        'Baja lentamente y repite con control.',
                    ],
                ],
                [
                    'id' => 'deslizamiento_pared',
                    'nombre' => 'Deslizamiento de brazos en pared',
                    'modo' => 'repeticiones',
                    'repeticiones' => 8,
                    'por_lado' => false,
                    'series' => 1,
                    'segundos' => 40,
                    'descanso' => 20,
                    'icono' => '⇧',
                    'instrucciones' => [
                        'Apoya la espalda contra la pared y coloca los brazos en forma de W.',
                        'Desliza los brazos hacia arriba lentamente.',
                        'Regresa a la posición inicial sin dolor.',
                    ],
                ],
                [
                    'id' => 'rotacion_externa',
                    'nombre' => 'Rotación externa sin peso',
                    'modo' => 'repeticiones',
                    'repeticiones' => 8,
                    'por_lado' => true,
                    'series' => 1,
                    'segundos' => 45,
                    'descanso' => 20,
                    'icono' => '↻',
                    'instrucciones' => [
                        'Mantén el codo pegado al cuerpo y flexionado.',
                        'Gira el antebrazo hacia afuera hasta un rango cómodo.',
                        'Haz las repeticiones indicadas de un lado y luego del otro.',
                    ],
                ],
                [
                    'id' => 'circulos_hombros',
                    'nombre' => 'Círculos de hombros',
                    'modo' => 'tiempo',
                    'repeticiones' => 0,
                    'por_lado' => false,
                    'series' => 1,
                    'segundos' => 30,
                    'descanso' => 15,
                    'icono' => '◌',
                    'instrucciones' => [
                        'Mantén los brazos relajados.',
                        'Haz círculos pequeños y lentos con los hombros.',
                        'Cambia de dirección a la mitad del tiempo.',
                    ],
                ],
            ],
            'gluteos' => [
                [
                    'id' => 'puente_gluteos',
                    'nombre' => 'Puente de cadera',
                    'modo' => 'repeticiones',
                    'repeticiones' => 12,
                    'por_lado' => false,
                    'series' => 1,
                    'segundos' => 45,
                    'descanso' => 25,
                    'icono' => '↥',
                    'instrucciones' => [
                        'Acuéstate boca arriba con las rodillas flexionadas y los pies apoyados.',
                        'Eleva la cadera con control hasta una altura cómoda.',
                        'Baja despacio y repite sin arquear la espalda.',
                    ],
                ],
                [
                    'id' => 'abduccion_pie',
                    'nombre' => 'Elevación lateral de pierna',
                    'modo' => 'repeticiones',
                    'repeticiones' => 10,
                    'por_lado' => true,
                    'series' => 1,
                    'segundos' => 50,
                    'descanso' => 25,
                    'icono' => '↗',
                    'instrucciones' => [
                        'Apóyate en una pared o silla estable.',
                        'Eleva una pierna hacia el lado sin inclinar el tronco.',
                        'Completa las repeticiones y cambia de lado.',
                    ],
                ],
                [
                    'id' => 'patada_atras',
                    'nombre' => 'Extensión de cadera de pie',
                    'modo' => 'repeticiones',
                    'repeticiones' => 10,
                    'por_lado' => true,
                    'series' => 1,
                    'segundos' => 50,
                    'descanso' => 25,
                    'icono' => '⇠',
                    'instrucciones' => [
                        'Apóyate ligeramente para mantener el equilibrio.',
                        'Lleva una pierna hacia atrás sin arquear la espalda.',
                        'Completa las repeticiones de un lado y luego cambia.',
                    ],
                ],
                [
                    'id' => 'sentadilla_gluteos',
                    'nombre' => 'Sentadilla controlada',
                    'modo' => 'repeticiones',
                    'repeticiones' => 10,
                    'por_lado' => false,
                    'series' => 1,
                    'segundos' => 45,
                    'descanso' => 25,
                    'icono' => '▼',
                    'instrucciones' => [
                        'Separa los pies de forma cómoda.',
                        'Lleva la cadera hacia atrás y baja solo hasta donde mantengas buena postura.',
                        'Sube con control y repite.',
                    ],
                ],
            ],
            'core' => [
                [
                    'id' => 'dead_bug',
                    'nombre' => 'Dead bug básico',
                    'modo' => 'repeticiones',
                    'repeticiones' => 8,
                    'por_lado' => true,
                    'series' => 1,
                    'segundos' => 50,
                    'descanso' => 25,
                    'icono' => '◎',
                    'instrucciones' => [
                        'Acuéstate boca arriba con rodillas flexionadas y brazos arriba.',
                        'Baja lentamente un brazo y la pierna contraria sin despegar la espalda del suelo.',
                        'Haz las repeticiones indicadas alternando ambos lados.',
                    ],
                ],
                [
                    'id' => 'bird_dog_core',
                    'nombre' => 'Bird-dog',
                    'modo' => 'repeticiones',
                    'repeticiones' => 8,
                    'por_lado' => true,
                    'series' => 1,
                    'segundos' => 50,
                    'descanso' => 25,
                    'icono' => '✦',
                    'instrucciones' => [
                        'Colócate en cuatro apoyos con manos debajo de hombros.',
                        'Extiende un brazo y la pierna contraria sin arquear la espalda.',
                        'Regresa al centro y alterna el lado.',
                    ],
                ],
                [
                    'id' => 'rodilla_mano',
                    'nombre' => 'Rodilla a mano de pie',
                    'modo' => 'repeticiones',
                    'repeticiones' => 10,
                    'por_lado' => true,
                    'series' => 1,
                    'segundos' => 50,
                    'descanso' => 20,
                    'icono' => '↗',
                    'instrucciones' => [
                        'Párate derecho y lleva una rodilla hacia la mano contraria.',
                        'Vuelve al centro con control.',
                        'Completa las repeticiones indicadas de cada lado.',
                    ],
                ],
                [
                    'id' => 'respiracion_core',
                    'nombre' => 'Respiración y estabilidad',
                    'modo' => 'tiempo',
                    'repeticiones' => 0,
                    'por_lado' => false,
                    'series' => 1,
                    'segundos' => 35,
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
