-- Mallqui Gym - Semana 10
-- Ejecutar en phpMyAdmin sobre la BASE REAL de desarrollo SOLO para comprobar
-- el registro creado manualmente desde Angular/Postman. No borrar datos importantes.

SELECT
    id_producto,
    id_categoria,
    codigo_producto,
    nombre_producto,
    precio_venta,
    stock,
    estado
FROM productos
ORDER BY id_producto DESC
LIMIT 10;

-- Para buscar exactamente el producto usado en la evidencia:
SELECT
    id_producto,
    codigo_producto,
    nombre_producto,
    precio_venta,
    stock,
    estado
FROM productos
WHERE nombre_producto LIKE 'Producto Semana 10%'
ORDER BY id_producto DESC;
