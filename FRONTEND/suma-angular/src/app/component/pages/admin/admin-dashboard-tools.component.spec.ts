import { AdminDashboardToolsComponent } from './admin-dashboard-tools.component';

describe('AdminDashboardToolsComponent', () => {
  let c: AdminDashboardToolsComponent;

  beforeEach(() => {
    c = new AdminDashboardToolsComponent();
    c.dashboard = {
      fuente: { base_datos: 'mallqui_gym' },
      ventas: { hoy_total: 300, hoy_cantidad: 3 },
      ingresos: { total_mes: 1000, membresias_mes: 600, ventas_mes: 400, variacion_mes: 20 },
      utilidad: { total_mes: 250 },
      tendencias: {
        asistencias_7_dias: [
          { dia: 'Lun', total: 10 }, { dia: 'Mar', total: 20 }, { dia: 'Mié', total: 5 },
          { dia: 'Jue', total: 15 }, { dia: 'Vie', total: 0 }, { dia: 'Sáb', total: 12 }, { dia: 'Dom', total: 8 }
        ]
      },
      membresias: { por_vencer_7_dias: 2 },
      inventario: { productos_stock_bajo: 1 },
      alertas: {
        total: 7,
        soporte_pendiente: 1,
        rutinas_pendientes: 2,
        opiniones_pendientes: 1,
        prioridades: [
          { tipo: 'rutinas', nivel: 'alto', titulo: 'Rutinas', cantidad: 2, descripcion: 'Pendientes' },
          { tipo: 'inventario', nivel: 'medio', titulo: 'Stock', cantidad: 1, descripcion: 'Stock bajo' }
        ]
      },
      portal_clientes: {
        actividad_reciente: [
          { tipo: 'reserva', cliente: 'Ana', titulo: 'Reserva', detalle: 'Yoga', estado: 'Registrado', fecha: '2026-10-11T10:00:00' },
          { tipo: 'pago', cliente: 'Luis', titulo: 'Pago', detalle: 'Mensual', estado: 'Pendiente', fecha: '2026-10-10T10:00:00' }
        ]
      }
    };
  });

  it('calcula venta promedio, margen y variacion de ingresos', () => {
    expect(c.numeroSeguro('10')).toBe(10);
    expect(c.ventaPromedioHoy()).toBe(100);
    expect(c.margenUtilidad()).toBe(25);
    expect(c.variacionIngresos()).toBe(20);
    expect(c.etiquetaVariacionIngresos()).toContain('Crecimiento');
  });

  it('calcula la participacion de membresias y productos', () => {
    expect(c.porcentajeIngresoMembresias()).toBe(60);
    expect(c.porcentajeIngresoProductos()).toBe(40);
  });

  it('calcula promedio y pico de asistencias', () => {
    expect(c.promedioAsistenciasSemana()).toBe(10);
    expect(c.diaPicoAsistencia().dia).toBe('Mar');
    expect(c.diaPicoAsistencia().total).toBe(20);
  });

  it('filtra, ordena y limpia prioridades', () => {
    c.filtroPrioridad = 'alto';
    expect(c.prioridadesFiltradas().length).toBe(1);
    expect(c.prioridadesFiltradas()[0].tipo).toBe('rutinas');
    expect(c.prioridadesUrgentes()).toBe(2);
    c.limpiarFiltroPrioridades();
    expect(c.filtroPrioridad).toBe('');
  });

  it('filtra, ordena y limpia actividad reciente', () => {
    c.busquedaActividad = 'ana';
    expect(c.actividadFiltrada().length).toBe(1);
    c.busquedaActividad = '';
    c.tipoActividad = 'pago';
    expect(c.actividadFiltrada()[0].cliente).toBe('Luis');
    c.limpiarFiltroActividad();
    expect(c.tipoActividad).toBe('');
  });

  it('detecta consistencia de alertas y calcula pendientes', () => {
    expect(c.totalPendientesCalculado()).toBe(7);
    expect(c.datosConsistentes()).toBeTrue();
    expect(c.mensajeConsistencia()).toContain('coincide');
    c.dashboard.alertas.total = 99;
    expect(c.datosConsistentes()).toBeFalse();
  });

  it('calcula riesgo y puntaje operativo', () => {
    expect(c.nivelRiesgoOperativo()).toBe('ALTO');
    expect(c.puntajeOperativo()).toBeGreaterThanOrEqual(0);
    expect(c.puntajeOperativo()).toBeLessThanOrEqual(100);
    expect(['estable','atencion','alerta']).toContain(c.estadoOperativo());
    expect(c.etiquetaEstadoOperativo().length).toBeGreaterThan(0);
  });

  it('copia un resumen ejecutivo real', () => {
    const spy = spyOn<any>(c, 'copiarTexto');
    c.copiarResumenEjecutivo();
    expect(spy).toHaveBeenCalled();
    const texto = spy.calls.mostRecent().args[0];
    expect(texto).toContain('MALLQUI GYM');
    expect(texto).toContain('Ingresos del mes');
  });

  it('exporta prioridades y actividad sin tocar datos', () => {
    const spy = spyOn<any>(c, 'descargarCsv');
    c.exportarPrioridadesCsv();
    c.exportarActividadCsv();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)[0]).toBe('prioridades-dashboard.csv');
    expect(spy.calls.argsFor(1)[0]).toBe('actividad-dashboard.csv');
  });

  it('envia al modulo correcto desde prioridad y actividad', () => {
    const emit = spyOn(c.irSeccion, 'emit');
    c.abrirDestinoPrioridad({ tipo: 'inventario' });
    c.abrirDestinoActividad({ tipo: 'pago' });
    expect(emit.calls.argsFor(0)[0]).toBe('inventario');
    expect(emit.calls.argsFor(1)[0]).toBe('pagos');
  });

  it('tolera dashboard vacio sin romper la interfaz', () => {
    c.dashboard = null;
    expect(c.ventaPromedioHoy()).toBe(0);
    expect(c.margenUtilidad()).toBe(0);
    expect(c.prioridadesFiltradas()).toEqual([]);
    expect(c.actividadFiltrada()).toEqual([]);
    expect(c.totalPendientesCalculado()).toBe(0);
    expect(c.puntajeOperativo()).toBe(80);
  });
});
