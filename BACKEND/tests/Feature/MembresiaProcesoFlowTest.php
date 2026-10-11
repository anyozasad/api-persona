<?php

namespace Tests\Feature;

use App\Http\Middleware\AuditLogMiddleware;
use App\Models\Usuario;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class MembresiaProcesoFlowTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(AuditLogMiddleware::class);

        foreach ([
            'movimientos_caja','cajas','pagos_membresia','cliente_membresia',
            'membresias','clientes','usuarios'
        ] as $tabla) {
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

        Schema::create('membresias', function (Blueprint $table) {
            $table->id('id_membresia');
            $table->string('nombre');
            $table->unsignedInteger('duracion_meses');
            $table->decimal('precio', 10, 2);
            $table->text('descripcion')->nullable();
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

        Schema::create('pagos_membresia', function (Blueprint $table) {
            $table->id('id_pago');
            $table->unsignedBigInteger('id_cliente_membresia');
            $table->dateTime('fecha_pago');
            $table->decimal('monto', 10, 2);
            $table->string('metodo_pago');
            $table->string('numero_operacion')->nullable();
            $table->text('observacion')->nullable();
            $table->string('estado_pago');
        });

        Schema::create('cajas', function (Blueprint $table) {
            $table->id('id_caja');
            $table->unsignedBigInteger('id_usuario_apertura');
            $table->dateTime('fecha_apertura');
            $table->decimal('monto_inicial', 10, 2);
            $table->dateTime('fecha_cierre')->nullable();
            $table->decimal('monto_esperado', 10, 2)->nullable();
            $table->decimal('monto_real', 10, 2)->nullable();
            $table->decimal('diferencia', 10, 2)->nullable();
            $table->string('estado');
            $table->text('observacion')->nullable();
        });

        Schema::create('movimientos_caja', function (Blueprint $table) {
            $table->id('id_movimiento');
            $table->unsignedBigInteger('id_caja');
            $table->unsignedBigInteger('id_usuario');
            $table->string('tipo');
            $table->string('origen');
            $table->string('referencia_tipo')->nullable();
            $table->unsignedBigInteger('referencia_id')->nullable();
            $table->string('descripcion');
            $table->decimal('monto', 10, 2);
            $table->dateTime('fecha_movimiento');
            $table->string('estado');
        });

        DB::table('usuarios')->insert([
            'id_usuario' => 1,
            'nombre_usuario' => 'admin.membresia',
            'contrasena' => bcrypt('Password123'),
            'nombres' => 'Admin',
            'apellidos' => 'Membresia',
            'dni' => '79999961',
            'correo' => 'membresia@mallqui.test',
            'rol' => 'Administrador',
            'estado' => 'Activo',
            'fecha_registro' => now(),
        ]);

        DB::table('clientes')->insert([
            'id_cliente' => 1,
            'dni' => '70000061',
            'nombres' => 'Cliente',
            'apellidos' => 'Membresia',
            'estado' => 'Activo',
        ]);

        DB::table('membresias')->insert([
            'id_membresia' => 1,
            'nombre' => 'Mensual',
            'duracion_meses' => 1,
            'precio' => 100,
            'beneficios' => json_encode(['Acceso al gimnasio']),
            'permite_reservas' => true,
            'estado' => 'Activo',
        ]);

        $this->actingAs(Usuario::findOrFail(1), 'sanctum');
    }

    public function test_no_cobra_membresia_en_recepcion_sin_caja_abierta(): void
    {
        $this->postJson('/api/membresias/contratar', [
            'id_cliente' => 1,
            'id_membresia' => 1,
            'metodo_pago' => 'Efectivo',
        ])->assertStatus(422)->assertJsonValidationErrors(['caja']);
    }

    public function test_contratar_membresia_crea_periodo_pago_y_movimiento_de_caja(): void
    {
        $this->abrirCaja();

        $this->postJson('/api/membresias/contratar', [
            'id_cliente' => 1,
            'id_membresia' => 1,
            'metodo_pago' => 'Efectivo',
        ])->assertCreated()
          ->assertJsonPath('pago.estado_pago', 'Completado')
          ->assertJsonPath('pago.monto', '100.00');

        $this->assertDatabaseHas('cliente_membresia', [
            'id_cliente' => 1,
            'id_membresia' => 1,
            'estado' => 'Activo',
        ]);

        $this->assertDatabaseHas('movimientos_caja', [
            'tipo' => 'Ingreso',
            'origen' => 'Membresia',
            'monto' => 100.00,
        ]);
    }

    public function test_cliente_con_membresia_vigente_debe_usar_renovacion(): void
    {
        $this->abrirCaja();

        $this->postJson('/api/membresias/contratar', [
            'id_cliente' => 1,
            'id_membresia' => 1,
            'metodo_pago' => 'Efectivo',
        ])->assertCreated();

        $this->postJson('/api/membresias/contratar', [
            'id_cliente' => 1,
            'id_membresia' => 1,
            'metodo_pago' => 'Efectivo',
        ])->assertStatus(422)->assertJsonValidationErrors(['id_cliente']);

        $this->assertDatabaseCount('cliente_membresia', 1);
    }

    public function test_renovacion_extiende_periodo_y_registra_nuevo_pago(): void
    {
        $this->abrirCaja();

        $relacionId = (int) $this->postJson('/api/membresias/contratar', [
            'id_cliente' => 1,
            'id_membresia' => 1,
            'metodo_pago' => 'Efectivo',
        ])->assertCreated()->json('membresia_cliente.id_cliente_membresia');

        $finAntes = DB::table('cliente_membresia')->where('id_cliente_membresia', $relacionId)->value('fecha_fin');

        $this->postJson('/api/membresias/renovar', [
            'id_cliente_membresia' => $relacionId,
            'metodo_pago' => 'Efectivo',
        ])->assertOk()
          ->assertJsonPath('pago.estado_pago', 'Completado');

        $finDespues = DB::table('cliente_membresia')->where('id_cliente_membresia', $relacionId)->value('fecha_fin');

        $this->assertGreaterThan($finAntes, $finDespues);
        $this->assertDatabaseCount('pagos_membresia', 2);
    }

    public function test_pago_digital_exige_numero_de_operacion(): void
    {
        $this->abrirCaja();

        $this->postJson('/api/membresias/contratar', [
            'id_cliente' => 1,
            'id_membresia' => 1,
            'metodo_pago' => 'Yape',
        ])->assertStatus(422)->assertJsonValidationErrors(['numero_operacion']);
    }

    private function abrirCaja(): void
    {
        $this->postJson('/api/caja/abrir', [
            'monto_inicial' => 50,
            'observacion' => 'Caja para membresías',
        ])->assertCreated();
    }
}
