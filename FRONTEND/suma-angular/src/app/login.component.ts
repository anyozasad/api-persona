import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

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
            <span class="login-icon login-company-logo" aria-hidden="true">
              <img src="/assets/mallqui-logo.svg" alt="">
            </span>
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
              <button type="button" class="text-button" (click)="recuperarPassword()">¿Olvidaste tu contraseña?</button>
            </div>

            <p *ngIf="error" class="login-error">{{ error }}</p>
            <p *ngIf="mensaje" class="login-success">{{ mensaje }}</p>

            <button class="login-submit" type="submit" [disabled]="loginForm.invalid || cargando">
              <span>{{ cargando ? 'Verificando...' : 'Iniciar sesión' }}</span><b>→</b>
            </button>
          </form>

          <div class="login-divider social-divider"><span>o continúa con</span></div>

          <div class="login-socials">
            <button type="button" class="social-button google" (click)="socialLogin('Google')">
              <span class="social-mark google-mark">G</span>
              <span>Continuar con Google</span>
              <b>→</b>
            </button>
            <button type="button" class="social-button facebook" (click)="socialLogin('Facebook')">
              <span class="social-mark facebook-mark">f</span>
              <span>Continuar con Facebook</span>
              <b>→</b>
            </button>
          </div>

          <div class="login-register-box">
            <div>
              <strong>¿Aún no tienes cuenta?</strong>
              <span>Crea tu perfil y empieza a entrenar con nosotros.</span>
            </div>
            <a routerLink="/registro" class="create-account-button">Crear cuenta →</a>
          </div>

          <p class="login-demo-note">Acceso protegido con credenciales reales, sesión segura y permisos según el rol del usuario.</p>
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
  cargando = false;
  error = '';
  mensaje = '';
  planSeleccionado = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService
  ) {
    this.planSeleccionado = this.route.snapshot.queryParamMap.get('plan') ?? '';
  }

  ingresar(): void {
    this.error = '';
    this.mensaje = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.error = 'Completa tu correo y contraseña.';
      return;
    }

    this.cargando = true;
    this.auth.login(this.email.trim(), this.password, this.recordar).subscribe({
      next: res => {
        this.cargando = false;
        if (res.usuario.rol === 'Administrador') {
          void this.router.navigate(['/admin']);
          return;
        }
        if (res.usuario.rol === 'Cliente') {
          void this.router.navigate(['/usuario']);
          return;
        }

        this.auth.limpiarSesion();
        this.error = `El rol ${res.usuario.rol} todavía no tiene un panel web asignado.`;
      },
      error: err => {
        this.cargando = false;
        this.error = this.extraerError(err, 'No se pudo iniciar sesión. Verifica tus credenciales.');
      }
    });
  }

  socialLogin(proveedor: string): void {
    this.error = '';
    this.mensaje = '';
    this.error = `El acceso con ${proveedor} requiere configurar las credenciales oficiales del proveedor.`;
  }

  recuperarPassword(): void {
    this.error = '';
    this.mensaje = '';

    if (!this.email.trim()) {
      this.error = 'Escribe tu correo para recuperar tu contraseña.';
      return;
    }

    this.auth.solicitarRecuperacion(this.email.trim()).subscribe({
      next: res => this.mensaje = res.mensaje,
      error: err => this.error = this.extraerError(err, 'No se pudo procesar la recuperación de contraseña.')
    });
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
