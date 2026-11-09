# Mallqui Gym — módulos y verificación (08/11/2026)

> Adaptación original inspirada en patrones de aplicaciones administrativas.
> No contiene código propietario de Mantis ni supone una licencia de su versión premium.

## Módulos operativos ya presentes en el proyecto

- **Dashboard, analíticas y finanzas:** resúmenes y gráficos conectados a Laravel.
- **Socios y membresías:** registros y renovaciones.
- **Clientes y usuarios:** cuentas, perfiles y permisos.
- **Tienda e inventario:** productos, proveedores, compras, ventas, stock y caja.
- **Facturas administrativas:** registros y estados (no confundir con emisión electrónica SUNAT).
- **Consultas y notificaciones:** solicitudes de clientes y respuestas.
- **Eventos, galería, noticias y nutrición:** módulo administrativo complementario.
- **Auditoría y configuración:** registros de actividad y ajustes.

## Nuevas vistas de Aplicaciones (Angular)

| Vista | Ruta interna | Operaciones |
| --- | --- | --- |
| Centro de aplicaciones | aplicaciones | Acceso a 16 módulos reales |
| Calendario operativo | calendario-admin | Navegar meses, consultar eventos y reservas, abrir su gestión |
| Tablero de tareas | tareas-admin | Crear, editar, iniciar, finalizar, reabrir y eliminar en MySQL |
| Tablas avanzadas | tablas-admin | Consultar clientes/productos/reservas, filtrar, ordenar, paginar y CSV |
| Componentes UI | componentes-ui | Probar controles, formulario, acordeón y modal; solo demostración |

**Persistencia:** las tareas se almacenan en `admin_gym_records` con `modulo='tareas'`. La tabla se crea solo si falta. El resto utiliza las APIs y módulos ya existentes.

## Instalación local

Desde la carpeta BACKEND del proyecto:

```powershell
git pull origin main
php artisan migrate --path=database/migrations/2026_11_08_100000_ensure_admin_gym_records_for_applications.php --force
php artisan route:list --path=admin-gym-registros
```

Desde FRONTEND/suma-angular:

```powershell
npm install
npm run build
```

En el navegador, ingresar con una cuenta Administrador a `http://localhost:4200/admin`, desplegar **Aplicaciones** y probar cada sección.

## Casos de prueba manuales

1. Crear tarea con fecha, responsable y prioridad → recargar → comprobar persistencia en MySQL.
2. Mover una tarea de «Por hacer» a «En curso», finalizar y reabrir → comprobar estado guardado.
3. Eliminar tarea → confirmar su desaparición tras recargar.
4. Crear un evento en Eventos → comprobar que se vea en Calendario en esa fecha.
5. Crear una reserva desde el portal → actualizar el dashboard → comprobar fecha programada en Calendario.
6. Filtrar Socios, Productos y Reservas en Tablas → paginar, ordenar y descargar CSV.
7. Abrir las aplicaciones → verificar que cada vínculo dirija al módulo operativo.
8. Aplicar la opción «Ver pendientes» en Facturas → comprobar el filtrado y que no se envía ningún aviso falso.
9. Probar tema oscuro/claro, buscador y notificaciones del panel.
10. Comprobar `php artisan route:list` y revisar los errores de Laravel/Angular.

## Estado y límites

- Los archivos han sido integrados en el repositorio; **no sustituye la ejecución de una compilación ni las pruebas contra el MySQL local**.
- La referencia comercial Mantis ofrece más de 100 páginas y aplicaciones premium. Este proyecto **no reproduce íntegramente todas esas páginas ni sus funcionalidades de terceros**. Las vistas empresariales se han adaptado a Mallqui Gym con código original.
- No existe aquí un chat de tiempo real de Mantis; se usa la bandeja funcional de soporte al cliente. Tampoco se presume emisión SUNAT ni pasarela de pago sin certificación.
- Los avisos de esquema incompleto del sistema no se ocultan: hay que completar las tablas de negocio que todavía falten antes de confirmar un despliegue en producción.

---

## Verificación EFSRT contra el Registro de Asistencia y la Bitácora (09/11/2026)

**Alcance:** actividades de las semanas 01–11 de la bitácora oficial y registro EFSRT del 12/09/2026 al 21/11/2026. El documento separa 24 jornadas registradas y 8 programadas. Las fechas futuras y firmas del supervisor **no se consideran ejecutadas ni validadas por este documento técnico**.

### Matriz de cumplimiento verificable

| Semanas | Actividades documentadas | Ubicación del código y evidencia disponible | Verificación pendiente |
|---|---|---|---|
| 01 | Requerimientos, separación usuario/dashboard/API/BD, modelo de datos | `FRONTEND/suma-angular`, `BACKEND`, `BACKEND/database/migrations`, controladores y modelos | Captura de diagrama de relaciones de la BD local y requerimientos firmados |
| 02 | Portada, menú, entrenamiento y responsive | `src/app/component/pages/usuario/usuario.component.ts`; imágenes en `public/assets/mallqui` | Inspección visual en escritorio y celular |
| 03 | Login, registro, validaciones, BD | `login/login.component.ts`, `register/register.component.ts`, `BACKEND/app/Http/Controllers/AuthController.php` | Demostración real con cuentas y comprobación en MySQL |
| 04 | Dashboard; CRUD de socios y reservas | `admin-integrado.component.ts`, `ClienteController.php`, `ReservaController.php`, `routes/api.php` | Probar altas, modificaciones y cancelaciones y consultar MySQL |
| 05 | Estados de reservas, productos, stock e imágenes | `ReservaController.php`, `ProductoController.php`, `VentaController.php`; pruebas de imagen y reservas | Registrar producto con imagen, venta, descuento de stock y Kardex |
| 06 | Asistencia, seguimiento, rutinas y entrenador | `AsistenciaController.php`, `RutinaController.php`, `EntrenadorController.php` y vistas de usuario/admin | Registrar una entrada y una salida; asignar rutina al socio |
| 07 | Uniformidad del diseño, login, botones y navegación | `admin-mantis-reference.css`, `admin-integrado.component.ts`, estilos del login | Revisión visual completa y navegación en navegador |
| 08 | Imágenes nítidas y locales, integración usuario/admin/BD | `public/assets/mallqui`; portada y carrusel referencian fotos locales; dashboard utiliza los mismos endpoints Laravel | Confirmar carga offline después de haber instalado y servido todos los recursos; comparar datos en MySQL |
| 09 | Sincronización, registros duplicados y aviso de vencimientos | Control de duplicados y cupo en `ReservaController.php`; `DashboardController.php`; `ReporteController.php` | Probar CRUD/alerta con datos reales y capturas el 09/11 o después |
| 10 | Pagos, boleta electrónica, permisos, offline, errores | `MembresiaProcesoController.php`, `ComprobanteMembresiaService.php`, roles en `routes/api.php` | **Emisión SUNAT no integrada:** el comprobante actual es interno. Verificar pagos, roles y modo offline |
| 11 | Pruebas finales, datos duplicados, capturas y respaldo | Pruebas PHPUnit/Jasmine, módulo de respaldo en Configuración y Mantenimiento | Ejecutar todas las pruebas y guardar evidencias de noviembre; validación del supervisor pendiente |

**Importante sobre comprobantes:** el sistema puede generar un comprobante interno de membresía y ventas con montos y numeración. **No se debe presentar como boleta electrónica CPE válida ante SUNAT** hasta integrar un emisor autorizado, su firma digital y la confirmación de aceptación correspondiente. No hay credenciales, homologación ni CDR verificados en el repositorio.

### Mejoras aplicadas en la revisión EFSRT del 09/11/2026

- CRUD de reservas desde el dashboard: formulario para alta y edición de socio, clase y fecha; cancelar conserva el historial.
- Laravel valida acceso según roles, membresía vigente, estado del socio, clase activa, día, hora, cupo y registros duplicados, con transacciones.
- Bloqueo de transiciones contradictorias (por ejemplo, cambiar una reserva cancelada a asistida), tanto en backend como en los controles del dashboard.
- Carrusel principal y tarjetas relevantes reemplazan imágenes locales de miniatura por recursos locales existentes de mayor tamaño **sin modificar la estructura de la interfaz**.
- Pruebas EFSRT añadidas a `ReservaClienteFlowTest.php`, `EfsrtInterfazEvidenciaTest.php` y `admin-integrado.component.spec.ts`.

### Ejecución para la demostración real

En PowerShell, desde la raíz del repositorio:

```powershell
git pull origin main
cd BACKEND
php artisan route:list --path=reservas
php artisan test --filter=ReservaClienteFlowTest
php artisan test --filter=EfsrtInterfazEvidenciaTest
```

En otra terminal, desde la raíz del repositorio:

```powershell
cd FRONTEND/suma-angular
npm ci
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

Para abrir en navegador con la base MySQL configurada, iniciar XAMPP/MySQL, el servidor Laravel (`php artisan serve` desde `BACKEND`) y Angular (`npm start` desde `FRONTEND/suma-angular`). Acceder a `http://localhost:4200/admin` con un administrador válido.

### Secuencia de demostración de punta a punta

1. Crear un socio con DNI nuevo desde administración; confirmar que aparece en MySQL.
2. Asignar membresía vigente, registrar y confirmar pago; verificar que se refleja en la sesión del socio.
3. Crear una clase activa con cupos, reservar desde el dashboard y verificar la misma reserva en el portal del socio.
4. Editar la reserva pendiente; intentar una reserva duplicada y comprobar mensaje de validación.
5. Cancelar la reserva desde administración; asegurar que permanece registrada con estado `Cancelada`, sin poder marcarla como asistida.
6. Registrar entrada y salida de un socio con membresía; revisar seguimiento y reportes.
7. Crear un producto con imagen local/base64 válida; registrar una venta y comprobar stock y Kardex.
8. Comprobar alertas con membresía próxima a vencer; exportar reportes; generar un respaldo SQL.
9. Probar login con rol Cliente, Entrenador y Administrador, y confirmar que los roles no pueden abrir acciones ajenas.
10. Capturar pantallas, resultados de pruebas y consultas de MySQL sin alterar fechas ni firmas EFSRT.

**Limitación técnica:** esta matriz documenta funciones existentes y cambios de código; no equivale a pruebas integradas ejecutadas sobre el equipo, el navegador y la base MySQL reales. Los tests añadidos requieren ejecución. Marcar resultados como aprobados solamente cuando el programa los confirme.

---

## Complemento funcional aplicado el 09/11/2026 — Revisión de pendientes EFSRT

Esta revisión agrega cambios reales al código del repositorio, sin alterar el formato, fechas, horas ni firmas de los dos documentos EFSRT.

### Funciones que se completaron en esta revisión

1. **Pagos y comprobantes:** Pagos ahora tiene el botón **Ver comprobante** solo en operaciones con estado `Completado`. En Documentos del socio se selecciona un **pago real** (no solo una suscripción); se puede consultar su serie, fecha, cliente, plan, método, total y abrir una impresión local. La API no genera constancias de pagos pendientes o rechazados. La ruta legacy de documentos también consulta un pago completado.
2. **Comprobación EFSRT:** en el menú **Sistema → Comprobación EFSRT** hay un diagnóstico de solo lectura con acceso exclusivo del Administrador. Muestra el estado de las tablas principales, cantidad de registros reales, tablas faltantes y anomalías detectables: DNI repetidos, reservas duplicadas activas, pagos sin membresía relacionada y productos con stock negativo. El diagnóstico **no afirma que un módulo está funcional solo por tener una tabla**.
3. **Imágenes locales del usuario:** se sustituyeron 74 referencias restantes a la miniatura `mallqui-cover.webp` por recursos locales de mejor tamaño ya presentes; la distribución de la interfaz se mantiene. Los ejercicios utilizan imágenes de referencia locales y `dead_bug` usa la imagen de ejercicio que existe en el proyecto. Los productos sin foto muestran un marcador SVG local que dice claramente que falta la imagen; los productos con foto siguen mostrando la foto guardada.
4. **Validaciones y cobertura de pruebas:** se agregaron pruebas para pagos confirmados/no confirmados, diagnóstico de datos duplicados, permisos de acceso y navegación Angular.

### Demostración que debe realizar el profesor en el equipo

Desde `FRONTEND/suma-angular`, abrir Angular con `npm start`; desde `BACKEND`, tener configurado `gym_system` y ejecutar `php artisan serve`, con MySQL iniciado. En el dashboard, ingresar como Administrador a **Sistema → Comprobación EFSRT** para observar tablas reales y acceder a cada módulo. Después comprobar: inscripción de socio, membresía y pago, reserva de clase, asistencia, stock/productos, rutinas, alertas, consulta de comprobante y respaldo. Los resultados deben conservarse como capturas **reales** tomadas después de ejecutar el sistema.

Comandos de validación (desde `BACKEND`):

```powershell
php artisan test --filter=VerificacionEfsrtTest
php artisan test --filter=ComprobanteMembresiaTest
php artisan test --filter=ReservaClienteFlowTest
php artisan test --filter=EfsrtInterfazEvidenciaTest
php artisan route:list --path=admin/verificacion-efsrt
```

Desde `FRONTEND/suma-angular`:

```powershell
npm ci
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

**Limitaciones técnicas reales:** aún no se han ejecutado estos comandos con las dependencias, navegador y MySQL instalados en el equipo del usuario. La aprobación final exige que los comandos terminen correctamente, que las operaciones persistan en la base real, y que el supervisor valide sus evidencias. **No existe integración certificada SUNAT** para emitir una boleta electrónica con validez tributaria. Los documentos disponibles permiten elaborar una constancia interna, no probar una emisión autorizada. Las jornadas futuras de la bitácora siguen pendientes de su realización y validación, no se marcan como realizadas automáticamente.

---

## Resultado de la prueba automatizada integral — 09/11/2026

**Ejecución verificable:** [GitHub Actions — Mallqui Gym, ejecución 42640826023](https://github.com/anyozasad/api-persona/actions/runs/42640826023)

- **Angular 20:** instalación reproducible con `npm ci`, compilación de producción `npm run build` **aprobada** y **60 de 60 pruebas** ejecutadas correctamente en Chrome Headless.
- **Laravel 12 + MySQL 8:** dependencias instaladas, sintaxis PHP revisada, migraciones aplicadas y suite completa de PHPUnit: **101 de 101 pruebas aprobadas, 571 aserciones**. En GitHub Actions se utilizó exclusivamente una base de prueba `mallqui_gym_pruebas`.
- **Reservas:** cubiertas altas, edición, cancelación lógica, membresías, restricciones de cupo y duplicados.
- **Pagos:** se valida la emisión de constancias solamente cuando el pago está confirmado. La constancia **no es** una boleta electrónica validada por SUNAT.
- **Inventario:** el CRUD de productos soporta esquemas actuales y compatibles; pruebas de imágenes, actualización y eliminación lógica. Kardex antiguo conectado al historial real de movimientos y error explícito si falta tabla.
- **Dashboard:** se reactivó como sección desplegable el `AdminDashboardToolsComponent` con sus 20 indicadores y controles operativos; se mantuvo la interfaz Mantis.
- **Seguridad y diagnóstico:** autenticación de roles, revisión EFSRT, informes y validaciones incluidos en la suite.

**Importante para evaluación:** los resultados anteriores prueban las rutas y operaciones cubiertas por las suites de CI, **no equivalen a una auditoría manual de todos los flujos ni a una comprobación de la base real del negocio en la computadora del instituto**. La emisión de comprobantes electrónicos autorizados por SUNAT depende de credenciales, firma digital e integración fiscal que no están disponibles en este repositorio. No se modificaron las fechas, horas o firmas originales de los documentos EFSRT.

**Rama validada:** los cambios comprobados en la ejecución indicada se fusionaron a `main` con el PR [#25](https://github.com/anyozasad/api-persona/pull/25).
