export interface Asistencia {
  id_asistencia: number;
  id_cliente: number;
  fecha?: string;
  hora_entrada?: string | null;
  hora_salida?: string | null;
  observacion?: string | null;
  estado?: string;
}
