export interface Auditoria {
  id_auditoria?: number;
  id_usuario?: number | null;
  usuario?: string | null;
  rol?: string | null;
  metodo: string;
  ruta: string;
  ip?: string | null;
  status?: number | null;
  fecha: string;
}
