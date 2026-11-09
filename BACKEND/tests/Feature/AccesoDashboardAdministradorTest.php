<?php

namespace Tests\Feature;

use App\Models\Usuario;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

/**
 * Prueba de extremo a extremo de las rutas HTTP usadas por el dashboard.
 * No inventa sesión: obtiene el token de /api/auth/login, tal como Angular.
 * Las operaciones se revierten y no afectan los registros del gimnasio.
 */
class AccesoDashboardAdministradorTest extends TestCase
{
    use DatabaseTransactions;

    public function test_administrador_inicia_sesion_consulta_modulos_reales_y_cierra_sesion(): void
    {
        Usuario::create([
            'nombre_usuario' => 'admin.smoke.mallqui',
            'contrasena' => 'PruebaSegura2026!',
            'nombres' => 'Administrador',
            'apellidos' => 'Integracion',
            'dni' => '80991234',
            'correo' => 'admin.smoke@mallqui.test',
            'rol' => 'Administrador',
            'estado' => 'Activo',
            'fecha_registro' => now(),
        ]);

        $login = $this->postJson('/api/auth/login', [
            'login' => 'admin.smoke.mallqui',
            'contrasena' => 'PruebaSegura2026!',
        ]);
        $login->assertOk()->assertJsonPath('usuario.rol', 'Administrador');
        $token = (string) $login->json('access_token');
        $this->assertNotSame('', $token);

        $autorizacion = ['Authorization' => 'Bearer '.$token];
        $this->withHeaders($autorizacion)
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('usuario.rol', 'Administrador');

        $endpoints = [
            '/api/dashboard/resumen',
            '/api/clientes',
            '/api/membresias',
            '/api/cliente-membresias',
            '/api/pagos-membresia',
            '/api/productos',
            '/api/reservas',
            '/api/asistencias',
            '/api/caja/actual',
            '/api/admin/verificacion-efsrt',
        ];

        foreach ($endpoints as $url) {
            $respuesta = $this->withHeaders($autorizacion)->getJson($url);
            $this->assertSame(
                200, $respuesta->status(),
                'El administrador no pudo consultar '.$url.': '.$respuesta->getContent()
            );
        }

        $this->withHeaders($autorizacion)
            ->postJson('/api/auth/logout', [])
            ->assertOk();
        $this->withHeaders($autorizacion)
            ->getJson('/api/dashboard/resumen')
            ->assertUnauthorized();
    }
}
