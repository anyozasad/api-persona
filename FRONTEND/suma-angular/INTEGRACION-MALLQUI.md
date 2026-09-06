# Mallqui Gym - Frontend único

Todo el frontend Angular del sistema está en `FRONTEND/suma-angular`.

Aquí se conserva la interfaz de Mallqui Gym y también se integran las prácticas del profesor: modelos/interfaces, servicios, autenticación, consumo de API y CRUD de productos.

## Ejecutar backend

```powershell
cd BACKEND
php artisan serve
```

## Ejecutar frontend

```powershell
cd FRONTEND\suma-angular
npm install
ng serve
```

Angular usa `/api` y durante `ng serve` el archivo `proxy.conf.json` dirige esas peticiones a `http://127.0.0.1:8000`, donde corre Laravel.

Ruta del CRUD de productos: `/productos`.
