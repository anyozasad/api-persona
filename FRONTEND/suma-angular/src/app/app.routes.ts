import { Routes } from '@angular/router';
import { LandingComponent } from './component/pages/landing/landing.component';
import { PublicPageComponent } from './component/pages/public/public-page.component';
import { LoginComponent } from './component/pages/login/login.component';
import { RegisterComponent } from './component/pages/register/register.component';
import { ResetPasswordComponent } from './component/pages/reset-password/reset-password.component';
import { UsuarioComponent } from './component/pages/usuario/usuario.component';
import { EntrenadorPanelComponent } from './component/pages/panel-entrenador/entrenador-panel.component';
import { AdminComponent } from './component/pages/admin/admin.component';
import { AdminIntegradoComponent } from './component/pages/admin/admin-integrado.component';
import { ProductosComponent } from './component/pages/productos/productos';
import { Membresias } from './component/pages/membresias/membresias';
import { Clientes } from './component/pages/clientes/clientes';
import { Entrenadores } from './component/pages/entrenadores/entrenadores';
import { Clases } from './component/pages/clases/clases';
import { Rutinas } from './component/pages/rutinas/rutinas';
import { Asistencias } from './component/pages/asistencias/asistencias';
import { Reservas } from './component/pages/reservas/reservas';
import { Categorias } from './component/pages/categorias/categorias';
import { Proveedores } from './component/pages/proveedores/proveedores';
import { Compras } from './component/pages/compras/compras';
import { Ventas } from './component/pages/ventas/ventas';
import { Caja } from './component/pages/caja/caja';
import { Kardex } from './component/pages/kardex/kardex';
import { Usuarios } from './component/pages/usuarios/usuarios';
import { Auditoria } from './component/pages/auditoria/auditoria';
import { Reportes } from './component/pages/reportes/reportes';
import { Pagos } from './component/pages/pagos/pagos';
import { authGuard, logoutOnLoginGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'nosotros', component: PublicPageComponent, data: { pagina: 'nosotros' } },
  { path: 'clases-gym', component: PublicPageComponent, data: { pagina: 'clases' } },
  { path: 'planes', component: PublicPageComponent, data: { pagina: 'planes' } },
  { path: 'galeria', component: PublicPageComponent, data: { pagina: 'galeria' } },
  { path: 'contacto', component: PublicPageComponent, data: { pagina: 'contacto' } },
  { path: 'login', component: LoginComponent, canActivate: [logoutOnLoginGuard] },
  { path: 'registro', component: RegisterComponent },
  { path: 'restablecer', component: ResetPasswordComponent },
  { path: 'usuario', component: UsuarioComponent, canActivate: [authGuard, roleGuard(['Cliente'])] },
  { path: 'entrenador', component: EntrenadorPanelComponent, canActivate: [authGuard, roleGuard(['Entrenador'])] },
  { path: 'admin', component: AdminIntegradoComponent, canActivate: [authGuard, roleGuard(['Administrador'])] },
  { path: 'admin-diseno', component: AdminComponent, canActivate: [authGuard, roleGuard(['Administrador'])] },
  { path: 'productos', component: ProductosComponent, canActivate: [authGuard, roleGuard(['Administrador'])] },
  { path: 'membresias', component: Membresias, canActivate: [authGuard, roleGuard(['Administrador'])] },
  { path: 'clientes', component: Clientes, canActivate: [authGuard, roleGuard(['Administrador'])] },
  { path: 'entrenadores', component: Entrenadores, canActivate: [authGuard, roleGuard(['Administrador'])] },
  { path: 'clases', component: Clases, canActivate: [authGuard, roleGuard(['Administrador'])] },
  { path: 'rutinas', component: Rutinas, canActivate: [authGuard, roleGuard(['Administrador'])] },
  { path: 'asistencias', component: Asistencias, canActivate: [authGuard, roleGuard(['Administrador'])] },
  { path: 'reservas', component: Reservas, canActivate: [authGuard, roleGuard(['Administrador'])] },
  { path: 'categorias', component: Categorias, canActivate: [authGuard, roleGuard(['Administrador'])] },
  { path: 'proveedores', component: Proveedores, canActivate: [authGuard, roleGuard(['Administrador'])] },
  { path: 'compras', component: Compras, canActivate: [authGuard, roleGuard(['Administrador'])] },
  { path: 'ventas', component: Ventas, canActivate: [authGuard, roleGuard(['Administrador'])] },
  { path: 'caja', component: Caja, canActivate: [authGuard, roleGuard(['Administrador'])] },
  { path: 'kardex', component: Kardex, canActivate: [authGuard, roleGuard(['Administrador'])] },
  { path: 'usuarios', component: Usuarios, canActivate: [authGuard, roleGuard(['Administrador'])] },
  { path: 'auditoria', component: Auditoria, canActivate: [authGuard, roleGuard(['Administrador'])] },
  { path: 'reportes', component: Reportes, canActivate: [authGuard, roleGuard(['Administrador'])] },
  { path: 'pagos', component: Pagos, canActivate: [authGuard, roleGuard(['Administrador'])] },
  { path: '**', redirectTo: '' }
];
