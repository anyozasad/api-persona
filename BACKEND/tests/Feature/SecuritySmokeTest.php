<?php

namespace Tests\Feature;

use Tests\TestCase;

class SecuritySmokeTest extends TestCase
{
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
