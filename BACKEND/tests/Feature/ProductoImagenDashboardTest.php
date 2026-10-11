<?php

namespace Tests\Feature;

use App\Http\Controllers\GymSystemAdminController;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class ProductoImagenDashboardTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::dropIfExists('productos');
        Schema::dropIfExists('categorias');

        Schema::create('categorias', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre');
            $table->string('estado')->default('activo');
        });

        // Se crea deliberadamente con una columna foto corta para comprobar
        // que la compatibilidad del dashboard la amplía sin intervención manual.
        Schema::create('productos', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('categoria_id');
            $table->string('codigo', 50);
            $table->string('nombre', 150);
            $table->decimal('precio_compra', 10, 2)->default(0);
            $table->decimal('precio_venta', 10, 2)->default(0);
            $table->unsignedInteger('stock')->default(0);
            $table->string('estado', 20)->default('activo');
            $table->string('foto', 255)->nullable();
        });

        DB::table('categorias')->insert([
            'id' => 1,
            'nombre' => 'Bebidas',
            'estado' => 'activo',
        ]);
    }

    public function test_producto_guarda_y_devuelve_imagen_optimizada(): void
    {
        $controller = app(GymSystemAdminController::class);
        $foto = 'data:image/webp;base64,'.base64_encode(str_repeat('mallqui', 40));

        $request = Request::create('/api/gym-admin/productos', 'POST', [
            'id_categoria' => 1,
            'codigo_producto' => 'IMG-001',
            'nombre_producto' => 'Producto con imagen',
            'descripcion' => 'Prueba de imagen',
            'precio_compra' => 10,
            'precio_venta' => 15,
            'stock' => 5,
            'stock_minimo' => 2,
            'unidad_medida' => 'Unidad',
            'estado' => 'Activo',
            'foto' => $foto,
        ]);

        $response = $controller->guardarProducto($request);

        $this->assertSame(201, $response->getStatusCode());
        $this->assertDatabaseHas('productos', [
            'codigo' => 'IMG-001',
            'nombre' => 'Producto con imagen',
            'foto' => $foto,
        ]);

        $lista = $controller->productos()->getData(true);
        $this->assertCount(1, $lista);
        $this->assertSame($foto, $lista[0]['foto']);
        $this->assertSame('Producto con imagen', $lista[0]['nombre_producto']);
    }

    public function test_producto_permite_cambiar_y_quitar_imagen(): void
    {
        $controller = app(GymSystemAdminController::class);
        $foto = 'data:image/png;base64,'.base64_encode('imagen-inicial');

        $id = DB::table('productos')->insertGetId([
            'categoria_id' => 1,
            'codigo' => 'IMG-002',
            'nombre' => 'Producto editable',
            'descripcion' => null,
            'precio_compra' => 10,
            'precio_venta' => 15,
            'stock' => 7,
            'stock_minimo' => 2,
            'unidad_medida' => 'Unidad',
            'estado' => 'activo',
            'foto' => $foto,
        ]);

        $request = Request::create('/api/gym-admin/productos/'.$id, 'PUT', [
            'id_categoria' => 1,
            'codigo_producto' => 'IMG-002',
            'nombre_producto' => 'Producto editable',
            'descripcion' => null,
            'precio_compra' => 10,
            'precio_venta' => 18,
            'stock_minimo' => 2,
            'unidad_medida' => 'Unidad',
            'estado' => 'Activo',
            'foto' => null,
        ]);

        $controller->actualizarProducto($request, (string) $id);

        $this->assertNull(DB::table('productos')->where('id', $id)->value('foto'));
        $this->assertSame(7, (int) DB::table('productos')->where('id', $id)->value('stock'));
        $this->assertSame('18.00', (string) DB::table('productos')->where('id', $id)->value('precio_venta'));
    }

    public function test_rechaza_texto_disfrazado_de_imagen(): void
    {
        $controller = app(GymSystemAdminController::class);

        $request = Request::create('/api/gym-admin/productos', 'POST', [
            'id_categoria' => 1,
            'codigo_producto' => 'IMG-003',
            'nombre_producto' => 'Producto inválido',
            'precio_compra' => 10,
            'precio_venta' => 15,
            'stock' => 1,
            'stock_minimo' => 1,
            'unidad_medida' => 'Unidad',
            'estado' => 'Activo',
            'foto' => 'javascript:alert(1)',
        ]);

        try {
            $controller->guardarProducto($request);
            $this->fail('La imagen inválida debió ser rechazada.');
        } catch (HttpException $e) {
            $this->assertSame(422, $e->getStatusCode());
        }

        $this->assertDatabaseMissing('productos', ['codigo' => 'IMG-003']);
    }
}
