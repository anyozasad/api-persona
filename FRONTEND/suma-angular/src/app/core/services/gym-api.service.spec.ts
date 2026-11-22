import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GymApiService } from './gym-api.service';

describe('GymApiService - integridad de datos entre administrador y cliente', () => {
  let servicio: GymApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GymApiService, provideHttpClient(), provideHttpClientTesting()]
    });
    servicio = TestBed.inject(GymApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  const responderConsultas = (falla: string | null = null, estado = 503) => {
    const peticiones = http.match(req => req.method === 'GET');
    expect(peticiones.length).toBe(12);
    peticiones.forEach(req => {
      if (req.request.url === falla) {
        req.flush({mensaje: 'Esquema de MySQL incompleto'}, {
          status: estado, statusText: 'Server Error'
        });
        return;
      }
      const datos: Record<string, any> = {
        '/api/mi-cuenta/resumen': {cliente: {id_cliente: 5}},
        '/api/mi-cuenta/perfil': {id_cliente: 5, nombres: 'Socio'},
        '/api/mi-cuenta/membresia': {actual: null, historial: []},
        '/api/mi-cuenta/pagos': [{id_pago: 10, monto: 80}],
        '/api/mi-cuenta/rutinas': [],
        '/api/mi-cuenta/asistencias': [],
        '/api/mi-cuenta/compras': [],
        '/api/mi-cuenta/productos': [],
        '/api/mi-cuenta/reservas': [],
        '/api/clases': [],
        '/api/membresias': [],
        '/api/informacion-gym': {nombre_gimnasio: 'Mallqui Gym'}
      };
      req.flush(datos[req.request.url]);
    });
  };

  it('no confunde fallo en pagos con inexistencia de pagos, y conserva lo disponible', () => {
    let respuesta: any;
    servicio.cargarPortalCliente().subscribe(r => respuesta = r);
    responderConsultas('/api/mi-cuenta/pagos');

    expect(respuesta.perfil.nombres).toBe('Socio');
    expect(respuesta.resumen.cliente.id_cliente).toBe(5);
    expect(respuesta.erroresModulos).toEqual(['Pagos']);
    expect(respuesta.pagos).toEqual([]);
  });

  it('no muestra errores de MySQL cuando todos los datos están confirmados', () => {
    let respuesta: any;
    servicio.cargarPortalCliente().subscribe(r => respuesta = r);
    responderConsultas();

    expect(respuesta.erroresModulos).toEqual([]);
    expect(respuesta.pagos[0].id_pago).toBe(10);
  });

  it('no disfraza el vencimiento de sesión como una lista vacía', () => {
    let fallo: any;
    servicio.cargarPortalCliente().subscribe({error: e => fallo = e});
    responderConsultas('/api/mi-cuenta/perfil', 401);
    expect(fallo.status).toBe(401);
  });
});
