import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria } from '../models/categoria';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly apiUrl = '/api/categorias';
  constructor(private http: HttpClient) {}
  listar(): Observable<Categoria[]> { return this.http.get<Categoria[]>(this.apiUrl); }
}
