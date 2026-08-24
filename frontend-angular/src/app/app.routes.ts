import { Routes } from '@angular/router';
import { LandingComponent } from './landing.component';
import { UsuarioComponent } from './usuario.component';
import { AdminComponent } from './admin.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'usuario', component: UsuarioComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' }
];
