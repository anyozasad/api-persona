# REQUERIMIENTOS FUNCIONALES – SISTEMA MALLQUI GYM

## 1. Objetivo
Definir las funciones que debe cumplir el sistema Mallqui Gym para gestionar el acceso de usuarios, clientes, membresías, pagos, rutinas, entrenamiento, clases, reservas, asistencias, progreso, soporte y operaciones administrativas.

## 2. Actores del sistema
- **Cliente:** usuario que utiliza el portal para consultar su membresía, entrenar, reservar clases, revisar asistencias, pagos y soporte.
- **Entrenador:** personal encargado de revisar y registrar rutinas de entrenamiento.
- **Administrador:** personal que gestiona clientes, entrenadores, membresías, pagos, clases, asistencias, productos, ventas y reportes.

## 3. Requerimientos funcionales

| ID | Módulo | Actor | Requerimiento funcional | Resultado esperado |
|---|---|---|---|---|
| RF-01 | Autenticación | Todos | El sistema debe permitir iniciar sesión mediante usuario y contraseña. | El usuario autenticado accede al módulo correspondiente a su rol. |
| RF-02 | Autenticación | Todos | El sistema debe validar el estado y rol del usuario antes de permitir el acceso. | Solo usuarios activos y autorizados ingresan al sistema. |
| RF-03 | Sesión | Todos | El sistema debe permitir cerrar sesión de forma segura. | La sesión y credenciales temporales quedan invalidadas en el cliente. |
| RF-04 | Perfil | Cliente | El sistema debe mostrar los datos personales registrados del cliente. | El cliente visualiza su información de cuenta. |
| RF-05 | Perfil | Cliente | El sistema debe permitir actualizar los datos personales permitidos. | Los cambios quedan guardados en la base de datos. |
| RF-06 | Membresías | Cliente | El sistema debe mostrar los planes de membresía disponibles. | El cliente puede consultar nombre, duración y costo del plan. |
| RF-07 | Membresías | Cliente | El sistema debe mostrar la membresía actual, vigencia y fecha de vencimiento. | El cliente conoce el estado de su acceso al gimnasio. |
| RF-08 | Membresías | Administrador | El sistema debe permitir crear, editar y administrar planes de membresía. | Los planes quedan disponibles para los clientes. |
| RF-09 | Pagos | Cliente | El sistema debe permitir registrar o solicitar el pago de una membresía. | El pago queda asociado al cliente y al plan seleccionado. |
| RF-10 | Pagos | Cliente | El sistema debe mostrar el historial de pagos del cliente. | El usuario puede revisar montos, fechas y estado de sus pagos. |
| RF-11 | Pagos | Administrador | El sistema debe permitir revisar y gestionar pagos o solicitudes de pago. | El administrador puede validar la información registrada. |
| RF-12 | Comprobante | Cliente | El sistema debe generar una representación imprimible del comprobante de pago. | El cliente puede visualizar e imprimir su boleta/comprobante. |
| RF-13 | Entrenamiento | Cliente | El sistema debe permitir seleccionar un objetivo de entrenamiento. | Se registra o conserva el objetivo seleccionado por el cliente. |
| RF-14 | Entrenamiento | Cliente | El sistema debe permitir seleccionar el nivel Principiante, Intermedio o Avanzado. | La guía se adapta al nivel elegido. |
| RF-15 | Entrenamiento | Cliente | El sistema debe mostrar tipo de entrenamiento, clase de sesión y ejercicios de referencia de acuerdo con objetivo y nivel. | El cliente obtiene una guía previa antes de recibir la rutina definitiva. |
| RF-16 | Entrenamiento | Cliente | El sistema debe mostrar imágenes asociadas a los ejercicios de referencia. | El usuario identifica visualmente el ejercicio o máquina. |
| RF-17 | Rutinas | Cliente | El sistema debe permitir solicitar una rutina al personal del gimnasio. | La solicitud queda registrada para revisión del personal. |
| RF-18 | Rutinas | Sistema | El sistema debe evitar solicitudes duplicadas de rutina cuando exista una solicitud pendiente equivalente. | No se generan solicitudes repetidas innecesariamente. |
| RF-19 | Rutinas | Entrenador | El sistema debe permitir registrar una rutina para un cliente. | La rutina queda asociada al cliente. |
| RF-20 | Rutinas | Cliente | El sistema debe mostrar la rutina activa asignada por el entrenador. | El cliente visualiza nombre, objetivo y ejercicios de su rutina. |
| RF-21 | Rutinas | Cliente | El sistema debe mostrar series, repeticiones, carga, descanso y observaciones de cada ejercicio asignado. | El usuario dispone de la prescripción registrada por el entrenador. |
| RF-22 | Entrenamiento | Cliente | El sistema debe permitir iniciar y seguir una sesión basada en la rutina asignada. | El usuario puede avanzar por los ejercicios y series de la sesión. |
| RF-23 | Clases | Cliente | El sistema debe mostrar las clases activas disponibles. | El cliente consulta clase, horario y datos relacionados. |
| RF-24 | Clases | Administrador | El sistema debe permitir registrar y administrar clases del gimnasio. | Las clases creadas quedan disponibles para consulta. |
| RF-25 | Reservas | Cliente | El sistema debe permitir reservar una clase disponible. | La reserva queda registrada para el cliente. |
| RF-26 | Reservas | Cliente | El sistema debe mostrar las reservas realizadas por el cliente. | El usuario puede consultar sus actividades reservadas. |
| RF-27 | Credencial | Cliente | El sistema debe mostrar una credencial digital con identificación del socio. | El cliente puede presentar su credencial en recepción. |
| RF-28 | Asistencias | Personal/Administrador | El sistema debe permitir registrar la entrada del cliente al gimnasio. | Se crea una asistencia con fecha y hora de ingreso. |
| RF-29 | Asistencias | Personal/Administrador | El sistema debe permitir registrar la salida del cliente. | La asistencia abierta queda cerrada con la hora de salida. |
| RF-30 | Asistencias | Cliente | El sistema debe mostrar el historial de asistencias del cliente. | El usuario consulta fechas, entradas y salidas registradas. |
| RF-31 | Progreso | Cliente | El sistema debe mostrar información de progreso e historial de actividad disponible. | El cliente puede hacer seguimiento de su uso del gimnasio. |
| RF-32 | Soporte | Cliente | El sistema debe permitir enviar consultas o solicitudes al gimnasio. | La consulta queda registrada con asunto y mensaje. |
| RF-33 | Soporte | Cliente | El sistema debe mostrar el estado o seguimiento de las consultas enviadas. | El cliente conoce si la solicitud está pendiente o atendida. |
| RF-34 | Soporte | Administrador | El sistema debe permitir revisar y responder las consultas de los clientes. | La respuesta queda asociada a la solicitud. |
| RF-35 | Notificaciones | Cliente | El sistema debe mostrar avisos o notificaciones relacionadas con su cuenta. | El cliente recibe información relevante dentro del portal. |
| RF-36 | Clientes | Administrador | El sistema debe permitir registrar, consultar, editar y administrar clientes. | La información de los clientes se mantiene actualizada. |
| RF-37 | Entrenadores | Administrador | El sistema debe permitir registrar y administrar entrenadores. | Los entrenadores quedan disponibles para las operaciones del gimnasio. |
| RF-38 | Productos | Administrador | El sistema debe permitir registrar y administrar productos del gimnasio. | El inventario de productos puede ser consultado y actualizado. |
| RF-39 | Proveedores | Administrador | El sistema debe permitir registrar y administrar proveedores. | Los proveedores quedan disponibles para compras y control interno. |
| RF-40 | Compras | Administrador | El sistema debe permitir registrar compras de productos. | Se guarda la compra y su detalle correspondiente. |
| RF-41 | Ventas | Administrador | El sistema debe permitir registrar ventas de productos. | La venta y su detalle quedan almacenados. |
| RF-42 | Reportes | Administrador | El sistema debe permitir consultar reportes de información operativa disponible. | El administrador puede revisar información consolidada para el control del gimnasio. |
| RF-43 | Integración | Sistema | El frontend Angular debe consumir los servicios del backend Laravel mediante API. | Las acciones del usuario se procesan y devuelven resultados desde el servidor. |
| RF-44 | Persistencia | Sistema | El backend debe guardar la información operativa en MySQL. | Los registros permanecen disponibles después de cerrar y volver a abrir el sistema. |
| RF-45 | Seguridad | Sistema | El sistema debe controlar el acceso a operaciones según el rol autenticado. | Un cliente no accede a operaciones exclusivas del administrador o entrenador. |

## 4. Flujo funcional principal del cliente
1. El cliente inicia sesión.
2. Consulta su perfil y membresía.
3. Selecciona o revisa su plan y pago.
4. Consulta su comprobante.
5. Selecciona objetivo y nivel de entrenamiento.
6. Revisa ejercicios de referencia.
7. Solicita o consulta su rutina asignada.
8. Inicia su sesión de entrenamiento.
9. Consulta clases y realiza reservas.
10. Presenta su credencial para el control de acceso.
11. Revisa su historial de asistencias y progreso.
12. Envía consultas al centro de soporte cuando lo necesita.

## 5. Flujo funcional principal del personal
1. El personal inicia sesión con su rol.
2. Gestiona clientes, membresías, pagos, clases o asistencias según sus permisos.
3. El entrenador registra rutinas para los clientes.
4. El administrador controla operaciones y reportes del gimnasio.
5. Los cambios realizados quedan disponibles en el portal del cliente mediante la API.

## 6. Resultado esperado
El sistema Mallqui Gym debe permitir que las funciones del cliente, entrenador y administrador trabajen de manera integrada mediante Angular, Laravel, API y MySQL, manteniendo la información centralizada y disponible para las operaciones del gimnasio.
