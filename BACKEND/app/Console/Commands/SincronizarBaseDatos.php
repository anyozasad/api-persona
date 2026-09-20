<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

class SincronizarBaseDatos extends Command
{
    protected $signature = 'db:sincronizar';

    protected $description = 'Genera lo pendiente, sincroniza migraciones con tablas existentes y ejecuta solo lo que falta';

    public function handle(): int
    {
        $this->info('Preparando migraciones pendientes del proyecto...');

        foreach (['db:generar-interno', 'db:operacion-interno', 'db:produccion-interno'] as $comando) {
            $codigoGenerar = Artisan::call($comando);
            $salidaGenerar = trim(Artisan::output());

            if ($salidaGenerar !== '') {
                $this->line($salidaGenerar);
            }

            if ($codigoGenerar !== 0) {
                $this->error("No se pudo ejecutar {$comando}.");
                return self::FAILURE;
            }
        }

        if (!Schema::hasTable('migrations')) {
            Artisan::call('migrate:install');
        }

        // Repara primero instalaciones antiguas para que las migraciones posteriores no fallen.
        if (Schema::hasTable('ventas') && Schema::hasTable('detalle_venta')) {
            $codigoReparacion = Artisan::call('db:reparar-ventas');
            $salidaReparacion = trim(Artisan::output());

            if ($salidaReparacion !== '') {
                $this->line($salidaReparacion);
            }

            if ($codigoReparacion !== 0) {
                $this->error('No se pudo preparar la tabla ventas antes de migrar.');
                return self::FAILURE;
            }
        }

        // Completa solo índices faltantes y evita errores por nombres duplicados.
        if (!$this->asegurarIndicesIntegridad()) {
            return self::FAILURE;
        }

        $batch = ((int) DB::table('migrations')->max('batch')) + 1;
        $marcadas = 0;

        foreach (glob(database_path('migrations/*.php')) ?: [] as $archivo) {
            $migracion = pathinfo($archivo, PATHINFO_FILENAME);

            if (DB::table('migrations')->where('migration', $migracion)->exists()) {
                continue;
            }

            $objeto = $this->objetoExistentePara($migracion);

            if ($objeto === true) {
                DB::table('migrations')->insert([
                    'migration' => $migracion,
                    'batch' => $batch,
                ]);
                $this->info("Sincronizada: {$migracion}");
                $marcadas++;
            }
        }

        $this->newLine();
        $this->info("Migraciones sincronizadas con objetos existentes: {$marcadas}");
        $this->info('Ejecutando únicamente las migraciones que realmente faltan...');

        $codigo = Artisan::call('migrate', ['--force' => true]);
        $salida = trim(Artisan::output());

        if ($salida !== '') {
            $this->line($salida);
        }

        if ($codigo !== 0) {
            $this->error('No se pudo completar la sincronización de la base de datos.');
            return self::FAILURE;
        }

        // Reparación defensiva para instalaciones antiguas donde ventas ya existía
        // pero faltaban columnas comerciales o la vista quedó inválida.
        if (Schema::hasTable('ventas') && Schema::hasTable('detalle_venta')) {
            $codigoReparacion = Artisan::call('db:reparar-ventas');
            $salidaReparacion = trim(Artisan::output());

            if ($salidaReparacion !== '') {
                $this->line($salidaReparacion);
            }

            if ($codigoReparacion !== 0) {
                $this->error('La base se migró, pero no se pudo reparar vista_ventas.');
                return self::FAILURE;
            }
        }

        $this->newLine();
        $this->info('Base de datos sincronizada correctamente.');
        $this->comment('Ahora ejecuta: php artisan db:verificar');

        return self::SUCCESS;
    }

    private function objetoExistentePara(string $migracion): ?bool
    {
        $tablas = [
            'create_clientes_table' => 'clientes',
            'create_membresias_table' => 'membresias',
            'create_cliente_membresia_table' => 'cliente_membresia',
            'create_pagos_membresia_table' => 'pagos_membresia',
            'create_asistencias_table' => 'asistencias',
            'create_entrenadores_table' => 'entrenadores',
            'create_rutinas_table' => 'rutinas',
            'create_detalle_rutina_table' => 'detalle_rutina',
            'create_categorias_table' => 'categorias',
            'create_productos_table' => 'productos',
            'create_usuarios_table' => 'usuarios',
            'create_proveedores_table' => 'proveedores',
            'create_compras_table' => 'compras',
            'create_detalle_compra_table' => 'detalle_compra',
            'create_ventas_table' => 'ventas',
            'create_detalle_venta_table' => 'detalle_venta',
            'create_clases_table' => 'clases',
            'create_reservas_table' => 'reservas',
            'create_cajas_table' => 'cajas',
            'create_movimientos_caja_table' => 'movimientos_caja',
            'create_movimientos_inventario_table' => 'movimientos_inventario',
            'create_auditorias_table' => 'auditorias',
        ];

        foreach ($tablas as $sufijo => $tabla) {
            if (str_ends_with($migracion, $sufijo)) {
                return Schema::hasTable($tabla);
            }
        }

        if (str_ends_with($migracion, 'create_mallqui_views') || str_ends_with($migracion, 'create_project_views')) {
            return $this->vistasExisten();
        }

        if (str_ends_with($migracion, 'add_integrity_indexes_to_business_tables')) {
            return $this->indicesIntegridadExisten();
        }

        return null;
    }

    private function asegurarIndicesIntegridad(): bool
    {
        $indices = [
            ['tabla' => 'pagos_membresia', 'columna' => 'numero_operacion', 'nombre' => 'pagos_membresia_numero_operacion_unique'],
            ['tabla' => 'compras', 'columna' => 'numero_comprobante', 'nombre' => 'compras_numero_comprobante_unique'],
            ['tabla' => 'ventas', 'columna' => 'numero_comprobante', 'nombre' => 'ventas_numero_comprobante_unique'],
            ['tabla' => 'usuarios', 'columna' => 'correo', 'nombre' => 'usuarios_correo_unique'],
        ];

        foreach ($indices as $indice) {
            if (!Schema::hasTable($indice['tabla']) || !Schema::hasColumn($indice['tabla'], $indice['columna'])) {
                continue;
            }

            if ($this->indiceExiste($indice['tabla'], $indice['nombre'])) {
                continue;
            }

            try {
                DB::statement(sprintf(
                    'ALTER TABLE %s ADD UNIQUE %s (%s)',
                    $indice['tabla'],
                    $indice['nombre'],
                    $indice['columna']
                ));
                $this->info('Índice preparado: '.$indice['nombre']);
            } catch (Throwable $e) {
                $this->error('No se pudo crear '.$indice['nombre'].': '.$e->getMessage());
                $this->comment('Revisa si existen datos duplicados en '.$indice['tabla'].'.'.$indice['columna'].'.');
                return false;
            }
        }

        return true;
    }

    private function indicesIntegridadExisten(): bool
    {
        $indices = [
            ['pagos_membresia', 'pagos_membresia_numero_operacion_unique'],
            ['compras', 'compras_numero_comprobante_unique'],
            ['ventas', 'ventas_numero_comprobante_unique'],
            ['usuarios', 'usuarios_correo_unique'],
        ];

        foreach ($indices as [$tabla, $nombre]) {
            if (!Schema::hasTable($tabla) || !$this->indiceExiste($tabla, $nombre)) {
                return false;
            }
        }

        return true;
    }

    private function indiceExiste(string $tabla, string $nombre): bool
    {
        $base = DB::getDatabaseName();

        return DB::table('information_schema.statistics')
            ->where('table_schema', $base)
            ->where('table_name', $tabla)
            ->where('index_name', $nombre)
            ->exists();
    }

    private function vistasExisten(): bool
    {
        foreach (['vista_clientes_membresias', 'vista_stock', 'vista_ventas'] as $vista) {
            try {
                DB::table($vista)->limit(1)->get();
            } catch (Throwable $e) {
                return false;
            }
        }

        return true;
    }
}
