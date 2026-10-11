<?php

namespace Tests\Feature;

use App\Http\Middleware\AuditLogMiddleware;
use App\Models\Usuario;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class CajaVentaInventarioFlowTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(AuditLogMiddleware::class);

        foreach ([
            'movimientos_inventario','detalle_venta','ventas','movimientos_caja','cajas',
            'productos','clientes','usuarios'
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

        Schema::create('productos', function (Blueprint $table) {
            $table->id('id_producto');
            $table->unsignedBigInteger('id_categoria')->nullable();
            $table->string('codigo_producto')->unique();
            $table->string('nombre_producto');
            $table->text('descripcion')->nullable();
            $table->decimal('precio_compra', 10, 2)->default(0);
            $table->decimal('precio_venta', 10, 2);
            $table->unsignedInteger('stock')->default(0);
            $table->unsignedInteger('stock_minimo')->default(0);
            $table->string('unidad_medida')->default('Unidad');
            $table->dateTime('fecha_registro')->nullable();
            $table->string('estado')->default('Activo');
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

        Schema::create('ventas', function (Blueprint $table) {
            $table->id('id_venta');
            $table->unsignedBigInteger('id_cliente');
            $table->unsignedBigInteger('id_usuario');
            $table->dateTime('fecha_venta');
            $table->string('tipo_comprobante');
            $table->string('numero_comprobante')->unique();
            $table->string('metodo_pago');
            $table->string('numero_operacion')->nullable()->unique();
            $table->decimal('subtotal', 10, 2);
            $table->decimal('igv', 10, 2);
            $table->decimal('total', 10, 2);
            $table->string('estado');
            $table->dateTime('fecha_anulacion')->nullable();
            $table->text('motivo_anulacion')->nullable();
            $table->unsignedBigInteger('id_usuario_anulacion')->nullable();
        });

        Schema::create('detalle_venta', function (Blueprint $table) {
            $table->id('id_detalle_venta');
            $table->unsignedBigInteger('id_venta');
            $table->unsignedBigInteger('id_producto');
            $table->unsignedInteger('cantidad');
            $table->decimal('precio_unitario', 10, 2);
            $table->decimal('subtotal', 10, 2);
        });

        Schema::create('movimientos_inventario', function (Blueprint $table) {
            $table->id('id_movimiento_inventario');
            $table->unsignedBigInteger('id_producto');
            $table->unsignedBigInteger('id_usuario')->nullable();
            $table->string('tipo');
            $table->string('origen');
            $table->string('referencia_tipo')->nullable();
            $table->unsignedBigInteger('referencia_id')->nullable();
            $table->unsignedInteger('cantidad');
            $table->unsignedInteger('stock_anterior');
            $table->unsignedInteger('stock_nuevo');
            $table->text('observacion')->nullable();
            $table->dateTime('fecha_movimiento');
        });

        DB::table('usuarios')->insert([
            'id_usuario' => 1,
            'nombre_usuario' => 'admin.caja',
            'contrasena' => bcrypt('Password123'),
            'nombres' => 'Admin',
            'apellidos' => 'Caja',
            'dni' => '79999981',
            'correo' => 'caja@mallqui.test',
            'rol' => 'Administrador',
            'estado' => 'Activo',
            'fecha_registro' => now(),
        ]);

        DB::table('clientes')->insert([
            'id_cliente' => 1,
            'dni' => '70000081',
            'nombres' => 'Cliente',
            'apellidos' => 'Venta',
            'estado' => 'Activo',
        ]);

        DB::table('productos')->insert([
            'id_producto' => 1,
            'codigo_producto' => 'PROD-VENTA-1',
            'nombre_producto' => 'Bebida deportiva',
            'precio_compra' => 5,
            'precio_venta' => 10,
            'stock' => 10,
            'stock_minimo' => 2,
            'unidad_medida' => 'Unidad',
            'fecha_registro' => now(),
            'estado' => 'Activo',
        ]);

        $this->actingAs(Usuario::findOrFail(1), 'sanctum');
    }

    public function test_no_permite_vender_sin_caja_abierta(): void
    {
        $this->postJson('/api/ventas', $this->ventaPayload())
            ->assertStatus(422)
            ->assertJsonValidationErrors(['caja']);

        $this->assertDatabaseCount('ventas', 0);
        $this->assertDatabaseHas('productos', ['id_producto' => 1, 'stock' => 10]);
    }

    public function test_venta_efectivo_descuenta_stock_crea_kardex_y_movimiento_de_caja(): void
    {
        $this->abrirCaja();

        $venta = $this->postJson('/api/ventas', $this->ventaPayload())
            ->assertCreated()
            ->assertJsonPath('venta.total', '20.00')
            ->json('venta');

        $this->assertDatabaseHas('productos', ['id_producto' => 1, 'stock' => 8]);
        $this->assertDatabaseHas('movimientos_inventario', [
            'id_producto' => 1,
            'tipo' => 'Salida',
            'origen' => 'Venta',
            'cantidad' => 2,
            'stock_anterior' => 10,
            'stock_nuevo' => 8,
        ]);
        $this->assertDatabaseHas('movimientos_caja', [
            'tipo' => 'Ingreso',
            'origen' => 'Venta',
            'monto' => 20.00,
            'estado' => 'Registrado',
        ]);
        $this->assertSame(1, (int) $venta['id_venta']);
    }

    public function test_anular_venta_restaura_stock_y_registra_devolucion(): void
    {
        $this->abrirCaja();

        $id = (int) $this->postJson('/api/ventas', $this->ventaPayload())
            ->assertCreated()
            ->json('venta.id_venta');

        $this->postJson("/api/ventas/{$id}/anular", ['motivo' => 'Error de registro'])
            ->assertOk()
            ->assertJsonPath('venta.estado', 'Anulado');

        $this->assertDatabaseHas('productos', ['id_producto' => 1, 'stock' => 10]);
        $this->assertDatabaseHas('movimientos_inventario', [
            'id_producto' => 1,
            'tipo' => 'Entrada',
            'origen' => 'AnulacionVenta',
            'cantidad' => 2,
        ]);
        $this->assertDatabaseHas('movimientos_caja', [
            'tipo' => 'Egreso',
            'origen' => 'AnulacionVenta',
            'monto' => 20.00,
        ]);
    }

    public function test_cierre_de_caja_calcula_monto_esperado_y_diferencia(): void
    {
        $this->abrirCaja(100);
        $this->postJson('/api/ventas', $this->ventaPayload())->assertCreated();

        $this->postJson('/api/caja/cerrar', [
            'monto_real' => 120,
            'observacion' => 'Cierre sin diferencia',
        ])->assertOk()
          ->assertJsonPath('caja.estado', 'Cerrada')
          ->assertJsonPath('caja.monto_esperado', '120.00')
          ->assertJsonPath('caja.diferencia', '0.00');

        $this->assertDatabaseHas('cajas', [
            'estado' => 'Cerrada',
            'monto_esperado' => 120.00,
            'monto_real' => 120.00,
            'diferencia' => 0.00,
        ]);
    }

    private function abrirCaja(float $monto = 100): void
    {
        $this->postJson('/api/caja/abrir', [
            'monto_inicial' => $monto,
            'observacion' => 'Caja de prueba',
        ])->assertCreated();
    }

    private function ventaPayload(): array
    {
        return [
            'id_cliente' => 1,
            'tipo_comprobante' => 'Boleta',
            'numero_comprobante' => 'B001-TEST-001',
            'metodo_pago' => 'Efectivo',
            'items' => [
                ['id_producto' => 1, 'cantidad' => 2],
            ],
        ];
    }
}
