import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({ selector: 'app-login', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './login.html', styleUrl: './login.css' })
export class LoginComponent {
  login = '';
  contrasena = '';
  cargando = false;
  error = '';
  constructor(private auth: AuthService, private router: Router) {}
  ingresar(): void {
    this.error = '';
    if (!this.login.trim() || !this.contrasena) { this.error = 'Ingresa tu usuario/correo y contraseña.'; return; }
    this.cargando = true;
    this.auth.login({ login: this.login.trim(), contrasena: this.contrasena }).subscribe({
      next: (r) => {
        this.cargando = false;
        if (r.usuario.rol !== 'Administrador') {
          this.auth.limpiarSesion();
          this.error = 'Este CRUD requiere un usuario Administrador.';
          return;
        }
        this.router.navigate(['/productos']);
      },
      error: (e) => {
        this.cargando = false;
        this.error = e?.error?.errors?.login?.[0] ?? e?.error?.mensaje ?? 'No se pudo iniciar sesión con Laravel.';
      }
    });
  }
}
