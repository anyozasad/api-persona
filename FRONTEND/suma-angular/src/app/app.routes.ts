import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { UsuarioComponent } from './pages/usuario/usuario.component';
import { AdminComponent } from './pages/admin/admin.component';
import { AdminIntegradoComponent } from './pages/admin/admin-integrado.component';
import { ProductosComponent } from './pages/productos/productos';
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
  { path: '**', redirectTo: '' }
];
