export interface DetalleRutina {
  id_detalle_rutina?: number;
  id_rutina: number;
  ejercicio: string;
  series: number;
  repeticiones: number;
  peso_recomendado?: number | null;
  descanso_segundos?: number | null;
  observaciones?: string | null;
}
