<?php

namespace Tests\Feature;

use App\Models\PagoMembresia;
use App\Services\ComprobanteMembresiaService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ComprobanteMembresiaTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        foreach (['configuracion_sistema','pagos_membresia','cliente_membresia','membresias','clientes'] as $tabla) {
            Schema::dropIfExists($tabla);
        }

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

        Schema::create('configuracion_sistema', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_gimnasio')->default('Mallqui Gym');
            $table->string('ruc')->nullable();
            $table->string('telefono')->nullable();
            $table->string('correo')->nullable();
            $table->string('direccion')->nullable();
            $table->time('hora_apertura')->nullable();
            $table->time('hora_cierre')->nullable();
            $table->json('dias_atencion')->nullable();
            $table->unsignedTinyInteger('dias_aviso_vencimiento')->default(7);
            $table->unsignedSmallInteger('minutos_cancelacion_reserva')->default(120);
            $table->unsignedTinyInteger('dias_anticipacion_reserva')->default(7);
            $table->unsignedSmallInteger('stock_minimo_default')->default(5);
            $table->boolean('notificar_vencimientos')->default(true);
            $table->boolean('notificar_stock_bajo')->default(true);
            $table->boolean('notificar_pagos_pendientes')->default(false);
            $table->timestamps();
        });

        DB::table('clientes')->insert([
            'id_cliente' => 1,
            'dni' => '70000012',
            'nombres' => 'Cliente',
            'apellidos' => 'Boleta',
            'estado' => 'Activo',
        ]);

        DB::table('membresias')->insert([
            'id_membresia' => 1,
            'nombre' => 'Pro',
            'duracion_meses' => 1,
            'precio' => 179,
            'estado' => 'Activo',
        ]);

        DB::table('cliente_membresia')->insert([
            'id_cliente_membresia' => 1,
            'id_cliente' => 1,
            'id_membresia' => 1,
            'fecha_inicio' => '2026-10-02',
            'fecha_fin' => '2026-11-01',
            'estado' => 'Activo',
        ]);

        DB::table('pagos_membresia')->insert([
            'id_pago' => 15,
            'id_cliente_membresia' => 1,
            'fecha_pago' => '2026-10-02 17:30:00',
            'monto' => 179,
            'metodo_pago' => 'Yape',
            'numero_operacion' => '1146',
            'estado_pago' => 'Completado',
        ]);

        DB::table('configuracion_sistema')->insert([
            'nombre_gimnasio' => 'Mallqui Gym',
            'ruc' => '20123456789',
            'direccion' => 'Pucallpa, Ucayali',
            'telefono' => '999999999',
            'correo' => 'contacto@mallqui.test',
            'hora_apertura' => '06:00:00',
            'hora_cierre' => '22:00:00',
            'dias_atencion' => json_encode(['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']),
        ]);
    }

    public function test_formatea_boleta_con_serie_correlativo_y_codigo_de_barras(): void
    {
        $pago = PagoMembresia::findOrFail(15);
        $data = app(ComprobanteMembresiaService::class)->formatear($pago);

        $this->assertSame('B001-00000015', $data['numero_comprobante']);
        $this->assertSame('20123456789', $data['empresa']['ruc']);
        $this->assertSame('Cliente Boleta', $data['cliente']);
        $this->assertSame('Pro', $data['membresia']);
        $this->assertStringContainsString('B001|00000015|179.00', $data['codigo_barras']);
        $this->assertSame('Completado', $data['estado']);
    }
}
