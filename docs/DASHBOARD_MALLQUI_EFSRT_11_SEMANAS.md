# Mallqui Gym — dashboard organizado según las 11 semanas EFSRT

Documentos de referencia: Bitacora_Mallqui_Gym_4_Horas_Cuadrado(1).docx y Registro_EFSRT_Tarde_4H(1).docx.
Revisión técnica: 10 de noviembre de 2026. Las semanas 10 y 11 incluyen actividades futuras; una implementación técnica NO reemplaza el trabajo presencial ni las firmas.

## Cómo usar el dashboard sin perderse

En /admin solo se ven seis acciones de trabajo diario: Matricular socio, Reservas, Asistencia, Rutinas, Productos y Pagos.
El menú lateral está ordenado en cinco áreas: Socios y membresías, Entrenamientos, Ventas e inventario, Reportes y Administración.
Las funciones adicionales siguen accesibles en Más funciones (opcional), inicialmente cerrada.
Se eliminaron las pestañas duplicadas de cada módulo y los enlaces de apariencia/exportación que recargaban innecesariamente la cabecera.
Los gráficos mantienen cálculos reales de la API, pero se abren únicamente desde Gráficos y análisis de ingresos. En móvil hay cinco accesos rápidos.

## Correspondencia con la bitácora (cinco actividades por semana)

| Semana | Actividades del documento | Dónde se revisan | Verificación técnica / límite |
|---|---|---|---|
| 01 | Requerimientos del gimnasio; distinguir usuario/administrador; separar dashboard/API/BD; datos socios-reservas-pagos-productos-rutinas; estructura y relaciones | Proyecto FRONTEND/suma-angular y BACKEND, database/migrations, módulos del menú | Código y tablas verificables con /api/estado-sistema y Verificación EFSRT |
| 02 | Rutas y frontend; menú; portada con reservar; secciones de gimnasio y entrenamiento; pruebas responsive | Portal público, rutas Angular y menú de /admin | Pruebas E2E de navegación desktop y móvil; revisar imágenes reales en la instalación |
| 03 | Login; registro; conexión con backend/BD; validaciones; errores de acceso | /login, registro de usuario, protección de rutas y API autenticada | Pruebas de acceso de administrador, validación y sesiones; comprobar usuario real en equipo |
| 04 | Estructura dashboard; socios, reservas, pagos, productos, entrenador y reportes; alta/lista; edición/cancelación; persistencia en BD | Matricular socio, Reservas, Pagos, Productos, Entrenador, Reportes | Flujos Laravel/MySQL y navegador CI; no eliminar historial de reservas ni ventas por error |
| 05 | Reservas asociadas a socios; estados; productos, precio y stock; fotografía; pagos conciliados con BD | Reservas, Productos y stock, Pagos, Verificación EFSRT | Se prueba foto guardada y recuperada en MySQL; si foto no existe hay aviso, no imagen inventada |
| 06 | Asistencia; seguimiento; rutinas por nivel/tipo; entrenador; corregir repetidos y faltantes | Asistencia, Seguimiento, Rutinas, Entrenador, Verificación EFSRT | Pruebas CRUD y consultas de datos; revisar tipos/niveles y el único entrenador local |
| 07 | Unificar visual; tarjetas, botones y espaciado; quitar repetidos; login acorde a portada; navegación correcta | Nuevo inicio EFSRT, menú lateral agrupado, estilos admin-efsrt-simplificado.css, /login | Prueba de seis acciones únicas, cinco móviles y ausencia de pestañas redundantes |
| 08 | Detectar fotos borrosas; assets locales offline; fotos de entrenador, productos y gimnasio; portada nítida; pruebas usuario-dashboard-BD | FRONTEND/suma-angular/public/assets, Productos, portal, /admin | Fotos locales disponibles; fotos reales de productos son datos de MySQL. Revisar cada imagen en equipo real |
| 09 | Sincronizar reservas usuario-dashboard; comparar socios/productos/pagos/BD; duplicados; alertas de vencimiento; asistencia/seguimiento/rutinas | Reservas, Productos, Pagos, Vencimientos, Asistencia, Seguimiento, Rutinas, Verificación EFSRT | Verificar conexión, integridad y flujo cruzado. Actividad fechada 11/11 todavía no acreditada |
| 10 | Pagos de extremo a extremo; boleta electrónica; uso offline; permisos; pruebas finales | Pagos, comprobantes internos, Usuarios y permisos, assets locales y pruebas E2E | PENDIENTE: boleta electrónica autorizada SUNAT; una constancia interna no sustituye CPE; pruebas locales y firmas futuras |
| 11 | Probar login/registro/navegación; módulos; duplicados y vacíos; últimos retoques; evidencias y respaldo | Login, los cinco grupos del menú, Verificación EFSRT, Respaldos, GitHub Actions | Tests de navegador/MySQL y capturas automáticas; backup SQL real y firmas aún deben verificarse al terminar el periodo |

## Corrección técnica del 11 de noviembre de 2026

La actualización se aplicó directamente a la rama `main` de `anyozasad/api-persona`; no se genera ZIP ni se cambia la paleta del dashboard.

- **Semana 05:** `Productos y stock` permite **Subir foto** desde cada fila mediante `PATCH /api/productos/{id}/foto`. La API comprueba que los bytes correspondan a JPG/PNG/WEBP y modifica solo la columna `foto`. Se añade prueba de persistencia con precio y stock intactos.
- **Semanas 01–11:** en **Administración → Comprobación EFSRT**, el servidor revisa once semanas reales, con verificación de estructuras modernas y legacy, productos sin foto, inconsistencias en la BD y respaldo presente. Cada semana enlaza al módulo que corresponde. **Verificar en equipo** no significa aprobado.
- **Semana 11:** la descarga del backup del panel utiliza el comando SQL `backup:database` con `mysqldump` y entrega el archivo real; evita armar una copia enorme en memoria. Requiere MySQL y el ejecutable `mysqldump` disponible.
- **Pruebas:** PHPUnit verifica la revisión de once semanas y fotos ausentes. La prueba E2E de Chromium con base temporal verifica la pantalla de once semanas y la carga de foto desde una fila, con stock y precio invariantes. Los resultados solo cuentan como aprobados si GitHub Actions o el equipo local los ejecuta correctamente.

### Lo que no puede darse por completado automáticamente

1. Los productos con `foto = NULL` en la BD local necesitan fotografías originales. El código no puede inventar imágenes de productos desconocidos.
2. Las operaciones, roles, alertas y comprobantes requieren demostración con datos reales de la instalación de Windows/XAMPP; las pruebas de CI utilizan MySQL de ensayo.
3. Los comprobantes que genera el sistema son **internos**, no CPE SUNAT validados. El modo sin conexión a Internet tampoco equivale a operar sin servidor MySQL local.
4. Las capturas finales, la exportación del respaldo, la evidencia de las jornadas todavía futuras y las firmas del supervisor siguen sujetas a comprobación real.

En la raíz del repositorio:

```powershell
git pull origin main
cd BACKEND
php artisan migrate --force
php artisan route:list --path=api
```

**Precaución:** respalda MySQL antes de aplicar migraciones. Nunca uses `migrate:fresh` sobre la base de producción. Inicia MySQL de XAMPP, Laravel y Angular como se describe en la guía principal.

## Reglas para la evaluación

1. El sistema debe mostrar los valores reales de DB_DATABASE; no se usarán tarjetas estáticas para simular socios ni productos.
2. Toda acción visible debe llevar al módulo que dice: Matricular -> Socios, Reservas -> Reservas, Asistencia -> Asistencia, Rutinas -> Rutinas, Productos -> Productos, Pagos -> Pagos.
3. Los productos del inicio mostrarán fotos únicamente cuando exista la fotografía en productos.foto; un producto sin foto se rotulará como pendiente.
4. El botón Verificación EFSRT consulta tablas y alertas de MySQL, pero no certifica pruebas que no se ejecutaron.
5. Los formularios respetarán los permisos y conservarán el diseño blanco/negro/verde de Mallqui Gym.
6. Los seis accesos principales deben ser visibles sin abrir menús; el resto permanecerá dentro de grupos plegados.
7. No ejecutar migrate:fresh, importar dumps destructivos ni borrar la base de datos local para fabricar evidencias.

## Archivos técnicos

- Interfaz: FRONTEND/suma-angular/src/app/component/pages/admin/admin-integrado.component.ts
- Estilos: FRONTEND/suma-angular/src/app/component/pages/admin/admin-efsrt-simplificado.css
- Pantalla de productos: FRONTEND/suma-angular/src/app/component/pages/productos/
- API y persistencia: BACKEND/routes/api.php, BACKEND/app/Http/Controllers/
- Pruebas de navegación: FRONTEND/suma-angular/tests/e2e-dashboard-real.mjs
- Pruebas Laravel: BACKEND/tests/Feature/AdminDashboardNavigationTest.php y EfsrtInterfazEvidenciaTest.php
- Diagnóstico de base: BACKEND/app/Http/Controllers/VerificacionEfsrtController.php
- Recuperación de fotos: docs/FOTOS_PRODUCTOS_DASHBOARD_MYSQL.md

Los checks de CI se hacen con MySQL temporal y datos ficticios. La instalación Windows/XAMPP del alumno requiere revisión adicional con el profesor.