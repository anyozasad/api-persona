import { of } from 'rxjs';
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
    expect(component.aplicacionesFiltradas.length).toBe(44);
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
