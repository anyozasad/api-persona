<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DashboardModulosLegacyRepairTest extends TestCase
{
    public function test_recupera_tablas_faltantes_sin_perder_planes_anteriores(): void
    {
        if (!in_array(DB::connection()->getDriverName(), ['mysql', 'mariadb'], true)) {
            $this->markTestSkipped('Esta prueba de compatibilidad requiere MySQL.');
        }

        $original = DB::getDefaultConnection();
        $conexion = 'gym_modulos_legacy_ci';
        $database = 'mallqui_modulos_legacy_ci';
        $admin = DB::connection($original);
        $admin->statement('CREATE DATABASE IF NOT EXISTS `mallqui_modulos_legacy_ci` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');

        $config = (array) config('database.connections.'.$original);
        $config['database'] = $database;
        $config['prefix'] = '';
        $config['url'] = null;
        config(['database.connections.'.$conexion => $config]);

        try {
            DB::setDefaultConnection($conexion);
            DB::purge($conexion);
            // Plan antiguo con campos incompletos, en lugar de sustituirlo
            // con datos de demostración.
            Schema::create('membresias', function (Blueprint $table) {
                $table->bigIncrements('id_membresia');
                $table->string('nombre', 100);
            });
            DB::table('membresias')->insert(['nombre' => 'Tarifa ya existente']);

            $migration = require database_path('migrations/2026_11_20_180000_recuperar_modulos_dashboard_existentes.php');
            $migration->up();
            $migration->up();

            foreach (['admin_gym_records','notificaciones_cliente','cliente_membresia','membresias'] as $tabla) {
                $this->assertTrue(Schema::hasTable($tabla), 'No recuperó la tabla '.$tabla);
            }
            foreach (['precio','duracion_meses','beneficios','permite_reservas','estado'] as $campo) {
                $this->assertTrue(Schema::hasColumn('membresias', $campo));
            }
            $this->assertSame(1, DB::table('membresias')->count());
            $this->assertSame('Tarifa ya existente', DB::table('membresias')->value('nombre'));
            DB::table('admin_gym_records')->insert([
                'modulo'=>'eventos',
                'titulo'=>'Evento de prueba',
                'estado'=>'Activo',
            ]);
            $this->assertSame(1, DB::table('admin_gym_records')->where('modulo', 'eventos')->count());
            DB::table('notificaciones_cliente')->insert([
                'id_cliente'=>15,
                'titulo'=>'Aviso real de prueba',
                'mensaje'=>'Aviso de prueba en entorno aislado',
                'tipo'=>'Informacion',
            ]);
            $this->assertSame(1, DB::table('notificaciones_cliente')->count());
        } finally {
            DB::setDefaultConnection($original);
            DB::disconnect($conexion);
            $admin->statement('DROP DATABASE IF EXISTS `mallqui_modulos_legacy_ci`');
        }
    }
}
