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

        Schema::disableForeignKeyConstraints();
        try {
            foreach (['reservas','productos','clientes','membresias'] as $tabla) {
                Schema::dropIfExists($tabla);
            }
        } finally {
            Schema::enableForeignKeyConstraints();
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

    public function test_verificacion_incluye_las_once_semanas_y_no_da_por_aprobado_lo_pendiente(): void
    {
        $respuesta = app(VerificacionEfsrtController::class)->index();
        $this->assertSame(200, $respuesta->getStatusCode());
        $datos = $respuesta->getData(true);

        $this->assertCount(11, $datos['semanas']);
        $this->assertSame(range(1, 11), array_column($datos['semanas'], 'semana'));
        $semana5 = collect($datos['semanas'])->firstWhere('semana', 5);
        $this->assertSame('pendiente', $semana5['estado']);
        $this->assertStringContainsString('columna foto', implode(' ', $semana5['observaciones']));

        $semana10 = collect($datos['semanas'])->firstWhere('semana', 10);
        $this->assertSame('pendiente', $semana10['estado']);
        $this->assertStringContainsString('SUNAT', implode(' ', $semana10['observaciones']));
    }

    public function test_cada_semana_revisa_cinco_actividades_de_la_bitacora_oficial(): void
    {
        $datos=app(VerificacionEfsrtController::class)->index()->getData(true);
        $this->assertCount(11,$datos['semanas']);
        $this->assertSame(55,array_sum(array_map(
            fn ($semana)=>count($semana['actividades']),$datos['semanas']
        )));

        $semana5=collect($datos['semanas'])->firstWhere('semana',5);
        $this->assertSame('Fotografía guardada y visible en productos',
            $semana5['actividades'][3]['actividad']);
        $this->assertSame('Imagen de producto',
            $semana5['actividades'][3]['evidencia']);

        $semana6=collect($datos['semanas'])->firstWhere('semana',6);
        $this->assertStringContainsString('nivel y tipo',
            $semana6['actividades'][2]['actividad']);

        $semana10=collect($datos['semanas'])->firstWhere('semana',10);
        $this->assertSame('programada_por_validar',
            $semana10['actividades'][1]['estado']);
        $this->assertSame('Boleta electrónica',
            $semana10['actividades'][1]['evidencia']);

        $semana11=collect($datos['semanas'])->firstWhere('semana',11);
        $this->assertSame('Documentación y respaldo',
            $semana11['actividades'][4]['evidencia']);
    }

    public function test_semana_cinco_detecta_fotografias_ausentes_de_productos_reales(): void
    {
        Schema::table('productos', function (Blueprint $tabla) {
            $tabla->mediumText('foto')->nullable();
        });
        DB::table('productos')->insert(['id_producto'=>1,'stock'=>6,'foto'=>null]);

        $datos = app(VerificacionEfsrtController::class)->index()->getData(true);
        $semana5 = collect($datos['semanas'])->firstWhere('semana', 5);
        $this->assertSame('pendiente', $semana5['estado']);
        $this->assertStringContainsString('1 productos sin fotografía', implode(' ', $semana5['observaciones']));
    }

    public function test_semana_cinco_no_acepta_productos_con_nombre_de_prueba_aunque_tengan_foto(): void
    {
        Schema::table('productos', function (Blueprint $tabla) {
            $tabla->string('nombre_producto',150)->nullable();
            $tabla->mediumText('foto')->nullable();
        });
        DB::table('productos')->insert([
            'id_producto'=>1,
            'nombre_producto'=>'Producto Prueba 10',
            'foto'=>'data:image/jpeg;base64,AA==',
            'stock'=>69,
        ]);

        $respuesta=app(VerificacionEfsrtController::class)->index();
        $this->assertSame(200,$respuesta->getStatusCode());
        $resultado=$respuesta->getData(true);
        $alerta=collect($resultado['alertas'])->firstWhere('tipo','productos_prueba');
        $this->assertNotNull($alerta);
        $this->assertSame(1,$alerta['cantidad']);
        $semana5=collect($resultado['semanas'])->firstWhere('semana',5);
        $this->assertSame('pendiente',$semana5['estado']);
        $this->assertStringContainsString(
            'nombres de prueba',
            implode(' ', $semana5['observaciones'])
        );
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

    public function test_cliente_autenticado_no_puede_leer_el_diagnostico_privado(): void
    {
        $cliente = new \App\Models\Usuario([
            'rol'=>'Cliente', 'estado'=>'Activo', 'nombre_usuario'=>'cliente.test',
        ]);
        $cliente->id_usuario=10;
        $this->actingAs($cliente, 'sanctum');

        $this->getJson('/api/admin/verificacion-efsrt')->assertStatus(403);
    }

    public function test_un_usuario_no_autenticado_no_puede_abrir_el_diagnostico(): void
    {
        $respuesta=$this->getJson('/api/admin/verificacion-efsrt');
        $respuesta->assertStatus(401);
    }
}
