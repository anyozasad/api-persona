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
      'registrarAccesoCodigo', 'cambiarEstadoReserva'
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
});
