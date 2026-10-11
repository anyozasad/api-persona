<?php

namespace Tests\Feature;

use App\Http\Middleware\AuditLogMiddleware;
use App\Models\Usuario;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ComunicacionClienteAdminFlowTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(AuditLogMiddleware::class);

        foreach (['notificaciones_cliente','opiniones_cliente','solicitudes_soporte','clientes','usuarios'] as $tabla) {
            Schema::dropIfExists($tabla);
        }

        Schema::create('usuarios', function (Blueprint $table) {
            $table->id('id_usuario');
            $table->string('nombre_usuario')->unique();
            $table->string('contrasena');
            $table->string('nombres');
            $table->string('apellidos');
            $table->string('dni')->unique();
            $table->string('correo')->nullable();
            $table->string('rol');
            $table->string('estado')->default('Activo');
            $table->unsignedBigInteger('id_cliente')->nullable();
            $table->unsignedBigInteger('id_entrenador')->nullable();
            $table->dateTime('fecha_registro')->nullable();
        });

        Schema::create('clientes', function (Blueprint $table) {
            $table->id('id_cliente');
            $table->string('dni')->unique();
            $table->string('nombres');
            $table->string('apellidos');
            $table->string('estado')->default('Activo');
        });

        Schema::create('solicitudes_soporte', function (Blueprint $table) {
            $table->id('id_soporte');
            $table->unsignedBigInteger('id_cliente');
            $table->string('asunto', 150);
            $table->text('mensaje');
            $table->text('respuesta')->nullable();
            $table->string('estado')->default('Pendiente');
            $table->dateTime('fecha');
            $table->dateTime('fecha_respuesta')->nullable();
            $table->timestamps();
        });

        Schema::create('opiniones_cliente', function (Blueprint $table) {
            $table->id('id_opinion');
            $table->unsignedBigInteger('id_cliente');
            $table->string('categoria');
            $table->unsignedTinyInteger('calificacion');
            $table->text('comentario');
            $table->string('estado')->default('Enviada');
            $table->dateTime('fecha');
            $table->timestamps();
        });

        Schema::create('notificaciones_cliente', function (Blueprint $table) {
            $table->id('id_notificacion');
            $table->unsignedBigInteger('id_cliente');
            $table->string('titulo', 150);
            $table->text('mensaje');
            $table->string('tipo')->default('Informacion');
            $table->boolean('leida')->default(false);
            $table->dateTime('fecha');
            $table->timestamps();
        });

        DB::table('clientes')->insert([
            'id_cliente' => 1,
            'dni' => '70000051',
            'nombres' => 'Cliente',
            'apellidos' => 'Soporte',
            'estado' => 'Activo',
        ]);

        DB::table('usuarios')->insert([
            [
                'id_usuario' => 1,
                'nombre_usuario' => 'admin.soporte',
                'contrasena' => bcrypt('Password123'),
                'nombres' => 'Admin',
                'apellidos' => 'Soporte',
                'dni' => '79999951',
                'correo' => 'admin.soporte@mallqui.test',
                'rol' => 'Administrador',
                'estado' => 'Activo',
                'id_cliente' => null,
                'id_entrenador' => null,
                'fecha_registro' => now(),
            ],
            [
                'id_usuario' => 2,
                'nombre_usuario' => 'cliente.soporte',
                'contrasena' => bcrypt('Password123'),
                'nombres' => 'Cliente',
                'apellidos' => 'Soporte',
                'dni' => '70000051',
                'correo' => 'cliente.soporte@mallqui.test',
                'rol' => 'Cliente',
                'estado' => 'Activo',
                'id_cliente' => 1,
                'id_entrenador' => null,
                'fecha_registro' => now(),
            ],
        ]);
    }

    public function test_cliente_crea_soporte_admin_responde_y_cliente_recibe_notificacion(): void
    {
        $this->actingAs(Usuario::findOrFail(2), 'sanctum');

        $id = (int) $this->postJson('/api/mi-cuenta/soporte', [
            'asunto' => 'Consulta de horario',
            'mensaje' => 'Necesito saber el horario de atención.',
        ])->assertCreated()
          ->assertJsonPath('solicitud.estado', 'Pendiente')
          ->json('solicitud.id_soporte');

        $this->actingAs(Usuario::findOrFail(1), 'sanctum');

        $this->putJson("/api/soporte-clientes/{$id}/responder", [
            'respuesta' => 'Atendemos en el horario configurado del gimnasio.',
        ])->assertOk()
          ->assertJsonPath('solicitud.estado', 'Respondido');

        $this->assertDatabaseHas('notificaciones_cliente', [
            'id_cliente' => 1,
            'titulo' => 'Respuesta de soporte',
            'tipo' => 'Soporte',
            'leida' => 0,
        ]);
    }

    public function test_opinion_revisada_genera_agradecimiento_para_cliente(): void
    {
        $this->actingAs(Usuario::findOrFail(2), 'sanctum');

        $id = (int) $this->postJson('/api/mi-cuenta/opiniones', [
            'categoria' => 'Servicio',
            'calificacion' => 5,
            'comentario' => 'La atención fue muy buena.',
        ])->assertCreated()->json('opinion.id_opinion');

        $this->actingAs(Usuario::findOrFail(1), 'sanctum');

        $this->putJson("/api/opiniones-clientes/{$id}/estado", [
            'estado' => 'Revisada',
        ])->assertOk()
          ->assertJsonPath('opinion.estado', 'Revisada');

        $this->assertDatabaseHas('notificaciones_cliente', [
            'id_cliente' => 1,
            'titulo' => 'Gracias por tu opinión',
            'leida' => 0,
        ]);
    }

    public function test_admin_envia_aviso_y_cliente_puede_marcarlo_como_leido(): void
    {
        $this->actingAs(Usuario::findOrFail(1), 'sanctum');

        $this->postJson('/api/notificaciones-clientes', [
            'id_cliente' => 1,
            'titulo' => 'Aviso de prueba',
            'mensaje' => 'El gimnasio comunica una novedad importante.',
            'tipo' => 'Informacion',
        ])->assertCreated()
          ->assertJsonPath('enviadas', 1);

        $id = (int) DB::table('notificaciones_cliente')->value('id_notificacion');

        $this->actingAs(Usuario::findOrFail(2), 'sanctum');

        $this->postJson("/api/mi-cuenta/notificaciones/{$id}/leer")
            ->assertOk()
            ->assertJsonPath('notificacion.leida', true);

        $this->assertDatabaseHas('notificaciones_cliente', [
            'id_notificacion' => $id,
            'leida' => 1,
        ]);
    }
}
