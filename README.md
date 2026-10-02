# Mallqui Gym

Sistema web para la gestión de un gimnasio desarrollado con **Angular** en el frontend y **Laravel 12** en el backend.

## Módulos principales

- Autenticación con Laravel Sanctum.
- Módulo académico JWT con claims.
- Roles de Administrador, Entrenador y Cliente.
- Clientes y usuarios.
- Membresías y pagos.
- Entrenadores, clases, rutinas y reservas.
- Asistencias.
- Categorías y productos.
- Proveedores y compras.
- Ventas, Kardex y caja.
- Reportes y dashboard.
- Auditoría de acciones.
- Portal del cliente.

## Estructura

```text
api-persona/
├── BACKEND/                  Laravel 12 + API REST
└── FRONTEND/
    └── suma-angular/         Angular
        └── src/app/
            ├── component/pages/
            ├── core/
            └── models/
```

## Requisitos

- PHP 8.2 o superior.
- Composer.
- Node.js compatible con Angular 20.
- npm.
- MySQL o MariaDB.
- XAMPP puede utilizarse para Apache/MySQL.

## Instalación rápida

### 1. Clonar

```bash
git clone https://github.com/anyozasad/api-persona.git
cd api-persona
```

### 2. Backend Laravel

```bash
cd BACKEND
composer install
copy .env.example .env
php artisan key:generate
```

Configura la conexión de MySQL en `.env`.

Para preparar las migraciones del sistema:

```bash
php artisan db:generar
php artisan migrate
```

Para crear el administrador:

```bash
php artisan admin:crear
```

Luego inicia Laravel:

```bash
php artisan serve
```

### 3. Frontend Angular

Desde la raíz del repositorio:

```bash
cd FRONTEND/suma-angular
npm install
ng serve
```

Abrir:

```text
http://localhost:4200
```

El frontend utiliza el proxy configurado para comunicarse con la API Laravel.

## Arquitectura

El proyecto separa la aplicación en:

- **Componentes Angular:** `src/app/component/pages`
- **Servicios y seguridad:** `src/app/core`
- **Modelos TypeScript:** `src/app/models`
- **Controladores Laravel:** `BACKEND/app/Http/Controllers`
- **Modelos Laravel:** `BACKEND/app/Models`
- **API:** `BACKEND/routes/api.php`

## Estado funcional

Mallqui Gym trabaja con una sola fuente principal de datos para clientes, membresías, rutinas, clases, reservas, asistencias, inventario, ventas y caja.

Flujo principal del cliente:

```text
Cliente -> Membresía -> Rutina asignada -> Entrenamiento -> Progreso
        -> Clases/Reservas -> Asistencias -> Calendario -> Mi club/Ayuda/Perfil
```

El entrenamiento del cliente usa únicamente la rutina activa registrada por el entrenador. Al finalizar una sesión se guarda la rutina realizada y el detalle de sus ejercicios, series, repeticiones y carga utilizada.

La compra de membresía desde el portal del cliente se registra automáticamente en el sistema y genera un comprobante interno. Para un entorno comercial real, la confirmación de Yape/Plin/Tarjeta debe integrarse con un proveedor de pagos autorizado.

## Verificación antes de entregar

En el backend:

```bash
cd BACKEND
php artisan db:sincronizar
php artisan migrate
php artisan db:seed
php artisan db:verificar
php artisan test
```

En el frontend:

```bash
cd FRONTEND/suma-angular
npm install
npm run build
ng serve
```

La entrega debe considerarse lista cuando `db:verificar`, `php artisan test` y `npm run build` terminen sin errores.
