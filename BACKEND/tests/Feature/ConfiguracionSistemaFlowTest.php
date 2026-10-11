<?php

namespace Tests\Feature;

use App\Http\Middleware\AuditLogMiddleware;
use App\Models\Usuario;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ConfiguracionSistemaFlowTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(AuditLogMiddleware::class);

        foreach (['membresias','configuracion_sistema','usuarios'] as $tabla) {
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

        Schema::create('configuracion_sistema', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_gimnasio')->default('Mallqui Gym');
            $table->string('ruc')->nullable();
            $table->string('telefono')->nullable();
            $table->string('correo')->nullable();
            $table->string('direccion')->nullable();
            $table->string('referencia')->nullable();
            $table->string('frase_publicitaria')->nullable();
            $table->text('horario_detalle')->nullable();
            $table->decimal('tarifa_diaria', 8, 2)->nullable();
            $table->text('mensaje_productos')->nullable();
            $table->time('hora_apertura');
            $table->time('hora_cierre');
            $table->json('dias_atencion');
            $table->unsignedTinyInteger('dias_aviso_vencimiento')->default(7);
            $table->unsignedSmallInteger('minutos_cancelacion_reserva')->default(120);
            $table->unsignedTinyInteger('dias_anticipacion_reserva')->default(7);
            $table->unsignedSmallInteger('stock_minimo_default')->default(5);
            $table->boolean('notificar_vencimientos')->default(true);
            $table->boolean('notificar_stock_bajo')->default(true);
            $table->boolean('notificar_pagos_pendientes')->default(true);
            $table->timestamps();
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

        DB::table('usuarios')->insert([
            'id_usuario' => 1,
            'nombre_usuario' => 'admin.config',
            'contrasena' => bcrypt('Password123'),
            'nombres' => 'Admin',
            'apellidos' => 'Config',
            'dni' => '79999931',
            'correo' => 'config@mallqui.test',
            'rol' => 'Administrador',
            'estado' => 'Activo',
            'fecha_registro' => now(),
        ]);

        DB::table('membresias')->insert([
            'id_membresia' => 1,
            'nombre' => 'Mensualidad 1 mes',
            'duracion_meses' => 1,
            'precio' => 100,
            'estado' => 'Activo',
        ]);

        $this->actingAs(Usuario::findOrFail(1), 'sanctum');
    }

    public function test_admin_puede_guardar_y_recuperar_configuracion_real(): void
    {
        $payload = [
            'nombre_gimnasio' => 'Mallqui Gym',
            'ruc' => '20123456789',
            'telefono' => '939398148',
            'correo' => 'contacto@mallqui.test',
            'direccion' => 'Jr. Los Laureles Mz 17 Lt 18',
            'referencia' => 'Plaza de Laura Bosso',
            'frase_publicitaria' => 'Vida saludable',
            'horario_detalle' => 'Lunes a sábado',
            'tarifa_diaria' => 6,
            'mensaje_productos' => 'Productos disponibles en recepción',
            'hora_apertura' => '06:00',
            'hora_cierre' => '21:30',
            'dias_atencion' => ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
            'dias_aviso_vencimiento' => 7,
            'minutos_cancelacion_reserva' => 120,
            'dias_anticipacion_reserva' => 7,
            'stock_minimo_default' => 5,
            'notificar_vencimientos' => true,
            'notificar_stock_bajo' => true,
            'notificar_pagos_pendientes' => true,
        ];

        $this->putJson('/api/configuracion', $payload)
            ->assertOk()
            ->assertJsonPath('configuracion.nombre_gimnasio', 'Mallqui Gym')
            ->assertJsonPath('configuracion.tarifa_diaria', '6.00');

        $this->getJson('/api/configuracion')
            ->assertOk()
            ->assertJsonPath('configuracion.telefono', '939398148')
            ->assertJsonPath('estado.api', true)
            ->assertJsonPath('estado.mysql', true);
    }

    public function test_informacion_publica_expone_solo_datos_necesarios_y_planes_activos(): void
    {
        DB::table('configuracion_sistema')->insert([
            'nombre_gimnasio' => 'Mallqui Gym',
            'telefono' => '939398148',
            'direccion' => 'Pucallpa',
            'hora_apertura' => '06:00:00',
            'hora_cierre' => '21:30:00',
            'dias_atencion' => json_encode(['Lunes','Martes']),
            'dias_aviso_vencimiento' => 7,
            'minutos_cancelacion_reserva' => 120,
            'dias_anticipacion_reserva' => 7,
            'stock_minimo_default' => 5,
            'notificar_vencimientos' => 1,
            'notificar_stock_bajo' => 1,
            'notificar_pagos_pendientes' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        auth('sanctum')->forgetUser();

        $this->getJson('/api/informacion-gym')
            ->assertOk()
            ->assertJsonPath('nombre_gimnasio', 'Mallqui Gym')
            ->assertJsonPath('membresias.0.nombre', 'Mensualidad 1 mes');
    }
}
