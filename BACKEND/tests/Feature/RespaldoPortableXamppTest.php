<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class RespaldoPortableXamppTest extends TestCase
{
    public function test_crea_respaldo_sql_con_mysqldump_ausente_antes_de_reparar_mysql(): void
    {
        if (!in_array(DB::connection()->getDriverName(), ['mysql', 'mariadb'], true)) {
            $this->markTestSkipped('La prueba requiere MySQL/MariaDB.');
        }

        $anterior = DB::getDefaultConnection();
        $admin = DB::connection($anterior);
        $db = 'mallqui_respaldo_portable_ci';
        $cn = 'respaldo_portable_ci';
        $config = (array) config('database.connections.'.$anterior);
        $oldEnv = [
            'env' => $_ENV['MYSQLDUMP_PATH'] ?? null,
            'server' => $_SERVER['MYSQLDUMP_PATH'] ?? null,
            'putenv' => getenv('MYSQLDUMP_PATH'),
        ];
        $archivo = null;

        $admin->statement('CREATE DATABASE IF NOT EXISTS '.chr(96).$db.chr(96).' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        $config['database'] = $db;
        $config['url'] = null;
        $config['prefix'] = '';
        config(['database.connections.'.$cn => $config]);

        try {
            DB::setDefaultConnection($cn);
            DB::purge($cn);
            Schema::create('cajas', function (Blueprint $t) {
                $t->bigIncrements('id');
                $t->unsignedBigInteger('id_caja')->nullable();
                $t->string('observacion')->nullable();
                $t->decimal('monto_inicial', 12, 2);
            });
            Schema::create('ventas', function (Blueprint $t) {
                $t->bigIncrements('id');
                $t->unsignedBigInteger('id_venta')->nullable();
                $t->text('detalle')->nullable();
                $t->decimal('total', 12, 2);
            });
            DB::table('cajas')->insert(['id_caja' => null, 'observacion' => 'Caja original', 'monto_inicial' => 100]);
            DB::table('ventas')->insert([
                'id_venta' => null, 'detalle' => "Venta O'Brien con foto conservada",
                'total' => 40,
            ]);

            // Forzar un ejecutable inexistente para reproducir XAMPP.
            $invalido = PHP_OS_FAMILY === 'Windows' ? 'Z:\\sin_mysqldump\\mysqldump.exe' : '/no/existe/mysqldump';
            $_ENV['MYSQLDUMP_PATH'] = $invalido;
            $_SERVER['MYSQLDUMP_PATH'] = $invalido;
            putenv('MYSQLDUMP_PATH='.$invalido);

            $this->assertSame(0, Artisan::call('backup:database', ['--portable' => true]), Artisan::output());

            $paths = glob(storage_path('app/backups/'.$db.'_*.sql')) ?: [];
            $this->assertNotEmpty($paths, 'No se escribió un respaldo verificable.');
            $archivo = end($paths);
            $sql = file_get_contents($archivo);
            $this->assertStringContainsString('-- Copia portable Mallqui Gym', $sql);
            $this->assertStringContainsString('CREATE TABLE', $sql);
            $this->assertStringContainsString('INSERT INTO', $sql);
            $this->assertStringContainsString('Caja original', $sql);
            $this->assertStringContainsString('40', $sql);
            $this->assertSame(1, DB::table('ventas')->count());
            $this->assertSame(1, DB::table('cajas')->count());
        } finally {
            if ($oldEnv['env'] === null) unset($_ENV['MYSQLDUMP_PATH']);
            else $_ENV['MYSQLDUMP_PATH'] = $oldEnv['env'];
            if ($oldEnv['server'] === null) unset($_SERVER['MYSQLDUMP_PATH']);
            else $_SERVER['MYSQLDUMP_PATH'] = $oldEnv['server'];
            if ($oldEnv['putenv'] === false) putenv('MYSQLDUMP_PATH');
            else putenv('MYSQLDUMP_PATH='.$oldEnv['putenv']);
            if ($archivo && is_file($archivo)) @unlink($archivo);
            DB::setDefaultConnection($anterior);
            DB::disconnect($cn);
            $admin->statement('DROP DATABASE IF EXISTS '.chr(96).$db.chr(96));
        }
    }
}
