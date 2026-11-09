import { of, throwError } from 'rxjs';
import { AdminIntegradoComponent } from './admin-integrado.component';

describe('AdminIntegradoComponent - pruebas funcionales del dashboard', () => {
  let component: AdminIntegradoComponent;
  let api: jasmine.SpyObj<any>;

  const fechaHoy = (): string => {
    const hoy = new Date();
    return [
      hoy.getFullYear(),
      String(hoy.getMonth() + 1).padStart(2, '0'),
      String(hoy.getDate()).padStart(2, '0')
    ].join('-');
  };

  beforeEach(() => {
    api = jasmine.createSpyObj('AdminApiService', [
      'estadoOperativo', 'dashboard', 'clientes', 'membresiasDisponibles',
      'clienteMembresias', 'pagos', 'productos', 'reservas', 'rutinas',
      'asistencias', 'entrenadores', 'clases', 'cajaActual',
      'registrarAccesoCodigo', 'cambiarEstadoReserva', 'confirmarPagoPendiente',
      'crearReservaAdmin', 'actualizarReservaAdmin', 'eliminarReservaAdmin', 'comprobantePago', 'verificacionEfsrt'
    ]);

    api.estadoOperativo.and.returnValue(of({
      api: true, database: true, operativo: true, faltantes: []
    }));
    api.dashboard.and.returnValue(of({
      periodo: { fecha: fechaHoy() },
      clientes: { total: 2, activos: 2 },
      asistencias: { hoy: 1 },
      reservas: { hoy: 1 },
      ingresos: { total_mes: 120 },
      membresias: { por_vencer_7_dias: 0, detalle_por_vencer: [] },
      alertas: { total: 0 }
    }));
    [
      'clientes', 'membresiasDisponibles', 'clienteMembresias', 'pagos',
      'productos', 'reservas', 'rutinas', 'asistencias', 'entrenadores', 'clases'
    ].forEach(metodo => api[metodo].and.returnValue(of([])));
    api.cajaActual.and.returnValue(of({ caja_abierta: false, caja: null }));

    const auth = { usuario: { nombre_usuario: 'admin', rol: 'Administrador' } } as any;
    const router = { navigate: jasmine.createSpy('navigate') } as any;
    component = new AdminIntegradoComponent(auth, api, router);
  });

  it('solo permite comprobantes de pagos completados, no pendientes', () => {
    component.verComprobantePago({id_pago: 2,estado_pago:'Pendiente'});
    expect(api.comprobantePago).not.toHaveBeenCalled();
    expect(component.comprobanteDatos).toBeNull();
    expect(component.error).toContain('no existe un pago confirmado');
  });

  it('consulta el comprobante real por id de pago y no por id de suscripcion', () => {
    const registro={id_pago: 7,estado_pago:'Completado'};
    const comprobante={
      numero_comprobante:'B001-00000007',estado_pago:'Completado',
      cliente:'Cliente prueba',monto:50,nota_tributaria:'Constancia interna'
    };
    api.comprobantePago.and.returnValue(of(comprobante));
    component.pagos=[registro];
    component.documentoPagoId=7;

    component.generarComprobanteMembresia();

    expect(api.comprobantePago).toHaveBeenCalledOnceWith(7);
    expect(component.comprobanteDatos).toEqual(comprobante);
  });

  it('rechaza consultar un pago no confirmado aunque este seleccionado', () => {
    component.pagos=[{id_pago:5,estado_pago:'Rechazado'}];
    component.documentoPagoId=5;

    component.generarComprobanteMembresia();

    expect(api.comprobantePago).not.toHaveBeenCalled();
    expect(component.comprobanteDatos).toBeNull();
    expect(component.error).toContain('Selecciona un pago confirmado');
  });

  it('abre la comprobación EFSRT sin desviarla al inicio', () => {
    expect((component as any).normalizarSegcion('verificacion-efsrt'))
      .toBe('verificacion-efsrt');
  });

  it('consulta la revisión EFSRT en el servidor y muestra tablas faltantes reales', () => {
    const revision={
      conexion:'disponible',
      total_modulos:10,
      modulos_con_estructura:8,
      faltantes:2,
      alertas:[],
      modulos:[{id:'reservas',estado:'estructura_incompleta',
        faltantes:['clases'],registros:1,destino:'reservas'}]
    };
    api.verificacionEfsrt.and.returnValue(of(revision));

    component.cargarVerificacionEfsrt();

    expect(api.verificacionEfsrt).toHaveBeenCalledTimes(1);
    expect(component.verificacionEfsrtCargando).toBeFalse();
    expect(component.verificacionEfsrt).toEqual(revision);
    expect(component.verificacionEfsrt.modulos[0].estado).toBe('estructura_incompleta');
  });

  it('no da por aprobada la revisión si la base de datos está caída', () => {
    api.verificacionEfsrt.and.returnValue(throwError(() => ({
      status:503,error:{mensaje:'No fue posible consultar la base de datos.'}
    })));
    component.verificacionEfsrt={conexion:'disponible'};

    component.cargarVerificacionEfsrt();

    expect(component.verificacionEfsrt).toBeNull();
    expect(component.verificacionEfsrtCargando).toBeFalse();
    expect(component.verificacionEfsrtError).toContain('No fue posible');
  });

  it('al regresar al Dashboard vuelve a consultar socios, pagos y productos reales', () => {
    spyOn(window, 'scrollTo').and.stub();
    component.seccion = 'clientes';
    component.clientes = [{ id_cliente: 98, nombres: 'Dato anterior' }];
    component.productos = [{ id_producto: 98, nombre_producto: 'Dato anterior' }];
    component.dashboard = { ingresos: { total_mes: 9999 } };

    api.clientes.and.returnValue(of([{ id_cliente: 3, nombres: 'Socio actualizado' }]));
    api.productos.and.returnValue(of([{ id_producto: 4, nombre_producto: 'Producto actualizado' }]));

    component.cambiarSegcion('dashboard');

    expect(component.seccion).toBe('dashboard');
    expect(api.estadoOperativo).toHaveBeenCalled();
    expect(api.clientes).toHaveBeenCalled();
    expect(api.productos).toHaveBeenCalled();
    expect(api.pagos).toHaveBeenCalled();
    expect(api.reservas).toHaveBeenCalled();
    expect(component.clientes[0].id_cliente).toBe(3);
    expect(component.productos[0].id_producto).toBe(4);
    expect(component.dashboard?.ingresos?.total_mes).toBe(120);
    expect(component.actualizandoDatos).toBeFalse();
  });

  it('sincroniza los datos del dashboard con las APIs operativas', () => {
    component.actualizarDashboardCompleto();

    expect(api.dashboard).toHaveBeenCalled();
    expect(api.clientes).toHaveBeenCalled();
    expect(api.reservas).toHaveBeenCalled();
    expect(api.productos).toHaveBeenCalled();
    expect(api.cajaActual).toHaveBeenCalled();
    expect(component.actualizandoDatos).toBeFalse();
    expect(component.sistemaSincronizado).toBeTrue();
    expect(component.dashboard?.ingresos?.total_mes).toBe(120);
  });

  it('no presenta datos antiguos como actualizados cuando falla el resumen', () => {
    component.dashboard = { ingresos: { total_mes: 99999 } };
    api.dashboard.and.returnValue(
      throwError(() => ({ status: 500, error: { mensaje: 'Error de base de datos' } }))
    );

    component.actualizarDashboardCompleto();

    expect(component.dashboard).toBeNull();
    expect(component.sistemaSincronizado).toBeFalse();
    expect(component.dashboardError).toContain('Error de base de datos');
    expect(component.erroresSincronizacion).toContain('dashboard');
  });

  it('detecta fallos parciales de sincronizacion sin informar estado activo', () => {
    api.reservas.and.returnValue(
      throwError(() => ({ status: 503, error: { mensaje: 'Reservas no disponibles' } }))
    );

    component.actualizarDashboardCompleto();

    expect(component.dashboard).toBeTruthy();
    expect(component.reservas).toEqual([]);
    expect(component.sistemaSincronizado).toBeFalse();
    expect(component.erroresSincronizacion).toContain('reservas');
  });

  it('muestra el total de vencimientos aunque la API limite los detalles a ocho', () => {
    component.dashboard = {
      membresias: {
        por_vencer_7_dias: 10,
        detalle_por_vencer: Array.from({ length: 8 }, (_, id) => ({ id }))
      }
    };
    expect(component.membresiasPorVencerDashboard.length).toBe(8);
    expect(component.totalMembresiasPorVencerDashboard).toBe(10);
  });

  it('muestra solo reservas de hoy no canceladas y en orden de horario', () => {
    const hoy = fechaHoy();
    component.reservas = [
      { fecha_clase: hoy, estado: 'Reservada', clase: { hora_inicio: '18:00' } },
      { fecha_clase: hoy, estado: 'Cancelada', clase: { hora_inicio: '06:00' } },
      { fecha_clase: '2020-01-01', estado: 'Reservada', clase: { hora_inicio: '07:00' } },
      { fecha_clase: hoy, estado: 'Asistio', clase: { hora_inicio: '09:00' } }
    ];

    const agenda = component.reservasHoyDashboard();
    expect(agenda.length).toBe(2);
    expect(agenda.map(r => r.clase.hora_inicio)).toEqual(['09:00', '18:00']);
  });

  it('impide exportar un resumen vacio y permite reintentar la sincronizacion', () => {
    component.dashboard = null;
    component.exportarDashboardCsv();
    expect(component.error).toContain('Primero carga el resumen');
    const refrescar = spyOn(component, 'actualizarDashboardCompleto');
    component.dashboardError = 'Falló la API';
    component.reintentarDashboard();
    expect(refrescar).toHaveBeenCalled();
    expect(component.dashboardError).toBe('');
  });

  it('valida el codigo antes de registrar una asistencia', () => {
    component.asistenciaCodigo = '   ';
    component.registrarAccesoPorCodigo();
    expect(api.registrarAccesoCodigo).not.toHaveBeenCalled();
    expect(component.error).toContain('código');

    api.registrarAccesoCodigo.and.returnValue(of({ mensaje: 'Acceso registrado', accion: 'Entrada' }));
    spyOn(component, 'ok');
    spyOn(component, 'cargarAsistencias');
    spyOn(component, 'cargarDashboard');
    component.asistenciaCodigo = 'MG-000012';
    component.registrarAccesoPorCodigo();

    expect(api.registrarAccesoCodigo).toHaveBeenCalledWith('MG-000012');
    expect(component.asistenciaCodigo).toBe('');
    expect(component.procesandoAccesoCodigo).toBeFalse();
    expect(component.cargarAsistencias).toHaveBeenCalled();
    expect(component.cargarDashboard).toHaveBeenCalled();
  });

  it('impide que reservas canceladas o finalizadas alteren los reportes de asistencia', () => {
    component.reservas = [
      { id_reserva: 7, estado: 'Cancelada' },
      { id_reserva: 8, estado: 'Asistio' },
      { id_reserva: 9, estado: 'NoAsistio' },
      { id_reserva: 10, estado: 'Reservada' }
    ];

    expect(component.reservaAdmiteCambioEstado(component.reservas[0])).toBeFalse();
    expect(component.reservaAdmiteCambioEstado(component.reservas[1])).toBeFalse();
    expect(component.reservaAdmiteCambioEstado(component.reservas[2])).toBeFalse();
    expect(component.reservaAdmiteCambioEstado(component.reservas[3])).toBeTrue();

    component.cambiarEstadoReserva(7, 'Asistio');

    expect(api.cambiarEstadoReserva).not.toHaveBeenCalled();
    expect(component.error).toContain('finalizada o cancelada');
  });

  it('guarda reservas nuevas desde el formulario real del administrador', () => {
    api.crearReservaAdmin.and.returnValue(of({ mensaje:'Reserva registrada' }));
    spyOn(component, 'cargarReservas');
    spyOn(component, 'cargarDashboard');
    spyOn(component, 'ok');
    component.reservaForm = {
      id_cliente: 5, id_clase: 3, fecha_clase: '2099-11-12'
    };

    component.guardarReservaAdmin();

    expect(api.crearReservaAdmin).toHaveBeenCalledWith({
      id_cliente: 5, id_clase: 3, fecha_clase: '2099-11-12'
    });
    expect(component.reservaEditandoId).toBe(0);
    expect(component.reservaGuardando).toBeFalse();
    expect(component.cargarReservas).toHaveBeenCalled();
    expect(component.cargarDashboard).toHaveBeenCalled();
  });

  it('edita datos de reservas pendientes sin modificar estados finalizados', () => {
    api.actualizarReservaAdmin.and.returnValue(of({ mensaje:'Actualizada' }));
    spyOn(component, 'cargarReservas');
    spyOn(component, 'cargarDashboard');
    spyOn(component, 'ok');
    const reserva = {
      id_reserva: 22, id_cliente: 5, id_clase: 3, estado:'Reservada', fecha_clase:'2099-11-12'
    };
    component.editarReservaAdmin(reserva);

    expect(component.reservaEditandoId).toBe(22);
    component.reservaForm.fecha_clase = '2099-11-19';
    component.guardarReservaAdmin();

    expect(api.actualizarReservaAdmin).toHaveBeenCalledWith(22, {
      id_cliente: 5, id_clase: 3, fecha_clase:'2099-11-19'
    });
  });

  it('evita registrar reservas con fechas incompletas o en el pasado', () => {
    component.reservaForm = { id_cliente: 0, id_clase: 0, fecha_clase: '' };
    component.guardarReservaAdmin();
    expect(api.crearReservaAdmin).not.toHaveBeenCalled();
    expect(component.error).toContain('Selecciona socio');

    component.reservaForm = { id_cliente: 1, id_clase: 1, fecha_clase: '2020-01-01' };
    component.guardarReservaAdmin();
    expect(api.crearReservaAdmin).not.toHaveBeenCalled();
    expect(component.error).toContain('no puede ser anterior');
  });

  it('actualiza el estado de una reserva mediante la API y recarga sus datos', () => {
    api.cambiarEstadoReserva.and.returnValue(of({ mensaje: 'Reserva actualizada' }));
    spyOn(component, 'ok');
    spyOn(component, 'cargarReservas');
    spyOn(component, 'cargarDashboard');

    component.cambiarEstadoReserva(14, 'Asistio');

    expect(api.cambiarEstadoReserva).toHaveBeenCalledWith(14, 'Asistio');
    expect(component.cargarReservas).toHaveBeenCalled();
    expect(component.cargarDashboard).toHaveBeenCalled();
  });

  it('calcula alertas a partir del desglose cuando el total no esta disponible', () => {
    component.dashboard = {
      alertas: { total: null, rutinas_pendientes: 2, soporte_pendiente: 1 },
      membresias: { por_vencer_7_dias: 3, pagos_pendientes: 1 },
      inventario: { productos_stock_bajo: 2 }
    };
    expect(component.totalAlertasDashboard()).toBe(9);
  });

  it('calcula el grafico financiero con cifras de la API sin puntos simulados', () => {
    component.dashboard = {
      ingresos: { total_mes: 150, membresias_mes: 100, ventas_mes: 50 },
      tendencias: {
        ingresos_6_meses: [
          { mes: 'Oct', total: 80, membresias: 50, ventas: 30 },
          { mes: 'Nov', total: 150, membresias: 100, ventas: 50 }
        ]
      }
    };
    component.tipoIngresoDashboard = 'ventas';

    expect(component.totalIngresoMesSeleccionado()).toBe(50);
    expect(component.ingresosMensualesDashboard().map(m => m.total)).toEqual([30, 50]);
    expect(component.maxIngresoGrafico()).toBe(50);
    expect(component.puntosIngresosDashboard().length).toBe(2);
    expect(component.lineaIngresosDashboard()).toContain(',');
    expect(component.areaIngresosDashboard()).toContain(' Z');
  });

  it('calcula asistencias por dia y porcentajes sin divisiones por cero', () => {
    component.dashboard = {
      asistencias: { hoy: 6 },
      reservas: { hoy: 2 },
      ventas: { hoy_cantidad: 2 },
      tendencias: {
        asistencias_7_dias: [
          { dia: 'Lun', total: 3 }, { dia: 'Mar', total: 6 }
        ]
      }
    };

    expect(component.totalActividadSemanal()).toBe(9);
    expect(component.alturaAsistenciaSemana(3)).toBe(50);
    expect(component.totalActividadOperativa()).toBe(10);
    expect(component.porcentajeActividadOperativa('asistencias')).toBe(60);
    component.dashboard = {};
    expect(component.porcentajeActividadOperativa('ventas')).toBe(0);
  });

  it('no confirma pagos en efectivo si la caja esta cerrada', () => {
    component.caja = { caja_abierta: false, caja: null };

    component.confirmarPagoEfectivo({
      id_pago: 7, estado_pago: 'Pendiente', metodo_pago: 'Efectivo'
    });

    expect(api.confirmarPagoPendiente).not.toHaveBeenCalled();
    expect(component.error).toContain('Abre Caja');
  });

  it('conserva el dashboard expandido y la paleta Mallqui blanco negro verde lima', () => {
    expect(component.navGroups.overview).toBeTrue();
    expect(component.acentoDashboard).toBe('verde');
    expect(component.modoDashboard).toBe('claro');
  });

  it('convierte un grupo del menu colapsado en un submenu accesible', () => {
    component.sidebarCerrado = true;
    component.navGroups.overview = false;

    component.toggleNavGroup('overview');

    expect(component.sidebarCerrado).toBeFalse();
    expect(component.navGroups.overview).toBeTrue();
  });

  it('calcula las minigraficas de KPI solo con series reales', () => {
    component.dashboard = { tendencias: { ingresos_6_meses: [
      { mes: 'Sep', total: 25, membresias: 15, ventas: 10 },
      { mes: 'Oct', total: 50, membresias: 30, ventas: 20 },
      { mes: 'Nov', total: 100, membresias: 70, ventas: 30 }
    ] }};
    component.tipoIngresoDashboard = 'total';

    expect(component.alturaIngresoKpi(25)).toBe(25);
    expect(component.alturaIngresoKpi(100)).toBe(100);
    expect(component.alturaIngresoKpi(-5)).toBe(0);
    component.dashboard = null;
    expect(component.alturaIngresoKpi(100)).toBe(0);
    expect(component.ingresosMensualesDashboard()).toEqual([]);
  });

  it('abre los modulos reales desde la actividad reciente', () => {
    expect(component.destinoActividadDashboard('reserva')).toBe('reservas');
    expect(component.destinoActividadDashboard('pago')).toBe('pagos');
    expect(component.destinoActividadDashboard('venta')).toBe('ventas');
    expect(component.destinoActividadDashboard('rutina')).toBe('rutinas');
    expect(component.destinoActividadDashboard('asistencia')).toBe('asistencias');
    expect(component.destinoActividadDashboard('soporte')).toBe('soporte');
    expect(component.destinoActividadDashboard('membresia')).toBe('membresias');
    expect(component.destinoActividadDashboard('otro')).toBe('reportes-admin');
    expect(component.iconoActividadDashboard('reserva')).toBe('◫');
  });

  it('abre módulo según datos de ruta Angular y no siempre el dashboard', () => {
    const ruta = { snapshot: { data: { seccion: 'productos' } } } as any;
    const instancia = new AdminIntegradoComponent({} as any, api, {} as any, ruta);
    spyOn(instancia, 'actualizarDashboardCompleto').and.stub();
    spyOn(instancia as any, 'cargarSegcion').and.stub();
    instancia.ngOnInit();
    expect(instancia.seccion).toBe('productos');
    expect((instancia as any).cargarSegcion).toHaveBeenCalledWith('productos');
    instancia.ngOnDestroy();
  });

  it('Fitness abre rutinas y Herramientas abre tablas, no inicio', () => {
    const cambiar = spyOn(component, 'cambiarSegcion').and.stub();
    component.abrirModuloAdmin('fitness');
    expect(cambiar).toHaveBeenCalledWith('rutinas');
    component.abrirModuloAdmin('herramientas');
    expect(cambiar).toHaveBeenCalledWith('tablas-admin');
  });

});
