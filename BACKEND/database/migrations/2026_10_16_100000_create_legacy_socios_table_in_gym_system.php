<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $conexion = (string) config('database.default');
        $base = (array) config('database.connections.'.$conexion, []);
        $driver = (string) ($base['driver'] ?? '');

        if (!in_array($driver, ['mysql', 'mariadb'], true)) {
            return;
        }

        config([
            'database.connections.gym_system_legacy_migration' => array_merge($base, [
                'database' => env('GYM_DB_DATABASE', 'gym_system'),
                'prefix' => '',
            ]),
        ]);

        DB::purge('gym_system_legacy_migration');
        $schema = Schema::connection('gym_system_legacy_migration');

        if ($schema->hasTable('socios')) {
            return;
        }

        $schema->create('socios', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 200);
            $table->string('dni', 20)->unique();
            $table->string('email', 150)->nullable();
            $table->string('telefono', 30)->nullable();
            $table->string('whatsapp_api_key', 255)->nullable();
            $table->dateTime('fecha_registro')->nullable();
            $table->string('estado', 20)->default('activo');
            $table->mediumText('foto')->nullable();
            $table->index('estado');
            $table->index('email');
        });
    }

    public function down(): void
    {
        // No se elimina la tabla socios en rollback porque puede contener
        // información legacy real de la instalación del usuario.
    }
};
