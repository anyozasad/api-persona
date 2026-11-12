# Frontend - Mallqui Gym

Frontend desarrollado con Angular.

## Instalación

```bash
npm install
```

## Ejecutar

```bash
npm start
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

Los componentes de páginas están organizados dentro de `component/pages`, siguiendo la estructura usada en clase. Los estilos del dashboard administrativo están agrupados en `component/pages/admin/styles/`, manteniendo el orden original de carga.

## Módulos visibles

Dashboard, clientes, membresías, pagos, entrenadores, clases, rutinas, reservas, asistencias, categorías, productos, proveedores, compras, ventas, Kardex, caja, usuarios, auditoría y reportes.

## Conexión con Laravel

El proyecto usa `proxy.conf.json` para enviar las peticiones `/api` al backend Laravel durante el desarrollo.

Para ver la estructura completa, consulta [`README.md`](../../README.md) en la raíz del repositorio. El backend Laravel y la base de datos se ejecutan por separado.
