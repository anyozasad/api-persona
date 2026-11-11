# Mallqui Gym — auditoría técnica funcional (11/11/2026)

**Repositorio:** `anyozasad/api-persona` (rama `main`). La comprobación se realizó sobre el código y GitHub Actions, NO sobre el Windows/XAMPP ni la base privada del gimnasio.

## Evidencia ejecutada de forma automática

- [Laravel 12 + MySQL temporal y Angular 20](https://github.com/anyozasad/api-persona/actions/runs/43115269083): **122 pruebas PHPUnit (768 aserciones)** y **106 pruebas Angular** aprobadas. Revisadas directamente en los registros de ejecución.
- [Navegador Chromium + Laravel + MySQL temporal](https://github.com/anyozasad/api-persona/actions/runs/43115269110): **33 comprobaciones aprobadas**, con capturas. Incluye login, 18 rutas administrativas, socio y foto de producto persistidos, stock y precio invariantes, exportación de EFSRT con 55 actividades desglosadas, propuesta de rutina por nivel/tipo y vista móvil.
- La suite de CI no consulta ni modifica la base del equipo Windows; los registros de ensayo no deben copiarse a producción.

## Correcciones funcionales verificadas en código y sometidas a CI

1. **Ingresos reales:** el dashboard dejó de sumar precios de membresías o suscripciones como si fueran cobros. Solo contabiliza pagos con importe, fecha y estado confirmado. Reconoce tablas actuales y antiguas de pagos.
2. **Semana 05 — fotos/nombres:** se validan fotografías reales y categorías correspondientes; el diagnóstico avisa también si hay registros `Producto Prueba` con imagen pero sin nombre auténtico. No convierte registros ficticios en evidencia comercial real.
3. **Módulos de administración:** navegación normal hacia socios, membresías, pagos, reservas, rutinas, asistencia, entrenadores, clases, productos, categorías, proveedores, ventas, compras, caja, Kardex, reportes, usuarios y auditoría.
4. **Panel de inicio:** diferencia datos faltantes de valores cero reales; evita presentar tablas de MySQL ausentes como actividad económica cero.
5. **Configuración y EFSRT:** exporta el estado de las 11 semanas y módulos en un CSV basado en MySQL, sin declararlos automáticamente aprobados.
6. **Seguridad de datos:** el script de preparación de Windows exige respaldo nuevo confirmado de MySQL antes de ejecutar migraciones, y cancela el proceso si no puede producirlo.

## Contraste con los documentos oficiales TEC recuperados

La revisión se contrastó con `Bitacora_Mallqui_Gym_4_Horas_Cuadrado(1).docx` y `Registro_EFSRT_Tarde_4H(1).docx` (11 semanas, 5 actividades por semana). En el dashboard, desde **Configuración → Información del sistema → Diagnóstico avanzado**, cada semana presenta sus 5 actividades y la evidencia indicada en el registro; el CSV las incluye. Ninguna evidencia se marca como validada por la mera presencia de un botón.

Corrección funcional adicional de la **semana 06**: en **Entrenamientos → Rutinas** se añadió **Sugerir ejercicios** cuando se selecciona un socio. Usa `nivel_entrenamiento` y `enfoque_entrenamiento` guardados en su ficha, ofrece una propuesta de 3 ejercicios, y exige revisión del entrenador antes de guardar con la API existente. No modifica las rutinas previas ni asigna cargas máximas de forma automática.

**Pendientes ajenos a CI:** imágenes y nombres reales de los productos de XAMPP (semana 05), pruebas cruzadas en la instalación del gimnasio (semana 09), boleta electrónica validada por SUNAT y validación de uso sin Internet externo (semana 10), evidencias finales y firmas programadas hasta el 21/11/2026 (semana 11). La aplicación NO debe anunciar cumplimiento total sin esa comprobación presencial.

## Cumplimiento por semanas — sin inventar aprobación

| Semana | Implementación y pruebas CI | Validación todavía requerida |
|---|---|---|
| 01 | Estructura Angular, Laravel, tablas y rutas | Esquema completo y diagrama de la BD local |
| 02 | Portal, navegación y diseño móvil | Capturas reales de las páginas en el equipo |
| 03 | Login/registro/autenticación y validaciones | Cuentas reales y persistencia local |
| 04 | Socios, reservas, pagos, productos, reportes | Flujo CRUD con registros existentes |
| 05 | Producto con fotografía en MySQL de CI | Corregir fotos y nombres de todos los productos del local |
| 06 | Asistencias, rutinas, entrenador, seguimiento | Comprobar asignación y registro con socios reales |
| 07 | Menú, tarjetas, accesos y adaptación | Revisar visualmente todas las secciones del Windows |
| 08 | Fotografías y assets locales | Verificar que son nítidos y no exigen Internet externo |
| 09 | Flujos y controles de sincronización/duplicados | Coincidencia portal de cliente / administración / MySQL real |
| 10 | Pagos confirmados y constancias internas | **No existe boleta SUNAT validada ni modo sin servidor** |
| 11 | EFSRT 11 semanas, respaldos, CI y exportación | Evidencias de equipo y validación del supervisor |

## Bloqueadores locales conocidos de las capturas del usuario

- Captura previa: **10 productos, 1 con foto y 9 sin foto**; algunos se llamaban `Producto Prueba`. El estado actual de esas filas en la base local es desconocido. GitHub no almacena ni sincroniza automáticamente la base privada.
- Captura previa: **43 requisitos de tablas o columnas faltantes**. Solo el diagnóstico real en Windows determina cuáles continúan pendientes. Tener usuarios y productos recuperables NO prueba que las demás estructuras estén completas.
- Falta acreditar comprobantes CPE SUNAT, funcionamiento del entorno local, pruebas de aceptación con socios reales y firmas de bitácora. No reemplazar comprobantes internos por etiquetas tributarias no verificadas.

## Procedimiento seguro para el equipo local

1. Actualizar la rama `main` con `git pull origin main` desde la raíz del proyecto.
2. Encender MySQL de XAMPP y comprobar `BACKEND/.env` (esquema correcto, sin compartir credenciales).
3. Ejecutar `powershell -ExecutionPolicy Bypass -File .\INICIAR_DASHBOARD.ps1 -Migrar` **solo con autorización para modificar el esquema**. El script genera primero un backup SQL y lo comprueba; si no lo logra, no migra.
4. Abrir **Configuración → Información del sistema → Diagnóstico avanzado**, comprobar las once semanas, descargar el CSV y revisar cada pendiente.
5. Probar en el equipo real: socio → membresía/pago → reserva → asistencia → rutina → venta/stock → reporte → respaldo. Guardar capturas auténticas.

**Criterio de cierre:** no anunciar “100 % terminado” hasta que el diagnóstico local no muestre objetos críticos faltantes y los flujos del gimnasio operen con sus datos reales. Las pruebas CI son una evidencia técnica positiva pero limitada.
