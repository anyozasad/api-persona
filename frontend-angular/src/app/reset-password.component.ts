import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-reset-password',
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
          <h1>RECUPERA.<br><strong>TU ACCESO.</strong><br>CONTINÚA.</h1>
          <p>Restablece tu contraseña de forma segura y vuelve a ingresar a tu cuenta.</p>
        </div>
      </section>

      <section class="login-panel">
        <a routerLink="/login" class="login-back">← Volver al login</a>
        <div class="login-card">
          <div class="login-heading">
            <span class="login-icon login-company-logo" aria-hidden="true"><img src="/assets/mallqui-logo.svg" alt=""></span>
            <div><h2>Restablecer contraseña</h2><p>Ingresa una nueva contraseña para tu cuenta.</p></div>
          </div>

          <form (ngSubmit)="restablecer()" #form="ngForm">
            <label>
              Correo electrónico
              <div class="input-wrap"><span>✉</span><input type="email" name="correo" [(ngModel)]="correo" required></div>
            </label>
            <label>
              Nueva contraseña
              <div class="input-wrap"><span>⌑</span><input [type]="mostrar ? 'text' : 'password'" name="password" [(ngModel)]="password" minlength="8" required><button type="button" class="show-password" (click)="mostrar=!mostrar">{{mostrar?'Ocultar':'Ver'}}</button></div>
            </label>
            <label>
              Confirmar contraseña
              <div class="input-wrap"><span>⌑</span><input [type]="mostrar ? 'text' : 'password'" name="confirmacion" [(ngModel)]="confirmacion" minlength="8" required></div>
            </label>

            <p *ngIf="error" class="login-error">{{error}}</p>
            <p *ngIf="mensaje" class="login-success">{{mensaje}}</p>

            <button class="login-submit" type="submit" [disabled]="form.invalid || cargando">
              <span>{{cargando ? 'Actualizando...' : 'Cambiar contraseña'}}</span><b>→</b>
            </button>
          </form>
        </div>
      </section>
    </div>
  `
})
export class ResetPasswordComponent {
  correo = '';
  token = '';
  password = '';
  confirmacion = '';
  mostrar = false;
  cargando = false;
  error = '';
  mensaje = '';

  constructor(private route: ActivatedRoute, private router: Router, private auth: AuthService) {
    this.correo = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  restablecer(): void {
    this.error = '';
    this.mensaje = '';

    if (!this.token) {
      this.error = 'El enlace de recuperación no es válido o está incompleto.';
      return;
    }
    if (this.password.length < 8) {
      this.error = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }
    if (this.password !== this.confirmacion) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    this.cargando = true;
    this.auth.restablecerContrasena(this.correo, this.token, this.password).subscribe({
      next: res => {
        this.cargando = false;
        this.mensaje = res.mensaje;
        setTimeout(() => void this.router.navigate(['/login']), 1200);
      },
      error: err => {
        this.cargando = false;
        this.error = err?.error?.message ?? err?.error?.mensaje ?? 'No se pudo restablecer la contraseña.';
      }
    });
  }
}
