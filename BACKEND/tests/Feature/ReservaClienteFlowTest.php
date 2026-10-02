<?php

namespace Tests\Feature;

use App\Http\Controllers\ReservaController;
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class ReservaClienteFlowTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        foreach (['reservas','clases','cliente_membresia','membresias','usuarios','clientes'] as $tabla) {
            Schema::dropIfExists($tabla);
        }

        Schema::create('clientes', function (Blueprint $table) {
            $table->id('id_cliente');
            $table->string('dni')->unique();
            $table->string('nombres');
            $table->string('apellidos');
            $table->string('estado')->default('Activo');
        });

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

        Schema::create('membresias', function (Blueprint $table) {
            $table->id('id_membresia');
            $table->string('nombre');
            $table->unsignedInteger('duracion_meses');
            $table->decimal('precio', 10, 2);
            $table->json('beneficios')->nullable();
            $table->boolean('permite_reservas')->default(true);
            $table->string('estado')->default('Activo');
        });

        Schema::create('cliente_membresia', function (Blueprint $table) {
            $table->id('id_cliente_membresia');
            $table->unsignedBigInteger('id_cliente');
            $table->unsignedBigInteger('id_membresia');
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->string('estado');
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

        DB::table('clientes')->insert([
            'id_cliente' => 1,
            'dni' => '70000002',
            'nombres' => 'Cliente',
            'apellidos' => 'Reserva',
            'estado' => 'Activo',
        ]);

        DB::table('usuarios')->insert([
            'id_usuario' => 1,
            'nombre_usuario' => 'cliente.reserva',
            'contrasena' => bcrypt('Password123'),
            'nombres' => 'Cliente',
            'apellidos' => 'Reserva',
            'dni' => '70000002',
            'correo' => 'reserva@test.local',
            'rol' => 'Cliente',
            'estado' => 'Activo',
            'id_cliente' => 1,
            'fecha_registro' => now(),
        ]);

        DB::table('clases')->insert([
            'id_clase' => 1,
            'id_entrenador' => null,
            'nombre' => 'Funcional',
            'dia_semana' => 'Lunes',
            'hora_inicio' => '18:00:00',
            'hora_fin' => '19:00:00',
            'cupo_maximo' => 10,
            'estado' => 'Activo',
        ]);
    }

    public function test_cliente_sin_membresia_no_puede_reservar(): void
    {
        $this->expectException(ValidationException::class);
        $this->reservar();
    }

    public function test_plan_sin_beneficio_de_reserva_bloquea_la_clase(): void
    {
        $this->crearMembresia(false);

        $this->expectException(ValidationException::class);
        $this->reservar();
    }

    public function test_cliente_con_plan_valido_puede_reservar_y_no_duplica(): void
    {
        $this->crearMembresia(true);

        $primera = $this->reservar();

        $this->assertSame(201, $primera->getStatusCode());
        $this->assertDatabaseCount('reservas', 1);

        try {
            $this->reservar();
            $this->fail('La segunda reserva duplicada debió ser rechazada.');
        } catch (ValidationException $e) {
            $this->assertDatabaseCount('reservas', 1);
        }
    }

    private function reservar()
    {
        $fecha = Carbon::now()->next(Carbon::MONDAY)->toDateString();

        $request = Request::create('/api/mi-cuenta/reservas', 'POST', [
            'id_clase' => 1,
            'fecha_clase' => $fecha,
        ]);

        $usuario = Usuario::findOrFail(1);
        $request->setUserResolver(fn () => $usuario);

        return app(ReservaController::class)->reservar($request);
    }

    private function crearMembresia(bool $permiteReservas): void
    {
        DB::table('membresias')->insert([
            'id_membresia' => 1,
            'nombre' => 'Plan prueba',
            'duracion_meses' => 1,
            'precio' => 100,
            'beneficios' => json_encode(['Acceso al gimnasio']),
            'permite_reservas' => $permiteReservas,
            'estado' => 'Activo',
        ]);

        DB::table('cliente_membresia')->insert([
            'id_cliente_membresia' => 1,
            'id_cliente' => 1,
            'id_membresia' => 1,
            'fecha_inicio' => today()->toDateString(),
            'fecha_fin' => today()->addMonths(2)->toDateString(),
            'estado' => 'Activo',
        ]);
    }
}
