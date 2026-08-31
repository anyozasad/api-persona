<?php

namespace Tests\Unit;

use App\Models\Usuario;
use App\Services\JwtService;
use Tests\TestCase;

class JwtServiceTest extends TestCase
{
    public function test_jwt_contiene_sub_y_claims_academicos(): void
    {
        config([
            'jwt.secret' => str_repeat('a', 64),
            'jwt.ttl' => 120,
            'jwt.issuer' => 'http://localhost',
            'jwt.audience' => 'mallqui-gym',
        ]);

        $usuario = new Usuario();
        $usuario->id_usuario = 15;
        $usuario->nombre_usuario = 'profesor_demo';
        $usuario->correo = 'demo@mallquigym.test';
        $usuario->rol = 'Administrador';

        $servicio = app(JwtService::class);
        $generado = $servicio->generar($usuario);
        $claims = $servicio->decodificar($generado['token']);

        $this->assertSame('15', $claims['sub']);
        $this->assertSame(15, $claims['id_usuario']);
        $this->assertSame('profesor_demo', $claims['nombre_usuario']);
        $this->assertSame('demo@mallquigym.test', $claims['correo']);
        $this->assertSame('Administrador', $claims['rol']);
        $this->assertArrayHasKey('exp', $claims);
        $this->assertArrayHasKey('jti', $claims);
    }
}
