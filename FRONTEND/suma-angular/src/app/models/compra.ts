export interface DetalleCompra {
  id_detalle_compra?: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal?: number;
}

export interface Compra {
  id_compra: number;
  id_proveedor?: number | null;
  fecha_compra?: string | null;
  total: number;
  estado: string;
  detalles?: DetalleCompra[];
}
