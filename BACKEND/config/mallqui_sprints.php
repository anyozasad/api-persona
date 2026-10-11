<?php

return [
    [
        'id' => 1,
        'name' => 'Cuenta y perfil del cliente',
        'module' => 'Cliente',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'auth/login'
            ],
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-cuenta/perfil'
            ],
            [
                'type' => 'route',
                'method' => 'PUT',
                'uri' => 'mi-cuenta/perfil'
            ]
        ]
    ],
    [
        'id' => 2,
        'name' => 'Membresía, pago y comprobante',
        'module' => 'Membresías',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-cuenta/membresia'
            ],
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'mi-cuenta/pagos/comprar'
            ],
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-cuenta/pagos/{idPago}/comprobante'
            ]
        ]
    ],
    [
        'id' => 3,
        'name' => 'Acceso al gimnasio',
        'module' => 'Asistencia',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'asistencias/acceso'
            ],
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-cuenta/asistencias'
            ]
        ]
    ],
    [
        'id' => 4,
        'name' => 'Rutina y entrenamiento',
        'module' => 'Entrenamiento',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-cuenta/rutinas'
            ],
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'mi-cuenta/entrenamiento-gym/sesiones'
            ]
        ]
    ],
    [
        'id' => 5,
        'name' => 'Clases y reservas',
        'module' => 'Servicios',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'clases'
            ],
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'mi-cuenta/reservas'
            ],
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'mi-cuenta/reservas/{id}/cancelar'
            ]
        ]
    ],
    [
        'id' => 6,
        'name' => 'Progreso y calendario',
        'module' => 'Experiencia',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-cuenta/progreso'
            ],
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-cuenta/calendario'
            ]
        ]
    ],
    [
        'id' => 7,
        'name' => 'Comunicación y experiencia',
        'module' => 'Comunicación',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-cuenta/soporte'
            ],
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'mi-cuenta/opiniones'
            ],
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-cuenta/notificaciones'
            ]
        ]
    ],
    [
        'id' => 8,
        'name' => 'Administración y entrenador',
        'module' => 'Administración',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'dashboard/resumen'
            ],
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-entrenador/resumen'
            ]
        ]
    ],
    [
        'id' => 9,
        'name' => 'Registro de cuenta con control de frecuencia',
        'module' => 'Seguridad',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'auth/register'
            ]
        ]
    ],
    [
        'id' => 10,
        'name' => 'Recuperación de contraseña por correo',
        'module' => 'Seguridad',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'auth/forgot-password'
            ],
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'auth/reset-password'
            ]
        ]
    ],
    [
        'id' => 11,
        'name' => 'Recuperación de acceso por DNI',
        'module' => 'Seguridad',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'auth/recovery-dni'
            ],
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'auth/recovery-dni/reset'
            ]
        ]
    ],
    [
        'id' => 12,
        'name' => 'Cierre de una o todas las sesiones',
        'module' => 'Seguridad',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'auth/logout'
            ],
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'auth/logout-todos'
            ]
        ]
    ],
    [
        'id' => 13,
        'name' => 'Cambio seguro de contraseña',
        'module' => 'Seguridad',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'PUT',
                'uri' => 'auth/cambiar-contrasena'
            ]
        ]
    ],
    [
        'id' => 14,
        'name' => 'Autenticación JWT y claims',
        'module' => 'Seguridad',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'jwt/login'
            ],
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'jwt/claims'
            ]
        ]
    ],
    [
        'id' => 15,
        'name' => 'Restricción por roles',
        'module' => 'Seguridad',
        'checks' => [
            [
                'type' => 'file_contains',
                'path' => 'routes/api.php',
                'needle' => 'rol:Administrador'
            ],
            [
                'type' => 'file_contains',
                'path' => 'routes/api.php',
                'needle' => 'rol:Entrenador'
            ],
            [
                'type' => 'file_contains',
                'path' => 'routes/api.php',
                'needle' => 'rol:Cliente'
            ]
        ]
    ],
    [
        'id' => 16,
        'name' => 'Auditoría de acciones sensibles',
        'module' => 'Seguridad',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'auditorias'
            ],
            [
                'type' => 'file_contains',
                'path' => 'routes/api.php',
                'needle' => 'auditoria'
            ]
        ]
    ],
    [
        'id' => 17,
        'name' => 'Estado público del sistema',
        'module' => 'Sistema',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'estado-sistema'
            ],
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'informacion-gym'
            ]
        ]
    ],
    [
        'id' => 18,
        'name' => 'Foto de perfil del cliente',
        'module' => 'Cliente',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-cuenta/perfil/foto'
            ],
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'mi-cuenta/perfil/foto'
            ],
            [
                'type' => 'route',
                'method' => 'DELETE',
                'uri' => 'mi-cuenta/perfil/foto'
            ]
        ]
    ],
    [
        'id' => 19,
        'name' => 'Resumen personalizado de la cuenta',
        'module' => 'Cliente',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-cuenta/resumen'
            ]
        ]
    ],
    [
        'id' => 20,
        'name' => 'Historial de pagos del cliente',
        'module' => 'Membresías',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-cuenta/pagos'
            ]
        ]
    ],
    [
        'id' => 21,
        'name' => 'Compra de membresía desde portal',
        'module' => 'Membresías',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'mi-cuenta/pagos/comprar'
            ]
        ]
    ],
    [
        'id' => 22,
        'name' => 'Cancelación de solicitud de pago',
        'module' => 'Membresías',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'mi-cuenta/pagos/{idPago}/cancelar'
            ]
        ]
    ],
    [
        'id' => 23,
        'name' => 'Contratación administrativa de membresía',
        'module' => 'Membresías',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'membresias/contratar'
            ]
        ]
    ],
    [
        'id' => 24,
        'name' => 'Renovación administrativa de membresía',
        'module' => 'Membresías',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'membresias/renovar'
            ]
        ]
    ],
    [
        'id' => 25,
        'name' => 'Estado vigente de membresía por socio',
        'module' => 'Membresías',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'clientes/{idCliente}/estado-membresia'
            ]
        ]
    ],
    [
        'id' => 26,
        'name' => 'Comprobante administrativo de membresía',
        'module' => 'Membresías',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'pagos-membresia/{idPago}/comprobante'
            ]
        ]
    ],
    [
        'id' => 27,
        'name' => 'Registro de entrada al gimnasio',
        'module' => 'Asistencia',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'asistencias/entrada'
            ]
        ]
    ],
    [
        'id' => 28,
        'name' => 'Registro de salida del gimnasio',
        'module' => 'Asistencia',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'asistencias/salida'
            ]
        ]
    ],
    [
        'id' => 29,
        'name' => 'Acceso mediante código o credencial',
        'module' => 'Asistencia',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'asistencias/acceso'
            ]
        ]
    ],
    [
        'id' => 30,
        'name' => 'Historial de asistencia por cliente',
        'module' => 'Asistencia',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'clientes/{idCliente}/asistencias'
            ]
        ]
    ],
    [
        'id' => 31,
        'name' => 'Credencial digital del socio',
        'module' => 'Asistencia',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-cuenta/credencial'
            ]
        ]
    ],
    [
        'id' => 32,
        'name' => 'Resumen operativo del entrenador',
        'module' => 'Entrenador',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-entrenador/resumen'
            ]
        ]
    ],
    [
        'id' => 33,
        'name' => 'Cartera de clientes del entrenador',
        'module' => 'Entrenador',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-entrenador/clientes'
            ]
        ]
    ],
    [
        'id' => 34,
        'name' => 'Rutinas visibles para el entrenador',
        'module' => 'Entrenador',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-entrenador/rutinas'
            ]
        ]
    ],
    [
        'id' => 35,
        'name' => 'Clases visibles para el entrenador',
        'module' => 'Entrenador',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-entrenador/clases'
            ]
        ]
    ],
    [
        'id' => 36,
        'name' => 'Reservas visibles para el entrenador',
        'module' => 'Entrenador',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-entrenador/reservas'
            ]
        ]
    ],
    [
        'id' => 37,
        'name' => 'CRUD de clases',
        'module' => 'Servicios',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'clases'
            ],
            [
                'type' => 'route',
                'method' => 'PUT',
                'uri' => 'clases/{clase}'
            ],
            [
                'type' => 'route',
                'method' => 'DELETE',
                'uri' => 'clases/{clase}'
            ]
        ]
    ],
    [
        'id' => 38,
        'name' => 'Control de cupo de clases',
        'module' => 'Servicios',
        'checks' => [
            [
                'type' => 'file_contains',
                'path' => '../FRONTEND/suma-angular/src/app/component/pages/admin/admin-integrado.component.ts',
                'needle' => 'cupo_maximo'
            ]
        ]
    ],
    [
        'id' => 39,
        'name' => 'Reserva de clase por cliente',
        'module' => 'Reservas',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'mi-cuenta/reservas'
            ]
        ]
    ],
    [
        'id' => 40,
        'name' => 'Cancelación de reserva por cliente',
        'module' => 'Reservas',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'mi-cuenta/reservas/{id}/cancelar'
            ]
        ]
    ],
    [
        'id' => 41,
        'name' => 'Cambio de estado de reserva por personal',
        'module' => 'Reservas',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'PUT',
                'uri' => 'reservas/{id}/estado'
            ]
        ]
    ],
    [
        'id' => 42,
        'name' => 'CRUD de rutinas',
        'module' => 'Entrenamiento',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'rutinas'
            ],
            [
                'type' => 'route',
                'method' => 'PUT',
                'uri' => 'rutinas/{rutina}'
            ],
            [
                'type' => 'route',
                'method' => 'DELETE',
                'uri' => 'rutinas/{rutina}'
            ]
        ]
    ],
    [
        'id' => 43,
        'name' => 'Detalle de ejercicios por rutina',
        'module' => 'Entrenamiento',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'detalle-rutinas'
            ],
            [
                'type' => 'route',
                'method' => 'PUT',
                'uri' => 'detalle-rutinas/{detalle_rutina}'
            ]
        ]
    ],
    [
        'id' => 44,
        'name' => 'Plan de entrenamiento personalizable',
        'module' => 'Entrenamiento',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'PUT',
                'uri' => 'mi-cuenta/entrenamiento-gym/plan'
            ]
        ]
    ],
    [
        'id' => 45,
        'name' => 'Registro de sesión de entrenamiento',
        'module' => 'Entrenamiento',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'mi-cuenta/entrenamiento-gym/sesiones'
            ]
        ]
    ],
    [
        'id' => 46,
        'name' => 'Entrenamiento guiado desde el portal',
        'module' => 'Entrenamiento',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-cuenta/entrenamiento-gym'
            ]
        ]
    ],
    [
        'id' => 47,
        'name' => 'Métricas de progreso del socio',
        'module' => 'Experiencia',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-cuenta/progreso'
            ]
        ]
    ],
    [
        'id' => 48,
        'name' => 'Meta semanal editable',
        'module' => 'Experiencia',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-cuenta/meta'
            ],
            [
                'type' => 'route',
                'method' => 'PUT',
                'uri' => 'mi-cuenta/meta'
            ]
        ]
    ],
    [
        'id' => 49,
        'name' => 'Calendario del socio',
        'module' => 'Experiencia',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-cuenta/calendario'
            ]
        ]
    ],
    [
        'id' => 50,
        'name' => 'Historial integral del socio',
        'module' => 'Experiencia',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-cuenta/historial'
            ]
        ]
    ],
    [
        'id' => 51,
        'name' => 'Clases favoritas',
        'module' => 'Experiencia',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-cuenta/favoritos/clases'
            ],
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'mi-cuenta/favoritos/clases'
            ],
            [
                'type' => 'route',
                'method' => 'DELETE',
                'uri' => 'mi-cuenta/favoritos/clases/{idClase}'
            ]
        ]
    ],
    [
        'id' => 52,
        'name' => 'Opiniones del servicio',
        'module' => 'Experiencia',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-cuenta/opiniones'
            ],
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'mi-cuenta/opiniones'
            ]
        ]
    ],
    [
        'id' => 53,
        'name' => 'Soporte del cliente',
        'module' => 'Comunicación',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-cuenta/soporte'
            ],
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'mi-cuenta/soporte'
            ]
        ]
    ],
    [
        'id' => 54,
        'name' => 'Respuesta y cierre de soporte',
        'module' => 'Comunicación',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'PUT',
                'uri' => 'soporte-clientes/{id}/responder'
            ],
            [
                'type' => 'route',
                'method' => 'PUT',
                'uri' => 'soporte-clientes/{id}/cerrar'
            ]
        ]
    ],
    [
        'id' => 55,
        'name' => 'Notificaciones del cliente',
        'module' => 'Comunicación',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'mi-cuenta/notificaciones'
            ]
        ]
    ],
    [
        'id' => 56,
        'name' => 'Marcado de notificaciones leídas',
        'module' => 'Comunicación',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'mi-cuenta/notificaciones/{id}/leer'
            ],
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'mi-cuenta/notificaciones/leer-todas'
            ]
        ]
    ],
    [
        'id' => 57,
        'name' => 'Notificaciones masivas desde administración',
        'module' => 'Comunicación',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'notificaciones-clientes'
            ],
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'notificaciones-clientes'
            ]
        ]
    ],
    [
        'id' => 58,
        'name' => 'Dashboard administrativo conectado a BD',
        'module' => 'Dashboard',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'dashboard/resumen'
            ]
        ]
    ],
    [
        'id' => 59,
        'name' => 'Indicadores y tendencias del dashboard',
        'module' => 'Dashboard',
        'checks' => [
            [
                'type' => 'file_contains',
                'path' => '../FRONTEND/suma-angular/src/app/component/pages/admin/admin-integrado.component.ts',
                'needle' => 'ingresos_6_meses'
            ],
            [
                'type' => 'file_contains',
                'path' => '../FRONTEND/suma-angular/src/app/component/pages/admin/admin-integrado.component.ts',
                'needle' => 'asistencias_7_dias'
            ]
        ]
    ],
    [
        'id' => 60,
        'name' => 'Priorización operativa de pendientes',
        'module' => 'Dashboard',
        'checks' => [
            [
                'type' => 'file_contains',
                'path' => '../FRONTEND/suma-angular/src/app/component/pages/admin/admin-integrado.component.ts',
                'needle' => 'dashboard-priority-board'
            ]
        ]
    ],
    [
        'id' => 61,
        'name' => 'Actualización manual y automática del dashboard',
        'module' => 'Dashboard',
        'checks' => [
            [
                'type' => 'file_contains',
                'path' => '../FRONTEND/suma-angular/src/app/component/pages/admin/admin-integrado.component.ts',
                'needle' => 'autoRefreshActivo'
            ],
            [
                'type' => 'file_contains',
                'path' => '../FRONTEND/suma-angular/src/app/component/pages/admin/admin-integrado.component.ts',
                'needle' => 'actualizarSeccionActual'
            ]
        ]
    ],
    [
        'id' => 62,
        'name' => 'Navegación modular del administrador',
        'module' => 'UX',
        'checks' => [
            [
                'type' => 'file_contains',
                'path' => '../FRONTEND/suma-angular/src/app/component/pages/admin/admin-integrado.component.ts',
                'needle' => 'admin-main-nav'
            ]
        ]
    ],
    [
        'id' => 63,
        'name' => 'Navegación administrativa móvil',
        'module' => 'UX',
        'checks' => [
            [
                'type' => 'file_contains',
                'path' => '../FRONTEND/suma-angular/src/app/component/pages/admin/admin-integrado.component.ts',
                'needle' => 'admin-mobile-modules'
            ],
            [
                'type' => 'file_contains',
                'path' => '../FRONTEND/suma-angular/src/app/component/pages/mallqui-admin.css',
                'needle' => 'ADMIN V34'
            ]
        ]
    ],
    [
        'id' => 64,
        'name' => 'CRUD de clientes',
        'module' => 'Socios',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'clientes'
            ],
            [
                'type' => 'route',
                'method' => 'PUT',
                'uri' => 'clientes/{cliente}'
            ],
            [
                'type' => 'route',
                'method' => 'DELETE',
                'uri' => 'clientes/{cliente}'
            ]
        ]
    ],
    [
        'id' => 65,
        'name' => 'Ficha integral del cliente',
        'module' => 'Socios',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'clientes/{id}/ficha'
            ]
        ]
    ],
    [
        'id' => 66,
        'name' => 'Búsqueda y filtrado de clientes',
        'module' => 'Socios',
        'checks' => [
            [
                'type' => 'file_contains',
                'path' => '../FRONTEND/suma-angular/src/app/component/pages/admin/admin-integrado.component.ts',
                'needle' => 'clientesBusqueda'
            ]
        ]
    ],
    [
        'id' => 67,
        'name' => 'CRUD de membresías y planes',
        'module' => 'Membresías',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'membresias'
            ],
            [
                'type' => 'route',
                'method' => 'PUT',
                'uri' => 'membresias/{membresia}'
            ],
            [
                'type' => 'route',
                'method' => 'DELETE',
                'uri' => 'membresias/{membresia}'
            ]
        ]
    ],
    [
        'id' => 68,
        'name' => 'Tarifas y vigencias en administración',
        'module' => 'Membresías',
        'checks' => [
            [
                'type' => 'file_contains',
                'path' => '../FRONTEND/suma-angular/src/app/component/pages/admin/admin-integrado.component.ts',
                'needle' => 'seccion===\'planes\''
            ]
        ]
    ],
    [
        'id' => 69,
        'name' => 'Gestión administrativa de pagos',
        'module' => 'Membresías',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'pagos-membresia'
            ],
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'cliente-membresias'
            ]
        ]
    ],
    [
        'id' => 70,
        'name' => 'Gestión del entrenador principal',
        'module' => 'Entrenador',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'entrenadores'
            ],
            [
                'type' => 'route',
                'method' => 'PUT',
                'uri' => 'entrenadores/{entrenadore}'
            ]
        ]
    ],
    [
        'id' => 71,
        'name' => 'CRUD de categorías de producto',
        'module' => 'Inventario',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'categorias'
            ],
            [
                'type' => 'route',
                'method' => 'PUT',
                'uri' => 'categorias/{categoria}'
            ],
            [
                'type' => 'route',
                'method' => 'DELETE',
                'uri' => 'categorias/{categoria}'
            ]
        ]
    ],
    [
        'id' => 72,
        'name' => 'CRUD de productos',
        'module' => 'Inventario',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'productos'
            ],
            [
                'type' => 'route',
                'method' => 'PUT',
                'uri' => 'productos/{producto}'
            ],
            [
                'type' => 'route',
                'method' => 'DELETE',
                'uri' => 'productos/{producto}'
            ]
        ]
    ],
    [
        'id' => 73,
        'name' => 'Alertas de stock bajo',
        'module' => 'Inventario',
        'checks' => [
            [
                'type' => 'file_contains',
                'path' => 'app/Http/Controllers/DashboardController.php',
                'needle' => 'productos_stock_bajo'
            ]
        ]
    ],
    [
        'id' => 74,
        'name' => 'Ajuste manual de stock',
        'module' => 'Inventario',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'kardex/ajustar'
            ]
        ]
    ],
    [
        'id' => 75,
        'name' => 'Kardex de movimientos',
        'module' => 'Inventario',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'kardex'
            ],
            [
                'type' => 'file_contains',
                'path' => '../FRONTEND/suma-angular/src/app/component/pages/admin/admin-integrado.component.ts',
                'needle' => 'Kardex de inventario'
            ]
        ]
    ],
    [
        'id' => 76,
        'name' => 'CRUD de proveedores',
        'module' => 'Inventario',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'proveedores'
            ],
            [
                'type' => 'route',
                'method' => 'PUT',
                'uri' => 'proveedores/{proveedore}'
            ],
            [
                'type' => 'route',
                'method' => 'DELETE',
                'uri' => 'proveedores/{proveedore}'
            ]
        ]
    ],
    [
        'id' => 77,
        'name' => 'Registro de compras con detalle',
        'module' => 'Compras',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'compras'
            ],
            [
                'type' => 'file_contains',
                'path' => '../FRONTEND/suma-angular/src/app/component/pages/admin/admin-integrado.component.ts',
                'needle' => 'compraItems'
            ]
        ]
    ],
    [
        'id' => 78,
        'name' => 'Anulación de compra',
        'module' => 'Compras',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'compras/{id}/anular'
            ]
        ]
    ],
    [
        'id' => 79,
        'name' => 'Punto de venta con carrito',
        'module' => 'Ventas',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'ventas'
            ],
            [
                'type' => 'file_contains',
                'path' => '../FRONTEND/suma-angular/src/app/component/pages/admin/admin-integrado.component.ts',
                'needle' => 'Carrito de compra'
            ]
        ]
    ],
    [
        'id' => 80,
        'name' => 'Anulación de venta',
        'module' => 'Ventas',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'ventas/{id}/anular'
            ]
        ]
    ],
    [
        'id' => 81,
        'name' => 'Apertura de caja',
        'module' => 'Caja',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'caja/abrir'
            ]
        ]
    ],
    [
        'id' => 82,
        'name' => 'Movimientos de caja',
        'module' => 'Caja',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'caja/movimientos'
            ]
        ]
    ],
    [
        'id' => 83,
        'name' => 'Cierre de caja',
        'module' => 'Caja',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'caja/cerrar'
            ]
        ]
    ],
    [
        'id' => 84,
        'name' => 'Gastos vinculados a caja abierta',
        'module' => 'Caja',
        'checks' => [
            [
                'type' => 'file_contains',
                'path' => '../FRONTEND/suma-angular/src/app/component/pages/admin/admin-integrado.component.ts',
                'needle' => 'operation-locked-state'
            ],
            [
                'type' => 'file_contains',
                'path' => '../FRONTEND/suma-angular/src/app/component/pages/admin/admin-integrado.component.ts',
                'needle' => 'registrarGasto'
            ]
        ]
    ],
    [
        'id' => 85,
        'name' => 'Historial de caja',
        'module' => 'Caja',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'caja/historial'
            ]
        ]
    ],
    [
        'id' => 86,
        'name' => 'Reporte de ingresos',
        'module' => 'Reportes',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'reportes/ingresos'
            ]
        ]
    ],
    [
        'id' => 87,
        'name' => 'Reporte de membresías por vencer',
        'module' => 'Reportes',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'reportes/vencimientos'
            ]
        ]
    ],
    [
        'id' => 88,
        'name' => 'Reporte de asistencias',
        'module' => 'Reportes',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'reportes/asistencias'
            ]
        ]
    ],
    [
        'id' => 89,
        'name' => 'Vista consolidada clientes-membresías',
        'module' => 'Reportes',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'vistas/clientes-membresias'
            ]
        ]
    ],
    [
        'id' => 90,
        'name' => 'Vista consolidada de stock',
        'module' => 'Reportes',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'vistas/stock'
            ]
        ]
    ],
    [
        'id' => 91,
        'name' => 'Vista consolidada de ventas',
        'module' => 'Reportes',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'vistas/ventas'
            ]
        ]
    ],
    [
        'id' => 92,
        'name' => 'Usuarios internos y roles',
        'module' => 'Sistema',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'usuarios'
            ],
            [
                'type' => 'route',
                'method' => 'PUT',
                'uri' => 'usuarios/{usuario}'
            ],
            [
                'type' => 'route',
                'method' => 'DELETE',
                'uri' => 'usuarios/{usuario}'
            ]
        ]
    ],
    [
        'id' => 93,
        'name' => 'Configuración general del gimnasio',
        'module' => 'Sistema',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'configuracion'
            ],
            [
                'type' => 'route',
                'method' => 'PUT',
                'uri' => 'configuracion'
            ]
        ]
    ],
    [
        'id' => 94,
        'name' => 'Respaldo desde el sistema',
        'module' => 'Sistema',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'configuracion/respaldo'
            ]
        ]
    ],
    [
        'id' => 95,
        'name' => 'Limpieza de caché y mantenimiento',
        'module' => 'Sistema',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'POST',
                'uri' => 'configuracion/limpiar-cache'
            ],
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'configuracion/estado'
            ]
        ]
    ],
    [
        'id' => 96,
        'name' => 'Auditoría visual y exportable',
        'module' => 'Sistema',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'auditorias'
            ],
            [
                'type' => 'file_contains',
                'path' => '../FRONTEND/suma-angular/src/app/component/pages/admin/admin-integrado.component.ts',
                'needle' => 'exportarAuditoria'
            ]
        ]
    ],
    [
        'id' => 97,
        'name' => 'Carnet interno del socio',
        'module' => 'Documentos',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'gym-admin/documentos/carnet/{socioId}'
            ]
        ]
    ],
    [
        'id' => 98,
        'name' => 'Comprobante y ticket interno',
        'module' => 'Documentos',
        'checks' => [
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'gym-admin/documentos/comprobante/{suscripcionId}'
            ],
            [
                'type' => 'route',
                'method' => 'GET',
                'uri' => 'gym-admin/documentos/ticket/{ventaId}'
            ]
        ]
    ],
    [
        'id' => 99,
        'name' => 'Experiencia responsive admin-cliente',
        'module' => 'UX',
        'checks' => [
            [
                'type' => 'file_contains',
                'path' => '../FRONTEND/suma-angular/src/app/component/pages/mallqui-admin.css',
                'needle' => '@media(max-width:850px)'
            ],
            [
                'type' => 'file_contains',
                'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts',
                'needle' => '@media'
            ]
        ]
    ],
    [
        'id' => 100,
        'name' => 'Aceptación automatizada de la solución',
        'module' => 'Calidad',
        'checks' => [
            [
                'type' => 'file_contains',
                'path' => 'tests/Feature/DashboardResumenTest.php',
                'needle' => 'class DashboardResumenTest'
            ],
            [
                'type' => 'file_contains',
                'path' => 'tests/Feature/EntrenamientoClienteFlowTest.php',
                'needle' => 'class EntrenamientoClienteFlowTest'
            ],
            [
                'type' => 'file_contains',
                'path' => '../FRONTEND/suma-angular/src/app/core/services/producto.service.spec.ts',
                'needle' => 'describe'
            ]
        ]
    ]
];
