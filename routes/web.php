<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Mallqui Gym - Angular integrado en Laravel
|--------------------------------------------------------------------------
| El frontend se compila con: php artisan mallqui:build
| El resultado queda dentro de public/ y Laravel lo sirve en el puerto 8000.
| Ya no se necesita ejecutar ng serve ni usar localhost:4200 para presentar
| el sistema al profesor.
*/

Route::get('/', function () {
    $index = public_path('index.html');

    abort_unless(
        file_exists($index),
        503,
        'Frontend no compilado. Ejecuta: php artisan mallqui:build'
    );

    return response()->file($index, [
        'Cache-Control' => 'no-cache, no-store, must-revalidate',
    ]);
});

// Permite abrir directamente rutas de Angular como /usuario y /admin.
// Se excluyen API, Sanctum y la ruta de salud de Laravel.
Route::get('/{path}', function () {
    $index = public_path('index.html');

    abort_unless(
        file_exists($index),
        503,
        'Frontend no compilado. Ejecuta: php artisan mallqui:build'
    );

    return response()->file($index, [
        'Cache-Control' => 'no-cache, no-store, must-revalidate',
    ]);
})->where('path', '^(?!api(?:/|$)|sanctum(?:/|$)|up$).*$');
