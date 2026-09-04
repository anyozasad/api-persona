import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/auth';
  private readonly tokenKey = 'mallqui_api_token';
  private readonly usuarioKey = 'mallqui_api_usuario';
  constructor(private http: HttpClient) {}
  login(datos: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, datos).pipe(tap(r => {
      localStorage.setItem(this.tokenKey, r.access_token);
      localStorage.setItem(this.usuarioKey, JSON.stringify(r.usuario));
    }));
  }
  logout(): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/logout`, {}).pipe(tap(() => this.limpiarSesion()));
  }
  token(): string | null { return localStorage.getItem(this.tokenKey); }
  usuario(): any | null {
    const valor = localStorage.getItem(this.usuarioKey);
    if (!valor) return null;
    try { return JSON.parse(valor); } catch { return null; }
  }
  estaAutenticado(): boolean { return !!this.token(); }
  limpiarSesion(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.usuarioKey);
  }
}
