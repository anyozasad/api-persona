import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { stabilityInterceptor } from './stability.interceptor';

describe('stabilityInterceptor', () => {
  let http: HttpClient;
  let mock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([stabilityInterceptor])),
        provideHttpClientTesting()
      ]
    });
    http = TestBed.inject(HttpClient);
    mock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => mock.verify());

  it('reintenta una consulta GET si la API responde con un error temporal', fakeAsync(() => {
    let resultado: any = null;
    http.get('/api/mi-cuenta/resumen').subscribe(r => resultado = r);

    mock.expectOne('/api/mi-cuenta/resumen')
      .flush({ mensaje: 'Temporal' }, { status: 503, statusText: 'Service Unavailable' });

    tick(250);

    mock.expectOne('/api/mi-cuenta/resumen')
      .flush({ ok: true });

    expect(resultado).toEqual({ ok: true });
  }));

  it('no repite operaciones POST para evitar duplicados', () => {
    let status = 0;
    http.post('/api/mi-cuenta/reservas', { id_clase: 1 })
      .subscribe({ error: e => status = e.status });

    mock.expectOne('/api/mi-cuenta/reservas')
      .flush({ mensaje: 'Error' }, { status: 503, statusText: 'Service Unavailable' });

    expect(status).toBe(503);
  });

  it('no reintenta errores de validacion del usuario', () => {
    let status = 0;
    http.get('/api/mi-cuenta/resumen')
      .subscribe({ error: e => status = e.status });

    mock.expectOne('/api/mi-cuenta/resumen')
      .flush({ mensaje: 'Validacion' }, { status: 422, statusText: 'Unprocessable Entity' });

    expect(status).toBe(422);
  });
});
