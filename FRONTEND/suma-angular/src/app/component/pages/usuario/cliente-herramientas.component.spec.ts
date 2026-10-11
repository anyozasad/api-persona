import { ClienteHerramientasComponent } from './cliente-herramientas.component';

describe('ClienteHerramientasComponent',()=>{
  let c:ClienteHerramientasComponent;
  beforeEach(()=>c=new ClienteHerramientasComponent());

  it('filtra y ordena clases con controles reales',()=>{
    c.enfoque='Cardiovascular';
    c.clases=[
      {nombre:'Yoga',dia_semana:'Martes',hora_inicio:'10:00',entrenador:{nombres:'Ana'}},
      {nombre:'Spinning',dia_semana:'Lunes',hora_inicio:'08:00',entrenador:{nombres:'Luis'}}
    ];
    c.busquedaClase='spin';
    expect(c.filtrarClases().length).toBe(1);
    c.busquedaClase='';
    c.alternarSoloRecomendadas();
    expect(c.filtrarClases()[0].nombre).toBe('Spinning');
    c.seleccionarDiaClase('Lunes');
    expect(c.contarClasesResultado()).toBe(1);
    expect(c.ordenarClasesPorNombre()[0].nombre).toBe('Spinning');
  });

  it('ordena clases por día y hora y limpia filtros',()=>{
    c.clases=[
      {nombre:'B',dia_semana:'Miércoles',hora_inicio:'18:00'},
      {nombre:'A',dia_semana:'Lunes',hora_inicio:'07:00'}
    ];
    expect(c.ordenarClasesPorDia()[0].dia_semana).toBe('Lunes');
    expect(c.ordenarClasesPorHora()[0].hora_inicio).toBe('07:00');
    expect(c.resumenProximaClase()).toContain('Próxima opción');
    const copy=spyOn<any>(c,'copiarTexto');
    c.copiarResumenClase();
    expect(copy).toHaveBeenCalled();
    c.busquedaClase='x';c.diaClase='Lunes';c.soloRecomendadas=true;c.limpiarFiltrosClases();
    expect(c.busquedaClase).toBe('');
  });

  it('filtra y resume reservas',()=>{
    const futuro=new Date(Date.now()+86400000).toISOString().slice(0,10);
    c.reservas=[
      {estado:'Reservada',fecha_clase:futuro,clase:{nombre:'Box'}},
      {estado:'ASISTIÓ',fecha_clase:'2026-01-01',clase:{nombre:'Yoga'}},
      {estado:'Cancelada',fecha_clase:'2026-01-02',clase:{nombre:'Cross'}}
    ];
    expect(c.mostrarReservasActivas().length).toBe(1);
    expect(c.mostrarReservasAsistidas().length).toBe(1);
    expect(c.mostrarReservasCanceladas().length).toBe(1);
    expect(c.proximaReserva()?.clase?.nombre).toBe('Box');
    expect(c.fechaCorta('2026-10-11')).toContain('11');
    c.estadoReserva='Reservada';
    expect(c.contarReservasResultado()).toBe(1);
  });

  it('ordena exporta y limpia reservas',()=>{
    c.reservas=[
      {estado:'Reservada',fecha_clase:'2026-10-10',clase:{nombre:'A'}},
      {estado:'Cancelada',fecha_clase:'2026-10-11',clase:{nombre:'B'}}
    ];
    expect(c.ordenarReservasRecientes()[0].clase.nombre).toBe('B');
    expect(c.ordenarReservasAntiguas()[0].clase.nombre).toBe('A');
    const dl=spyOn<any>(c,'descargarCsv');
    c.exportarReservasCsv();
    expect(dl).toHaveBeenCalled();
    c.busquedaReserva='A';c.estadoReserva='Reservada';c.limpiarFiltrosReservas();
    expect(c.estadoReserva).toBe('');
  });

  it('analiza asistencias reales',()=>{
    const now=new Date();
    const entrada=new Date(now.getFullYear(),now.getMonth(),2,10,0,0);
    const salida=new Date(now.getFullYear(),now.getMonth(),2,11,0,0);
    c.asistencias=[
      {fecha_hora_entrada:entrada.toISOString(),fecha_hora_salida:salida.toISOString()},
      {fecha_hora_entrada:new Date(now.getFullYear(),now.getMonth(),3,10,0,0).toISOString()}
    ];
    expect(c.mostrarAsistenciasMes().length).toBe(2);
    expect(c.mostrarAsistenciasCompletadas().length).toBe(1);
    expect(c.mostrarAsistenciasAbiertas().length).toBe(1);
    expect(c.minutosTotalesAsistencia()).toBeGreaterThanOrEqual(60);
    expect(c.promedioMinutosAsistencia()).toBeGreaterThan(0);
  });

  it('ordena exporta y limpia asistencias',()=>{
    c.asistencias=[
      {fecha_hora_entrada:'2026-10-10T10:00:00',fecha_hora_salida:'2026-10-10T11:00:00'},
      {fecha_hora_entrada:'2026-10-11T10:00:00',fecha_hora_salida:'2026-10-11T11:00:00'}
    ];
    expect(c.ordenarAsistenciasRecientes()[0].fecha_hora_entrada).toContain('2026-10-11');
    expect(c.ordenarAsistenciasAntiguas()[0].fecha_hora_entrada).toContain('2026-10-10');
    const dl=spyOn<any>(c,'descargarCsv');
    c.exportarAsistenciasCsv();
    expect(dl).toHaveBeenCalled();
    c.periodoAsistencia='mes';c.estadoAsistencia='completada';c.limpiarFiltrosAsistencias();
    expect(c.periodoAsistencia).toBe('');
  });

  it('filtra y calcula pagos',()=>{
    c.pagos=[
      {estado_pago:'COMPLETADO',monto:30,fecha_pago:'2026-10-10',numero_operacion:'ABC1',cliente_membresia:{membresia:{nombre:'Mensual'}}},
      {estado_pago:'Pendiente',monto:40,fecha_pago:'2026-10-11',numero_operacion:'ABC2',cliente_membresia:{membresia:{nombre:'Promo'}}},
      {estado_pago:'Cancelado',monto:50,fecha_pago:'2026-10-09'}
    ];
    expect(c.mostrarPagosCompletados().length).toBe(1);
    expect(c.mostrarPagosPendientes().length).toBe(1);
    expect(c.mostrarPagosCancelados().length).toBe(1);
    expect(c.montoTotalPagado()).toBe(30);
    expect(c.ultimoPagoCompletadoHerramienta()?.numero_operacion).toBe('ABC1');
  });

  it('ordena exporta y limpia pagos',()=>{
    c.pagos=[
      {estado_pago:'Completado',fecha_pago:'2026-10-10',monto:20},
      {estado_pago:'Pendiente',fecha_pago:'2026-10-11',monto:30}
    ];
    expect(c.ordenarPagosRecientes()[0].fecha_pago).toContain('2026-10-11');
    expect(c.ordenarPagosAntiguos()[0].fecha_pago).toContain('2026-10-10');
    c.estadoPago='Pendiente';expect(c.filtrarPagos().length).toBe(1);
    const dl=spyOn<any>(c,'descargarCsv');
    c.exportarPagosCsv();
    expect(dl).toHaveBeenCalled();
    c.limpiarFiltrosPagos();expect(c.estadoPago).toBe('');
  });

  it('muestra calidad del perfil y membresía',()=>{
    c.perfil={nombres:'C',apellidos:'A',correo:'x@mail.com',telefono:'999',direccion:'Pucallpa',dni:'12345678'};
    expect(c.porcentajePerfil()).toBe(100);
    expect(c.camposFaltantesPerfil()).toEqual([]);
    const fin=new Date(Date.now()+5*86400000).toISOString().slice(0,10);
    c.membresiaActual={fecha_fin:fin};
    expect(c.diasRestantesMembresiaHerramienta()).toBeGreaterThan(0);
    expect(c.estadoMembresiaHerramienta()).toBe('Activa');
  });

  it('copia datos y exporta resumen de cuenta',()=>{
    c.perfil={nombres:'C',apellidos:'A',correo:'x@mail.com',telefono:'999',direccion:'Pucallpa',dni:'12345678'};
    const copy=spyOn<any>(c,'copiarTexto');
    c.copiarDni();c.copiarCorreo();c.copiarTelefono();c.copiarDireccion();c.copiarResumenCuenta();
    expect(copy).toHaveBeenCalledTimes(5);
    const dl=spyOn<any>(c,'descargarTexto');
    c.exportarResumenCuenta();
    expect(dl).toHaveBeenCalled();
  });
});
