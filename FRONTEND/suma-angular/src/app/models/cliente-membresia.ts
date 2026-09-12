import type { Cliente } from './cliente';
import type { Membresia } from './membresia';

export interface ClienteMembresia {
  id_cliente_membresia?: number;
  id_cliente: number;
  id_membresia: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  cliente?: Cliente | null;
  membresia?: Membresia | null;
}
