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

    public function test_fotografias_de_los_diez_productos_de_prueba_se_instalan_solas_sin_cambiar_stock_ni_precios(): void
    {
        DB::table('categorias')->insert([
            ['id'=>2,'nombre'=>'Accesorios','estado'=>'activo'],
            ['id'=>3,'nombre'=>'Suplementos','estado'=>'activo'],
        ]);
        for ($n = 1; $n <= 10; $n++) {
            DB::table('productos')->insert([
                'categoria_id'=>1,
                'codigo'=>'PROD-'.str_pad((string)$n,3,'0',STR_PAD_LEFT),
                'nombre'=>'Producto Prueba '.$n,
                'precio_compra'=>20,
                'precio_venta'=>49,
                'stock'=>20 + $n,
                'estado'=>'activo',
                'foto'=>null,
            ]);
        }

        $control = app(ProductoController::class);
        $resultado = $control->completarFotosIniciales();
        $this->assertSame(200,$resultado->getStatusCode());
        $this->assertSame(10,$resultado->getData(true)['actualizados']);

        $productos = DB::table('productos')->orderBy('codigo')->get();
        $this->assertCount(10,$productos);
        foreach ($productos as $indice => $producto) {
            $this->assertStringStartsWith('data:image/jpeg;base64,',$producto->foto);
            $this->assertSame('49.00',(string)$producto->precio_venta);
            $this->assertSame(21 + $indice,(int)$producto->stock);
            $this->assertNotSame('Producto Prueba '.($indice+1),$producto->nombre);
        }
        $this->assertSame('Creatina',$productos[0]->nombre);
        $this->assertSame('Shaker gris',$productos[1]->nombre);
        $this->assertSame(2,(int)$productos[1]->categoria_id);
        $this->assertSame(3,(int)$productos[0]->categoria_id);

        // Idempotente: la segunda visita no vuelve a cambiar datos.
        $segunda = $control->completarFotosIniciales();
        $this->assertSame(0,$segunda->getData(true)['actualizados']);
        $this->assertSame($productos[0]->foto,
            DB::table('productos')->where('codigo','PROD-001')->value('foto'));
    }

    public function test_producto_diez_usa_codigo_prod_0010_como_en_el_dashboard(): void
    {
        DB::table('categorias')->insert(['id'=>3,'nombre'=>'Suplementos','estado'=>'activo']);
        DB::table('productos')->insert([
            'categoria_id'=>1,'codigo'=>'PROD-0010',
            'nombre'=>'Producto Prueba 10','precio_compra'=>9,
            'precio_venta'=>29,'stock'=>69,'estado'=>'activo','foto'=>null,
        ]);
        $resultado = app(ProductoController::class)->completarFotosIniciales()->getData(true);
        $this->assertSame(1,$resultado['actualizados']);
        $foto = DB::table('productos')->where('codigo','PROD-0010')->first();
        $this->assertSame('NOXRAGE (presentación alternativa)',$foto->nombre);
        $this->assertSame(69,(int)$foto->stock);
        $this->assertSame('29.00',(string)$foto->precio_venta);
        $this->assertStringStartsWith('data:image/jpeg;base64,',$foto->foto);
    }

    public function test_no_se_modifican_productos_reales_ni_fotografias_que_ya_estan_guardadas(): void
    {
        DB::table('categorias')->insert(['id'=>3,'nombre'=>'Suplementos','estado'=>'activo']);
        DB::table('productos')->insert([
            ['categoria_id'=>1,'codigo'=>'PROD-001','nombre'=>'Agua natural',
             'precio_compra'=>2,'precio_venta'=>4,'stock'=>10,'estado'=>'activo','foto'=>null],
            ['categoria_id'=>1,'codigo'=>'PROD-003','nombre'=>'Producto Prueba 3',
             'precio_compra'=>2,'precio_venta'=>5,'stock'=>7,'estado'=>'activo',
             'foto'=>'data:image/png;base64,AA=='],
        ]);
        $resultado = app(ProductoController::class)->completarFotosIniciales()->getData(true);
        $this->assertSame(0,$resultado['actualizados']);
        $this->assertDatabaseHas('productos',['codigo'=>'PROD-001','nombre'=>'Agua natural','foto'=>null,'stock'=>10]);
        $this->assertDatabaseHas('productos',['codigo'=>'PROD-003','nombre'=>'Producto Prueba 3','foto'=>'data:image/png;base64,AA==']);
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

    public function test_subir_foto_directamente_conserva_precio_y_stock(): void
    {
        $id = DB::table('productos')->insertGetId([
            'categoria_id' => 1,
            'codigo' => 'IMG-FILA-05',
            'nombre' => 'Producto de prueba sin fotografía',
            'precio_compra' => 9,
            'precio_venta' => 17,
            'stock' => 23,
            'estado' => 'activo',
            'foto' => null,
        ]);
        $foto = 'data:image/png;base64,'
            .'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jWl8AAAAASUVORK5CYII=';
        $request = Request::create('/api/productos/'.$id.'/foto', 'PATCH', ['foto' => $foto]);

        $respuesta = app(ProductoController::class)->actualizarFoto($request, (string) $id);
        $this->assertSame($foto, $respuesta->getData(true)['foto']);
        $this->assertDatabaseHas('productos', [
            'id' => $id, 'codigo' => 'IMG-FILA-05', 'foto' => $foto,
            'precio_venta' => 17, 'stock' => 23,
        ]);
    }

    public function test_subir_foto_rechaza_archivo_disfrazado(): void
    {
        $id = DB::table('productos')->insertGetId([
            'categoria_id' => 1, 'codigo' => 'IMG-NO-VALIDA',
            'nombre' => 'Producto sin foto', 'precio_compra' => 1,
            'precio_venta' => 2, 'stock' => 4, 'estado' => 'activo',
            'foto' => null,
        ]);
        $request = Request::create('/api/productos/'.$id.'/foto', 'PATCH', [
            'foto' => 'data:image/png;base64,'.base64_encode('contenido falso'),
        ]);

        try {
            app(ProductoController::class)->actualizarFoto($request, (string) $id);
            $this->fail('La API debe rechazar un archivo que no es una imagen.');
        } catch (HttpException $e) {
            $this->assertSame(422, $e->getStatusCode());
        }
        $this->assertNull(DB::table('productos')->where('id', $id)->value('foto'));
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
