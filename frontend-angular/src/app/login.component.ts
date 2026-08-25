import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styleUrls: ['../mallqui-login.css'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="login-page">
      <section class="login-visual">
        <div class="login-overlay"></div>
        <a routerLink="/" class="login-brand" aria-label="Volver al inicio">
          <img src="assets/mallqui-logo.png" alt="Mallqui Gym">
        </a>
        <div class="login-message">
          <span class="login-kicker">MALLQUI GYM</span>
          <h1>ENTRENA.<br><strong>SUPÉRATE.</strong><br>AVANZA.</h1>
          <p>Tu progreso empieza con una decisión. Ingresa y continúa con tu rutina, clases y seguimiento.</p>
          <div class="login-benefits">
            <span>✓ Rutinas personalizadas</span>
            <span>✓ Seguimiento de progreso</span>
            <span>✓ Reservas y pagos</span>
          </div>
        </div>
      </section>

      <section class="login-panel">
        <a routerLink="/" class="login-back">← Volver al inicio</a>
        <div class="login-card">
          <div class="login-heading">
            <span class="login-icon">♙</span>
            <div>
              <h2>Bienvenido de nuevo</h2>
              <p>Ingresa a tu cuenta de Mallqui Gym</p>
            </div>
          </div>

          <div *ngIf="planSeleccionado" class="selected-plan">
            Plan seleccionado: <strong>{{ planSeleccionado }}</strong>
          </div>

          <form (ngSubmit)="ingresar()" #loginForm="ngForm">
            <label>
              Correo electrónico
              <div class="input-wrap">
                <span>✉</span>
                <input
                  type="email"
                  name="email"
                  [(ngModel)]="email"
                  placeholder="correo@ejemplo.com"
                  autocomplete="email"
                  required>
              </div>
            </label>

            <label>
              Contraseña
              <div class="input-wrap">
                <span>⌑</span>
                <input
                  [type]="mostrarPassword ? 'text' : 'password'"
                  name="password"
                  [(ngModel)]="password"
                  placeholder="Ingresa tu contraseña"
                  autocomplete="current-password"
                  required>
                <button type="button" class="show-password" (click)="mostrarPassword = !mostrarPassword">
                  {{ mostrarPassword ? 'Ocultar' : 'Ver' }}
                </button>
              </div>
            </label>

            <div class="login-options">
              <label class="remember"><input type="checkbox" name="recordar" [(ngModel)]="recordar"> Recordarme</label>
              <button type="button" class="text-button">¿Olvidaste tu contraseña?</button>
            </div>

            <p *ngIf="error" class="login-error">{{ error }}</p>

            <button class="login-submit" type="submit" [disabled]="loginForm.invalid">
              Iniciar sesión →
            </button>
          </form>

          <div class="login-divider"><span>o</span></div>

          <div class="login-help">
            <p><strong>¿Eres nuevo?</strong> Acércate a recepción para activar tu membresía.</p>
            <small>Para la demostración: un correo que contenga <b>admin</b> abre el panel administrador; cualquier otro correo abre el panel del usuario.</small>
          </div>
        </div>
      </section>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  recordar = false;
  mostrarPassword = false;
  error = '';
  planSeleccionado = '';

  constructor(private router: Router, private route: ActivatedRoute) {
    this.planSeleccionado = this.route.snapshot.queryParamMap.get('plan') ?? '';
  }

  ingresar(): void {
    this.error = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.error = 'Completa tu correo y contraseña.';
      return;
    }

    if (this.email.toLowerCase().includes('admin')) {
      this.router.navigate(['/admin']);
      return;
    }

    this.router.navigate(['/usuario']);
  }
}
