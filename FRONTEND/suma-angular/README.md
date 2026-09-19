# Frontend - Mallqui Gym

Frontend desarrollado con Angular.

## Instalación

```bash
npm install
```

## Ejecutar

```bash
ng serve
```

Abrir:

```text
http://localhost:4200
```

## Estructura principal

```text
src/app/
├── component/
│   └── pages/
├── core/
│   ├── guards/
│   ├── interceptors/
│   ├── services/
│   └── ui/
├── models/
├── app.component.ts
├── app.routes.ts
└── auth.service.ts
```

Los componentes de páginas están organizados dentro de `component/pages`, siguiendo la estructura usada en clase.

## Módulos visibles

Dashboard, clientes, membresías, pagos, entrenadores, clases, rutinas, reservas, asistencias, categorías, productos, proveedores, compras, ventas, Kardex, caja, usuarios, auditoría y reportes.

## Conexión con Laravel

El proyecto usa `proxy.conf.json` para enviar las peticiones `/api` al backend Laravel durante el desarrollo.
