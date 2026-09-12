import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GymApiService {
  constructor(private http: HttpClient) {}

  // =========================================================
  // PORTAL DEL CLIENTE
  // =========================================================
  resumenCliente(): Observable<any> { return this.http.get('/api/mi-cuenta/resumen'); }
  perfilCliente(): Observable<any> { return this.http.get('/api/mi-cuenta/perfil'); }
  actualizarPerfilCliente(datos: any): Observable<any> { return this.http.put('/api/mi-cuenta/perfil', datos); }
  membresiaCliente(): Observable<any> { return this.http.get('/api/mi-cuenta/membresia'); }
  pagosCliente(): Observable<any[]> { return this.http.get<any[]>('/api/mi-cuenta/pagos'); }
  rutinasCliente(): Observable<any[]> { return this.http.get<any[]>('/api/mi-cuenta/rutinas'); }
  asistenciasCliente(): Observable<any[]> { return this.http.get<any[]>('/api/mi-cuenta/asistencias'); }
  comprasCliente(): Observable<any[]> { return this.http.get<any[]>('/api/mi-cuenta/compras'); }
  reservasCliente(): Observable<any[]> { return this.http.get<any[]>('/api/mi-cuenta/reservas'); }

  cargarPortalCliente(): Observable<any> {
    return forkJoin({
      resumen: this.resumenCliente(),
      perfil: this.perfilCliente(),
      membresia: this.membresiaCliente(),
      pagos: this.pagosCliente(),
      rutinas: this.rutinasCliente(),
      asistencias: this.asistenciasCliente(),
      compras: this.comprasCliente(),
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

  // =========================================================
  // INFORMACION GENERAL AUTENTICADA
  // =========================================================
  membresias(): Observable<any[]> { return this.http.get<any[]>('/api/membresias'); }
  membresia(id: number): Observable<any> { return this.http.get(`/api/membresias/${id}`); }
  clases(): Observable<any[]> { return this.http.get<any[]>('/api/clases'); }
  clase(id: number): Observable<any> { return this.http.get(`/api/clases/${id}`); }

  // =========================================================
  // DASHBOARD Y CLIENTES
  // =========================================================
  dashboard(): Observable<any> { return this.http.get('/api/dashboard/resumen'); }
  clientes(): Observable<any[]> { return this.http.get<any[]>('/api/clientes'); }
  cliente(id: number): Observable<any> { return this.http.get(`/api/clientes/${id}`); }
  crearCliente(datos: any): Observable<any> { return this.http.post('/api/clientes', datos); }
  actualizarCliente(id: number, datos: any): Observable<any> { return this.http.put(`/api/clientes/${id}`, datos); }
  desactivarCliente(id: number): Observable<any> { return this.http.delete(`/api/clientes/${id}`); }

  // =========================================================
  // MEMBRESIAS Y PAGOS
  // =========================================================
  crearMembresia(datos: any): Observable<any> { return this.http.post('/api/membresias', datos); }
  actualizarMembresia(id: number, datos: any): Observable<any> { return this.http.put(`/api/membresias/${id}`, datos); }
  eliminarMembresia(id: number): Observable<any> { return this.http.delete(`/api/membresias/${id}`); }

  membresiasClienteAdmin(): Observable<any[]> { return this.http.get<any[]>('/api/cliente-membresias'); }
  membresiaClienteAdmin(id: number): Observable<any> { return this.http.get(`/api/cliente-membresias/${id}`); }
  pagosAdmin(): Observable<any[]> { return this.http.get<any[]>('/api/pagos-membresia'); }
  pagoAdmin(id: number): Observable<any> { return this.http.get(`/api/pagos-membresia/${id}`); }
  pagosPendientes(): Observable<any[]> { return this.http.get<any[]>('/api/pagos-membresia-pendientes'); }

  contratarMembresia(datos: any): Observable<any> { return this.http.post('/api/membresias/contratar', datos); }
  renovarMembresia(datos: any): Observable<any> { return this.http.post('/api/membresias/renovar', datos); }
  confirmarPago(id: number): Observable<any> { return this.http.post(`/api/pagos-membresia/${id}/confirmar`, {}); }
  rechazarPago(id: number, motivo: string): Observable<any> {
    return this.http.post(`/api/pagos-membresia/${id}/rechazar`, { motivo });
  }
  estadoMembresiaCliente(idCliente: number): Observable<any> {
    return this.http.get(`/api/clientes/${idCliente}/estado-membresia`);
  }
  historialPagosCliente(idCliente: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/clientes/${idCliente}/historial-pagos`);
  }
  comprobantePago(idPago: number): Observable<any> {
    return this.http.get(`/api/pagos-membresia/${idPago}/comprobante`);
  }

  // =========================================================
  // ENTRENADORES
  // =========================================================
  entrenadores(): Observable<any[]> { return this.http.get<any[]>('/api/entrenadores'); }
  entrenador(id: number): Observable<any> { return this.http.get(`/api/entrenadores/${id}`); }
  crearEntrenador(datos: any): Observable<any> { return this.http.post('/api/entrenadores', datos); }
  actualizarEntrenador(id: number, datos: any): Observable<any> { return this.http.put(`/api/entrenadores/${id}`, datos); }
  eliminarEntrenador(id: number): Observable<any> { return this.http.delete(`/api/entrenadores/${id}`); }

  // =========================================================
  // CLASES
  // =========================================================
  crearClase(datos: any): Observable<any> { return this.http.post('/api/clases', datos); }
  actualizarClase(id: number, datos: any): Observable<any> { return this.http.put(`/api/clases/${id}`, datos); }
  eliminarClase(id: number): Observable<any> { return this.http.delete(`/api/clases/${id}`); }

  // =========================================================
  // RUTINAS Y DETALLE DE RUTINAS
  // =========================================================
  rutinas(): Observable<any[]> { return this.http.get<any[]>('/api/rutinas'); }
  rutina(id: number): Observable<any> { return this.http.get(`/api/rutinas/${id}`); }
  crearRutina(datos: any): Observable<any> { return this.http.post('/api/rutinas', datos); }
  actualizarRutina(id: number, datos: any): Observable<any> { return this.http.put(`/api/rutinas/${id}`, datos); }
  eliminarRutina(id: number): Observable<any> { return this.http.delete(`/api/rutinas/${id}`); }

  detalleRutinas(): Observable<any[]> { return this.http.get<any[]>('/api/detalle-rutinas'); }
  detalleRutina(id: number): Observable<any> { return this.http.get(`/api/detalle-rutinas/${id}`); }
  crearDetalleRutina(datos: any): Observable<any> { return this.http.post('/api/detalle-rutinas', datos); }
  actualizarDetalleRutina(id: number, datos: any): Observable<any> {
    return this.http.put(`/api/detalle-rutinas/${id}`, datos);
  }
  eliminarDetalleRutina(id: number): Observable<any> { return this.http.delete(`/api/detalle-rutinas/${id}`); }

  // =========================================================
  // ASISTENCIAS
  // =========================================================
  asistencias(): Observable<any[]> { return this.http.get<any[]>('/api/asistencias'); }
  asistencia(id: number): Observable<any> { return this.http.get(`/api/asistencias/${id}`); }
  registrarEntrada(id_cliente: number, observacion?: string): Observable<any> {
    return this.http.post('/api/asistencias/entrada', { id_cliente, observacion });
  }
  registrarSalida(id_cliente: number, observacion?: string): Observable<any> {
    return this.http.post('/api/asistencias/salida', { id_cliente, observacion });
  }
  historialAsistencias(idCliente: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/clientes/${idCliente}/asistencias`);
  }

  // =========================================================
  // RESERVAS
  // =========================================================
  reservasAdmin(): Observable<any[]> { return this.http.get<any[]>('/api/reservas'); }
  cambiarEstadoReserva(id: number, estado: string): Observable<any> {
    return this.http.put(`/api/reservas/${id}/estado`, { estado });
  }

  // =========================================================
  // CATEGORIAS Y PRODUCTOS
  // =========================================================
  categorias(): Observable<any[]> { return this.http.get<any[]>('/api/categorias'); }
  categoria(id: number): Observable<any> { return this.http.get(`/api/categorias/${id}`); }
  crearCategoria(datos: any): Observable<any> { return this.http.post('/api/categorias', datos); }
  actualizarCategoria(id: number, datos: any): Observable<any> { return this.http.put(`/api/categorias/${id}`, datos); }
  eliminarCategoria(id: number): Observable<any> { return this.http.delete(`/api/categorias/${id}`); }

  productos(): Observable<any[]> { return this.http.get<any[]>('/api/productos'); }
  producto(id: number): Observable<any> { return this.http.get(`/api/productos/${id}`); }
  crearProducto(datos: any): Observable<any> { return this.http.post('/api/productos', datos); }
  actualizarProducto(id: number, datos: any): Observable<any> { return this.http.put(`/api/productos/${id}`, datos); }
  eliminarProducto(id: number): Observable<any> { return this.http.delete(`/api/productos/${id}`); }

  // =========================================================
  // PROVEEDORES, COMPRAS Y VENTAS
  // =========================================================
  proveedores(): Observable<any[]> { return this.http.get<any[]>('/api/proveedores'); }
  proveedor(id: number): Observable<any> { return this.http.get(`/api/proveedores/${id}`); }
  crearProveedor(datos: any): Observable<any> { return this.http.post('/api/proveedores', datos); }
  actualizarProveedor(id: number, datos: any): Observable<any> { return this.http.put(`/api/proveedores/${id}`, datos); }
  eliminarProveedor(id: number): Observable<any> { return this.http.delete(`/api/proveedores/${id}`); }

  compras(): Observable<any[]> { return this.http.get<any[]>('/api/compras'); }
  compra(id: number): Observable<any> { return this.http.get(`/api/compras/${id}`); }
  registrarCompra(datos: any): Observable<any> { return this.http.post('/api/compras', datos); }
  anularCompra(id: number): Observable<any> { return this.http.post(`/api/compras/${id}/anular`, {}); }

  ventas(): Observable<any[]> { return this.http.get<any[]>('/api/ventas'); }
  venta(id: number): Observable<any> { return this.http.get(`/api/ventas/${id}`); }
  registrarVenta(datos: any): Observable<any> { return this.http.post('/api/ventas', datos); }

  // =========================================================
  // CAJA
  // =========================================================
  cajaActual(): Observable<any> { return this.http.get('/api/caja/actual'); }
  abrirCaja(monto_inicial: number, observacion?: string): Observable<any> {
    return this.http.post('/api/caja/abrir', { monto_inicial, observacion });
  }
  movimientoCaja(tipo: 'Ingreso' | 'Egreso', origen: string, descripcion: string, monto: number): Observable<any> {
    return this.http.post('/api/caja/movimientos', { tipo, origen, descripcion, monto });
  }
  cerrarCaja(monto_real: number, observacion?: string): Observable<any> {
    return this.http.post('/api/caja/cerrar', { monto_real, observacion });
  }
  historialCaja(): Observable<any[]> { return this.http.get<any[]>('/api/caja/historial'); }

  // =========================================================
  // KARDEX
  // =========================================================
  kardex(filtros?: { id_producto?: number; desde?: string; hasta?: string }): Observable<any[]> {
    let params = new HttpParams();
    if (filtros?.id_producto) params = params.set('id_producto', String(filtros.id_producto));
    if (filtros?.desde) params = params.set('desde', filtros.desde);
    if (filtros?.hasta) params = params.set('hasta', filtros.hasta);
    return this.http.get<any[]>('/api/kardex', { params });
  }

  ajustarStock(datos: { id_producto: number; tipo: 'Entrada' | 'Salida'; cantidad: number; motivo: string }): Observable<any> {
    return this.http.post('/api/kardex/ajustar', datos);
  }

  // =========================================================
  // USUARIOS
  // =========================================================
  usuarios(): Observable<any[]> { return this.http.get<any[]>('/api/usuarios'); }
  usuario(id: number): Observable<any> { return this.http.get(`/api/usuarios/${id}`); }
  crearUsuario(datos: any): Observable<any> { return this.http.post('/api/usuarios', datos); }
  actualizarUsuario(id: number, datos: any): Observable<any> { return this.http.put(`/api/usuarios/${id}`, datos); }
  eliminarUsuario(id: number): Observable<any> { return this.http.delete(`/api/usuarios/${id}`); }

  // =========================================================
  // AUDITORIA
  // =========================================================
  auditorias(filtros?: { id_usuario?: number; ruta?: string; desde?: string; hasta?: string }): Observable<any[]> {
    let params = new HttpParams();
    if (filtros?.id_usuario) params = params.set('id_usuario', String(filtros.id_usuario));
    if (filtros?.ruta) params = params.set('ruta', filtros.ruta);
    if (filtros?.desde) params = params.set('desde', filtros.desde);
    if (filtros?.hasta) params = params.set('hasta', filtros.hasta);
    return this.http.get<any[]>('/api/auditorias', { params });
  }

  // =========================================================
  // REPORTES Y VISTAS
  // =========================================================
  reporteIngresos(desde?: string, hasta?: string): Observable<any> {
    return this.http.get('/api/reportes/ingresos', { params: this.rangoFechas(desde, hasta) });
  }
  reporteVencimientos(): Observable<any> { return this.http.get('/api/reportes/vencimientos'); }
  reporteAsistencias(desde?: string, hasta?: string): Observable<any> {
    return this.http.get('/api/reportes/asistencias', { params: this.rangoFechas(desde, hasta) });
  }
  vistaClientesMembresias(): Observable<any[]> { return this.http.get<any[]>('/api/vistas/clientes-membresias'); }
  vistaStock(): Observable<any[]> { return this.http.get<any[]>('/api/vistas/stock'); }
  vistaVentas(): Observable<any[]> { return this.http.get<any[]>('/api/vistas/ventas'); }

  // =========================================================
  // CARGA GENERAL DEL PANEL ADMIN
  // =========================================================
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
      productos: this.productos(),
      proveedores: this.proveedores(),
      compras: this.compras(),
      ventas: this.ventas(),
      usuarios: this.usuarios(),
      caja: this.cajaActual(),
    });
  }

  private rangoFechas(desde?: string, hasta?: string): HttpParams {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return params;
  }
}
