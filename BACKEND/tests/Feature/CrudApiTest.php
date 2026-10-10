<?php

namespace Tests\Feature;

use App\Http\Middleware\AuditLogMiddleware;
use App\Models\Usuario;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class CrudApiTest extends TestCase
{
    private string $ruta = '/api/productos';

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(AuditLogMiddleware::class);

        foreach (['productos', 'categorias', 'usuarios'] as $tabla) {
            Schema::dropIfExists($tabla);
        }

        Schema::create('usuarios', function (Blueprint $table) {
            $table->id('id_usuario');
            $table->string('nombre_usuario')->unique();
            $table->string('contrasena');
            $table->string('nombres');
            $table->string('apellidos');
            $table->string('dni')->unique();
            $table->string('telefono')->nullable();
            $table->string('correo')->nullable();
            $table->string('rol');
            $table->string('estado')->default('Activo');
            $table->unsignedBigInteger('id_cliente')->nullable();
            $table->unsignedBigInteger('id_entrenador')->nullable();
            $table->dateTime('fecha_registro')->nullable();
        });

        Schema::create('categorias', function (Blueprint $table) {
            $table->id('id_categoria');
            $table->string('nombre_categoria');
            $table->text('descripcion')->nullable();
            $table->string('estado')->default('Activo');
        });

        Schema::create('productos', function (Blueprint $table) {
            $table->id('id_producto');
            $table->unsignedBigInteger('id_categoria');
            $table->string('codigo_producto')->unique();
            $table->string('nombre_producto');
            $table->text('descripcion')->nullable();
            $table->decimal('precio_compra', 10, 2)->default(0);
            $table->decimal('precio_venta', 10, 2);
            $table->unsignedInteger('stock')->default(0);
            $table->unsignedInteger('stock_minimo')->default(0);
            $table->string('unidad_medida');
            $table->dateTime('fecha_registro')->nullable();
            $table->string('estado')->default('Activo');
        });

        DB::table('categorias')->insert([
            'id_categoria' => 1,
            'nombre_categoria' => 'Bebidas',
            'descripcion' => 'Categoría de prueba',
            'estado' => 'Activo',
        ]);

        DB::table('usuarios')->insert([
            'id_usuario' => 1,
            'nombre_usuario' => 'admin.pruebas',
            'contrasena' => bcrypt('Password123'),
            'nombres' => 'Admin',
            'apellidos' => 'Pruebas',
            'dni' => '79999991',
            'telefono' => '999999999',
            'correo' => 'admin.pruebas@mallqui.test',
            'rol' => 'Administrador',
            'estado' => 'Activo',
            'fecha_registro' => now(),
        ]);

        $admin = Usuario::findOrFail(1);
        $this->actingAs($admin, 'sanctum');
    }

    private function datosValidos(array $cambios = []): array
    {
        return array_merge([
            'id_categoria' => 1,
            'codigo_producto' => 'TEST-001',
            'nombre_producto' => 'Bebida de prueba',
            'descripcion' => 'Registro creado solo para pruebas automáticas.',
            'precio_compra' => 5.00,
            'precio_venta' => 8.50,
            'stock' => 10,
            'stock_minimo' => 2,
            'unidad_medida' => 'Unidad',
            'estado' => 'Activo',
        ], $cambios);
    }

    public function test_puedo_listar_productos(): void
    {
        DB::table('productos')->insert([
            'id_categoria' => 1,
            'codigo_producto' => 'LIST-001',
            'nombre_producto' => 'Producto listado',
            'precio_compra' => 4,
            'precio_venta' => 7,
            'stock' => 5,
            'stock_minimo' => 1,
            'unidad_medida' => 'Unidad',
            'fecha_registro' => now(),
            'estado' => 'Activo',
        ]);

        $this->getJson($this->ruta)
            ->assertOk()
            ->assertJsonFragment(['nombre_producto' => 'Producto listado']);
    }

    public function test_puedo_crear_producto_valido(): void
    {
        $this->postJson($this->ruta, $this->datosValidos())
            ->assertStatus(201)
            ->assertJsonFragment(['nombre_producto' => 'Bebida de prueba']);

        $this->assertDatabaseHas('productos', [
            'codigo_producto' => 'TEST-001',
            'nombre_producto' => 'Bebida de prueba',
        ]);
    }

    public function test_rechaza_nombre_obligatorio_vacio(): void
    {
        $datos = $this->datosValidos(['nombre_producto' => '']);

        $this->postJson($this->ruta, $datos)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['nombre_producto']);
    }

    public function test_rechaza_precio_negativo(): void
    {
        $datos = $this->datosValidos(['precio_venta' => -10]);

        $this->postJson($this->ruta, $datos)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['precio_venta']);
    }

    public function test_puedo_actualizar_producto(): void
    {
        $creado = $this->postJson($this->ruta, $this->datosValidos())
            ->assertStatus(201)
            ->json();

        $id = (int) ($creado['id_producto'] ?? 1);

        $this->putJson("{$this->ruta}/{$id}", [
            'nombre_producto' => 'Bebida actualizada',
            'precio_venta' => 9.50,
        ])->assertOk();

        $this->assertDatabaseHas('productos', [
            'id_producto' => $id,
            'nombre_producto' => 'Bebida actualizada',
        ]);
    }

    public function test_eliminar_desactiva_producto_y_conserva_historial(): void
    {
        $creado = $this->postJson($this->ruta, $this->datosValidos())
            ->assertStatus(201)
            ->json();

        $id = (int) ($creado['id_producto'] ?? 1);

        $this->deleteJson("{$this->ruta}/{$id}")
            ->assertOk()
            ->assertJsonFragment(['mensaje' => 'Producto desactivado correctamente. Se conserva su historial.']);

        $this->assertDatabaseHas('productos', [
            'id_producto' => $id,
            'estado' => 'Inactivo',
        ]);
    }
}
