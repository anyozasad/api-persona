<?php

namespace Tests\Feature;

use App\Http\Controllers\SolicitudPagoMembresiaController;
use App\Models\Usuario;
use App\Services\ComprobanteMembresiaService;
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

        foreach (['pagos_membresia', 'cliente_membresia', 'membresias', 'usuarios', 'clientes'] as $tabla) {
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
        app(SolicitudPagoMembresiaController::class)->confirmar((string) $idPago2);

        $this->assertDatabaseHas('pagos_membresia', ['id_pago' => $idPago2, 'estado_pago' => 'Completado']);
        $this->assertDatabaseHas('cliente_membresia', ['id_cliente' => 1, 'estado' => 'Activo']);
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
