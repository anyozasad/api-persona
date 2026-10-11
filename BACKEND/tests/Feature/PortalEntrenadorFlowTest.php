<?php

namespace Tests\Feature;

use App\Http\Middleware\AuditLogMiddleware;
use App\Models\Usuario;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class PortalEntrenadorFlowTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(AuditLogMiddleware::class);

        foreach (['detalle_rutina','reservas','clases','rutinas','clientes','entrenadores','usuarios'] as $tabla) {
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

        Schema::create('entrenadores', function (Blueprint $table) {
            $table->id('id_entrenador');
            $table->string('dni')->unique();
            $table->string('nombres');
            $table->string('apellidos');
            $table->string('telefono')->nullable();
            $table->string('correo')->nullable();
            $table->string('especialidad')->nullable();
            $table->date('fecha_contratacion')->nullable();
            $table->decimal('salario', 10, 2)->nullable();
            $table->string('estado')->default('Activo');
        });

        Schema::create('clientes', function (Blueprint $table) {
            $table->id('id_cliente');
            $table->string('dni')->unique();
            $table->string('nombres');
            $table->string('apellidos');
            $table->string('estado')->default('Activo');
        });

        Schema::create('rutinas', function (Blueprint $table) {
            $table->id('id_rutina');
            $table->unsignedBigInteger('id_cliente');
            $table->unsignedBigInteger('id_entrenador');
            $table->string('nombre_rutina');
            $table->string('objetivo')->nullable();
            $table->text('descripcion')->nullable();
            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();
            $table->string('estado')->default('Activo');
        });

        Schema::create('detalle_rutina', function (Blueprint $table) {
            $table->id('id_detalle_rutina');
            $table->unsignedBigInteger('id_rutina');
            $table->string('ejercicio');
            $table->unsignedInteger('series')->nullable();
            $table->unsignedInteger('repeticiones')->nullable();
            $table->decimal('peso', 8, 2)->nullable();
            $table->unsignedInteger('descanso_segundos')->nullable();
            $table->text('indicaciones')->nullable();
        });

        Schema::create('clases', function (Blueprint $table) {
            $table->id('id_clase');
            $table->unsignedBigInteger('id_entrenador')->nullable();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->string('dia_semana')->nullable();
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->unsignedInteger('cupo_maximo');
            $table->string('estado');
        });

        Schema::create('reservas', function (Blueprint $table) {
            $table->id('id_reserva');
            $table->unsignedBigInteger('id_cliente');
            $table->unsignedBigInteger('id_clase');
            $table->date('fecha_clase');
            $table->dateTime('fecha_reserva');
            $table->string('estado');
        });

        DB::table('entrenadores')->insert([
            'id_entrenador' => 1,
            'dni' => '75555551',
            'nombres' => 'Entrenador',
            'apellidos' => 'Principal',
            'especialidad' => 'Entrenamiento funcional',
            'estado' => 'Activo',
        ]);

        DB::table('clientes')->insert([
            'id_cliente' => 1,
            'dni' => '70000041',
            'nombres' => 'Socio',
            'apellidos' => 'Rutina',
            'estado' => 'Activo',
        ]);

        DB::table('usuarios')->insert([
            'id_usuario' => 1,
            'nombre_usuario' => 'entrenador.principal',
            'contrasena' => bcrypt('Password123'),
            'nombres' => 'Entrenador',
            'apellidos' => 'Principal',
            'dni' => '75555551',
            'correo' => 'entrenador@mallqui.test',
            'rol' => 'Entrenador',
            'estado' => 'Activo',
            'id_entrenador' => 1,
            'fecha_registro' => now(),
        ]);

        DB::table('rutinas')->insert([
            'id_rutina' => 1,
            'id_cliente' => 1,
            'id_entrenador' => 1,
            'nombre_rutina' => 'Rutina fuerza',
            'objetivo' => 'Fuerza',
            'fecha_inicio' => today()->toDateString(),
            'fecha_fin' => today()->addMonth()->toDateString(),
            'estado' => 'Activo',
        ]);

        DB::table('detalle_rutina')->insert([
            'id_detalle_rutina' => 1,
            'id_rutina' => 1,
            'ejercicio' => 'Sentadilla',
            'series' => 4,
            'repeticiones' => 10,
            'peso' => 20,
            'descanso_segundos' => 60,
            'indicaciones' => 'Técnica controlada',
        ]);

        DB::table('clases')->insert([
            'id_clase' => 1,
            'id_entrenador' => 1,
            'nombre' => 'Funcional',
            'dia_semana' => 'Lunes',
            'hora_inicio' => '18:00:00',
            'hora_fin' => '19:00:00',
            'cupo_maximo' => 12,
            'estado' => 'Activo',
        ]);

        DB::table('reservas')->insert([
            'id_reserva' => 1,
            'id_cliente' => 1,
            'id_clase' => 1,
            'fecha_clase' => today()->toDateString(),
            'fecha_reserva' => now(),
            'estado' => 'Reservada',
        ]);

        $this->actingAs(Usuario::findOrFail(1), 'sanctum');
    }

    public function test_resumen_del_entrenador_refleja_clientes_rutinas_clases_y_reservas(): void
    {
        $this->getJson('/api/mi-entrenador/resumen')
            ->assertOk()
            ->assertJsonPath('entrenador.id_entrenador', 1)
            ->assertJsonPath('clientes', 1)
            ->assertJsonPath('rutinas_activas', 1)
            ->assertJsonPath('clases_activas', 1)
            ->assertJsonPath('reservas_hoy', 1);
    }

    public function test_entrenador_ve_clientes_sin_datos_privados_innecesarios(): void
    {
        $cliente = $this->getJson('/api/mi-entrenador/clientes')
            ->assertOk()
            ->assertJsonCount(1)
            ->json('0');

        $this->assertSame('70000041', $cliente['dni']);
        $this->assertArrayNotHasKey('correo', $cliente);
        $this->assertArrayNotHasKey('telefono', $cliente);
        $this->assertCount(1, $cliente['rutinas']);
    }

    public function test_entrenador_ve_sus_rutinas_clases_y_reservas(): void
    {
        $this->getJson('/api/mi-entrenador/rutinas')
            ->assertOk()
            ->assertJsonPath('0.nombre_rutina', 'Rutina fuerza')
            ->assertJsonPath('0.detalles.0.ejercicio', 'Sentadilla');

        $this->getJson('/api/mi-entrenador/clases')
            ->assertOk()
            ->assertJsonPath('0.nombre', 'Funcional');

        $this->getJson('/api/mi-entrenador/reservas')
            ->assertOk()
            ->assertJsonPath('0.cliente.dni', '70000041')
            ->assertJsonPath('0.clase.nombre', 'Funcional');
    }
}
