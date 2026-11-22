<?php

namespace Tests\Feature;

use App\Http\Controllers\GymSystemAdminController;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class AdminAdvancedCoreSchemaTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        foreach (['pagos_membresia','progreso_medidas','rutinas','cliente_membresia','membresias','clientes','configuracion_sistema'] as $tabla) {
            Schema::dropIfExists($tabla);
        }

        Schema::create('clientes', function (Blueprint $table) {
            $table->id('id_cliente');
            $table->string('dni')->unique();
            $table->string('nombres');
            $table->string('apellidos');
            $table->string('telefono')->nullable();
            $table->string('correo')->nullable();
            $table->string('estado')->default('Activo');
            $table->string('whatsapp_api_key')->nullable();
        });

        Schema::create('membresias', function (Blueprint $table) {
            $table->id('id_membresia');
            $table->string('nombre');
            $table->unsignedInteger('duracion_meses')->default(1);
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

        Schema::create('pagos_membresia', function (Blueprint $table) {
            $table->id('id_pago');
            $table->unsignedBigInteger('id_cliente_membresia');
            $table->dateTime('fecha_pago');
            $table->decimal('monto', 10, 2);
            $table->string('metodo_pago');
            $table->string('numero_operacion')->nullable();
            $table->string('estado_pago');
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
            $table->string('estado')->default('Activo');
        });

        Schema::create('progreso_medidas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_cliente');
            $table->decimal('peso', 7, 2)->nullable();
            $table->decimal('grasa', 6, 2)->nullable();
            $table->decimal('cintura', 7, 2)->nullable();
            $table->decimal('brazo', 7, 2)->nullable();
            $table->date('fecha');
            $table->dateTime('created_at')->nullable();
        });

        Schema::create('configuracion_sistema', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_gimnasio')->default('Mallqui Gym');
        });

        DB::table('clientes')->insert([
            'id_cliente' => 1,
            'dni' => '70000091',
            'nombres' => 'Socio',
            'apellidos' => 'Actual',
            'telefono' => '999999999',
            'correo' => 'socio@mallqui.test',
            'estado' => 'Activo',
        ]);

        DB::table('membresias')->insert([
            'id_membresia' => 1,
            'nombre' => 'Mensualidad',
            'duracion_meses' => 1,
            'precio' => 80,
            'estado' => 'Activo',
        ]);

        DB::table('cliente_membresia')->insert([
            'id_cliente_membresia' => 1,
            'id_cliente' => 1,
            'id_membresia' => 1,
            'fecha_inicio' => today()->subDays(20)->toDateString(),
            'fecha_fin' => today()->addDays(5)->toDateString(),
            'estado' => 'Activo',
        ]);

        // El comprobante solo debe existir si hay pago confirmado.
        DB::table('pagos_membresia')->insert([
            'id_pago' => 1,
            'id_cliente_membresia' => 1,
            'fecha_pago' => now(),
            'monto' => 80,
            'metodo_pago' => 'Yape',
            'numero_operacion' => 'OP-VALIDADA-01',
            'estado_pago' => 'Completado',
        ]);

        DB::table('rutinas')->insert([
            'id_rutina' => 1,
            'id_cliente' => 1,
            'id_entrenador' => null,
            'nombre_rutina' => 'Rutina actual',
            'objetivo' => 'Fuerza',
            'descripcion' => 'Rutina sincronizada',
            'fecha_inicio' => today()->toDateString(),
            'estado' => 'Activo',
        ]);

        DB::table('configuracion_sistema')->insert([
            'id' => 1,
            'nombre_gimnasio' => 'Mallqui Gym',
        ]);
    }

    public function test_progreso_usa_cliente_y_rutina_del_esquema_actual(): void
    {
        $controller = app(GymSystemAdminController::class);

        $request = Request::create('/api/gym-admin/progreso/medidas', 'POST', [
            'socio_id' => 1,
            'peso' => 70.5,
            'grasa' => 18.2,
            'cintura' => 82,
            'brazo' => 34,
            'fecha' => today()->toDateString(),
        ]);

        $controller->guardarMedida($request);

        $json = $controller->progreso('1')->getData(true);

        $this->assertSame(1, $json['socio']['id_cliente']);
        $this->assertSame('Socio Actual', $json['socio']['nombre']);
        $this->assertSame('Rutina actual', $json['rutina']['nombre_rutina']);
        $this->assertSame('70.50', (string) $json['medidas'][0]['peso']);
    }

    public function test_progreso_muestra_medidas_reales_aunque_no_exista_tabla_rutinas(): void
    {
        $controller = app(GymSystemAdminController::class);
        $controller->guardarMedida(Request::create('/api/gym-admin/progreso/medidas', 'POST', [
            'socio_id' => 1, 'peso' => 72.5, 'fecha' => today()->toDateString(),
        ]));

        // Solo en la BD temporal de PHPUnit; la función debe manejar este
        // esquema incompleto sin devolver 500 ni perder mediciones.
        Schema::dropIfExists('rutinas');
        $respuesta = $controller->progreso('1');
        $this->assertSame(200, $respuesta->getStatusCode());
        $datos = $respuesta->getData(true);
        $this->assertNull($datos['rutina']);
        $this->assertSame('72.50', (string) $datos['medidas'][0]['peso']);
        $this->assertContains('tabla:rutinas', $datos['faltantes']);
    }

    public function test_progreso_detecta_mediciones_ausentes_antes_de_guardar(): void
    {
        Schema::dropIfExists('progreso_medidas');
        $respuesta = app(GymSystemAdminController::class)
            ->guardarMedida(Request::create('/api/gym-admin/progreso/medidas', 'POST', [
                'socio_id' => 1, 'peso' => 74.3, 'fecha' => today()->toDateString(),
            ]));

        $this->assertSame(503, $respuesta->getStatusCode());
        $this->assertSame('ESQUEMA_PROGRESO_INCOMPLETO', $respuesta->getData(true)['codigo']);
        $this->assertContains('tabla:progreso_medidas', $respuesta->getData(true)['faltantes']);
    }

    public function test_no_emite_comprobante_de_membresia_si_el_pago_no_fue_confirmado(): void
    {
        DB::table('pagos_membresia')->where('id_pago', 1)
            ->update(['estado_pago' => 'Pendiente']);

        try {
            app(GymSystemAdminController::class)->comprobante('1');
            $this->fail('No debe emitir una constancia de pago pendiente.');
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertSame(422, $e->getStatusCode());
        }
    }

    public function test_vencimientos_carnet_y_comprobante_usan_misma_membresia_actual(): void
    {
        $controller = app(GymSystemAdminController::class);

        $vencimientos = $controller
            ->vencimientosNotificacion(Request::create('/api/gym-admin/notificaciones/vencimientos', 'GET', ['dias' => 7]))
            ->getData(true);

        $this->assertCount(1, $vencimientos);
        $this->assertSame(1, $vencimientos[0]['id']);
        $this->assertSame('Mensualidad', $vencimientos[0]['nombre_plan']);

        $carnet = $controller->carnet('1')->getData(true);
        $this->assertSame('Socio Actual', $carnet['socio']['nombre']);
        $this->assertSame('Mensualidad', $carnet['suscripcion']['plan']);

        $comprobante = $controller->comprobante('1')->getData(true);
        $this->assertSame('Socio Actual', $comprobante['datos']['socio']);
        $this->assertSame('Mensualidad', $comprobante['datos']['plan']);
        $this->assertEquals(80.0, (float) $comprobante['datos']['precio']);
    }
}
