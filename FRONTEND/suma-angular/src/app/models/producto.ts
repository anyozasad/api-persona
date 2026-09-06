export interface CategoriaResumen { id_categoria: number; nombre_categoria: string; }
export interface Producto {
  id_producto?: number;
  id_categoria: number;
  codigo_producto: string;
  nombre_producto: string;
  descripcion?: string | null;
  precio_compra: number;
  precio_venta: number;
  stock: number;
  stock_minimo: number;
  unidad_medida: string;
  fecha_registro?: string;
  estado: 'Activo' | 'Inactivo';
  categoria?: CategoriaResumen | null;
}
