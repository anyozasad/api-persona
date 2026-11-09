<?php

namespace Tests\Feature;

use App\Http\Controllers\GymSystemAdminController;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class KardexLegacyRealTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::disableForeignKeyConstraints();
        try {
            foreach (['movimientos_inventario', 'productos', 'clientes'] as $tabla) {
                Schema::dropIfExists($tabla);
            }
        } finally {
            Schema::enableForeignKeyConstraints();
        }

        Schema::create('clientes', function (Blueprint $t) {
            $t->id('id_cliente');
        });
        Schema::create('productos', function (Blueprint $t) {
            $t->id('id_producto');
            $t->string('nombre_producto');
            $t->integer('stock')->default(0);
        });
        Schema::create('movimientos_inventario', function (Blueprint $t) {
            $t->id('id_movimiento_inventario');
            $t->unsignedBigInteger('id_producto');
            $t->unsignedBigInteger('id_usuario')->nullable();
            $t->string('tipo');
            $t->string('origen')->nullable();
            $t->integer('cantidad');
            $t->integer('stock_anterior');
            $t->integer('stock_nuevo');
            $t->dateTime('fecha_movimiento');
        });
    }

    public function test_kardex_antiguo_devuelve_movimientos_verdaderos_de_la_misma_bd(): void
    {
        DB::table('productos')->insert([
            'id_producto'=>1,'nombre_producto'=>'Proteína de prueba','stock'=>12,
        ]);
        DB::table('movimientos_inventario')->insert([
            'id_movimiento_inventario'=>1,
            'id_producto'=>1,
            'id_usuario'=>null,
            'tipo'=>'Entrada',
            'origen'=>'Compra',
            'cantidad'=>12,
            'stock_anterior'=>0,
            'stock_nuevo'=>12,
            'fecha_movimiento'=>now(),
        ]);

        $respuesta=app(GymSystemAdminController::class)->kardex(
            Request::create('/api/gym-admin/kardex', 'GET')
        );

        $this->assertSame(200, $respuesta->getStatusCode());
        $data=$respuesta->getData(true);
        $this->assertCount(1, $data);
        $this->assertSame(12, $data[0]['stock_nuevo']);
        $this->assertSame('Proteína de prueba', $data[0]['producto']['nombre_producto']);
    }

    public function test_kardex_sin_tabla_avisa_el_error_en_vez_de_inventar_cero_registros(): void
    {
        Schema::dropIfExists('movimientos_inventario');
        $respuesta=app(GymSystemAdminController::class)->kardex(
            Request::create('/api/gym-admin/kardex', 'GET')
        );

        $this->assertSame(503, $respuesta->getStatusCode());
        $this->assertStringContainsString('No está disponible', $respuesta->getData(true)['mensaje']);
    }
}
