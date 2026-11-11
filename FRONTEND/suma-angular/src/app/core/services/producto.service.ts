import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../../models/producto';

export interface DiagnosticoFotosProducto {
  base_datos: string;
  esquema: 'original' | 'laravel';
  total_productos: number;
  fotos_guardadas_en_mysql: number;
  sin_foto: number;
  referencias_antiguas: number;
  pendientes: Array<{
    id_producto: number;
    codigo_producto: string;
    nombre_producto: string;
    problema: string;
  }>;
  nota: string;
}

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly apiUrl = '/api/productos';

  constructor(private http: HttpClient) {}

  diagnosticoFotos(): Observable<DiagnosticoFotosProducto> {
    return this.http.get<DiagnosticoFotosProducto>(`${this.apiUrl}/diagnostico-fotos`);
  }

  listar(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  buscar(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  guardar(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto);
  }

  actualizar(id: number, producto: Partial<Producto>): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto);
  }

  actualizarFoto(id: number, foto: string): Observable<Producto> {
    return this.http.patch<Producto>(`${this.apiUrl}/${id}/foto`, { foto });
  }

  eliminar(id: number): Observable<{ mensaje: string; producto?: Producto }> {
    return this.http.delete<{ mensaje: string; producto?: Producto }>(`${this.apiUrl}/${id}`);
  }
}
