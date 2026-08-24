<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PersonaController;
use App\Http\Controllers\CursoController;
use App\Http\Controllers\MiembroController;
use App\Http\Controllers\MembresiaController;
use App\Http\Controllers\ClaseController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('/personas', PersonaController::class);
Route::apiResource('/cursos', CursoController::class);

// API de Mallqui Gym. Las migraciones se mantienen aparte y se ejecutan con Artisan.
Route::apiResource('/miembros', MiembroController::class);
Route::apiResource('/membresias', MembresiaController::class);
Route::apiResource('/clases', ClaseController::class);
