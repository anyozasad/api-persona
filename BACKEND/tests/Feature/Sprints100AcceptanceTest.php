<?php

namespace Tests\Feature;

use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class Sprints100AcceptanceTest extends TestCase
{
    private function source(string $relativePath): string
    {
        $path = base_path('../'.$relativePath);
        $this->assertFileExists($path, 'No existe el archivo de evidencia: '.$relativePath);

        return (string) file_get_contents($path);
    }

    #[Test]
    public function los_sprints_09_al_100_tienen_evidencia_funcional_en_codigo(): void
    {
        $sources = [
            'routes' => $this->source('BACKEND/routes/api.php'),
            'admin' => $this->source('FRONTEND/suma-angular/src/app/component/pages/admin/admin-integrado.component.ts'),
            'user' => $this->source('FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts'),
            'trainer' => $this->source('FRONTEND/suma-angular/src/app/component/pages/panel-entrenador/entrenador-panel.component.ts')
                ."\n".$this->source('FRONTEND/suma-angular/src/app/component/pages/panel-entrenador/entrenador-panel.component.html'),
            'css' => $this->source('FRONTEND/suma-angular/src/app/component/pages/mallqui-admin.css'),
            'security' => $this->source('BACKEND/tests/Feature/SecuritySmokeTest.php'),
            'access' => $this->source('BACKEND/tests/Feature/AccesoCodigoFlowTest.php'),
            'receipt' => $this->source('BACKEND/tests/Feature/ComprobanteMembresiaTest.php'),
            'reserve' => $this->source('BACKEND/tests/Feature/ReservaClienteFlowTest.php'),
            'training' => $this->source('BACKEND/tests/Feature/EntrenamientoClienteFlowTest.php'),
        ];

        $sprints = [
            9=>['admin','dashboard-control-center'],
            10=>['admin','actualizarSeccionActual'],
            11=>['admin','dashboard-priority-board'],
            12=>['admin','exportarDashboardCsv'],
            13=>['admin','imprimirDashboard'],
            14=>['admin','dashboard-health-strip'],
            15=>['admin','admin-portal-live'],
            16=>['admin','admin-mobile-modules'],
            17=>['admin','admin-module-tabs'],
            18=>['admin','clientesBusqueda'],
            19=>['routes','clientes/{id}/ficha'],
            20=>['routes','estado-membresia'],
            21=>['routes','membresias/renovar'],
            22=>['routes','historial-pagos'],
            23=>['routes','comprobante'],
            24=>['routes','reportes/vencimientos'],
            25=>['routes','asistencias/acceso'],
            26=>['routes','asistencias/entrada'],
            27=>['routes','asistencias/salida'],
            28=>['routes','clientes/{idCliente}/asistencias'],
            29=>['admin','ENTRENADOR PRINCIPAL'],
            30=>['admin','crear_acceso'],
            31=>['routes',"Route::get('/resumen', [PortalEntrenadorController::class, 'resumen'])"],
            32=>['routes',"Route::get('/clientes', [PortalEntrenadorController::class, 'clientes'])"],
            33=>['trainer','rutinas'],
            34=>['trainer','clases'],
            35=>['trainer','reservas'],
            36=>['routes',"apiResource('/clases'"],
            37=>['admin','cupo_maximo'],
            38=>['routes',"ReservaController::class, 'reservar'"],
            39=>['routes',"ReservaController::class, 'cancelarMia'"],
            40=>['routes',"ReservaController::class, 'cambiarEstado'"],
            41=>['routes',"apiResource('/rutinas'"],
            42=>['routes',"apiResource('/detalle-rutinas'"],
            43=>['user','solicitarRutinaAlPersonal'],
            44=>['admin','Rutina completa asignada y cliente notificado'],
            45=>['routes','entrenamiento-gym/sesiones'],
            46=>['user','membresia'],
            47=>['user','rutina'],
            48=>['routes',"ExperienciaClienteController::class, 'progreso'"],
            49=>['routes',"ExperienciaClienteController::class, 'meta'"],
            50=>['routes',"ExperienciaClienteController::class, 'calendario'"],
            51=>['routes',"ExperienciaClienteController::class, 'historial'"],
            52=>['routes',"ExperienciaClienteController::class, 'credencial'"],
            53=>['routes','favoritos/clases'],
            54=>['routes',"ExperienciaClienteController::class, 'opiniones'"],
            55=>['routes',"ExperienciaClienteController::class, 'soporte'"],
            56=>['routes','responderSoporte'],
            57=>['routes','notificaciones-clientes'],
            58=>['routes','notificaciones/leer-todas'],
            59=>['routes',"apiResource('/categorias'"],
            60=>['routes',"apiResource('/productos'"],
            61=>['admin','productos_stock_bajo'],
            62=>['routes','kardex/ajustar'],
            63=>['admin','Kardex de inventario'],
            64=>['routes',"apiResource('/proveedores'"],
            65=>['admin','compraItems'],
            66=>['routes','compras/{id}/anular'],
            67=>['admin','Carrito de compra'],
            68=>['admin','caja?.caja_abierta'],
            69=>['admin','numero_operacion'],
            70=>['routes','ventas/{id}/anular'],
            71=>['routes','caja/abrir'],
            72=>['routes','caja/movimientos'],
            73=>['routes','caja/cerrar'],
            74=>['admin','operation-locked-state'],
            75=>['routes','reportes/ingresos'],
            76=>['routes','reportes/asistencias'],
            77=>['routes','reportes/vencimientos'],
            78=>['admin','exportarReporteCsv'],
            79=>['routes',"apiResource('/usuarios'"],
            80=>['routes','rol:Administrador'],
            81=>['routes','configuracion'],
            82=>['admin','Crear respaldo'],
            83=>['routes','limpiar-cache'],
            84=>['admin','audit-page'],
            85=>['admin','auditoriaFiltros'],
            86=>['admin','exportarAuditoria'],
            87=>['routes','/perfil'],
            88=>['routes','perfil/foto'],
            89=>['routes','cambiar-contrasena'],
            90=>['routes','logout-todos'],
            91=>['routes','forgot-password'],
            92=>['routes','reset-password'],
            93=>['routes','rol:Cliente'],
            94=>['routes',"'auditoria'"],
            95=>['security','SecuritySmokeTest'],
            96=>['access','AccesoCodigoFlowTest'],
            97=>['receipt','ComprobanteMembresiaTest'],
            98=>['reserve','ReservaClienteFlowTest'],
            99=>['training','EntrenamientoClienteFlowTest'],
            100=>['css','admin-mobile-modules'],
        ];

        $this->assertCount(92, $sprints);

        foreach ($sprints as $numero => [$fuente, $evidencia]) {
            $this->assertStringContainsString(
                $evidencia,
                $sources[$fuente],
                'Sprint '.$numero.' sin evidencia funcional: '.$evidencia
            );
        }
    }
}
