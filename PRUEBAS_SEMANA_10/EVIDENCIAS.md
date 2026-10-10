# Mallqui Gym - Evidencias Semana 10

## Lo que ya está aprobado
- Laravel: 6 pruebas correctas / 18 assertions.
- Angular: 4 pruebas correctas.
- Base exclusiva de testing: mallqui_gym_pruebas.

## 1. Pruebas manuales de interfaz
Usa el CRUD real de Productos del administrador.

Captura estos 5 casos:
1. Listado de productos visible.
2. Crear "Producto Semana 10 UI" con datos válidos.
3. Intentar crear con nombre vacío o precio negativo y capturar el mensaje de validación.
4. Editar el producto y cambiar precio o stock.
5. Desactivar el producto y recargar la pantalla para verificar que el cambio permanece.

En una de las acciones abre F12 > Network y captura:
- método HTTP
- URL
- código HTTP
- Response

## 2. API Postman / Thunder Client
Importa:
PRUEBAS_SEMANA_10/Mallqui_Gym_Semana10.postman_collection.json

En Variables cambia:
- admin_login
- admin_password

No muestres el token en la captura.

Ejecuta y captura:
- 03 GET productos
- 04 POST producto válido
- 05 POST inválido (debe devolver 422)
- 06 PUT actualizar producto
También puedes capturar 07 DELETE/desactivar.

## 3. Verificación MySQL
Después del POST válido o de crear desde Angular, abre phpMyAdmin y ejecuta:
PRUEBAS_SEMANA_10/verificacion_mysql.sql

Captura la fila del producto de prueba.

## 4. Regresión: falla -> corrección -> pasa
Archivo:
FRONTEND/suma-angular/src/app/core/services/producto.service.spec.ts

Hazlo SOLO de forma temporal:
1. Localiza la prueba "usa POST y envia los datos correctos al crear".
2. Cambia temporalmente:
   expect(req.request.method).toBe('POST');
   por:
   expect(req.request.method).toBe('GET');
3. Ejecuta:
   ng test --watch=false
4. Captura el FAILED.
5. Devuelve GET a POST.
6. Ejecuta otra vez:
   ng test --watch=false
7. Captura TOTAL: 4 SUCCESS.

No hagas git add/commit con la expectativa incorrecta.

## 5. Evidencias finales
- CP-01 CRUD desde Angular
- CP-02 POST correcto API
- CP-03 POST inválido API
- CP-04 Laravel: 6 passed
- CP-05 Angular: 4 SUCCESS
- CP-06 MySQL
- CP-07 Regresión: FAIL temporal -> corrección -> SUCCESS
