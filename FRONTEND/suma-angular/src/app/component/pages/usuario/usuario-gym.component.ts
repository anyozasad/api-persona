import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsuarioComponent } from './usuario.component';
import { GymApiService } from '../../../core/services/gym-api.service';

@Component({
  selector: 'app-usuario-gym',
  standalone: true,
  imports: [CommonModule, UsuarioComponent],
  template: `
    <ng-container *ngIf="verificando; else estadoTpl">
      <main class="gym-gate">
        <section class="gym-gate-card">
          <img src="assets/mallqui-logo.svg" alt="Mallqui Gym">
          <span class="gym-gate-kicker">MALLQUI GYM</span>
          <h1>Verificando tu ingreso...</h1>
          <p>Estamos confirmando que tu entrada al gimnasio esté registrada.</p>
          <div class="gym-loader"></div>
        </section>
      </main>
    </ng-container>

    <ng-template #estadoTpl>
      <app-usuario *ngIf="dentroGym"></app-usuario>

      <main *ngIf="!dentroGym" class="gym-gate">
        <section class="gym-gate-card gym-gate-blocked">
          <img src="assets/mallqui-logo.svg" alt="Mallqui Gym">
          <span class="gym-gate-kicker">PORTAL DEL CLIENTE · USO EN SEDE</span>
          <h1>Primero registra tu ingreso al gimnasio</h1>
          <p>
            Esta interfaz del cliente está preparada para funcionar <b>dentro de Mallqui Gym</b>.
            Acércate a recepción para que registren tu entrada. Después pulsa
            <b>Verificar ingreso</b>.
          </p>

          <div class="gym-flow">
            <article><span>1</span><div><b>Recepción</b><small>El administrador registra tu entrada.</small></div></article>
            <i>→</i>
            <article><span>2</span><div><b>Acceso</b><small>El sistema confirma que estás dentro.</small></div></article>
            <i>→</i>
            <article><span>3</span><div><b>Entrenamiento</b><small>Se habilitan rutinas, máquinas y progreso.</small></div></article>
          </div>

          <div *ngIf="error" class="gym-gate-error">{{error}}</div>

          <button type="button" class="gym-gate-button" (click)="verificarIngreso()">
            Verificar ingreso
            <span>→</span>
          </button>

          <small class="gym-gate-note">
            El acceso se valida con la asistencia abierta del día actual.
          </small>
        </section>
      </main>
    </ng-template>
  `,
  styles: [`
    :host{display:block;min-height:100vh;background:#07111f}
    .gym-gate{min-height:100vh;display:grid;place-items:center;padding:28px;background:
      radial-gradient(circle at 15% 20%,rgba(205,24,54,.18),transparent 32%),
      radial-gradient(circle at 85% 80%,rgba(26,107,181,.16),transparent 34%),
      linear-gradient(135deg,#050a11,#0a1728 55%,#07111f);font-family:Inter,"Segoe UI",Arial,sans-serif;color:#eef6fb}
    .gym-gate-card{width:min(780px,100%);padding:46px;border-radius:28px;border:1px solid rgba(255,255,255,.1);
      background:rgba(8,20,35,.92);box-shadow:0 30px 80px rgba(0,0,0,.35);text-align:center}
    .gym-gate-card>img{width:92px;height:92px;object-fit:contain;margin-bottom:12px}
    .gym-gate-kicker{display:block;color:#ff5974;font-size:11px;font-weight:900;letter-spacing:1.8px;margin-bottom:10px}
    h1{margin:0 0 14px;color:#fff;font-size:clamp(28px,4vw,48px);line-height:1.05}
    p{max-width:660px;margin:0 auto;color:#b9c9d8;font-size:15px;line-height:1.7}
    .gym-flow{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:12px;align-items:center;margin:34px 0}
    .gym-flow article{min-height:116px;padding:18px;border-radius:18px;background:#0d2036;border:1px solid rgba(255,255,255,.08);text-align:left}
    .gym-flow article>span{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#cf1f3e;color:#fff;font-weight:900;margin-bottom:10px}
    .gym-flow b,.gym-flow small{display:block}.gym-flow b{color:#fff;font-size:15px}.gym-flow small{margin-top:5px;color:#94aabc;line-height:1.45}
    .gym-flow>i{font-style:normal;color:#637d94;font-size:24px}
    .gym-gate-button{width:100%;border:0;border-radius:16px;padding:17px 20px;background:linear-gradient(135deg,#cf1f3e,#a80f2c);
      color:#fff;font-size:15px;font-weight:900;cursor:pointer;box-shadow:0 16px 30px rgba(207,31,62,.22)}
    .gym-gate-button span{float:right}.gym-gate-button:hover{filter:brightness(1.08)}
    .gym-gate-error{margin:0 0 16px;padding:12px 14px;border-radius:12px;background:rgba(255,83,111,.12);border:1px solid rgba(255,83,111,.24);color:#ff8297}
    .gym-gate-note{display:block;margin-top:14px;color:#70889d}
    .gym-loader{width:42px;height:42px;margin:26px auto 0;border:4px solid rgba(255,255,255,.12);border-top-color:#cf1f3e;border-radius:50%;animation:gymSpin .8s linear infinite}
    @keyframes gymSpin{to{transform:rotate(360deg)}}
    @media(max-width:700px){.gym-gate-card{padding:30px 20px}.gym-flow{grid-template-columns:1fr}.gym-flow>i{transform:rotate(90deg)}}
  `]
})
export class UsuarioGymComponent implements OnInit, OnDestroy {
  verificando = true;
  dentroGym = false;
  error = '';
  private temporizador: any = null;

  constructor(private api: GymApiService) {}

  ngOnInit(): void {
    this.verificarIngreso();
    // Mientras el cliente espera en recepción, el estado se actualiza solo.
    this.temporizador = setInterval(() => {
      if (!this.dentroGym) this.verificarIngreso(false);
    }, 8000);
  }

  ngOnDestroy(): void {
    if (this.temporizador) clearInterval(this.temporizador);
  }

  verificarIngreso(mostrarCarga = true): void {
    if (mostrarCarga) this.verificando = true;
    this.error = '';

    this.api.asistenciasCliente().subscribe({
      next: asistencias => {
        const hoy = new Date();
        this.dentroGym = (asistencias || []).some((a: any) => {
          if (a?.fecha_hora_salida) return false;
          const entrada = new Date(a?.fecha_hora_entrada);
          return !isNaN(entrada.getTime())
            && entrada.getFullYear() === hoy.getFullYear()
            && entrada.getMonth() === hoy.getMonth()
            && entrada.getDate() === hoy.getDate();
        });
        this.verificando = false;
      },
      error: err => {
        this.dentroGym = false;
        this.verificando = false;
        this.error = err?.error?.mensaje || err?.error?.message || 'No se pudo verificar tu ingreso. Revisa Laravel y MySQL.';
      }
    });
  }
}
