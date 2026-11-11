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

**Al abrir Productos y stock**, Angular detecta esos registros cuando no tienen foto **o conservan un nombre equivocado de la asignación automática anterior** y realiza una única petición administrativa a `POST /api/productos/completar-fotos-iniciales`. Laravel toma diez fotografías de productos **que ya están dentro del repositorio**, y guarda los JPEG originales como base64 en `productos.foto`. La lista vuelve a consultarse y aparecen el nombre correcto y la fotografía persistida en MySQL, sin que el administrador tenga que elegir nada. También aparecen en el catálogo de usuario y en el inicio al volver a consultar la misma BD.

Correspondencia corregida **leyendo las etiquetas originales**, no mediante nombres genéricos:

| Código de prueba | Nombre correspondiente a la foto | Categoría | Archivo |
|---|---|---|---|
| PROD-001 | Level Pro Creatine Monohydrate 250 g | Suplementos | foto-12.jpg |
| PROD-002 | Shaker UN 20 años - Blanco | Accesorios | foto-13.jpg |
| PROD-003 | Universe Nutrition BCAA 6000 - Fruit Punch | Suplementos | foto-16.jpg |
| PROD-004 | HD Blueberry 135 ml - Bebida energética | Bebidas | foto-14.jpg |
| PROD-005 | Universe Nutrition BIGM Vainilla 2 kg | Suplementos | foto-15.jpg |
| PROD-006 | Universe Nutrition Collagen Pro - Fruit Punch | Suplementos | foto-17.jpg |
| PROD-007 | Universe Nutrition NOXRAGE - Fruit Punch | Suplementos | foto-09.jpg |
| PROD-008 | AN Pro Mass XL - Sobre 60 g | Suplementos | foto-33.jpg |
| PROD-009 | Correas para pesas AN USA - Azul | Accesorios | foto-11.jpg |
| PROD-0010 o PROD-010 | Universe Nutrition NOXRAGE - Citrus Punch | Suplementos | foto-29.jpg |

Se detectaron y corrigieron errores de correspondencia de la primera versión: **foto-14 es una bebida energética HD Blueberry de 135 ml, no un shaker**; **foto-11 son correas para levantar pesas AN USA, no suplementos en cajas**. El BIGM se identifica por su marca y sabor; la creatina incluye su marca y contenido.

**Cómo actúa la reparación:** el sistema asigna nombre, categoría y fotografía a los diez registros ficticios originales solo si su `foto` está vacía. Si la versión anterior ya guardó un nombre incorrecto, corrige el nombre y la categoría exclusivamente cuando el contenido de la fotografía en MySQL coincide exactamente con la imagen local previamente asignada. No sobrescribe productos reales, imágenes personalizadas, códigos, precios, stock ni movimientos de inventario. Si ya existe un nombre correcto, no vuelve a modificarlo. Necesita las categorías `Bebidas`, `Accesorios` y `Suplementos`.


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