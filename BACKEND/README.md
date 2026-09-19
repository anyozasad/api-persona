# Backend - Mallqui Gym

Backend REST desarrollado con **Laravel 12**.

## Requisitos

- PHP 8.2 o superior.
- Composer.
- MySQL o MariaDB.

## Instalación

```bash
composer install
copy .env.example .env
php artisan key:generate
```

Configura en `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mallqui_gym
DB_USERNAME=root
DB_PASSWORD=
```

## Crear la base de datos del proyecto

El repositorio incluye comandos Artisan que generan las migraciones del sistema.

```bash
php artisan db:generar
php artisan migrate
```

Si trabajas con una base existente, revisa también:

```bash
php artisan db:sincronizar
```

## Crear administrador

```bash
php artisan admin:crear
```

El comando solicita usuario, nombre, correo, DNI y contraseña.

## Ejecutar API

```bash
php artisan serve
```

Por defecto:

```text
http://127.0.0.1:8000
```

## API principal

Las rutas están en:

```text
routes/api.php
```

Se utilizan:

- Sanctum para la autenticación principal.
- Middleware de roles.
- Middleware de auditoría.
- JWT como módulo académico independiente.

## Módulos

Clientes, membresías, pagos, entrenadores, clases, rutinas, asistencias, reservas, categorías, productos, proveedores, compras, ventas, Kardex, caja, usuarios, reportes y auditoría.

## Pruebas

```bash
php artisan test
```

También existen pruebas unitarias para JWT y pruebas básicas de seguridad.
