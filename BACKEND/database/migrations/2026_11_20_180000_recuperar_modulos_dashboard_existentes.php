<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Recupera tablas realmente ausentes aunque las migraciones anteriores
     * figuren como aplicadas en la base gym_system.
     * Nunca elimina ni trunca filas existentes.
     */
    public function up(): void
    {
        if (!Schema::hasTable('admin_gym_records')) {
            Schema::create('admin_gym_records', function (Blueprint $table) {
                $table->id();
                $table->string('modulo', 40)->index();
                $table->string('titulo', 180);
                $table->string('subtitulo', 255)->nullable();
                $table->string('estado', 50)->default('Activo')->index();
                $table->date('fecha')->nullable();
                $table->decimal('monto', 12, 2)->nullable();
                $table->string('imagen_url', 500)->nullable();
                $table->json('datos')->nullable();
                $table->timestamps();
                $table->index(['modulo', 'fecha']);
            });
        }

        if (!Schema::hasTable('notificaciones_cliente')) {
            Schema::create('notificaciones_cliente', function (Blueprint $table) {
                $table->bigIncrements('id_notificacion');
                $table->unsignedBigInteger('id_cliente')->index();
                $table->string('titulo', 150);
                $table->text('mensaje');
                $table->string('tipo', 30)->default('Informacion');
                $table->boolean('leida')->default(false)->index();
                $table->dateTime('fecha')->useCurrent()->index();
                $table->timestamps();
            });
        }

        // El módulo Planes usa membresias; el esquema core puede figurar
        // migrado en instalaciones antiguas aunque falte la tabla.
        if (!Schema::hasTable('membresias')) {
            Schema::create('membresias', function (Blueprint $table) {
                $table->bigIncrements('id_membresia');
                $table->string('nombre', 100)->unique();
                $table->unsignedInteger('duracion_meses')->default(1);
                $table->decimal('precio', 12, 2)->default(0);
                $table->string('descripcion', 500)->nullable();
                $table->json('beneficios')->nullable();
                $table->boolean('permite_reservas')->default(true);
                $table->string('estado', 20)->default('Activo')->index();
            });
        } else {
            foreach (['nombre', 'descripcion', 'estado'] as $columna) {
                if (!Schema::hasColumn('membresias', $columna)) {
                    Schema::table('membresias', function (Blueprint $table) use ($columna) {
                        if ($columna === 'estado') {
                            $table->string('estado', 20)->default('Activo');
                        } else {
                            $table->string($columna, $columna === 'nombre' ? 100 : 500)->nullable();
                        }
                    });
                }
            }
            if (!Schema::hasColumn('membresias', 'precio')) {
                Schema::table('membresias', fn (Blueprint $table) => $table->decimal('precio', 12, 2)->default(0));
            }
            if (!Schema::hasColumn('membresias', 'duracion_meses')) {
                Schema::table('membresias', fn (Blueprint $table) => $table->unsignedInteger('duracion_meses')->default(1));
            }
            if (!Schema::hasColumn('membresias', 'beneficios')) {
                Schema::table('membresias', fn (Blueprint $table) => $table->json('beneficios')->nullable());
            }
            if (!Schema::hasColumn('membresias', 'permite_reservas')) {
                Schema::table('membresias', fn (Blueprint $table) => $table->boolean('permite_reservas')->default(true));
            }
        }
    }

    public function down(): void
    {
        // Conservación de datos: jamás borrar registros de socios, tarifas,
        // notificaciones, noticias o eventos en un rollback.
    }
};
