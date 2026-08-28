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

// AUTENTICACIÓN
// Se limita la cantidad de intentos para reducir ataques de fuerza bruta.
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:3,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-todos', [AuthController::class, 'logoutTodos']);
        Route::put('/cambiar-contrasena', [AuthController::class, 'cambiarContrasena']);
    });
});

// DATOS DE SOLO LECTURA PARA USUARIOS AUTENTICADOS
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('/membresias', MembresiaController::class)->only(['index', 'show']);
    Route::apiResource('/clases', ClaseController::class)->only(['index', 'show']);
});

// OPERACIONES ADMINISTRATIVAS
// Toda modificación sensible requiere token válido y rol Administrador.
Route::middleware(['auth:sanctum', 'rol:Administrador'])->group(function () {
    // Prácticas anteriores: también quedan protegidas.
    Route::apiResource('/personas', PersonaController::class);
    Route::apiResource('/cursos', CursoController::class);

    // Compatibilidad con módulos anteriores.
    Route::apiResource('/miembros', MiembroController::class);
    Route::apiResource('/membresias', MembresiaController::class)->except(['index', 'show']);
    Route::apiResource('/clases', ClaseController::class)->except(['index', 'show']);

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
});
