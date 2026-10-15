<?php

namespace Tests\Feature;

use App\Http\Controllers\PortalClienteController;
use App\Models\Usuario;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class EntrenamientoClienteFlowTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        foreach ([
            'detalle_sesion_entrenamiento',
            'sesiones_entrenamiento_casa',
            'detalle_rutina',
            'rutinas',
            'cliente_membresia',
            'membresias',
            'usuarios',
            'clientes',
        ] as $tabla) {
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

        Schema::create('rutinas', function (Blueprint $table) {
            $table->id('id_rutina');
            $table->unsignedBigInteger('id_cliente');
            $table->unsignedBigInteger('id_entrenador')->nullable();
            $table->string('nombre_rutina');
            $table->string('objetivo')->nullable();
            $table->text('descripcion')->nullable();
            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();
            $table->string('estado');
        });

        Schema::create('detalle_rutina', function (Blueprint $table) {
            $table->id('id_detalle_rutina');
            $table->unsignedBigInteger('id_rutina');
            $table->string('ejercicio');
            $table->unsignedInteger('series');
            $table->unsignedInteger('repeticiones');
            $table->decimal('peso_recomendado', 8, 2)->nullable();
            $table->unsignedInteger('descanso_segundos')->nullable();
            $table->text('observaciones')->nullable();
        });

        Schema::create('sesiones_entrenamiento_casa', function (Blueprint $table) {
            $table->bigIncrements('id_sesion_casa');
            $table->unsignedBigInteger('id_cliente');
            $table->unsignedBigInteger('id_rutina')->nullable();
            $table->string('zona');
            $table->dateTime('fecha');
            $table->unsignedInteger('duracion_segundos');
            $table->unsignedInteger('ejercicios_total');
            $table->unsignedInteger('ejercicios_completados');
            $table->string('estado');
            $table->timestamps();
        });

        Schema::create('detalle_sesion_entrenamiento', function (Blueprint $table) {
            $table->bigIncrements('id_detalle_sesion');
            $table->unsignedBigInteger('id_sesion_casa');
            $table->unsignedBigInteger('id_detalle_rutina');
            $table->unsignedInteger('series_realizadas');
            $table->unsignedInteger('repeticiones_realizadas');
            $table->decimal('peso_utilizado', 8, 2)->nullable();
            $table->boolean('completado');
            $table->timestamps();
        });

        DB::table('clientes')->insert([
            'id_cliente' => 1,
            'dni' => '70000001',
            'nombres' => 'Cliente',
            'apellidos' => 'Prueba',
            'estado' => 'Activo',
        ]);

        DB::table('usuarios')->insert([
            'id_usuario' => 1,
            'nombre_usuario' => 'cliente.test',
            'contrasena' => bcrypt('Password123'),
            'nombres' => 'Cliente',
            'apellidos' => 'Prueba',
            'dni' => '70000001',
            'correo' => 'cliente@test.local',
            'rol' => 'Cliente',
            'estado' => 'Activo',
            'id_cliente' => 1,
            'fecha_registro' => now(),
        ]);
    }

    public function test_no_guarda_entrenamiento_sin_membresia_vigente(): void
    {
        [$rutina, $detalle] = $this->crearRutina();

        $response = $this->registrarSesion($rutina, $detalle);

        $this->assertSame(422, $response->getStatusCode());
        $this->assertDatabaseCount('sesiones_entrenamiento_casa', 0);
    }

    public function test_no_guarda_entrenamiento_sin_rutina_activa_del_cliente(): void
    {
        $this->crearMembresia();
        [$rutina, $detalle] = $this->crearRutina('Finalizado');

        $response = $this->registrarSesion($rutina, $detalle);

        $this->assertSame(422, $response->getStatusCode());
        $this->assertDatabaseCount('sesiones_entrenamiento_casa', 0);
    }

    public function test_guarda_rutina_real_y_detalle_de_ejercicio(): void
    {
        $this->crearMembresia();
        [$rutina, $detalle] = $this->crearRutina();

        $response = $this->registrarSesion($rutina, $detalle);

        $this->assertSame(201, $response->getStatusCode());
        $this->assertDatabaseHas('sesiones_entrenamiento_casa', [
            'id_cliente' => 1,
            'id_rutina' => $rutina,
            'estado' => 'Completada',
        ]);
        $this->assertDatabaseHas('detalle_sesion_entrenamiento', [
            'id_detalle_rutina' => $detalle,
            'series_realizadas' => 3,
            'repeticiones_realizadas' => 12,
            'completado' => 1,
        ]);
    }

    public function test_sesion_se_crea_al_iniciar_y_guarda_series_antes_de_finalizar(): void
    {
        $this->crearMembresia();
        [$rutina, $detalle] = $this->crearRutina();

        $requestInicio = Request::create('/api/mi-cuenta/entrenamiento-gym/sesiones/iniciar', 'POST', [
            'id_rutina' => $rutina,
        ]);
        $usuario = Usuario::findOrFail(1);
        $requestInicio->setUserResolver(fn () => $usuario);

        $inicio = app(PortalClienteController::class)->iniciarSesionEntrenamientoCasa($requestInicio);
        $this->assertSame(201, $inicio->getStatusCode());

        $idSesion = (int) $inicio->getData(true)['sesion']['id_sesion_casa'];

        $this->assertDatabaseHas('sesiones_entrenamiento_casa', [
            'id_sesion_casa' => $idSesion,
            'estado' => 'EnCurso',
        ]);
        $this->assertDatabaseHas('detalle_sesion_entrenamiento', [
            'id_sesion_casa' => $idSesion,
            'id_detalle_rutina' => $detalle,
            'series_realizadas' => 0,
        ]);

        $requestProgreso = Request::create('/api/mi-cuenta/entrenamiento-gym/sesiones/'.$idSesion, 'PATCH', [
            'duracion_segundos' => 90,
            'id_detalle_rutina' => $detalle,
            'series_realizadas' => 1,
            'repeticiones_realizadas' => 12,
            'peso_utilizado' => 22.5,
            'completado' => false,
        ]);
        $requestProgreso->setUserResolver(fn () => $usuario);

        app(PortalClienteController::class)->actualizarSesionEntrenamientoCasa($requestProgreso, (string) $idSesion);

        $this->assertDatabaseHas('detalle_sesion_entrenamiento', [
            'id_sesion_casa' => $idSesion,
            'id_detalle_rutina' => $detalle,
            'series_realizadas' => 1,
            'repeticiones_realizadas' => 12,
            'peso_utilizado' => 22.50,
        ]);
    }

    public function test_pausa_cancelacion_y_finalizacion_se_guardan_en_base_de_datos(): void
    {
        $this->crearMembresia();
        [$rutina, $detalle] = $this->crearRutina();
        $usuario = Usuario::findOrFail(1);

        $requestInicio = Request::create('/api/mi-cuenta/entrenamiento-gym/sesiones/iniciar', 'POST', ['id_rutina' => $rutina]);
        $requestInicio->setUserResolver(fn () => $usuario);
        $inicio = app(PortalClienteController::class)->iniciarSesionEntrenamientoCasa($requestInicio);
        $idSesion = (int) $inicio->getData(true)['sesion']['id_sesion_casa'];

        $requestPausa = Request::create('/api/mi-cuenta/entrenamiento-gym/sesiones/'.$idSesion, 'PATCH', [
            'duracion_segundos' => 120,
            'estado' => 'Pausada',
        ]);
        $requestPausa->setUserResolver(fn () => $usuario);
        app(PortalClienteController::class)->actualizarSesionEntrenamientoCasa($requestPausa, (string) $idSesion);

        $this->assertDatabaseHas('sesiones_entrenamiento_casa', [
            'id_sesion_casa' => $idSesion,
            'estado' => 'Pausada',
            'duracion_segundos' => 120,
        ]);

        $requestFinal = Request::create('/api/mi-cuenta/entrenamiento-gym/sesiones', 'POST', [
            'id_sesion_casa' => $idSesion,
            'id_rutina' => $rutina,
            'duracion_segundos' => 600,
            'ejercicios' => [[
                'id_detalle_rutina' => $detalle,
                'series_realizadas' => 3,
                'repeticiones_realizadas' => 12,
                'peso_utilizado' => 25,
                'completado' => true,
            ]],
        ]);
        $requestFinal->setUserResolver(fn () => $usuario);
        app(PortalClienteController::class)->registrarSesionEntrenamientoCasa($requestFinal);

        $this->assertDatabaseCount('sesiones_entrenamiento_casa', 1);
        $this->assertDatabaseHas('sesiones_entrenamiento_casa', [
            'id_sesion_casa' => $idSesion,
            'estado' => 'Completada',
            'duracion_segundos' => 600,
        ]);

        $requestInicio2 = Request::create('/api/mi-cuenta/entrenamiento-gym/sesiones/iniciar', 'POST', ['id_rutina' => $rutina]);
        $requestInicio2->setUserResolver(fn () => $usuario);
        $inicio2 = app(PortalClienteController::class)->iniciarSesionEntrenamientoCasa($requestInicio2);
        $idSesion2 = (int) $inicio2->getData(true)['sesion']['id_sesion_casa'];

        $requestCancelar = Request::create('/api/mi-cuenta/entrenamiento-gym/sesiones/'.$idSesion2.'/cancelar', 'POST', [
            'duracion_segundos' => 45,
        ]);
        $requestCancelar->setUserResolver(fn () => $usuario);
        app(PortalClienteController::class)->cancelarSesionEntrenamientoCasa($requestCancelar, (string) $idSesion2);

        $this->assertDatabaseHas('sesiones_entrenamiento_casa', [
            'id_sesion_casa' => $idSesion2,
            'estado' => 'Cancelada',
            'duracion_segundos' => 45,
        ]);
    }

    private function registrarSesion(int $idRutina, int $idDetalle)
    {
        $request = Request::create('/api/mi-cuenta/entrenamiento-gym/sesiones', 'POST', [
            'id_rutina' => $idRutina,
            'duracion_segundos' => 1800,
            'ejercicios' => [[
                'id_detalle_rutina' => $idDetalle,
                'series_realizadas' => 3,
                'repeticiones_realizadas' => 12,
                'peso_utilizado' => 20,
                'completado' => true,
            ]],
        ]);

        $usuario = Usuario::findOrFail(1);
        $request->setUserResolver(fn () => $usuario);

        return app(PortalClienteController::class)->registrarSesionEntrenamientoCasa($request);
    }

    private function crearMembresia(): void
    {
        DB::table('membresias')->insert([
            'id_membresia' => 1,
            'nombre' => 'Premium',
            'duracion_meses' => 1,
            'precio' => 129,
            'estado' => 'Activo',
        ]);

        DB::table('cliente_membresia')->insert([
            'id_cliente_membresia' => 1,
            'id_cliente' => 1,
            'id_membresia' => 1,
            'fecha_inicio' => today()->subDay()->toDateString(),
            'fecha_fin' => today()->addMonth()->toDateString(),
            'estado' => 'Activo',
        ]);
    }

    private function crearRutina(string $estado = 'Activo'): array
    {
        $rutina = DB::table('rutinas')->insertGetId([
            'id_cliente' => 1,
            'id_entrenador' => null,
            'nombre_rutina' => 'Rutina funcional',
            'objetivo' => 'Fuerza',
            'fecha_inicio' => today()->subDay()->toDateString(),
            'fecha_fin' => today()->addMonth()->toDateString(),
            'estado' => $estado,
        ]);

        $detalle = DB::table('detalle_rutina')->insertGetId([
            'id_rutina' => $rutina,
            'ejercicio' => 'Press de banca',
            'series' => 3,
            'repeticiones' => 12,
            'peso_recomendado' => 20,
            'descanso_segundos' => 60,
        ]);

        return [$rutina, $detalle];
    }
}
