import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styleUrls: ['../mallqui-register.css'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="register-page">
      <section class="register-visual">
        <div class="register-overlay"></div>
        <a routerLink="/" class="register-brand" aria-label="Volver al inicio">
          <img src="assets/mallqui-logo.png" alt="Mallqui Gym">
        </a>
        <div class="register-message">
          <span class="register-kicker">ÚNETE A MALLQUI GYM</span>
          <h1>EMPIEZA HOY.<br><strong>CAMBIA TU RUTINA.</strong></h1>
          <p>Crea tu cuenta para reservar clases, revisar tus rutinas, controlar tus pagos y seguir tu progreso.</p>
          <div class="register-benefits">
            <span>✓ Perfil personalizado</span>
            <span>✓ Clases y reservas</span>
            <span>✓ Progreso y asistencia</span>
          </div>
        </div>
      </section>

      <section class="register-panel">
        <a routerLink="/login" class="register-back">← Ya tengo una cuenta</a>
        <div class="register-card">
          <div class="register-heading">
            <span class="register-icon">＋</span>
            <div>
              <h2>Crea tu cuenta</h2>
              <p>Empieza tu experiencia en Mallqui Gym</p>
            </div>
          </div>

          <div class="register-socials">
            <button type="button" class="social-button google" (click)="socialRegistro('Google')">
              <span class="social-mark google-mark">G</span>
              Continuar con Google
            </button>
            <button type="button" class="social-button facebook" (click)="socialRegistro('Facebook')">
              <span class="social-mark facebook-mark">f</span>
              Continuar con Facebook
            </button>
          </div>

          <div class="register-divider"><span>o crea tu cuenta con correo</span></div>

          <form (ngSubmit)="registrar()" #registerForm="ngForm">
            <div class="register-row">
              <label>
                Nombres
                <div class="register-input-wrap"><span>♙</span><input name="nombre" [(ngModel)]="nombre" placeholder="Tu nombre" required></div>
              </label>
              <label>
                Apellidos
                <div class="register-input-wrap"><span>♙</span><input name="apellido" [(ngModel)]="apellido" placeholder="Tu apellido" required></div>
              </label>
            </div>

            <div class="register-row">
              <label>
                DNI
                <div class="register-input-wrap"><span>▣</span><input name="dni" [(ngModel)]="dni" placeholder="Tu DNI" maxlength="15" required></div>
              </label>
              <label>
                Correo electrónico
                <div class="register-input-wrap"><span>✉</span><input type="email" name="email" [(ngModel)]="email" placeholder="correo@ejemplo.com" required></div>
              </label>
            </div>

            <div class="register-row">
              <label>
                Contraseña
                <div class="register-input-wrap"><span>⌑</span><input [type]="mostrarPassword ? 'text' : 'password'" name="password" [(ngModel)]="password" placeholder="Mínimo 8 caracteres" required minlength="8"></div>
              </label>
              <label>
                Confirmar contraseña
                <div class="register-input-wrap"><span>⌑</span><input [type]="mostrarPassword ? 'text' : 'password'" name="confirmarPassword" [(ngModel)]="confirmarPassword" placeholder="Repite tu contraseña" required minlength="8"></div>
              </label>
            </div>

            <div class="register-options">
              <label class="terms"><input type="checkbox" name="terminos" [(ngModel)]="terminos" required> Acepto los términos y la política de privacidad.</label>
              <button type="button" class="show-register-password" (click)="mostrarPassword = !mostrarPassword">{{ mostrarPassword ? 'Ocultar contraseñas' : 'Mostrar contraseñas' }}</button>
            </div>

            <p *ngIf="error" class="register-error">{{ error }}</p>
            <p *ngIf="mensaje" class="register-success">{{ mensaje }}</p>

            <button class="register-submit" type="submit" [disabled]="registerForm.invalid || cargando">{{ cargando ? 'Creando cuenta...' : 'Crear mi cuenta →' }}</button>
          </form>

          <p class="register-login-link">¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión</a></p>
        </div>
      </section>
    </div>
  `
})
export class RegisterComponent {
  nombre = '';
  apellido = '';
  dni = '';
  email = '';
  password = '';
  confirmarPassword = '';
  terminos = false;
  mostrarPassword = false;
  cargando = false;
  error = '';
  mensaje = '';

  constructor(private router: Router, private auth: AuthService) {}

  registrar(): void {
    this.error = '';
    this.mensaje = '';

    if (this.password.length < 8) {
      this.error = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }

    if (this.password !== this.confirmarPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    const correo = this.email.trim().toLowerCase();
    const baseUsuario = correo.split('@')[0].replace(/[^a-z0-9._-]/g, '') || 'cliente';
    const nombreUsuario = `${baseUsuario}-${this.dni.trim()}`.slice(0, 80);

    this.cargando = true;
    this.auth.register({
      nombre_usuario: nombreUsuario,
      nombres: this.nombre.trim(),
      apellidos: this.apellido.trim(),
      dni: this.dni.trim(),
      correo,
      contrasena: this.password,
    }).subscribe({
      next: () => {
        this.cargando = false;
        this.mensaje = 'Cuenta creada correctamente. Ingresando a tu panel...';
        setTimeout(() => void this.router.navigate(['/usuario']), 650);
      },
      error: err => {
        this.cargando = false;
        this.error = this.extraerError(err, 'No se pudo crear la cuenta. Revisa los datos ingresados.');
      }
    });
  }

  socialRegistro(proveedor: string): void {
    this.error = `El registro con ${proveedor} requiere configurar las credenciales oficiales del proveedor.`;
    this.mensaje = '';
  }

  private extraerError(err: any, fallback: string): string {
    const errors = err?.error?.errors;
    if (errors && typeof errors === 'object') {
      const first = Object.values(errors)[0];
      if (Array.isArray(first) && first.length) return String(first[0]);
    }
    return err?.error?.mensaje ?? err?.error?.message ?? fallback;
  }
}
