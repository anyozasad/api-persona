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

        // En pruebas ambas variables apuntan a la misma base. No se duplica nada.
        if ($baseOrigen === $baseDestino) {
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
