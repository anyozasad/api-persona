<?php

namespace App\Http\Controllers;

use App\Models\Asistencia;
use App\Models\Cliente;
use App\Models\ClienteMembresia;
use App\Models\NotificacionCliente;
use App\Models\MetaCliente;
use App\Models\PagoMembresia;
use App\Models\PlanEntrenamientoCasa;
use App\Models\Reserva;
use App\Models\Rutina;
use App\Models\SesionEntrenamientoCasa;
use App\Models\SolicitudSoporte;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ExperienciaClienteController extends Controller
{
    public function progreso(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);
        $inicioSemana = now()->startOfWeek(Carbon::MONDAY);
        $finSemana = now()->endOfWeek(Carbon::SUNDAY);

        $plan = PlanEntrenamientoCasa::where('id_cliente', $cliente->id_cliente)
            ->where('activo', true)
            ->first();

        $meta = MetaCliente::firstOrCreate(
            ['id_cliente' => $cliente->id_cliente],
            ['sesiones_semanales' => max(1, min(4, count($plan?->dias ?? ['Lunes', 'Miércoles', 'Viernes']))), 'recordatorios' => true]
        );

        $metaSemanal = max(1, min(4, (int) $meta->sesiones_semanales));

        $sesionesSemana = SesionEntrenamientoCasa::where('id_cliente', $cliente->id_cliente)
            ->whereBetween('fecha', [$inicioSemana, $finSemana])
            ->where('estado', 'Completada')
            ->orderBy('fecha')
            ->get();

        $asistenciasSemana = Asistencia::where('id_cliente', $cliente->id_cliente)
            ->whereBetween('fecha_hora_entrada', [$inicioSemana, $finSemana])
            ->orderBy('fecha_hora_entrada')
            ->get();

        $sesionesMes = SesionEntrenamientoCasa::where('id_cliente', $cliente->id_cliente)
            ->whereMonth('fecha', now()->month)
            ->whereYear('fecha', now()->year)
            ->where('estado', 'Completada')
            ->count();

        $segundosMes = (int) SesionEntrenamientoCasa::where('id_cliente', $cliente->id_cliente)
            ->whereMonth('fecha', now()->month)
            ->whereYear('fecha', now()->year)
            ->where('estado', 'Completada')
            ->sum('duracion_segundos');

        $asistenciasMes = Asistencia::where('id_cliente', $cliente->id_cliente)
            ->whereMonth('fecha_hora_entrada', now()->month)
            ->whereYear('fecha_hora_entrada', now()->year)
            ->count();

        $dias = collect(range(0, 6))->map(function ($i) use ($inicioSemana, $sesionesSemana, $asistenciasSemana) {
            $dia = $inicioSemana->copy()->addDays($i);
            $casa = $sesionesSemana->contains(fn ($s) => optional($s->fecha)->toDateString() === $dia->toDateString());
            $gym = $asistenciasSemana->contains(fn ($a) => optional($a->fecha_hora_entrada)->toDateString() === $dia->toDateString());

            return [
                'fecha' => $dia->toDateString(),
                'dia' => ucfirst($dia->locale('es')->translatedFormat('D')),
                'casa' => $casa,
                'gimnasio' => $gym,
                'activo' => $casa || $gym,
            ];
        })->values();

        $actividades = collect();

        foreach ($sesionesSemana as $sesion) {
            $actividades->push([
                'tipo' => 'Entrenamiento en casa',
                'titulo' => ucfirst((string) $sesion->zona),
                'fecha' => optional($sesion->fecha)->toDateTimeString(),
                'detalle' => round(((int) $sesion->duracion_segundos) / 60).' min · '.$sesion->ejercicios_completados.' ejercicios',
            ]);
        }

        foreach ($asistenciasSemana as $asistencia) {
            $actividades->push([
                'tipo' => 'Asistencia',
                'titulo' => 'Visita al gimnasio',
                'fecha' => optional($asistencia->fecha_hora_entrada)->toDateTimeString(),
                'detalle' => $asistencia->fecha_hora_salida ? 'Entrada y salida registradas' : 'Entrada registrada',
            ]);
        }

        $completadasSemana = $sesionesSemana->count();
        $cumplimiento = min(100, (int) round(($completadasSemana / $metaSemanal) * 100));

        return response()->json([
            'semana' => [
                'meta_sesiones' => $metaSemanal,
                'sesiones_casa' => $completadasSemana,
                'asistencias_gimnasio' => $asistenciasSemana->count(),
                'cumplimiento' => $cumplimiento,
                'dias' => $dias,
            ],
            'mes' => [
                'sesiones_casa' => $sesionesMes,
                'minutos_entrenados' => (int) round($segundosMes / 60),
                'asistencias_gimnasio' => $asistenciasMes,
            ],
            'ultimas_actividades' => $actividades
                ->sortByDesc('fecha')
                ->take(8)
                ->values(),
        ]);
    }

    public function meta(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);

        $meta = MetaCliente::firstOrCreate(
            ['id_cliente' => $cliente->id_cliente],
            ['sesiones_semanales' => 3, 'recordatorios' => true]
        );

        return response()->json($meta);
    }

    public function guardarMeta(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);

        $datos = $request->validate([
            'sesiones_semanales' => 'required|integer|min:1|max:4',
            'recordatorios' => 'required|boolean',
        ]);

        $meta = MetaCliente::updateOrCreate(
            ['id_cliente' => $cliente->id_cliente],
            $datos
        );

        return response()->json([
            'mensaje' => 'Meta semanal actualizada.',
            'meta' => $meta,
        ]);
    }

    public function calendario(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);
        $desde = today();
        $hasta = today()->copy()->addDays(30);

        $eventos = collect();

        $reservas = Reserva::with(['clase.entrenador'])
            ->where('id_cliente', $cliente->id_cliente)
            ->whereBetween('fecha_clase', [$desde, $hasta])
            ->whereIn('estado', ['Reservada', 'Asistio'])
            ->orderBy('fecha_clase')
            ->get();

        foreach ($reservas as $reserva) {
            $eventos->push([
                'tipo' => 'clase',
                'fecha' => optional($reserva->fecha_clase)->toDateString(),
                'titulo' => $reserva->clase?->nombre ?? 'Clase reservada',
                'detalle' => trim(($reserva->clase?->hora_inicio ?? '').' · '.($reserva->estado ?? 'Reservada'), ' ·'),
            ]);
        }

        $membresia = ClienteMembresia::with('membresia')
            ->where('id_cliente', $cliente->id_cliente)
            ->where('estado', 'Activo')
            ->whereDate('fecha_fin', '>=', today())
            ->orderByDesc('fecha_fin')
            ->first();

        if ($membresia && $membresia->fecha_fin <= $hasta) {
            $eventos->push([
                'tipo' => 'membresia',
                'fecha' => optional($membresia->fecha_fin)->toDateString(),
                'titulo' => 'Vencimiento de membresía',
                'detalle' => $membresia->membresia?->nombre ?? 'Plan activo',
            ]);
        }

        $plan = PlanEntrenamientoCasa::where('id_cliente', $cliente->id_cliente)
            ->where('activo', true)
            ->first();

        $diasPlan = $plan?->dias ?? [];
        $zonas = $plan?->zonas ?? [];
        $indiceZona = 0;

        $mapaDias = [
            1 => 'Lunes', 2 => 'Martes', 3 => 'Miércoles', 4 => 'Jueves',
            5 => 'Viernes', 6 => 'Sábado', 7 => 'Domingo',
        ];

        for ($i = 0; $i <= 13; $i++) {
            $fecha = today()->copy()->addDays($i);
            $nombreDia = $mapaDias[$fecha->isoWeekday()] ?? '';
            if (!in_array($nombreDia, $diasPlan, true)) {
                continue;
            }

            $zona = count($zonas) ? $zonas[$indiceZona % count($zonas)] : 'sesión guiada';
            $indiceZona++;

            $eventos->push([
                'tipo' => 'casa',
                'fecha' => $fecha->toDateString(),
                'titulo' => 'Entrenamiento en casa',
                'detalle' => ucfirst((string) $zona),
            ]);
        }

        return response()->json(
            $eventos->sortBy('fecha')->values()
        );
    }

    public function notificaciones(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);

        $persistentes = NotificacionCliente::where('id_cliente', $cliente->id_cliente)
            ->orderByDesc('fecha')
            ->limit(30)
            ->get()
            ->map(fn ($n) => [
                'id_notificacion' => $n->id_notificacion,
                'titulo' => $n->titulo,
                'mensaje' => $n->mensaje,
                'tipo' => $n->tipo,
                'leida' => (bool) $n->leida,
                'fecha' => optional($n->fecha)->toDateTimeString(),
                'origen' => 'admin',
            ]);

        $automaticas = collect();

        $membresia = ClienteMembresia::with('membresia')
            ->where('id_cliente', $cliente->id_cliente)
            ->where('estado', 'Activo')
            ->whereDate('fecha_fin', '>=', today())
            ->orderByDesc('fecha_fin')
            ->first();

        if ($membresia && $membresia->fecha_fin) {
            $dias = today()->diffInDays($membresia->fecha_fin, false);
            if ($dias >= 0 && $dias <= 7) {
                $automaticas->push([
                    'id_notificacion' => null,
                    'titulo' => 'Membresía próxima a vencer',
                    'mensaje' => $dias === 0
                        ? 'Tu membresía vence hoy.'
                        : 'Tu membresía vence en '.$dias.' día'.($dias === 1 ? '' : 's').'.',
                    'tipo' => 'Membresia',
                    'leida' => false,
                    'fecha' => now()->toDateTimeString(),
                    'origen' => 'sistema',
                ]);
            }
        }

        $reservaProxima = Reserva::with('clase')
            ->where('id_cliente', $cliente->id_cliente)
            ->where('estado', 'Reservada')
            ->whereBetween('fecha_clase', [today(), today()->copy()->addDays(2)])
            ->orderBy('fecha_clase')
            ->first();

        if ($reservaProxima) {
            $automaticas->push([
                'id_notificacion' => null,
                'titulo' => 'Tienes una clase próxima',
                'mensaje' => ($reservaProxima->clase?->nombre ?? 'Tu clase').' está programada para '.$reservaProxima->fecha_clase->format('d/m/Y').'.',
                'tipo' => 'Clase',
                'leida' => false,
                'fecha' => now()->toDateTimeString(),
                'origen' => 'sistema',
            ]);
        }

        $plan = PlanEntrenamientoCasa::where('id_cliente', $cliente->id_cliente)
            ->where('activo', true)
            ->first();

        $mapaDias = [1=>'Lunes',2=>'Martes',3=>'Miércoles',4=>'Jueves',5=>'Viernes',6=>'Sábado',7=>'Domingo'];
        $hoyNombre = $mapaDias[now()->isoWeekday()] ?? '';
        if ($plan && in_array($hoyNombre, $plan->dias ?? [], true)) {
            $automaticas->push([
                'id_notificacion' => null,
                'titulo' => 'Entrenamiento programado para hoy',
                'mensaje' => 'Tu plan semanal tiene una sesión en casa para hoy.',
                'tipo' => 'Entrenamiento',
                'leida' => false,
                'fecha' => now()->toDateTimeString(),
                'origen' => 'sistema',
            ]);
        }

        return response()->json([
            'no_leidas' => $persistentes->where('leida', false)->count() + $automaticas->count(),
            'items' => $automaticas->concat($persistentes)->values(),
        ]);
    }

    public function leerNotificacion(Request $request, string $id)
    {
        $cliente = $this->clienteDelUsuario($request);
        $notificacion = NotificacionCliente::where('id_cliente', $cliente->id_cliente)
            ->findOrFail($id);

        $notificacion->update(['leida' => true]);

        return response()->json([
            'mensaje' => 'Notificación marcada como leída.',
            'notificacion' => $notificacion->fresh(),
        ]);
    }

    public function leerTodas(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);
        NotificacionCliente::where('id_cliente', $cliente->id_cliente)
            ->where('leida', false)
            ->update(['leida' => true]);

        return response()->json(['mensaje' => 'Notificaciones actualizadas.']);
    }

    public function entrenador(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);

        $rutina = Rutina::with(['entrenador', 'detalles'])
            ->where('id_cliente', $cliente->id_cliente)
            ->where('estado', 'Activo')
            ->orderByDesc('fecha_inicio')
            ->first();

        return response()->json([
            'entrenador' => $rutina?->entrenador,
            'rutina' => $rutina,
        ]);
    }

    public function historial(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);

        $pagos = PagoMembresia::with('clienteMembresia.membresia')
            ->whereHas('clienteMembresia', fn ($q) => $q->where('id_cliente', $cliente->id_cliente))
            ->orderByDesc('fecha_pago')
            ->limit(20)
            ->get();

        return response()->json([
            'entrenamientos_casa' => SesionEntrenamientoCasa::where('id_cliente', $cliente->id_cliente)
                ->orderByDesc('fecha')->limit(20)->get(),
            'asistencias' => Asistencia::where('id_cliente', $cliente->id_cliente)
                ->orderByDesc('fecha_hora_entrada')->limit(20)->get(),
            'reservas' => Reserva::with('clase')->where('id_cliente', $cliente->id_cliente)
                ->orderByDesc('fecha_clase')->limit(20)->get(),
            'pagos' => $pagos,
        ]);
    }

    public function soporte(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);

        return response()->json(
            SolicitudSoporte::where('id_cliente', $cliente->id_cliente)
                ->orderByDesc('fecha')
                ->get()
        );
    }

    public function crearSoporte(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);

        $datos = $request->validate([
            'asunto' => 'required|string|max:150',
            'mensaje' => 'required|string|min:5|max:2000',
        ]);

        $solicitud = SolicitudSoporte::create([
            'id_cliente' => $cliente->id_cliente,
            'asunto' => $datos['asunto'],
            'mensaje' => $datos['mensaje'],
            'estado' => 'Pendiente',
            'fecha' => now(),
        ]);

        return response()->json([
            'mensaje' => 'Tu consulta fue enviada al gimnasio.',
            'solicitud' => $solicitud,
        ], 201);
    }

    private function clienteDelUsuario(Request $request): Cliente
    {
        $usuario = $request->user();

        $cliente = $usuario?->id_cliente
            ? Cliente::find($usuario->id_cliente)
            : null;

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
}
