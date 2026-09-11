export interface KardexMovimiento {
  id_movimiento?: number;
  id_producto: number;
  tipo: 'Entrada' | 'Salida' | string;
  cantidad: number;
  motivo?: string | null;
  fecha?: string | null;
  stock_anterior?: number;
  stock_nuevo?: number;
}
