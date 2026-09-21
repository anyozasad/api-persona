import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styleUrls: ['../mallqui-login.css'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="login-page recovery-page">
      <section class="login-visual recovery-visual">
        <div class="login-overlay"></div>
        <div class="login-message">
          <span class="login-kicker">RECUPERACIÓN SEGURA</span>
          <h1>RECUPERA.<br><strong>TU CUENTA.</strong><br>CONTINÚA.</h1>
          <p>Usa el DNI con el que creaste tu cuenta. El sistema buscará tu usuario y enviará un código al correo registrado.</p>

          <div class="recovery-steps-visual">
            <span><b>1</b> Ingresa tu DNI</span>
            <span><b>2</b> Confirma el correo registrado</span>
            <span><b>3</b> Crea tu nueva contraseña</span>
          </div>
        </div>
      </section>

      <section class="login-panel recovery-panel">
        <a routerLink="/login" class="login-back">← Volver al login</a>

        <div class="login-card recovery-card">
          <div class="login-heading">
            <span class="login-icon login-company-logo" aria-hidden="true">
              <img src="/assets/mallqui-logo.svg" alt="">
            </span>
            <div>
              <h2>Recuperar contraseña</h2>
              <p *ngIf="paso===1">Busca tu cuenta con el DNI registrado.</p>
              <p *ngIf="paso===2">Verifica el código y crea una nueva contraseña.</p>
              <p *ngIf="paso===3">Tu contraseña fue actualizada correctamente.</p>
            </div>
          </div>

          <div class="recovery-progress">
            <span [class.active]="paso>=1"><b>1</b><small>Buscar cuenta</small></span>
            <i [class.active]="paso>=2"></i>
            <span [class.active]="paso>=2"><b>2</b><small>Nueva contraseña</small></span>
            <i [class.active]="paso>=3"></i>
            <span [class.active]="paso>=3"><b>3</b><small>Listo</small></span>
          </div>

          <form *ngIf="paso===1" (ngSubmit)="buscarCuenta()" #dniForm="ngForm" class="recovery-form">
            <label>
              DNI registrado
              <div class="input-wrap">
                <span>▣</span>
                <input
                  type="text"
                  name="dni"
                  [(ngModel)]="dni"
                  inputmode="numeric"
                  maxlength="15"
                  autocomplete="off"
                  placeholder="Ingresa tu DNI"
                  required>
              </div>
            </label>

            <div class="recovery-help">
              <span>?</span>
              <p><b>¿Cómo funciona?</b> Buscaremos la cuenta asociada a tu DNI. Por seguridad, el correo se mostrará parcialmente oculto.</p>
            </div>

            <p *ngIf="error" class="login-error">{{error}}</p>

            <button class="login-submit" type="submit" [disabled]="dniForm.invalid || cargando">
              <span>{{cargando ? 'Buscando cuenta...' : 'Buscar mi cuenta'}}</span><b>→</b>
            </button>
          </form>

          <form *ngIf="paso===2" (ngSubmit)="restablecer()" #resetForm="ngForm" class="recovery-form">
            <div class="recovery-account-found">
              <span>✓</span>
              <div>
                <small>CUENTA ENCONTRADA</small>
                <b>{{correoEnmascarado}}</b>
                <p>Enviamos un código de 6 dígitos a este correo.</p>
              </div>
            </div>

            <div *ngIf="codigoDesarrollo" class="recovery-dev-code">
              <span>MODO LOCAL</span>
              <p>Como el correo está en modo desarrollo, usa este código para probar:</p>
              <b>{{codigoDesarrollo}}</b>
            </div>

            <label>
              Código de verificación
              <div class="input-wrap recovery-code-input">
                <span>#</span>
                <input
                  type="text"
                  name="codigo"
                  [(ngModel)]="codigo"
                  inputmode="numeric"
                  maxlength="6"
                  autocomplete="one-time-code"
                  placeholder="000000"
                  required>
              </div>
            </label>

            <label>
              Nueva contraseña
              <div class="input-wrap">
                <span>⌑</span>
                <input
                  [type]="mostrar ? 'text' : 'password'"
                  name="password"
                  [(ngModel)]="password"
                  minlength="8"
                  autocomplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  required>
                <button type="button" class="show-password" (click)="mostrar=!mostrar">{{mostrar?'Ocultar':'Ver'}}</button>
              </div>
            </label>

            <label>
              Confirmar nueva contraseña
              <div class="input-wrap">
                <span>⌑</span>
                <input
                  [type]="mostrar ? 'text' : 'password'"
                  name="confirmacion"
                  [(ngModel)]="confirmacion"
                  minlength="8"
                  autocomplete="new-password"
                  placeholder="Repite la contraseña"
                  required>
              </div>
            </label>

            <p *ngIf="error" class="login-error">{{error}}</p>
            <p *ngIf="mensaje" class="login-success">{{mensaje}}</p>

            <div class="recovery-actions">
              <button type="button" class="recovery-back-button" (click)="volverABuscar()">← Cambiar DNI</button>
              <button class="login-submit" type="submit" [disabled]="resetForm.invalid || cargando">
                <span>{{cargando ? 'Actualizando...' : 'Crear nueva contraseña'}}</span><b>→</b>
              </button>
            </div>
          </form>

          <div *ngIf="paso===3" class="recovery-success-state">
            <span class="recovery-success-icon">✓</span>
            <h3>Contraseña actualizada</h3>
            <p>Ya puedes ingresar con tu correo y tu nueva contraseña.</p>
            <button class="login-submit" type="button" (click)="irLogin()">
              <span>Ir a iniciar sesión</span><b>→</b>
            </button>
          </div>
        </div>
      </section>
    </div>
  `
})
export class ResetPasswordComponent {
  paso = 1;
  dni = '';
  correoEnmascarado = '';
  challenge = '';
  codigo = '';
  codigoDesarrollo = '';
  password = '';
  confirmacion = '';
  mostrar = false;
  cargando = false;
  error = '';
  mensaje = '';

  constructor(private router: Router, private auth: AuthService) {}

  buscarCuenta(): void {
    this.error = '';
    this.mensaje = '';

    const dni = this.dni.replace(/\D/g, '');

    if (dni.length < 8) {
      this.error = 'Ingresa un DNI válido.';
      return;
    }

    this.cargando = true;
    this.auth.buscarRecuperacionPorDni(dni).subscribe({
      next: res => {
        this.cargando = false;
        this.correoEnmascarado = res.correo;
        this.challenge = res.challenge;
        this.codigoDesarrollo = res.codigo_desarrollo ?? '';
        this.paso = 2;
        this.mensaje = res.mensaje;
      },
      error: err => {
        this.cargando = false;
        this.error = this.extraerError(err, 'No pudimos buscar la cuenta asociada al DNI.');
      }
    });
  }

  restablecer(): void {
    this.error = '';
    this.mensaje = '';

    if (!/^\d{6}$/.test(this.codigo.trim())) {
      this.error = 'Ingresa el código de 6 dígitos.';
      return;
    }

    if (this.password.length < 8) {
      this.error = 'La nueva contraseña debe tener al menos 8 caracteres.';
      return;
    }

    if (this.password !== this.confirmacion) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    this.cargando = true;
    this.auth.restablecerConDni(this.challenge, this.codigo.trim(), this.password).subscribe({
      next: res => {
        this.cargando = false;
        this.mensaje = res.mensaje;
        this.paso = 3;
      },
      error: err => {
        this.cargando = false;
        this.error = this.extraerError(err, 'No se pudo cambiar la contraseña.');
      }
    });
  }

  volverABuscar(): void {
    this.paso = 1;
    this.challenge = '';
    this.codigo = '';
    this.codigoDesarrollo = '';
    this.password = '';
    this.confirmacion = '';
    this.error = '';
    this.mensaje = '';
  }

  irLogin(): void {
    void this.router.navigate(['/login']);
  }

  private extraerError(err: any, fallback: string): string {
    if (err?.status === 429) {
      return 'Hiciste demasiados intentos. Espera unos minutos y vuelve a intentarlo.';
    }

    const errors = err?.error?.errors;
    if (errors && typeof errors === 'object') {
      const first = Object.values(errors)[0];
      if (Array.isArray(first) && first.length) return String(first[0]);
    }

    return err?.error?.mensaje ?? err?.error?.message ?? fallback;
  }
}
