<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Mallqui Gym - Frontend Angular
|--------------------------------------------------------------------------
| Laravel queda como backend/API en el puerto 8000.
| La interfaz principal se ejecuta con Angular en el puerto 4200.
| Durante desarrollo, al entrar a Laravel redirigimos automáticamente
| al frontend para evitar mostrar la pantalla welcome de Laravel.
*/
Route::get('/', function () {
    return redirect()->away('http://localhost:4200');
});
