<?php

namespace Tests\Feature;

use App\Http\Middleware\AuditLogMiddleware;
use App\Models\Usuario;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class AdminGymRecordCrudFlowTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(AuditLogMiddleware::class);

        Schema::dropIfExists('admin_gym_records');
        Schema::dropIfExists('usuarios');

        Schema::create('admin_gym_records', function (Blueprint $table) {
            $table->id();
            $table->string('modulo', 40)->index();
            $table->string('titulo', 180);
            $table->string('subtitulo', 255)->nullable();
            $table->string('estado', 50)->default('Activo');
            $table->date('fecha')->nullable();
            $table->decimal('monto', 12, 2)->nullable();
            $table->string('imagen_url', 500)->nullable();
            $table->json('datos')->nullable();
            $table->timestamps();
        });
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
        DB::table('usuarios')->insert([
            [
                'id_usuario'=>1,'nombre_usuario'=>'admin.crud',
                'contrasena'=>bcrypt('Password123'),'nombres'=>'Admin',
                'apellidos'=>'CRUD','dni'=>'79999551','rol'=>'Administrador',
                'estado'=>'Activo',
            ],
            [
                'id_usuario'=>2,'nombre_usuario'=>'cliente.crud',
                'contrasena'=>bcrypt('Password123'),'nombres'=>'Cliente',
                'apellidos'=>'CRUD','dni'=>'79999552','rol'=>'Cliente',
                'estado'=>'Activo',
            ],
        ]);
        $this->actingAs(Usuario::findOrFail(1), 'sanctum');
    }

    public function test_ochos_modulos_secundarios_persisten_y_actualizan_datos_en_mysql(): void
    {
        foreach (['nutricion','equipos','eventos','galeria','noticias','salarios','ingresos','facturas'] as $modulo) {
            $datos = [
                'titulo'=>'Registro '.$modulo,
                'subtitulo'=>'Datos del gimnasio',
                'fecha'=>'2026-11-19',
                'estado'=>'Activo',
                'monto'=>90.25,
                'datos'=>['detalle'=>'Nota guardada de '.$modulo],
            ];
            $creado = $this->postJson('/api/admin-gym-registros/'.$modulo, $datos)
                ->assertCreated()
                ->assertJsonPath('titulo', 'Registro '.$modulo)
                ->json();
            $id = (int) $creado['id'];
            $this->assertGreaterThan(0, $id);

            $this->getJson('/api/admin-gym-registros/'.$modulo)
                ->assertOk()->assertJsonCount(1)
                ->assertJsonPath('0.datos.detalle', 'Nota guardada de '.$modulo);

            $this->putJson('/api/admin-gym-registros/'.$modulo.'/'.$id, array_merge($datos, [
                'titulo'=>'Actualizado '.$modulo,
                'monto'=>99.50,
            ]))->assertOk()->assertJsonPath('titulo', 'Actualizado '.$modulo);

            $this->patchJson('/api/admin-gym-registros/'.$modulo.'/'.$id.'/estado', [
                'estado'=>'Finalizado',
            ])->assertOk()->assertJsonPath('estado', 'Finalizado');

            $this->assertDatabaseHas('admin_gym_records', [
                'id'=>$id,'modulo'=>$modulo,'titulo'=>'Actualizado '.$modulo,
                'estado'=>'Finalizado','monto'=>99.50,
            ]);

            $this->deleteJson('/api/admin-gym-registros/'.$modulo.'/'.$id)
                ->assertOk()->assertJsonPath('ok', true);

            $this->assertDatabaseMissing('admin_gym_records',['id'=>$id]);
        }
    }

    public function test_no_permite_modulos_invalidos_editar_otros_modulos_ni_montos_negativos(): void
    {
        $creado=$this->postJson('/api/admin-gym-registros/equipos', [
            'titulo'=>'Equipo controlado','estado'=>'Operativo',
            'monto'=>100,'fecha'=>'2026-11-19',
        ])->assertCreated()->json();

        $this->postJson('/api/admin-gym-registros/equipos', [
            'titulo'=>'Monto inválido','estado'=>'Operativo','monto'=>-100,
        ])->assertUnprocessable()->assertJsonValidationErrors(['monto']);

        $this->getJson('/api/admin-gym-registros/no-existe')->assertNotFound();

        $this->putJson('/api/admin-gym-registros/eventos/'.$creado['id'], [
            'titulo'=>'Cambio indebido','estado'=>'Programado',
        ])->assertNotFound();

        $this->deleteJson('/api/admin-gym-registros/galeria/'.$creado['id'])->assertNotFound();

        $this->assertDatabaseHas('admin_gym_records', [
            'id'=>$creado['id'],'modulo'=>'equipos','titulo'=>'Equipo controlado',
        ]);
    }

    public function test_cliente_no_puede_acceder_al_crud_administrativo(): void
    {
        $this->actingAs(Usuario::findOrFail(2), 'sanctum');
        $this->getJson('/api/admin-gym-registros/equipos')->assertForbidden();
        $this->postJson('/api/admin-gym-registros/equipos', [
            'titulo'=>'Registro no autorizado','estado'=>'Operativo',
        ])->assertForbidden();
        $this->assertDatabaseCount('admin_gym_records', 0);
    }
}
