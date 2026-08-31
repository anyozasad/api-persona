<?php

return [
    /*
    |--------------------------------------------------------------------------
    | JWT académico - Mallqui Gym
    |--------------------------------------------------------------------------
    | Este módulo se mantiene separado de Sanctum. Sirve para demostrar
    | autenticación JWT, identificador (sub) y claims adicionales.
    */
    'secret' => env('JWT_SECRET'),
    'ttl' => (int) env('JWT_TTL', 120),
    'issuer' => env('JWT_ISSUER', env('APP_URL', 'http://127.0.0.1:8000')),
    'audience' => env('JWT_AUDIENCE', 'mallqui-gym'),
];
