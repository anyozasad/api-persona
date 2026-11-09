# Mallqui Gym - Recuperar fotos de Productos

## Problema corregido
El dashboard, el inventario y el portal consultan la misma base DB_DATABASE.
La API reconoce tanto la estructura original de gym_system (id, codigo, categoria_id) como la estructura Laravel (id_producto, codigo_producto, id_categoria).

- /api/productos: devuelve foto y datos reales de MySQL en ambos esquemas.
- /api/productos/diagnostico-fotos: solo administrador; muestra nombre de base y fotos faltantes sin transferir las imágenes.
- El inicio /admin muestra fotos disponibles en la sección Productos del gimnasio.
- En Productos se identifican fotos ausentes o con referencias antiguas, con opción Editar / subir foto.
- El portal usa el mismo catálogo y fotografías de la base original o moderna.

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
Carga o importa los archivos originales, pulsa Comprobar fotos y vuelve al inicio.
El inicio debe mostrar el producto con foto guardada y el catálogo del usuario debe devolver el mismo registro.
NO ejecutes migrate:fresh ni importes un esquema SQL sobre datos reales.

## Pruebas
BACKEND/tests/Feature/ProductoImagenDashboardTest.php comprueba el esquema original y el importador.
BACKEND/tests/Feature/ProductoModernLegacyBridgeTest.php comprueba el esquema moderno.
FRONTEND/suma-angular/tests/e2e-dashboard-real.mjs prueba registro, persistencia de foto y vista del inicio en Chromium con MySQL temporal.
Las pruebas no reemplazan la inspección de los archivos y la base MySQL local del alumno.