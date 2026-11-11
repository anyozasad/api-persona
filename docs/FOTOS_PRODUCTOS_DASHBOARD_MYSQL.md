# Mallqui Gym - Recuperar fotos de Productos

## Problema corregido
El dashboard, el inventario y el portal consultan la misma base DB_DATABASE.
La API reconoce tanto la estructura original de gym_system (id, codigo, categoria_id) como la estructura Laravel (id_producto, codigo_producto, id_categoria).

- /api/productos: devuelve foto y datos reales de MySQL en ambos esquemas.
- /api/productos/diagnostico-fotos: solo administrador; muestra nombre de base y fotos faltantes sin transferir las imágenes.
- El inicio /admin muestra fotos disponibles en la sección Productos del gimnasio.
- En Productos se identifican fotos ausentes o con referencias antiguas. El botón **Elegir foto** de cada fila abre la galería local o permite subir un archivo JPG/PNG/WEBP, optimiza y guarda únicamente la fotografía en MySQL, sin cambiar stock ni precio. **Editar / cambiar foto** conserva el formulario completo para productos que ya tienen fotografía.
- El portal usa el mismo catálogo y fotografías de la base original o moderna.

## Solución automática de la semana 05 (sin seleccionar fotografías a mano)

El sistema reconoce los diez registros ficticios `Producto Prueba 1–10` que se ven en el inventario (`PROD-001` a `PROD-0010`; también reconoce `PROD-010`).

**Al abrir Productos y stock**, Angular detecta esos registros cuando no tienen foto y realiza una única petición administrativa a `POST /api/productos/completar-fotos-iniciales`. Laravel toma diez fotografías de productos **que ya están dentro del repositorio**, y guarda los JPEG originales como base64 en `productos.foto`. La lista vuelve a consultarse y aparece la fotografía persistida en MySQL, sin que el administrador tenga que elegir nada. También aparecen en el catálogo de usuario y en el inicio al volver a consultar la misma BD.

Correspondencia explícita para los registros de prueba:

| Código | Nuevo nombre de demostración | Foto local | Categoría |
|---|---|---|---|
| PROD-001 | Creatina | foto-12.jpg | Suplementos |
| PROD-002 | Shaker gris | foto-13.jpg | Accesorios |
| PROD-003 | BCAA | foto-16.jpg | Suplementos |
| PROD-004 | Shaker azul | foto-14.jpg | Accesorios |
| PROD-005 | Big M | foto-15.jpg | Suplementos |
| PROD-006 | Collagen Pro | foto-17.jpg | Suplementos |
| PROD-007 | NOXRAGE | foto-09.jpg | Suplementos |
| PROD-008 | Pro Mass XL | foto-33.jpg | Suplementos |
| PROD-009 | AN USA (cajas) | foto-11.jpg | Suplementos |
| PROD-0010 o PROD-010 | NOXRAGE (presentación alternativa) | foto-29.jpg | Suplementos |

**Protección de la información:** el proceso modifica solamente las filas con el código exacto, nombre `Producto Prueba N` y fotografía vacía; conserva sus IDs, códigos, precios, stock e historial. Ajusta el nombre y la categoría únicamente en esos diez registros de demostración para que coincidan con la imagen. Necesita que existan las categorías `Accesorios` y `Suplementos` y que la carpeta original `FRONTEND/suma-angular/public/assets/mallqui/fotos-reales` esté disponible. Si algo falta, informa el motivo y no inventa fotos ni modifica otros registros. La operación es idempotente.

La galería **Elegir foto** sigue disponible **solo como alternativa opcional** para productos distintos o para introducir fotos nuevas. No es necesaria para los diez registros de prueba.

Se modificaron código Angular y API Laravel en GitHub, pero la base MySQL privada de la computadora **no se puede modificar desde GitHub**. Se aplicará automáticamente en el equipo local al ejecutar la versión nueva y abrir Productos. No sustituye la comprobación final de MySQL.

## Si las fotos están en una carpeta y no en MySQL
El sistema no puede recrear fotos que no existen. Primero respalda tu base de datos.
Pon a cada archivo de foto el mismo nombre que el código del producto. Ejemplos:
  Código BEB-001: archivo BEB-001.jpg
  Código PROT-002: archivo PROT-002.webp
  ID 42: archivo producto_42.png

Desde PowerShell dentro de BACKEND, revisa primero sin cambiar nada:
    php artisan productos:importar-fotos "C:\MisFotos\Productos"

Tras revisar la base mostrada y las coincidencias, importar de verdad:
    php artisan productos:importar-fotos "C:\MisFotos\Productos" --aplicar

El importador solo usa coincidencias exactas y no reemplaza fotos existentes. Rechaza coincidencias ambiguas y comprime imágenes grandes si está disponible GD. No borra otros registros.
Si una foto anterior es una ruta inválida y todavía figura en la columna foto, corrígela desde Productos > Editar con su archivo original.

## Verificar en MySQL
Esquema Laravel:
    SELECT id_producto, codigo_producto, LENGTH(foto) AS tamano_foto FROM productos;
Esquema original:
    SELECT id, codigo, LENGTH(foto) AS tamano_foto FROM productos;
NULL significa que no se almacenó fotografía. Un número indica contenido, pero no necesariamente una imagen válida. El diagnóstico distingue las imágenes base64 de las referencias anteriores.
phpMyAdmin muestra el contenido base64 como texto, no como una miniatura.

## Instalación y evidencias
Actualiza el repositorio anyozasad/api-persona, no el repo PHP anterior.
Comprueba DB_DATABASE en BACKEND/.env. Respalda MySQL antes de migrar.
Solo con respaldo, ejecuta php artisan migrate --force para ampliar la columna foto si es antigua.
Reinicia Angular y Laravel, abre Productos y consulta la base y las fotos pendientes.
Para los diez productos de prueba, abre Productos y espera a que se guarden automáticamente; pulsa Comprobar fotos y vuelve al inicio.
El inicio debe mostrar el producto con foto guardada y el catálogo del usuario debe devolver el mismo registro.
NO ejecutes migrate:fresh ni importes un esquema SQL sobre datos reales.

## Pruebas
BACKEND/tests/Feature/ProductoImagenDashboardTest.php comprueba el esquema original y el importador.
BACKEND/tests/Feature/ProductoModernLegacyBridgeTest.php comprueba el esquema moderno.
FRONTEND/suma-angular/tests/e2e-dashboard-real.mjs prueba registro, persistencia de foto y vista del inicio en Chromium con MySQL temporal.
Las pruebas no reemplazan la inspección de los archivos y la base MySQL local del alumno.