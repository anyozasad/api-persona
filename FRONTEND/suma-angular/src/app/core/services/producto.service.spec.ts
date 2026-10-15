import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { ProductoService } from './producto.service';

describe('ProductoService - pruebas CRUD Mallqui Gym', () => {
  let servicio: ProductoService;
  let httpMock: HttpTestingController;
  const api = '/api/gym-admin/productos';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductoService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    servicio = TestBed.inject(ProductoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('usa GET para listar productos', () => {
    servicio.listar().subscribe(productos => {
      expect(productos.length).toBe(1);
      expect(productos[0].nombre_producto).toBe('Bebida de prueba');
    });

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('GET');

    req.flush([{
      id_producto: 1,
      id_categoria: 1,
      codigo_producto: 'TEST-001',
      nombre_producto: 'Bebida de prueba',
      descripcion: 'Producto para pruebas',
      precio_compra: 5,
      precio_venta: 8.5,
      stock: 10,
      stock_minimo: 2,
      unidad_medida: 'Unidad',
      estado: 'Activo'
    }]);
  });

  it('usa POST y envia los datos correctos al crear', () => {
    const datos: any = {
      id_categoria: 1,
      codigo_producto: 'TEST-002',
      nombre_producto: 'Producto nuevo',
      descripcion: 'Creado desde la prueba Angular',
      precio_compra: 4,
      precio_venta: 7,
      stock: 6,
      stock_minimo: 2,
      unidad_medida: 'Unidad',
      estado: 'Activo'
    };

    servicio.guardar(datos).subscribe();

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datos);

    req.flush(
      { id_producto: 2, ...datos },
      { status: 201, statusText: 'Created' }
    );
  });

  it('usa PUT para actualizar un producto', () => {
    const cambios: any = {
      id_categoria: 1,
      codigo_producto: 'TEST-002',
      nombre_producto: 'Producto actualizado',
      precio_compra: 4,
      precio_venta: 9,
      stock: 6,
      stock_minimo: 2,
      unidad_medida: 'Unidad',
      estado: 'Activo'
    };

    servicio.actualizar(2, cambios).subscribe();

    const req = httpMock.expectOne(`${api}/2`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(cambios);

    req.flush({ id_producto: 2, ...cambios });
  });

  it('usa PUT de estado para desactivar sin borrar el historial', () => {
    servicio.eliminar(2).subscribe();

    const req = httpMock.expectOne(`${api}/2/estado`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ estado: 'Inactivo' });

    req.flush({
      mensaje: 'Estado del producto actualizado.'
    });
  });
});
