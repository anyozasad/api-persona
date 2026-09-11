export interface Reserva {
  id_reserva: number;
  id_cliente: number;
  id_clase: number;
  fecha_clase?: string | null;
  estado: string;
}
