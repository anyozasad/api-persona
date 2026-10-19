import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styleUrls: ['../mallqui-login.css'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="mq-login-screen">
      <header class="mq-login-topbar">
        <div class="mq-login-nav-shell">
          <nav class="mq-login-menu" aria-label="Navegación principal">
            <a routerLink="/" fragment="inicio">INICIO</a>
            <a routerLink="/" fragment="entrenamiento">ENTRENAMIENTO</a>
            <a routerLink="/" fragment="entrenador">SOBRE MÍ</a>
            <a routerLink="/" fragment="gimnasio">GIMNASIO</a>
            <a routerLink="/clases-gym">RESERVAR SESIÓN</a>
            <a routerLink="/planes">PLANES Y PRECIOS</a>
            <a routerLink="/" fragment="contacto">CONTACTO</a>
          </nav>

          <div class="mq-login-current">
            <span class="mq-login-user-icon" aria-hidden="true">
              <span class="mq-login-user-head"></span>
              <span class="mq-login-user-body"></span>
            </span>
            <span>Login</span>
          </div>
        </div>
      </header>

      <main class="mq-login-hero">
        <div class="mq-login-hero-overlay"></div>

        <div class="mq-login-hero-copy">
          <p>ACCESO MALLQUI GYM</p>
          <h1>MALLQUI <strong>GYM</strong></h1>
          <span>ENTRENA CON PROPÓSITO. SUPERA TUS LÍMITES.</span>
        </div>

        <section class="mq-login-box" aria-label="Inicio de sesión">
          <div class="mq-login-box-head">
            <span class="mq-login-logo">
              <img src="/assets/mallqui-logo.svg" alt="Mallqui Gym">
            </span>
            <div>
              <p>BIENVENIDO</p>
              <h2>Inicia sesión</h2>
              <span>Continúa con tu entrenamiento.</span>
            </div>
          </div>

          <div *ngIf="planSeleccionado" class="mq-selected-plan">
            Plan seleccionado: <strong>{{ planSeleccionado }}</strong>
          </div>

          <form (ngSubmit)="ingresar()" #loginForm="ngForm">
            <label>
              Gmail
              <div class="mq-login-input">
                <span aria-hidden="true">✉</span>
                <input
                  type="email"
                  name="email"
                  [(ngModel)]="email"
                  placeholder="usuario@gmail.com"
                  autocomplete="email"
                  required>
              </div>
            </label>

            <label>
              Contraseña
              <div class="mq-login-input">
                <span aria-hidden="true">●</span>
                <input
                  [type]="mostrarPassword ? 'text' : 'password'"
                  name="password"
                  [(ngModel)]="password"
                  placeholder="Ingresa tu contraseña"
                  autocomplete="current-password"
                  required>
                <button type="button" class="mq-show-password" (click)="mostrarPassword = !mostrarPassword">
                  {{ mostrarPassword ? 'Ocultar' : 'Ver' }}
                </button>
              </div>
            </label>

            <div class="mq-login-options">
              <label class="mq-remember">
                <input type="checkbox" name="recordar" [(ngModel)]="recordar">
                <span>Recordarme</span>
              </label>

              <button type="button" class="mq-forgot" (click)="recuperarPassword()">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <p *ngIf="error" class="mq-login-error">{{ error }}</p>
            <p *ngIf="mensaje" class="mq-login-success">{{ mensaje }}</p>

            <button class="mq-login-submit" type="submit" [disabled]="loginForm.invalid || cargando">
              <span>{{ cargando ? 'Verificando...' : 'Iniciar sesión' }}</span>
              <b>→</b>
            </button>
          </form>

          <div class="mq-login-register">
            <div>
              <strong>¿Aún no tienes cuenta?</strong>
              <span>Crea tu cuenta y empieza a entrenar.</span>
            </div>
            <a routerLink="/registro">Crear cuenta →</a>
          </div>

          <a routerLink="/" class="mq-login-back">← Volver al inicio</a>
        </section>

        <div class="mq-login-dots" aria-hidden="true">
          <i></i><i class="active"></i><i></i>
        </div>
      </main>
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
  destinoSeleccionado = '';
  claseSeleccionada = '';
  fechaSeleccionada = '';
  servicioSeleccionado = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService
  ) {
    this.planSeleccionado = this.route.snapshot.queryParamMap.get('plan') ?? '';
    this.destinoSeleccionado = this.route.snapshot.queryParamMap.get('destino') ?? '';
    this.claseSeleccionada = this.route.snapshot.queryParamMap.get('clase') ?? '';
    this.fechaSeleccionada = this.route.snapshot.queryParamMap.get('fecha') ?? '';
    this.servicioSeleccionado = this.route.snapshot.queryParamMap.get('servicio') ?? '';
  }

  ingresar(): void {
    this.error = '';
    this.mensaje = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.error = 'Completa tu Gmail y contraseña.';
      return;
    }

    const login = this.email.trim().toLowerCase();

    this.cargando = true;
    this.auth.login(login, this.password, this.recordar).subscribe({
      next: res => {
        this.cargando = false;
        if (res.usuario.rol === 'Administrador') {
          void this.router.navigate(['/admin']);
          return;
        }
        if (res.usuario.rol === 'Cliente') {
          if (this.destinoSeleccionado === 'reservar' && (this.claseSeleccionada || this.servicioSeleccionado)) {
            const queryParams: Record<string, string> = {};
            if (this.claseSeleccionada) queryParams['clase'] = this.claseSeleccionada;
            if (this.servicioSeleccionado) queryParams['servicio'] = this.servicioSeleccionado;
            if (this.fechaSeleccionada) queryParams['fecha'] = this.fechaSeleccionada;
            void this.router.navigate(['/reservar'], { queryParams });
            return;
          }

          const queryParams: Record<string, string> = {};
          if (this.destinoSeleccionado) queryParams['modulo'] = this.destinoSeleccionado;
          if (this.planSeleccionado) queryParams['plan'] = this.planSeleccionado;

          void this.router.navigate(
            ['/usuario'],
            Object.keys(queryParams).length ? { queryParams } : undefined
          );
          return;
        }
        if (res.usuario.rol === 'Entrenador') {
          void this.router.navigate(['/entrenador']);
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

  recuperarPassword(): void {
    this.error = '';
    this.mensaje = '';
    void this.router.navigate(['/restablecer']);
  }

  private extraerError(err: any, fallback: string): string {
    if (err?.status === 429) {
      return 'Hiciste demasiados intentos. Espera un minuto y vuelve a intentarlo.';
    }
    const errors = err?.error?.errors;
    if (errors && typeof errors === 'object') {
      const first = Object.values(errors)[0];
      if (Array.isArray(first) && first.length) return String(first[0]);
    }
    return err?.error?.mensaje ?? err?.error?.message ?? fallback;
  }
}
