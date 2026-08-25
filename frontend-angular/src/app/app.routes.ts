import { Routes } from '@angular/router';
import { LandingComponent } from './landing.component';
import { LoginComponent } from './login.component';
import { UsuarioComponent } from './usuario.component';
import { AdminComponent } from './admin.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'usuario', component: UsuarioComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' }
];
