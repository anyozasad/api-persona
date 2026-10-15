<?php

namespace App\Http\Controllers;

use App\Models\Asistencia;
use App\Models\Cliente;
use App\Models\ClienteMembresia;
use App\Models\DetalleSesionEntrenamiento;
use App\Models\PagoMembresia;
use App\Models\PlanEntrenamientoCasa;
use App\Models\Producto;
use App\Models\Rutina;
use App\Models\SesionEntrenamientoCasa;
use App\Models\Venta;
use App\Services\ComprobanteMembresiaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
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
                ->whereDate('fecha_inicio', '<=', today())
                ->where(function ($q) {
                    $q->whereNull('fecha_fin')->orWhereDate('fecha_fin', '>=', today());
                })
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

    public function fotoPerfil(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);
        $directorio = storage_path('app/profile-photos');

        if ($cliente->foto_perfil) {
            $rutaGuardada = storage_path('app/'.ltrim((string) $cliente->foto_perfil, '/\\'));
            if (File::exists($rutaGuardada)) {
                return response()->file($rutaGuardada, [
                    'Content-Type' => File::mimeType($rutaGuardada) ?: 'image/jpeg',
                    'Cache-Control' => 'private, no-store, max-age=0',
                ]);
            }
        }

        foreach (['jpg', 'jpeg', 'png', 'webp'] as $extension) {
            $ruta = $directorio.DIRECTORY_SEPARATOR.'cliente_'.$cliente->id_cliente.'.'.$extension;
            if (File::exists($ruta)) {
                $cliente->update(['foto_perfil' => 'profile-photos/'.basename($ruta)]);
                return response()->file($ruta, [
                    'Content-Type' => File::mimeType($ruta) ?: 'image/jpeg',
                    'Cache-Control' => 'private, no-store, max-age=0',
                ]);
            }
        }

        return response()->json(['mensaje' => 'Aún no tienes foto de perfil.'], 404);
    }

    public function actualizarFotoPerfil(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);

        $request->validate([
            'foto' => 'required|image|mimes:jpg,jpeg,png,webp|max:3072',
        ]);

        $archivo = $request->file('foto');
        $extension = strtolower($archivo->extension() ?: 'jpg');
        $directorio = storage_path('app/profile-photos');

        if (!File::isDirectory($directorio)) {
            File::makeDirectory($directorio, 0755, true);
        }

        foreach (['jpg', 'jpeg', 'png', 'webp'] as $ext) {
            $anterior = $directorio.DIRECTORY_SEPARATOR.'cliente_'.$cliente->id_cliente.'.'.$ext;
            if (File::exists($anterior)) {
                File::delete($anterior);
            }
        }

        $nombre = 'cliente_'.$cliente->id_cliente.'.'.$extension;
        $archivo->move($directorio, $nombre);
        $cliente->update(['foto_perfil' => 'profile-photos/'.$nombre]);

        return response()->json([
            'mensaje' => 'Foto de perfil actualizada correctamente.',
            'actualizada' => true,
        ]);
    }

    public function eliminarFotoPerfil(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);
        $directorio = storage_path('app/profile-photos');
        $eliminada = false;

        foreach (['jpg', 'jpeg', 'png', 'webp'] as $extension) {
            $ruta = $directorio.DIRECTORY_SEPARATOR.'cliente_'.$cliente->id_cliente.'.'.$extension;
            if (File::exists($ruta)) {
                File::delete($ruta);
                $eliminada = true;
            }
        }

        $cliente->update(['foto_perfil' => null]);

        return response()->json([
            'mensaje' => $eliminada
                ? 'Foto de perfil eliminada.'
                : 'No había una foto de perfil guardada.',
        ]);
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
            'enfoque_entrenamiento' => ['sometimes', 'nullable', Rule::in([
                'Cardiovascular', 'Masa muscular', 'Tonificación', 'CrossFit', 'Pérdida de peso',
            ])],
            'nivel_entrenamiento' => ['sometimes', 'nullable', Rule::in([
                'Principiante', 'Intermedio', 'Avanzado',
            ])],
        ]);

        foreach (['nombres', 'apellidos', 'telefono', 'direccion', 'sexo', 'enfoque_entrenamiento', 'nivel_entrenamiento'] as $campo) {
            if (array_key_exists($campo, $datos) && is_string($datos[$campo])) {
                $datos[$campo] = preg_replace('/\s+/u', ' ', trim($datos[$campo]));
            }
        }
        if (array_key_exists('correo', $datos)) {
            $datos['correo'] = mb_strtolower(trim((string) $datos['correo']));
        }

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

    public function productos(Request $request)
    {
        $this->clienteDelUsuario($request);

        // Única fuente de productos: la base principal DB_DATABASE.
        // Inventario del administrador y portal del cliente comparten exactamente
        // la misma tabla productos y la misma tabla categorias.
        return response()->json(
            Producto::with('categoria')
                ->where('estado', 'Activo')
                ->where('stock', '>', 0)
                ->orderBy('nombre_producto')
                ->get()
                ->map(fn ($producto) => [
                    'id_producto' => $producto->id_producto,
                    'codigo_producto' => $producto->codigo_producto,
                    'nombre_producto' => $producto->nombre_producto,
                    'descripcion' => $producto->descripcion,
                    'foto' => $producto->foto ?? null,
                    'precio_venta' => (float) $producto->precio_venta,
                    'stock' => (int) $producto->stock,
                    'unidad_medida' => $producto->unidad_medida,
                    'categoria' => $producto->categoria ? [
                        'id_categoria' => $producto->categoria->id_categoria,
                        'nombre_categoria' => $producto->categoria->nombre_categoria,
                    ] : null,
                ])
                ->values()
        );
    }

    public function entrenamientoCasa(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);

        $plan = PlanEntrenamientoCasa::query()
            ->where('id_cliente', $cliente->id_cliente)
            ->where('activo', true)
            ->first();

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
            'plan' => $plan,
            'sesion_activa' => SesionEntrenamientoCasa::with(['rutina', 'detalles.detalleRutina'])
                ->where('id_cliente', $cliente->id_cliente)
                ->whereIn('estado', ['EnCurso', 'Pausada'])
                ->orderByDesc('fecha')
                ->first(),
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

    public function guardarPlanEntrenamiento(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);

        $datos = $request->validate([
            'dias' => 'required|array|min:1|max:4',
            'dias.*' => ['required', 'string', Rule::in([
                'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo',
            ])],
            'zonas' => 'required|array|min:1|max:7',
            'zonas.*' => ['required', 'string', Rule::in([
                'piernas', 'gluteos', 'brazos', 'pecho', 'espalda', 'hombros', 'core',
            ])],
            'objetivo' => ['required', 'string', Rule::in(['fuerza', 'resistencia', 'movilidad'])],
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

    public function iniciarSesionEntrenamientoCasa(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);
        $datos = $request->validate([
            'id_rutina' => 'required|integer|exists:rutinas,id_rutina',
        ]);

        $membresia = ClienteMembresia::query()
            ->where('id_cliente', $cliente->id_cliente)
            ->where('estado', 'Activo')
            ->whereDate('fecha_inicio', '<=', today())
            ->whereDate('fecha_fin', '>=', today())
            ->first();

        if (!$membresia) {
            return response()->json(['mensaje' => 'Necesitas una membresía vigente para iniciar un entrenamiento.'], 422);
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

        if (!$rutina || $rutina->detalles->isEmpty()) {
            return response()->json(['mensaje' => 'La rutina no está disponible o no tiene ejercicios.'], 422);
        }

        $sesion = SesionEntrenamientoCasa::with(['rutina', 'detalles.detalleRutina'])
            ->where('id_cliente', $cliente->id_cliente)
            ->where('id_rutina', $rutina->id_rutina)
            ->whereIn('estado', ['EnCurso', 'Pausada'])
            ->orderByDesc('fecha')
            ->first();

        if ($sesion) {
            return response()->json([
                'mensaje' => 'Se recuperó tu entrenamiento en curso.',
                'sesion' => $sesion,
            ]);
        }

        $sesion = DB::transaction(function () use ($cliente, $rutina) {
            $sesion = SesionEntrenamientoCasa::create([
                'id_cliente' => $cliente->id_cliente,
                'id_rutina' => $rutina->id_rutina,
                'zona' => 'rutina',
                'fecha' => now(),
                'duracion_segundos' => 0,
                'ejercicios_total' => $rutina->detalles->count(),
                'ejercicios_completados' => 0,
                'estado' => 'EnCurso',
            ]);

            foreach ($rutina->detalles as $detalle) {
                DetalleSesionEntrenamiento::create([
                    'id_sesion_casa' => $sesion->id_sesion_casa,
                    'id_detalle_rutina' => $detalle->id_detalle_rutina,
                    'series_realizadas' => 0,
                    'repeticiones_realizadas' => 0,
                    'peso_utilizado' => null,
                    'completado' => false,
                ]);
            }

            return $sesion;
        });

        return response()->json([
            'mensaje' => 'Entrenamiento iniciado y guardado.',
            'sesion' => $sesion->load(['rutina', 'detalles.detalleRutina']),
        ], 201);
    }

    public function actualizarSesionEntrenamientoCasa(Request $request, string $idSesion)
    {
        $cliente = $this->clienteDelUsuario($request);
        $datos = $request->validate([
            'duracion_segundos' => 'sometimes|integer|min:0|max:14400',
            'estado' => ['sometimes', Rule::in(['EnCurso', 'Pausada'])],
            'id_detalle_rutina' => 'sometimes|integer|exists:detalle_rutina,id_detalle_rutina',
            'series_realizadas' => 'sometimes|integer|min:0|max:30',
            'repeticiones_realizadas' => 'sometimes|integer|min:0|max:500',
            'peso_utilizado' => 'sometimes|nullable|numeric|min:0|max:1000',
            'completado' => 'sometimes|boolean',
        ]);

        $sesion = SesionEntrenamientoCasa::with('detalles')
            ->where('id_sesion_casa', $idSesion)
            ->where('id_cliente', $cliente->id_cliente)
            ->whereIn('estado', ['EnCurso', 'Pausada'])
            ->firstOrFail();

        DB::transaction(function () use ($sesion, $datos) {
            $sesionDatos = array_intersect_key($datos, array_flip(['duracion_segundos', 'estado']));
            if ($sesionDatos) $sesion->update($sesionDatos);

            if (!empty($datos['id_detalle_rutina'])) {
                $permitido = $sesion->rutina?->detalles()
                    ->where('id_detalle_rutina', $datos['id_detalle_rutina'])
                    ->exists();

                abort_unless($permitido, 422, 'El ejercicio no pertenece a la rutina de esta sesión.');

                $detalle = DetalleSesionEntrenamiento::firstOrNew([
                    'id_sesion_casa' => $sesion->id_sesion_casa,
                    'id_detalle_rutina' => $datos['id_detalle_rutina'],
                ]);

                foreach (['series_realizadas', 'repeticiones_realizadas', 'peso_utilizado', 'completado'] as $campo) {
                    if (array_key_exists($campo, $datos)) $detalle->{$campo} = $datos[$campo];
                }
                $detalle->save();

                $sesion->update([
                    'ejercicios_completados' => DetalleSesionEntrenamiento::where('id_sesion_casa', $sesion->id_sesion_casa)
                        ->where('completado', true)
                        ->count(),
                ]);
            }
        });

        return response()->json([
            'mensaje' => 'Progreso del entrenamiento guardado.',
            'sesion' => $sesion->fresh(['rutina', 'detalles.detalleRutina']),
        ]);
    }

    public function cancelarSesionEntrenamientoCasa(Request $request, string $idSesion)
    {
        $cliente = $this->clienteDelUsuario($request);
        $datos = $request->validate([
            'duracion_segundos' => 'nullable|integer|min:0|max:14400',
        ]);

        $sesion = SesionEntrenamientoCasa::query()
            ->where('id_sesion_casa', $idSesion)
            ->where('id_cliente', $cliente->id_cliente)
            ->whereIn('estado', ['EnCurso', 'Pausada'])
            ->firstOrFail();

        $sesion->update([
            'duracion_segundos' => $datos['duracion_segundos'] ?? $sesion->duracion_segundos,
            'estado' => 'Cancelada',
        ]);

        return response()->json([
            'mensaje' => 'Sesión cancelada y conservada en el historial.',
            'sesion' => $sesion->fresh(['rutina', 'detalles.detalleRutina']),
        ]);
    }

    public function registrarSesionEntrenamientoCasa(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);

        $datos = $request->validate([
            'id_sesion_casa' => 'nullable|integer|exists:sesiones_entrenamiento_casa,id_sesion_casa',
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
            $sesion = !empty($datos['id_sesion_casa'])
                ? SesionEntrenamientoCasa::where('id_sesion_casa', $datos['id_sesion_casa'])
                    ->where('id_cliente', $cliente->id_cliente)
                    ->where('id_rutina', $rutina->id_rutina)
                    ->firstOrFail()
                : new SesionEntrenamientoCasa([
                    'id_cliente' => $cliente->id_cliente,
                    'id_rutina' => $rutina->id_rutina,
                    'zona' => 'rutina',
                    'fecha' => now(),
                ]);

            if ($sesion->estado === 'Cancelada') {
                abort(422, 'Una sesión cancelada no puede finalizarse.');
            }

            $sesion->fill([
                'duracion_segundos' => $datos['duracion_segundos'],
                'ejercicios_total' => count($datos['ejercicios']),
                'ejercicios_completados' => $completados,
                'estado' => $completados === count($datos['ejercicios']) ? 'Completada' : 'Parcial',
            ]);
            $sesion->save();

            foreach ($datos['ejercicios'] as $ejercicio) {
                DetalleSesionEntrenamiento::updateOrCreate(
                    [
                        'id_sesion_casa' => $sesion->id_sesion_casa,
                        'id_detalle_rutina' => $ejercicio['id_detalle_rutina'],
                    ],
                    [
                        'series_realizadas' => $ejercicio['series_realizadas'],
                        'repeticiones_realizadas' => $ejercicio['repeticiones_realizadas'],
                        'peso_utilizado' => $ejercicio['peso_utilizado'] ?? null,
                        'completado' => (bool) $ejercicio['completado'],
                    ]
                );
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
