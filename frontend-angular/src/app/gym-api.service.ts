import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GymApiService {
  constructor(private http: HttpClient) {}

  // CLIENTE
  resumenCliente(): Observable<any> { return this.http.get('/api/mi-cuenta/resumen'); }
  perfilCliente(): Observable<any> { return this.http.get('/api/mi-cuenta/perfil'); }
  membresiaCliente(): Observable<any> { return this.http.get('/api/mi-cuenta/membresia'); }
  pagosCliente(): Observable<any[]> { return this.http.get<any[]>('/api/mi-cuenta/pagos'); }
  rutinasCliente(): Observable<any[]> { return this.http.get<any[]>('/api/mi-cuenta/rutinas'); }
  asistenciasCliente(): Observable<any[]> { return this.http.get<any[]>('/api/mi-cuenta/asistencias'); }
  reservasCliente(): Observable<any[]> { return this.http.get<any[]>('/api/mi-cuenta/reservas'); }
  clases(): Observable<any[]> { return this.http.get<any[]>('/api/clases'); }
  membresias(): Observable<any[]> { return this.http.get<any[]>('/api/membresias'); }

  cargarPortalCliente(): Observable<any> {
    return forkJoin({
      resumen: this.resumenCliente(),
      perfil: this.perfilCliente(),
      membresia: this.membresiaCliente(),
      pagos: this.pagosCliente(),
      rutinas: this.rutinasCliente(),
      asistencias: this.asistenciasCliente(),
      reservas: this.reservasCliente(),
      clases: this.clases(),
      membresiasDisponibles: this.membresias(),
    });
  }

  reservarClase(id_clase: number, fecha_clase: string): Observable<any> {
    return this.http.post('/api/mi-cuenta/reservas', { id_clase, fecha_clase });
  }

  cancelarReserva(id_reserva: number): Observable<any> {
    return this.http.post(`/api/mi-cuenta/reservas/${id_reserva}/cancelar`, {});
  }

  solicitarPago(datos: {
    id_membresia: number;
    fecha_inicio?: string;
    metodo_pago: string;
    numero_operacion: string;
    observacion?: string;
  }): Observable<any> {
    return this.http.post('/api/mi-cuenta/pagos/solicitar', datos);
  }

  cancelarSolicitudPago(id_pago: number): Observable<any> {
    return this.http.post(`/api/mi-cuenta/pagos/${id_pago}/cancelar`, {});
  }

  // ADMINISTRACION
  dashboard(): Observable<any> { return this.http.get('/api/dashboard/resumen'); }
  clientes(): Observable<any[]> { return this.http.get<any[]>('/api/clientes'); }
  membresiasClienteAdmin(): Observable<any[]> { return this.http.get<any[]>('/api/cliente-membresias'); }
  pagosAdmin(): Observable<any[]> { return this.http.get<any[]>('/api/pagos-membresia'); }
  entrenadores(): Observable<any[]> { return this.http.get<any[]>('/api/entrenadores'); }
  asistencias(): Observable<any[]> { return this.http.get<any[]>('/api/asistencias'); }
  reservasAdmin(): Observable<any[]> { return this.http.get<any[]>('/api/reservas'); }
  productos(): Observable<any[]> { return this.http.get<any[]>('/api/productos'); }
  proveedores(): Observable<any[]> { return this.http.get<any[]>('/api/proveedores'); }
  compras(): Observable<any[]> { return this.http.get<any[]>('/api/compras'); }
  ventas(): Observable<any[]> { return this.http.get<any[]>('/api/ventas'); }
  usuarios(): Observable<any[]> { return this.http.get<any[]>('/api/usuarios'); }
  cajaActual(): Observable<any> { return this.http.get('/api/caja/actual'); }

  cargarPanelAdmin(): Observable<any> {
    return forkJoin({
      dashboard: this.dashboard(),
      clientes: this.clientes(),
      membresias: this.membresiasClienteAdmin(),
      pagos: this.pagosAdmin(),
      clases: this.clases(),
      entrenadores: this.entrenadores(),
      asistencias: this.asistencias(),
      reservas: this.reservasAdmin(),
      caja: this.cajaActual(),
    });
  }

  crearCliente(datos: any): Observable<any> { return this.http.post('/api/clientes', datos); }
  actualizarCliente(id: number, datos: any): Observable<any> { return this.http.put(`/api/clientes/${id}`, datos); }
  desactivarCliente(id: number): Observable<any> { return this.http.delete(`/api/clientes/${id}`); }

  contratarMembresia(datos: any): Observable<any> { return this.http.post('/api/membresias/contratar', datos); }
  renovarMembresia(datos: any): Observable<any> { return this.http.post('/api/membresias/renovar', datos); }

  registrarEntrada(id_cliente: number, observacion?: string): Observable<any> {
    return this.http.post('/api/asistencias/entrada', { id_cliente, observacion });
  }
  registrarSalida(id_cliente: number, observacion?: string): Observable<any> {
    return this.http.post('/api/asistencias/salida', { id_cliente, observacion });
  }

  crearClase(datos: any): Observable<any> { return this.http.post('/api/clases', datos); }
  eliminarClase(id: number): Observable<any> { return this.http.delete(`/api/clases/${id}`); }

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

  kardex(filtros?: { id_producto?: number; desde?: string; hasta?: string }): Observable<any[]> {
    let params = new HttpParams();
    if (filtros?.id_producto) params = params.set('id_producto', filtros.id_producto);
    if (filtros?.desde) params = params.set('desde', filtros.desde);
    if (filtros?.hasta) params = params.set('hasta', filtros.hasta);
    return this.http.get<any[]>('/api/kardex', { params });
  }

  ajustarStock(datos: { id_producto: number; tipo: 'Entrada'|'Salida'; cantidad: number; motivo: string }): Observable<any> {
    return this.http.post('/api/kardex/ajustar', datos);
  }

  auditorias(filtros?: { id_usuario?: number; ruta?: string; desde?: string; hasta?: string }): Observable<any[]> {
    let params = new HttpParams();
    if (filtros?.id_usuario) params = params.set('id_usuario', filtros.id_usuario);
    if (filtros?.ruta) params = params.set('ruta', filtros.ruta);
    if (filtros?.desde) params = params.set('desde', filtros.desde);
    if (filtros?.hasta) params = params.set('hasta', filtros.hasta);
    return this.http.get<any[]>('/api/auditorias', { params });
  }
}
