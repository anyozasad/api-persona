import { of, Subject, throwError } from 'rxjs';
import { AdminApplicationsComponent } from './admin-applications.component';
import { AdminIntegradoComponent } from './admin-integrado.component';

describe('Centro de aplicaciones Mantis - funciones reales de Mallqui Gym', () => {
  let component: AdminApplicationsComponent;
  beforeEach(() => {
    const api = { gymRegistros: jasmine.createSpy('gymRegistros').and.returnValue(of([])) } as any;
    component = new AdminApplicationsComponent(api);
  });

  it('incluye paneles, aplicaciones, socios, comercio y sistema sin páginas ficticias', () => {
    expect(component.aplicaciones.length).toBe(44);
    expect(component.aplicaciones.some(a=>a.nombre==='Dashboard financiero')).toBeTrue();
    expect(component.aplicaciones.some(a=>a.nombre==='Chat y helpdesk')).toBeTrue();
    expect(component.aplicaciones.some(a=>a.nombre==='Comercio electrónico / ventas')).toBeTrue();
    expect(component.aplicaciones.some(a=>a.nombre==='Tablas avanzadas')).toBeTrue();
    expect(component.aplicaciones.some(a=>a.nombre==='Comprobación EFSRT')).toBeTrue();
    expect(component.aplicaciones.every(a=>Boolean(a.id && a.grupo && a.descripcion))).toBeTrue();
  });

  it('todos los 44 accesos se corresponden con una sección válida del dashboard', () => {
    const admin = new AdminIntegradoComponent({} as any, {} as any, {} as any);
    const desconocidos = component.aplicaciones
      .filter(a=>(admin as any).normalizarSegcion(a.id)!==a.id)
      .map(a=>a.id);
    expect(desconocidos).toEqual([]);
  });

  it('filtra módulos por grupo y texto sin esconder los demás del sistema', () => {
    component.grupoApp='Comercio';
    component.busquedaApp='ventas';
    expect(component.aplicacionesFiltradas.length).toBe(1);
    expect(component.aplicacionesFiltradas[0].id).toBe('ventas');
    component.busquedaApp='';
    expect(component.aplicacionesFiltradas.every(a=>a.grupo==='Comercio')).toBeTrue();
    component.grupoApp='';
    expect(component.aplicacionesFiltradas.map(a=>a.id)).toEqual([
      'renovaciones','rutinas','ventas','inventario','soporte','calendario-admin'
    ]);
    component.mostrarTodasAplicaciones=true;
    expect(component.aplicacionesFiltradas.length).toBe(44);
    component.mostrarTodasAplicaciones=false;
    component.busquedaApp='configuración';
    expect(component.aplicacionesFiltradas.map(a=>a.id)).toEqual(['configuracion']);
    component.busquedaApp='';
    expect(component.aplicacionesFiltradas.length).toBe(6);
  });

  it('no muestra los 44 botones antes de que el usuario busque o expanda el directorio',()=>{
    expect(component.mostrarTodasAplicaciones).toBeFalse();
    expect(component.aplicacionesFiltradas.length).toBe(6);
    expect(component.aplicacionesFiltradas.some(a=>a.id==='dashboard')).toBeFalse();
    expect(component.aplicacionesFiltradas.some(a=>a.id==='clientes')).toBeFalse();
    expect(component.aplicacionesFiltradas.some(a=>a.id==='reservas')).toBeFalse();
    component.grupoApp='Sistema';
    expect(component.aplicacionesFiltradas.every(a=>a.grupo==='Sistema')).toBeTrue();
    component.grupoApp='';
    component.mostrarTodasAplicaciones=true;
    expect(component.aplicacionesFiltradas.length).toBe(44);
  });

  it('Tareas descarta la respuesta antigua de MySQL cuando se refresca dos veces',()=>{
    const a=new Subject<any[]>();
    const b=new Subject<any[]>();
    const api=(component as any).api;
    api.gymRegistros.and.returnValues(a.asObservable(),b.asObservable());
    component.cargarTareas();
    component.cargarTareas();
    b.next([{id:20,titulo:'Tarea actual',estado:'En curso'}]);
    a.next([{id:19,titulo:'Tarea antigua',estado:'Por hacer'}]);
    expect(component.tareas.map(x=>x.titulo)).toEqual(['Tarea actual']);
    expect(component.cargandoTareas).toBeFalse();
  });

  it('Tareas no confunde un error de MySQL con datos antiguos todavía cargados',()=>{
    const api=(component as any).api;
    component.tareas=[{id:3,titulo:'Tarea de ayer'}];
    api.gymRegistros.and.returnValue(throwError(()=>({status:500})));
    component.cargarTareas();
    expect(component.tareas).toEqual([]);
    expect(component.cargandoTareas).toBeFalse();
    expect(component.errorTareas).toContain('MySQL');
  });

  it('Calendario ignora respuestas atrasadas y muestra un error sin eventos ficticios',()=>{
    const api=(component as any).api;
    const vieja=new Subject<any[]>();
    const nueva=new Subject<any[]>();
    api.gymRegistros.and.returnValues(vieja.asObservable(),nueva.asObservable());
    component.cargarEventos();
    component.cargarEventos();
    nueva.next([{id:2,titulo:'Evento correcto',fecha:'2026-11-19'}]);
    vieja.next([{id:1,titulo:'Evento anterior',fecha:'2026-11-18'}]);
    expect(component.eventos.map(e=>e.titulo)).toEqual(['Evento correcto']);
    api.gymRegistros.and.returnValue(throwError(()=>new Error('Sin base de datos')));
    component.cargarEventos();
    expect(component.eventos).toEqual([]);
    expect(component.errorEventos).toContain('No se pudieron');
  });

  it('el botón Actualizar solicita los datos actuales al dashboard principal', () => {
    spyOn(component.refrescarDatos,'emit');
    component.modulo='tablas-admin';
    component.refrescar();
    expect(component.refrescarDatos.emit).toHaveBeenCalledTimes(1);
  });

  it('abre Calendario desde las pestañas sin cambiar el tema ni duplicar pantallas', () => {
    spyOn(component.navegar,'emit');
    component.abrirVista('calendario-admin');
    expect(component.navegar.emit).toHaveBeenCalledOnceWith('calendario-admin');
  });
});
