<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

/**
 * Reproduce XAMPP: history of migrations "completed" but missing objects,
 * with some genuine old records. Never tests against the user's database.
 */
class EsquemaRealPersistenciaReparacionTest extends TestCase
{
    public function test_recupera_esquema_incompleto_y_persiste_socio_plan_pago_evento_y_aviso(): void
    {
        if (!in_array(DB::connection()->getDriverName(), ['mysql', 'mariadb'], true)) {
            $this->markTestSkipped('Requiere MySQL/MariaDB, como XAMPP.');
        }

        $original = DB::getDefaultConnection();
        $conexion = 'gym_reconciliar_ci';
        $nombreBD = 'mallqui_reconciliar_ci';
        $admin = DB::connection($original);
        $admin->statement('CREATE DATABASE IF NOT EXISTS `mallqui_reconciliar_ci` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        $config = (array) config('database.connections.'.$original);
        $config['database'] = $nombreBD;
        $config['url'] = null;
        $config['prefix'] = '';
        config(['database.connections.'.$conexion => $config]);

        try {
            DB::setDefaultConnection($conexion);
            DB::purge($conexion);

            Schema::create('migrations', function (Blueprint $tabla) {
                $tabla->increments('id');
                $tabla->string('migration');
                $tabla->integer('batch');
            });
            DB::table('migrations')->insert([
                ['migration' => '2026_09_18_000000_create_core_gym_tables_if_missing', 'batch' => 1],
                ['migration' => '2026_09_25_130000_create_notificaciones_cliente_table', 'batch' => 1],
                ['migration' => '2026_10_21_210000_create_admin_gym_records_table', 'batch' => 1],
            ]);

            // gym_system original: un socio y un plan creados desde el
            // dashboard antiguo. La reparación debe recuperarlos al módulo
            // Clientes, no crear tablas nuevas vacías perdiendo su visibilidad.
            Schema::create('socios', function (Blueprint $tabla) {
                $tabla->bigIncrements('id');
                $tabla->string('nombre');
                $tabla->string('dni', 20);
                $tabla->string('email')->nullable();
                $tabla->string('telefono')->nullable();
                $tabla->string('estado')->default('activo');
                $tabla->dateTime('fecha_registro')->nullable();
            });
            DB::table('socios')->insert([
                'nombre'=>'Ana Ejemplo', 'dni'=>'81234567', 'email'=>'ana@mallqui.test',
                'telefono'=>'999888777', 'estado'=>'activo',
            ]);
            Schema::create('planes', function (Blueprint $tabla) {
                $tabla->bigIncrements('id');
                $tabla->string('nombre');
                $tabla->integer('duracion_dias')->default(30);
                $tabla->decimal('precio', 12, 2)->default(0);
                $tabla->string('descripcion')->nullable();
                $tabla->string('estado')->default('activo');
            });
            DB::table('planes')->insert([
                'nombre'=>'Plan histórico', 'duracion_dias'=>30,
                'precio'=>80, 'estado'=>'activo',
            ]);
            Schema::create('suscripciones', function (Blueprint $tabla) {
                $tabla->bigIncrements('id');
                $tabla->unsignedBigInteger('socio_id');
                $tabla->unsignedBigInteger('plan_id');
                $tabla->date('fecha_inicio');
                $tabla->date('fecha_fin');
                $tabla->string('estado')->default('activa');
            });
            DB::table('suscripciones')->insert([
                'socio_id'=>1,'plan_id'=>1,'fecha_inicio'=>'2026-11-20',
                'fecha_fin'=>'2026-12-20','estado'=>'activa',
            ]);

            // Two partially populated legacy tables; there is NO clientes,
            // and almost all other tables are absent despite migrations history.
            Schema::create('membresias', function (Blueprint $tabla) {
                $tabla->bigIncrements('id_membresia');
                $tabla->string('nombre', 100);
            });
            DB::table('membresias')->insert(['nombre' => 'Plan existente del gimnasio']);

            Schema::create('productos', function (Blueprint $tabla) {
                $tabla->bigIncrements('id_producto');
                $tabla->string('nombre_producto', 150);
            });
            DB::table('productos')->insert(['nombre_producto' => 'Producto histórico']);
            // XAMPP legacy: las sesiones existen pero carecen de id_cliente.
            // Una migración que usa ->after('id_cliente') fallaba antes de
            // que el conciliador añadiera la columna; el error quedaba rojo
            // aunque se completara la estructura al final.
            Schema::create('sesiones_entrenamiento_casa', function (Blueprint $tabla) {
                $tabla->bigIncrements('id_sesion_casa');
                $tabla->string('zona', 50)->nullable();
                $tabla->date('fecha')->nullable();
                $tabla->string('estado', 30)->nullable();
            });
            DB::table('sesiones_entrenamiento_casa')->insert([
                'zona' => 'Piernas', 'fecha' => '2026-11-20', 'estado' => 'Finalizada',
            ]);

            $codigo = Artisan::call('db:reconciliar-esquema');
            $this->assertSame(0, $codigo, Artisan::output());
            $this->assertSame(0, Artisan::call('db:reconciliar-esquema'), 'La segunda ejecución debe ser segura.');
            $this->assertSame(1, DB::table('clientes')->where('dni','81234567')->count());
            $this->assertSame(1, DB::table('cliente_membresia')->count());

            foreach ([
                'clientes', 'usuarios', 'membresias', 'cliente_membresia',
                'pagos_membresia', 'productos', 'notificaciones_cliente',
                'admin_gym_records', 'reservas', 'cajas', 'ventas',
            ] as $tabla) {
                $this->assertTrue(Schema::hasTable($tabla), 'Falta '.$tabla);
            }

            $this->assertSame(1, DB::table('clientes')->where('dni', '81234567')->count());
            $this->assertSame('Ana', DB::table('clientes')->where('dni', '81234567')->value('nombres'));
            $this->assertSame(1, DB::table('membresias')->where('nombre', 'Plan histórico')->count());
            $this->assertSame(1, DB::table('cliente_membresia')->count());
            $this->assertSame(0, DB::table('pagos_membresia')->count(),
                'Una suscripción legacy no debe convertirse en un pago confirmado.');

            $this->assertSame('Plan existente del gimnasio', DB::table('membresias')->first()->nombre);
            $this->assertSame('Producto histórico', DB::table('productos')->first()->nombre_producto);
            $this->assertTrue(Schema::hasColumn('sesiones_entrenamiento_casa', 'id_cliente'));
            $this->assertTrue(Schema::hasColumn('sesiones_entrenamiento_casa', 'id_rutina'));
            $this->assertSame('Piernas', DB::table('sesiones_entrenamiento_casa')->first()->zona);
            $this->assertSame(1, DB::table('sesiones_entrenamiento_casa')->count());

            $cliente = DB::table('clientes')->insertGetId([
                'dni' => '82828282', 'nombres' => 'Socio', 'apellidos' => 'Real',
                'correo' => 'socio@mallqui.test', 'estado' => 'Activo',
            ], 'id_cliente');

            $plan = DB::table('membresias')->insertGetId([
                'nombre' => 'Plan persistente',
                'duracion_meses' => 1,
                'precio' => 90.00,
                'estado' => 'Activo',
            ], 'id_membresia');

            $membresia = DB::table('cliente_membresia')->insertGetId([
                'id_cliente' => $cliente,
                'id_membresia' => $plan,
                'fecha_inicio' => '2026-11-20',
                'fecha_fin' => '2026-12-20',
                'estado' => 'Activo',
            ], 'id_cliente_membresia');

            DB::table('pagos_membresia')->insert([
                'id_cliente_membresia' => $membresia,
                'fecha_pago' => '2026-11-20 12:00:00',
                'monto' => 90.00,
                'metodo_pago' => 'Efectivo',
                'estado_pago' => 'Completado',
            ]);
            DB::table('notificaciones_cliente')->insert([
                'id_cliente' => $cliente,
                'titulo' => 'Bienvenido',
                'mensaje' => 'Registro guardado en MySQL',
                'tipo' => 'Informacion',
            ]);
            DB::table('admin_gym_records')->insert([
                'modulo' => 'eventos',
                'titulo' => 'Evento guardado en MySQL',
                'estado' => 'Activo',
            ]);

            $this->assertSame(1, DB::table('clientes')->where('dni', '82828282')->count());
            $this->assertSame(1, DB::table('membresias')->where('nombre', 'Plan persistente')->count());
            $this->assertSame(1, DB::table('pagos_membresia')->where('monto', 90)->count());
            $this->assertSame(1, DB::table('notificaciones_cliente')->where('id_cliente', $cliente)->count());
            $this->assertSame(1, DB::table('admin_gym_records')->where('modulo', 'eventos')->count());
        } finally {
            DB::setDefaultConnection($original);
            DB::disconnect($conexion);
            $admin->statement('DROP DATABASE IF EXISTS `mallqui_reconciliar_ci`');
        }
    }
}
