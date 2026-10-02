<?php

namespace Tests\Feature;

use App\Http\Controllers\AsistenciaController;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class AccesoCodigoFlowTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        foreach (['asistencias', 'cliente_membresia', 'membresias', 'clientes'] as $tabla) {
            Schema::dropIfExists($tabla);
        }

        Schema::create('clientes', function (Blueprint $table) {
            $table->id('id_cliente');
            $table->string('dni')->unique();
            $table->string('nombres');
            $table->string('apellidos');
            $table->string('estado')->default('Activo');
        });

        Schema::create('membresias', function (Blueprint $table) {
            $table->id('id_membresia');
            $table->string('nombre');
            $table->unsignedInteger('duracion_meses');
            $table->decimal('precio', 10, 2);
            $table->string('estado')->default('Activo');
        });

        Schema::create('cliente_membresia', function (Blueprint $table) {
            $table->id('id_cliente_membresia');
            $table->unsignedBigInteger('id_cliente');
            $table->unsignedBigInteger('id_membresia');
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->string('estado');
        });

        Schema::create('asistencias', function (Blueprint $table) {
            $table->id('id_asistencia');
            $table->unsignedBigInteger('id_cliente');
            $table->dateTime('fecha_hora_entrada');
            $table->dateTime('fecha_hora_salida')->nullable();
            $table->text('observacion')->nullable();
            $table->string('estado');
        });

        DB::table('clientes')->insert([
            'id_cliente' => 1,
            'dni' => '70000011',
            'nombres' => 'Socio',
            'apellidos' => 'Barcode',
            'estado' => 'Activo',
        ]);

        DB::table('membresias')->insert([
            'id_membresia' => 1,
            'nombre' => 'Premium',
            'duracion_meses' => 1,
            'precio' => 129,
            'estado' => 'Activo',
        ]);
    }

    public function test_codigo_socio_registra_entrada_y_segundo_escaneo_registra_salida(): void
    {
        $this->activarMembresia();

        $entrada = $this->escanear('MG-000001');
        $this->assertSame(201, $entrada->getStatusCode());
        $this->assertDatabaseHas('asistencias', [
            'id_cliente' => 1,
            'estado' => 'Dentro',
        ]);

        $salida = $this->escanear('MG-000001');
        $this->assertSame(200, $salida->getStatusCode());

        $registro = DB::table('asistencias')->where('id_cliente', 1)->first();
        $this->assertNotNull($registro->fecha_hora_salida);
        $this->assertSame('Completado', $registro->estado);
    }

    public function test_dni_tambien_puede_usarse_en_recepcion(): void
    {
        $this->activarMembresia();

        $response = $this->escanear('70000011');

        $this->assertSame(201, $response->getStatusCode());
        $this->assertDatabaseCount('asistencias', 1);
    }

    public function test_sin_membresia_vigente_el_acceso_es_denegado(): void
    {
        $this->expectException(ValidationException::class);
        $this->escanear('MG-000001');
    }

    private function activarMembresia(): void
    {
        DB::table('cliente_membresia')->insert([
            'id_cliente_membresia' => 1,
            'id_cliente' => 1,
            'id_membresia' => 1,
            'fecha_inicio' => today()->subDay()->toDateString(),
            'fecha_fin' => today()->addMonth()->toDateString(),
            'estado' => 'Activo',
        ]);
    }

    private function escanear(string $codigo)
    {
        $request = Request::create('/api/asistencias/acceso', 'POST', ['codigo' => $codigo]);

        return app(AsistenciaController::class)->accesoPorCodigo($request);
    }
}
