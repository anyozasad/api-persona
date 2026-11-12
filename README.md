# Mallqui Gym — sistema de gestión de gimnasio

Sistema web con **Angular 20** para la interfaz y **Laravel 12** para la API, conectado a **MySQL/MariaDB**. Es un proyecto diferente de TEC-SGI-2026 (Laravel + Livewire); no se deben mezclar sus repositorios.

## Estructura del repositorio

\`\`\`text
api-persona/
├── BACKEND/                         API Laravel 12
│   ├── app/
│   │   ├── Console/Commands/        Diagnóstico, respaldos, mantenimiento
│   │   ├── Http/Controllers/        API y módulos de negocio
│   │   ├── Http/Middleware/         Autorización, auditoría
│   │   ├── Models/                  Entidades de base de datos
│   │   └── Services/                Lógica de negocio e integración
│   ├── database/migrations/         Estructura y compatibilidad MySQL
│   ├── routes/api.php               Rutas REST
│   ├── tests/                       Pruebas Laravel
│   ├── .env.example                  Configuración de referencia
│   └── artisan
├── FRONTEND/
│   └── suma-angular/                 Aplicación Angular 20
│       ├── public/assets/           Imágenes y recursos locales
│       ├── src/app/
│       │   ├── component/pages/     Pantallas de usuario, admin y entrenador
│       │   │   └── admin/
│       │   │       ├── styles/       Estilos del dashboard agrupados
│       │   │       ├── admin-integrado.component.ts
│       │   │       └── admin-api.service.ts
│       │   ├── core/                Guards, interceptors y servicios
│       │   ├── models/              Tipos y modelos de Angular
│       │   └── app.routes.ts         Navegación
│       ├── tests/                    Navegador / E2E
│       ├── proxy.conf.json          Reenvío de /api a Laravel
│       └── package.json
├── docs/                             Bitácora, auditoría técnica y evidencias
├── .github/workflows/                Pruebas CI y flujos de mantenimiento de imágenes
├── .tmp/                             Fragmentos utilizados por flujos de imágenes; NO borrar
├── INICIAR_DASHBOARD.ps1             Inicio y comprobación de servicios
└── REPARAR_LOGIN_MALLQUI.ps1         Diagnóstico y reparación controlada del login
\`\`\`

## Puesta en marcha en Windows (PowerShell)

**Necesario:** PHP **8.2+** (mejor 8.3), Composer, Node.js 22+, MySQL de XAMPP encendido. La CLI de XAMPP puede ser PHP 8.0 y **no cumple** los requisitos de Laravel 12.

Desde la raíz, primero configura \`BACKEND/.env\` a partir de \`.env.example\` si aún no existe y revisa la conexión a tu **base actual**. Para la instalación de Mallqui Gym de este repositorio, la referencia es:

\`\`\`env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gym_system
DB_USERNAME=root
DB_PASSWORD=
\`\`\`

No publiques \`BACKEND/.env\` ni contraseñas. No ejecutes \`migrate:fresh\` o \`db:wipe\` en una base con datos.

**Primera preparación de dependencias** (se ejecuta una vez o cuando cambien paquetes):

\`\`\`powershell
cd C:\Users\ADMIN\Pictures\api-persona\BACKEND
composer install
cd ..\FRONTEND\suma-angular
npm ci
\`\`\`

Si Composer utiliza PHP 8.0, selecciona el PHP 8.3 para la instalación de dependencias o configura primero la variable de entorno PATH.

**Abrir los servicios** desde la raíz:

\`\`\`powershell
cd C:\Users\ADMIN\Pictures\api-persona
powershell -ExecutionPolicy Bypass -File .\REPARAR_LOGIN_MALLQUI.ps1
\`\`\`

El script comprueba la conexión y arranca Laravel en el puerto **8000** cuando el esquema está correcto. La opción \`-RepararEsquema\` cambia el esquema y exige respaldo SQL: utilízala solo cuando debas completar tablas y ya hayas revisado su impacto.

En otra ventana PowerShell:

\`\`\`powershell
cd C:\Users\ADMIN\Pictures\api-persona\FRONTEND\suma-angular
npm start
\`\`\`

- Portal Angular: http://localhost:4200
- API Laravel: http://127.0.0.1:8000
- Probar el login: http://localhost:4200/login

## Módulos

**Administración:** panel, socios, membresías, pagos, reservas, asistencias, entrenadores, clases, rutinas, productos con fotos, categorías, proveedores, compras, ventas, caja, inventario/Kardex, reportes, usuarios, auditoría, comunicación y configuración.

**Usuario:** registro, acceso, planes, compra, reservas, progreso, rutinas y servicios públicos. **Entrenador:** panel de clases y actividades.

## Estado técnico y criterio de entrega

El frontend y el backend tienen pruebas automáticas en \`.github/workflows\`. **La aprobación de CI no demuestra por sí sola que las fotos, usuarios, contraseñas y datos reales de XAMPP funcionen.** La base local \`gym_system\` se verifica por separado.

La pantalla administrativa usada por Angular es \`admin-integrado.component.ts\`. Es un archivo demasiado grande: su siguiente refactor debe separar funcionalidades por dominio de manera gradual y con pruebas, sin cambiar las rutas ni el diseño de forma abrupta. Los estilos del administrador están ahora agrupados en \`admin/styles/\`, preservando el orden de carga para no cambiar la apariencia.

Las carpetas de Laravel \`app\`, \`routes\`, \`database\` y \`tests\` viven en \`BACKEND/\`, porque también existe un frontend Angular independiente. **No copies la raíz Laravel de TEC-SGI-2026 sobre este proyecto.**

## Dónde revisar cada problema

- Login, usuarios o tokens: \`BACKEND/app/Http/Controllers/AuthController.php\`, \`BACKEND/app/Models/Usuario.php\`, \`REPARAR_LOGIN_MALLQUI.ps1\`
- Fallos 500: \`BACKEND/storage/logs/\`
- Endpoints o permisos: \`BACKEND/routes/api.php\`, \`BACKEND/app/Http/Middleware/\`
- Menú, pantallas o rutas: \`FRONTEND/suma-angular/src/app/app.routes.ts\`
- Diseño del dashboard: \`FRONTEND/suma-angular/src/app/component/pages/admin/styles/\`
- Imágenes sin Internet: \`FRONTEND/suma-angular/public/assets/\`
- Datos y migraciones: \`BACKEND/database/migrations/\`

## Actualizar sin perder cambios

\`\`\`powershell
cd C:\Users\ADMIN\Pictures\api-persona
git status
git pull origin main
\`\`\`

Si Git informa que hay archivos modificados que impiden el \`pull\`, no borres cambios ni ejecutes \`git reset --hard\`: primero resuélvelos o guárdalos con \`git stash\`.  
