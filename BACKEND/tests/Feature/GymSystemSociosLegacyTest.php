<?php

namespace Tests\Feature;

use Tests\TestCase;

class GymSystemSociosLegacyTest extends TestCase
{
    public function test_el_paquete_mantiene_socios_legacy_y_clientes_modernos(): void
    {
        $migration = (string) file_get_contents(database_path('migrations/2026_10_16_100000_create_legacy_socios_table_in_gym_system.php'));
        $mirror = (string) file_get_contents(app_path('Services/GymSystemClienteMirror.php'));

        $this->assertStringContainsString("->create('socios'", $migration);
        $this->assertStringContainsString("'dni'", $migration);
        $this->assertStringContainsString("'foto'", $migration);

        $this->assertStringContainsString("table('socios')", $mirror);
        $this->assertStringContainsString("where('dni', \$cliente->dni)", $mirror);
    }
}
