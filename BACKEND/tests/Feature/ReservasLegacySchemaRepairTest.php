<?php

namespace Tests\Feature;

use App\Models\Reserva;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ReservasLegacySchemaRepairTest extends TestCase
{
    protected function tearDown(): void
    {
        // Esta prueba utiliza exclusivamente la base DB_DATABASE de phpunit.xml,
        // nunca la base privada gym_system de Windows.
        Schema::dropIfExists('reservas');
        parent::tearDown();
    }

    public function test_reservas_anteriores_se_conservan_y_las_nuevas_tienen_id_reserva(): void
    {
        Schema::dropIfExists('reservas');
        Schema::create('reservas', function (Blueprint $tabla): void {
            $tabla->bigIncrements('id');
            $tabla->string('descripcion_legacy')->nullable();
        });

        DB::table('reservas')->insert(['descripcion_legacy' => 'Reserva existente']);
        $antes = DB::table('reservas')->count();

        $migracion = require database_path(
            'migrations/2026_11_12_110000_complete_legacy_reservas_without_losing_rows.php'
        );
        $migracion->up();
        $migracion->up(); // Debe ser segura al repetirla.

        foreach (['id_reserva', 'id_cliente', 'id_clase', 'fecha_clase', 'fecha_reserva', 'estado'] as $columna) {
            $this->assertTrue(Schema::hasColumn('reservas', $columna), $columna);
        }
        $this->assertSame($antes, DB::table('reservas')->count());
        $this->assertDatabaseHas('reservas', [
            'id' => 1,
            'id_reserva' => 1,
            'descripcion_legacy' => 'Reserva existente',
        ]);

        $nueva = Reserva::create([
            'id_cliente' => 1,
            'id_clase' => 2,
            'fecha_clase' => '2026-11-20',
            'fecha_reserva' => '2026-11-12 10:00:00',
            'estado' => 'Reservada',
        ]);

        $this->assertGreaterThan(1, (int) $nueva->id_reserva);
        $this->assertDatabaseHas('reservas', [
            'id_reserva' => $nueva->id_reserva,
            'id_cliente' => 1,
            'id_clase' => 2,
            'estado' => 'Reservada',
        ]);
        $this->assertSame($antes + 1, DB::table('reservas')->count());
    }
}
