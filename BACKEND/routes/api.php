<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\PersonaController;
use App\Http\Controllers\CursoController;
use App\Http\Controllers\MembresiaController;
use App\Http\Controllers\ClaseController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\JwtAuthController;
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
use App\Http\Controllers\PortalEntrenadorController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\CajaController;
use App\Http\Controllers\KardexController;
use App\Http\Controllers\AuditoriaController;
use App\Http\Controllers\ConfiguracionSistemaController;

// AUTENTICACIÓN PRINCIPAL DEL SISTEMA: SANCTUM
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:3,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,5');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,5');
    Route::post('/recovery-dni', [AuthController::class, 'recoveryByDni'])->middleware('throttle:3,5');
    Route::post('/recovery-dni/reset', [AuthController::class, 'resetPasswordByDni'])->middleware('throttle:5,5');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-todos', [AuthController::class, 'logoutTodos']);
        Route::put('/cambiar-contrasena', [AuthController::class, 'cambiarContrasena']);
    });
});

// MÓDULO JWT ACADÉMICO
// Se mantiene separado de Sanctum para mostrar al profesor:
// - sub = identificador del usuario
// - claims adicionales: id_usuario, nombre_usuario, correo y rol
Route::prefix('jwt')->group(function () {
    Route::post('/login', [JwtAuthController::class, 'login'])->middleware('throttle:5,1');

    Route::middleware('jwt')->group(function () {
        Route::get('/me', [JwtAuthController::class, 'me']);
        Route::get('/claims', [JwtAuthController::class, 'claims']);
        Route::get('/solo-administrador', [JwtAuthController::class, 'soloAdministrador'])
            ->middleware('rol:Administrador');
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
    Route::put('/perfil', [PortalClienteController::class, 'actualizarPerfil']);
    Route::get('/membresia', [PortalClienteController::class, 'membresia']);
    Route::get('/pagos', [PortalClienteController::class, 'pagos']);
    Route::get('/pagos/{idPago}/comprobante', [PortalClienteController::class, 'comprobante']);
    Route::get('/rutinas', [PortalClienteController::class, 'rutinas']);
    Route::get('/asistencias', [PortalClienteController::class, 'asistencias']);
    Route::get('/compras', [PortalClienteController::class, 'compras']);

    Route::get('/entrenamiento-casa', [PortalClienteController::class, 'entrenamientoCasa']);
    Route::put('/entrenamiento-casa/plan', [PortalClienteController::class, 'guardarPlanEntrenamientoCasa']);
    Route::post('/entrenamiento-casa/sesiones', [PortalClienteController::class, 'registrarSesionEntrenamientoCasa']);

    Route::post('/pagos/solicitar', [SolicitudPagoMembresiaController::class, 'solicitar']);
    Route::post('/pagos/{idPago}/cancelar', [SolicitudPagoMembresiaController::class, 'cancelarPropia']);

    Route::get('/reservas', [ReservaController::class, 'misReservas']);
    Route::post('/reservas', [ReservaController::class, 'reservar']);
    Route::post('/reservas/{id}/cancelar', [ReservaController::class, 'cancelarMia']);
});

// PORTAL DEL ENTRENADOR: INFORMACION LIMITADA A SU PROPIA OPERACION
Route::middleware(['auth:sanctum', 'rol:Entrenador', 'auditoria'])->prefix('mi-entrenador')->group(function () {
    Route::get('/resumen', [PortalEntrenadorController::class, 'resumen']);
    Route::get('/clientes', [PortalEntrenadorController::class, 'clientes']);
    Route::get('/rutinas', [PortalEntrenadorController::class, 'rutinas']);
    Route::get('/clases', [PortalEntrenadorController::class, 'clases']);
    Route::get('/reservas', [PortalEntrenadorController::class, 'reservas']);
});

// OPERACIÓN DEL GIMNASIO: ADMINISTRADOR O ENTRENADOR
// El entrenador NO recibe el CRUD general de clientes; usa /mi-entrenador/clientes,
// que entrega solamente los datos mínimos necesarios para asignar rutinas.
Route::middleware(['auth:sanctum', 'rol:Administrador,Entrenador', 'auditoria'])->group(function () {
    Route::apiResource('/rutinas', RutinaController::class);
    Route::apiResource('/detalle-rutinas', DetalleRutinaController::class);

    Route::get('/reservas', [ReservaController::class, 'index']);
    Route::put('/reservas/{id}/estado', [ReservaController::class, 'cambiarEstado']);
});

// ADMINISTRACIÓN Y CAJA
Route::middleware(['auth:sanctum', 'rol:Administrador', 'auditoria'])->group(function () {
    Route::apiResource('/personas', PersonaController::class);
    Route::apiResource('/cursos', CursoController::class);

    Route::apiResource('/membresias', MembresiaController::class)->except(['index', 'show']);
    Route::apiResource('/clases', ClaseController::class)->except(['index', 'show']);
    Route::apiResource('/clientes', ClienteController::class);

    Route::apiResource('/asistencias', AsistenciaController::class)->only(['index', 'show']);
    Route::post('/asistencias/entrada', [AsistenciaController::class, 'entrada']);
    Route::post('/asistencias/salida', [AsistenciaController::class, 'salida']);
    Route::get('/clientes/{idCliente}/asistencias', [AsistenciaController::class, 'historial']);

    Route::apiResource('/cliente-membresias', ClienteMembresiaController::class)->only(['index', 'show']);
    Route::apiResource('/pagos-membresia', PagoMembresiaController::class)->only(['index', 'show']);
    Route::post('/membresias/contratar', [MembresiaProcesoController::class, 'contratar']);
    Route::post('/membresias/renovar', [MembresiaProcesoController::class, 'renovar']);
    Route::get('/pagos-membresia-pendientes', [SolicitudPagoMembresiaController::class, 'pendientes']);
    Route::post('/pagos-membresia/{idPago}/confirmar', [SolicitudPagoMembresiaController::class, 'confirmar']);
    Route::post('/pagos-membresia/{idPago}/rechazar', [SolicitudPagoMembresiaController::class, 'rechazar']);
    Route::get('/clientes/{idCliente}/estado-membresia', [MembresiaProcesoController::class, 'estadoCliente']);
    Route::get('/clientes/{idCliente}/historial-pagos', [MembresiaProcesoController::class, 'historialPagos']);
    Route::get('/pagos-membresia/{idPago}/comprobante', [MembresiaProcesoController::class, 'comprobante']);

    Route::apiResource('/entrenadores', EntrenadorController::class);

    Route::apiResource('/categorias', CategoriaController::class);
    Route::apiResource('/productos', ProductoController::class);
    Route::get('/kardex', [KardexController::class, 'index']);
    Route::post('/kardex/ajustar', [KardexController::class, 'ajustar']);

    Route::apiResource('/proveedores', ProveedorController::class);
    Route::apiResource('/compras', CompraController::class)->only(['index', 'store', 'show']);
    Route::post('/compras/{id}/anular', [CompraController::class, 'anular']);

    Route::apiResource('/ventas', VentaController::class)->only(['index', 'store', 'show']);
    Route::post('/ventas/{id}/anular', [VentaController::class, 'anular']);

    // CAJA EMPRESARIAL
    Route::get('/caja/actual', [CajaController::class, 'actual']);
    Route::post('/caja/abrir', [CajaController::class, 'abrir']);
    Route::post('/caja/movimientos', [CajaController::class, 'movimiento']);
    Route::post('/caja/cerrar', [CajaController::class, 'cerrar']);
    Route::get('/caja/historial', [CajaController::class, 'historial']);

    Route::apiResource('/usuarios', UsuarioController::class);
    Route::get('/dashboard/resumen', [DashboardController::class, 'resumen']);
    Route::get('/auditorias', [AuditoriaController::class, 'index']);

    Route::get('/configuracion', [ConfiguracionSistemaController::class, 'show']);
    Route::put('/configuracion', [ConfiguracionSistemaController::class, 'update']);
    Route::get('/configuracion/estado', [ConfiguracionSistemaController::class, 'estado']);
    Route::post('/configuracion/respaldo', [ConfiguracionSistemaController::class, 'respaldo']);
    Route::post('/configuracion/limpiar-cache', [ConfiguracionSistemaController::class, 'limpiarCache']);

    Route::get('/reportes/ingresos', [ReporteController::class, 'ingresos']);
    Route::get('/reportes/vencimientos', [ReporteController::class, 'vencimientos']);
    Route::get('/reportes/asistencias', [ReporteController::class, 'asistencias']);

    Route::get('/vistas/clientes-membresias', [ReporteController::class, 'clientesMembresias']);
    Route::get('/vistas/stock', [ReporteController::class, 'stock']);
    Route::get('/vistas/ventas', [ReporteController::class, 'ventas']);
});
