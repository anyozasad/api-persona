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
DB_DATABASE=gym_system
DB_USERNAME=root
DB_PASSWORD=
```

## Base de datos y entorno Windows

El archivo `.env.example` utiliza `DB_DATABASE=gym_system`. Revisa los datos de tu base existente antes de ejecutar migraciones. No uses `migrate:fresh` ni `db:wipe` en una base con registros del gimnasio.

En Windows puedes usar el reparador de la raíz, que selecciona PHP 8.2+ y verifica la conexión:

```powershell
cd ..
powershell -ExecutionPolicy Bypass -File .\REPARAR_LOGIN_MALLQUI.ps1
```

Para completar tablas pendientes, utiliza la opción `-RepararEsquema` solo después de comprobar que el script haya creado un respaldo SQL. Sin esa opción el diagnóstico es la opción recomendada.

También puedes comprobar manualmente con PHP compatible:

```bash
php artisan db:verificar
php artisan auth:diagnosticar --usuario=admin
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

**Atención:** En Windows, asegúrate de que `php -v` corresponde a PHP 8.2 o superior; XAMPP puede colocar PHP 8.0 primero en el PATH.

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
