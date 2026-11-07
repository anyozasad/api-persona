<?php

namespace Tests\Feature;

use App\Http\Middleware\AuditLogMiddleware;
use App\Models\Usuario;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DashboardResumenTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(AuditLogMiddleware::class);

        foreach ([
            'solicitudes_soporte','productos','ventas','detalle_venta','detalle_ventas',
            'reservas','cajas','gastos','movimientos_caja','asistencias','pagos_membresia',
            'cliente_membresia','membresias','planes','rutinas','clases','entrenadores',
            'clientes','socios','usuarios'
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
            $table->dateTime('fecha_registro')->nullable();
        });

        DB::table('usuarios')->insert([
            'id_usuario' => 1,
            'nombre_usuario' => 'admin.dashboard',
            'contrasena' => bcrypt('Password123'),
            'nombres' => 'Admin',
            'apellidos' => 'Dashboard',
            'dni' => '78888881',
            'correo' => 'dashboard@mallqui.test',
            'rol' => 'Administrador',
            'estado' => 'Activo',
            'fecha_registro' => now(),
        ]);

        DB::table('clientes')->insert([
            'id_cliente' => 1,
            'dni' => '70000009',
            'nombres' => 'Socio',
            'apellidos' => 'Activo',
            'estado' => 'Activo',
            'fecha_registro' => now(),
        ]);

        $this->actingAs(Usuario::findOrFail(1), 'sanctum');
    }


    public function test_dashboard_prefiere_tablas_actuales_a_legacy(): void
    {
        Schema::create('socios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('estado')->default('activo');
        });

        DB::table('socios')->insert([
            ['nombre' => 'Legacy Uno', 'estado' => 'activo'],
            ['nombre' => 'Legacy Dos', 'estado' => 'activo'],
            ['nombre' => 'Legacy Tres', 'estado' => 'activo'],
        ]);

        Schema::create('membresias', function (Blueprint $table) {
            $table->id('id_membresia');
            $table->string('nombre');
            $table->decimal('precio', 10, 2)->default(80);
            $table->unsignedInteger('duracion_meses')->default(1);
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

        Schema::create('planes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->decimal('precio', 10, 2)->default(999);
            $table->string('estado')->default('activo');
        });

        Schema::create('suscripciones', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('socio_id');
            $table->unsignedBigInteger('plan_id');
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->string('estado');
        });

        DB::table('membresias')->insert([
            'id_membresia' => 1,
            'nombre' => 'Actual',
            'precio' => 80,
            'duracion_meses' => 1,
            'estado' => 'Activo',
        ]);

        DB::table('cliente_membresia')->insert([
            'id_cliente_membresia' => 1,
            'id_cliente' => 1,
            'id_membresia' => 1,
            'fecha_inicio' => today()->subDay()->toDateString(),
            'fecha_fin' => today()->addDays(20)->toDateString(),
            'estado' => 'Activo',
        ]);

        DB::table('planes')->insert([
            'id' => 1,
            'nombre' => 'Legacy',
            'precio' => 999,
            'estado' => 'activo',
        ]);

        foreach ([1,2,3] as $id) {
            DB::table('suscripciones')->insert([
                'id' => $id,
                'socio_id' => $id,
                'plan_id' => 1,
                'fecha_inicio' => today()->subDay()->toDateString(),
                'fecha_fin' => today()->addDays(20)->toDateString(),
                'estado' => 'activa',
            ]);
        }

        $this->getJson('/api/dashboard/resumen')
            ->assertOk()
            ->assertJsonPath('clientes.total', 1)
            ->assertJsonPath('membresias.activas', 1)
            ->assertJsonPath('fuente.modo', 'base_principal');
    }


    public function test_dashboard_cuenta_pago_efectivo_pendiente_desde_pagos_membresia(): void
    {
        Schema::create('membresias', function (Blueprint $table) {
            $table->id('id_membresia');
            $table->string('nombre');
            $table->decimal('precio', 10, 2)->default(80);
            $table->unsignedInteger('duracion_meses')->default(1);
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
            $table->string('estado_pago');
        });

        DB::table('membresias')->insert([
            'id_membresia' => 1,
            'nombre' => 'Mensual',
            'precio' => 80,
            'duracion_meses' => 1,
            'estado' => 'Activo',
        ]);

        DB::table('cliente_membresia')->insert([
            'id_cliente_membresia' => 1,
            'id_cliente' => 1,
            'id_membresia' => 1,
            'fecha_inicio' => today()->toDateString(),
            'fecha_fin' => today()->addMonth()->toDateString(),
            'estado' => 'PendientePago',
        ]);

        DB::table('pagos_membresia')->insert([
            'id_pago' => 1,
            'id_cliente_membresia' => 1,
            'fecha_pago' => now(),
            'monto' => 80,
            'metodo_pago' => 'Efectivo',
            'estado_pago' => 'Pendiente',
        ]);

        $this->getJson('/api/dashboard/resumen')
            ->assertOk()
            ->assertJsonPath('membresias.pagos_pendientes', 1)
            ->assertJsonCount(1, 'membresias.detalle_pagos_pendientes')
            ->assertJsonPath('membresias.detalle_pagos_pendientes.0.id_pago', 1)
            ->assertJsonPath('membresias.detalle_pagos_pendientes.0.estado_pago', 'Pendiente')
            ->assertJsonPath('alertas.total', 1);
    }

    public function test_alerta_de_vencimientos_cuenta_todos_los_socios_aunque_muestre_solo_ocho(): void
    {
        Schema::create('membresias', function (Blueprint $table) {
            $table->id('id_membresia');
            $table->string('nombre');
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

        DB::table('membresias')->insert([
            'id_membresia' => 1, 'nombre' => 'Mensual', 'estado' => 'Activo',
        ]);

        for ($id = 1; $id <= 10; $id++) {
            if ($id > 1) {
                DB::table('clientes')->insert([
                    'id_cliente' => $id,
                    'dni' => '70'.str_pad((string) $id, 6, '0', STR_PAD_LEFT),
                    'nombres' => 'Socio',
                    'apellidos' => 'Numero '.$id,
                    'estado' => 'Activo',
                    'fecha_registro' => now(),
                ]);
            }
            DB::table('cliente_membresia')->insert([
                'id_cliente_membresia' => $id,
                'id_cliente' => $id,
                'id_membresia' => 1,
                'fecha_inicio' => today()->subWeek()->toDateString(),
                'fecha_fin' => today()->addDays(3)->toDateString(),
                'estado' => 'Activo',
            ]);
        }

        $this->getJson('/api/dashboard/resumen')
            ->assertOk()
            ->assertJsonPath('membresias.por_vencer_7_dias', 10)
            ->assertJsonCount(8, 'membresias.detalle_por_vencer')
            ->assertJsonPath('alertas.total', 10);
    }

    public function test_reservas_del_dia_cuentan_todas_las_no_canceladas(): void
    {
        Schema::create('clases', function (Blueprint $table) {
            $table->id('id_clase');
            $table->string('nombre');
            $table->time('hora_inicio');
        });
        Schema::create('reservas', function (Blueprint $table) {
            $table->id('id_reserva');
            $table->unsignedBigInteger('id_cliente');
            $table->unsignedBigInteger('id_clase');
            $table->date('fecha_clase');
            $table->string('estado');
        });

        DB::table('clases')->insert([
            'id_clase' => 1, 'nombre' => 'Entrenamiento', 'hora_inicio' => '09:00:00',
        ]);
        for ($id = 1; $id <= 11; $id++) {
            DB::table('reservas')->insert([
                'id_reserva' => $id,
                'id_cliente' => 1,
                'id_clase' => 1,
                'fecha_clase' => today()->toDateString(),
                'estado' => $id === 11 ? 'Cancelada' : 'Confirmada',
            ]);
        }

        $this->getJson('/api/dashboard/resumen')
            ->assertOk()
            ->assertJsonPath('reservas.hoy', 10)
            ->assertJsonCount(8, 'reservas.detalle_hoy');
    }

    public function test_dashboard_entrega_resumen_operativo_completo(): void
    {
        $this->getJson('/api/dashboard/resumen')
            ->assertOk()
            ->assertJsonPath('clientes.total', 1)
            ->assertJsonPath('clientes.activos', 1)
            ->assertJsonStructure([
                'fuente' => ['base_datos','tablas_detectadas','modo'],
                'periodo' => ['fecha','mes'],
                'clientes' => ['total','activos','nuevos_mes'],
                'membresias' => ['activas','por_vencer_7_dias','detalle_por_vencer'],
                'asistencias' => ['hoy','dentro_ahora'],
                'reservas' => ['hoy','detalle_hoy'],
                'operacion' => ['clases_activas','rutinas_activas','entrenadores_activos','usuarios_activos'],
                'ventas' => ['hoy_total','hoy_cantidad','mes_cantidad','recientes','top_productos'],
                'ingresos' => ['membresias_mes','ventas_mes','total_mes','mes_anterior','variacion_mes'],
                'gastos' => ['total_mes'],
                'utilidad' => ['total_mes'],
                'inventario' => ['productos_stock_bajo','detalle_stock_bajo','valor_stock_compra'],
                'caja' => ['abierta','detalle'],
                'tendencias' => ['ingresos_6_meses','asistencias_7_dias','membresias_por_plan'],
                'alertas' => ['total','soporte_pendiente','rutinas_pendientes','opiniones_pendientes','prioridades'],
                'portal_clientes' => ['actividad_reciente','soporte_pendiente','rutinas_pendientes','opiniones_pendientes','ultima_sincronizacion'],
            ]);
    }
}
