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
