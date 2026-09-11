export interface DetalleVenta {
  id_detalle_venta?: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal?: number;
}

export interface Venta {
  id_venta: number;
  id_cliente?: number | null;
  fecha_venta?: string | null;
  total: number;
  metodo_pago?: string | null;
  estado: string;
  detalles?: DetalleVenta[];
}
