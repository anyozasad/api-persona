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

## Estado actual

El sistema cuenta con los módulos principales integrados con Laravel y MySQL. La siguiente etapa recomendada es fortalecer pruebas automatizadas, edición completa de registros, paginación/búsqueda y documentación de evidencias para la entrega académica.
