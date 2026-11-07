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
  { path: 'productos', redirectTo: 'admin', pathMatch: 'full' },
  { path: 'membresias', redirectTo: 'admin', pathMatch: 'full' },
  { path: 'clientes', redirectTo: 'admin', pathMatch: 'full' },
  { path: 'entrenadores', redirectTo: 'admin', pathMatch: 'full' },
  { path: 'clases', redirectTo: 'admin', pathMatch: 'full' },
  { path: 'rutinas', redirectTo: 'admin', pathMatch: 'full' },
  { path: 'asistencias', redirectTo: 'admin', pathMatch: 'full' },
  { path: 'reservas', redirectTo: 'admin', pathMatch: 'full' },
  { path: 'categorias', redirectTo: 'admin', pathMatch: 'full' },
  { path: 'proveedores', redirectTo: 'admin', pathMatch: 'full' },
  { path: 'compras', redirectTo: 'admin', pathMatch: 'full' },
  { path: 'ventas', redirectTo: 'admin', pathMatch: 'full' },
  { path: 'caja', redirectTo: 'admin', pathMatch: 'full' },
  { path: 'kardex', redirectTo: 'admin', pathMatch: 'full' },
  { path: 'usuarios', redirectTo: 'admin', pathMatch: 'full' },
  { path: 'auditoria', redirectTo: 'admin', pathMatch: 'full' },
  { path: 'reportes', redirectTo: 'admin', pathMatch: 'full' },
  { path: 'pagos', redirectTo: 'admin', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];
