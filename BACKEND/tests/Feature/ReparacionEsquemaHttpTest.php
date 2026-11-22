<?php

namespace Tests\Feature;

use App\Models\Usuario;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ReparacionEsquemaHttpTest extends TestCase
{
    use DatabaseTransactions;

    private function token(string $rol, string $sufijo): string
    {
        $usuario = Usuario::create([
            'nombre_usuario' => 'mysql.'.$sufijo,
            'contrasena' => 'ClaveTemporal123!',
            'nombres' => 'Prueba',
            'apellidos' => 'Seguridad',
            'dni' => '9180000'.($rol === 'Administrador' ? '1' : '2'),
            'correo' => 'mysql.'.$sufijo.'@mallqui.test',
            'rol' => $rol,
            'estado' => 'Activo',
            'fecha_registro' => now(),
        ]);
        return (string) $usuario->createToken('prueba')->plainTextToken;
    }

    public function test_diagnostico_y_reparacion_no_son_publicos(): void
    {
        $this->getJson('/api/configuracion/diagnostico-esquema')->assertUnauthorized();
        $this->postJson('/api/configuracion/reparar-esquema', [
            'confirmacion' => 'RESPALDAR_Y_REPARAR',
        ])->assertUnauthorized();
    }

    public function test_cliente_no_puede_reparar_la_base(): void
    {
        $this->withHeaders(['Authorization' => 'Bearer '.$this->token('Cliente', 'cliente')])
            ->postJson('/api/configuracion/reparar-esquema', [
                'confirmacion' => 'RESPALDAR_Y_REPARAR',
            ])->assertForbidden();
    }

    public function test_solo_administrador_puede_ver_diagnostico_y_no_repara_sin_confirmacion(): void
    {
        $this->withHeaders(['Authorization' => 'Bearer '.$this->token('Administrador', 'admin')])
            ->getJson('/api/configuracion/diagnostico-esquema')
            ->assertOk()
            ->assertJsonStructure(['base_datos','total_tablas','faltantes','operativo']);

        // La operación debe detenerse ANTES de generar backup o ALTER TABLE.
        $this->postJson('/api/configuracion/reparar-esquema', [
            'confirmacion' => 'NO_AUTORIZADO',
        ])->assertUnprocessable();
    }

    public function test_con_esquema_completo_no_ejecuta_respaldo_ni_modifica_tablas(): void
    {
        $this->withHeaders(['Authorization' => 'Bearer '.$this->token('Administrador', 'completo')])
            ->postJson('/api/configuracion/reparar-esquema', [
                'confirmacion' => 'RESPALDAR_Y_REPARAR',
            ])->assertOk()->assertJsonPath('codigo','ESQUEMA_COMPLETO');
    }
}
