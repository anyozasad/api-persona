import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  constructor(private http: HttpClient) {}

  dashboard(): Observable<any> { return this.http.get('/api/dashboard/resumen'); }

  clientes(): Observable<any[]> { return this.http.get<any[]>('/api/clientes'); }
  crearCliente(datos: any): Observable<any> { return this.http.post('/api/clientes', datos); }
  actualizarCliente(id: number, datos: any): Observable<any> { return this.http.put(`/api/clientes/${id}`, datos); }
  desactivarCliente(id: number): Observable<any> { return this.http.delete(`/api/clientes/${id}`); }

  membresiasDisponibles(): Observable<any[]> { return this.http.get<any[]>('/api/membresias'); }
  clienteMembresias(): Observable<any[]> { return this.http.get<any[]>('/api/cliente-membresias'); }
  contratarMembresia(datos: any): Observable<any> { return this.http.post('/api/membresias/contratar', datos); }
  renovarMembresia(datos: any): Observable<any> { return this.http.post('/api/membresias/renovar', datos); }

  pagos(): Observable<any[]> { return this.http.get<any[]>('/api/pagos-membresia'); }
  pagosPendientes(): Observable<any[]> { return this.http.get<any[]>('/api/pagos-membresia-pendientes'); }
  confirmarPago(id: number): Observable<any> { return this.http.post(`/api/pagos-membresia/${id}/confirmar`, {}); }
  rechazarPago(id: number, motivo: string): Observable<any> { return this.http.post(`/api/pagos-membresia/${id}/rechazar`, { motivo }); }

  entrenadores(): Observable<any[]> { return this.http.get<any[]>('/api/entrenadores'); }
  crearEntrenador(datos: any): Observable<any> { return this.http.post('/api/entrenadores', datos); }
  actualizarEntrenador(id: number, datos: any): Observable<any> { return this.http.put(`/api/entrenadores/${id}`, datos); }

  clases(): Observable<any[]> { return this.http.get<any[]>('/api/clases'); }
  crearClase(datos: any): Observable<any> { return this.http.post('/api/clases', datos); }
  actualizarClase(id: number, datos: any): Observable<any> { return this.http.put(`/api/clases/${id}`, datos); }
  desactivarClase(id: number): Observable<any> { return this.http.delete(`/api/clases/${id}`); }

  asistencias(): Observable<any[]> { return this.http.get<any[]>('/api/asistencias'); }
  registrarEntrada(id_cliente: number, observacion?: string): Observable<any> {
    return this.http.post('/api/asistencias/entrada', { id_cliente, observacion });
  }
  registrarSalida(id_cliente: number, observacion?: string): Observable<any> {
    return this.http.post('/api/asistencias/salida', { id_cliente, observacion });
  }

  productos(): Observable<any[]> { return this.http.get<any[]>('/api/productos'); }

  proveedores(): Observable<any[]> { return this.http.get<any[]>('/api/proveedores'); }
  crearProveedor(datos: any): Observable<any> { return this.http.post('/api/proveedores', datos); }
  actualizarProveedor(id: number, datos: any): Observable<any> { return this.http.put(`/api/proveedores/${id}`, datos); }
  desactivarProveedor(id: number): Observable<any> { return this.http.delete(`/api/proveedores/${id}`); }

  compras(): Observable<any[]> { return this.http.get<any[]>('/api/compras'); }
  registrarCompra(datos: any): Observable<any> { return this.http.post('/api/compras', datos); }
  anularCompra(id: number): Observable<any> { return this.http.post(`/api/compras/${id}/anular`, {}); }

  ventas(): Observable<any[]> { return this.http.get<any[]>('/api/ventas'); }
  registrarVenta(datos: any): Observable<any> { return this.http.post('/api/ventas', datos); }

  kardex(filtros?: { id_producto?: number; desde?: string; hasta?: string }): Observable<any[]> {
    let params = new HttpParams();
    if (filtros?.id_producto) params = params.set('id_producto', String(filtros.id_producto));
    if (filtros?.desde) params = params.set('desde', filtros.desde);
    if (filtros?.hasta) params = params.set('hasta', filtros.hasta);
    return this.http.get<any[]>('/api/kardex', { params });
  }
  ajustarStock(datos: { id_producto: number; tipo: 'Entrada'|'Salida'; cantidad: number; motivo: string }): Observable<any> {
    return this.http.post('/api/kardex/ajustar', datos);
  }

  cajaActual(): Observable<any> { return this.http.get('/api/caja/actual'); }
  abrirCaja(monto_inicial: number, observacion?: string): Observable<any> {
    return this.http.post('/api/caja/abrir', { monto_inicial, observacion });
  }
  movimientoCaja(tipo: 'Ingreso'|'Egreso', origen: string, descripcion: string, monto: number): Observable<any> {
    return this.http.post('/api/caja/movimientos', { tipo, origen, descripcion, monto });
  }
  cerrarCaja(monto_real: number, observacion?: string): Observable<any> {
    return this.http.post('/api/caja/cerrar', { monto_real, observacion });
  }
  historialCaja(): Observable<any[]> { return this.http.get<any[]>('/api/caja/historial'); }

  reporteIngresos(desde?: string, hasta?: string): Observable<any> {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get('/api/reportes/ingresos', { params });
  }
  reporteAsistencias(desde?: string, hasta?: string): Observable<any> {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get('/api/reportes/asistencias', { params });
  }
}
