# Mallqui Gym - Recuperar fotos de Productos

## Problema corregido
El dashboard, el inventario y el portal consultan la misma base DB_DATABASE.
La API reconoce tanto la estructura original de gym_system (id, codigo, categoria_id) como la estructura Laravel (id_producto, codigo_producto, id_categoria).

- /api/productos: devuelve foto y datos reales de MySQL en ambos esquemas.
- /api/productos/diagnostico-fotos: solo administrador; muestra nombre de base y fotos faltantes sin transferir las imágenes.
- El inicio /admin muestra fotos disponibles en la sección Productos del gimnasio.
- En Productos se identifican fotos ausentes o con referencias antiguas. El botón **Elegir foto** de cada fila abre la galería local o permite subir un archivo JPG/PNG/WEBP, optimiza y guarda únicamente la fotografía en MySQL, sin cambiar stock ni precio. **Editar / cambiar foto** conserva el formulario completo para productos que ya tienen fotografía.
- El portal usa el mismo catálogo y fotografías de la base original o moderna.

## Carga directa desde el dashboard (semana 05)

1. En **Ventas e inventario → Productos y stock**, localiza un producto sin foto.
2. Pulsa **Subir foto** en su fila y selecciona la fotografía REAL del producto (JPG, PNG o WEBP, hasta 5 MB).
3. El navegador optimiza la imagen y Laravel valida el contenido y guarda solo `productos.foto` en la base conectada.
4. La fila muestra la fotografía cuando el servidor confirma lo guardado; la opción **Comprobar fotos** actualiza los contadores.
5. Recarga el navegador y confirma que la imagen sigue visible. El portal del socio debe mostrar la misma foto.

Los registros `Producto Prueba 1` a `Producto Prueba 10` no contienen fotos automáticamente. Si en MySQL aparece `foto = NULL`, es necesario subir el archivo real o usar el importador de abajo. No es correcto asignar imágenes genéricas del gimnasio a productos desconocidos.

**Seguridad:** la carga usa `PATCH /api/productos/{id}/foto`, disponible solamente para Administrador autenticado. No cambia otros campos del producto. Para comprobar las pruebas sin tocar datos reales se usa la base de datos de pruebas de GitHub Actions.

## Fotos reales del ZIP de Mallqui Gym (revisión 11/11/2026)

Se comparó el ZIP con las imágenes que ya están guardadas en `FRONTEND/suma-angular/public/assets/mallqui/fotos-reales/`: coinciden sus 34 tamaños de archivo y orden, de `foto-01.jpg` a `foto-34.jpg`.

- Las fotos 09, 11–17, 29, 31 y 33 muestran suplementos y accesorios reales del gimnasio. El resto incluye entrenador, máquinas, gimnasio y fotos repetidas, por eso no deben asignarse automáticamente a productos.
- En **Productos y stock**, al pulsar **Elegir foto** sobre un registro sin imagen, aparece una galería con esas once imágenes de productos. Selecciona solamente la que corresponda al artículo; también está disponible **Subir otra fotografía del producto**.
- El sistema convierte la imagen seleccionada a un formato optimizado y usa `PATCH /api/productos/{id}/foto` para guardar **solo** la columna de foto en MySQL. Después de guardar, se ve la fotografía en la tabla y, al refrescar, en el dashboard.
- Los diez registros `Producto Prueba 1–10` no indican a qué suplemento o accesorio corresponde cada código, por lo que no es correcto adjudicar automáticamente fotografías por posición. En la galería puedes abrir **Editar datos y categoría** para poner el nombre correcto sin borrar ni crear registros duplicados.
- No depende de URLs externas y las fotografías permanecen disponibles sin Internet si Angular y Laravel están sirviendo los archivos locales. No constituye conexión sin servidor.
- Las fotografías de WhatsApp tienen la calidad y resolución del archivo recibido; no se presentan como originales 4K.

**La base MySQL de la computadora no se modifica con un `git pull`:** el repositorio contiene el código y los recursos, no los registros personales del equipo. Debes seleccionar la fotografía correcta por artículo y guardar para que se almacene en tu MySQL local.

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