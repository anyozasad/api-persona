import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GymApiService } from '../../../core/services/gym-api.service';

@Component({
  selector: 'app-cliente-experiencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="client-extra-shell" *ngIf="!cargando; else loadingTpl">
      <div *ngIf="error" class="client-extra-alert error">{{error}}</div>
      <div *ngIf="toast" class="client-extra-alert ok">{{toast}}</div>

      <ng-container *ngIf="modulo==='progreso'">
        <header class="client-extra-hero">
          <div>
            <span>MI PROGRESO</span>
            <h1>Tu actividad en un solo lugar</h1>
            <p>Revisa tus sesiones, asistencias y actividades recientes. La idea es ayudarte a mantener una rutina saludable y constante.</p>
          </div>
          <button type="button" (click)="cargarProgreso()">↻ Actualizar</button>
        </header>

        <section class="client-progress-kpis">
          <article>
            <span>⚡</span>
            <small>SESIONES EN CASA</small>
            <strong>{{progreso?.mes?.sesiones_casa || 0}}</strong>
            <p>este mes</p>
          </article>
          <article>
            <span>◷</span>
            <small>MINUTOS GUIADOS</small>
            <strong>{{progreso?.mes?.minutos_entrenados || 0}}</strong>
            <p>este mes</p>
          </article>
          <article>
            <span>✓</span>
            <small>ASISTENCIAS</small>
            <strong>{{progreso?.mes?.asistencias_gimnasio || 0}}</strong>
            <p>este mes</p>
          </article>
          <article>
            <span>◎</span>
            <small>META SEMANAL</small>
            <strong>{{progreso?.semana?.cumplimiento || 0}}%</strong>
            <p>{{progreso?.semana?.sesiones_casa || 0}} / {{progreso?.semana?.meta_sesiones || 0}} sesiones</p>
          </article>
        </section>

        <section class="client-extra-grid two">
          <article class="client-extra-card">
            <div class="client-card-head">
              <div><span>SEMANA ACTUAL</span><h2>Actividad registrada</h2></div>
              <b>{{progreso?.semana?.cumplimiento || 0}}%</b>
            </div>
            <div class="client-week-progress">
              <i [style.width.%]="progreso?.semana?.cumplimiento || 0"></i>
            </div>
            <div class="client-week-days">
              <div *ngFor="let d of progreso?.semana?.dias" [class.active]="d.activo">
                <b>{{d.dia}}</b>
                <span>{{d.activo ? '✓' : '·'}}</span>
                <small>{{d.casa ? 'Casa' : (d.gimnasio ? 'Gym' : 'Sin registro')}}</small>
              </div>
            </div>
          </article>

          <article class="client-extra-card client-coach-summary">
            <div class="client-card-head">
              <div><span>MI ENTRENADOR</span><h2>{{nombreEntrenador}}</h2></div>
              <b>{{entrenadorInfo?.entrenador ? 'ACTIVO' : 'PENDIENTE'}}</b>
            </div>
            <ng-container *ngIf="entrenadorInfo?.entrenador; else coachEmpty">
              <div class="client-coach-body">
                <span>{{inicialEntrenador}}</span>
                <div>
                  <h3>{{nombreEntrenador}}</h3>
                  <p>{{entrenadorInfo?.entrenador?.especialidad || 'Entrenamiento general'}}</p>
                  <small>Rutina actual: {{entrenadorInfo?.rutina?.nombre_rutina || 'Sin nombre'}}</small>
                </div>
              </div>
              <div class="client-coach-objective">
                <small>OBJETIVO DE LA RUTINA</small>
                <p>{{entrenadorInfo?.rutina?.objetivo || 'Tu entrenador todavía no registró un objetivo.'}}</p>
              </div>
            </ng-container>
            <ng-template #coachEmpty>
              <div class="client-empty-mini">
                <span>?</span>
                <div><b>Aún no tienes entrenador asignado</b><p>Puedes continuar con tus sesiones guiadas en casa mientras el gimnasio completa la asignación.</p></div>
              </div>
            </ng-template>
          </article>
        </section>

        <section class="client-extra-grid two">
          <article class="client-extra-card">
            <div class="client-card-head"><div><span>ACTIVIDAD RECIENTE</span><h2>Esta semana</h2></div></div>
            <div class="client-activity-list" *ngIf="progreso?.ultimas_actividades?.length; else noActivity">
              <div *ngFor="let a of progreso.ultimas_actividades">
                <span>{{a.tipo==='Asistencia' ? '✓' : '⚡'}}</span>
                <div><b>{{a.titulo}}</b><p>{{a.detalle}}</p></div>
                <small>{{fecha(a.fecha)}}</small>
              </div>
            </div>
            <ng-template #noActivity>
              <div class="client-empty-block"><b>Aún no hay actividad esta semana</b><p>Cuando registres una asistencia o completes una sesión en casa aparecerá aquí.</p></div>
            </ng-template>
          </article>

          <article class="client-extra-card">
            <div class="client-card-head"><div><span>HISTORIAL</span><h2>Últimos registros</h2></div><button type="button" (click)="cargarHistorial()">↻</button></div>
            <div class="client-history-tabs">
              <button type="button" [class.active]="historialTab==='casa'" (click)="historialTab='casa'">En casa</button>
              <button type="button" [class.active]="historialTab==='gym'" (click)="historialTab='gym'">Asistencias</button>
              <button type="button" [class.active]="historialTab==='reservas'" (click)="historialTab='reservas'">Reservas</button>
              <button type="button" [class.active]="historialTab==='pagos'" (click)="historialTab='pagos'">Pagos</button>
            </div>

            <div class="client-history-list" *ngIf="historialTab==='casa'">
              <div *ngFor="let h of historial?.entrenamientos_casa">
                <b>{{h.zona | titlecase}}</b><span>{{fecha(h.fecha)}}</span><small>{{minutos(h.duracion_segundos)}} min</small>
              </div>
              <p class="client-history-empty" *ngIf="!historial?.entrenamientos_casa?.length">Sin sesiones registradas.</p>
            </div>
            <div class="client-history-list" *ngIf="historialTab==='gym'">
              <div *ngFor="let h of historial?.asistencias">
                <b>Visita al gimnasio</b><span>{{fecha(h.fecha_hora_entrada)}}</span><small>{{h.estado || 'Registrada'}}</small>
              </div>
              <p class="client-history-empty" *ngIf="!historial?.asistencias?.length">Sin asistencias registradas.</p>
            </div>
            <div class="client-history-list" *ngIf="historialTab==='reservas'">
              <div *ngFor="let h of historial?.reservas">
                <b>{{h.clase?.nombre || 'Clase'}}</b><span>{{fecha(h.fecha_clase)}}</span><small>{{h.estado}}</small>
              </div>
              <p class="client-history-empty" *ngIf="!historial?.reservas?.length">Sin reservas registradas.</p>
            </div>
            <div class="client-history-list" *ngIf="historialTab==='pagos'">
              <div *ngFor="let h of historial?.pagos">
                <b>{{h.cliente_membresia?.membresia?.nombre || 'Membresía'}}</b><span>{{fecha(h.fecha_pago)}}</span><small>S/ {{h.monto | number:'1.2-2'}} · {{h.estado_pago}}</small>
              </div>
              <p class="client-history-empty" *ngIf="!historial?.pagos?.length">Sin pagos registrados.</p>
            </div>
          </article>
        </section>
      </ng-container>

      <ng-container *ngIf="modulo==='calendario'">
        <header class="client-extra-hero calendar-hero">
          <div>
            <span>MI CALENDARIO</span>
            <h1>Próximas actividades</h1>
            <p>Consulta clases reservadas, sesiones en casa y fechas importantes de tu membresía.</p>
          </div>
          <button type="button" (click)="cargarCalendario()">↻ Actualizar</button>
        </header>

        <section class="client-calendar-card">
          <div class="client-calendar-legend">
            <span><i class="class-dot"></i> Clase</span>
            <span><i class="home-dot"></i> En casa</span>
            <span><i class="membership-dot"></i> Membresía</span>
          </div>
          <div class="client-calendar-list" *ngIf="calendario.length; else emptyCalendar">
            <article *ngFor="let e of calendario">
              <div class="client-date-box">
                <strong>{{diaNumero(e.fecha)}}</strong>
                <small>{{mesCorto(e.fecha)}}</small>
              </div>
              <span class="client-event-icon" [class.home]="e.tipo==='casa'" [class.membership]="e.tipo==='membresia'">
                {{e.tipo==='clase' ? '▣' : (e.tipo==='casa' ? '⚡' : '✦')}}
              </span>
              <div class="client-event-copy"><b>{{e.titulo}}</b><p>{{e.detalle}}</p></div>
              <small class="client-event-day">{{diaNombre(e.fecha)}}</small>
            </article>
          </div>
          <ng-template #emptyCalendar>
            <div class="client-empty-block large"><b>No tienes actividades próximas</b><p>Cuando reserves una clase o configures tu plan en casa aparecerán aquí.</p></div>
          </ng-template>
        </section>
      </ng-container>

      <ng-container *ngIf="modulo==='avisos'">
        <header class="client-extra-hero notices-hero">
          <div>
            <span>CENTRO DE AVISOS</span>
            <h1>Notificaciones</h1>
            <p>Revisa mensajes del gimnasio, recordatorios de clases, membresía y sesiones programadas.</p>
          </div>
          <button type="button" (click)="leerTodas()" [disabled]="!notificaciones?.items?.length">✓ Marcar leídas</button>
        </header>

        <section class="client-notice-list">
          <article *ngFor="let n of notificaciones?.items" [class.unread]="!n.leida">
            <span class="client-notice-icon">{{iconoNotificacion(n.tipo)}}</span>
            <div>
              <small>{{n.tipo || 'Información'}} · {{fecha(n.fecha)}}</small>
              <h3>{{n.titulo}}</h3>
              <p>{{n.mensaje}}</p>
            </div>
            <button *ngIf="n.id_notificacion && !n.leida" type="button" (click)="leerNotificacion(n)">Marcar leída</button>
            <em *ngIf="n.leida">Leída</em>
          </article>
          <div class="client-empty-block large" *ngIf="!notificaciones?.items?.length">
            <b>No tienes notificaciones</b><p>Los avisos importantes aparecerán en este espacio.</p>
          </div>
        </section>
      </ng-container>

      <ng-container *ngIf="modulo==='soporte'">
        <header class="client-extra-hero support-hero">
          <div>
            <span>AYUDA Y SOPORTE</span>
            <h1>¿Necesitas ayuda?</h1>
            <p>Envía una consulta al gimnasio y revisa las respuestas desde tu propia cuenta.</p>
          </div>
        </header>

        <section class="client-extra-grid support-grid">
          <article class="client-extra-card">
            <div class="client-card-head"><div><span>NUEVA CONSULTA</span><h2>Contactar al gimnasio</h2></div></div>
            <form class="client-support-form" (ngSubmit)="enviarSoporte()">
              <label>Asunto<input [(ngModel)]="soporteForm.asunto" name="soporte_asunto" maxlength="150" required placeholder="Ejemplo: consulta sobre mi membresía"></label>
              <label>Mensaje<textarea [(ngModel)]="soporteForm.mensaje" name="soporte_mensaje" minlength="5" maxlength="2000" required placeholder="Escribe tu consulta..."></textarea></label>
              <button type="submit" [disabled]="enviandoSoporte">{{enviandoSoporte ? 'Enviando...' : 'Enviar consulta'}}</button>
            </form>
          </article>

          <article class="client-extra-card">
            <div class="client-card-head"><div><span>MIS CONSULTAS</span><h2>Seguimiento</h2></div><button type="button" (click)="cargarSoporte()">↻</button></div>
            <div class="client-support-list">
              <article *ngFor="let s of soporte">
                <div><span [class.done]="s.estado!=='Pendiente'">{{s.estado}}</span><small>{{fecha(s.fecha)}}</small></div>
                <h3>{{s.asunto}}</h3>
                <p>{{s.mensaje}}</p>
                <div class="client-support-answer" *ngIf="s.respuesta">
                  <b>Respuesta del gimnasio</b>
                  <p>{{s.respuesta}}</p>
                  <small>{{fecha(s.fecha_respuesta)}}</small>
                </div>
              </article>
              <div class="client-empty-block" *ngIf="!soporte.length"><b>Aún no tienes consultas</b><p>Cuando necesites ayuda puedes escribirnos desde este formulario.</p></div>
            </div>
          </article>
        </section>
      </ng-container>
    </section>

    <ng-template #loadingTpl>
      <div class="client-extra-loading"><span></span><b>Cargando información...</b></div>
    </ng-template>
  `
})
export class ClienteExperienciaComponent implements OnInit, OnChanges {
  @Input() modulo = 'progreso';

  cargando = false;
  error = '';
  toast = '';
  progreso: any = null;
  calendario: any[] = [];
  notificaciones: any = { no_leidas: 0, items: [] };
  entrenadorInfo: any = null;
  historial: any = null;
  historialTab: 'casa' | 'gym' | 'reservas' | 'pagos' = 'casa';
  soporte: any[] = [];
  soporteForm = { asunto: '', mensaje: '' };
  enviandoSoporte = false;

  constructor(private api: GymApiService) {}

  ngOnInit(): void {
    this.cargarModulo();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modulo'] && !changes['modulo'].firstChange) {
      this.cargarModulo();
    }
  }

  private cargarModulo(): void {
    this.error = '';
    if (this.modulo === 'progreso') {
      this.cargarProgreso();
      this.cargarEntrenador();
      this.cargarHistorial();
    }
    if (this.modulo === 'calendario') this.cargarCalendario();
    if (this.modulo === 'avisos') this.cargarNotificaciones();
    if (this.modulo === 'soporte') this.cargarSoporte();
  }

  cargarProgreso(): void {
    this.cargando = true;
    this.api.progresoCliente().subscribe({
      next: r => { this.progreso = r; this.cargando = false; },
      error: e => { this.error = this.mensajeError(e); this.cargando = false; }
    });
  }

  cargarCalendario(): void {
    this.cargando = true;
    this.api.calendarioCliente().subscribe({
      next: r => { this.calendario = r || []; this.cargando = false; },
      error: e => { this.error = this.mensajeError(e); this.cargando = false; }
    });
  }

  cargarNotificaciones(): void {
    this.cargando = true;
    this.api.notificacionesCliente().subscribe({
      next: r => { this.notificaciones = r || { no_leidas: 0, items: [] }; this.cargando = false; },
      error: e => { this.error = this.mensajeError(e); this.cargando = false; }
    });
  }

  cargarEntrenador(): void {
    this.api.entrenadorCliente().subscribe({
      next: r => this.entrenadorInfo = r,
      error: () => this.entrenadorInfo = null
    });
  }

  cargarHistorial(): void {
    this.api.historialCliente().subscribe({
      next: r => this.historial = r,
      error: () => this.historial = null
    });
  }

  cargarSoporte(): void {
    this.cargando = true;
    this.api.soporteCliente().subscribe({
      next: r => { this.soporte = r || []; this.cargando = false; },
      error: e => { this.error = this.mensajeError(e); this.cargando = false; }
    });
  }

  enviarSoporte(): void {
    if (!this.soporteForm.asunto.trim() || this.soporteForm.mensaje.trim().length < 5) {
      this.error = 'Completa el asunto y escribe un mensaje de al menos 5 caracteres.';
      return;
    }

    this.error = '';
    this.enviandoSoporte = true;
    this.api.crearSoporteCliente({
      asunto: this.soporteForm.asunto.trim(),
      mensaje: this.soporteForm.mensaje.trim()
    }).subscribe({
      next: r => {
        this.enviandoSoporte = false;
        this.soporteForm = { asunto: '', mensaje: '' };
        this.mostrarToast(r?.mensaje || 'Consulta enviada.');
        this.cargarSoporte();
      },
      error: e => {
        this.enviandoSoporte = false;
        this.error = this.mensajeError(e);
      }
    });
  }

  leerNotificacion(n: any): void {
    if (!n?.id_notificacion) return;
    this.api.leerNotificacionCliente(Number(n.id_notificacion)).subscribe({
      next: () => {
        n.leida = true;
        this.notificaciones.no_leidas = Math.max(0, Number(this.notificaciones.no_leidas || 0) - 1);
      },
      error: e => this.error = this.mensajeError(e)
    });
  }

  leerTodas(): void {
    this.api.leerTodasNotificacionesCliente().subscribe({
      next: () => {
        (this.notificaciones.items || []).forEach((n: any) => {
          if (n.origen === 'admin') n.leida = true;
        });
        this.notificaciones.no_leidas = (this.notificaciones.items || []).filter((n: any) => n.origen === 'sistema').length;
        this.mostrarToast('Notificaciones actualizadas.');
      },
      error: e => this.error = this.mensajeError(e)
    });
  }

  get nombreEntrenador(): string {
    const e = this.entrenadorInfo?.entrenador;
    if (!e) return 'Pendiente de asignación';
    return `${e.nombres || ''} ${e.apellidos || ''}`.trim() || 'Entrenador';
  }

  get inicialEntrenador(): string {
    return this.nombreEntrenador.charAt(0).toUpperCase() || 'E';
  }

  minutos(segundos: any): number {
    return Math.max(0, Math.round(Number(segundos || 0) / 60));
  }

  fecha(valor: any): string {
    if (!valor) return '-';
    const d = new Date(valor);
    return Number.isNaN(d.getTime()) ? String(valor) : d.toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
  }

  diaNumero(valor: string): string {
    const d = this.fechaLocal(valor);
    return d ? String(d.getDate()).padStart(2, '0') : '--';
  }

  mesCorto(valor: string): string {
    const d = this.fechaLocal(valor);
    return d ? d.toLocaleDateString('es-PE', { month: 'short' }).replace('.', '').toUpperCase() : '';
  }

  diaNombre(valor: string): string {
    const d = this.fechaLocal(valor);
    return d ? d.toLocaleDateString('es-PE', { weekday: 'long' }) : '';
  }

  iconoNotificacion(tipo: string): string {
    const t = String(tipo || '').toLowerCase();
    if (t.includes('membres')) return '✦';
    if (t.includes('clase')) return '▣';
    if (t.includes('entrena')) return '⚡';
    if (t.includes('soporte')) return '?';
    return '●';
  }

  private fechaLocal(valor: string): Date | null {
    if (!valor) return null;
    const solo = /^\d{4}-\d{2}-\d{2}$/.test(valor);
    const d = new Date(solo ? valor + 'T12:00:00' : valor);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  private mostrarToast(mensaje: string): void {
    this.toast = '✓ ' + mensaje;
    setTimeout(() => this.toast = '', 2600);
  }

  private mensajeError(e: any): string {
    const errores = e?.error?.errors;
    if (errores) {
      const primero = Object.values(errores)[0] as any;
      if (Array.isArray(primero) && primero[0]) return String(primero[0]);
    }
    return e?.error?.mensaje || e?.error?.message || 'No se pudo cargar la información.';
  }
}
