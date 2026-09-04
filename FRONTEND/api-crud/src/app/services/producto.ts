import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/productos';
  constructor(private http: HttpClient) {}
  listar(): Observable<Producto[]> { return this.http.get<Producto[]>(this.apiUrl); }
  buscar(id: number): Observable<Producto> { return this.http.get<Producto>(`${this.apiUrl}/${id}`); }
  guardar(producto: Producto): Observable<Producto> { return this.http.post<Producto>(this.apiUrl, producto); }
  actualizar(id: number, producto: Partial<Producto>): Observable<Producto> { return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto); }
  eliminar(id: number): Observable<{ mensaje: string; producto: Producto }> { return this.http.delete<{ mensaje: string; producto: Producto }>(`${this.apiUrl}/${id}`); }
}
