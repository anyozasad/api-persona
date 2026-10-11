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
