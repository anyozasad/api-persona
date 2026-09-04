import { Users } from './users';

export interface LoginRequest { login: string; contrasena: string; }
export interface LoginResponse {
  mensaje: string;
  token_type: 'Bearer';
  access_token: string;
  usuario: Users;
  cliente?: unknown;
}
