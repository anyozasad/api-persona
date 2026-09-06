import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface UsuarioSesion {
  id_usuario: number;
  nombre_usuario: string;
  nombres: string;
  apellidos: string;
  correo: string;
  dni?: string | null;
  telefono?: string | null;
  rol: 'Administrador' | 'Cliente' | 'Entrenador' | string;
  estado: string;
}

export interface AuthResponse {
  mensaje: string;
  token_type: string;
  access_token: string;
  usuario: UsuarioSesion;
  cliente?: unknown;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = '/api/auth';
  private readonly tokenKey = 'mallqui_token';
  private readonly userKey = 'mallqui_usuario';

  constructor(private http: HttpClient) {}

  login(login: string, contrasena: string, recordar: boolean): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/login`, { login, contrasena }).pipe(
      tap(res => this.guardarSesion(res, recordar))
    );
  }

  register(datos: {
    nombre_usuario: string;
    nombres: string;
    apellidos: string;
    dni: string;
    telefono?: string;
    correo: string;
    contrasena: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/register`, datos).pipe(
      tap(res => this.guardarSesion(res, false))
    );
  }

  me(): Observable<{ usuario: UsuarioSesion; cliente: unknown }> {
    return this.http.get<{ usuario: UsuarioSesion; cliente: unknown }>(`${this.api}/me`);
  }

  logout(): Observable<unknown> {
    return this.http.post(`${this.api}/logout`, {});
  }

  logoutTodos(): Observable<unknown> {
    return this.http.post(`${this.api}/logout-todos`, {});
  }

  solicitarRecuperacion(correo: string): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.api}/forgot-password`, { correo });
  }

  restablecerContrasena(correo: string, token: string, contrasena: string): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.api}/reset-password`, {
      correo,
      token,
      contrasena,
      contrasena_confirmation: contrasena,
    });
  }

  get token(): string | null {
    return localStorage.getItem(this.tokenKey) ?? sessionStorage.getItem(this.tokenKey);
  }

  get usuario(): UsuarioSesion | null {
    const raw = localStorage.getItem(this.userKey) ?? sessionStorage.getItem(this.userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UsuarioSesion;
    } catch {
      this.limpiarSesion();
      return null;
    }
  }

  get rol(): string | null {
    return this.usuario?.rol ?? null;
  }

  estaAutenticado(): boolean {
    return !!this.token && !!this.usuario;
  }

  guardarSesion(res: AuthResponse, recordar: boolean): void {
    this.limpiarSesion();
    const storage = recordar ? localStorage : sessionStorage;
    storage.setItem(this.tokenKey, res.access_token);
    storage.setItem(this.userKey, JSON.stringify(res.usuario));
  }

  limpiarSesion(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
  }
}
