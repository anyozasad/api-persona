import { Routes } from '@angular/router';
import { LandingComponent } from './component/pages/landing/landing.component';
import { PublicPageComponent } from './component/pages/public/public-page.component';
import { LoginComponent } from './component/pages/login/login.component';
import { RegisterComponent } from './component/pages/register/register.component';
import { ResetPasswordComponent } from './component/pages/reset-password/reset-password.component';
import { UsuarioComponent } from './component/pages/usuario/usuario.component';
import { EntrenadorPanelComponent } from './component/pages/panel-entrenador/entrenador-panel.component';
import { AdminIntegradoComponent } from './component/pages/admin/admin-integrado.component';
import { CheckoutComponent } from './component/pages/checkout/checkout.component';
import { ReservarComponent } from './component/pages/reservar/reservar.component';
import { PlanesPublicComponent } from './component/pages/planes-public/planes-public.component';
import { ClasesPublicComponent } from './component/pages/clases-public/clases-public.component';
import { authGuard, logoutOnLoginGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'nosotros', component: PublicPageComponent, data: { pagina: 'nosotros' } },
  { path: 'clases-gym', component: ClasesPublicComponent },
  { path: 'planes', component: PlanesPublicComponent },
  { path: 'galeria', component: PublicPageComponent, data: { pagina: 'galeria' } },
  { path: 'contacto', component: PublicPageComponent, data: { pagina: 'contacto' } },
  { path: 'login', component: LoginComponent, canActivate: [logoutOnLoginGuard] },
  { path: 'registro', component: RegisterComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'reservar', component: ReservarComponent },
  { path: 'restablecer', component: ResetPasswordComponent },
  { path: 'usuario', component: UsuarioComponent, canActivate: [authGuard, roleGuard(['Cliente'])] },
  { path: 'entrenador', component: EntrenadorPanelComponent, canActivate: [authGuard, roleGuard(['Entrenador'])] },
  { path: 'admin', component: AdminIntegradoComponent, canActivate: [authGuard, roleGuard(['Administrador'])] },
  { path: 'admin-diseno', redirectTo: 'admin', pathMatch: 'full' },
  { path: 'verificacion-efsrt', component: AdminIntegradoComponent, canActivate: [authGuard, roleGuard(['Administrador'])], data: { seccion: 'verificacion-efsrt' } },
  { path: 'productos', component: AdminIntegradoComponent, canActivate: [authGuard, roleGuard(['Administrador'])], data: { seccion: 'productos' } },
  { path: 'membresias', component: AdminIntegradoComponent, canActivate: [authGuard, roleGuard(['Administrador'])], data: { seccion: 'membresias' } },
  { path: 'clientes', component: AdminIntegradoComponent, canActivate: [authGuard, roleGuard(['Administrador'])], data: { seccion: 'clientes' } },
  { path: 'entrenadores', component: AdminIntegradoComponent, canActivate: [authGuard, roleGuard(['Administrador'])], data: { seccion: 'entrenador' } },
  { path: 'clases', component: AdminIntegradoComponent, canActivate: [authGuard, roleGuard(['Administrador'])], data: { seccion: 'clases' } },
  { path: 'rutinas', component: AdminIntegradoComponent, canActivate: [authGuard, roleGuard(['Administrador'])], data: { seccion: 'rutinas' } },
  { path: 'asistencias', component: AdminIntegradoComponent, canActivate: [authGuard, roleGuard(['Administrador'])], data: { seccion: 'asistencias' } },
  { path: 'reservas', component: AdminIntegradoComponent, canActivate: [authGuard, roleGuard(['Administrador'])], data: { seccion: 'reservas' } },
  { path: 'categorias', component: AdminIntegradoComponent, canActivate: [authGuard, roleGuard(['Administrador'])], data: { seccion: 'categorias' } },
  { path: 'proveedores', component: AdminIntegradoComponent, canActivate: [authGuard, roleGuard(['Administrador'])], data: { seccion: 'proveedores' } },
  { path: 'compras', component: AdminIntegradoComponent, canActivate: [authGuard, roleGuard(['Administrador'])], data: { seccion: 'compras' } },
  { path: 'ventas', component: AdminIntegradoComponent, canActivate: [authGuard, roleGuard(['Administrador'])], data: { seccion: 'ventas' } },
  { path: 'caja', component: AdminIntegradoComponent, canActivate: [authGuard, roleGuard(['Administrador'])], data: { seccion: 'caja' } },
  { path: 'gastos', component: AdminIntegradoComponent, canActivate: [authGuard, roleGuard(['Administrador'])], data: { seccion: 'gastos' } },
  { path: 'configuracion', component: AdminIntegradoComponent, canActivate: [authGuard, roleGuard(['Administrador'])], data: { seccion: 'configuracion' } },
  { path: 'kardex', component: AdminIntegradoComponent, canActivate: [authGuard, roleGuard(['Administrador'])], data: { seccion: 'kardex' } },
  { path: 'usuarios', component: AdminIntegradoComponent, canActivate: [authGuard, roleGuard(['Administrador'])], data: { seccion: 'usuarios' } },
  { path: 'auditoria', component: AdminIntegradoComponent, canActivate: [authGuard, roleGuard(['Administrador'])], data: { seccion: 'auditoria' } },
  { path: 'reportes', component: AdminIntegradoComponent, canActivate: [authGuard, roleGuard(['Administrador'])], data: { seccion: 'reportes-admin' } },
  { path: 'pagos', component: AdminIntegradoComponent, canActivate: [authGuard, roleGuard(['Administrador'])], data: { seccion: 'pagos' } },
  { path: '**', redirectTo: '' }
];
