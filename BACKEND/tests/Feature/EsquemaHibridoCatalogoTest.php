<?php

namespace Tests\Feature;

use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\PortalClienteController;
use App\Http\Controllers\ProductoController;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

/** Simula la gym_system antigua después de agregar columnas de compatibilidad. */
class EsquemaHibridoCatalogoTest extends TestCase
{
    public function test_legacy_hibrido_conserva_fotos_y_permite_registrar_productos_y_ver_catalogo_cliente(): void
    {
        if (!in_array(DB::connection()->getDriverName(), ['mysql', 'mariadb'], true)) {
            $this->markTestSkipped('Requiere MySQL.');
        }

        $original = DB::getDefaultConnection();
        $conexion = 'mallqui_hibrido_ci';
        $admin = DB::connection($original);
        $admin->statement('CREATE DATABASE IF NOT EXISTS mallqui_hibrido_ci CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        $configuracion = (array) config('database.connections.'.$original);
        $configuracion['database'] = 'mallqui_hibrido_ci';
        $configuracion['url'] = null;
        $configuracion['prefix'] = '';
        config(['database.connections.'.$conexion => $configuracion]);

        try {
            DB::setDefaultConnection($conexion);
            DB::purge($conexion);
            Schema::create('categorias', function (Blueprint $t) {
                $t->bigIncrements('id');
                $t->string('nombre');
                $t->string('estado', 20)->default('activo');
            });
            Schema::create('productos', function (Blueprint $t) {
                $t->bigIncrements('id');
                $t->unsignedBigInteger('categoria_id');
                $t->string('codigo', 60)->unique();
                $t->string('nombre', 150);
                $t->text('descripcion')->nullable();
                $t->mediumText('foto')->nullable();
                $t->decimal('precio_compra', 12, 2)->default(0);
                $t->decimal('precio_venta', 12, 2);
                $t->integer('stock')->default(0);
                $t->integer('stock_minimo')->default(5);
                $t->string('unidad_medida')->default('Unidad');
                $t->string('estado', 20)->default('activo');
            });
            $categoria = DB::table('categorias')->insertGetId(['nombre' => 'Suplementos']);
            $foto = 'data:image/png;base64,'.base64_encode('foto-original');
            DB::table('productos')->insert([
                'categoria_id' => $categoria, 'codigo' => 'HIST-001',
                'nombre' => 'Proteína histórica', 'precio_compra' => 20,
                'precio_venta' => 40, 'stock' => 8, 'foto' => $foto,
            ]);

            $this->assertSame(0, Artisan::call('db:reconciliar-esquema'), Artisan::output());
            $this->assertTrue(Schema::hasColumn('productos', 'id_producto'));
            $this->assertTrue(Schema::hasColumn('categorias', 'id_categoria'));
            $this->assertSame(
                'Proteína histórica',
                DB::table('productos')->where('codigo', 'HIST-001')->value('nombre_producto')
            );
            $this->assertSame(
                (int) $categoria,
                (int) DB::table('productos')->where('codigo', 'HIST-001')->value('id_categoria')
            );

            $productos = app(ProductoController::class)->index(Request::create('/api/productos'))
                ->getData(true);
            $this->assertCount(1, $productos);
            $this->assertSame('Proteína histórica', $productos[0]['nombre_producto']);
            $this->assertSame($foto, $productos[0]['foto']);

            $categorias = app(CategoriaController::class)->index()->getData(true);
            $this->assertSame('Suplementos', $categorias[0]['nombre_categoria']);

            $alta = app(ProductoController::class)->store(Request::create('/api/productos', 'POST', [
                'id_categoria' => $categoria, 'codigo_producto' => 'NUEVO-002',
                'nombre_producto' => 'Creatina guardada', 'precio_compra' => 15,
                'precio_venta' => 30, 'stock' => 5, 'unidad_medida' => 'Unidad',
                'estado' => 'Activo', 'foto' => $foto,
            ]));
            $this->assertSame(201, $alta->getStatusCode());
            $this->assertSame(1, DB::table('productos')->where('codigo', 'NUEVO-002')->count());
            $nuevo = DB::table('productos')->where('codigo', 'NUEVO-002')->first();
            $this->assertSame((int) $nuevo->id, (int) $nuevo->id_producto);
            $this->assertSame('Creatina guardada', $nuevo->nombre_producto);
            $this->assertSame('NUEVO-002', $nuevo->codigo_producto);
            $this->assertSame((int) $categoria, (int) $nuevo->id_categoria);

            $nuevaCategoria = app(CategoriaController::class)->store(
                Request::create('/api/categorias', 'POST', [
                    'nombre_categoria' => 'Accesorios',
                    'estado' => 'Activo',
                ])
            );
            $this->assertSame(201, $nuevaCategoria->getStatusCode());
            $guardada = DB::table('categorias')->where('nombre', 'Accesorios')->first();
            $this->assertSame((int) $guardada->id, (int) $guardada->id_categoria);
            $this->assertSame('Accesorios', $guardada->nombre_categoria);

            $idCliente = DB::table('clientes')->insertGetId([
                'dni' => '86664422', 'nombres' => 'Cliente', 'apellidos' => 'Prueba',
                'estado' => 'Activo',
            ], 'id_cliente');
            $peticion = Request::create('/api/mi-cuenta/productos');
            $peticion->setUserResolver(fn () => (object) ['id_cliente' => $idCliente]);

            $catalogo = app(PortalClienteController::class)->productos($peticion)->getData(true);
            $this->assertCount(2, $catalogo);
            $this->assertContains('Proteína histórica', array_column($catalogo, 'nombre_producto'));
            $this->assertContains('Creatina guardada', array_column($catalogo, 'nombre_producto'));
            $this->assertSame(2, count(array_filter($catalogo, fn ($p) => $p['foto'] === $foto)));
            // El botón Editar foto debe aceptar un cambio parcial. Stock,
            // categoría, nombre y precio anteriores continúan en MySQL.
            $nuevaFoto = 'data:image/webp;base64,'.base64_encode('foto-editada');
            $edicion = app(ProductoController::class)->update(
                Request::create('/api/productos/'.$nuevo->id, 'PUT', ['foto' => $nuevaFoto]),
                (string) $nuevo->id
            );
            $this->assertSame(200, $edicion->getStatusCode());
            $despues = DB::table('productos')->where('id', $nuevo->id)->first();
            $this->assertSame($nuevaFoto, $despues->foto);
            $this->assertSame('Creatina guardada', $despues->nombre);
            $this->assertEqualsWithDelta(30.0, (float) $despues->precio_venta, 0.001);
            $this->assertSame(5, (int) $despues->stock);
            // Una instalación que tiene la columna pero dejó los datos a
            // NULL no debe declarar "TODO OK" ni saltarse la reparación.
            DB::table('productos')->where('id', $nuevo->id)->update(['nombre_producto' => null]);
            $this->assertContains(
                'integridad:productos',
                \App\Console\Commands\ReconciliarEsquemaRealMallqui::integridadCatalogoPendiente()
            );
            $this->assertSame(1, Artisan::call('db:verificar'));
            $this->assertSame(0, Artisan::call('db:reconciliar-esquema'), Artisan::output());
            $this->assertSame(0, Artisan::call('db:verificar'), Artisan::output());
            $this->assertSame(
                'Creatina guardada',
                DB::table('productos')->where('id', $nuevo->id)->value('nombre_producto')
            );
            $catalogoActualizado = app(PortalClienteController::class)->productos($peticion)->getData(true);
            $this->assertSame(
                $nuevaFoto,
                collect($catalogoActualizado)->firstWhere('codigo_producto', 'NUEVO-002')['foto']
            );
        } finally {
            DB::setDefaultConnection($original);
            DB::disconnect($conexion);
            $admin->statement('DROP DATABASE IF EXISTS mallqui_hibrido_ci');
        }
    }
}
