export type RolUsuario = 'Administrador' | 'Entrenador' | 'Cliente';

export interface Users {
  id_usuario?: number;
  nombre_usuario: string;
  contrasena?: string;
  nombres: string;
  apellidos: string;
  dni: string;
  telefono?: string | null;
  correo: string;
  rol: RolUsuario;
  estado: string;
  fecha_registro?: string;
}
