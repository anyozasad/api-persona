<?php

namespace App\Console\Commands;

use App\Models\Usuario;
use App\Services\JwtService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class ProbarJwt extends Command
{
    protected $signature = 'jwt:probar';

    protected $description = 'Demuestra login JWT, sub y claims desde la terminal';

    public function handle(JwtService $jwt): int
    {
        $login = trim((string) $this->ask('Correo o nombre de usuario'));
        $contrasena = (string) $this->secret('Contraseña');

        $usuario = Usuario::query()
            ->where('correo', $login)
            ->orWhere('nombre_usuario', $login)
            ->first();

        if (!$usuario || !Hash::check($contrasena, $usuario->contrasena)) {
            $this->error('Credenciales incorrectas.');
            return self::FAILURE;
        }

        if (mb_strtolower((string) $usuario->estado) !== 'activo') {
            $this->error('El usuario está inactivo.');
            return self::FAILURE;
        }

        $generado = $jwt->generar($usuario);
        $claims = $jwt->decodificar($generado['token']);
        $token = $generado['token'];
        $tokenCorto = substr($token, 0, 45).'...'.substr($token, -20);

        $this->newLine();
        $this->info('JWT GENERADO Y VALIDADO CORRECTAMENTE');
        $this->line('Token (oculto parcialmente): '.$tokenCorto);
        $this->line('Formato JWT: HEADER.PAYLOAD.SIGNATURE');
        $this->newLine();

        $this->table(
            ['Claim', 'Valor', 'Explicación'],
            [
                ['sub', $claims['sub'], 'Identificador principal: id_usuario'],
                ['id_usuario', $claims['id_usuario'], 'Claim adicional'],
                ['nombre_usuario', $claims['nombre_usuario'], 'Claim adicional'],
                ['correo', $claims['correo'], 'Claim adicional'],
                ['rol', $claims['rol'], 'Claim adicional para autorización'],
                ['iss', $claims['iss'], 'Emisor'],
                ['aud', $claims['aud'], 'Audiencia'],
                ['iat', date('Y-m-d H:i:s', (int) $claims['iat']), 'Emitido'],
                ['exp', date('Y-m-d H:i:s', (int) $claims['exp']), 'Expiración'],
                ['jti', $claims['jti'], 'ID único del token'],
            ]
        );

        $this->newLine();
        $this->comment('El JWT usa HS256 y JWT_SECRET. Sanctum sigue siendo la autenticación principal del sistema comercial.');

        return self::SUCCESS;
    }
}
