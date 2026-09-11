import { Routes } from '@angular/router';
import { LandingComponent } from './landing.component';
import { LoginComponent } from './login.component';
import { RegisterComponent } from './register.component';
import { ResetPasswordComponent } from './reset-password.component';
import { UsuarioComponent } from './usuario.component';
import { AdminComponent } from './admin.component';
import { AdminIntegradoComponent } from './admin-integrado.component';
import { ProductosComponent } from './pages/productos/productos';
import { authGuard, logoutOnLoginGuard, roleGuard } from './auth.guard';

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
