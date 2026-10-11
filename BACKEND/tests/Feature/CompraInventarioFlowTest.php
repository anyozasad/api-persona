<?php

namespace Tests\Feature;

use App\Http\Middleware\AuditLogMiddleware;
use App\Models\Usuario;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class CompraInventarioFlowTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(AuditLogMiddleware::class);

        foreach ([
            'movimientos_inventario','detalle_compra','compras','productos','proveedores','usuarios'
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

        Schema::create('proveedores', function (Blueprint $table) {
            $table->id('id_proveedor');
            $table->string('ruc')->nullable();
            $table->string('razon_social');
            $table->string('contacto')->nullable();
            $table->string('telefono')->nullable();
            $table->string('correo')->nullable();
            $table->string('direccion')->nullable();
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

        Schema::create('compras', function (Blueprint $table) {
            $table->id('id_compra');
            $table->unsignedBigInteger('id_proveedor');
            $table->unsignedBigInteger('id_usuario');
            $table->dateTime('fecha_compra');
            $table->string('tipo_comprobante');
            $table->string('numero_comprobante')->unique();
            $table->decimal('total', 10, 2);
            $table->string('estado');
        });

        Schema::create('detalle_compra', function (Blueprint $table) {
            $table->id('id_detalle_compra');
            $table->unsignedBigInteger('id_compra');
            $table->unsignedBigInteger('id_producto');
            $table->unsignedInteger('cantidad');
            $table->decimal('precio_compra', 10, 2);
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
            'nombre_usuario' => 'admin.compras',
            'contrasena' => bcrypt('Password123'),
            'nombres' => 'Admin',
            'apellidos' => 'Compras',
            'dni' => '79999971',
            'correo' => 'compras@mallqui.test',
            'rol' => 'Administrador',
            'estado' => 'Activo',
            'fecha_registro' => now(),
        ]);

        DB::table('proveedores')->insert([
            'id_proveedor' => 1,
            'ruc' => '20123456781',
            'razon_social' => 'Proveedor Prueba SAC',
            'estado' => 'Activo',
        ]);

        DB::table('productos')->insert([
            'id_producto' => 1,
            'codigo_producto' => 'COMPRA-001',
            'nombre_producto' => 'Proteína de prueba',
            'precio_compra' => 50,
            'precio_venta' => 80,
            'stock' => 5,
            'stock_minimo' => 2,
            'unidad_medida' => 'Unidad',
            'fecha_registro' => now(),
            'estado' => 'Activo',
        ]);

        $this->actingAs(Usuario::findOrFail(1), 'sanctum');
    }

    public function test_registrar_compra_incrementa_stock_actualiza_costo_y_crea_kardex(): void
    {
        $this->postJson('/api/compras', [
            'id_proveedor' => 1,
            'tipo_comprobante' => 'Factura',
            'numero_comprobante' => 'F001-0001',
            'items' => [
                ['id_producto' => 1, 'cantidad' => 3, 'precio_compra' => 55],
            ],
        ])->assertCreated()
          ->assertJsonPath('compra.total', '165.00');

        $this->assertDatabaseHas('productos', [
            'id_producto' => 1,
            'stock' => 8,
            'precio_compra' => 55.00,
        ]);

        $this->assertDatabaseHas('movimientos_inventario', [
            'id_producto' => 1,
            'tipo' => 'Entrada',
            'origen' => 'Compra',
            'cantidad' => 3,
            'stock_anterior' => 5,
            'stock_nuevo' => 8,
        ]);
    }

    public function test_anular_compra_revierte_stock_y_kardex(): void
    {
        $id = (int) $this->postJson('/api/compras', [
            'id_proveedor' => 1,
            'tipo_comprobante' => 'Factura',
            'numero_comprobante' => 'F001-0002',
            'items' => [
                ['id_producto' => 1, 'cantidad' => 2, 'precio_compra' => 52],
            ],
        ])->assertCreated()->json('compra.id_compra');

        $this->postJson("/api/compras/{$id}/anular")
            ->assertOk()
            ->assertJsonPath('compra.estado', 'Anulado');

        $this->assertDatabaseHas('productos', ['id_producto' => 1, 'stock' => 5]);
        $this->assertDatabaseHas('movimientos_inventario', [
            'id_producto' => 1,
            'tipo' => 'Salida',
            'origen' => 'AnulacionCompra',
            'cantidad' => 2,
        ]);
    }
}
