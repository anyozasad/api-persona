<?php

namespace Tests\Feature;

use Tests\TestCase;

class EfsrtInterfazEvidenciaTest extends TestCase
{
    public function test_portada_principal_carga_cuatro_fotografias_locales_distintas(): void
    {
        $frontend = base_path('../FRONTEND/suma-angular');
        $archivo = $frontend.'/src/app/component/pages/usuario/usuario.component.ts';
        $this->assertFileExists($archivo);
        $codigo = (string) file_get_contents($archivo);

        preg_match_all(
            '/class="mallqui-apex-slide slide-[1-4]" src="(assets\/mallqui\/[a-z0-9-]+\.webp)"/',
            $codigo,
            $coincidencias
        );
        $imagenes = $coincidencias[1];

        $this->assertCount(4, $imagenes, 'La portada debe tener cuatro fotos locales.');
        $this->assertCount(4, array_unique($imagenes), 'El carrusel no debe repetir la misma imagen cuatro veces.');

        foreach ($imagenes as $imagen) {
            $ruta = $frontend.'/public/'.$imagen;
            $this->assertFileExists($ruta, 'Falta la imagen local: '.$imagen);
            $this->assertGreaterThan(
                100000,
                filesize($ruta),
                'La foto '.$imagen.' parece ser una miniatura o un recurso incompleto.'
            );
        }
    }

    public function test_dashboard_usa_imagenes_locales_y_no_enlaces_de_terceros(): void
    {
        $frontend = base_path('../FRONTEND/suma-angular');
        $archivo = $frontend.'/src/app/component/pages/admin/admin-integrado.component.ts';
        $this->assertFileExists($archivo);
        $codigo = (string) file_get_contents($archivo);

        foreach ([
            'assets/mallqui/mallqui-trainer-4k.webp',
            'assets/mallqui/mallqui-hero-interior-4k.webp',
            'assets/mallqui/mallqui-referencia-gym-equipos-4k.webp',
            'assets/mallqui/mallqui-foto-real-cardio-4k.webp',
        ] as $imagen) {
            $this->assertStringContainsString($imagen, $codigo);
            $this->assertFileExists($frontend.'/public/'.$imagen);
        }
    }

    public function test_rutas_criticas_tienen_roles_y_flujos_reales(): void
    {
        $api = (string) file_get_contents(base_path('routes/api.php'));

        $this->assertStringContainsString("'rol:Cliente'", $api);
        $this->assertStringContainsString("'rol:Administrador'", $api);
        $this->assertStringContainsString("Route::post('/reservas'", $api);
        $this->assertStringContainsString("Route::put('/reservas/{id}/estado'", $api);
        $this->assertStringContainsString("Route::apiResource('/clientes'", $api);
        $this->assertStringContainsString("Route::apiResource('/productos'", $api);
        $this->assertStringContainsString("Route::post('/asistencias/entrada'", $api);
        $this->assertStringContainsString("Route::post('/configuracion/respaldo'", $api);
        $this->assertStringContainsString("Route::get('/dashboard/resumen'", $api);
    }

    public function test_comprobante_interno_no_se_presenta_como_cpe_autorizado_sin_sunat(): void
    {
        $servicio = (string) file_get_contents(app_path('Services/ComprobanteMembresiaService.php'));

        $this->assertStringContainsString("'nota_tributaria'", $servicio);
        $this->assertStringContainsString('se requiere emisión autorizada por SUNAT', $servicio);
    }
}
