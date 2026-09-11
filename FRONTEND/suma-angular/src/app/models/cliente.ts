export interface Cliente {
  id_cliente: number;
  id_usuario?: number | null;
  nombres: string;
  apellidos: string;
  dni?: string | null;
  correo?: string | null;
  telefono?: string | null;
  fecha_nacimiento?: string | null;
  direccion?: string | null;
  estado: string;
}
