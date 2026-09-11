export interface Clase {
  id_clase: number;
  id_entrenador?: number | null;
  nombre_clase?: string;
  nombre?: string;
  descripcion?: string | null;
  cupo_maximo?: number;
  fecha?: string | null;
  hora_inicio?: string | null;
  hora_fin?: string | null;
  estado: string;
}
