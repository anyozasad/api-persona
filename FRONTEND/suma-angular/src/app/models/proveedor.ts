export interface Proveedor {
  id_proveedor: number;
  razon_social?: string;
  nombre?: string;
  ruc?: string | null;
  contacto?: string | null;
  telefono?: string | null;
  correo?: string | null;
  direccion?: string | null;
  estado: string;
}
