# Mallqui Gym — control de requisitos funcionales (navegación y aceptación)

Revisión de código y pruebas de la rama `main`. El proyecto utiliza Angular 20, Laravel 12 y MySQL. Este documento diferencia **módulo implementado** de **función verificada con datos reales**: un enlace que abre una pantalla no constituye evidencia de CRUD exitoso.

## Navegación administrativa

El botón genérico **“Todas las funciones” fue retirado**. Los módulos se muestran directamente en las siguientes áreas desplegables y sin duplicados:

1. Socios y membresías
2. Clases y entrenamiento
3. Productos e inventario
4. Ventas y caja
5. Atención al socio
6. Administración
7. Organización interna

Los seis accesos operativos de Inicio (matricular, reservas, asistencia, rutinas, productos y pagos) siguen presentes. El menú no altera `DB_DATABASE`, los permisos de Laravel ni las fotografías.

## Requisitos y cómo comprobarlos

| RF | Actividad | Código y API que la soporta | Criterio para aceptar en la instalación |
| --- | --- | --- | --- |
| 01 | Login, registro y roles | `AuthController`, `/api/auth/login`, middleware `rol` | Iniciar sesión como Admin, Cliente y Entrenador; rechazar acciones de otro rol |
| 02 | Socios y matrícula | `ClienteController`, `/api/clientes` | Crear, listar, editar, inactivar y verificar persistencia MySQL |
| 03 | Planes y membresías | `MembresiaProcesoController`, `/api/membresias/contratar` y `renovar` | Asignar un plan, renovar y ver vigencia en portal |
| 04 | Pagos y constancias | `PagoMembresiaController`, `SolicitudPagoMembresiaController` | Registrar, confirmar/rechazar, consultar constancia solo de pago confirmado |
| 05 | Reservas y cupos | `ReservaController`, `/api/reservas` | Alta, cambio de fecha, cancelación, cupo, duplicados y visualización del socio |
| 06 | Entradas y salidas | `AsistenciaController`, `/api/asistencias` | Registrar entrada/salida y consultar seguimiento e historial |
| 07 | Rutinas y entrenador | `RutinaController`, `PortalEntrenadorController` | Asignar rutina, revisar sus ejercicios y verla desde la cuenta del socio |
| 08 | Productos y fotografías | `ProductoController`, `/api/productos` | Crear con imagen, editar, visualizar en listado, portal y tabla MySQL |
| 09 | Compras e inventario | `CompraController`, `KardexController` | Comprobar entrada de stock y movimiento de Kardex sin duplicados |
| 10 | Ventas | `VentaController`, `/api/ventas` | Registrar venta, confirmar stock descontado y consultar historial |
| 11 | Apertura y cierre de caja | `CajaController`, `/api/caja/actual` | Abrir, registrar movimiento, cerrar y verificar saldo e historial |
| 12 | Reportes y dashboard | `DashboardController`, `ReporteController` | Indicadores y gráficos reflejan cobros/ventas/asistencia reales, sin cifras inventadas |
| 13 | Alertas y atención | `ComunicacionAdminController`, `/api/notificaciones-clientes` | Confirmar aviso, respuesta a soporte, vencimientos y seguimiento |
| 14 | Configuración, auditoría y respaldo | `ConfiguracionSistemaController`, `AuditoriaController` | Guardar configuración y comprobar persistencia; descargar respaldo SQL |
| 15 | Imágenes locales | `FRONTEND/suma-angular/public/assets/mallqui` | Servir Angular desde el equipo y verificar que cargan imágenes sin Internet externo |
| 16 | Comprobación 11 semanas EFSRT | `VerificacionEfsrtController`, `/api/admin/verificacion-efsrt` | Consultar tablas, registrar evidencias reales y descargar diagnóstico |
| 17 | Boleta electrónica SUNAT | **No hay integración CPE acreditada**; solo constancias internas | Pendiente de emisor autorizado, firma, envío y respuesta de SUNAT |

## Pruebas automatizadas disponibles

- Angular: `admin-integrado.component.spec.ts`, `admin-modules-navigation.spec.ts`, pruebas de productos.
- Laravel: `ReservaClienteFlowTest.php`, `ProductoImagenDashboardTest.php`, `VerificacionEfsrtTest.php` y el resto de `BACKEND/tests/Feature`.
- Integración real en un entorno de pruebas: `FRONTEND/suma-angular/tests/e2e-dashboard-real.mjs` y los flujos de GitHub Actions. Se ejecutan contra una **base MySQL temporal**, no contra `gym_system` del usuario.

La validación final exige abrir la instalación con **la base de datos donde están los socios, productos y fotos reales**, ejecutar cada operación y observar su cambio persistido. Un `git pull` no importa datos de otra computadora. Las fechas y firmas de la bitácora oficial son independientes del resultado del código.

## Orden sugerido para demostrar al profesor

1. Iniciar sesión con el administrador y abrir **Inicio**.
2. **Matricular socio** y verificar el nuevo registro.
3. **Membresías**: asignar plan y registrar/confirmar **Pago**.
4. **Clases y entrenamiento**: reservar, marcar asistencia y asignar rutina.
5. **Productos e inventario**: registrar fotografía, compra y stock.
6. **Ventas y caja**: abrir caja, vender, comprobar stock/Kardex y cerrar.
7. **Administración**: consultar reportes, permisos, auditoría, diagnóstico y respaldo.

No ejecutar comandos destructivos sobre la base existente ni crear registros ficticios para simular el inventario del negocio.
