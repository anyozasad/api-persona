<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('usuarios')) {
            return;
        }

        Schema::table('usuarios', function (Blueprint $table) {
            if (!Schema::hasColumn('usuarios', 'id_cliente')) {
                $table->unsignedBigInteger('id_cliente')->nullable()->index()->after('correo');
            }
            if (!Schema::hasColumn('usuarios', 'id_entrenador')) {
                $table->unsignedBigInteger('id_entrenador')->nullable()->index()->after('id_cliente');
            }
        });

        // Vincula cuentas antiguas sin depender para siempre del DNI.
        if (Schema::hasTable('clientes')) {
            DB::statement("UPDATE usuarios u INNER JOIN clientes c ON c.dni = u.dni SET u.id_cliente = c.id_cliente WHERE u.rol = 'Cliente' AND u.id_cliente IS NULL");
        }
        if (Schema::hasTable('entrenadores')) {
            DB::statement("UPDATE usuarios u INNER JOIN entrenadores e ON e.dni = u.dni SET u.id_entrenador = e.id_entrenador WHERE u.rol = 'Entrenador' AND u.id_entrenador IS NULL");
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('usuarios')) return;

        Schema::table('usuarios', function (Blueprint $table) {
            if (Schema::hasColumn('usuarios', 'id_entrenador')) $table->dropColumn('id_entrenador');
            if (Schema::hasColumn('usuarios', 'id_cliente')) $table->dropColumn('id_cliente');
        });
    }
};
