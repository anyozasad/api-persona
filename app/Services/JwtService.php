<?php

namespace App\Services;

use App\Models\Usuario;
use Illuminate\Support\Str;
use RuntimeException;

class JwtService
{
    public function generar(Usuario $usuario): array
    {
        $ahora = time();
        $ttl = max(1, (int) config('jwt.ttl', 120));
        $expira = $ahora + ($ttl * 60);

        $payload = [
            // Claims estándar JWT
            'iss' => (string) config('jwt.issuer'),
            'aud' => (string) config('jwt.audience', 'mallqui-gym'),
            'iat' => $ahora,
            'nbf' => $ahora,
            'exp' => $expira,
            'jti' => (string) Str::uuid(),

            // IDENTIFICADOR QUE SERA ALMACENADO EN EL JWT
            'sub' => (string) $usuario->id_usuario,

            // CLAIMS ADICIONALES QUE TENDRA EL JWT
            'id_usuario' => (int) $usuario->id_usuario,
            'nombre_usuario' => (string) $usuario->nombre_usuario,
            'correo' => (string) $usuario->correo,
            'rol' => (string) $usuario->rol,
        ];

        return [
            'token' => $this->codificar($payload),
            'claims' => $payload,
            'expires_in' => $ttl * 60,
        ];
    }

    public function decodificar(string $token): array
    {
        $partes = explode('.', $token);

        if (count($partes) !== 3) {
            throw new RuntimeException('JWT con formato inválido.');
        }

        [$header64, $payload64, $firma64] = $partes;
        $header = $this->jsonDecode($this->base64UrlDecode($header64));
        $payload = $this->jsonDecode($this->base64UrlDecode($payload64));

        if (($header['alg'] ?? null) !== 'HS256' || ($header['typ'] ?? null) !== 'JWT') {
            throw new RuntimeException('Algoritmo JWT no permitido.');
        }

        $firmaEsperada = hash_hmac(
            'sha256',
            $header64.'.'.$payload64,
            $this->secret(),
            true
        );

        $firmaRecibida = $this->base64UrlDecode($firma64);

        if (!hash_equals($firmaEsperada, $firmaRecibida)) {
            throw new RuntimeException('Firma JWT inválida.');
        }

        $ahora = time();

        if (!isset($payload['exp']) || (int) $payload['exp'] <= $ahora) {
            throw new RuntimeException('JWT vencido.');
        }

        if (isset($payload['nbf']) && (int) $payload['nbf'] > $ahora) {
            throw new RuntimeException('JWT todavía no válido.');
        }

        if (($payload['iss'] ?? null) !== (string) config('jwt.issuer')) {
            throw new RuntimeException('Emisor JWT inválido.');
        }

        if (($payload['aud'] ?? null) !== (string) config('jwt.audience', 'mallqui-gym')) {
            throw new RuntimeException('Audiencia JWT inválida.');
        }

        if (empty($payload['sub'])) {
            throw new RuntimeException('El JWT no contiene el identificador sub.');
        }

        return $payload;
    }

    private function codificar(array $payload): string
    {
        $header = [
            'alg' => 'HS256',
            'typ' => 'JWT',
        ];

        $header64 = $this->base64UrlEncode(json_encode($header, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR));
        $payload64 = $this->base64UrlEncode(json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR));
        $firma = hash_hmac('sha256', $header64.'.'.$payload64, $this->secret(), true);

        return $header64.'.'.$payload64.'.'.$this->base64UrlEncode($firma);
    }

    private function secret(): string
    {
        $secret = trim((string) config('jwt.secret'));

        if ($secret === '') {
            throw new RuntimeException('JWT_SECRET no está configurado. Ejecuta: php artisan jwt:secret');
        }

        if (strlen($secret) < 32) {
            throw new RuntimeException('JWT_SECRET debe tener al menos 32 caracteres.');
        }

        return $secret;
    }

    private function jsonDecode(string $json): array
    {
        $datos = json_decode($json, true, 512, JSON_THROW_ON_ERROR);

        if (!is_array($datos)) {
            throw new RuntimeException('Contenido JWT inválido.');
        }

        return $datos;
    }

    private function base64UrlEncode(string $datos): string
    {
        return rtrim(strtr(base64_encode($datos), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $datos): string
    {
        $resto = strlen($datos) % 4;
        if ($resto > 0) {
            $datos .= str_repeat('=', 4 - $resto);
        }

        $decodificado = base64_decode(strtr($datos, '-_', '+/'), true);

        if ($decodificado === false) {
            throw new RuntimeException('Base64URL JWT inválido.');
        }

        return $decodificado;
    }
}
