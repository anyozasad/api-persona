<?php

namespace Tests\Feature;

use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class SecuritySmokeTest extends TestCase
{
    /**
     * Cada endpoint del catálogo accesible únicamente con sesión debe bloquear
     * visitantes anónimos. Las seis rutas públicas de login/recuperación se
     * evalúan por separado y no forman parte de esta matriz.
     */
    public static function rutasPrivadasDelCatalogo(): iterable
    {
        $catalogo = require dirname(__DIR__, 2).'/config/portal_cliente_funciones.php';

        foreach ($catalogo as $item) {
            if ($item['id'] <= 6) {
                continue;
            }
            foreach ($item['checks'] as $check) {
                if (($check['type'] ?? '') !== 'route') {
                    continue;
                }
                yield sprintf('%03d %s', $item['id'], $item['name']) => [
                    (string) $check['method'],
                    (string) $check['uri'],
                ];
            }
        }
    }

    #[DataProvider('rutasPrivadasDelCatalogo')]
    public function test_todas_las_rutas_privadas_del_catalogo_rechazan_visitantes(
        string $method, string $uri
    ): void {
        // Reemplazar identificadores de una ruta sin modificar datos reales;
        // la respuesta correcta se obtiene antes de ejecutar el controlador.
        $ruta = preg_replace('/\\{[^}]+\\}/', '999999', $uri);
        $this->json($method, '/api/'.$ruta)->assertUnauthorized();
    }

    public function test_dashboard_requires_authentication(): void
    {
        $this->getJson('/api/dashboard/resumen')->assertUnauthorized();
    }

    public function test_customer_portal_requires_authentication(): void
    {
        $this->getJson('/api/mi-cuenta/resumen')->assertUnauthorized();
    }

    public function test_trainer_portal_requires_authentication(): void
    {
        $this->getJson('/api/mi-entrenador/resumen')->assertUnauthorized();
    }

    public function test_sales_cancellation_requires_authentication(): void
    {
        $this->postJson('/api/ventas/1/anular', ['motivo' => 'Prueba de seguridad'])->assertUnauthorized();
    }

    public function test_cash_module_requires_authentication(): void
    {
        $this->getJson('/api/caja/actual')->assertUnauthorized();
    }

    public function test_login_rejects_empty_credentials(): void
    {
        $this->postJson('/api/auth/login', [])->assertStatus(422);
    }

    public function test_health_endpoint_is_available(): void
    {
        $this->get('/up')->assertOk();
    }
}
