import { of, Subject, throwError } from 'rxjs';
import { SimpleChange } from '@angular/core';
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

  it('un fallo al guardar Nutrición conserva la tabla y el formulario abierto',()=>{
    c.modulo='nutricion';
    c.records=[{id:3,titulo:'Plan existente',estado:'Activo'}];
    c.filtrarLocal();
    c.nuevoRegistro();
    c.form.titulo='Nuevo plan alimenticio';
    api.crearGymRegistro=jasmine.createSpy('crearGymRegistro')
      .and.returnValue(throwError(()=>({error:{message:'Error de validación en la API'}})));
    c.guardar();
    expect(c.error).toContain('Error de validación');
    expect(c.errorCarga).toBe('');
    expect(c.modalAbierto).toBeTrue();
    expect(c.saving).toBeFalse();
    expect(c.filtered.map(r=>r.titulo)).toEqual(['Plan existente']);
  });

  it('si falla la lectura de MySQL permite reintentar sin perder el mensaje',()=>{
    c.modulo='nutricion';
    api.gymRegistros.and.returnValues(
      throwError(()=>({error:{message:'No responde MySQL'}})),
      of([{id:5,titulo:'Plan recuperado',estado:'Activo'}])
    );
    c.cargar();
    expect(c.loading).toBeFalse();
    expect(c.errorCarga).toContain('MySQL');
    expect(c.records).toEqual([]);
    c.cargar();
    expect(c.errorCarga).toBe('');
    expect(c.records[0].titulo).toBe('Plan recuperado');
  });

  it('Nutrición permite crear y editar planes mediante la API real del módulo',()=>{
    c.modulo='nutricion';
    api.crearGymRegistro=jasmine.createSpy('crearGymRegistro').and.returnValue(of({id:5}));
    api.actualizarGymRegistro=jasmine.createSpy('actualizarGymRegistro').and.returnValue(of({id:5}));
    api.gymRegistros.and.returnValues(
      of([{id:5,titulo:'Plan inicial',estado:'Activo',fecha:'2026-11-19'}]),
      of([{id:5,titulo:'Plan actualizado',estado:'Activo',fecha:'2026-11-19'}])
    );
    c.nuevoRegistro();
    c.form.titulo='Plan inicial';
    c.form.fecha='2026-11-19';
    c.guardar();
    expect(api.crearGymRegistro).toHaveBeenCalledTimes(1);
    expect(api.crearGymRegistro.calls.mostRecent().args[0]).toBe('nutricion');
    expect(c.records[0].titulo).toBe('Plan inicial');
    c.editar(c.records[0]);
    c.form.titulo='Plan actualizado';
    c.guardar();
    expect(api.actualizarGymRegistro).toHaveBeenCalledTimes(1);
    expect(api.actualizarGymRegistro.calls.mostRecent().args[0]).toBe('nutricion');
    expect(c.records[0].titulo).toBe('Plan actualizado');
    expect(c.modalAbierto).toBeFalse();
  });

  it('Galería filtra por categoría guardada, no por palabras sueltas en la descripción',()=>{
    c.modulo='galeria';
    c.records=[
      {id:1,titulo:'Clase de yoga',subtitulo:'Foto del entrenamiento',datos:{categoria:'Entrenamiento'}},
      {id:2,titulo:'Competencia',subtitulo:'Equipo y socios del evento',datos:{categoria:'Eventos'}},
      {id:3,titulo:'Foto sin etiqueta antigua',subtitulo:'Imagen de socios',datos:{detalle:'De archivo'}},
    ];
    c.filtrarGaleria('Eventos');
    expect(c.galeriaVisible.map(x=>x.id)).toEqual([2]);
    c.filtrarGaleria('Entrenamiento');
    expect(c.galeriaVisible.map(x=>x.id)).toEqual([1]);
    c.filtrarGaleria('Socios');
    expect(c.galeriaVisible.map(x=>x.id)).toEqual([3]);
    c.filtrarGaleria('Todos');
    expect(c.galeriaVisible).toHaveSize(3);
  });

  it('Galería impide crear una foto sin categoría y guarda la categoría con su imagen',()=>{
    c.modulo='galeria';
    api.crearGymRegistro=jasmine.createSpy('crearGymRegistro').and.returnValue(of({id:8}));
    c.nuevoRegistro();
    c.form.titulo='Foto del evento';
    c.form.imagen_url='/uploads/admin-gym/imagen.png';
    c.guardar();
    expect(api.crearGymRegistro).not.toHaveBeenCalled();
    expect(c.error).toContain('categoría');
    expect(c.modalAbierto).toBeTrue();
    c.form.categoria='Eventos';
    c.guardar();
    expect(api.crearGymRegistro).toHaveBeenCalledTimes(1);
    expect(api.crearGymRegistro.calls.mostRecent().args[1].datos.categoria).toBe('Eventos');
    expect(c.modalAbierto).toBeFalse();
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

  it('no mezcla socios o equipos de una pantalla anterior al cambiar de módulo',()=>{
    const primera=new Subject<any[]>();
    const segunda=new Subject<any[]>();
    api.gymRegistros.and.returnValues(primera.asObservable(),segunda.asObservable());
    c.modulo='equipos';
    c.cargar();
    c.modulo='eventos';
    c.cargar();
    segunda.next([{id:7,titulo:'Torneo de barrio',estado:'Programado'}]);
    primera.next([{id:1,titulo:'Bicicleta fija',estado:'Operativo'}]);
    expect(c.records).toHaveSize(1);
    expect(c.records[0].titulo).toBe('Torneo de barrio');
    expect(c.filtered).toHaveSize(1);
    expect(c.loading).toBeFalse();
  });

  it('no mantiene registros antiguos cuando falla la carga de otro módulo',()=>{
    c.modulo='equipos';
    c.records=[{id:3,titulo:'Equipo de la página anterior'}];
    api.gymRegistros.and.returnValue(throwError(()=>new Error('Error del servidor')));
    c.modulo='eventos';
    c.cargar();
    expect(c.records).toEqual([]);
    expect(c.filtered).toEqual([]);
    expect(c.errorCarga).toContain('No se pudo cargar');
    expect(c.error).toBe('');
  });

  it('sólo el equipo en mantenimiento aparece en la tabla de mantenimiento',()=>{
    c.records=[
      {titulo:'Máquina en servicio',estado:'Operativo'},
      {titulo:'Máquina dañada',estado:'Mantenimiento'},
      {titulo:'Máquina dada de baja',estado:'Baja'}
    ];
    expect(c.equiposMantenimiento.map(item=>item.titulo)).toEqual(['Máquina dañada']);
  });

  it('descarta reportes antiguos cuando una actualización más reciente terminó primero',()=>{
    c.modulo='ingresos';
    const primera=new Subject<any>();
    const segunda=new Subject<any>();
    api.reporteIngresos.and.returnValues(primera.asObservable(),segunda.asObservable());
    c.cargarReporteIngresos();
    c.cargarReporteIngresos();
    segunda.next(reporte);
    primera.next({...reporte,total_anual:9999});
    expect(c.ingresoReporte.total_anual).toBe(400);
    expect(c.ingresoCargando).toBeFalse();
  });

  it('permite eliminar un registro real desde su edición tras confirmar',()=>{
    c.modulo='equipos';
    c.records=[{id:4,titulo:'Equipo antiguo',estado:'Operativo'}];
    c.filtrarLocal();
    c.editar(c.records[0]);
    api.eliminarGymRegistro=jasmine.createSpy('eliminarGymRegistro').and.returnValue(of({ok:true}));
    spyOn(window,'confirm').and.returnValue(true);
    c.eliminarRegistroActual();
    expect(api.eliminarGymRegistro).toHaveBeenCalledOnceWith('equipos',4);
    expect(c.records).toEqual([]);
    expect(c.filtered).toEqual([]);
    expect(c.modalAbierto).toBeFalse();
    expect(c.editandoId).toBeNull();
  });

  it('no elimina ningún registro si el administrador cancela o no está editando',()=>{
    c.modulo='galeria';
    c.records=[{id:7,titulo:'Foto conservada',estado:'Publicado'}];
    api.eliminarGymRegistro=jasmine.createSpy('eliminarGymRegistro').and.returnValue(of({ok:true}));
    const confirmacion=spyOn(window,'confirm').and.returnValue(false);
    c.eliminarRegistroActual();
    expect(api.eliminarGymRegistro).not.toHaveBeenCalled();
    c.editar(c.records[0]);
    c.eliminarRegistroActual();
    expect(confirmacion).toHaveBeenCalledTimes(1);
    expect(api.eliminarGymRegistro).not.toHaveBeenCalled();
    expect(c.records).toHaveSize(1);
    expect(c.modalAbierto).toBeTrue();
  });

  it('cambiar de módulo cierra el formulario anterior y descarta respuestas tardías de guardado',()=>{
    const pendiente=new Subject<any>();
    api.crearGymRegistro=jasmine.createSpy('crearGymRegistro').and.returnValue(pendiente.asObservable());
    c.modulo='equipos';
    c.nuevoRegistro();
    c.form.titulo='Caminadora';
    c.guardar();
    expect(api.crearGymRegistro).toHaveBeenCalledTimes(1);
    expect(c.saving).toBeTrue();
    c.modulo='galeria';
    c.ngOnChanges({modulo:new SimpleChange('equipos','galeria',false)});
    expect(c.modalAbierto).toBeFalse();
    expect(c.editandoId).toBeNull();
    expect(c.saving).toBeFalse();
    expect(c.form.titulo).toBe('');
    pendiente.next({id:11,titulo:'Caminadora'});
    expect(c.modalAbierto).toBeFalse();
    expect(c.records).toEqual([]);
    expect(c.toast).toBe('');
    expect(api.gymRegistros).toHaveBeenCalledWith('galeria');
  });

  it('doble clic en guardar registra una sola petición de la misma operación',()=>{
    const pendiente=new Subject<any>();
    api.crearGymRegistro=jasmine.createSpy('crearGymRegistro').and.returnValue(pendiente.asObservable());
    c.modulo='noticias';
    c.nuevoRegistro();
    c.form.titulo='Comunicado del gimnasio';
    c.guardar();
    c.guardar();
    expect(api.crearGymRegistro).toHaveBeenCalledTimes(1);
    pendiente.next({id:15});
    expect(c.saving).toBeFalse();
    expect(c.modalAbierto).toBeFalse();
  });

  it('doble clic en eliminar envía una sola petición y espera al servidor',()=>{
    const pendiente=new Subject<any>();
    api.eliminarGymRegistro=jasmine.createSpy('eliminarGymRegistro').and.returnValue(pendiente.asObservable());
    spyOn(window,'confirm').and.returnValue(true);
    c.modulo='equipos';
    c.records=[{id:9,titulo:'Cinta de prueba'}];
    c.filtrarLocal();
    c.editar(c.records[0]);
    c.eliminarRegistroActual();
    c.eliminarRegistroActual();
    expect(api.eliminarGymRegistro).toHaveBeenCalledTimes(1);
    expect(c.saving).toBeTrue();
    expect(c.records).toHaveSize(1);
    pendiente.next({ok:true});
    expect(c.saving).toBeFalse();
    expect(c.records).toHaveSize(0);
    expect(c.modalAbierto).toBeFalse();
  });

  it('respuesta de imagen anterior no altera el formulario de un nuevo módulo',()=>{
    const pendiente=new Subject<any>();
    api.subirImagenGymRegistro=jasmine.createSpy('subirImagenGymRegistro').and.returnValue(pendiente.asObservable());
    c.modulo='galeria';
    c.nuevoRegistro();
    const imagen=new File(['imagen válida'],'imagen.png',{type:'image/png'});
    const entrada=document.createElement('input');
    Object.defineProperty(entrada,'files',{value:[imagen]});
    c.seleccionarImagenLocal({target:entrada} as unknown as Event);
    c.modulo='noticias';
    c.ngOnChanges({modulo:new SimpleChange('galeria','noticias',false)});
    c.nuevoRegistro();
    pendiente.next({imagen_url:'/uploads/admin-gym/foto-antigua.png'});
    expect(c.form.imagen_url).toBe('');
    expect(c.subiendoImagen).toBeFalse();
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
