# Requisitos funcionales - Portal del cliente Mallqui Gym

Este documento describe el flujo funcional del cliente después de comprar una membresía. Cada requisito debe poder demostrarse desde la interfaz sin editar la base de datos manualmente.

## Sprint 1 - Cuenta y perfil

| RF | Requisito | Estado |
|---|---|---|
| RF-01 | Iniciar sesión como cliente | Completo |
| RF-02 | Consultar y actualizar datos personales | Completo |
| RF-03 | Cambiar contraseña y cerrar sesiones | Completo |

## Sprint 2 - Membresía, pago y comprobante

| RF | Requisito | Estado |
|---|---|---|
| RF-04 | Consultar planes y beneficios desde MySQL | Completo |
| RF-05 | Comprar o renovar una membresía | Completo |
| RF-06 | Registrar método y número de operación | Completo |
| RF-07 | Activar o programar automáticamente el periodo de membresía | Completo |
| RF-08 | Consultar historial de pagos | Completo |
| RF-09 | Generar boleta interna con serie B001, correlativo y código de barras Code128 | Completo |
| RF-10 | Imprimir o guardar la boleta como PDF desde el navegador | Completo |

> La boleta generada por el proyecto es un comprobante interno funcional. Para convertirla en comprobante electrónico con validez tributaria se requiere integración y autorización de SUNAT.

## Sprint 3 - Acceso al gimnasio

| RF | Requisito | Estado |
|---|---|---|
| RF-11 | Generar credencial digital del socio | Completo |
| RF-12 | Mostrar código de barras de acceso | Completo |
| RF-13 | Validar membresía vigente al ingresar | Completo |
| RF-14 | Escanear código MG o DNI en recepción | Completo |
| RF-15 | Registrar entrada al primer escaneo y salida al siguiente | Completo |
| RF-16 | Consultar historial de asistencias | Completo |

## Sprint 4 - Rutina y entrenamiento dentro del gym

| RF | Requisito | Estado |
|---|---|---|
| RF-17 | Entrenador asigna rutina al cliente | Completo |
| RF-18 | Rutina contiene ejercicios, series, repeticiones, peso, descanso e indicaciones | Completo |
| RF-19 | Cliente solo entrena con su rutina activa real | Completo |
| RF-20 | Controlar series, descansos, siguiente ejercicio y carga utilizada | Completo |
| RF-21 | Guardar sesión relacionada con la rutina y sus ejercicios | Completo |
| RF-22 | Impedir guardar entrenamiento sin membresía o rutina activa | Completo |

## Sprint 5 - Clases y reservas

| RF | Requisito | Estado |
|---|---|---|
| RF-23 | Consultar clases activas, horarios y entrenador | Completo |
| RF-24 | Reservar clase con membresía válida | Completo |
| RF-25 | Respetar cupo y evitar reserva duplicada | Completo |
| RF-26 | Cancelar reserva según reglas configuradas | Completo |
| RF-27 | Consultar reservas activas, asistidas y canceladas | Completo |

## Sprint 6 - Progreso y calendario

| RF | Requisito | Estado |
|---|---|---|
| RF-28 | Consultar sesiones y minutos entrenados | Completo |
| RF-29 | Consultar asistencias del mes | Completo |
| RF-30 | Configurar meta semanal razonable de sesiones | Completo |
| RF-31 | Mostrar historial de entrenamientos, asistencias, reservas y pagos | Completo |
| RF-32 | Mostrar calendario con rutina, clases y vencimiento de membresía | Completo |

## Sprint 7 - Comunicación y experiencia

| RF | Requisito | Estado |
|---|---|---|
| RF-33 | Recibir avisos del gimnasio | Completo |
| RF-34 | Avisar por membresía, clase y rutina activa | Completo |
| RF-35 | Enviar consultas a soporte y ver respuestas | Completo |
| RF-36 | Guardar clases favoritas | Completo |
| RF-37 | Enviar opinión del servicio | Completo |

## Sprint 8 - Administración y entrenador

| RF | Requisito | Estado |
|---|---|---|
| RF-38 | Administrar clientes, planes, clases y asistencias | Completo |
| RF-39 | Recepción registra acceso mediante lector de código de barras | Completo |
| RF-40 | Entrenador crea, edita y finaliza rutinas | Completo |
| RF-41 | Entrenador crea, edita y elimina ejercicios | Completo |
| RF-42 | Inventario, compras, ventas, caja y reportes conectados a la BD principal | Completo |
| RF-43 | Auditoría y configuración del sistema | Completo |

## Criterio de entrega

Antes de entregar:

```bash
cd BACKEND
php artisan db:sincronizar
php artisan migrate
php artisan db:seed
php artisan db:verificar
php artisan test

cd ../FRONTEND/suma-angular
npm run build
```

El proyecto está listo para demostración cuando las pruebas de Laravel y la compilación de Angular terminan sin errores.
