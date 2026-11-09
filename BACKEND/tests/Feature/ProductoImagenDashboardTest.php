<?php

namespace Tests\Feature;

use App\Http\Controllers\GymSystemAdminController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\CategoriaController;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
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

    public function test_la_api_normal_del_dashboard_carga_producto_legacy_y_su_foto_desde_mysql(): void
    {
        $foto = 'data:image/png;base64,'
            .'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jWl8AAAAASUVORK5CYII=';

        // Se usa la misma ruta que solicita <app-productos>, NO solamente
        // la antigua /api/gym-admin/productos.
        $control = app(ProductoController::class);
        $categorias = app(CategoriaController::class)->index()->getData(true);
        $this->assertCount(1, $categorias);
        $this->assertSame('Bebidas', $categorias[0]['nombre_categoria']);

        $peticion = Request::create('/api/productos', 'POST', [
            'id_categoria' => 1,
            'codigo_producto' => 'LEGACY-IMG-101',
            'nombre_producto' => 'Agua de prueba',
            'descripcion' => 'Fotografía desde Angular',
            'precio_compra' => 1.2,
            'precio_venta' => 2.5,
            'stock' => 8,
            'stock_minimo' => 1,
            'unidad_medida' => 'Unidad',
            'estado' => 'Activo',
            'foto' => $foto,
        ]);
        $respuesta = $control->store($peticion);
        $this->assertSame(201, $respuesta->getStatusCode());
        $producto = $respuesta->getData(true);
        $this->assertSame($foto, $producto['foto']);
        $this->assertSame('LEGACY-IMG-101', $producto['codigo_producto']);

        $id = (string) $producto['id_producto'];
        $this->assertDatabaseHas('productos', [
            'id' => (int) $id,
            'codigo' => 'LEGACY-IMG-101',
            'foto' => $foto,
        ]);
        $this->assertSame($foto, $control->show($id)->getData(true)['foto']);
        $this->assertSame($foto, $control->index($peticion)->getData(true)[0]['foto']);

        // El portal legacy y el dashboard moderno muestran la misma foto.
        $legacy = app(GymSystemAdminController::class)->producto($id)->getData(true);
        $this->assertSame($foto, $legacy['foto']);

        $diagnostico = $control->diagnosticoFotos()->getData(true);
        $this->assertSame('original', $diagnostico['esquema']);
        $this->assertSame(1, $diagnostico['total_productos']);
        $this->assertSame(1, $diagnostico['fotos_guardadas_en_mysql']);
        $this->assertSame(0, $diagnostico['sin_foto']);

        $nuevaFoto = 'data:image/webp;base64,'.base64_encode('imagen-actualizada');
        $edicion = Request::create('/api/productos/'.$id, 'PUT', [
            'id_categoria' => 1,
            'codigo_producto' => 'LEGACY-IMG-101',
            'nombre_producto' => 'Agua de prueba',
            'precio_compra' => 1.2,
            'precio_venta' => 3,
            'stock_minimo' => 1,
            'unidad_medida' => 'Unidad',
            'estado' => 'Activo',
            'foto' => $nuevaFoto,
        ]);
        $this->assertSame($nuevaFoto, $control->update($edicion, $id)->getData(true)['foto']);
        $this->assertDatabaseHas('productos', ['id'=>(int) $id, 'foto'=>$nuevaFoto]);

        $eliminacion = $control->destroy($id)->getData(true);
        $this->assertSame('Inactivo', $eliminacion['producto']['estado']);
        $this->assertSame($nuevaFoto, $eliminacion['producto']['foto']);
        $this->assertDatabaseHas('productos', ['id'=>(int) $id,'estado'=>'inactivo']);
    }


    public function test_importador_recupera_foto_desde_archivo_sin_sobrescribir_datos(): void
    {
        $carpeta = storage_path('framework/testing/importar_fotos_ci_'.uniqid());
        mkdir($carpeta, 0755, true);
        $archivo = $carpeta.DIRECTORY_SEPARATOR.'FOTO-LOCAL-01.png';
        file_put_contents($archivo, base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jWl8AAAAASUVORK5CYII='
        ));

        $id = DB::table('productos')->insertGetId([
            'categoria_id' => 1,
            'codigo' => 'FOTO-LOCAL-01',
            'nombre' => 'Producto con imagen de carpeta',
            'precio_compra' => 1,
            'precio_venta' => 2,
            'stock' => 6,
            'estado' => 'activo',
            'foto' => null,
        ]);

        try {
            $this->assertSame(0, Artisan::call('productos:importar-fotos', [
                'carpeta' => $carpeta,
            ]));
            $this->assertNull(DB::table('productos')->where('id',$id)->value('foto'),
                'Vista previa nunca debe escribir en la BD.');

            $this->assertSame(0, Artisan::call('productos:importar-fotos', [
                'carpeta' => $carpeta,
                '--aplicar' => true,
            ]));
            $fotoGuardada = (string) DB::table('productos')->where('id',$id)->value('foto');
            $this->assertStringStartsWith('data:image/png;base64,', $fotoGuardada);
            $this->assertSame($fotoGuardada, app(ProductoController::class)
                ->show((string) $id)->getData(true)['foto']);

            // Una segunda importación no puede modificar la foto que ya existe.
            file_put_contents($archivo, base64_decode(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jWl8AAAAASUVORK5CYII='
            ));
            $this->assertSame(0, Artisan::call('productos:importar-fotos', [
                'carpeta' => $carpeta,
                '--aplicar' => true,
            ]));
            $this->assertSame($fotoGuardada, DB::table('productos')->where('id',$id)->value('foto'));
        } finally {
            @unlink($archivo);
            @rmdir($carpeta);
        }
    }

}
