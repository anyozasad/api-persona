# Organización técnica y refactor por etapas — Mallqui Gym

**Referencia de comparación:** TEC-SGI-2026, organizado como una sola aplicación Laravel con Livewire. Mallqui Gym mantiene dos aplicaciones independientes: API Laravel + interfaz Angular.

## Decisiones aplicadas

1. Conservar dos raíces claras \`BACKEND/\` y \`FRONTEND/suma-angular/\`: unificarlas como si fueran una sola aplicación Laravel rompería herramientas y despliegue.
2. Agrupar los 11 estilos específicos del administrador bajo \`FRONTEND/suma-angular/src/app/component/pages/admin/styles/\`. Cambiar solamente las referencias \`styleUrls\` y preservar su orden original.
3. Mantener \`BACKEND/database/\`, \`BACKEND/routes/\`, \`BACKEND/app/\`, \`FRONTEND/suma-angular/src/app/core/\` y \`models/\` como separaciones funcionales.
4. Conservar \`.tmp/mallqui-original.part*.b64\`: cinco workflows de imágenes dependen de ellos. No son ficheros de ejecución del portal.
5. Conservar scripts de entrada y reparación en la raíz para no romper los comandos usados en Windows.

## Problemas pendientes que requieren refactor funcional, no solo carpetas

- \`admin-integrado.component.ts\` combina gran cantidad de HTML, estados y acciones; necesita descomposición por dominios (socios/pagos, productos/stock, reportes, configuración) con tests.
- \`usuario.component.ts\` y \`admin-crossfit-extras.component.ts\` también son archivos grandes, y requieren decidir si todas sus funciones están realmente enrutadas.
- \`admin.component.ts\` parece una implementación administrativa anterior; no eliminarla hasta revisar referencias y pruebas.
- Varias hojas CSS son capas de correcciones acumuladas; agruparlas es seguro, pero fusionarlas/reordenarlas puede cambiar el diseño, así que se hará después de pruebas visuales.
- \`BACKEND/app/Http/Controllers/\` tiene múltiples controladores de negocio juntos; su agrupación por dominios requiere actualizar imports, rutas y tests en una fase separada.
- \`Persona\` y \`Curso\` pertenecen posiblemente a prácticas anteriores; revisar referencias antes de retirar esos módulos.

## Comprobación en cada etapa

- \`npm ci\`, \`npm run build\` y pruebas Angular;
- suite Laravel con MySQL de pruebas aislada;
- navegación real a rutas admin/cliente, CRUD y autenticación;
- sin alterar datos locales \`gym_system\` ni fotografías reales.

**No declarar terminado el refactor completo hasta superar la comprobación de la instancia local y los casos de uso del docente.**
