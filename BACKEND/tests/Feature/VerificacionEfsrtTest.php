<?php

namespace Tests\Feature;

use App\Http\Controllers\VerificacionEfsrtController;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class VerificacionEfsrtTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        foreach (['reservas','productos','clientes'] as $tabla) {
            Schema::dropIfExists($tabla);
        }

        Schema::create('clientes', function (Blueprint $tabla) {
            $tabla->id('id_cliente');
            $tabla->string('dni');
        });
        Schema::create('reservas', function (Blueprint $tabla) {
            $tabla->id('id_reserva');
            $tabla->unsignedBigInteger('id_cliente');
            $tabla->unsignedBigInteger('id_clase');
            $tabla->date('fecha_clase');
            $tabla->string('estado');
        });
        Schema::create('productos', function (Blueprint $tabla) {
            $tabla->id('id_producto');
            $tabla->integer('stock');
        });
    }

    public function test_lee_registros_reales_y_no_marca_todas_las_areas_como_terminadas(): void
    {
        DB::table('clientes')->insert(['id_cliente'=>1, 'dni'=>'70123456']);
        DB::table('reservas')->insert([
            'id_reserva'=>1, 'id_cliente'=>1, 'id_clase'=>1,
            'fecha_clase'=>'2026-12-07', 'estado'=>'Reservada',
        ]);

        $respuesta=app(VerificacionEfsrtController::class)->index();

        $this->assertSame(200, $respuesta->getStatusCode());
        $datos=$respuesta->getData(true);
        $this->assertSame('disponible', $datos['conexion']);
        $this->assertSame(10, $datos['total_modulos']);
        $this->assertCount(10, $datos['modulos']);

        $socios=collect($datos['modulos'])->firstWhere('id','socios');
        $this->assertSame(1, $socios['registros']);
        $this->assertContains('membresias', $socios['faltantes']);
        $this->assertSame('estructura_incompleta', $socios['estado']);
    }

    public function test_muestra_duplicados_en_reservas_y_stock_negativo(): void
    {
        DB::table('clientes')->insert([
            ['id_cliente'=>1,'dni'=>'70123456'],
            ['id_cliente'=>2,'dni'=>'70123456'],
        ]);

        DB::table('reservas')->insert([
            ['id_reserva'=>1,'id_cliente'=>1,'id_clase'=>1,'fecha_clase'=>'2026-12-07','estado'=>'Reservada'],
            ['id_reserva'=>2,'id_cliente'=>1,'id_clase'=>1,'fecha_clase'=>'2026-12-07','estado'=>'Reservada'],
        ]);
        DB::table('productos')->insert(['id_producto'=>1,'stock'=>-3]);

        $respuesta=app(VerificacionEfsrtController::class)->index();
        $this->assertSame(200, $respuesta->getStatusCode());
        $alertas=collect($respuesta->getData(true)['alertas']);

        $this->assertSame(1, $alertas->firstWhere('tipo','duplicados_clientes')['cantidad']);
        $this->assertSame(1, $alertas->firstWhere('tipo','reservas_duplicadas')['cantidad']);
        $this->assertSame(1, $alertas->firstWhere('tipo','stock_negativo')['cantidad']);
    }

    public function test_un_usuario_no_autenticado_no_puede_abrir_el_diagnostico(): void
    {
        $respuesta=$this->getJson('/api/admin/verificacion-efsrt');
        $respuesta->assertStatus(401);
    }
}
