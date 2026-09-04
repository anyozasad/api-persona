# Integración Mallqui Gym

Backend Laravel: `http://127.0.0.1:8000`
Frontend Angular: `http://localhost:4200`

## Backend
```powershell
cd BACKEND
composer install
php artisan optimize:clear
php artisan serve
```

## Frontend
```powershell
cd FRONTEND\api-crud
npm install
ng serve
```

El frontend inicia sesión en `/api/auth/login`, guarda el token Sanctum y lo envía como `Authorization: Bearer` para consumir categorías y productos.
