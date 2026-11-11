import { of } from 'rxjs';
import { ProductosComponent } from './productos';
import { Producto } from '../../../models/producto';

describe('Semana 05 EFSRT - fotografía del producto', () => {
  let component: ProductosComponent;
  let productosApi: jasmine.SpyObj<any>;

  beforeEach(() => {
    productosApi = jasmine.createSpyObj('ProductoService', ['guardar','actualizar','listar','eliminar','diagnosticoFotos']);
    productosApi.listar.and.returnValue(of([]));
    productosApi.diagnosticoFotos.and.returnValue(of({
      base_datos:'gym_system', esquema:'laravel', total_productos:0,
      fotos_guardadas_en_mysql:0, sin_foto:0, referencias_antiguas:0,
      pendientes:[], nota:'Comprobación de prueba'
    }));
    component = new ProductosComponent(productosApi as any, {} as any, {} as any, {} as any);
  });

  it('muestra solo fotos de productos y permite asignarlas de forma explícita', () => {
    const nombres=component.fotosProductosMallqui.map(f => f.descripcion);
    const archivos=component.fotosProductosMallqui.map(f => f.archivo);
    expect(nombres.some(nombre => nombre.includes('Creatina'))).toBeTrue();
    expect(nombres.some(nombre => nombre.includes('BCAA'))).toBeTrue();
    expect(archivos).toContain('foto-12.jpg');
    expect(archivos).not.toContain('foto-18.jpg');
    expect(archivos).not.toContain('foto-23.jpg');

    const producto={...component.producto,id_producto:5,nombre_producto:'Producto Prueba 5'};
    component.abrirGaleriaProducto(producto);
    expect(component.galeriaProducto).toEqual(producto);
    component.cerrarGaleriaProducto();
    expect(component.galeriaProducto).toBeNull();
    expect(productosApi.actualizar).not.toHaveBeenCalled();
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
