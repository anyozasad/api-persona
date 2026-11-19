import { of, throwError } from 'rxjs';
import { AdminGymSuiteComponent } from './admin-gym-suite.component';

describe('Mallqui Gym: módulos administrativos con datos reales',()=>{
  let api:any;
  let c:AdminGymSuiteComponent;

  const reporte={
    anio:2026,desde:'2026-11-01',hasta:'2026-11-30',
    membresias:150,ventas_productos:50,total_ingresos:200,
    membresias_anual:300,ventas_productos_anual:100,total_anual:400,
    por_mes:[
      {mes:11,membresias:150,ventas_productos:50,total:200},
      {mes:1,membresias:150,ventas_productos:50,total:200}
    ]
  };

  beforeEach(()=>{
    api={
      gymRegistros:jasmine.createSpy('gymRegistros').and.returnValue(of([])),
      reporteIngresos:jasmine.createSpy('reporteIngresos').and.returnValue(of(reporte))
    };
    c=new AdminGymSuiteComponent(api);
  });

  it('salarios se filtran por meses reales, no opciones fijas de 2026',()=>{
    c.modulo='salarios';
    c.records=[
      {id:1,titulo:'Colaborador 1',fecha:'2026-11-15',estado:'Pagado',monto:900},
      {id:2,titulo:'Colaborador 2',fecha:'2026-10-15',estado:'Pendiente',monto:700},
      {id:3,titulo:'Sin fecha',estado:'Pendiente',monto:400}
    ];
    c.filtrarLocal();
    expect(c.periodosSalarios.map(p=>p.valor)).toEqual(['2026-11','2026-10']);
    expect(c.totalMonto).toBe(2000);
    c.periodoSalarios='2026-11';
    c.filtrarLocal();
    expect(c.filtered.map(r=>r.id)).toEqual([1]);
    expect(c.totalMonto).toBe(900);
    expect(c.contarEstadosFiltrados(['Pagado'])).toBe(1);
    expect(c.contarEstadosFiltrados(['Pendiente'])).toBe(0);
    c.periodoSalarios='';
    c.filtrarLocal();
    expect(c.filtered).toHaveSize(3);
  });

  it('ingresos carga el reporte financiero aunque fallen los registros manuales',()=>{
    c.modulo='ingresos';
    api.gymRegistros.and.returnValue(throwError(()=>({error:{message:'tabla secundaria no disponible'}})));
    c.cargar();
    expect(api.reporteIngresos).toHaveBeenCalledTimes(1);
    expect(c.ingresoReporte.total_anual).toBe(400);
    expect(c.ingresoError).toBe('');
    expect(c.ingresoCargando).toBeFalse();
    expect(c.ingresoMeses[0].mes).toBe(1);
    expect(c.ingresoMeses[0].total).toBe(200);
    expect(c.ingresoMeses[10].mes).toBe(11);
    expect(c.ingresoMeses[10].total).toBe(200);
    expect(c.ingresoMeses[1].total).toBe(0);
  });

  it('no inventa ceros como reporte confirmado cuando la API financiera falla',()=>{
    c.modulo='ingresos';
    api.reporteIngresos.and.returnValue(throwError(()=>new Error('MySQL sin conexión')));
    c.cargar();
    expect(c.ingresoReporte).toBeNull();
    expect(c.ingresoError).toContain('MySQL');
    expect(c.ingresoCargando).toBeFalse();
  });

  it('exporta el reporte anual confirmado y no las notas manuales',()=>{
    c.modulo='ingresos';
    c.ingresoReporte=reporte;
    c.filtered=[{titulo:'Nota manual',monto:50000}];
    const descargar=spyOn<any>(c,'descargarCsvFilas').and.stub();
    c.exportCsv();
    expect(descargar).toHaveBeenCalledTimes(1);
    const filas=descargar.calls.mostRecent().args[0] as any[][];
    expect(filas).toHaveSize(14);
    expect(filas[1][0]).toBe('Enero 2026');
    expect(filas[11][0]).toBe('Noviembre 2026');
    expect(filas[13][0]).toBe('TOTAL AÑO');
    expect(filas.flat().join(' ')).not.toContain('Nota manual');
    expect(descargar.calls.mostRecent().args[1]).toBe('mallqui-ingresos-confirmados');
  });

  it('bloquea exportación financiera si no hay respuesta del servidor',()=>{
    c.modulo='ingresos';
    const descargar=spyOn<any>(c,'descargarCsvFilas').and.stub();
    c.exportCsv();
    expect(descargar).not.toHaveBeenCalled();
    expect(c.error).toContain('confirmados');
  });

  it('eventos y noticias no presentan fechas inventadas',()=>{
    expect(c.diaEvento({fecha:'2026-11-19'})).toBe('19');
    expect(c.diaEvento({titulo:'Pendiente'})).toBe('—');
    expect(c.diaEvento({fecha:'2026-14-01'})).toBe('01');
  });

  it('facturas calculan cobranza sobre el filtro actual',()=>{
    c.modulo='facturas';
    c.records=[
      {titulo:'Uno',estado:'Pagada',monto:100},
      {titulo:'Dos',estado:'Pendiente',monto:90},
      {titulo:'Tres',estado:'Pagada',monto:50}
    ];
    c.filtrarLocal();
    expect(c.tasaCobranza).toBe(67);
    c.estadoFiltro='Pendiente';
    c.filtrarLocal();
    expect(c.tasaCobranza).toBe(0);
    expect(c.contarEstadosFiltrados(['Pagada'])).toBe(0);
    expect(c.contarEstadosFiltrados(['Pendiente'])).toBe(1);
    c.estadoFiltro='';
    c.filtrarLocal();
    expect(c.tasaCobranza).toBe(67);
  });
});
