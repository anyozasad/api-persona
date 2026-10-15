<?php

namespace App\Services;

use Illuminate\Database\ConnectionInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class GymSystemDataMirror
{
    /**
     * Tablas de negocio que representan los datos visibles del sistema.
     * En gym_system se guardan también como app_<tabla> para conservar
     * exactamente su estructura y todos sus campos sin modificar tablas antiguas.
     */
    private array $tablas = [
        'clientes',
        'membresias',
        'cliente_membresia',
        'pagos_membresia',
        'entrenadores',
        'clases',
        'reservas',
        'asistencias',
        'categorias',
        'productos',
        'proveedores',
        'compras',
        'detalle_compra',
        'ventas',
        'detalle_venta',
        'movimientos_inventario',
        'cajas',
        'movimientos_caja',
        'rutinas',
        'detalle_rutina',
        'usuarios',
        'auditorias',
        'configuracion_sistema',
        'notificaciones_cliente',
        'solicitudes_soporte',
        'opiniones_cliente',
        'metas_cliente',
        'clases_favoritas',
        'planes_entrenamiento_casa',
        'sesiones_entrenamiento_casa',
        'detalle_sesion_entrenamiento',
        'personal_access_tokens',
        'migrations',
        'cache',
        'cache_locks',
        'jobs',
        'job_batches',
        'failed_jobs',
        'password_reset_tokens',
        'sessions',
        'personas',
        'cursos',
        'users',
    ];

    public function __construct(private GymSystemClienteMirror $clientesMirror)
    {
    }

    private function origen(): ConnectionInterface
    {
        return DB::connection();
    }

    private function destino(): ConnectionInterface
    {
        $mysql = (array) config('database.connections.mysql', []);
        config([
            'database.connections.gym_system_mirror_all' => array_merge($mysql, [
                'database' => env('GYM_DB_DATABASE', 'gym_system'),
                'prefix' => '',
            ]),
        ]);

        return DB::connection('gym_system_mirror_all');
    }

    public function sincronizarTodo(): array
    {
        $origen = $this->origen();
        $destino = $this->destino();

        if ($origen->getDriverName() !== 'mysql' || $destino->getDriverName() !== 'mysql') {
            return ['omitido' => true, 'motivo' => 'La sincronización completa requiere MySQL/MariaDB.'];
        }

        $baseOrigen = (string) $origen->getDatabaseName();
        $baseDestino = (string) $destino->getDatabaseName();

        $prefijoOrigen = (string) config('database.connections.'.config('database.default').'.prefix', '');

        // Si la aplicación ya usa gym_system con prefijo app_, no se vuelven a
        // copiar las tablas modernas. Solo se mantienen actualizadas las tablas
        // legacy visibles (socios, planes, productos, etc.).
        if ($baseOrigen === $baseDestino) {
            if ($prefijoOrigen === 'app_') {
                $resultado = [
                    'origen' => $baseOrigen,
                    'destino' => $baseDestino,
                    'tablas' => [],
                    'socios' => null,
                    'modo' => 'gym_system_principal',
                ];

                try {
                    $resultado['socios'] = $this->clientesMirror->sincronizarTodos();
                } catch (Throwable $e) {
                    $resultado['socios'] = ['error' => $e->getMessage()];
                }

                $resultado['compatibilidad'] = $this->sincronizarCompatibilidad($origen, $destino);
                return $resultado;
            }

            return ['omitido' => true, 'motivo' => 'Origen y destino son la misma base.', 'base' => $baseOrigen];
        }

        $resultado = [
            'origen' => $baseOrigen,
            'destino' => $baseDestino,
            'tablas' => [],
            'socios' => null,
        ];

        $destino->statement('SET FOREIGN_KEY_CHECKS=0');

        try {
            foreach ($this->tablas as $tabla) {
                if (!$origen->getSchemaBuilder()->hasTable($tabla)) {
                    continue;
                }

                $resultado['tablas'][$tabla] = $this->copiarTablaCompleta(
                    $origen,
                    $destino,
                    $baseOrigen,
                    $baseDestino,
                    $tabla,
                    'app_'.$tabla
                );
            }
        } finally {
            $destino->statement('SET FOREIGN_KEY_CHECKS=1');
        }

        // La tabla socios es la vista sencilla que ya revisa el usuario en phpMyAdmin.
        try {
            $resultado['socios'] = $this->clientesMirror->sincronizarTodos();
        } catch (Throwable $e) {
            $resultado['socios'] = ['error' => $e->getMessage()];
        }

        // Mantiene también algunas tablas antiguas de gym_system actualizadas
        // sin borrar registros manuales existentes.
        $resultado['compatibilidad'] = $this->sincronizarCompatibilidad($origen, $destino);

        return $resultado;
    }

    private function copiarTablaCompleta(
        ConnectionInterface $origen,
        ConnectionInterface $destino,
        string $baseOrigen,
        string $baseDestino,
        string $tablaOrigen,
        string $tablaDestino
    ): array {
        $qOrigen = $this->identificador($baseOrigen).'.'.$this->identificador($tablaOrigen);
        $qDestino = $this->identificador($baseDestino).'.'.$this->identificador($tablaDestino);

        if (!$destino->getSchemaBuilder()->hasTable($tablaDestino)) {
            $destino->statement("CREATE TABLE {$qDestino} LIKE {$qOrigen}");
        } else {
            $columnasOrigen = $this->columnas($origen, $tablaOrigen);
            $columnasDestino = $this->columnas($destino, $tablaDestino);

            if ($columnasOrigen !== $columnasDestino) {
                // app_* son tablas espejo administradas por el sistema, por lo que
                // es seguro regenerarlas cuando cambia la estructura del proyecto.
                $destino->statement("DROP TABLE {$qDestino}");
                $destino->statement("CREATE TABLE {$qDestino} LIKE {$qOrigen}");
            }
        }

        $destino->statement("TRUNCATE TABLE {$qDestino}");
        $destino->statement("INSERT INTO {$qDestino} SELECT * FROM {$qOrigen}");

        return [
            'tabla' => $tablaDestino,
            'registros' => (int) $destino->table($tablaDestino)->count(),
        ];
    }

    private function columnas(ConnectionInterface $db, string $tabla): array
    {
        return collect($db->select('SHOW COLUMNS FROM '.$this->identificador($tabla)))
            ->pluck('Field')
            ->map(fn ($x) => (string) $x)
            ->values()
            ->all();
    }

    private function identificador(string $valor): string
    {
        return '`'.str_replace('`', '``', $valor).'`';
    }

    private function sincronizarCompatibilidad(ConnectionInterface $origen, ConnectionInterface $destino): array
    {
        $r = [];

        try {
            $r['planes'] = $this->sincronizarPlanes($origen, $destino);
        } catch (Throwable $e) {
            $r['planes'] = ['error' => $e->getMessage()];
        }

        try {
            $r['categorias'] = $this->sincronizarCategorias($origen, $destino);
        } catch (Throwable $e) {
            $r['categorias'] = ['error' => $e->getMessage()];
        }

        try {
            $r['productos'] = $this->sincronizarProductos($origen, $destino);
        } catch (Throwable $e) {
            $r['productos'] = ['error' => $e->getMessage()];
        }

        try {
            $r['suscripciones'] = $this->sincronizarSuscripciones($origen, $destino);
        } catch (Throwable $e) {
            $r['suscripciones'] = ['error' => $e->getMessage()];
        }

        try {
            $r['asistencias'] = $this->sincronizarAsistencias($origen, $destino);
        } catch (Throwable $e) {
            $r['asistencias'] = ['error' => $e->getMessage()];
        }

        try {
            $r['usuarios'] = $this->sincronizarUsuarios($origen, $destino);
        } catch (Throwable $e) {
            $r['usuarios'] = ['error' => $e->getMessage()];
        }

        try {
            $r['ventas'] = $this->sincronizarVentas($origen, $destino);
        } catch (Throwable $e) {
            $r['ventas'] = ['error' => $e->getMessage()];
        }

        return $r;
    }

    private function sincronizarPlanes(ConnectionInterface $origen, ConnectionInterface $destino): array
    {
        if (!$origen->getSchemaBuilder()->hasTable('membresias') || !$destino->getSchemaBuilder()->hasTable('planes')) {
            return ['omitido' => true];
        }

        $total = 0;
        foreach ($origen->table('membresias')->get() as $m) {
            $datos = [
                'precio' => $m->precio,
                'duracion_dias' => max(1, ((int) $m->duracion_meses) * 30),
                'descripcion' => $m->descripcion,
                'estado' => strtolower((string) $m->estado) === 'activo' ? 'activo' : 'inactivo',
            ];

            $existe = $destino->table('planes')->where('nombre', $m->nombre)->first();
            if ($existe) {
                $destino->table('planes')->where('id', $existe->id)->update($datos);
            } else {
                $destino->table('planes')->insert(array_merge(['nombre' => $m->nombre], $datos));
            }
            $total++;
        }

        return ['registros' => $total];
    }

    private function sincronizarCategorias(ConnectionInterface $origen, ConnectionInterface $destino): array
    {
        if (!$origen->getSchemaBuilder()->hasTable('categorias') || !$destino->getSchemaBuilder()->hasTable('categorias')) {
            return ['omitido' => true];
        }

        $total = 0;
        foreach ($origen->table('categorias')->get() as $c) {
            $datos = [
                'estado' => strtolower((string) $c->estado) === 'activo' ? 'activo' : 'inactivo',
            ];

            $existe = $destino->table('categorias')->where('nombre', $c->nombre_categoria)->first();
            if ($existe) {
                $destino->table('categorias')->where('id', $existe->id)->update($datos);
            } else {
                $destino->table('categorias')->insert(array_merge(['nombre' => $c->nombre_categoria], $datos));
            }
            $total++;
        }

        return ['registros' => $total];
    }

    private function sincronizarProductos(ConnectionInterface $origen, ConnectionInterface $destino): array
    {
        if (!$origen->getSchemaBuilder()->hasTable('productos') || !$destino->getSchemaBuilder()->hasTable('productos')) {
            return ['omitido' => true];
        }

        $total = 0;
        foreach ($origen->table('productos as p')
            ->leftJoin('categorias as c', 'c.id_categoria', '=', 'p.id_categoria')
            ->select('p.*', 'c.nombre_categoria')
            ->get() as $p) {
            $categoria = $destino->table('categorias')->where('nombre', $p->nombre_categoria)->first();
            if (!$categoria) {
                continue;
            }

            $datos = [
                'categoria_id' => $categoria->id,
                'nombre' => $p->nombre_producto,
                'descripcion' => $p->descripcion,
                'precio_compra' => $p->precio_compra,
                'precio_venta' => $p->precio_venta,
                'stock' => $p->stock,
                'stock_minimo' => $p->stock_minimo,
                'unidad_medida' => $p->unidad_medida,
                'estado' => strtolower((string) $p->estado) === 'activo' ? 'activo' : 'inactivo',
            ];

            if ($destino->getSchemaBuilder()->hasColumn('productos', 'foto')) {
                $datos['foto'] = $p->foto ?? null;
            }

            $existe = $destino->table('productos')->where('codigo', $p->codigo_producto)->first();
            if ($existe) {
                $destino->table('productos')->where('id', $existe->id)->update($datos);
            } else {
                $destino->table('productos')->insert(array_merge(['codigo' => $p->codigo_producto], $datos));
            }
            $total++;
        }

        return ['registros' => $total];
    }

    private function sincronizarSuscripciones(ConnectionInterface $origen, ConnectionInterface $destino): array
    {
        if (
            !$origen->getSchemaBuilder()->hasTable('cliente_membresia') ||
            !$origen->getSchemaBuilder()->hasTable('clientes') ||
            !$origen->getSchemaBuilder()->hasTable('membresias') ||
            !$destino->getSchemaBuilder()->hasTable('suscripciones')
        ) {
            return ['omitido' => true];
        }

        $total = 0;
        $rows = $origen->table('cliente_membresia as cm')
            ->join('clientes as c', 'c.id_cliente', '=', 'cm.id_cliente')
            ->join('membresias as m', 'm.id_membresia', '=', 'cm.id_membresia')
            ->select('cm.*', 'c.dni', 'm.nombre as membresia_nombre')
            ->get();

        foreach ($rows as $row) {
            $socio = $destino->table('socios')->where('dni', $row->dni)->first();
            $plan = $destino->table('planes')->where('nombre', $row->membresia_nombre)->first();
            if (!$socio || !$plan) {
                continue;
            }

            $estado = strtolower((string) $row->estado);
            $estado = in_array($estado, ['activo', 'activa'], true) ? 'activa' : 'vencida';

            $query = $destino->table('suscripciones')
                ->where('socio_id', $socio->id)
                ->where('plan_id', $plan->id)
                ->whereDate('fecha_inicio', $row->fecha_inicio);

            $datos = [
                'fecha_fin' => $row->fecha_fin,
                'estado' => $estado,
            ];

            if ($query->exists()) {
                $query->update($datos);
            } else {
                $destino->table('suscripciones')->insert(array_merge([
                    'socio_id' => $socio->id,
                    'plan_id' => $plan->id,
                    'fecha_inicio' => $row->fecha_inicio,
                ], $datos));
            }
            $total++;
        }

        return ['registros' => $total];
    }

    private function sincronizarAsistencias(ConnectionInterface $origen, ConnectionInterface $destino): array
    {
        if (
            !$origen->getSchemaBuilder()->hasTable('asistencias') ||
            !$origen->getSchemaBuilder()->hasTable('clientes') ||
            !$destino->getSchemaBuilder()->hasTable('asistencias')
        ) {
            return ['omitido' => true];
        }

        $total = 0;
        $rows = $origen->table('asistencias as a')
            ->join('clientes as c', 'c.id_cliente', '=', 'a.id_cliente')
            ->select('a.*', 'c.dni')
            ->get();

        foreach ($rows as $row) {
            $socio = $destino->table('socios')->where('dni', $row->dni)->first();
            if (!$socio) {
                continue;
            }

            $datos = ['socio_id' => $socio->id];

            if ($destino->getSchemaBuilder()->hasColumn('asistencias', 'fecha_hora')) {
                $datos['fecha_hora'] = $row->fecha_hora_entrada;
            }
            if ($destino->getSchemaBuilder()->hasColumn('asistencias', 'fecha_hora_salida')) {
                $datos['fecha_hora_salida'] = $row->fecha_hora_salida;
            }
            if ($destino->getSchemaBuilder()->hasColumn('asistencias', 'estado')) {
                $datos['estado'] = $row->estado ?: ($row->fecha_hora_salida ? 'Salió' : 'Dentro');
            }

            $q = $destino->table('asistencias')
                ->where('socio_id', $socio->id);

            if ($destino->getSchemaBuilder()->hasColumn('asistencias', 'fecha_hora')) {
                $q->where('fecha_hora', $row->fecha_hora_entrada);
            }

            if ($q->exists()) {
                $q->update($datos);
            } else {
                $destino->table('asistencias')->insert($datos);
            }
            $total++;
        }

        return ['registros' => $total];
    }

    private function sincronizarUsuarios(ConnectionInterface $origen, ConnectionInterface $destino): array
    {
        if (!$origen->getSchemaBuilder()->hasTable('usuarios') || !$destino->getSchemaBuilder()->hasTable('usuarios')) {
            return ['omitido' => true];
        }

        $total = 0;
        foreach ($origen->table('usuarios')->get() as $u) {
            $correo = $u->correo ?: ($u->nombre_usuario.'@mallqui.local');
            $rol = strtolower((string) $u->rol);
            $rolLegacy = str_contains($rol, 'admin') ? 'admin' : (str_contains($rol, 'entren') ? 'entrenador' : 'recepcionista');

            $datos = [
                'nombre' => trim((string) $u->nombres.' '.(string) $u->apellidos),
                'nombre_usuario' => $u->nombre_usuario,
                'dni' => $u->dni,
                'telefono' => $u->telefono,
                'email' => $correo,
                'password' => $u->contrasena,
                'rol' => $rolLegacy,
                'estado' => strtolower((string) $u->estado) === 'activo' ? 'activo' : 'inactivo',
            ];

            $existe = $destino->table('usuarios')->where('email', $correo)->first();
            if ($existe) {
                $destino->table('usuarios')->where('id', $existe->id)->update($datos);
            } else {
                $destino->table('usuarios')->insert($datos);
            }
            $total++;
        }

        return ['registros' => $total];
    }

    private function sincronizarVentas(ConnectionInterface $origen, ConnectionInterface $destino): array
    {
        if (
            !$origen->getSchemaBuilder()->hasTable('ventas') ||
            !$destino->getSchemaBuilder()->hasTable('ventas')
        ) {
            return ['omitido' => true];
        }

        $total = 0;
        foreach ($origen->table('ventas as v')
            ->leftJoin('clientes as c', 'c.id_cliente', '=', 'v.id_cliente')
            ->select('v.*', 'c.dni as cliente_dni')
            ->get() as $v) {
            $socioId = null;
            if ($v->cliente_dni) {
                $socioId = $destino->table('socios')->where('dni', $v->cliente_dni)->value('id');
            }

            $datos = [
                'socio_id' => $socioId,
                'subtotal' => $v->subtotal,
                'igv' => $v->igv,
                'total' => $v->total,
                'metodo_pago' => $v->metodo_pago,
                'fecha' => $v->fecha_venta,
                'tipo_comprobante' => $v->tipo_comprobante,
                'numero_comprobante' => $v->numero_comprobante,
                'numero_operacion' => $v->numero_operacion,
                'estado' => $v->estado,
                'motivo_anulacion' => $v->motivo_anulacion,
            ];

            if ($destino->getSchemaBuilder()->hasColumn('ventas', 'igv_porcentaje')) {
                $datos['igv_porcentaje'] = $v->total > 0 ? 18 : 0;
            }
            if ($destino->getSchemaBuilder()->hasColumn('ventas', 'descuento')) {
                $datos['descuento'] = 0;
            }

            $q = $destino->table('ventas')->where('numero_comprobante', $v->numero_comprobante);
            if ($q->exists()) {
                $q->update($datos);
                $ventaId = (int) $q->value('id');
            } else {
                $ventaId = (int) $destino->table('ventas')->insertGetId($datos);
            }

            if (
                $origen->getSchemaBuilder()->hasTable('detalle_venta') &&
                $destino->getSchemaBuilder()->hasTable('detalle_ventas') &&
                $origen->getSchemaBuilder()->hasTable('productos')
            ) {
                foreach ($origen->table('detalle_venta as d')
                    ->join('productos as p', 'p.id_producto', '=', 'd.id_producto')
                    ->where('d.id_venta', $v->id_venta)
                    ->select('d.*', 'p.codigo_producto')
                    ->get() as $d) {
                    $productoId = $destino->table('productos')->where('codigo', $d->codigo_producto)->value('id');
                    if (!$productoId) {
                        continue;
                    }

                    $dq = $destino->table('detalle_ventas')
                        ->where('venta_id', $ventaId)
                        ->where('producto_id', $productoId);

                    $detalle = [
                        'cantidad' => $d->cantidad,
                        'precio_unitario' => $d->precio_unitario,
                        'subtotal' => $d->subtotal,
                    ];

                    if ($dq->exists()) {
                        $dq->update($detalle);
                    } else {
                        $destino->table('detalle_ventas')->insert(array_merge([
                            'venta_id' => $ventaId,
                            'producto_id' => $productoId,
                        ], $detalle));
                    }
                }
            }

            $total++;
        }

        return ['registros' => $total];
    }

    public function sincronizarSilencioso(): void
    {
        try {
            $this->sincronizarTodo();
        } catch (Throwable $e) {
            Log::warning('No se pudo sincronizar todos los datos con gym_system.', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
