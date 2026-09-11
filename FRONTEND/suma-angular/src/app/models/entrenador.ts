export interface Entrenador {
  id_entrenador: number;
  nombres: string;
  apellidos: string;
  dni?: string | null;
  correo?: string | null;
  telefono?: string | null;
  especialidad?: string | null;
  estado: string;
}
