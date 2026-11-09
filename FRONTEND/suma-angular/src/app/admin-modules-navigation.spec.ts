import { routes } from './app.routes';
import { AdminIntegradoComponent } from './component/pages/admin/admin-integrado.component';

describe('Mallqui Gym - enlaces administrativos reales', () => {
  const modulos: Record<string, string> = {
    productos: 'productos',
    clientes: 'clientes',
    pagos: 'pagos',
    reservas: 'reservas',
    membresias: 'membresias',
    entrenadores: 'entrenador',
    clases: 'clases',
    rutinas: 'rutinas',
    asistencias: 'asistencias',
    categorias: 'categorias',
    proveedores: 'proveedores',
    compras: 'compras',
    ventas: 'ventas',
    caja: 'caja',
    kardex: 'kardex',
    usuarios: 'usuarios',
    auditoria: 'auditoria',
    reportes: 'reportes-admin'
  };

  Object.entries(modulos).forEach(([ruta, seccion]) => {
    it('abre /' + ruta + ' en su módulo sin devolver al inicio', () => {
      const definicion = routes.find(r => r.path === ruta);
      expect(definicion).toBeTruthy();
      expect(definicion?.component).toBe(AdminIntegradoComponent);
      expect(definicion?.data?.['seccion']).toBe(seccion);
      expect(definicion?.redirectTo).toBeUndefined();
      expect(definicion?.canActivate?.length).toBe(2);
    });
  });

  it('protege el panel principal y no modifica su diseño', () => {
    const admin = routes.find(r => r.path === 'admin');
    expect(admin?.component).toBe(AdminIntegradoComponent);
    expect(admin?.canActivate?.length).toBe(2);
  });
});
