export interface Rutina {
  id_rutina: number;
  id_cliente?: number | null;
  id_entrenador?: number | null;
  nombre_rutina?: string;
  nombre?: string;
  objetivo?: string | null;
  descripcion?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  estado: string;
}
