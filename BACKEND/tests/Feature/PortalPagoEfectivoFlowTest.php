<?php

namespace Tests\Feature;

use App\Http\Controllers\SolicitudPagoMembresiaController;
use App\Models\Usuario;
use App\Services\ComprobanteMembresiaService;
use App\Services\CajaService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class PortalPagoEfectivoFlowTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        foreach (['movimientos_caja', 'cajas', 'pagos_membresia', 'cliente_membresia', 'membresias', 'usuarios', 'clientes'] as $tabla) {
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

        DB::table('clientes')->insert([
            'id_cliente' => 1,
            'dni' => '70000111',
            'nombres' => 'Cliente',
            'apellidos' => 'Efectivo',
            'estado' => 'Activo',
        ]);

        DB::table('usuarios')->insert([
            'id_usuario' => 1,
            'nombre_usuario' => 'cliente.efectivo',
            'contrasena' => bcrypt('Password123'),
            'nombres' => 'Cliente',
            'apellidos' => 'Efectivo',
            'dni' => '70000111',
            'correo' => 'efectivo@test.local',
            'rol' => 'Cliente',
            'estado' => 'Activo',
            'id_cliente' => 1,
            'fecha_registro' => now(),
        ]);

        DB::table('usuarios')->insert([
            'id_usuario' => 2,
            'nombre_usuario' => 'admin.efectivo',
            'contrasena' => bcrypt('Password123'),
            'nombres' => 'Admin',
            'apellidos' => 'Caja',
            'dni' => '70000112',
            'correo' => 'admin.efectivo@test.local',
            'rol' => 'Administrador',
            'estado' => 'Activo',
            'id_cliente' => null,
            'fecha_registro' => now(),
        ]);

        DB::table('membresias')->insert([
            'id_membresia' => 1,
            'nombre' => 'Mensual',
            'duracion_meses' => 1,
            'precio' => 100,
            'estado' => 'Activo',
        ]);
    }

    public function test_efectivo_crea_solicitud_pendiente_sin_numero_de_operacion(): void
    {
        $response = $this->comprarEfectivo();

        $this->assertSame(201, $response->getStatusCode());
        $data = $response->getData(true);
        $this->assertSame('Pendiente', $data['pago']['estado_pago']);
        $this->assertNull($data['pago']['numero_operacion']);
        $this->assertNull($data['comprobante']);

        $this->assertDatabaseHas('cliente_membresia', [
            'id_cliente' => 1,
            'estado' => 'PendientePago',
        ]);
        $this->assertDatabaseHas('pagos_membresia', [
            'metodo_pago' => 'Efectivo',
            'estado_pago' => 'Pendiente',
        ]);
    }

    public function test_cliente_puede_cancelar_efectivo_pendiente_y_recepcion_puede_confirmarlo(): void
    {
        $response = $this->comprarEfectivo();
        $idPago = (int) $response->getData(true)['pago']['id_pago'];

        $requestCancelar = Request::create('/api/mi-cuenta/pagos/'.$idPago.'/cancelar', 'POST');
        $requestCancelar->setUserResolver(fn () => Usuario::findOrFail(1));
        app(SolicitudPagoMembresiaController::class)->cancelarPropia($requestCancelar, (string) $idPago);

        $this->assertDatabaseHas('pagos_membresia', ['id_pago' => $idPago, 'estado_pago' => 'Cancelado']);
        $this->assertDatabaseHas('cliente_membresia', ['id_cliente' => 1, 'estado' => 'Cancelado']);

        $response2 = $this->comprarEfectivo();
        $idPago2 = (int) $response2->getData(true)['pago']['id_pago'];

        DB::table('cajas')->insert([
            'id_caja' => 1,
            'id_usuario_apertura' => 2,
            'fecha_apertura' => now(),
            'monto_inicial' => 50,
            'estado' => 'Abierta',
        ]);

        $requestConfirmar = Request::create('/api/pagos-membresia/'.$idPago2.'/confirmar', 'POST');
        $requestConfirmar->setUserResolver(fn () => Usuario::findOrFail(2));
        app(SolicitudPagoMembresiaController::class)->confirmar(
            $requestConfirmar,
            (string) $idPago2,
            app(CajaService::class)
        );

        $this->assertDatabaseHas('pagos_membresia', ['id_pago' => $idPago2, 'estado_pago' => 'Completado']);
        $this->assertDatabaseHas('cliente_membresia', ['id_cliente' => 1, 'estado' => 'Activo']);
        $this->assertDatabaseHas('movimientos_caja', [
            'id_usuario' => 2,
            'tipo' => 'Ingreso',
            'origen' => 'Membresia',
            'referencia_tipo' => 'PagoMembresia',
            'referencia_id' => $idPago2,
            'monto' => 100.00,
        ]);
    }

    private function comprarEfectivo()
    {
        $request = Request::create('/api/mi-cuenta/pagos/comprar', 'POST', [
            'id_membresia' => 1,
            'fecha_inicio' => today()->toDateString(),
            'metodo_pago' => 'Efectivo',
            'numero_operacion' => '',
        ]);
        $request->setUserResolver(fn () => Usuario::findOrFail(1));

        return app(SolicitudPagoMembresiaController::class)
            ->comprar($request, app(ComprobanteMembresiaService::class));
    }
}
