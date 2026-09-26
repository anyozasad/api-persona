import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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
        <header class="client-extra-hero progress-hero hero-photo hero-photo-progreso">
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

        <section class="client-goal-card">
          <div>
            <span>META SEMANAL PERSONAL</span>
            <h2>Configura una meta realista</h2>
            <p>Elige entre 1 y 4 sesiones por semana. La meta sirve para organizar tu constancia, no para entrenar en exceso.</p>
          </div>
          <form (ngSubmit)="guardarMeta()">
            <label>Sesiones por semana
              <select [(ngModel)]="meta.sesiones_semanales" name="meta_sesiones">
                <option [ngValue]="1">1 sesión</option>
                <option [ngValue]="2">2 sesiones</option>
                <option [ngValue]="3">3 sesiones</option>
                <option [ngValue]="4">4 sesiones</option>
              </select>
            </label>
            <label class="client-reminder-toggle">
              <input type="checkbox" [(ngModel)]="meta.recordatorios" name="meta_recordatorios">
              <span>Mostrar recordatorios de entrenamiento</span>
            </label>
            <button type="submit" [disabled]="guardandoMeta">{{guardandoMeta ? 'Guardando...' : 'Guardar meta'}}</button>
          </form>
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
        <header class="calendar-pro-head">
          <div class="calendar-pro-copy">
            <span class="calendar-pro-kicker"><i></i> AGENDA PERSONAL</span>
            <h1>Organiza tu entrenamiento</h1>
            <p>Tu calendario combina clases, sesiones en casa y fechas de membresía para que tengas claro qué sigue.</p>
            <div class="calendar-head-actions">
              <button type="button" class="calendar-today-btn" (click)="irMesActual()">Hoy</button>
              <button type="button" class="calendar-refresh-btn" (click)="cargarCalendario()">↻ Sincronizar agenda</button>
            </div>
          </div>
          <div class="calendar-next-card" *ngIf="proximoEventoCalendario; else sinProximoEvento">
            <small>PRÓXIMA ACTIVIDAD</small>
            <div class="calendar-next-date">
              <strong>{{diaNumero(proximoEventoCalendario.fecha)}}</strong>
              <span>{{mesCorto(proximoEventoCalendario.fecha)}}</span>
            </div>
            <div>
              <b>{{proximoEventoCalendario.titulo}}</b>
              <p>{{proximoEventoCalendario.detalle}}</p>
            </div>
          </div>
          <ng-template #sinProximoEvento>
            <div class="calendar-next-card empty">
              <small>PRÓXIMA ACTIVIDAD</small>
              <strong>Agenda libre</strong>
              <p>No tienes actividades próximas registradas.</p>
            </div>
          </ng-template>
        </header>

        <section class="calendar-summary-row">
          <article>
            <span class="calendar-summary-icon blue">▣</span>
            <div><small>CLASES</small><strong>{{totalEventosTipo('clase')}}</strong><p>próximas reservas</p></div>
          </article>
          <article>
            <span class="calendar-summary-icon red">⚡</span>
            <div><small>EN CASA</small><strong>{{totalEventosTipo('casa')}}</strong><p>sesiones programadas</p></div>
          </article>
          <article>
            <span class="calendar-summary-icon gold">✦</span>
            <div><small>MEMBRESÍA</small><strong>{{totalEventosTipo('membresia')}}</strong><p>fecha importante</p></div>
          </article>
          <article>
            <span class="calendar-summary-icon green">✓</span>
            <div><small>TOTAL AGENDA</small><strong>{{calendario.length}}</strong><p>actividades próximas</p></div>
          </article>
        </section>

        <section class="calendar-workspace">
          <article class="calendar-month-card">
            <header class="calendar-month-head">
              <div>
                <span>VISTA MENSUAL</span>
                <h2>{{mesCalendarioTitulo}}</h2>
              </div>
              <div class="calendar-month-nav">
                <button type="button" (click)="cambiarMes(-1)" aria-label="Mes anterior">‹</button>
                <button type="button" (click)="irMesActual()">Hoy</button>
                <button type="button" (click)="cambiarMes(1)" aria-label="Mes siguiente">›</button>
              </div>
            </header>

            <div class="calendar-week-head">
              <span>LUN</span><span>MAR</span><span>MIÉ</span><span>JUE</span><span>VIE</span><span>SÁB</span><span>DOM</span>
            </div>

            <div class="calendar-month-grid">
              <button
                type="button"
                *ngFor="let d of diasCalendario"
                class="calendar-day"
                [class.outside]="!d.actual"
                [class.today]="d.hoy"
                [class.has-events]="d.eventos.length>0"
                (click)="seleccionarDiaCalendario(d)">
                <span>{{d.numero}}</span>
                <div class="calendar-day-dots" *ngIf="d.eventos.length">
                  <i *ngFor="let e of eventosVistaDia(d.eventos)"
                     [class.home]="e.tipo==='casa'"
                     [class.membership]="e.tipo==='membresia'"></i>
                </div>
                <small *ngIf="d.eventos.length">{{d.eventos.length}} actividad{{d.eventos.length===1 ? '' : 'es'}}</small>
              </button>
            </div>

            <footer class="calendar-month-legend">
              <span><i></i> Clase</span>
              <span><i class="home"></i> En casa</span>
              <span><i class="membership"></i> Membresía</span>
            </footer>
          </article>

          <aside class="calendar-agenda-card">
            <header>
              <div>
                <span>AGENDA</span>
                <h2>{{diaAgendaTitulo}}</h2>
              </div>
              <b>{{eventosAgendaDia.length}}</b>
            </header>

            <div class="calendar-agenda-list" *ngIf="eventosAgendaDia.length; else agendaVacia">
              <button type="button" *ngFor="let e of eventosAgendaDia" (click)="eventoSeleccionado=e">
                <span class="agenda-event-icon"
                      [class.home]="e.tipo==='casa'"
                      [class.membership]="e.tipo==='membresia'">
                  {{e.tipo==='clase' ? '▣' : (e.tipo==='casa' ? '⚡' : '✦')}}
                </span>
                <div>
                  <small>{{tipoEventoNombre(e.tipo)}} · {{diaNombre(e.fecha)}}</small>
                  <b>{{e.titulo}}</b>
                  <p>{{e.detalle}}</p>
                </div>
                <em>›</em>
              </button>
            </div>

            <ng-template #agendaVacia>
              <div class="calendar-agenda-empty">
                <span>✓</span>
                <b>Día disponible</b>
                <p>No tienes actividades registradas para esta fecha.</p>
              </div>
            </ng-template>

            <div class="calendar-selected-event" *ngIf="eventoSeleccionado">
              <button type="button" class="calendar-selected-close" (click)="eventoSeleccionado=null">×</button>
              <small>DETALLE DE ACTIVIDAD</small>
              <span class="calendar-selected-icon"
                    [class.home]="eventoSeleccionado.tipo==='casa'"
                    [class.membership]="eventoSeleccionado.tipo==='membresia'">
                {{eventoSeleccionado.tipo==='clase' ? '▣' : (eventoSeleccionado.tipo==='casa' ? '⚡' : '✦')}}
              </span>
              <h3>{{eventoSeleccionado.titulo}}</h3>
              <p>{{eventoSeleccionado.detalle}}</p>
              <div><b>{{diaNombre(eventoSeleccionado.fecha) | titlecase}}</b><span>{{diaNumero(eventoSeleccionado.fecha)}} {{mesCorto(eventoSeleccionado.fecha)}}</span></div>
            </div>
          </aside>
        </section>

        <section class="calendar-upcoming-card">
          <header>
            <div><span>PRÓXIMOS EVENTOS</span><h2>Tu agenda completa</h2><p>Información sincronizada con tus reservas y tu plan de entrenamiento.</p></div>
            <span class="calendar-sync-status"><i></i> Actualizado</span>
          </header>
          <div class="client-calendar-list calendar-list-pro" *ngIf="calendario.length; else emptyCalendar">
            <article *ngFor="let e of calendario">
              <div class="client-date-box">
                <strong>{{diaNumero(e.fecha)}}</strong>
                <small>{{mesCorto(e.fecha)}}</small>
              </div>
              <span class="client-event-icon" [class.home]="e.tipo==='casa'" [class.membership]="e.tipo==='membresia'">
                {{e.tipo==='clase' ? '▣' : (e.tipo==='casa' ? '⚡' : '✦')}}
              </span>
              <div class="client-event-copy">
                <small>{{tipoEventoNombre(e.tipo)}}</small>
                <b>{{e.titulo}}</b>
                <p>{{e.detalle}}</p>
              </div>
              <small class="client-event-day">{{diaNombre(e.fecha)}}</small>
              <button type="button" class="calendar-detail-btn" (click)="seleccionarEventoCalendario(e)">Ver detalle</button>
            </article>
          </div>
          <ng-template #emptyCalendar>
            <div class="client-empty-block large"><b>No tienes actividades próximas</b><p>Cuando reserves una clase o configures tu plan en casa aparecerán aquí.</p></div>
          </ng-template>
        </section>
      </ng-container>

      <ng-container *ngIf="modulo==='avisos'">
        <header class="client-extra-hero notices-hero hero-photo hero-photo-avisos">
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


      <ng-container *ngIf="modulo==='club'">
        <header class="client-extra-hero club-hero hero-photo hero-photo-club">
          <div>
            <span>MI CLUB</span>
            <h1>Tu espacio dentro de Mallqui Gym</h1>
            <p>Consulta tu credencial digital, guarda clases favoritas y comparte una opinión sobre tu experiencia.</p>
          </div>
          <button type="button" (click)="cargarClub()">↻ Actualizar</button>
        </header>

        <section class="client-club-grid">
          <article class="client-digital-card">
            <div class="client-card-brand">
              <span>MALLQUI GYM</span>
              <small>CREDENCIAL DIGITAL</small>
            </div>
            <div class="client-card-person">
              <span>{{inicialSocio}}</span>
              <div>
                <small>SOCIO</small>
                <h2>{{nombreSocio}}</h2>
                <p>{{credencial?.codigo_socio || 'MG------'}}</p>
              </div>
            </div>
            <div class="client-card-plan">
              <div><small>PLAN</small><b>{{credencial?.membresia?.membresia?.nombre || 'Sin membresía activa'}}</b></div>
              <div><small>VIGENCIA</small><b>{{credencial?.membresia ? fechaCorta(credencial.membresia.fecha_fin) : '-'}}</b></div>
              <div><small>DÍAS RESTANTES</small><b>{{credencial?.dias_restantes || 0}}</b></div>
            </div>
            <div class="client-card-footer">
              <span [class.inactive]="credencial?.cliente?.estado!=='Activo'">{{credencial?.cliente?.estado || 'Sin estado'}}</span>
              <small>Presenta tu código de socio en recepción.</small>
            </div>
          </article>

          <article class="client-extra-card">
            <div class="client-card-head">
              <div><span>CLASES FAVORITAS</span><h2>Guarda tus preferidas</h2><p>{{favoritasCount}} favoritas</p></div>
            </div>
            <div class="client-favorite-list">
              <article *ngFor="let c of clasesClub">
                <button type="button" [class.active]="c.favorita" (click)="toggleFavorita(c)" [attr.aria-label]="c.favorita ? 'Quitar de favoritos' : 'Agregar a favoritos'">★</button>
                <div><b>{{c.nombre}}</b><small>{{c.dia_semana}} · {{hora(c.hora_inicio)}} - {{hora(c.hora_fin)}}</small></div>
                <span>{{c.entrenador ? (c.entrenador.nombres+' '+c.entrenador.apellidos) : 'Sin entrenador'}}</span>
              </article>
              <div class="client-empty-block" *ngIf="!clasesClub.length"><b>No hay clases disponibles</b><p>Las clases activas aparecerán aquí.</p></div>
            </div>
          </article>
        </section>

        <section class="client-extra-grid two">
          <article class="client-extra-card">
            <div class="client-card-head"><div><span>TU OPINIÓN</span><h2>Ayúdanos a mejorar</h2><p>Evalúa el servicio sin compartir información sensible.</p></div></div>
            <form class="client-feedback-form" (ngSubmit)="enviarOpinion()">
              <label>Categoría
                <select [(ngModel)]="opinionForm.categoria" name="op_categoria">
                  <option>Servicio</option>
                  <option>Instalaciones</option>
                  <option>Clases</option>
                  <option>Aplicacion</option>
                </select>
              </label>
              <label>Calificación
                <div class="client-rating">
                  <button *ngFor="let n of [1,2,3,4,5]" type="button" [class.active]="opinionForm.calificacion>=n" (click)="opinionForm.calificacion=n">★</button>
                </div>
              </label>
              <label>Comentario
                <textarea [(ngModel)]="opinionForm.comentario" name="op_comentario" minlength="5" maxlength="1000" required placeholder="Cuéntanos qué funcionó bien o qué podemos mejorar..."></textarea>
              </label>
              <button type="submit" [disabled]="guardandoOpinion">{{guardandoOpinion ? 'Enviando...' : 'Enviar opinión'}}</button>
            </form>
          </article>

          <article class="client-extra-card">
            <div class="client-card-head"><div><span>HISTORIAL</span><h2>Mis opiniones</h2></div></div>
            <div class="client-opinion-list">
              <article *ngFor="let o of opiniones">
                <div><b>{{o.categoria}}</b><span>{{estrellas(o.calificacion)}}</span></div>
                <p>{{o.comentario}}</p>
                <small>{{fecha(o.fecha)}} · {{o.estado}}</small>
              </article>
              <div class="client-empty-block" *ngIf="!opiniones.length"><b>Aún no enviaste opiniones</b><p>Cuando quieras, puedes compartir tu experiencia desde este espacio.</p></div>
            </div>
          </article>
        </section>
      </ng-container>

      <ng-container *ngIf="modulo==='soporte'">
        <header class="client-extra-hero support-hero hero-photo hero-photo-ayuda">
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
  @Output() notificacionesCambio = new EventEmitter<number>();

  cargando = false;
  error = '';
  toast = '';
  progreso: any = null;
  meta: any = { sesiones_semanales: 3, recordatorios: true };
  guardandoMeta = false;
  calendario: any[] = [];
  mesCalendario = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  fechaAgenda = new Date();
  eventoSeleccionado: any = null;
  credencial: any = null;
  clasesClub: any[] = [];
  opiniones: any[] = [];
  opinionForm: any = { categoria: 'Servicio', calificacion: 5, comentario: '' };
  guardandoOpinion = false;
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
      this.cargarMeta();
      this.cargarEntrenador();
      this.cargarHistorial();
    }
    if (this.modulo === 'calendario') this.cargarCalendario();
    if (this.modulo === 'club') this.cargarClub();
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

  cargarMeta(): void {
    this.api.metaCliente().subscribe({
      next: r => this.meta = {
        sesiones_semanales: Number(r?.sesiones_semanales || 3),
        recordatorios: r?.recordatorios !== false
      },
      error: () => this.meta = { sesiones_semanales: 3, recordatorios: true }
    });
  }

  guardarMeta(): void {
    const sesiones = Math.max(1, Math.min(4, Number(this.meta?.sesiones_semanales || 3)));
    this.guardandoMeta = true;
    this.error = '';
    this.api.guardarMetaCliente({
      sesiones_semanales: sesiones,
      recordatorios: Boolean(this.meta?.recordatorios)
    }).subscribe({
      next: r => {
        this.guardandoMeta = false;
        this.meta = r?.meta || this.meta;
        this.mostrarToast(r?.mensaje || 'Meta semanal actualizada.');
        this.cargarProgreso();
      },
      error: e => {
        this.guardandoMeta = false;
        this.error = this.mensajeError(e);
      }
    });
  }

  cargarCalendario(): void {
    this.cargando = true;
    this.api.calendarioCliente().subscribe({
      next: r => {
        this.calendario = r || [];
        const proximo = this.proximoEventoCalendario;
        if (proximo?.fecha) {
          const d = this.fechaLocal(proximo.fecha);
          if (d) {
            this.mesCalendario = new Date(d.getFullYear(), d.getMonth(), 1);
            this.fechaAgenda = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          }
        }
        this.cargando = false;
      },
      error: e => { this.error = this.mensajeError(e); this.cargando = false; }
    });
  }

  get mesCalendarioTitulo(): string {
    return this.mesCalendario.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
      .replace(/^./, x => x.toUpperCase());
  }

  get proximoEventoCalendario(): any {
    if (!this.calendario.length) return null;
    const ahora = new Date();
    ahora.setHours(0,0,0,0);
    return [...this.calendario]
      .filter((e:any) => {
        const d = this.fechaLocal(e?.fecha);
        return d ? d.getTime() >= ahora.getTime() : false;
      })
      .sort((a:any,b:any) => {
        const da = this.fechaLocal(a?.fecha)?.getTime() || 0;
        const db = this.fechaLocal(b?.fecha)?.getTime() || 0;
        return da-db;
      })[0] || this.calendario[0];
  }

  totalEventosTipo(tipo: string): number {
    return this.calendario.filter((e:any) => String(e?.tipo || '').toLowerCase() === tipo).length;
  }

  get diasCalendario(): any[] {
    const y = this.mesCalendario.getFullYear();
    const m = this.mesCalendario.getMonth();
    const primero = new Date(y,m,1);
    const offset = (primero.getDay()+6)%7;
    const inicio = new Date(y,m,1-offset);
    const hoy = new Date();
    hoy.setHours(0,0,0,0);

    return Array.from({length:42},(_,i)=>{
      const fecha = new Date(inicio);
      fecha.setDate(inicio.getDate()+i);
      fecha.setHours(0,0,0,0);
      return {
        fecha,
        numero:fecha.getDate(),
        actual:fecha.getMonth()===m,
        hoy:fecha.getTime()===hoy.getTime(),
        eventos:this.eventosEnFecha(fecha),
      };
    });
  }

  get eventosAgendaDia(): any[] {
    return this.eventosEnFecha(this.fechaAgenda);
  }

  eventosVistaDia(eventos:any): any[] {
    return Array.isArray(eventos) ? eventos.slice(0,3) : [];
  }

  get diaAgendaTitulo(): string {
    return this.fechaAgenda.toLocaleDateString('es-PE',{
      weekday:'long',day:'numeric',month:'long'
    }).replace(/^./,x=>x.toUpperCase());
  }

  cambiarMes(delta:number): void {
    this.mesCalendario = new Date(
      this.mesCalendario.getFullYear(),
      this.mesCalendario.getMonth()+delta,
      1
    );
    this.fechaAgenda = new Date(
      this.mesCalendario.getFullYear(),
      this.mesCalendario.getMonth(),
      1
    );
    this.eventoSeleccionado = null;
  }

  irMesActual(): void {
    const hoy = new Date();
    this.mesCalendario = new Date(hoy.getFullYear(),hoy.getMonth(),1);
    this.fechaAgenda = new Date(hoy.getFullYear(),hoy.getMonth(),hoy.getDate());
    this.eventoSeleccionado = null;
  }

  seleccionarDiaCalendario(d:any): void {
    if (!d?.fecha) return;
    this.fechaAgenda = new Date(d.fecha);
    if (!d.actual) {
      this.mesCalendario = new Date(d.fecha.getFullYear(),d.fecha.getMonth(),1);
    }
    this.eventoSeleccionado = d.eventos?.[0] || null;
  }

  seleccionarEventoCalendario(e:any): void {
    this.eventoSeleccionado = e;
    const d = this.fechaLocal(e?.fecha);
    if (d) {
      this.fechaAgenda = new Date(d.getFullYear(),d.getMonth(),d.getDate());
      this.mesCalendario = new Date(d.getFullYear(),d.getMonth(),1);
    }
    window.scrollTo({top:220,behavior:'smooth'});
  }

  tipoEventoNombre(tipo:any): string {
    const t = String(tipo || '').toLowerCase();
    if (t==='casa') return 'Entrenamiento en casa';
    if (t==='membresia') return 'Membresía';
    return 'Clase del gimnasio';
  }

  private eventosEnFecha(fecha:Date): any[] {
    const y=fecha.getFullYear(), m=fecha.getMonth(), d=fecha.getDate();
    return this.calendario.filter((e:any)=>{
      const x=this.fechaLocal(e?.fecha);
      return !!x && x.getFullYear()===y && x.getMonth()===m && x.getDate()===d;
    });
  }

  cargarClub(): void {
    this.cargando = true;
    this.error = '';
    let pendientes = 3;
    const terminar = () => { pendientes--; if (pendientes <= 0) this.cargando = false; };

    this.api.credencialCliente().subscribe({
      next: r => { this.credencial = r; terminar(); },
      error: e => { this.error = this.mensajeError(e); terminar(); }
    });

    this.api.clasesFavoritasCliente().subscribe({
      next: r => { this.clasesClub = r || []; terminar(); },
      error: e => { this.error = this.mensajeError(e); terminar(); }
    });

    this.api.opinionesCliente().subscribe({
      next: r => { this.opiniones = r || []; terminar(); },
      error: e => { this.error = this.mensajeError(e); terminar(); }
    });
  }

  toggleFavorita(clase: any): void {
    const id = Number(clase?.id_clase || 0);
    if (!id) return;

    const req = clase.favorita
      ? this.api.quitarClaseFavorita(id)
      : this.api.agregarClaseFavorita(id);

    req.subscribe({
      next: r => {
        clase.favorita = !clase.favorita;
        this.mostrarToast(r?.mensaje || 'Favoritos actualizados.');
      },
      error: e => this.error = this.mensajeError(e)
    });
  }

  enviarOpinion(): void {
    if (String(this.opinionForm?.comentario || '').trim().length < 5) {
      this.error = 'Escribe un comentario de al menos 5 caracteres.';
      return;
    }

    this.guardandoOpinion = true;
    this.error = '';

    this.api.guardarOpinionCliente({
      categoria: this.opinionForm.categoria,
      calificacion: Number(this.opinionForm.calificacion || 5),
      comentario: String(this.opinionForm.comentario || '').trim()
    }).subscribe({
      next: r => {
        this.guardandoOpinion = false;
        this.opinionForm = { categoria: 'Servicio', calificacion: 5, comentario: '' };
        this.mostrarToast(r?.mensaje || 'Opinión registrada.');
        this.api.opinionesCliente().subscribe(x => this.opiniones = x || []);
      },
      error: e => {
        this.guardandoOpinion = false;
        this.error = this.mensajeError(e);
      }
    });
  }

  get favoritasCount(): number {
    return this.clasesClub.filter((x: any) => x.favorita).length;
  }

  get nombreSocio(): string {
    const x = this.credencial?.cliente;
    return x ? `${x.nombres || ''} ${x.apellidos || ''}`.trim() || 'Socio Mallqui' : 'Socio Mallqui';
  }

  get inicialSocio(): string {
    return this.nombreSocio.charAt(0).toUpperCase() || 'M';
  }

  fechaCorta(valor: any): string {
    if (!valor) return '-';
    const d = new Date(valor);
    return Number.isNaN(d.getTime()) ? String(valor) : d.toLocaleDateString('es-PE');
  }

  hora(valor: any): string {
    return String(valor || '').slice(0,5);
  }

  estrellas(valor: any): string {
    const n = Math.max(0, Math.min(5, Number(valor || 0)));
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  cargarNotificaciones(): void {
    this.cargando = true;
    this.api.notificacionesCliente().subscribe({
      next: r => {
        this.notificaciones = r || { no_leidas: 0, items: [] };
        this.notificacionesCambio.emit(Number(this.notificaciones?.no_leidas || 0));
        this.cargando = false;
      },
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
        this.notificacionesCambio.emit(Number(this.notificaciones.no_leidas || 0));
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
        this.notificacionesCambio.emit(Number(this.notificaciones.no_leidas || 0));
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
