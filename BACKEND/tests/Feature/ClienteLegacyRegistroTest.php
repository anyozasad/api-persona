<?php

namespace Tests\Feature;

use App\Models\Cliente;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ClienteLegacyRegistroTest extends TestCase
{
    public function test_repara_clientes_antiguos_y_puede_registrar_un_nuevo_socio_sin_perder_fichas(): void
    {
        if (!in_array(DB::connection()->getDriverName(), ['mysql', 'mariadb'], true)) {
            $this->markTestSkipped('La estructura antigua con ID autoincremental requiere MySQL.');
        }

        $original = DB::getDefaultConnection();
        $conexionTest = 'cliente_legacy_ci';
        $bdTemporal = 'mallqui_cliente_legacy_ci';
        $admin = DB::connection($original);

        $admin->statement('CREATE DATABASE IF NOT EXISTS `mallqui_cliente_legacy_ci` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        $config = (array) config('database.connections.'.$original);
        $config['database'] = $bdTemporal;
        $config['prefix'] = '';
        $config['url'] = null;
        config(['database.connections.'.$conexionTest => $config]);

        try {
            DB::setDefaultConnection($conexionTest);
            DB::purge($conexionTest);

            Schema::create('clientes', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('dni', 15);
                $table->string('nombre', 100);
                $table->string('apellido', 100);
                $table->string('email', 150)->nullable();
            });
            DB::table('clientes')->insert([
                'dni' => '77889911',
                'nombre' => 'Socio',
                'apellido' => 'Antiguo',
                'email' => 'antiguo@example.test',
            ]);

            $migration = require database_path('migrations/2026_11_20_145000_reparar_clientes_legacy_para_acceso.php');
            $migration->up();

            $antiguo = DB::table('clientes')->where('dni', '77889911')->first();
            $this->assertSame((int) $antiguo->id, (int) $antiguo->id_cliente);
            $this->assertSame('Socio', $antiguo->nombres);
            $this->assertSame('Antiguo', $antiguo->apellidos);
            $this->assertSame('antiguo@example.test', $antiguo->correo);

            $nuevo = Cliente::create([
                'dni' => '77889912',
                'nombres' => 'Socio',
                'apellidos' => 'Nuevo',
                'correo' => 'nuevo@example.test',
                'estado' => 'Activo',
                'fecha_registro' => now(),
            ]);
            $this->assertGreaterThan(0, (int) $nuevo->getKey());
            $this->assertDatabaseHas('clientes', [
                'dni' => '77889912',
                'id_cliente' => $nuevo->getKey(),
                'nombres' => 'Socio',
                'apellidos' => 'Nuevo',
            ], $conexionTest);
            $this->assertDatabaseHas('clientes', [
                'dni' => '77889911',
                'nombres' => 'Socio',
                'apellidos' => 'Antiguo',
            ], $conexionTest);

            // Verificar también el caso que fallaba en XAMPP al activar
            // "Crear cuenta": tabla usuarios antigua con password obligatorio.
            Schema::create('usuarios', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('username', 80);
                $table->string('password', 255);
                $table->string('email', 150);
                $table->string('name', 200);
            });
            $migrationUsuarioId = require database_path('migrations/2026_11_07_230000_ensure_usuarios_identity.php');
            $migrationUsuarioId->up();
            $migrationUsuarioAuth = require database_path('migrations/2026_11_07_231000_ensure_usuarios_auth_fields.php');
            $migrationUsuarioAuth->up();

            $cuenta = Usuario::create([
                'id_cliente' => $nuevo->id_cliente,
                'nombre_usuario' => 'socio.legacy',
                'contrasena' => Hash::make('PruebaSegura123!'),
                'nombres' => 'Socio',
                'apellidos' => 'Nuevo',
                'dni' => '77889912',
                'correo' => 'nuevo@example.test',
                'rol' => 'Cliente',
                'estado' => 'Activo',
                'fecha_registro' => now(),
            ]);
            $this->assertGreaterThan(0, (int) $cuenta->id_usuario);
            $this->assertTrue(Hash::check('PruebaSegura123!', $cuenta->contrasena));
            $this->assertDatabaseHas('usuarios', [
                'id_cliente' => $nuevo->id_cliente,
                'nombre_usuario' => 'socio.legacy',
                'username' => 'socio.legacy',
                'email' => 'nuevo@example.test',
                'rol' => 'Cliente',
            ], $conexionTest);
            $passwordAntiguo = DB::table('usuarios')->where('nombre_usuario', 'socio.legacy')->value('password');
            $this->assertTrue(Hash::check('PruebaSegura123!', (string) $passwordAntiguo));
        } finally {
            DB::setDefaultConnection($original);
            DB::disconnect($conexionTest);
            $admin->statement('DROP DATABASE IF EXISTS `mallqui_cliente_legacy_ci`');
        }
    }
}
