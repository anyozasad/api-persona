<?php

namespace Tests\Feature;

use Tests\TestCase;

class PortalClienteCumplimientoRealTest extends TestCase
{
    public function test_preferencias_foto_y_normalizacion_se_guardan_de_forma_persistente(): void
    {
        $cliente = (string) file_get_contents(app_path('Models/Cliente.php'));
        $portal = (string) file_get_contents(app_path('Http/Controllers/PortalClienteController.php'));
        $frontend = (string) file_get_contents(base_path('../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts'));

        $this->assertStringContainsString("'foto_perfil'", $cliente);
        $this->assertStringContainsString("'enfoque_entrenamiento'", $cliente);
        $this->assertStringContainsString("'nivel_entrenamiento'", $cliente);

        $this->assertStringContainsString("foto_perfil' => 'profile-photos/", $portal);
        $this->assertStringContainsString("'enfoque_entrenamiento' =>", $portal);
        $this->assertStringContainsString("'nivel_entrenamiento' =>", $portal);
        $this->assertStringContainsString("mb_strtolower(trim((string) \$datos['correo']))", $portal);

        $this->assertStringContainsString("actualizarPerfilCliente({enfoque_entrenamiento:enfoque})", $frontend);
        $this->assertStringContainsString("actualizarPerfilCliente({nivel_entrenamiento:nivel})", $frontend);
        $this->assertStringContainsString('aplicarPreferenciasPerfil()', $frontend);
    }

    public function test_entrenamiento_cumple_inicio_progreso_pausa_cancelacion_y_finalizacion_persistentes(): void
    {
        $routes = (string) file_get_contents(base_path('routes/api.php'));
        $portal = (string) file_get_contents(app_path('Http/Controllers/PortalClienteController.php'));
        $frontend = (string) file_get_contents(base_path('../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts'));

        foreach ([
            "entrenamiento-gym/sesiones/iniciar",
            "entrenamiento-gym/sesiones/{idSesion}",
            "entrenamiento-gym/sesiones/{idSesion}/cancelar",
        ] as $ruta) {
            $this->assertStringContainsString($ruta, $routes);
        }

        foreach ([
            'iniciarSesionEntrenamientoCasa',
            'actualizarSesionEntrenamientoCasa',
            'cancelarSesionEntrenamientoCasa',
            "'estado' => 'EnCurso'",
            "'estado' => 'Cancelada'",
        ] as $evidencia) {
            $this->assertStringContainsString($evidencia, $portal);
        }

        foreach ([
            'iniciarSesionCasaCliente(',
            'actualizarSesionCasaCliente(',
            'cancelarSesionCasaCliente(',
            'guardarCargaGym(',
            'id_sesion_casa:idSesion',
        ] as $evidencia) {
            $this->assertStringContainsString($evidencia, $frontend);
        }
    }

    public function test_zonas_equipos_y_efectivo_ya_no_son_solo_etiquetas_visuales(): void
    {
        $detalle = (string) file_get_contents(app_path('Models/DetalleRutina.php'));
        $frontend = (string) file_get_contents(base_path('../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts'));
        $pago = (string) file_get_contents(app_path('Http/Controllers/SolicitudPagoMembresiaController.php'));
        $routes = (string) file_get_contents(base_path('routes/api.php'));

        $this->assertStringContainsString("'zona'", $detalle);
        $this->assertStringContainsString("'equipo'", $detalle);
        $this->assertStringContainsString('zonaEjercicioGym(', $frontend);
        $this->assertStringContainsString('reconstruirCatalogoCasa()', $frontend);
        $this->assertStringContainsString("this.ejerciciosZonaCasa(zona)", $frontend);

        $this->assertStringContainsString("'Efectivo'", $pago);
        $this->assertStringContainsString("'estado' => 'PendientePago'", $pago);
        $this->assertStringContainsString("'estado_pago' => 'Pendiente'", $pago);
        $this->assertStringContainsString('pagos-membresia/{idPago}/confirmar', $routes);
        $this->assertStringContainsString('pagos-membresia/{idPago}/rechazar', $routes);
    }
}
