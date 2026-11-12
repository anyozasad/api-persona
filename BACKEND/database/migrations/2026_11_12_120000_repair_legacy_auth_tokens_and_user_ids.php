<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Sanctum escribe timestamps al crear tokens. Las tablas legacy
        // pueden existir sin estos campos aunque db:verificar marcara OK.
        if (Schema::hasTable('personal_access_tokens')) {
            if (!Schema::hasColumn('personal_access_tokens', 'created_at')) {
                Schema::table('personal_access_tokens', function (Blueprint $table): void {
                    $table->timestamp('created_at')->nullable();
                });
            }
            if (!Schema::hasColumn('personal_access_tokens', 'updated_at')) {
                Schema::table('personal_access_tokens', function (Blueprint $table): void {
                    $table->timestamp('updated_at')->nullable();
                });
            }
        }

        // En gym_system antiguos puede haber cuentas creadas con el
        // AUTO_INCREMENT de id, pero con id_usuario nulo, lo que impide
        // emitir un token de Sanctum. Copiamos el ID sin eliminar cuentas.
        if (Schema::hasTable('usuarios') &&
            Schema::hasColumn('usuarios', 'id_usuario') &&
            Schema::hasColumn('usuarios', 'id')) {
            $sinId = DB::table('usuarios')->whereNull('id_usuario')->count();
            if ($sinId > 0) {
                $driver = DB::connection()->getDriverName();
                if (in_array($driver, ['mysql', 'mariadb'], true)) {
                    DB::statement('UPDATE `usuarios` SET `id_usuario` = `id` WHERE `id_usuario` IS NULL');
                } elseif ($driver === 'sqlite') {
                    DB::statement('UPDATE "usuarios" SET "id_usuario" = "id" WHERE "id_usuario" IS NULL');
                } else {
                    throw new \RuntimeException('No se pudo completar id_usuario en esta base de datos.');
                }
            }
        }
    }

    public function down(): void
    {
        // No eliminar columnas ni restaurar IDs nulos en datos reales.
    }
};
