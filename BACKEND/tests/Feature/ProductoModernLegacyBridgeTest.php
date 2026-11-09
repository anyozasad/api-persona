<?php

namespace Tests\Feature;

use App\Http\Controllers\GymSystemAdminController;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ProductoModernLegacyBridgeTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Schema::disableForeignKeyConstraints();
        try {
            foreach (['productos','categorias','clientes'] as $tabla) Schema::dropIfExists($tabla);
        } finally {
            Schema::enableForeignKeyConstraints();
        }
        Schema::create('clientes', function (Blueprint $tabla) {
            $tabla->id('id_cliente');
        });
        Schema::create('categorias', function (Blueprint $tabla) {
            $tabla->id('id_categoria');
            $tabla->string('nombre_categoria');
            $tabla->string('estado')->default('Activo');
        });
        Schema::create('productos', function (Blueprint $tabla) {
            $tabla->id('id_producto');
            $tabla->unsignedBigInteger('id_categoria');
            $tabla->string('codigo_producto')->unique();
            $tabla->string('nombre_producto');
            $tabla->text('descripcion')->nullable();
            $tabla->mediumText('foto')->nullable();
            $tabla->decimal('precio_compra',10,2)->default(0);
            $tabla->decimal('precio_venta',10,2);
            $tabla->integer('stock')->default(0);
            $tabla->integer('stock_minimo')->default(5);
            $tabla->string('unidad_medida')->default('Unidad');
            $tabla->dateTime('fecha_registro')->nullable();
            $tabla->string('estado')->default('Activo');
        });

        DB::table('categorias')->insert([
            'id_categoria'=>1,'nombre_categoria'=>'Proteínas','estado'=>'Activo'
        ]);
    }

    public function test_ruta_compatibilidad_guarda_y_muestra_producto_en_base_moderna(): void
    {
        $controller=app(GymSystemAdminController::class);
        $foto='data:image/webp;base64,'.base64_encode('imagen-ejemplo');
        $request=Request::create('/api/gym-admin/productos','POST',[
            'id_categoria'=>1,'codigo_producto'=>'MOD-101',
            'nombre_producto'=>'Proteína de prueba',
            'foto'=>$foto,'precio_compra'=>20,'precio_venta'=>40,
            'stock'=>3,'stock_minimo'=>1,'unidad_medida'=>'Unidad','estado'=>'Activo'
        ]);

        $respuesta=$controller->guardarProducto($request);
        $this->assertSame(201,$respuesta->getStatusCode());
        $this->assertDatabaseHas('productos',[
            'codigo_producto'=>'MOD-101','nombre_producto'=>'Proteína de prueba','foto'=>$foto
        ]);

        $lista=$controller->productos()->getData(true);
        $this->assertCount(1,$lista);
        $this->assertSame($foto,$lista[0]['foto']);
        $this->assertSame('Proteína de prueba',$lista[0]['nombre_producto']);
    }

    public function test_editar_producto_moderno_conserva_stock_y_permita_quitar_foto(): void
    {
        DB::table('productos')->insert([
            'id_producto'=>1,'id_categoria'=>1,'codigo_producto'=>'MOD-102',
            'nombre_producto'=>'Producto inicial','foto'=>'data:image/png;base64,AA==',
            'precio_compra'=>20,'precio_venta'=>40,
            'stock'=>9,'stock_minimo'=>2,'unidad_medida'=>'Unidad','estado'=>'Activo'
        ]);
        $controller=app(GymSystemAdminController::class);
        $request=Request::create('/api/gym-admin/productos/1','PUT',[
            'precio_venta'=>45,'foto'=>null
        ]);
        $resultado=$controller->actualizarProducto($request,'1');

        $this->assertSame(200,$resultado->getStatusCode());
        $this->assertDatabaseHas('productos',['id_producto'=>1,'stock'=>9,'precio_venta'=>45]);
        $this->assertNull(DB::table('productos')->where('id_producto',1)->value('foto'));
    }
}
