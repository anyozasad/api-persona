import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  constructor(private http: HttpClient) {}

  // =========================================================
  // DASHBOARD
  // =========================================================
  dashboard(): Observable<any> { return this.http.get('/api/dashboard/resumen'); }

  // =========================================================
  // CLIENTES
  // =========================================================
  clientes(): Observable<any[]> { return this.http.get<any[]>('/api/gym-admin/socios'); }
  cliente(id: number): Observable<any> { return this.http.get(`/api/gym-admin/socios/${id}`); }
  fichaCliente(id: number): Observable<any> { return this.http.get(`/api/clientes/${id}/ficha`); }
  crearCliente(datos: any): Observable<any> { return this.http.post('/api/gym-admin/socios', datos); }
  actualizarCliente(id: number, datos: any): Observable<any> { return this.http.put(`/api/gym-admin/socios/${id}`, datos); }
  desactivarCliente(id: number): Observable<any> { return this.http.put(`/api/gym-admin/socios/${id}/estado`, { estado: 'Inactivo' }); }

  // =========================================================
  // MEMBRESIAS Y PAGOS
  // =========================================================
  membresiasDisponibles(): Observable<any[]> { return this.http.get<any[]>('/api/gym-admin/planes'); }
  membresia(id: number): Observable<any> { return this.http.get(`/api/gym-admin/planes/${id}`); }
  crearMembresia(datos: any): Observable<any> { return this.http.post('/api/gym-admin/planes', datos); }
  actualizarMembresia(id: number, datos: any): Observable<any> { return this.http.put(`/api/gym-admin/planes/${id}`, datos); }
  eliminarMembresia(id: number): Observable<any> { return this.http.put(`/api/gym-admin/planes/${id}/estado`, { estado: 'Inactivo' }); }

  clienteMembresias(): Observable<any[]> { return this.http.get<any[]>('/api/gym-admin/suscripciones'); }
  clienteMembresia(id: number): Observable<any> { return this.http.get(`/api/cliente-membresias/${id}`); }
  contratarMembresia(datos: any): Observable<any> { return this.http.post('/api/gym-admin/suscripciones', datos); }
  renovarMembresia(datos: any): Observable<any> { return this.http.post('/api/membresias/renovar', datos); }
  estadoMembresiaCliente(idCliente: number): Observable<any> {
    return this.http.get(`/api/clientes/${idCliente}/estado-membresia`);
  }
  historialPagosCliente(idCliente: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/clientes/${idCliente}/historial-pagos`);
  }

  pagos(): Observable<any[]> { return this.http.get<any[]>('/api/pagos-membresia'); }
  pago(id: number): Observable<any> { return this.http.get(`/api/pagos-membresia/${id}`); }
  pagosPendientes(): Observable<any[]> { return this.http.get<any[]>('/api/pagos-membresia-pendientes'); }
  confirmarPago(id: number): Observable<any> { return this.http.post(`/api/pagos-membresia/${id}/confirmar`, {}); }
  rechazarPago(id: number, motivo: string): Observable<any> {
    return this.http.post(`/api/pagos-membresia/${id}/rechazar`, { motivo });
  }
  comprobantePago(id: number): Observable<any> {
    return this.http.get(`/api/pagos-membresia/${id}/comprobante`);
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
  clases(): Observable<any[]> { return this.http.get<any[]>('/api/clases'); }
  clase(id: number): Observable<any> { return this.http.get(`/api/clases/${id}`); }
  crearClase(datos: any): Observable<any> { return this.http.post('/api/clases', datos); }
  actualizarClase(id: number, datos: any): Observable<any> { return this.http.put(`/api/clases/${id}`, datos); }
  desactivarClase(id: number): Observable<any> { return this.http.delete(`/api/clases/${id}`); }

  // =========================================================
  // RUTINAS
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
  asistencias(): Observable<any[]> { return this.http.get<any[]>('/api/gym-admin/asistencias'); }
  asistencia(id: number): Observable<any> { return this.http.get(`/api/asistencias/${id}`); }
  registrarEntrada(id_cliente: number, observacion?: string): Observable<any> {
    return this.http.post('/api/gym-admin/asistencias/entrada', { id_cliente, observacion });
  }
  registrarSalida(id_cliente: number, observacion?: string): Observable<any> {
    return this.http.post('/api/gym-admin/asistencias/salida', { id_cliente, observacion });
  }
  historialAsistencias(idCliente: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/clientes/${idCliente}/asistencias`);
  }

  // =========================================================
  // RESERVAS
  // =========================================================
  reservas(): Observable<any[]> { return this.http.get<any[]>('/api/reservas'); }
  cambiarEstadoReserva(id: number, estado: string): Observable<any> {
    return this.http.put(`/api/reservas/${id}/estado`, { estado });
  }

  // =========================================================
  // CATEGORIAS Y PRODUCTOS
  // =========================================================
  categorias(): Observable<any[]> { return this.http.get<any[]>('/api/gym-admin/categorias'); }
  categoria(id: number): Observable<any> { return this.http.get(`/api/categorias/${id}`); }
  crearCategoria(datos: any): Observable<any> { return this.http.post('/api/gym-admin/categorias', datos); }
  actualizarCategoria(id: number, datos: any): Observable<any> { return this.http.put(`/api/gym-admin/categorias/${id}`, datos); }
  eliminarCategoria(id: number): Observable<any> { return this.http.put(`/api/gym-admin/categorias/${id}/estado`, { estado: 'Inactivo' }); }

  productos(): Observable<any[]> { return this.http.get<any[]>('/api/gym-admin/productos'); }
  producto(id: number): Observable<any> { return this.http.get(`/api/gym-admin/productos/${id}`); }
  crearProducto(datos: any): Observable<any> { return this.http.post('/api/gym-admin/productos', datos); }
  actualizarProducto(id: number, datos: any): Observable<any> { return this.http.put(`/api/gym-admin/productos/${id}`, datos); }
  eliminarProducto(id: number): Observable<any> { return this.http.put(`/api/gym-admin/productos/${id}/estado`, { estado: 'Inactivo' }); }

  // =========================================================
  // PROVEEDORES
  // =========================================================
  proveedores(): Observable<any[]> { return this.http.get<any[]>('/api/proveedores'); }
  proveedor(id: number): Observable<any> { return this.http.get(`/api/proveedores/${id}`); }
  crearProveedor(datos: any): Observable<any> { return this.http.post('/api/proveedores', datos); }
  actualizarProveedor(id: number, datos: any): Observable<any> { return this.http.put(`/api/proveedores/${id}`, datos); }
  desactivarProveedor(id: number): Observable<any> { return this.http.delete(`/api/proveedores/${id}`); }

  // =========================================================
  // COMPRAS
  // =========================================================
  compras(): Observable<any[]> { return this.http.get<any[]>('/api/compras'); }
  compra(id: number): Observable<any> { return this.http.get(`/api/compras/${id}`); }
  registrarCompra(datos: any): Observable<any> { return this.http.post('/api/compras', datos); }
  anularCompra(id: number): Observable<any> { return this.http.post(`/api/compras/${id}/anular`, {}); }

  // =========================================================
  // VENTAS
  // =========================================================
  ventas(): Observable<any[]> { return this.http.get<any[]>('/api/gym-admin/ventas'); }
  venta(id: number): Observable<any> { return this.http.get(`/api/gym-admin/ventas/${id}`); }
  registrarVenta(datos: any): Observable<any> { return this.http.post('/api/gym-admin/ventas', datos); }
  anularVenta(id: number, motivo: string): Observable<any> { return this.http.put(`/api/gym-admin/ventas/${id}/anular`, { motivo }); }

  // =========================================================
  // KARDEX
  // =========================================================
  kardex(filtros?: { id_producto?: number; desde?: string; hasta?: string }): Observable<any[]> {
    let params = new HttpParams();
    if (filtros?.id_producto) params = params.set('id_producto', String(filtros.id_producto));
    if (filtros?.desde) params = params.set('desde', filtros.desde);
    if (filtros?.hasta) params = params.set('hasta', filtros.hasta);
    return this.http.get<any[]>('/api/gym-admin/kardex', { params });
  }
  ajustarStock(datos: { id_producto: number; tipo: 'Entrada' | 'Salida'; cantidad: number; motivo: string }): Observable<any> {
    return this.http.post('/api/gym-admin/productos/ajustar-stock', datos);
  }

  // =========================================================
  // CAJA
  // =========================================================
  cajaActual(): Observable<any> { return this.http.get('/api/gym-admin/caja/actual'); }
  abrirCaja(monto_inicial: number, observacion?: string): Observable<any> {
    return this.http.post('/api/gym-admin/caja/abrir', { monto_inicial, observacion });
  }
  movimientoCaja(tipo: 'Ingreso' | 'Egreso', origen: string, descripcion: string, monto: number): Observable<any> {
    return this.http.post('/api/gym-admin/caja/movimientos', { tipo, origen, descripcion, monto });
  }
  cerrarCaja(monto_real: number, observacion?: string): Observable<any> {
    return this.http.post('/api/gym-admin/caja/cerrar', { monto_real, observacion });
  }
  historialCaja(): Observable<any[]> { return this.http.get<any[]>('/api/gym-admin/caja/historial'); }

  // =========================================================
  // USUARIOS
  // =========================================================
  usuarios(): Observable<any[]> { return this.http.get<any[]>('/api/gym-admin/usuarios'); }
  usuario(id: number): Observable<any> { return this.http.get(`/api/usuarios/${id}`); }
  crearUsuario(datos: any): Observable<any> { return this.http.post('/api/gym-admin/usuarios', datos); }
  actualizarUsuario(id: number, datos: any): Observable<any> { return this.http.put(`/api/gym-admin/usuarios/${id}`, datos); }
  eliminarUsuario(id: number): Observable<any> { return this.http.put(`/api/gym-admin/usuarios/${id}/estado`, { estado: 'Inactivo' }); }

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
    return this.http.get('/api/gym-admin/reportes/ingresos', { params: this.rangoFechas(desde, hasta) });
  }
  reporteVencimientos(): Observable<any> { return this.http.get('/api/gym-admin/reportes/vencimientos'); }
  reporteAsistencias(desde?: string, hasta?: string): Observable<any> {
    return this.http.get('/api/gym-admin/asistencias/reporte', { params: this.rangoFechas(desde, hasta) });
  }
  vistaClientesMembresias(): Observable<any[]> { return this.http.get<any[]>('/api/vistas/clientes-membresias'); }
  vistaStock(): Observable<any[]> { return this.http.get<any[]>('/api/vistas/stock'); }
  vistaVentas(): Observable<any[]> { return this.http.get<any[]>('/api/vistas/ventas'); }

  // =========================================================
  // CONFIGURACIÓN DEL SISTEMA
  // =========================================================
  configuracion(): Observable<any> { return this.http.get('/api/configuracion'); }
  guardarConfiguracion(datos: any): Observable<any> { return this.http.put('/api/configuracion', datos); }
  estadoSistema(): Observable<any> { return this.http.get('/api/configuracion/estado'); }
  crearRespaldo(): Observable<any> { return this.http.post('/api/configuracion/respaldo', {}); }
  limpiarCacheSistema(): Observable<any> { return this.http.post('/api/configuracion/limpiar-cache', {}); }

  // =========================================================
  // COMUNICACIÓN CON CLIENTES
  // =========================================================
  notificacionesClientes(): Observable<any[]> {
    return this.http.get<any[]>('/api/notificaciones-clientes');
  }

  enviarNotificacionCliente(datos: {
    id_cliente?: number | null;
    titulo: string;
    mensaje: string;
    tipo?: string;
  }): Observable<any> {
    return this.http.post('/api/notificaciones-clientes', datos);
  }

  eliminarNotificacionCliente(id: number): Observable<any> {
    return this.http.delete(`/api/notificaciones-clientes/${id}`);
  }

  solicitudesSoporte(): Observable<any[]> {
    return this.http.get<any[]>('/api/soporte-clientes');
  }

  responderSoporte(id: number, respuesta: string, estado: 'Respondido' | 'Cerrado' = 'Respondido'): Observable<any> {
    return this.http.put(`/api/soporte-clientes/${id}/responder`, { respuesta, estado });
  }

  cerrarSoporte(id: number): Observable<any> {
    return this.http.put(`/api/soporte-clientes/${id}/cerrar`, {});
  }

  // =========================================================
  // FUNCIONES COMPLETAS DEL REPOSITORIO DE REFERENCIA (GYM SYSTEM)
  // =========================================================
  gymEstado(): Observable<any> { return this.http.get('/api/gym-admin/estado'); }
  filtrarDashboardGym(plan_ids: string[] = [], busqueda = ''): Observable<any> {
    return this.http.post('/api/gym-admin/dashboard/filtrar', { plan_ids, busqueda });
  }
  validarAsistenciaDni(dni: string): Observable<any> {
    return this.http.post('/api/gym-admin/asistencias/validar', { dni });
  }
  exportarAsistenciasGym(desde?: string, hasta?: string): Observable<Blob> {
    return this.http.get('/api/gym-admin/asistencias/exportar', { params: this.rangoFechas(desde,hasta), responseType:'blob' });
  }
  exportarSuscripcionesGym(): Observable<Blob> {
    return this.http.get('/api/gym-admin/suscripciones/exportar', { responseType:'blob' });
  }
  gastosGym(): Observable<any[]> { return this.http.get<any[]>('/api/gym-admin/gastos'); }
  registrarGastoGym(datos:any): Observable<any> { return this.http.post('/api/gym-admin/gastos', datos); }
  anularGastoGym(id:number,motivo:string): Observable<any> {
    return this.http.put(`/api/gym-admin/gastos/${id}/anular`, { motivo });
  }
  progresoGym(socioId:number): Observable<any> { return this.http.get(`/api/gym-admin/progreso/${socioId}`); }
  guardarMedidaGym(datos:any): Observable<any> { return this.http.post('/api/gym-admin/progreso/medidas', datos); }
  eliminarMedidaGym(id:number): Observable<any> { return this.http.delete(`/api/gym-admin/progreso/medidas/${id}`); }
  guardarRutinaGym(datos:any): Observable<any> { return this.http.post('/api/gym-admin/progreso/rutina', datos); }
  vencimientosWhatsappGym(dias=7): Observable<any[]> {
    return this.http.get<any[]>('/api/gym-admin/notificaciones/vencimientos', { params:new HttpParams().set('dias',String(dias)) });
  }
  guardarWhatsappKeyGym(id:number,whatsapp_api_key:string): Observable<any> {
    return this.http.put(`/api/gym-admin/notificaciones/socios/${id}/api-key`, { whatsapp_api_key });
  }
  enviarWhatsappGym(id:number): Observable<any> {
    return this.http.post(`/api/gym-admin/notificaciones/socios/${id}/enviar`, {});
  }
  enviarWhatsappTodosGym(dias=7): Observable<any> {
    return this.http.post('/api/gym-admin/notificaciones/enviar-todos', { dias });
  }
  backupGym(): Observable<Blob> {
    return this.http.get('/api/gym-admin/mantenimiento/backup', { responseType:'blob' });
  }
  restaurarGym(archivo:File): Observable<any> {
    const fd=new FormData(); fd.append('backup_file',archivo);
    return this.http.post('/api/gym-admin/mantenimiento/restaurar', fd);
  }
  limpiarGym(): Observable<any> { return this.http.post('/api/gym-admin/mantenimiento/limpiar', {}); }
  limpiarCacheGym(): Observable<any> { return this.http.post('/api/gym-admin/mantenimiento/limpiar-cache', {}); }
  carnetGym(socioId:number): Observable<any> { return this.http.get(`/api/gym-admin/documentos/carnet/${socioId}`); }
  comprobanteGym(suscripcionId:number): Observable<any> { return this.http.get(`/api/gym-admin/documentos/comprobante/${suscripcionId}`); }
  ticketGym(ventaId:number): Observable<any> { return this.http.get(`/api/gym-admin/documentos/ticket/${ventaId}`); }

  private rangoFechas(desde?: string, hasta?: string): HttpParams {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return params;
  }
}
