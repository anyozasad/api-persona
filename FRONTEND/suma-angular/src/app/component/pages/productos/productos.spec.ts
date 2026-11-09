import { of } from 'rxjs';
import { ProductosComponent } from './productos';
import { Producto } from '../../../models/producto';

describe('Semana 05 EFSRT - fotografía del producto', () => {
  let component: ProductosComponent;
  let productosApi: jasmine.SpyObj<any>;

  beforeEach(() => {
    productosApi = jasmine.createSpyObj('ProductoService', ['guardar','actualizar','listar','eliminar']);
    productosApi.listar.and.returnValue(of([]));
    component = new ProductosComponent(productosApi as any, {} as any, {} as any, {} as any);
  });

  it('impide guardar el producto antes de que termine de procesarse la imagen', () => {
    component.procesandoImagen = true;
    component.guardar();

    expect(productosApi.guardar).not.toHaveBeenCalled();
    expect(component.error).toContain('fotografía todavía se está preparando');
  });

  it('envía y confirma la misma foto al guardar, luego refresca el inventario', () => {
    const foto = 'data:image/webp;base64,AA==';
    component.producto = {
      id_categoria: 1, codigo_producto: 'SEM-5', nombre_producto: 'Producto con foto',
      foto, precio_compra: 10, precio_venta: 20, stock: 0,
      stock_minimo: 1, unidad_medida: 'Unidad', estado: 'Activo'
    };
    productosApi.guardar.and.callFake((producto: Producto) => of({ ...producto, id_producto: 18 }));

    component.guardar();

    expect(productosApi.guardar).toHaveBeenCalledWith(jasmine.objectContaining({ foto }));
    expect(component.mensaje).toContain('fotografía guardados correctamente');
    expect(component.error).toBe('');
    expect(productosApi.listar).toHaveBeenCalled();
    expect(component.guardando).toBeFalse();
  });

  it('actualiza la imagen de un producto existente sin modificar su stock', () => {
    const foto = 'data:image/png;base64,AA==';
    component.producto = {
      id_producto: 21, id_categoria: 1, codigo_producto: 'SEM-6',
      nombre_producto: 'Producto editable', foto,
      precio_compra: 10, precio_venta: 30, stock: 7,
      stock_minimo: 1, unidad_medida: 'Unidad', estado: 'Activo'
    };
    component.editando = true;
    productosApi.actualizar.and.callFake((_id: number, producto: Partial<Producto>) =>
      of({ ...component.producto, ...producto }));

    component.actualizar();

    expect(productosApi.actualizar).toHaveBeenCalledWith(21,
      jasmine.objectContaining({ foto, precio_venta: 30 }));
    expect(component.mensaje).toContain('fotografía actualizados correctamente');
    expect(component.editando).toBeFalse();
  });

  it('no permite dos registros simultáneos mientras la API guarda', () => {
    component.guardando = true;
    component.guardar();
    expect(productosApi.guardar).not.toHaveBeenCalled();
  });

  it('avisa si el backend registra el producto pero no devuelve la fotografía', () => {
    component.producto.foto = 'data:image/png;base64,AA==';
    productosApi.guardar.and.returnValue(of({
      ...component.producto, id_producto: 15, foto: null
    }));

    component.guardar();

    expect(component.error).toContain('no se confirmó su fotografía');
    expect(component.mensaje).toBe('');
  });
});
