import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from './admin-api.service';

@Component({
  selector: 'app-admin-comunicacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="admin-comm-shell">
      <div *ngIf="error" class="admin-comm-alert error">⚠ {{error}}</div>
      <div *ngIf="toast" class="admin-comm-alert ok">{{toast}}</div>

      <ng-container *ngIf="modo==='comunicacion'">
        <div class="admin-comm-hero">
          <div>
            <span>COMUNICACIÓN CON CLIENTES</span>
            <h2>Notificaciones</h2>
            <p>Envía avisos a un cliente específico o a todos los clientes activos desde el panel.</p>
          </div>
          <button type="button" (click)="cargarNotificaciones()">↻ Actualizar</button>
        </div>

        <div class="admin-comm-grid">
          <article class="admin-comm-card">
            <div class="admin-comm-card-head">
              <div><span>NUEVO AVISO</span><h3>Enviar notificación</h3></div>
              <i>●</i>
            </div>

            <form class="admin-comm-form" (ngSubmit)="enviarNotificacion()">
              <label>Destinatario
                <select [(ngModel)]="notificacionForm.id_cliente" name="notif_cliente">
                  <option [ngValue]="null">Todos los clientes activos</option>
                  <option *ngFor="let c of clientes" [ngValue]="c.id_cliente">{{nombreCliente(c)}} · {{c.dni}}</option>
                </select>
              </label>
              <label>Tipo
                <select [(ngModel)]="notificacionForm.tipo" name="notif_tipo">
                  <option>Informacion</option>
                  <option>Membresia</option>
                  <option>Clase</option>
                  <option>Pago</option>
                  <option>Entrenamiento</option>
                </select>
              </label>
              <label>Título
                <input [(ngModel)]="notificacionForm.titulo" name="notif_titulo" maxlength="150" required placeholder="Ejemplo: horario especial">
              </label>
              <label>Mensaje
                <textarea [(ngModel)]="notificacionForm.mensaje" name="notif_mensaje" maxlength="2000" required placeholder="Escribe el mensaje para el cliente..."></textarea>
              </label>
              <button type="submit" [disabled]="guardando">{{guardando ? 'Enviando...' : 'Enviar notificación'}}</button>
            </form>
          </article>

          <article class="admin-comm-card wide">
            <div class="admin-comm-card-head">
              <div><span>HISTORIAL</span><h3>Notificaciones enviadas</h3><p>{{notificaciones.length}} registros recientes</p></div>
            </div>

            <div class="admin-comm-table-wrap">
              <table class="admin-comm-table">
                <thead><tr><th>Fecha</th><th>Cliente</th><th>Tipo</th><th>Mensaje</th><th>Estado</th><th></th></tr></thead>
                <tbody>
                  <tr *ngFor="let n of notificaciones">
                    <td>{{fecha(n.fecha)}}</td>
                    <td><b>{{nombreCliente(n.cliente)}}</b><small>{{n.cliente?.correo || ''}}</small></td>
                    <td><span class="admin-comm-type">{{n.tipo}}</span></td>
                    <td><b>{{n.titulo}}</b><small>{{n.mensaje}}</small></td>
                    <td><span [class.read]="n.leida" class="admin-comm-state">{{n.leida ? 'Leída' : 'Pendiente'}}</span></td>
                    <td><button type="button" class="admin-comm-delete" (click)="eliminarNotificacion(n)">Eliminar</button></td>
                  </tr>
                  <tr *ngIf="!notificaciones.length"><td colspan="6"><div class="admin-comm-empty">Aún no hay notificaciones enviadas.</div></td></tr>
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </ng-container>

      <ng-container *ngIf="modo==='soporte'">
        <div class="admin-comm-hero support">
          <div>
            <span>CENTRO DE SOPORTE</span>
            <h2>Consultas de clientes</h2>
            <p>Revisa solicitudes, responde desde el panel y deja cada caso con un estado claro.</p>
          </div>
          <button type="button" (click)="cargarSoporte()">↻ Actualizar</button>
        </div>

        <section class="admin-support-kpis">
          <article><span>!</span><div><small>PENDIENTES</small><strong>{{soportePendiente}}</strong></div></article>
          <article><span>✓</span><div><small>RESPONDIDAS</small><strong>{{soporteRespondido}}</strong></div></article>
          <article><span>□</span><div><small>CERRADAS</small><strong>{{soporteCerrado}}</strong></div></article>
          <article><span>▦</span><div><small>TOTAL</small><strong>{{soporte.length}}</strong></div></article>
        </section>

        <div class="admin-support-layout">
          <article class="admin-comm-card support-list-card">
            <div class="admin-comm-card-head">
              <div><span>SOLICITUDES</span><h3>Bandeja de soporte</h3></div>
            </div>
            <div class="admin-support-list">
              <button type="button" *ngFor="let s of soporte" [class.active]="soporteSeleccionado?.id_soporte===s.id_soporte" (click)="seleccionarSoporte(s)">
                <div>
                  <span [class.done]="s.estado!=='Pendiente'">{{s.estado}}</span>
                  <small>{{fecha(s.fecha)}}</small>
                </div>
                <b>{{s.asunto}}</b>
                <p>{{nombreCliente(s.cliente)}} · {{s.mensaje}}</p>
              </button>
              <div class="admin-comm-empty" *ngIf="!soporte.length">No hay consultas de soporte.</div>
            </div>
          </article>

          <article class="admin-comm-card support-detail-card">
            <ng-container *ngIf="soporteSeleccionado; else noTicket">
              <div class="admin-comm-card-head">
                <div><span>DETALLE</span><h3>{{soporteSeleccionado.asunto}}</h3><p>{{nombreCliente(soporteSeleccionado.cliente)}} · {{fecha(soporteSeleccionado.fecha)}}</p></div>
                <span class="admin-ticket-state">{{soporteSeleccionado.estado}}</span>
              </div>

              <div class="admin-ticket-message">
                <small>MENSAJE DEL CLIENTE</small>
                <p>{{soporteSeleccionado.mensaje}}</p>
              </div>

              <div class="admin-ticket-answer" *ngIf="soporteSeleccionado.respuesta">
                <small>RESPUESTA ACTUAL</small>
                <p>{{soporteSeleccionado.respuesta}}</p>
                <span>{{fecha(soporteSeleccionado.fecha_respuesta)}}</span>
              </div>

              <form class="admin-comm-form" (ngSubmit)="responderSoporte()">
                <label>Respuesta
                  <textarea [(ngModel)]="respuestaSoporte" name="respuesta_soporte" minlength="3" maxlength="3000" required placeholder="Escribe una respuesta clara para el cliente..."></textarea>
                </label>
                <div class="admin-support-actions">
                  <button type="submit" [disabled]="guardando">{{guardando ? 'Guardando...' : 'Responder y notificar'}}</button>
                  <button type="button" class="secondary" (click)="cerrarSoporte()" [disabled]="soporteSeleccionado.estado==='Cerrado'">Cerrar caso</button>
                </div>
              </form>
            </ng-container>
            <ng-template #noTicket>
              <div class="admin-support-placeholder">
                <span>?</span><b>Selecciona una consulta</b><p>El detalle y la respuesta aparecerán aquí.</p>
              </div>
            </ng-template>
          </article>
        </div>
      </ng-container>
    </section>
  `
})
export class AdminComunicacionComponent implements OnInit, OnChanges {
  @Input() modo: 'comunicacion' | 'soporte' = 'comunicacion';

  clientes: any[] = [];
  notificaciones: any[] = [];
  soporte: any[] = [];
  soporteSeleccionado: any = null;
  respuestaSoporte = '';
  guardando = false;
  error = '';
  toast = '';

  notificacionForm: any = {
    id_cliente: null,
    tipo: 'Informacion',
    titulo: '',
    mensaje: ''
  };

  constructor(private api: AdminApiService) {}

  ngOnInit(): void {
    this.cargarBase();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modo'] && !changes['modo'].firstChange) this.cargarBase();
  }

  cargarBase(): void {
    this.api.clientes().subscribe({
      next: r => this.clientes = (r || []).filter((c: any) => c.estado === 'Activo'),
      error: e => this.error = this.mensajeError(e)
    });

    if (this.modo === 'comunicacion') this.cargarNotificaciones();
    if (this.modo === 'soporte') this.cargarSoporte();
  }

  cargarNotificaciones(): void {
    this.api.notificacionesClientes().subscribe({
      next: r => this.notificaciones = r || [],
      error: e => this.error = this.mensajeError(e)
    });
  }

  enviarNotificacion(): void {
    if (!this.notificacionForm.titulo.trim() || !this.notificacionForm.mensaje.trim()) {
      this.error = 'Completa el título y el mensaje.';
      return;
    }

    this.guardando = true;
    this.error = '';
    this.api.enviarNotificacionCliente({
      id_cliente: this.notificacionForm.id_cliente,
      tipo: this.notificacionForm.tipo,
      titulo: this.notificacionForm.titulo.trim(),
      mensaje: this.notificacionForm.mensaje.trim()
    }).subscribe({
      next: r => {
        this.guardando = false;
        this.notificacionForm = { id_cliente: null, tipo: 'Informacion', titulo: '', mensaje: '' };
        this.mostrarToast(r?.mensaje || 'Notificación enviada.');
        this.cargarNotificaciones();
      },
      error: e => {
        this.guardando = false;
        this.error = this.mensajeError(e);
      }
    });
  }

  eliminarNotificacion(n: any): void {
    if (!n?.id_notificacion || !confirm('¿Eliminar esta notificación del historial?')) return;
    this.api.eliminarNotificacionCliente(Number(n.id_notificacion)).subscribe({
      next: r => {
        this.mostrarToast(r?.mensaje || 'Notificación eliminada.');
        this.cargarNotificaciones();
      },
      error: e => this.error = this.mensajeError(e)
    });
  }

  cargarSoporte(): void {
    this.api.solicitudesSoporte().subscribe({
      next: r => {
        this.soporte = r || [];
        if (this.soporteSeleccionado) {
          this.soporteSeleccionado = this.soporte.find(x => x.id_soporte === this.soporteSeleccionado.id_soporte) || null;
        }
      },
      error: e => this.error = this.mensajeError(e)
    });
  }

  seleccionarSoporte(s: any): void {
    this.soporteSeleccionado = s;
    this.respuestaSoporte = s.respuesta || '';
    this.error = '';
  }

  responderSoporte(): void {
    if (!this.soporteSeleccionado?.id_soporte || this.respuestaSoporte.trim().length < 3) {
      this.error = 'Escribe una respuesta antes de guardar.';
      return;
    }

    this.guardando = true;
    this.api.responderSoporte(
      Number(this.soporteSeleccionado.id_soporte),
      this.respuestaSoporte.trim(),
      'Respondido'
    ).subscribe({
      next: r => {
        this.guardando = false;
        this.mostrarToast(r?.mensaje || 'Respuesta guardada.');
        this.soporteSeleccionado = r?.solicitud || this.soporteSeleccionado;
        this.cargarSoporte();
      },
      error: e => {
        this.guardando = false;
        this.error = this.mensajeError(e);
      }
    });
  }

  cerrarSoporte(): void {
    if (!this.soporteSeleccionado?.id_soporte) return;
    this.api.cerrarSoporte(Number(this.soporteSeleccionado.id_soporte)).subscribe({
      next: r => {
        this.mostrarToast(r?.mensaje || 'Caso cerrado.');
        this.soporteSeleccionado = r?.solicitud || this.soporteSeleccionado;
        this.cargarSoporte();
      },
      error: e => this.error = this.mensajeError(e)
    });
  }

  get soportePendiente(): number {
    return this.soporte.filter(x => x.estado === 'Pendiente').length;
  }

  get soporteRespondido(): number {
    return this.soporte.filter(x => x.estado === 'Respondido').length;
  }

  get soporteCerrado(): number {
    return this.soporte.filter(x => x.estado === 'Cerrado').length;
  }

  nombreCliente(c: any): string {
    return c ? `${c.nombres || ''} ${c.apellidos || ''}`.trim() || 'Cliente' : 'Cliente';
  }

  fecha(v: any): string {
    if (!v) return '-';
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString('es-PE');
  }

  private mostrarToast(mensaje: string): void {
    this.error = '';
    this.toast = '✓ ' + mensaje;
    setTimeout(() => this.toast = '', 2600);
  }

  private mensajeError(e: any): string {
    const errores = e?.error?.errors;
    if (errores) {
      const primero = Object.values(errores)[0] as any;
      if (Array.isArray(primero) && primero[0]) return String(primero[0]);
    }
    return e?.error?.mensaje || e?.error?.message || 'No se pudo completar la operación.';
  }
}
