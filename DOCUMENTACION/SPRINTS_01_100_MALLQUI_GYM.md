# Mallqui Gym — 100 sprints desarrollados y verificables

Este documento refleja exactamente la definición ejecutable de `BACKEND/config/mallqui_sprints.php`. Cada sprint tiene comprobaciones de rutas, archivos o funcionalidades reales que son evaluadas por `App\\Services\\SprintVerifier` y por la prueba `Sprint100AcceptanceTest.php`.

## Estado general

- Total de sprints definidos: **100**
- Sprints originales: **01–08**
- Sprints adicionales desarrollados: **09–100**
- Verificación automática: `php artisan mallqui:sprints`

## Registro de sprints

### Sprint 001 — Cuenta y perfil del cliente
**Módulo:** Cliente  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 002 — Membresía, pago y comprobante
**Módulo:** Membresías  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 003 — Acceso al gimnasio
**Módulo:** Asistencia  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 004 — Rutina y entrenamiento
**Módulo:** Entrenamiento  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 005 — Clases y reservas
**Módulo:** Servicios  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 006 — Progreso y calendario
**Módulo:** Experiencia  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 007 — Comunicación y experiencia
**Módulo:** Comunicación  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 008 — Administración y entrenador
**Módulo:** Administración  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 009 — Registro de cuenta con control de frecuencia
**Módulo:** Seguridad  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 010 — Recuperación de contraseña por correo
**Módulo:** Seguridad  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 011 — Recuperación de acceso por DNI
**Módulo:** Seguridad  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 012 — Cierre de una o todas las sesiones
**Módulo:** Seguridad  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 013 — Cambio seguro de contraseña
**Módulo:** Seguridad  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 014 — Autenticación JWT y claims
**Módulo:** Seguridad  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 015 — Restricción por roles
**Módulo:** Seguridad  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 016 — Auditoría de acciones sensibles
**Módulo:** Seguridad  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 017 — Estado público del sistema
**Módulo:** Sistema  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 018 — Foto de perfil del cliente
**Módulo:** Cliente  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 019 — Resumen personalizado de la cuenta
**Módulo:** Cliente  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 020 — Historial de pagos del cliente
**Módulo:** Membresías  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 021 — Compra de membresía desde portal
**Módulo:** Membresías  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 022 — Cancelación de solicitud de pago
**Módulo:** Membresías  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 023 — Contratación administrativa de membresía
**Módulo:** Membresías  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 024 — Renovación administrativa de membresía
**Módulo:** Membresías  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 025 — Estado vigente de membresía por socio
**Módulo:** Membresías  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 026 — Comprobante administrativo de membresía
**Módulo:** Membresías  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 027 — Registro de entrada al gimnasio
**Módulo:** Asistencia  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 028 — Registro de salida del gimnasio
**Módulo:** Asistencia  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 029 — Acceso mediante código o credencial
**Módulo:** Asistencia  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 030 — Historial de asistencia por cliente
**Módulo:** Asistencia  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 031 — Credencial digital del socio
**Módulo:** Asistencia  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 032 — Resumen operativo del entrenador
**Módulo:** Entrenador  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 033 — Cartera de clientes del entrenador
**Módulo:** Entrenador  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 034 — Rutinas visibles para el entrenador
**Módulo:** Entrenador  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 035 — Clases visibles para el entrenador
**Módulo:** Entrenador  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 036 — Reservas visibles para el entrenador
**Módulo:** Entrenador  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 037 — CRUD de clases
**Módulo:** Servicios  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 038 — Control de cupo de clases
**Módulo:** Servicios  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 039 — Reserva de clase por cliente
**Módulo:** Reservas  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 040 — Cancelación de reserva por cliente
**Módulo:** Reservas  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 041 — Cambio de estado de reserva por personal
**Módulo:** Reservas  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 042 — CRUD de rutinas
**Módulo:** Entrenamiento  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 043 — Detalle de ejercicios por rutina
**Módulo:** Entrenamiento  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 044 — Plan de entrenamiento personalizable
**Módulo:** Entrenamiento  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 045 — Registro de sesión de entrenamiento
**Módulo:** Entrenamiento  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 046 — Entrenamiento guiado desde el portal
**Módulo:** Entrenamiento  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 047 — Métricas de progreso del socio
**Módulo:** Experiencia  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 048 — Meta semanal editable
**Módulo:** Experiencia  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 049 — Calendario del socio
**Módulo:** Experiencia  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 050 — Historial integral del socio
**Módulo:** Experiencia  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 051 — Clases favoritas
**Módulo:** Experiencia  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 052 — Opiniones del servicio
**Módulo:** Experiencia  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 053 — Soporte del cliente
**Módulo:** Comunicación  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 054 — Respuesta y cierre de soporte
**Módulo:** Comunicación  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 055 — Notificaciones del cliente
**Módulo:** Comunicación  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 056 — Marcado de notificaciones leídas
**Módulo:** Comunicación  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 057 — Notificaciones masivas desde administración
**Módulo:** Comunicación  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 058 — Dashboard administrativo conectado a BD
**Módulo:** Dashboard  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 059 — Indicadores y tendencias del dashboard
**Módulo:** Dashboard  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 060 — Priorización operativa de pendientes
**Módulo:** Dashboard  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 061 — Actualización manual y automática del dashboard
**Módulo:** Dashboard  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 062 — Navegación modular del administrador
**Módulo:** UX  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 063 — Navegación administrativa móvil
**Módulo:** UX  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 064 — CRUD de clientes
**Módulo:** Socios  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 065 — Ficha integral del cliente
**Módulo:** Socios  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 066 — Búsqueda y filtrado de clientes
**Módulo:** Socios  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 067 — CRUD de membresías y planes
**Módulo:** Membresías  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 068 — Tarifas y vigencias en administración
**Módulo:** Membresías  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 069 — Gestión administrativa de pagos
**Módulo:** Membresías  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 070 — Gestión del entrenador principal
**Módulo:** Entrenador  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 071 — CRUD de categorías de producto
**Módulo:** Inventario  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 072 — CRUD de productos
**Módulo:** Inventario  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 073 — Alertas de stock bajo
**Módulo:** Inventario  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 074 — Ajuste manual de stock
**Módulo:** Inventario  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 075 — Kardex de movimientos
**Módulo:** Inventario  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 076 — CRUD de proveedores
**Módulo:** Inventario  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 077 — Registro de compras con detalle
**Módulo:** Compras  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 078 — Anulación de compra
**Módulo:** Compras  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 079 — Punto de venta con carrito
**Módulo:** Ventas  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 080 — Anulación de venta
**Módulo:** Ventas  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 081 — Apertura de caja
**Módulo:** Caja  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 082 — Movimientos de caja
**Módulo:** Caja  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 083 — Cierre de caja
**Módulo:** Caja  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 084 — Gastos vinculados a caja abierta
**Módulo:** Caja  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 085 — Historial de caja
**Módulo:** Caja  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 086 — Reporte de ingresos
**Módulo:** Reportes  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 087 — Reporte de membresías por vencer
**Módulo:** Reportes  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 088 — Reporte de asistencias
**Módulo:** Reportes  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 089 — Vista consolidada clientes-membresías
**Módulo:** Reportes  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 090 — Vista consolidada de stock
**Módulo:** Reportes  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 091 — Vista consolidada de ventas
**Módulo:** Reportes  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 092 — Usuarios internos y roles
**Módulo:** Sistema  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 093 — Configuración general del gimnasio
**Módulo:** Sistema  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 094 — Respaldo desde el sistema
**Módulo:** Sistema  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 095 — Limpieza de caché y mantenimiento
**Módulo:** Sistema  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 096 — Auditoría visual y exportable
**Módulo:** Sistema  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 097 — Carnet interno del socio
**Módulo:** Documentos  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 098 — Comprobante y ticket interno
**Módulo:** Documentos  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 099 — Experiencia responsive admin-cliente
**Módulo:** UX  
**Estado:** IMPLEMENTADO Y VERIFICABLE

### Sprint 100 — Aceptación automatizada de la solución
**Módulo:** Calidad  
**Estado:** IMPLEMENTADO Y VERIFICABLE

## Cómo comprobarlos

Desde la carpeta `BACKEND`:

```bash
php artisan mallqui:sprints
php artisan test
```

El comando de sprints falla si no existen exactamente 100 o si cualquiera de sus evidencias funcionales deja de existir.
