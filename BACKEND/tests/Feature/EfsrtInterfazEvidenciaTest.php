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

        // La portada y el portal conservan recursos locales.
        // El inicio administrativo ahora muestra las fotos reales de MySQL;
        // no debe usar fotos fijas de un entrenador para simular productos.
        foreach ([
            'assets/mallqui/mallqui-trainer-4k.webp',
            'assets/mallqui/mallqui-hero-interior-4k.webp',
            'assets/mallqui/mallqui-referencia-gym-equipos-4k.webp',
            'assets/mallqui/mallqui-foto-real-cardio-4k.webp',
        ] as $imagen) {
            $this->assertFileExists($frontend.'/public/'.$imagen);
        }
        $this->assertStringContainsString('class="mg-dashboard mg-efsrt-dashboard"', $codigo);
        $this->assertStringContainsString('[src]="p.foto"', $codigo);
        $this->assertStringContainsString('fotoProductoDisponibleDashboard(p.foto)', $codigo);
        $this->assertStringContainsString("cambiarSegcion('productos')", $codigo);
        $this->assertStringNotContainsString('src="https://', $codigo);
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

    public function test_portada_publica_usa_tres_fotografias_distintas_y_locales(): void
    {
        $frontend = base_path('../FRONTEND/suma-angular');
        $inicio = (string) file_get_contents(
            $frontend.'/src/app/component/pages/landing/landing.component.ts'
        );
        $estilos = (string) file_get_contents(
            $frontend.'/src/app/component/pages/mallqui-landing.css'
        );

        $this->assertStringNotContainsString('mallqui-cover.webp', $inicio);
        $this->assertStringNotContainsString('mallqui-cover.webp', $estilos);

        foreach ([
            'mallqui-beginner-ai-4k.webp',
            'mallqui-referencia-gym-equipos-4k.webp',
            'mallqui-foto-real-cardio-4k.webp',
        ] as $archivo) {
            $this->assertStringContainsString($archivo, $inicio);
            $this->assertFileExists($frontend.'/public/assets/mallqui/'.$archivo);
        }
    }

    public function test_usuario_usa_fotografias_locales_y_placeholder_de_producto_sin_foto(): void
    {
        $frontend = base_path('../FRONTEND/suma-angular');
        $portal = (string) file_get_contents(
            $frontend.'/src/app/component/pages/usuario/usuario.component.ts'
        );

        $this->assertStringNotContainsString('mallqui-cover.webp', $portal);
        $this->assertStringContainsString('assets/mallqui/producto-sin-imagen.svg', $portal);
        $this->assertFileExists($frontend.'/public/assets/mallqui/producto-sin-imagen.svg');
        $this->assertStringContainsString('assets/exercises/deadbug_human.webp', $portal);
        $this->assertFileExists($frontend.'/public/assets/exercises/deadbug_human.webp');
        $this->assertStringContainsString('mallqui-trainer-4k.webp', $portal);
    }

    public function test_impresion_de_pago_usa_codigo_local_y_no_solicita_un_qr_externo(): void
    {
        $archivo = base_path('../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts');
        $pagina = (string) file_get_contents($archivo);

        $this->assertStringContainsString("CONSTANCIA INTERNA DE PAGO", $pagina);
        $this->assertStringContainsString('code128DataUri(qrContenido', $pagina);
        $this->assertStringNotContainsString('quickchart.io/qr', $pagina);
        $this->assertStringContainsString('no es un comprobante electrónico autorizado por SUNAT', $pagina);
    }

    public function test_comprobante_interno_no_se_presenta_como_cpe_autorizado_sin_sunat(): void
    {
        $servicio = (string) file_get_contents(app_path('Services/ComprobanteMembresiaService.php'));

        $this->assertStringContainsString("'nota_tributaria'", $servicio);
        $this->assertStringContainsString('se requiere emisión autorizada por SUNAT', $servicio);
    }
}
