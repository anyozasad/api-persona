import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { UsuarioComponent } from './pages/usuario/usuario.component';
import { AdminComponent } from './pages/admin/admin.component';
import { AdminIntegradoComponent } from './pages/admin/admin-integrado.component';
import { ProductosComponent } from './pages/productos/productos';
import { Membresias } from './pages/membresias/membresias';
import { Clientes } from './pages/clientes/clientes';
import { Entrenadores } from './pages/entrenadores/entrenadores';
import { Clases } from './pages/clases/clases';
import { Rutinas } from './pages/rutinas/rutinas';
import { Asistencias } from './pages/asistencias/asistencias';
import { Reservas } from './pages/reservas/reservas';
import { Categorias } from './pages/categorias/categorias';
import { Proveedores } from './pages/proveedores/proveedores';
import { Compras } from './pages/compras/compras';
import { Ventas } from './pages/ventas/ventas';
import { Caja } from './pages/caja/caja';
import { Kardex } from './pages/kardex/kardex';
import { Usuarios } from './pages/usuarios/usuarios';
import { Auditoria } from './pages/auditoria/auditoria';
import { Reportes } from './pages/reportes/reportes';
import { Pagos } from './pages/pagos/pagos';
import { authGuard, logoutOnLoginGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent, canActivate: [logoutOnLoginGuard] },
  { path: 'registro', component: RegisterComponent },
  { path: 'restablecer', component: ResetPasswordComponent },
  { path: 'usuario', component: UsuarioComponent, canActivate: [authGuard, roleGuard(['Cliente'])] },
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
