<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\PersonaController;
use App\Http\Controllers\CursoController;
use App\Http\Controllers\MiembroController;
use App\Http\Controllers\MembresiaController;
use App\Http\Controllers\ClaseController;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\ClienteMembresiaController;
use App\Http\Controllers\PagoMembresiaController;
use App\Http\Controllers\AsistenciaController;
use App\Http\Controllers\EntrenadorController;
use App\Http\Controllers\RutinaController;
use App\Http\Controllers\DetalleRutinaController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\ProveedorController;
use App\Http\Controllers\CompraController;
use App\Http\Controllers\DetalleCompraController;
use App\Http\Controllers\VentaController;
use App\Http\Controllers\DetalleVentaController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\ReporteController;

// AUTENTICACIÓN MALLQUI GYM
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::put('/cambiar-contrasena', [AuthController::class, 'cambiarContrasena']);
    });
});

// Alias compatible con Laravel/Sanctum.
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Rutas de prácticas anteriores.
Route::apiResource('/personas', PersonaController::class);
Route::apiResource('/cursos', CursoController::class);

// Compatibilidad con módulos anteriores de Mallqui Gym.
Route::apiResource('/miembros', MiembroController::class);
Route::apiResource('/membresias', MembresiaController::class);
Route::apiResource('/clases', ClaseController::class);

// 1. CLIENTES Y MEMBRESÍAS
Route::apiResource('/clientes', ClienteController::class);
Route::apiResource('/cliente-membresias', ClienteMembresiaController::class);
Route::apiResource('/pagos-membresia', PagoMembresiaController::class);
Route::apiResource('/asistencias', AsistenciaController::class);

// 2. RUTINAS Y ASISTENCIAS
Route::apiResource('/entrenadores', EntrenadorController::class);
Route::apiResource('/rutinas', RutinaController::class);
Route::apiResource('/detalle-rutinas', DetalleRutinaController::class);

// 3. INVENTARIO Y PRODUCTOS
Route::apiResource('/categorias', CategoriaController::class);
Route::apiResource('/productos', ProductoController::class);

// 4. COMPRAS
Route::apiResource('/proveedores', ProveedorController::class);
Route::apiResource('/compras', CompraController::class);
Route::apiResource('/detalle-compras', DetalleCompraController::class);

// 5. VENTAS
Route::apiResource('/ventas', VentaController::class);
Route::apiResource('/detalle-ventas', DetalleVentaController::class);

// 6. ADMINISTRACIÓN
Route::apiResource('/usuarios', UsuarioController::class);

// VISTAS DEL DIAGRAMA (SOLO CONSULTA)
Route::get('/vistas/clientes-membresias', [ReporteController::class, 'clientesMembresias']);
Route::get('/vistas/stock', [ReporteController::class, 'stock']);
Route::get('/vistas/ventas', [ReporteController::class, 'ventas']);
