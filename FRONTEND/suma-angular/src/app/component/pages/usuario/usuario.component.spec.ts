import { of, Subject, throwError } from 'rxjs';
import { UsuarioComponent } from './usuario.component';

describe('Portal del cliente - sincronización real con MySQL', () => {
  let component: UsuarioComponent;
  let api: jasmine.SpyObj<any>;

  beforeEach(() => {
    api = jasmine.createSpyObj('GymApiService', ['actualizarPerfilCliente']);
    component = new UsuarioComponent(api, {} as any, {} as any, {} as any);
    component.perfil = {
      nombres: 'Socio',
      enfoque_entrenamiento: 'Cardiovascular',
      nivel_entrenamiento: 'Principiante'
    };
    component.enfoqueInicioSeleccionado = 'Cardiovascular';
    component.nivelEntrenamiento = 'Principiante';
  });

  it('no marca como guardado el objetivo si la BD de Laravel falla', () => {
    api.actualizarPerfilCliente.and.returnValue(throwError(() => ({
      status: 503, error: { mensaje: 'MySQL sin conexión' }
    })));
    spyOn(component, 'abrirModulo');
    spyOn(component, 'ok');

    component.abrirEnfoqueEntrenamiento('Masa muscular');

    expect(component.enfoqueInicioSeleccionado).toBe('Cardiovascular');
    expect(component.perfil.enfoque_entrenamiento).toBe('Cardiovascular');
    expect(component.errorCasa).toContain('MySQL sin conexión');
    expect(component.ok).not.toHaveBeenCalled();
    expect(component.abrirModulo).not.toHaveBeenCalled();
    expect(component.guardandoPreferenciaEntrenamiento).toBeFalse();
  });

  it('no muestra otro nivel si MySQL rechazó el cambio', () => {
    api.actualizarPerfilCliente.and.returnValue(throwError(() => ({
      status: 503, error: { mensaje: 'No fue posible guardar el nivel' }
    })));
    component.seleccionarNivelEntrenamiento('Avanzado');
    expect(component.nivelEntrenamiento).toBe('Principiante');
    expect(component.perfil.nivel_entrenamiento).toBe('Principiante');
    expect(component.errorCasa).toContain('No fue posible guardar');
  });

  it('usa los datos devueltos por Laravel después de confirmar la actualización', () => {
    const pendiente = new Subject<any>();
    api.actualizarPerfilCliente.and.returnValue(pendiente.asObservable());
    spyOn(component, 'abrirModulo');
    spyOn(component, 'ok');
    component.seleccionarNivelEntrenamiento('Intermedio');

    expect(component.nivelEntrenamiento).toBe('Principiante');
    expect(component.guardandoPreferenciaEntrenamiento).toBeTrue();

    pendiente.next({cliente: {
      ...component.perfil, nivel_entrenamiento: 'Intermedio'
    }});
    pendiente.complete();

    expect(component.nivelEntrenamiento).toBe('Intermedio');
    expect(component.perfil.nivel_entrenamiento).toBe('Intermedio');
    expect(component.guardandoPreferenciaEntrenamiento).toBeFalse();
    expect(component.ok).toHaveBeenCalled();
  });
});
