<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\PersonaController;
use App\Http\Controllers\CursoController;
use App\Http\Controllers\MembresiaController;
use App\Http\Controllers\ClaseController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\ClienteMembresiaController;
use App\Http\Controllers\PagoMembresiaController;
use App\Http\Controllers\MembresiaProcesoController;
use App\Http\Controllers\SolicitudPagoMembresiaController;
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
use App\Http\Controllers\ReservaController;

// AUTENTICACIÓN
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:3,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,5');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,5');

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
Route::middleware(['auth:sanctum', 'rol:Cliente', 'auditoria'])->prefix('mi-cuenta')->group(function () {
    Route::get('/resumen', [PortalClienteController::class, 'resumen']);
    Route::get('/perfil', [PortalClienteController::class, 'perfil']);
    Route::get('/membresia', [PortalClienteController::class, 'membresia']);
    Route::get('/pagos', [PortalClienteController::class, 'pagos']);
    Route::get('/rutinas', [PortalClienteController::class, 'rutinas']);
    Route::get('/asistencias', [PortalClienteController::class, 'asistencias']);
    Route::get('/compras', [PortalClienteController::class, 'compras']);

    // Pago digital de membresía: queda pendiente hasta revisión administrativa.
    Route::post('/pagos/solicitar', [SolicitudPagoMembresiaController::class, 'solicitar']);
    Route::post('/pagos/{idPago}/cancelar', [SolicitudPagoMembresiaController::class, 'cancelarPropia']);

    // Reservas de clases.
    Route::get('/reservas', [ReservaController::class, 'misReservas']);
    Route::post('/reservas', [ReservaController::class, 'reservar']);
    Route::post('/reservas/{id}/cancelar', [ReservaController::class, 'cancelarMia']);
});

// OPERACIÓN DEL GIMNASIO: ADMINISTRADOR O ENTRENADOR
Route::middleware(['auth:sanctum', 'rol:Administrador,Entrenador', 'auditoria'])->group(function () {
    Route::apiResource('/clientes', ClienteController::class)->only(['index', 'show']);

    // Rutinas y ejercicios.
    Route::apiResource('/rutinas', RutinaController::class);
    Route::apiResource('/detalle-rutinas', DetalleRutinaController::class);

    // Control de ingreso y salida.
    Route::apiResource('/asistencias', AsistenciaController::class)->only(['index', 'show']);
    Route::post('/asistencias/entrada', [AsistenciaController::class, 'entrada']);
    Route::post('/asistencias/salida', [AsistenciaController::class, 'salida']);
    Route::get('/clientes/{idCliente}/asistencias', [AsistenciaController::class, 'historial']);

    // Reservas de clases.
    Route::get('/reservas', [ReservaController::class, 'index']);
    Route::put('/reservas/{id}/estado', [ReservaController::class, 'cambiarEstado']);
});

// ADMINISTRACIÓN Y CAJA
Route::middleware(['auth:sanctum', 'rol:Administrador', 'auditoria'])->group(function () {
    // Prácticas anteriores: quedan protegidas pero separadas del dominio del gimnasio.
    Route::apiResource('/personas', PersonaController::class);
    Route::apiResource('/cursos', CursoController::class);

    Route::apiResource('/membresias', MembresiaController::class)->except(['index', 'show']);
    Route::apiResource('/clases', ClaseController::class)->except(['index', 'show']);

    // CLIENTES
    Route::apiResource('/clientes', ClienteController::class)->except(['index', 'show']);

    // MEMBRESÍAS Y PAGOS
    Route::apiResource('/cliente-membresias', ClienteMembresiaController::class)->only(['index', 'show']);
    Route::apiResource('/pagos-membresia', PagoMembresiaController::class)->only(['index', 'show']);

    // Caja presencial: registra y activa de inmediato.
    Route::post('/membresias/contratar', [MembresiaProcesoController::class, 'contratar']);
    Route::post('/membresias/renovar', [MembresiaProcesoController::class, 'renovar']);

    // Pagos digitales enviados por el cliente: requieren aprobación.
    Route::get('/pagos-membresia-pendientes', [SolicitudPagoMembresiaController::class, 'pendientes']);
    Route::post('/pagos-membresia/{idPago}/confirmar', [SolicitudPagoMembresiaController::class, 'confirmar']);
    Route::post('/pagos-membresia/{idPago}/rechazar', [SolicitudPagoMembresiaController::class, 'rechazar']);

    Route::get('/clientes/{idCliente}/estado-membresia', [MembresiaProcesoController::class, 'estadoCliente']);
    Route::get('/clientes/{idCliente}/historial-pagos', [MembresiaProcesoController::class, 'historialPagos']);
    Route::get('/pagos-membresia/{idPago}/comprobante', [MembresiaProcesoController::class, 'comprobante']);

    // ENTRENADORES
    Route::apiResource('/entrenadores', EntrenadorController::class);

    // INVENTARIO Y PRODUCTOS
    Route::apiResource('/categorias', CategoriaController::class);
    Route::apiResource('/productos', ProductoController::class);

    // COMPRAS A PROVEEDORES
    Route::apiResource('/proveedores', ProveedorController::class);
    Route::apiResource('/compras', CompraController::class)->only(['index', 'store', 'show']);
    Route::post('/compras/{id}/anular', [CompraController::class, 'anular']);

    // VENTAS
    Route::apiResource('/ventas', VentaController::class)->only(['index', 'store', 'show']);

    // ADMINISTRACIÓN Y SEGURIDAD
    Route::apiResource('/usuarios', UsuarioController::class);
    Route::get('/dashboard/resumen', [DashboardController::class, 'resumen']);

    // REPORTES
    Route::get('/reportes/ingresos', [ReporteController::class, 'ingresos']);
    Route::get('/reportes/vencimientos', [ReporteController::class, 'vencimientos']);
    Route::get('/reportes/asistencias', [ReporteController::class, 'asistencias']);

    // VISTAS DEL DIAGRAMA (SOLO CONSULTA)
    Route::get('/vistas/clientes-membresias', [ReporteController::class, 'clientesMembresias']);
    Route::get('/vistas/stock', [ReporteController::class, 'stock']);
    Route::get('/vistas/ventas', [ReporteController::class, 'ventas']);
});
