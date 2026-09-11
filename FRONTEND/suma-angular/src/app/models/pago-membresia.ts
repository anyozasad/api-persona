export interface PagoMembresia {
  id_pago: number;
  id_cliente_membresia?: number;
  id_cliente?: number;
  id_membresia?: number;
  monto: number;
  metodo_pago?: string | null;
  numero_operacion?: string | null;
  fecha_pago?: string | null;
  estado: string;
  observacion?: string | null;
}
