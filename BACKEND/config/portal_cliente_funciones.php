<?php

return [
    [
        'id' => 1,
        'name' => 'Inicio de sesión',
        'area' => 'Cuenta',
        'checks' => [
            ['type' => 'route', 'method' => 'POST', 'uri' => 'auth/login'],
        ],
    ],
    [
        'id' => 2,
        'name' => 'Registro de cuenta',
        'area' => 'Cuenta',
        'checks' => [
            ['type' => 'route', 'method' => 'POST', 'uri' => 'auth/register'],
        ],
    ],
    [
        'id' => 3,
        'name' => 'Recuperación por correo',
        'area' => 'Cuenta',
        'checks' => [
            ['type' => 'route', 'method' => 'POST', 'uri' => 'auth/forgot-password'],
        ],
    ],
    [
        'id' => 4,
        'name' => 'Restablecimiento de contraseña',
        'area' => 'Cuenta',
        'checks' => [
            ['type' => 'route', 'method' => 'POST', 'uri' => 'auth/reset-password'],
        ],
    ],
    [
        'id' => 5,
        'name' => 'Recuperación por DNI',
        'area' => 'Cuenta',
        'checks' => [
            ['type' => 'route', 'method' => 'POST', 'uri' => 'auth/recovery-dni'],
        ],
    ],
    [
        'id' => 6,
        'name' => 'Confirmación de recuperación por DNI',
        'area' => 'Cuenta',
        'checks' => [
            ['type' => 'route', 'method' => 'POST', 'uri' => 'auth/recovery-dni/reset'],
        ],
    ],
    [
        'id' => 7,
        'name' => 'Consulta de sesión actual',
        'area' => 'Cuenta',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'auth/me'],
        ],
    ],
    [
        'id' => 8,
        'name' => 'Cierre de sesión actual',
        'area' => 'Cuenta',
        'checks' => [
            ['type' => 'route', 'method' => 'POST', 'uri' => 'auth/logout'],
        ],
    ],
    [
        'id' => 9,
        'name' => 'Cierre de todas las sesiones',
        'area' => 'Cuenta',
        'checks' => [
            ['type' => 'route', 'method' => 'POST', 'uri' => 'auth/logout-todos'],
        ],
    ],
    [
        'id' => 10,
        'name' => 'Cambio de contraseña',
        'area' => 'Cuenta',
        'checks' => [
            ['type' => 'route', 'method' => 'PUT', 'uri' => 'auth/cambiar-contrasena'],
        ],
    ],
    [
        'id' => 11,
        'name' => 'Listado de planes de membresía',
        'area' => 'Membresía',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'membresias'],
        ],
    ],
    [
        'id' => 12,
        'name' => 'Detalle de plan de membresía',
        'area' => 'Membresía',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'membresias/{membresia}'],
        ],
    ],
    [
        'id' => 13,
        'name' => 'Listado de clases disponibles',
        'area' => 'Clases',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'clases'],
        ],
    ],
    [
        'id' => 14,
        'name' => 'Detalle de clase',
        'area' => 'Clases',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'clases/{clase}'],
        ],
    ],
    [
        'id' => 15,
        'name' => 'Resumen personal del cliente',
        'area' => 'Inicio',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'mi-cuenta/resumen'],
        ],
    ],
    [
        'id' => 16,
        'name' => 'Consulta de perfil',
        'area' => 'Perfil',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'mi-cuenta/perfil'],
        ],
    ],
    [
        'id' => 17,
        'name' => 'Consulta de foto de perfil',
        'area' => 'Perfil',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'mi-cuenta/perfil/foto'],
        ],
    ],
    [
        'id' => 18,
        'name' => 'Carga de foto de perfil',
        'area' => 'Perfil',
        'checks' => [
            ['type' => 'route', 'method' => 'POST', 'uri' => 'mi-cuenta/perfil/foto'],
        ],
    ],
    [
        'id' => 19,
        'name' => 'Eliminación de foto de perfil',
        'area' => 'Perfil',
        'checks' => [
            ['type' => 'route', 'method' => 'DELETE', 'uri' => 'mi-cuenta/perfil/foto'],
        ],
    ],
    [
        'id' => 20,
        'name' => 'Actualización de perfil',
        'area' => 'Perfil',
        'checks' => [
            ['type' => 'route', 'method' => 'PUT', 'uri' => 'mi-cuenta/perfil'],
        ],
    ],
    [
        'id' => 21,
        'name' => 'Consulta de membresía actual',
        'area' => 'Membresía',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'mi-cuenta/membresia'],
        ],
    ],
    [
        'id' => 22,
        'name' => 'Historial de pagos',
        'area' => 'Membresía',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'mi-cuenta/pagos'],
        ],
    ],
    [
        'id' => 23,
        'name' => 'Consulta de comprobante',
        'area' => 'Membresía',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'mi-cuenta/pagos/{idPago}/comprobante'],
        ],
    ],
    [
        'id' => 24,
        'name' => 'Consulta de rutinas',
        'area' => 'Rutina',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'mi-cuenta/rutinas'],
        ],
    ],
    [
        'id' => 25,
        'name' => 'Historial de asistencias',
        'area' => 'Asistencia',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'mi-cuenta/asistencias'],
        ],
    ],
    [
        'id' => 26,
        'name' => 'Historial de compras',
        'area' => 'Compras',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'mi-cuenta/compras'],
        ],
    ],
    [
        'id' => 27,
        'name' => 'Productos disponibles',
        'area' => 'Productos',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'mi-cuenta/productos'],
        ],
    ],
    [
        'id' => 28,
        'name' => 'Consulta de entrenamiento guiado',
        'area' => 'Entrenamiento',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'mi-cuenta/entrenamiento-gym'],
        ],
    ],
    [
        'id' => 29,
        'name' => 'Guardado de plan de entrenamiento',
        'area' => 'Entrenamiento',
        'checks' => [
            ['type' => 'route', 'method' => 'PUT', 'uri' => 'mi-cuenta/entrenamiento-gym/plan'],
        ],
    ],
    [
        'id' => 30,
        'name' => 'Registro de sesión de entrenamiento',
        'area' => 'Entrenamiento',
        'checks' => [
            ['type' => 'route', 'method' => 'POST', 'uri' => 'mi-cuenta/entrenamiento-gym/sesiones'],
        ],
    ],
    [
        'id' => 31,
        'name' => 'Compra de membresía',
        'area' => 'Membresía',
        'checks' => [
            ['type' => 'route', 'method' => 'POST', 'uri' => 'mi-cuenta/pagos/comprar'],
        ],
    ],
    [
        'id' => 32,
        'name' => 'Cancelación de solicitud de pago',
        'area' => 'Membresía',
        'checks' => [
            ['type' => 'route', 'method' => 'POST', 'uri' => 'mi-cuenta/pagos/{idPago}/cancelar'],
        ],
    ],
    [
        'id' => 33,
        'name' => 'Consulta de reservas propias',
        'area' => 'Reservas',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'mi-cuenta/reservas'],
        ],
    ],
    [
        'id' => 34,
        'name' => 'Reserva de clase',
        'area' => 'Reservas',
        'checks' => [
            ['type' => 'route', 'method' => 'POST', 'uri' => 'mi-cuenta/reservas'],
        ],
    ],
    [
        'id' => 35,
        'name' => 'Cancelación de reserva',
        'area' => 'Reservas',
        'checks' => [
            ['type' => 'route', 'method' => 'POST', 'uri' => 'mi-cuenta/reservas/{id}/cancelar'],
        ],
    ],
    [
        'id' => 36,
        'name' => 'Consulta de progreso',
        'area' => 'Progreso',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'mi-cuenta/progreso'],
        ],
    ],
    [
        'id' => 37,
        'name' => 'Consulta de meta semanal',
        'area' => 'Progreso',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'mi-cuenta/meta'],
        ],
    ],
    [
        'id' => 38,
        'name' => 'Actualización de meta semanal',
        'area' => 'Progreso',
        'checks' => [
            ['type' => 'route', 'method' => 'PUT', 'uri' => 'mi-cuenta/meta'],
        ],
    ],
    [
        'id' => 39,
        'name' => 'Calendario personal',
        'area' => 'Calendario',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'mi-cuenta/calendario'],
        ],
    ],
    [
        'id' => 40,
        'name' => 'Consulta de notificaciones',
        'area' => 'Comunicación',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'mi-cuenta/notificaciones'],
        ],
    ],
    [
        'id' => 41,
        'name' => 'Lectura individual de notificación',
        'area' => 'Comunicación',
        'checks' => [
            ['type' => 'route', 'method' => 'POST', 'uri' => 'mi-cuenta/notificaciones/{id}/leer'],
        ],
    ],
    [
        'id' => 42,
        'name' => 'Lectura total de notificaciones',
        'area' => 'Comunicación',
        'checks' => [
            ['type' => 'route', 'method' => 'POST', 'uri' => 'mi-cuenta/notificaciones/leer-todas'],
        ],
    ],
    [
        'id' => 43,
        'name' => 'Consulta del entrenador asignado',
        'area' => 'Entrenador',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'mi-cuenta/entrenador'],
        ],
    ],
    [
        'id' => 44,
        'name' => 'Historial integral del socio',
        'area' => 'Historial',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'mi-cuenta/historial'],
        ],
    ],
    [
        'id' => 45,
        'name' => 'Credencial digital',
        'area' => 'Credencial',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'mi-cuenta/credencial'],
        ],
    ],
    [
        'id' => 46,
        'name' => 'Consulta de clases favoritas',
        'area' => 'Favoritos',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'mi-cuenta/favoritos/clases'],
        ],
    ],
    [
        'id' => 47,
        'name' => 'Agregar clase favorita',
        'area' => 'Favoritos',
        'checks' => [
            ['type' => 'route', 'method' => 'POST', 'uri' => 'mi-cuenta/favoritos/clases'],
        ],
    ],
    [
        'id' => 48,
        'name' => 'Quitar clase favorita',
        'area' => 'Favoritos',
        'checks' => [
            ['type' => 'route', 'method' => 'DELETE', 'uri' => 'mi-cuenta/favoritos/clases/{idClase}'],
        ],
    ],
    [
        'id' => 49,
        'name' => 'Consulta de opiniones',
        'area' => 'Experiencia',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'mi-cuenta/opiniones'],
        ],
    ],
    [
        'id' => 50,
        'name' => 'Envío de opinión',
        'area' => 'Experiencia',
        'checks' => [
            ['type' => 'route', 'method' => 'POST', 'uri' => 'mi-cuenta/opiniones'],
        ],
    ],
    [
        'id' => 51,
        'name' => 'Consulta de solicitudes de soporte',
        'area' => 'Soporte',
        'checks' => [
            ['type' => 'route', 'method' => 'GET', 'uri' => 'mi-cuenta/soporte'],
        ],
    ],
    [
        'id' => 52,
        'name' => 'Creación de solicitud de soporte',
        'area' => 'Soporte',
        'checks' => [
            ['type' => 'route', 'method' => 'POST', 'uri' => 'mi-cuenta/soporte'],
        ],
    ],
    [
        'id' => 53,
        'name' => 'Sincronización automática del portal',
        'area' => 'Inicio',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'iniciarSincronizacionAutomatica('],
        ],
    ],
    [
        'id' => 54,
        'name' => 'Actualización manual de sección',
        'area' => 'Inicio',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'actualizarSeccion('],
        ],
    ],
    [
        'id' => 55,
        'name' => 'Navegación entre módulos',
        'area' => 'Navegación',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'abrirModulo('],
        ],
    ],
    [
        'id' => 56,
        'name' => 'Selección de enfoque de entrenamiento',
        'area' => 'Entrenamiento',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'abrirEnfoqueEntrenamiento('],
        ],
    ],
    [
        'id' => 57,
        'name' => 'Selección de nivel de entrenamiento',
        'area' => 'Entrenamiento',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'seleccionarNivelEntrenamiento('],
        ],
    ],
    [
        'id' => 58,
        'name' => 'Imagen de referencia de ejercicio',
        'area' => 'Entrenamiento',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'imagenEjercicioReferencia('],
        ],
    ],
    [
        'id' => 59,
        'name' => 'Imagen alternativa de ejercicio',
        'area' => 'Entrenamiento',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'imagenReferenciaFallback('],
        ],
    ],
    [
        'id' => 60,
        'name' => 'Solicitud de rutina según perfil',
        'area' => 'Rutina',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'solicitarRutinaConPerfil('],
        ],
    ],
    [
        'id' => 61,
        'name' => 'Selección de foto antes de guardar',
        'area' => 'Perfil',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'seleccionarFotoPerfil('],
        ],
    ],
    [
        'id' => 62,
        'name' => 'Cancelación de edición de foto',
        'area' => 'Perfil',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'cancelarFotoPerfil('],
        ],
    ],
    [
        'id' => 63,
        'name' => 'Normalización de datos de perfil',
        'area' => 'Perfil',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'normalizarPerfil('],
        ],
    ],
    [
        'id' => 64,
        'name' => 'Sincronización de datos del cliente',
        'area' => 'Perfil',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'sincronizarDatosCliente('],
        ],
    ],
    [
        'id' => 65,
        'name' => 'Indicador de navegación principal',
        'area' => 'Navegación',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'navPrincipalActivo('],
        ],
    ],
    [
        'id' => 66,
        'name' => 'Contador de avisos no leídos',
        'area' => 'Comunicación',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'cargarContadorAvisos('],
        ],
    ],
    [
        'id' => 67,
        'name' => 'Selección de plan para renovación',
        'area' => 'Membresía',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'seleccionarPlanRenovacion('],
        ],
    ],
    [
        'id' => 68,
        'name' => 'Instrucciones según método de pago',
        'area' => 'Membresía',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'instruccionMetodoPago('],
        ],
    ],
    [
        'id' => 69,
        'name' => 'Siguiente paso contextual',
        'area' => 'Navegación',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'irSiguientePaso('],
        ],
    ],
    [
        'id' => 70,
        'name' => 'Rutina actual visible',
        'area' => 'Rutina',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'get rutinaActual'],
        ],
    ],
    [
        'id' => 71,
        'name' => 'Nombre del entrenador visible',
        'area' => 'Entrenador',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'get nombreEntrenador'],
        ],
    ],
    [
        'id' => 72,
        'name' => 'Filtro de reservas activas',
        'area' => 'Reservas',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'get reservasActivas'],
        ],
    ],
    [
        'id' => 73,
        'name' => 'Filtro de reservas asistidas',
        'area' => 'Reservas',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'get reservasAsistidas'],
        ],
    ],
    [
        'id' => 74,
        'name' => 'Filtro de reservas canceladas',
        'area' => 'Reservas',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'get reservasCanceladas'],
        ],
    ],
    [
        'id' => 75,
        'name' => 'Asistencias del mes actual',
        'area' => 'Asistencia',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'get asistenciasMesActual'],
        ],
    ],
    [
        'id' => 76,
        'name' => 'Productos destacados con stock',
        'area' => 'Productos',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'get productosInicioVisibles'],
        ],
    ],
    [
        'id' => 77,
        'name' => 'Detección de asistencia abierta',
        'area' => 'Asistencia',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'get asistenciaAbierta'],
        ],
    ],
    [
        'id' => 78,
        'name' => 'Consulta rápida de última asistencia',
        'area' => 'Asistencia',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'get ultimaAsistencia'],
        ],
    ],
    [
        'id' => 79,
        'name' => 'Indicador de perfil completo',
        'area' => 'Perfil',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'get perfilCompleto'],
        ],
    ],
    [
        'id' => 80,
        'name' => 'Pasos de bienvenida del usuario',
        'area' => 'Inicio',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'get onboardingPasos'],
        ],
    ],
    [
        'id' => 81,
        'name' => 'Progreso de bienvenida',
        'area' => 'Inicio',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'get onboardingProgreso'],
        ],
    ],
    [
        'id' => 82,
        'name' => 'Progreso mensual calculado',
        'area' => 'Progreso',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'get progresoMensualPortal'],
        ],
    ],
    [
        'id' => 83,
        'name' => 'Días restantes de membresía',
        'area' => 'Membresía',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'get diasRestantesMembresia'],
        ],
    ],
    [
        'id' => 84,
        'name' => 'Solicitud de rutina al personal',
        'area' => 'Rutina',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'solicitarRutinaAlPersonal('],
        ],
    ],
    [
        'id' => 85,
        'name' => 'Carga del plan de entrenamiento',
        'area' => 'Entrenamiento',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'cargarEntrenamientoCasa('],
        ],
    ],
    [
        'id' => 86,
        'name' => 'Selección de objetivo personal',
        'area' => 'Entrenamiento',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'seleccionarObjetivoCasa('],
        ],
    ],
    [
        'id' => 87,
        'name' => 'Selección de días de entrenamiento',
        'area' => 'Entrenamiento',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'toggleDiaCasa('],
        ],
    ],
    [
        'id' => 88,
        'name' => 'Selección de zonas de entrenamiento',
        'area' => 'Entrenamiento',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'toggleZonaCasa('],
        ],
    ],
    [
        'id' => 89,
        'name' => 'Guardado del plan desde la interfaz',
        'area' => 'Entrenamiento',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'guardarPlanCasa('],
        ],
    ],
    [
        'id' => 90,
        'name' => 'Listado de ejercicios por zona',
        'area' => 'Entrenamiento',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'ejerciciosZonaCasa('],
        ],
    ],
    [
        'id' => 91,
        'name' => 'Detección de equipo por rutina',
        'area' => 'Entrenamiento',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'equipoRutinaGym('],
        ],
    ],
    [
        'id' => 92,
        'name' => 'Actualización de carga de ejercicio',
        'area' => 'Entrenamiento',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'actualizarCargaGym('],
        ],
    ],
    [
        'id' => 93,
        'name' => 'Registro de serie completada',
        'area' => 'Entrenamiento',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'completarSerieGym('],
        ],
    ],
    [
        'id' => 94,
        'name' => 'Omisión controlada del descanso',
        'area' => 'Entrenamiento',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'saltarDescansoGym('],
        ],
    ],
    [
        'id' => 95,
        'name' => 'Avance al siguiente ejercicio',
        'area' => 'Entrenamiento',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'avanzarEjercicioCasa('],
        ],
    ],
    [
        'id' => 96,
        'name' => 'Inicio de sesión de entrenamiento',
        'area' => 'Entrenamiento',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'iniciarEntrenamientoCasa('],
        ],
    ],
    [
        'id' => 97,
        'name' => 'Pausa y reanudación del entrenamiento',
        'area' => 'Entrenamiento',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'togglePausaCasa('],
        ],
    ],
    [
        'id' => 98,
        'name' => 'Cancelación de sesión de entrenamiento',
        'area' => 'Entrenamiento',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'cancelarSesionCasa('],
        ],
    ],
    [
        'id' => 99,
        'name' => 'Finalización de sesión de entrenamiento',
        'area' => 'Entrenamiento',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'completarSesionCasa('],
        ],
    ],
    [
        'id' => 100,
        'name' => 'Impresión del comprobante',
        'area' => 'Membresía',
        'checks' => [
            ['type' => 'file_contains', 'path' => '../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts', 'needle' => 'imprimirBoleta('],
        ],
    ],
];
