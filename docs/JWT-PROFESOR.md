# Implementación JWT - Mallqui Gym

Este módulo se agregó para demostrar el tema trabajado en clase sin reemplazar la autenticación principal con Laravel Sanctum.

## Flujo

1. El usuario envía correo/usuario y contraseña a `POST /api/jwt/login`.
2. Laravel valida las credenciales contra la tabla `usuarios`.
3. El sistema genera un JWT firmado con HS256.
4. El cliente envía el token en las rutas protegidas usando:
   `Authorization: Bearer <JWT>`.
5. `JwtMiddleware` valida firma, expiración, emisor, audiencia y usuario.

## Identificador almacenado en el JWT

El claim estándar `sub` contiene el identificador principal del usuario:

```json
{
  "sub": "1"
}
```

`sub` representa `id_usuario`.

## Claims adicionales

El JWT incluye:

```json
{
  "id_usuario": 1,
  "nombre_usuario": "admin",
  "correo": "admin@mallquigym.com",
  "rol": "Administrador"
}
```

También se utilizan claims estándar:

- `iss`: emisor del token.
- `aud`: audiencia del token.
- `iat`: fecha/hora de emisión.
- `nbf`: momento desde el cual el token es válido.
- `exp`: fecha/hora de expiración.
- `jti`: identificador único del JWT.
- `sub`: identificador del usuario.

## Rutas para demostrar al profesor

- `POST /api/jwt/login`: genera el JWT.
- `GET /api/jwt/me`: demuestra que el JWT fue validado y devuelve usuario + claims.
- `GET /api/jwt/claims`: muestra y explica los claims almacenados.
- `GET /api/jwt/solo-administrador`: además del JWT, exige el claim/rol `Administrador`.

## Seguridad

La firma usa HS256 con una clave independiente `JWT_SECRET`. La clave no se guarda en GitHub.

Para generar una clave local:

```bash
php artisan jwt:secret
```

El módulo comercial principal continúa usando Sanctum. JWT se mantiene como demostración académica aislada para no alterar la autenticación que ya usa Mallqui Gym.
