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

        foreach (['db:generar-interno', 'db:operacion-interno'] as $comando) {
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

        return null;
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
