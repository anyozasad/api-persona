export interface Caja {
  id_caja: number;
  fecha_apertura?: string | null;
  fecha_cierre?: string | null;
  monto_inicial: number;
  monto_real?: number | null;
  monto_sistema?: number | null;
  estado: string;
  observacion?: string | null;
}
