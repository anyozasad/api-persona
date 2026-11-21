<?php

namespace Tests\Feature;

use App\Http\Controllers\AsistenciaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class AccesoCodigoFlowTest extends TestCase
{
    use \Illuminate\Foundation\Testing\DatabaseTransactions;

    private int $clienteId;
    private int $membresiaId;

    protected function setUp(): void
    {
        parent::setUp();

        // Nunca eliminar ni recrear tablas en pruebas: ALTER/DROP confirma
        // automáticamente transacciones MySQL y deja rota la BD de otros tests.
        // Trabajar con el esquema real y revertir las filas al terminar.
        $this->clienteId = (int) DB::table('clientes')->insertGetId([
            'dni' => '70000011',
            'nombres' => 'Socio',
            'apellidos' => 'Barcode',
            'estado' => 'Activo',
        ], 'id_cliente');
        $this->membresiaId = (int) DB::table('membresias')->insertGetId([
            'nombre' => 'Premium Acceso Codigo',
            'duracion_meses' => 1,
            'precio' => 129,
            'estado' => 'Activo',
        ], 'id_membresia');
    }

    public function test_codigo_socio_registra_entrada_y_segundo_escaneo_registra_salida(): void
    {
        $this->activarMembresia();

        $entrada = $this->escanear('MG-'.str_pad((string) $this->clienteId, 6, '0', STR_PAD_LEFT));
        $this->assertSame(201, $entrada->getStatusCode());
        $this->assertDatabaseHas('asistencias', [
            'id_cliente' => $this->clienteId,
            'estado' => 'Dentro',
        ]);

        $salida = $this->escanear('MG-'.str_pad((string) $this->clienteId, 6, '0', STR_PAD_LEFT));
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
        $this->escanear('MG-'.str_pad((string) $this->clienteId, 6, '0', STR_PAD_LEFT));
    }

    private function activarMembresia(): void
    {
        DB::table('cliente_membresia')->insert([
                        'id_cliente' => $this->clienteId,
            'id_membresia' => $this->membresiaId,
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
