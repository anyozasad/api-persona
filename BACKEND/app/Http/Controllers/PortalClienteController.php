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

        // La sesión guiada solo se habilita cuando el cliente está físicamente
        // dentro de Mallqui Gym y recepción ya registró su ingreso del día.
        $asistenciaActiva = Asistencia::query()
            ->where('id_cliente', $cliente->id_cliente)
            ->whereDate('fecha_hora_entrada', today())
            ->whereNull('fecha_hora_salida')
            ->orderByDesc('fecha_hora_entrada')
            ->first();

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
            'presencia' => [
                'dentro_gym' => (bool) $asistenciaActiva,
                'asistencia' => $asistenciaActiva,
                'mensaje' => $asistenciaActiva
                    ? 'Ingreso confirmado. El entrenamiento dentro de Mallqui Gym está habilitado.'
                    : 'Primero registra tu ingreso en recepción para habilitar el entrenamiento dentro del gimnasio.',
            ],
            'plan' => $plan,
            'catalogo' => $this->catalogoEntrenamientoCasa(),
            'historial' => SesionEntrenamientoCasa::query()
                ->where('id_cliente', $cliente->id_cliente)
                ->orderByDesc('fecha')
                ->limit(12)
                ->get(),
            'reglas' => [
                'max_dias_semana' => 4,
                'mensaje' => 'Sesiones guiadas dentro del gimnasio. Usa una carga moderada y detente si sientes dolor o mareo.',
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
            'dias.max' => 'Puedes programar hasta 4 días de entrenamiento en el gimnasio por semana.',
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

        $asistenciaActiva = Asistencia::query()
            ->where('id_cliente', $cliente->id_cliente)
            ->whereDate('fecha_hora_entrada', today())
            ->whereNull('fecha_hora_salida')
            ->orderByDesc('fecha_hora_entrada')
            ->first();

        if (!$asistenciaActiva) {
            return response()->json([
                'mensaje' => 'Esta sesión solo puede guardarse mientras estás dentro de Mallqui Gym. Registra primero tu ingreso en recepción.',
            ], 422);
        }

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
        // El nombre interno se conserva por compatibilidad con las rutas y tablas existentes,
        // pero el catálogo corresponde a entrenamiento realizado dentro del gimnasio.
        return [
            'piernas' => [
                [
                    'id' => 'sentadilla_mancuernas',
                    'nombre' => 'Sentadilla con mancuernas',
                    'modo' => 'repeticiones',
                    'repeticiones' => 10,
                    'por_lado' => false,
                    'series' => 3,
                    'segundos' => 45,
                    'descanso' => 45,
                    'icono' => '🦵',
                    'equipo' => 'Mancuernas',
                    'instrucciones' => [
                        'Toma dos mancuernas de carga moderada y coloca los pies al ancho de los hombros.',
                        'Baja con control manteniendo el pecho estable y las rodillas alineadas.',
                        'Sube de forma controlada y evita bloquear las rodillas al terminar.',
                    ],
                ],
                [
                    'id' => 'prensa_piernas',
                    'nombre' => 'Prensa de piernas',
                    'modo' => 'repeticiones',
                    'repeticiones' => 12,
                    'por_lado' => false,
                    'series' => 3,
                    'segundos' => 45,
                    'descanso' => 50,
                    'icono' => '▰',
                    'equipo' => 'Máquina de prensa',
                    'instrucciones' => [
                        'Ajusta el asiento y coloca ambos pies firmes sobre la plataforma.',
                        'Empuja la plataforma sin bloquear completamente las rodillas.',
                        'Regresa lentamente hasta una posición cómoda y repite.',
                    ],
                ],
                [
                    'id' => 'extension_cuadriceps',
                    'nombre' => 'Extensión de cuádriceps',
                    'modo' => 'repeticiones',
                    'repeticiones' => 12,
                    'por_lado' => false,
                    'series' => 3,
                    'segundos' => 40,
                    'descanso' => 40,
                    'icono' => '↑',
                    'equipo' => 'Máquina de extensión',
                    'instrucciones' => [
                        'Ajusta el respaldo y el rodillo para que quede cómodo sobre la parte baja de las piernas.',
                        'Extiende las piernas con control sin lanzar el peso.',
                        'Baja lentamente hasta la posición inicial.',
                    ],
                ],
                [
                    'id' => 'curl_femoral',
                    'nombre' => 'Curl femoral en máquina',
                    'modo' => 'repeticiones',
                    'repeticiones' => 12,
                    'por_lado' => false,
                    'series' => 3,
                    'segundos' => 40,
                    'descanso' => 40,
                    'icono' => '↙',
                    'equipo' => 'Máquina femoral',
                    'instrucciones' => [
                        'Ajusta la máquina para que el rodillo quede en una posición cómoda.',
                        'Flexiona las rodillas llevando el rodillo hacia atrás de forma controlada.',
                        'Regresa lentamente sin dejar caer el peso.',
                    ],
                ],
            ],
            'brazos' => [
                [
                    'id' => 'curl_biceps_mancuernas',
                    'nombre' => 'Curl de bíceps con mancuernas',
                    'modo' => 'repeticiones',
                    'repeticiones' => 12,
                    'por_lado' => false,
                    'series' => 3,
                    'segundos' => 40,
                    'descanso' => 40,
                    'icono' => '💪',
                    'equipo' => 'Mancuernas',
                    'instrucciones' => [
                        'Mantén los codos cerca del cuerpo y las mancuernas a los lados.',
                        'Flexiona los codos sin balancear el tronco.',
                        'Baja las mancuernas lentamente hasta la posición inicial.',
                    ],
                ],
                [
                    'id' => 'curl_martillo',
                    'nombre' => 'Curl martillo',
                    'modo' => 'repeticiones',
                    'repeticiones' => 10,
                    'por_lado' => false,
                    'series' => 3,
                    'segundos' => 40,
                    'descanso' => 40,
                    'icono' => '↕',
                    'equipo' => 'Mancuernas',
                    'instrucciones' => [
                        'Sujeta las mancuernas con las palmas mirando hacia el cuerpo.',
                        'Sube ambas mancuernas manteniendo los codos estables.',
                        'Baja con control sin usar impulso.',
                    ],
                ],
                [
                    'id' => 'triceps_polea',
                    'nombre' => 'Extensión de tríceps en polea',
                    'modo' => 'repeticiones',
                    'repeticiones' => 12,
                    'por_lado' => false,
                    'series' => 3,
                    'segundos' => 40,
                    'descanso' => 40,
                    'icono' => '⇣',
                    'equipo' => 'Polea alta',
                    'instrucciones' => [
                        'Colócate frente a la polea con los codos pegados al cuerpo.',
                        'Empuja el agarre hacia abajo hasta extender los brazos.',
                        'Regresa lentamente manteniendo los codos en su sitio.',
                    ],
                ],
                [
                    'id' => 'triceps_mancuerna',
                    'nombre' => 'Extensión de tríceps con mancuerna',
                    'modo' => 'repeticiones',
                    'repeticiones' => 10,
                    'por_lado' => false,
                    'series' => 3,
                    'segundos' => 40,
                    'descanso' => 40,
                    'icono' => '↗',
                    'equipo' => 'Mancuerna',
                    'instrucciones' => [
                        'Sujeta una mancuerna con ambas manos por encima de la cabeza.',
                        'Flexiona los codos llevando la mancuerna detrás de la cabeza con control.',
                        'Extiende nuevamente sin arquear la espalda.',
                    ],
                ],
            ],
            'pecho' => [
                [
                    'id' => 'press_banca_mancuernas',
                    'nombre' => 'Press de banca con mancuernas',
                    'modo' => 'repeticiones',
                    'repeticiones' => 10,
                    'por_lado' => false,
                    'series' => 3,
                    'segundos' => 45,
                    'descanso' => 50,
                    'icono' => '◆',
                    'equipo' => 'Banco y mancuernas',
                    'instrucciones' => [
                        'Acuéstate en el banco con los pies firmes y una mancuerna en cada mano.',
                        'Baja las mancuernas de forma controlada hasta una posición cómoda.',
                        'Empuja hacia arriba manteniendo las muñecas alineadas.',
                    ],
                ],
                [
                    'id' => 'press_pecho_maquina',
                    'nombre' => 'Press de pecho en máquina',
                    'modo' => 'repeticiones',
                    'repeticiones' => 12,
                    'por_lado' => false,
                    'series' => 3,
                    'segundos' => 45,
                    'descanso' => 45,
                    'icono' => '◈',
                    'equipo' => 'Máquina de pecho',
                    'instrucciones' => [
                        'Ajusta el asiento para que los agarres queden a la altura del pecho.',
                        'Empuja hacia adelante sin bloquear completamente los codos.',
                        'Regresa lentamente manteniendo la espalda apoyada.',
                    ],
                ],
                [
                    'id' => 'aperturas_mancuernas',
                    'nombre' => 'Aperturas con mancuernas',
                    'modo' => 'repeticiones',
                    'repeticiones' => 10,
                    'por_lado' => false,
                    'series' => 3,
                    'segundos' => 45,
                    'descanso' => 45,
                    'icono' => '↔',
                    'equipo' => 'Banco y mancuernas',
                    'instrucciones' => [
                        'Acuéstate en el banco con los brazos arriba y los codos ligeramente flexionados.',
                        'Abre los brazos de forma controlada hasta un rango cómodo.',
                        'Vuelve al centro sin golpear las mancuernas.',
                    ],
                ],
                [
                    'id' => 'flexiones_banco',
                    'nombre' => 'Flexiones inclinadas en banco',
                    'modo' => 'repeticiones',
                    'repeticiones' => 10,
                    'por_lado' => false,
                    'series' => 3,
                    'segundos' => 40,
                    'descanso' => 40,
                    'icono' => '▰',
                    'equipo' => 'Banco estable',
                    'instrucciones' => [
                        'Apoya las manos sobre un banco estable y mantén el cuerpo alineado.',
                        'Baja el pecho hacia el banco con los codos controlados.',
                        'Empuja para regresar a la posición inicial.',
                    ],
                ],
            ],
            'espalda' => [
                [
                    'id' => 'jalon_pecho',
                    'nombre' => 'Jalón al pecho',
                    'modo' => 'repeticiones',
                    'repeticiones' => 12,
                    'por_lado' => false,
                    'series' => 3,
                    'segundos' => 45,
                    'descanso' => 45,
                    'icono' => '⇣',
                    'equipo' => 'Polea alta',
                    'instrucciones' => [
                        'Siéntate con el torso estable y toma la barra con un agarre cómodo.',
                        'Lleva la barra hacia la parte alta del pecho sin tirar con impulso.',
                        'Regresa lentamente hasta extender los brazos.',
                    ],
                ],
                [
                    'id' => 'remo_sentado',
                    'nombre' => 'Remo sentado en polea',
                    'modo' => 'repeticiones',
                    'repeticiones' => 12,
                    'por_lado' => false,
                    'series' => 3,
                    'segundos' => 45,
                    'descanso' => 45,
                    'icono' => '⇤',
                    'equipo' => 'Polea baja',
                    'instrucciones' => [
                        'Siéntate con la espalda neutra y toma el agarre.',
                        'Lleva el agarre hacia el abdomen juntando suavemente los omóplatos.',
                        'Extiende los brazos de nuevo sin redondear la espalda.',
                    ],
                ],
                [
                    'id' => 'remo_mancuerna',
                    'nombre' => 'Remo con mancuerna',
                    'modo' => 'repeticiones',
                    'repeticiones' => 10,
                    'por_lado' => true,
                    'series' => 3,
                    'segundos' => 50,
                    'descanso' => 45,
                    'icono' => '↙',
                    'equipo' => 'Banco y mancuerna',
                    'instrucciones' => [
                        'Apoya una mano y una rodilla sobre el banco manteniendo la espalda estable.',
                        'Lleva la mancuerna hacia el costado del torso sin girar el cuerpo.',
                        'Baja con control y completa las repeticiones de cada lado.',
                    ],
                ],
                [
                    'id' => 'pullover_polea',
                    'nombre' => 'Pullover en polea',
                    'modo' => 'repeticiones',
                    'repeticiones' => 12,
                    'por_lado' => false,
                    'series' => 3,
                    'segundos' => 40,
                    'descanso' => 40,
                    'icono' => '⌁',
                    'equipo' => 'Polea alta',
                    'instrucciones' => [
                        'Colócate frente a la polea con los brazos casi extendidos.',
                        'Lleva el agarre hacia los muslos manteniendo el torso estable.',
                        'Regresa lentamente sin encoger los hombros.',
                    ],
                ],
            ],
            'hombros' => [
                [
                    'id' => 'press_hombros',
                    'nombre' => 'Press de hombros con mancuernas',
                    'modo' => 'repeticiones',
                    'repeticiones' => 10,
                    'por_lado' => false,
                    'series' => 3,
                    'segundos' => 45,
                    'descanso' => 45,
                    'icono' => '↑',
                    'equipo' => 'Banco y mancuernas',
                    'instrucciones' => [
                        'Siéntate con la espalda apoyada y coloca las mancuernas a la altura de los hombros.',
                        'Empuja hacia arriba sin golpear las mancuernas.',
                        'Baja lentamente hasta la posición inicial.',
                    ],
                ],
                [
                    'id' => 'elevacion_lateral_mancuernas',
                    'nombre' => 'Elevación lateral con mancuernas',
                    'modo' => 'repeticiones',
                    'repeticiones' => 12,
                    'por_lado' => false,
                    'series' => 3,
                    'segundos' => 40,
                    'descanso' => 40,
                    'icono' => '↔',
                    'equipo' => 'Mancuernas',
                    'instrucciones' => [
                        'Mantén una mancuerna en cada mano y los codos ligeramente flexionados.',
                        'Eleva los brazos hasta una altura cómoda cercana a los hombros.',
                        'Baja despacio sin balancear el cuerpo.',
                    ],
                ],
                [
                    'id' => 'face_pull',
                    'nombre' => 'Face pull en polea',
                    'modo' => 'repeticiones',
                    'repeticiones' => 12,
                    'por_lado' => false,
                    'series' => 3,
                    'segundos' => 40,
                    'descanso' => 40,
                    'icono' => '⇠',
                    'equipo' => 'Polea y cuerda',
                    'instrucciones' => [
                        'Coloca la cuerda a la altura del rostro y toma ambos extremos.',
                        'Lleva la cuerda hacia el rostro separando las manos con control.',
                        'Regresa lentamente manteniendo el torso estable.',
                    ],
                ],
                [
                    'id' => 'elevacion_frontal_mancuernas',
                    'nombre' => 'Elevación frontal con mancuernas',
                    'modo' => 'repeticiones',
                    'repeticiones' => 10,
                    'por_lado' => false,
                    'series' => 3,
                    'segundos' => 40,
                    'descanso' => 40,
                    'icono' => '⇧',
                    'equipo' => 'Mancuernas',
                    'instrucciones' => [
                        'Sujeta las mancuernas frente a los muslos con los brazos relajados.',
                        'Eleva los brazos al frente hasta una altura cómoda.',
                        'Baja lentamente sin usar impulso.',
                    ],
                ],
            ],
            'gluteos' => [
                [
                    'id' => 'hip_thrust_banco',
                    'nombre' => 'Hip thrust en banco',
                    'modo' => 'repeticiones',
                    'repeticiones' => 12,
                    'por_lado' => false,
                    'series' => 3,
                    'segundos' => 45,
                    'descanso' => 50,
                    'icono' => '↥',
                    'equipo' => 'Banco y carga moderada',
                    'instrucciones' => [
                        'Apoya la parte alta de la espalda sobre un banco estable.',
                        'Eleva la cadera con control hasta alinear el tronco y los muslos.',
                        'Baja lentamente sin perder la posición de los pies.',
                    ],
                ],
                [
                    'id' => 'sentadilla_sumo_mancuerna',
                    'nombre' => 'Sentadilla sumo con mancuerna',
                    'modo' => 'repeticiones',
                    'repeticiones' => 12,
                    'por_lado' => false,
                    'series' => 3,
                    'segundos' => 45,
                    'descanso' => 45,
                    'icono' => '▼',
                    'equipo' => 'Mancuerna',
                    'instrucciones' => [
                        'Coloca los pies algo más abiertos que los hombros y sujeta una mancuerna al centro.',
                        'Baja con control manteniendo las rodillas alineadas con los pies.',
                        'Sube de forma estable sin rebotar.',
                    ],
                ],
                [
                    'id' => 'abduccion_maquina',
                    'nombre' => 'Abducción de cadera en máquina',
                    'modo' => 'repeticiones',
                    'repeticiones' => 15,
                    'por_lado' => false,
                    'series' => 3,
                    'segundos' => 40,
                    'descanso' => 40,
                    'icono' => '↔',
                    'equipo' => 'Máquina de abductores',
                    'instrucciones' => [
                        'Siéntate con la espalda apoyada y ajusta los apoyos laterales.',
                        'Abre las piernas de forma controlada hasta un rango cómodo.',
                        'Regresa lentamente evitando que el peso golpee.',
                    ],
                ],
                [
                    'id' => 'patada_polea',
                    'nombre' => 'Patada de glúteo en polea',
                    'modo' => 'repeticiones',
                    'repeticiones' => 12,
                    'por_lado' => true,
                    'series' => 3,
                    'segundos' => 50,
                    'descanso' => 40,
                    'icono' => '⇠',
                    'equipo' => 'Polea baja y tobillera',
                    'instrucciones' => [
                        'Asegura la tobillera y apóyate de forma estable frente a la polea.',
                        'Lleva una pierna hacia atrás sin arquear la espalda.',
                        'Regresa con control y completa las repeticiones de cada lado.',
                    ],
                ],
            ],
            'core' => [
                [
                    'id' => 'crunch_maquina',
                    'nombre' => 'Crunch abdominal en máquina',
                    'modo' => 'repeticiones',
                    'repeticiones' => 12,
                    'por_lado' => false,
                    'series' => 3,
                    'segundos' => 40,
                    'descanso' => 40,
                    'icono' => '◎',
                    'equipo' => 'Máquina abdominal',
                    'instrucciones' => [
                        'Ajusta el asiento y toma los agarres de la máquina.',
                        'Flexiona el tronco de forma controlada usando el abdomen.',
                        'Regresa lentamente sin dejar que el peso golpee.',
                    ],
                ],
                [
                    'id' => 'plancha_colchoneta',
                    'nombre' => 'Plancha en colchoneta',
                    'modo' => 'tiempo',
                    'repeticiones' => 0,
                    'por_lado' => false,
                    'series' => 3,
                    'segundos' => 30,
                    'descanso' => 35,
                    'icono' => '▬',
                    'equipo' => 'Colchoneta',
                    'instrucciones' => [
                        'Apoya antebrazos y puntas de los pies sobre la colchoneta.',
                        'Mantén el cuerpo alineado y el abdomen activo.',
                        'Respira de forma normal durante el tiempo indicado.',
                    ],
                ],
                [
                    'id' => 'elevacion_rodillas_banco',
                    'nombre' => 'Elevación de rodillas en banco',
                    'modo' => 'repeticiones',
                    'repeticiones' => 10,
                    'por_lado' => false,
                    'series' => 3,
                    'segundos' => 45,
                    'descanso' => 40,
                    'icono' => '↟',
                    'equipo' => 'Banco',
                    'instrucciones' => [
                        'Siéntate en el borde del banco y apoya las manos de forma estable.',
                        'Acerca las rodillas al torso sin balancearte.',
                        'Extiende de nuevo las piernas de forma controlada.',
                    ],
                ],
                [
                    'id' => 'pallof_polea',
                    'nombre' => 'Press Pallof en polea',
                    'modo' => 'repeticiones',
                    'repeticiones' => 10,
                    'por_lado' => true,
                    'series' => 3,
                    'segundos' => 45,
                    'descanso' => 40,
                    'icono' => '◇',
                    'equipo' => 'Polea',
                    'instrucciones' => [
                        'Colócate de lado a la polea y sujeta el agarre frente al pecho.',
                        'Extiende los brazos al frente manteniendo el torso estable.',
                        'Regresa al pecho y completa ambos lados con control.',
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
