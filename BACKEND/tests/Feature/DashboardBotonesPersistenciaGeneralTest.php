<?php

namespace Tests\Feature;

use App\Http\Middleware\AuditLogMiddleware;
use App\Models\Usuario;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

/**
 * Verifica con HTTP real + MySQL temporal que los botones principales
 * hacen CRUD y que los cambios permanecen tras consultar nuevamente.
 *
 * Protegido por Tests\TestCase: nunca usa la BD local gym_system.
 */
class DashboardBotonesPersistenciaGeneralTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(AuditLogMiddleware::class);

        foreach ([
            'detalle_rutina', 'reservas', 'rutinas', 'clases', 'compras',
            'productos', 'categorias', 'proveedores', 'entrenadores',
            'clientes', 'usuarios'
        ] as $tabla) {
            Schema::dropIfExists($tabla);
        }

        Schema::create('usuarios', function (Blueprint $t) {
            $t->id('id_usuario');
            $t->string('nombre_usuario')->unique();
            $t->string('contrasena');
            $t->string('nombres');
            $t->string('apellidos');
            $t->string('dni')->unique();
            $t->string('telefono')->nullable();
            $t->string('correo')->nullable()->unique();
            $t->string('rol');
            $t->string('estado')->default('Activo');
            $t->unsignedBigInteger('id_cliente')->nullable();
            $t->unsignedBigInteger('id_entrenador')->nullable();
            $t->dateTime('fecha_registro')->nullable();
        });
        Schema::create('clientes', function (Blueprint $t) {
            $t->id('id_cliente');
            $t->string('dni')->unique();
            $t->string('nombres');
            $t->string('apellidos');
            $t->string('estado')->default('Activo');
        });
        Schema::create('entrenadores', function (Blueprint $t) {
            $t->id('id_entrenador');
            $t->string('dni')->unique();
            $t->string('nombres');
            $t->string('apellidos');
            $t->string('telefono')->nullable();
            $t->string('correo')->nullable()->unique();
            $t->string('especialidad')->nullable();
            $t->date('fecha_contratacion');
            $t->decimal('salario', 12, 2)->default(0);
            $t->string('estado')->default('Activo');
        });
        Schema::create('clases', function (Blueprint $t) {
            $t->id('id_clase');
            $t->unsignedBigInteger('id_entrenador')->nullable();
            $t->string('nombre');
            $t->string('dia_semana');
            $t->time('hora_inicio');
            $t->time('hora_fin');
            $t->integer('cupo_maximo');
            $t->string('estado')->default('Activo');
        });
        Schema::create('reservas', function (Blueprint $t) {
            $t->id('id_reserva');
            $t->unsignedBigInteger('id_cliente')->nullable();
            $t->unsignedBigInteger('id_clase')->nullable();
            $t->date('fecha_clase')->nullable();
            $t->string('estado')->default('Reservada');
        });
        Schema::create('rutinas', function (Blueprint $t) {
            $t->id('id_rutina');
            $t->unsignedBigInteger('id_cliente');
            $t->unsignedBigInteger('id_entrenador');
            $t->string('nombre_rutina');
            $t->string('objetivo')->nullable();
            $t->text('descripcion')->nullable();
            $t->date('fecha_inicio');
            $t->date('fecha_fin')->nullable();
            $t->string('estado')->default('Activo');
        });
        Schema::create('detalle_rutina', function (Blueprint $t) {
            $t->id('id_detalle_rutina');
            $t->unsignedBigInteger('id_rutina');
            $t->string('ejercicio');
            $t->integer('series');
            $t->integer('repeticiones');
            $t->decimal('peso_recomendado', 10, 2)->nullable();
            $t->integer('descanso_segundos')->nullable();
            $t->string('observaciones')->nullable();
        });
        Schema::create('proveedores', function (Blueprint $t) {
            $t->id('id_proveedor');
            $t->string('ruc')->unique();
            $t->string('razon_social');
            $t->string('contacto')->nullable();
            $t->string('telefono')->nullable();
            $t->string('correo')->nullable();
            $t->string('direccion')->nullable();
            $t->string('estado')->default('Activo');
        });
        Schema::create('compras', function (Blueprint $t) {
            $t->id('id_compra');
            $t->unsignedBigInteger('id_proveedor');
        });
        Schema::create('categorias', function (Blueprint $t) {
            $t->id('id_categoria');
            $t->string('nombre_categoria')->unique();
            $t->string('descripcion')->nullable();
            $t->string('estado')->default('Activo');
        });
        Schema::create('productos', function (Blueprint $t) {
            $t->id('id_producto');
            $t->unsignedBigInteger('id_categoria');
        });

        DB::table('usuarios')->insert([
            'id_usuario'=>1, 'nombre_usuario'=>'admin.botones.prueba',
            'contrasena'=>bcrypt('Password123'),
            'nombres'=>'Admin', 'apellidos'=>'Pruebas',
            'dni'=>'79999851', 'correo'=>'admin.botones@example.test',
            'rol'=>'Administrador', 'estado'=>'Activo',
            'fecha_registro'=>now(),
        ]);
        DB::table('clientes')->insert([
            'id_cliente'=>1, 'dni'=>'70000851',
            'nombres'=>'Cliente', 'apellidos'=>'Persistencia',
            'estado'=>'Activo',
        ]);

        $this->actingAs(Usuario::findOrFail(1), 'sanctum');
    }

    public function test_categoria_se_crea_edita_desactiva_y_se_lee_de_mysql(): void
    {
        $id = (int) $this->postJson('/api/categorias', [
            'nombre_categoria'=>'Suplementos test',
            'descripcion'=>'Categoría de prueba',
        ])->assertCreated()->json('id_categoria');
        $this->assertGreaterThan(0, $id);
        $this->assertDatabaseHas('categorias', [
            'id_categoria'=>$id, 'nombre_categoria'=>'Suplementos test',
        ]);
        $this->getJson('/api/categorias')->assertOk()
            ->assertJsonFragment(['nombre_categoria'=>'Suplementos test']);
        $this->putJson('/api/categorias/'.$id, [
            'nombre_categoria'=>'Accesorios test',
        ])->assertOk()->assertJsonPath('nombre_categoria','Accesorios test');
        $this->assertDatabaseHas('categorias', [
            'id_categoria'=>$id, 'nombre_categoria'=>'Accesorios test',
        ]);
        $this->deleteJson('/api/categorias/'.$id)->assertOk();
        $this->assertDatabaseHas('categorias',['id_categoria'=>$id,'estado'=>'Inactivo']);
    }

    public function test_proveedor_se_crea_actualiza_y_se_conserva_en_mysql(): void
    {
        $id = (int) $this->postJson('/api/proveedores', [
            'ruc'=>'20999888777', 'razon_social'=>'Proveedor Mallqui Prueba',
            'contacto'=>'Contacto', 'estado'=>'Activo',
        ])->assertCreated()->json('id_proveedor');
        $this->assertGreaterThan(0, $id);
        $this->getJson('/api/proveedores')->assertOk()
            ->assertJsonFragment(['razon_social'=>'Proveedor Mallqui Prueba']);
        $this->putJson('/api/proveedores/'.$id,[
            'razon_social'=>'Proveedor Actualizado Prueba',
        ])->assertOk()->assertJsonPath('razon_social','Proveedor Actualizado Prueba');
        $this->assertDatabaseHas('proveedores',[
            'id_proveedor'=>$id,'razon_social'=>'Proveedor Actualizado Prueba'
        ]);
        $this->deleteJson('/api/proveedores/'.$id)->assertOk();
        $this->assertDatabaseHas('proveedores',['id_proveedor'=>$id,'estado'=>'Inactivo']);
    }

    public function test_entrenador_y_cuenta_se_guardan_y_se_actualizan_juntos(): void
    {
        $r = $this->postJson('/api/entrenadores', [
            'dni'=>'70999855','nombres'=>'Profesor','apellidos'=>'Pruebas',
            'correo'=>'entrenador.botones@example.test',
            'fecha_contratacion'=>'2026-11-23',
            'salario'=>1000,'especialidad'=>'Fuerza','estado'=>'Activo',
            'crear_acceso'=>true,
            'nombre_usuario'=>'entrenador.botones',
            'contrasena'=>'Password123',
        ])->assertCreated()->json();
        $id = (int) ($r['entrenador']['id_entrenador'] ?? 0);
        $this->assertGreaterThan(0,$id);
        $this->assertDatabaseHas('entrenadores',['id_entrenador'=>$id,'dni'=>'70999855']);
        $this->assertDatabaseHas('usuarios',[
            'id_entrenador'=>$id,'rol'=>'Entrenador','estado'=>'Activo'
        ]);
        $this->putJson('/api/entrenadores/'.$id,['especialidad'=>'Funcional',
            'nombres'=>'Entrenador'])->assertOk();
        $this->assertDatabaseHas('entrenadores',[
            'id_entrenador'=>$id,'especialidad'=>'Funcional','nombres'=>'Entrenador'
        ]);
        $this->assertDatabaseHas('usuarios',[
            'id_entrenador'=>$id,'nombres'=>'Entrenador'
        ]);
        $this->getJson('/api/entrenadores')->assertOk()
            ->assertJsonFragment(['especialidad'=>'Funcional']);
    }

    public function test_clase_y_rutina_se_guardan_y_vuelven_a_cargar_en_mysql(): void
    {
        $entrenador = $this->postJson('/api/entrenadores',[
            'dni'=>'70999856','nombres'=>'Entrenador','apellidos'=>'Clases',
            'fecha_contratacion'=>'2026-11-23','salario'=>950,
        ])->assertCreated()->json('entrenador');
        $idEntrenador = (int) $entrenador['id_entrenador'];

        $clase=$this->postJson('/api/clases',[
            'id_entrenador'=>$idEntrenador,'nombre'=>'Fuerza y masa muscular',
            'dia_semana'=>'Miércoles','hora_inicio'=>'18:00','hora_fin'=>'19:00',
            'cupo_maximo'=>15,'estado'=>'Activo'
        ])->assertCreated()->json();
        $idClase=(int) ($clase['id_clase'] ?? 0);
        $this->assertGreaterThan(0,$idClase);
        $this->assertDatabaseHas('clases',[
            'id_clase'=>$idClase,'dia_semana'=>'Miércoles'
        ]);
        $this->getJson('/api/clases')->assertOk()
            ->assertJsonFragment(['nombre'=>'Fuerza y masa muscular']);
        $this->putJson('/api/clases/'.$idClase,[
            'nombre'=>'Clase funcional actualizada'
        ])->assertOk()->assertJsonPath('nombre','Clase funcional actualizada');
        $this->assertDatabaseHas('clases',[
            'id_clase'=>$idClase,'nombre'=>'Clase funcional actualizada'
        ]);

        $rutina = $this->postJson('/api/rutinas', [
            'id_cliente'=>1,'id_entrenador'=>$idEntrenador,
            'nombre_rutina'=>'Rutina Mallqui',
            'fecha_inicio'=>'2026-11-25','estado'=>'Activo',
            'detalles'=>[[
                'ejercicio'=>'Sentadillas','series'=>3,'repeticiones'=>12,
            ]]
        ])->assertCreated()->json();
        $idRutina=(int) ($rutina['id_rutina'] ?? 0);
        $this->assertGreaterThan(0,$idRutina);
        $this->assertDatabaseHas('rutinas',[
            'id_rutina'=>$idRutina,'id_cliente'=>1,'nombre_rutina'=>'Rutina Mallqui'
        ]);
        $this->assertDatabaseHas('detalle_rutina',[
            'id_rutina'=>$idRutina,'ejercicio'=>'Sentadillas','series'=>3
        ]);
        $this->getJson('/api/rutinas')->assertOk()
            ->assertJsonFragment(['nombre_rutina'=>'Rutina Mallqui']);
        $this->putJson('/api/rutinas/'.$idRutina,[
            'nombre_rutina'=>'Rutina verificada'
        ])->assertOk()->assertJsonPath('nombre_rutina','Rutina verificada');
        $this->assertDatabaseHas('rutinas',[
            'id_rutina'=>$idRutina,'nombre_rutina'=>'Rutina verificada'
        ]);
    }

    public function test_usuario_administrativo_se_guarda_actualiza_y_desactiva(): void
    {
        $r=$this->postJson('/api/usuarios', [
            'nombre_usuario'=>'segundo.admin.botones',
            'contrasena'=>'Password123',
            'nombres'=>'Segundo','apellidos'=>'Administrador',
            'dni'=>'79999852',
            'correo'=>'segundo.admin@example.test',
            'rol'=>'Administrador','estado'=>'Activo',
        ])->assertCreated()->json();
        $id=(int) ($r['id_usuario'] ?? 0);
        $this->assertGreaterThan(0,$id);
        $this->assertDatabaseHas('usuarios',[
            'id_usuario'=>$id,'nombre_usuario'=>'segundo.admin.botones'
        ]);
        $this->putJson('/api/usuarios/'.$id,[
            'nombres'=>'Admin Verificado'
        ])->assertOk()->assertJsonPath('nombres','Admin Verificado');
        $this->getJson('/api/usuarios')->assertOk()
            ->assertJsonFragment(['nombres'=>'Admin Verificado']);
        $this->deleteJson('/api/usuarios/'.$id)->assertOk();
        $this->assertDatabaseHas('usuarios',['id_usuario'=>$id,'estado'=>'Inactivo']);
    }
}
