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
use App\Http\Controllers\MembresiaProcesoController;
use App\Http\Controllers\AsistenciaController;
use App\Http\Controllers\EntrenadorController;
use App\Http\Controllers\RutinaController;
use App\Http\Controllers\DetalleRutinaController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\ProveedorController;
use App\Http\Controllers\CompraController;
use App\Http\Controllers\VentaController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PortalClienteController;

// AUTENTICACIÓN
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

// INFORMACIÓN GENERAL PARA CUALQUIER USUARIO AUTENTICADO
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('/membresias', MembresiaController::class)->only(['index', 'show']);
    Route::apiResource('/clases', ClaseController::class)->only(['index', 'show']);
});

// PORTAL DEL CLIENTE: SOLO SUS PROPIOS DATOS
Route::middleware(['auth:sanctum', 'rol:Cliente'])->prefix('mi-cuenta')->group(function () {
    Route::get('/resumen', [PortalClienteController::class, 'resumen']);
    Route::get('/perfil', [PortalClienteController::class, 'perfil']);
    Route::get('/membresia', [PortalClienteController::class, 'membresia']);
    Route::get('/pagos', [PortalClienteController::class, 'pagos']);
    Route::get('/rutinas', [PortalClienteController::class, 'rutinas']);
    Route::get('/asistencias', [PortalClienteController::class, 'asistencias']);
    Route::get('/compras', [PortalClienteController::class, 'compras']);
});

// OPERACIÓN DEL GIMNASIO: ADMINISTRADOR O ENTRENADOR
Route::middleware(['auth:sanctum', 'rol:Administrador,Entrenador'])->group(function () {
    // El entrenador puede consultar clientes, pero no eliminarlos ni cambiar sus datos administrativos.
    Route::apiResource('/clientes', ClienteController::class)->only(['index', 'show']);

    // Rutinas y ejercicios.
    Route::apiResource('/rutinas', RutinaController::class);
    Route::apiResource('/detalle-rutinas', DetalleRutinaController::class);

    // Control de ingreso y salida. Solo se permite entrada con membresía vigente.
    Route::apiResource('/asistencias', AsistenciaController::class)->only(['index', 'show']);
    Route::post('/asistencias/entrada', [AsistenciaController::class, 'entrada']);
    Route::post('/asistencias/salida', [AsistenciaController::class, 'salida']);
    Route::get('/clientes/{idCliente}/asistencias', [AsistenciaController::class, 'historial']);
});

// ADMINISTRACIÓN Y CAJA
Route::middleware(['auth:sanctum', 'rol:Administrador'])->group(function () {
    // Prácticas anteriores: quedan protegidas.
    Route::apiResource('/personas', PersonaController::class);
    Route::apiResource('/cursos', CursoController::class);

    // Compatibilidad con módulos anteriores.
    Route::apiResource('/miembros', MiembroController::class);
    Route::apiResource('/membresias', MembresiaController::class)->except(['index', 'show']);
    Route::apiResource('/clases', ClaseController::class)->except(['index', 'show']);

    // CLIENTES
    Route::apiResource('/clientes', ClienteController::class)->except(['index', 'show']);

    // MEMBRESÍAS Y PAGOS
    // ClienteMembresia y PagoMembresia son de consulta: los cambios pasan por el proceso de caja.
    Route::apiResource('/cliente-membresias', ClienteMembresiaController::class)->only(['index', 'show']);
    Route::apiResource('/pagos-membresia', PagoMembresiaController::class)->only(['index', 'show']);
    Route::post('/membresias/contratar', [MembresiaProcesoController::class, 'contratar']);
    Route::post('/membresias/renovar', [MembresiaProcesoController::class, 'renovar']);
    Route::get('/clientes/{idCliente}/estado-membresia', [MembresiaProcesoController::class, 'estadoCliente']);
    Route::get('/clientes/{idCliente}/historial-pagos', [MembresiaProcesoController::class, 'historialPagos']);
    Route::get('/pagos-membresia/{idPago}/comprobante', [MembresiaProcesoController::class, 'comprobante']);

    // ENTRENADORES
    Route::apiResource('/entrenadores', EntrenadorController::class);

    // INVENTARIO Y PRODUCTOS
    Route::apiResource('/categorias', CategoriaController::class);
    Route::apiResource('/productos', ProductoController::class);

    // COMPRAS A PROVEEDORES: actualizan stock automáticamente.
    Route::apiResource('/proveedores', ProveedorController::class);
    Route::apiResource('/compras', CompraController::class)->only(['index', 'store', 'show']);
    Route::post('/compras/{id}/anular', [CompraController::class, 'anular']);

    // VENTAS: validan stock, calculan totales y descuentan existencias.
    Route::apiResource('/ventas', VentaController::class)->only(['index', 'store', 'show']);

    // ADMINISTRACIÓN Y SEGURIDAD
    Route::apiResource('/usuarios', UsuarioController::class);
    Route::get('/dashboard/resumen', [DashboardController::class, 'resumen']);

    // VISTAS DEL DIAGRAMA (SOLO CONSULTA)
    Route::get('/vistas/clientes-membresias', [ReporteController::class, 'clientesMembresias']);
    Route::get('/vistas/stock', [ReporteController::class, 'stock']);
    Route::get('/vistas/ventas', [ReporteController::class, 'ventas']);
});
