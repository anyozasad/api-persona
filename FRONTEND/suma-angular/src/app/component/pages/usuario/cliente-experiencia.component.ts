import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GymApiService } from '../../../core/services/gym-api.service';
import { code128DataUri, code128Svg } from '../../../shared/code128';

@Component({
  selector: 'app-cliente-experiencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="client-extra-shell" [class.progress-experience-v34]="modulo==='progreso'" *ngIf="!cargando; else loadingTpl">
      <div *ngIf="error" class="client-extra-alert error">{{error}}</div>
      <div *ngIf="toast" class="client-extra-alert ok">{{toast}}</div>

      <ng-container *ngIf="modulo==='progreso'">
        <section class="progress-portal-head">
          <header class="client-extra-hero progress-hero hero-photo hero-photo-progreso">
            <div>
              <span>MI PROGRESO</span>
              <h1>Tu actividad</h1>
              <p>Revisa tu constancia, sesiones y asistencias dentro del mismo espacio Mallqui Gym.</p>
              <button type="button" class="progress-refresh-btn" (click)="actualizarProgresoCompleto()">↻ Actualizar datos</button>
            </div>
          </header>

          <aside class="progress-portal-side">
            <div class="progress-side-head">
              <span>RESUMEN PERSONAL</span>
              <h2>Esta semana</h2>
              <p>Tu avance separa las sesiones de entrenamiento de las asistencias registradas al ingresar al gimnasio.</p>
            </div>
            <div class="progress-side-score">
              <strong>{{progreso?.semana?.cumplimiento || 0}}%</strong>
              <span>meta semanal</span>
              <div><i [style.width.%]="progreso?.semana?.cumplimiento || 0"></i></div>
            </div>
            <div class="progress-side-mini">
              <article><b>{{progreso?.mes?.sesiones_casa || 0}}</b><small>sesiones de entrenamiento</small></article>
              <article><b>{{progreso?.mes?.minutos_entrenados || 0}}</b><small>minutos guiados</small></article>
            </div>
          </aside>
        </section>

        <div class="module-window-title progress-window-title">
          <div><span>RESUMEN DE ACTIVIDAD</span><h2>Tu panel de progreso</h2><p>Consulta cada indicador en una ventana independiente.</p></div>
        </div>

        <section class="client-progress-kpis">
          <article>
            <span>⚡</span>
            <small>ENTRENAMIENTOS</small>
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
          <div class="client-goal-copy">
            <span>META SEMANAL PERSONAL</span>
            <h2>Configura una meta realista</h2>
            <p>Elige entre 1 y 4 sesiones por semana. La meta sirve para organizar tu constancia, no para entrenar en exceso.</p>
          </div>

          <form class="client-goal-form" (ngSubmit)="guardarMeta()">
            <div class="goal-session-control">
              <span>SESIONES POR SEMANA</span>
              <div class="goal-session-options" role="group" aria-label="Sesiones por semana">
                <button type="button"
                        *ngFor="let n of [1,2,3,4]"
                        [class.active]="meta.sesiones_semanales===n"
                        (click)="seleccionarMetaSesiones(n)">
                  <b>{{n}}</b>
                  <small>{{n===1 ? 'sesión' : 'sesiones'}}</small>
                </button>
              </div>
            </div>

            <div class="goal-form-actions">
              <label class="client-reminder-toggle">
                <input type="checkbox" [(ngModel)]="meta.recordatorios" name="meta_recordatorios">
                <span class="reminder-switch" aria-hidden="true"><i></i></span>
                <span class="reminder-copy">
                  <b>Recordatorios</b>
                  <small>{{meta.recordatorios ? 'Activados' : 'Desactivados'}}</small>
                </span>
              </label>

              <button type="submit" class="goal-save-button" [disabled]="guardandoMeta">
                <span>{{guardandoMeta ? 'Guardando...' : 'Guardar meta'}}</span>
                <b *ngIf="!guardandoMeta">→</b>
              </button>
            </div>
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
                <small>{{d.casa ? 'Entreno' : (d.gimnasio ? 'Asistencia' : 'Sin registro')}}</small>
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
                <div><b>Aún no tienes entrenador asignado</b><p>Puedes continuar con tus sesiones guiadas dentro del gimnasio mientras se completa la asignación.</p></div>
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
              <div class="client-empty-block"><b>Aún no hay actividad esta semana</b><p>Cuando registres una asistencia o completes una sesión en el gimnasio aparecerá aquí.</p></div>
            </ng-template>
          </article>

          <article class="client-extra-card">
            <div class="client-card-head"><div><span>HISTORIAL</span><h2>Últimos registros</h2></div><button type="button" class="history-refresh-btn" (click)="cargarHistorial()" title="Actualizar historial">↻</button></div>
            <div class="client-history-tabs">
              <button type="button" [class.active]="historialTab==='casa'" (click)="seleccionarHistorialTab('casa')">Entrenamientos</button>
              <button type="button" [class.active]="historialTab==='gym'" (click)="seleccionarHistorialTab('gym')">Asistencias</button>
              <button type="button" [class.active]="historialTab==='reservas'" (click)="seleccionarHistorialTab('reservas')">Reservas</button>
              <button type="button" [class.active]="historialTab==='pagos'" (click)="seleccionarHistorialTab('pagos')">Pagos</button>
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
            <p>Tu calendario combina reservas, la rutina asignada por Mallqui Gym y fechas de membresía para que tengas claro qué sigue.</p>
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
            <div><small>ENTRENAMIENTOS</small><strong>{{totalEventosTipo('casa')}}</strong><p>sesiones programadas</p></div>
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
              <span><i class="home"></i> Entrenamiento</span>
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
            <div><span>PRÓXIMOS EVENTOS</span><h2>Tu agenda completa</h2><p>Información sincronizada con tus reservas, tu rutina asignada y tu membresía.</p></div>
            <span class="calendar-sync-status"><i></i> Actualizado</span>
          </header>
          <div class="client-calendar-list calendar-list-pro" *ngIf="calendario.length; else emptyCalendar">
            <article *ngFor="let e of calendario">
              <div class="client-date-box">
                <strong>{{diaNumero(e.fecha)}}</strong>
                <small>{{mesCorto(e.fecha)}}</small>
              </div>
              <span
                class="client-event-icon event-photo"
                [class.home]="e.tipo==='casa'"
                [class.membership]="e.tipo==='membresia'"
                [style.background-image]="'url(' + imagenEventoCalendario(e) + ')'">
                <i>{{e.tipo==='clase' ? '▣' : (e.tipo==='casa' ? '⚡' : '✦')}}</i>
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
            <div class="client-empty-block large"><b>No tienes actividades próximas</b><p>Cuando reserves una clase o tengas una rutina asignada por el gimnasio, aparecerá aquí.</p></div>
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
        <section class="club-access-v2">
          <header class="client-extra-hero club-hero hero-photo hero-photo-club club-access-hero">
            <div>
              <span>ACCESO AL GIMNASIO</span>
              <h1>Tu credencial para ingresar a Mallqui Gym</h1>
              <p>Presenta tu código en recepción. El sistema valida tu membresía y registra la entrada o salida.</p>
            </div>
            <button type="button" (click)="cargarClub()">↻ Actualizar</button>
          </header>

          <section class="club-access-grid">
            <article class="client-digital-card club-card-v2">
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
                <div><small>MEMBRESÍA</small><b>{{credencial?.membresia?.membresia?.nombre || 'Sin membresía activa'}}</b></div>
                <div><small>VIGENCIA</small><b>{{credencial?.membresia ? fechaCorta(credencial.membresia.fecha_fin) : '-'}}</b></div>
                <div><small>DÍAS RESTANTES</small><b>{{credencial?.dias_restantes || 0}}</b></div>
              </div>

              <div class="client-access-status"
                   [class.inside]="!!credencial?.asistencia_actual"
                   [class.blocked]="!credencial?.acceso_habilitado">
                <span>{{credencial?.acceso_habilitado ? (credencial?.asistencia_actual ? 'DENTRO DEL GYM' : 'ACCESO HABILITADO') : 'ACCESO NO HABILITADO'}}</span>
                <small>{{credencial?.estado_acceso || 'Sin estado de acceso'}}</small>
              </div>

              <div class="client-card-barcode-wrap" *ngIf="credencialBarcode">
                <img class="client-card-barcode" [src]="credencialBarcode" alt="Código de barras de la credencial">
                <small>Escanea este código en recepción para registrar entrada o salida.</small>
              </div>

              <div class="client-card-footer">
                <span [class.inactive]="credencial?.cliente?.estado!=='Activo'">{{credencial?.cliente?.estado || 'Sin estado'}}</span>
                <button type="button" (click)="imprimirCredencial()">Imprimir credencial</button>
              </div>
            </article>

            <article class="club-access-side">
              <div class="club-access-side-head">
                <span>ESTADO DE ACCESO</span>
                <h2>{{credencial?.asistencia_actual ? 'Actualmente estás dentro' : (credencial?.acceso_habilitado ? 'Listo para ingresar' : 'Acceso no disponible')}}</h2>
                <p>{{credencial?.asistencia_actual ? 'Tu entrada está registrada. Al salir vuelve a presentar tu credencial en recepción.' : (credencial?.acceso_habilitado ? 'Tu membresía está vigente y tu credencial puede ser validada en recepción.' : 'Necesitas una membresía vigente para registrar ingreso.')}}</p>
              </div>

              <div class="club-access-kpis">
                <article>
                  <small>CÓDIGO DE SOCIO</small>
                  <b>{{credencial?.codigo_socio || '-'}}</b>
                </article>
                <article>
                  <small>MEMBRESÍA</small>
                  <b>{{credencial?.membresia?.membresia?.nombre || 'Sin plan'}}</b>
                </article>
                <article>
                  <small>VIGENCIA</small>
                  <b>{{credencial?.membresia ? fechaCorta(credencial.membresia.fecha_fin) : '-'}}</b>
                </article>
                <article>
                  <small>ESTADO</small>
                  <b>{{credencial?.asistencia_actual ? 'Dentro' : 'Fuera'}}</b>
                </article>
              </div>

              <div class="club-access-steps">
                <div><span>1</span><p><b>Muestra tu credencial</b><small>Abre este código desde tu celular.</small></p></div>
                <div><span>2</span><p><b>Escanea en recepción</b><small>El personal valida tu membresía.</small></p></div>
                <div><span>3</span><p><b>Ingreso registrado</b><small>Tu estado cambia a “Dentro”.</small></p></div>
                <div><span>4</span><p><b>Registra tu salida</b><small>Vuelve a escanear al retirarte.</small></p></div>
              </div>

              <div class="club-access-actions">
                <button type="button" (click)="cargarClub()">↻ Actualizar estado</button>
                <button type="button" (click)="imprimirCredencial()">Imprimir credencial</button>
              </div>
            </article>
          </section>

          <section class="club-favorites-v2" *ngIf="clasesClub.length">
            <div class="client-card-head">
              <div><span>CLASES FAVORITAS</span><h2>Guarda tus preferidas</h2><p>{{favoritasCount}} favoritas</p></div>
            </div>
            <div class="client-favorite-list">
              <article *ngFor="let c of clasesClub">
                <button type="button" [class.active]="c.favorita" (click)="toggleFavorita(c)" [attr.aria-label]="c.favorita ? 'Quitar de favoritos' : 'Agregar a favoritos'">★</button>
                <div><b>{{c.nombre}}</b><small>{{c.dia_semana}} · {{hora(c.hora_inicio)}} - {{hora(c.hora_fin)}}</small></div>
                <span>{{c.entrenador ? (c.entrenador.nombres+' '+c.entrenador.apellidos) : 'Sin entrenador'}}</span>
              </article>
            </div>
          </section>

          <section class="club-feedback-v2">
            <article class="club-feedback-card">
              <div class="client-card-head"><div><span>TU OPINIÓN</span><h2>Ayúdanos a mejorar</h2><p>Evalúa el servicio del gimnasio.</p></div></div>
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

            <article class="club-feedback-card">
              <div class="client-card-head"><div><span>HISTORIAL</span><h2>Mis opiniones</h2></div></div>
              <div class="client-opinion-list">
                <article *ngFor="let o of opiniones">
                  <div><b>{{o.categoria}}</b><span>{{estrellas(o.calificacion)}}</span></div>
                  <p>{{o.comentario}}</p>
                  <small>{{fecha(o.fecha)}} · {{o.estado}}</small>
                </article>
                <div class="club-empty-dark" *ngIf="!opiniones.length">
                  <span>★</span><b>Aún no enviaste opiniones</b><p>Cuando quieras, puedes compartir tu experiencia desde este espacio.</p>
                </div>
              </div>
            </article>
          </section>
        </section>
      </ng-container>

      <ng-container *ngIf="modulo==='soporte'">
        <section class="support-center-v2">
          <header class="client-extra-hero support-hero hero-photo hero-photo-ayuda support-center-hero">
            <div>
              <span>CENTRO DE AYUDA · MALLQUI GYM</span>
              <h1>¿Necesitas ayuda?</h1>
              <p>Elige el tipo de consulta, envíala al gimnasio y revisa el estado y la respuesta desde tu cuenta.</p>
            </div>

            <div class="support-hero-stats">
              <article><small>PENDIENTES</small><b>{{soportePendientes}}</b></article>
              <article><small>RESPONDIDAS</small><b>{{soporteRespondidos}}</b></article>
              <article><small>TOTAL</small><b>{{soporte.length}}</b></article>
            </div>
          </header>

          <section class="support-quick-help">
            <div class="support-section-head">
              <div><span>AYUDA RÁPIDA</span><h2>¿Con qué necesitas ayuda?</h2></div>
              <p>Selecciona una opción para preparar la consulta automáticamente.</p>
            </div>

            <div class="support-quick-grid">
              <button type="button" (click)="prepararConsulta('rutina')">
                <span>🏋</span><div><b>Rutina y ejercicios</b><small>Nivel, objetivo, ejercicios y entrenador</small></div><em>→</em>
              </button>
              <button type="button" (click)="prepararConsulta('membresia')">
                <span>✦</span><div><b>Membresía</b><small>Vigencia, renovación o plan contratado</small></div><em>→</em>
              </button>
              <button type="button" (click)="prepararConsulta('pago')">
                <span>▤</span><div><b>Pago o boleta</b><small>Operación, comprobante o pago registrado</small></div><em>→</em>
              </button>
              <button type="button" (click)="prepararConsulta('clase')">
                <span>▣</span><div><b>Clases y reservas</b><small>Horarios, cupos o reserva de clase</small></div><em>→</em>
              </button>
              <button type="button" (click)="prepararConsulta('asistencia')">
                <span>✓</span><div><b>Ingreso y asistencia</b><small>Entrada, salida o credencial de acceso</small></div><em>→</em>
              </button>
              <button type="button" (click)="prepararConsulta('otro')">
                <span>?</span><div><b>Otra consulta</b><small>Escribe directamente al personal</small></div><em>→</em>
              </button>
            </div>
          </section>

          <section class="client-support-contact-strip support-contact-v2">
            <article><span>☎</span><div><small>CONTACTO DIRECTO</small><b>{{gymInfo?.telefono || '939398148'}}</b><p>Personal de Mallqui Gym</p></div></article>
            <article><span>⌖</span><div><small>UBICACIÓN</small><b>{{gymInfo?.direccion || 'Jr. Los Laureles Mz 17 Lt 18'}}</b><p>{{gymInfo?.referencia || 'Referencia: Plaza de Laura Bosso'}}</p></div></article>
            <article><span>◷</span><div><small>HORARIO</small><b>Atención semanal</b><p>{{gymInfo?.horario_detalle || 'Consulta el horario de atención de Mallqui Gym.'}}</p></div></article>
          </section>

          <section class="support-workspace">
            <article class="support-compose-card">
              <div class="support-card-head">
                <div><span>NUEVA CONSULTA</span><h2>Escribir al gimnasio</h2><p>Tu mensaje quedará guardado en tu cuenta.</p></div>
                <b *ngIf="categoriaSoporte">{{categoriaSoporte}}</b>
              </div>

              <form class="client-support-form support-form-v2" (ngSubmit)="enviarSoporte()">
                <label>Asunto
                  <input [(ngModel)]="soporteForm.asunto"
                         name="soporte_asunto"
                         maxlength="150"
                         required
                         placeholder="Ejemplo: consulta sobre mi membresía">
                </label>
                <label>Mensaje
                  <textarea [(ngModel)]="soporteForm.mensaje"
                            name="soporte_mensaje"
                            minlength="5"
                            maxlength="2000"
                            required
                            placeholder="Explica brevemente qué necesitas..."></textarea>
                  <small>{{soporteForm.mensaje.length}} / 2000 caracteres</small>
                </label>
                <button type="submit" [disabled]="enviandoSoporte">
                  <span>{{enviandoSoporte ? 'Enviando...' : 'Enviar consulta'}}</span><b>→</b>
                </button>
              </form>
            </article>

            <article class="support-tracking-card">
              <div class="support-card-head">
                <div><span>MIS CONSULTAS</span><h2>Seguimiento</h2><p>Revisa solicitudes pendientes y respuestas del gimnasio.</p></div>
                <button type="button" (click)="cargarSoporte()" [disabled]="cargando">↻</button>
              </div>

              <div class="support-status-legend">
                <span><i class="pending"></i>Pendiente</span>
                <span><i class="answered"></i>Respondida</span>
              </div>

              <div class="client-support-list support-list-v2">
                <article *ngFor="let s of soporte" [class.support-answered]="s.estado!=='Pendiente' || !!s.respuesta">
                  <div class="support-item-top">
                    <span [class.done]="s.estado!=='Pendiente' || !!s.respuesta">{{s.respuesta ? 'Respondida' : s.estado}}</span>
                    <small>{{fecha(s.fecha)}}</small>
                  </div>

                  <div class="support-item-kind" *ngIf="esSolicitudRutina(s)">
                    <span>🏋</span><b>SOLICITUD DE RUTINA</b>
                  </div>

                  <h3>{{s.asunto}}</h3>
                  <p>{{s.mensaje}}</p>

                  <div class="support-flow">
                    <span class="done">1 <small>Enviada</small></span>
                    <i></i>
                    <span [class.done]="s.estado!=='Pendiente' || !!s.respuesta">2 <small>Revisada</small></span>
                    <i></i>
                    <span [class.done]="!!s.respuesta">3 <small>Respondida</small></span>
                  </div>

                  <div class="client-support-answer" *ngIf="s.respuesta">
                    <span>RESPUESTA DEL GIMNASIO</span>
                    <p>{{s.respuesta}}</p>
                    <small>{{fecha(s.fecha_respuesta)}}</small>
                  </div>
                </article>

                <div class="client-empty-block support-empty-v2" *ngIf="!soporte.length">
                  <span>?</span><b>Aún no tienes consultas</b>
                  <p>Selecciona una categoría y envía tu primera consulta al personal de Mallqui Gym.</p>
                </div>
              </div>
            </article>
          </section>
        </section>
      </ng-container>
    </section>

    <ng-template #loadingTpl>
      <div class="client-extra-loading"><span></span><b>Cargando información...</b></div>
    </ng-template>
  `,
  styles: [`
    :host{display:block}
    .support-center-v2{display:grid;gap:18px}
    .support-center-hero{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:end!important;gap:24px!important}
    .support-hero-stats{display:grid;grid-template-columns:repeat(3,92px);gap:8px;position:relative;z-index:3}
    .support-hero-stats article{min-height:72px;padding:12px;border:1px solid rgba(255,255,255,.14);background:rgba(8,13,17,.48);backdrop-filter:blur(8px)}
    .support-hero-stats small{display:block;color:#ff6b80;font-size:7px;font-weight:950;letter-spacing:1px}
    .support-hero-stats b{display:block;margin-top:6px;color:#fff;font-size:22px}
    .support-quick-help,.support-compose-card,.support-tracking-card{border:1px solid #252c31;background:#0d1114;color:#fff}
    .support-quick-help{padding:24px}
    .support-section-head,.support-card-head{display:flex;align-items:flex-end;justify-content:space-between;gap:20px}
    .support-section-head span,.support-card-head>div>span{display:block;color:#ff3150;font-size:8px;font-weight:950;letter-spacing:1.4px}
    .support-section-head h2,.support-card-head h2{margin:6px 0 0;color:#fff;font-size:24px;letter-spacing:-.5px}
    .support-section-head p,.support-card-head p{margin:4px 0 0;color:#818c93;font-size:9px}
    .support-quick-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;margin-top:18px;border-top:1px solid #272e33;border-left:1px solid #272e33}
    .support-quick-grid button{min-height:86px;display:grid;grid-template-columns:34px minmax(0,1fr) auto;gap:10px;align-items:center;padding:14px;border:0;border-right:1px solid #272e33;border-bottom:1px solid #272e33;background:#101519;color:#fff;text-align:left;cursor:pointer}
    .support-quick-grid button:hover{background:#151b20}
    .support-quick-grid button>span{width:32px;height:32px;display:grid;place-items:center;border:1px solid rgba(255,49,80,.3);background:rgba(255,49,80,.07);color:#ff3150}
    .support-quick-grid b{display:block;font-size:10px}.support-quick-grid small{display:block;margin-top:3px;color:#7e8990;font-size:8px}.support-quick-grid em{font-style:normal;color:#ff3150}
    .support-contact-v2 article{border-radius:0!important;border-color:#272e33!important;background:#101519!important}
    .support-contact-v2 article>span{border-radius:0!important;background:#171d22!important;color:#ff5d74!important}
    .support-contact-v2 b{color:#fff!important}.support-contact-v2 p{color:#7f8990!important}
    .support-workspace{display:grid;grid-template-columns:minmax(360px,.78fr) minmax(0,1.22fr);gap:16px}
    .support-compose-card,.support-tracking-card{padding:22px}
    .support-card-head{align-items:flex-start;padding-bottom:16px;border-bottom:1px solid #272e33}
    .support-card-head>b{padding:7px 9px;border:1px solid rgba(255,49,80,.28);background:rgba(255,49,80,.07);color:#ff6278;font-size:7px;text-transform:uppercase}
    .support-card-head>button{width:38px;height:38px;border:1px solid #30373c;background:#141a1f;color:#fff;cursor:pointer}
    .support-form-v2{display:grid;gap:14px;margin-top:18px}
    .support-form-v2 label{display:grid;gap:7px;color:#c4ccd1;font-size:9px;font-weight:850}
    .support-form-v2 input,.support-form-v2 textarea{width:100%;box-sizing:border-box;border:1px solid #30373c;border-radius:0;background:#141a1f;color:#fff;font:inherit;padding:13px}
    .support-form-v2 input{min-height:48px}.support-form-v2 textarea{min-height:150px;resize:vertical}
    .support-form-v2 input:focus,.support-form-v2 textarea:focus{outline:none;border-color:#ff3150;box-shadow:0 0 0 2px rgba(255,49,80,.08)}
    .support-form-v2 label>small{justify-self:end;color:#667178;font-size:7px}
    .support-form-v2>button{min-height:48px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;border:1px solid #ff3150;background:#ff3150;color:#fff;font-size:9px;font-weight:950;cursor:pointer}
    .support-form-v2>button:disabled{opacity:.6;cursor:wait}
    .support-status-legend{display:flex;gap:14px;padding:12px 0;color:#7f8990;font-size:8px}
    .support-status-legend span{display:flex;align-items:center;gap:6px}.support-status-legend i{width:7px;height:7px;border-radius:50%;background:#f0ad4e}.support-status-legend i.answered{background:#43c884}
    .support-list-v2{display:grid;gap:10px;max-height:590px;overflow:auto;padding-right:4px}
    .support-list-v2>article{padding:16px;border:1px solid #2a3136;border-radius:0;background:#11171b}
    .support-list-v2>article.support-answered{border-left:3px solid #43c884}
    .support-item-top{display:flex;align-items:center;justify-content:space-between;gap:12px}
    .support-item-top>span{padding:5px 7px;background:rgba(240,173,78,.10);color:#e7b45f;font-size:7px;font-weight:950;text-transform:uppercase}
    .support-item-top>span.done{background:rgba(67,200,132,.09);color:#69d79f}
    .support-item-top small{color:#758087;font-size:7px}
    .support-item-kind{display:flex;align-items:center;gap:7px;margin-top:12px;color:#ff6077}.support-item-kind b{font-size:7px;letter-spacing:1px}
    .support-list-v2 h3{margin:7px 0;color:#fff;font-size:12px}.support-list-v2>article>p{margin:0;color:#99a3a9;font-size:9px;line-height:1.55}
    .support-flow{display:grid;grid-template-columns:auto 1fr auto 1fr auto;align-items:center;gap:7px;margin-top:14px;padding-top:12px;border-top:1px solid #262d32}
    .support-flow>span{width:26px;height:26px;display:grid;place-items:center;border:1px solid #333b41;color:#6f7a81;font-size:8px;font-weight:900}
    .support-flow>span.done{border-color:rgba(67,200,132,.38);color:#69d79f;background:rgba(67,200,132,.05)}
    .support-flow>span small{display:none}.support-flow>i{height:1px;background:#30373c}
    .client-support-answer{margin-top:14px;padding:13px;border:1px solid rgba(67,200,132,.28);background:rgba(67,200,132,.05)}
    .client-support-answer>span,.client-support-answer>b{display:block;color:#69d79f;font-size:7px;font-weight:950;letter-spacing:1px}
    .client-support-answer p{margin:7px 0;color:#d4dadd!important;font-size:9px!important;line-height:1.5}.client-support-answer small{color:#7d888e;font-size:7px}
    .support-empty-v2{padding:36px 18px!important;border:1px dashed #343c42!important;background:#11171b!important;text-align:center}.support-empty-v2>span{display:block;margin:auto auto 10px;width:34px;height:34px;line-height:34px;border:1px solid #333c42;color:#ff6077}
    .club-access-v2{display:grid;gap:18px}
    .club-access-grid{display:grid;grid-template-columns:minmax(360px,.75fr) minmax(0,1.25fr);gap:16px}
    .club-card-v2{border-radius:0!important;border:1px solid #2a3136!important;box-shadow:none!important}
    .club-access-side{padding:24px;border:1px solid #2a3136;background:#0d1114;color:#fff}
    .club-access-side-head>span{display:block;color:#ff3150;font-size:8px;font-weight:950;letter-spacing:1.4px}
    .club-access-side-head h2{margin:7px 0 6px;color:#fff;font-size:27px;letter-spacing:-.6px}
    .club-access-side-head p{margin:0;color:#8a959c;font-size:10px;line-height:1.55}
    .club-access-kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));margin-top:20px;border-top:1px solid #272e33;border-left:1px solid #272e33}
    .club-access-kpis article{min-height:86px;padding:14px;border-right:1px solid #272e33;border-bottom:1px solid #272e33;background:#101519}
    .club-access-kpis small{display:block;color:#ff6077;font-size:7px;font-weight:950;letter-spacing:1px}
    .club-access-kpis b{display:block;margin-top:6px;color:#fff;font-size:13px}
    .club-access-steps{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));margin-top:16px;border-top:1px solid #272e33;border-left:1px solid #272e33}
    .club-access-steps>div{display:grid;grid-template-columns:30px 1fr;gap:9px;min-height:80px;padding:13px;border-right:1px solid #272e33;border-bottom:1px solid #272e33;background:#101519}
    .club-access-steps>div>span{width:28px;height:28px;display:grid;place-items:center;border:1px solid rgba(255,49,80,.3);background:rgba(255,49,80,.07);color:#ff3150;font-size:8px;font-weight:950}
    .club-access-steps p{margin:0}.club-access-steps b{display:block;color:#fff;font-size:9px}.club-access-steps small{display:block;margin-top:3px;color:#7d888f;font-size:8px}
    .club-access-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:16px}
    .club-access-actions button{min-height:42px;padding:0 14px;border:1px solid #30373c;background:#141a1f;color:#fff;font-size:8px;font-weight:950;cursor:pointer}
    .club-access-actions button:first-child{border-color:#ff3150;background:#ff3150}
    .club-favorites-v2,.club-feedback-card{padding:22px;border:1px solid #2a3136;background:#0d1114;color:#fff}
    .club-favorites-v2 .client-card-head h2,.club-feedback-card .client-card-head h2{color:#fff!important}
    .club-favorites-v2 .client-card-head span,.club-feedback-card .client-card-head span{color:#ff3150!important}
    .club-favorites-v2 .client-card-head p,.club-feedback-card .client-card-head p{color:#7f8a91!important}
    .club-favorites-v2 .client-favorite-list{margin-top:14px}
    .club-favorites-v2 .client-favorite-list>article{border-radius:0!important;border-color:#2c3439!important;background:#11171b!important;color:#fff!important}
    .club-favorites-v2 .client-favorite-list b{color:#fff!important}.club-favorites-v2 .client-favorite-list small,.club-favorites-v2 .client-favorite-list>article>span{color:#7f8a91!important}
    .club-feedback-v2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
    .club-feedback-card .client-feedback-form{margin-top:16px}
    .club-feedback-card .client-feedback-form label{color:#c7cfd4!important}
    .club-feedback-card .client-feedback-form select,.club-feedback-card .client-feedback-form textarea{border-radius:0!important;border-color:#30373c!important;background:#141a1f!important;color:#fff!important}
    .club-feedback-card .client-feedback-form>button{border-radius:0!important;background:#ff3150!important;color:#fff!important}
    .club-feedback-card .client-opinion-list>article{border-radius:0!important;border-color:#2c3439!important;background:#11171b!important;color:#fff!important}
    .club-feedback-card .client-opinion-list b{color:#fff!important}.club-feedback-card .client-opinion-list p,.club-feedback-card .client-opinion-list small{color:#8a959c!important}
    .club-empty-dark{padding:34px 18px;border:1px dashed #343c42;background:#11171b;text-align:center}
    .club-empty-dark>span{display:block;width:36px;height:36px;line-height:36px;margin:0 auto 10px;border:1px solid #333c42;color:#ff6077}.club-empty-dark>b{display:block;color:#fff;font-size:10px}.club-empty-dark>p{margin:6px 0 0;color:#7f8a91;font-size:8px}
    @media(max-width:980px){.support-workspace{grid-template-columns:1fr}.support-quick-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.support-center-hero{grid-template-columns:1fr!important}.support-hero-stats{grid-template-columns:repeat(3,minmax(0,1fr));width:100%}.club-access-grid,.club-feedback-v2{grid-template-columns:1fr}}
    @media(max-width:620px){.support-quick-help,.support-compose-card,.support-tracking-card{padding:16px}.support-quick-grid{grid-template-columns:1fr}.support-hero-stats{grid-template-columns:1fr}.support-section-head{align-items:flex-start;flex-direction:column}.support-list-v2{max-height:none}.club-access-side,.club-favorites-v2,.club-feedback-card{padding:16px}.club-access-kpis,.club-access-steps{grid-template-columns:1fr}}
  `]
})
export class ClienteExperienciaComponent implements OnInit, OnChanges {
  @Input() modulo = 'progreso';
  @Input() gymInfo: any = {};
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
  categoriaSoporte = '';

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

  cargarProgreso(mostrarAviso = false): void {
    this.cargando = true;
    this.api.progresoCliente().subscribe({
      next: r => {
        this.progreso = r;
        this.cargando = false;
        if (mostrarAviso) this.mostrarToast('Progreso actualizado.');
      },
      error: e => {
        if (e?.status === 401 || e?.status === 403) {
          this.error = this.mensajeError(e);
        } else {
          this.progreso = this.progreso || {
            semana: {
              meta_sesiones: Number(this.meta?.sesiones_semanales || 3),
              sesiones_casa: 0,
              sesiones_gym: 0,
              asistencias_gimnasio: 0,
              cumplimiento: 0,
              dias: []
            },
            mes: {
              sesiones_casa: 0,
              sesiones_gym: 0,
              minutos_entrenados: 0,
              asistencias_gimnasio: 0
            },
            ultimas_actividades: []
          };
          this.error = '';
        }
        this.cargando = false;
      }
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

  seleccionarMetaSesiones(sesiones: number): void {
    this.meta = {
      ...this.meta,
      sesiones_semanales: Math.max(1, Math.min(4, Number(sesiones || 1)))
    };
  }

  actualizarProgresoCompleto(): void {
    this.error = '';
    this.cargarProgreso(true);
    this.cargarMeta();
    this.cargarEntrenador();
    this.cargarHistorial();
  }

  seleccionarHistorialTab(tab: 'casa' | 'gym' | 'reservas' | 'pagos'): void {
    this.historialTab = tab;
    if (!this.historial) this.cargarHistorial();
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
    if (t==='casa') return 'Entrenamiento en el gimnasio';
    if (t==='membresia') return 'Membresía';
    return 'Clase del gimnasio';
  }

  imagenEventoCalendario(e:any): string {
    const tipo=String(e?.tipo||'').toLowerCase();
    const detalle=String(e?.detalle||'').toLowerCase();
    if(tipo==='membresia'){
      return 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=240&q=82';
    }
    if(tipo==='clase'){
      return 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=240&q=82';
    }
    if(detalle.includes('pierna')){
      return 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=240&q=82';
    }
    if(detalle.includes('brazo')){
      return 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=240&q=82';
    }
    if(detalle.includes('core') || detalle.includes('abdomen')){
      return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=240&q=82';
    }
    return 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=240&q=82';
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

  get credencialBarcode(): string {
    const codigo=String(this.credencial?.codigo_barras || this.credencial?.codigo_socio || '').trim();
    return codigo ? code128DataUri(codigo,{height:52,module:2,quiet:12,text:true}) : '';
  }

  imprimirCredencial(): void {
    if(!this.credencial)return;
    const codigo=String(this.credencial?.codigo_barras || this.credencial?.codigo_socio || '');
    const barcode=code128Svg(codigo,{height:58,module:2,quiet:14,text:true});
    const gimnasio=this.credencial?.gimnasio || {};
    const plan=this.credencial?.membresia?.membresia?.nombre || 'Sin membresía activa';
    const vigencia=this.credencial?.membresia?.fecha_fin ? this.fechaCorta(this.credencial.membresia.fecha_fin) : '-';
    const html=`<!doctype html><html><head><meta charset="utf-8"><title>Credencial Mallqui Gym</title><style>
      body{font-family:Arial,sans-serif;background:#eef3f6;padding:30px;color:#102f4b}
      .card{max-width:620px;margin:auto;background:#fff;border:1px solid #dbe4ea;border-radius:20px;padding:24px;box-shadow:0 12px 35px rgba(16,47,75,.12)}
      h1{margin:0 0 4px;font-size:24px}.muted{color:#6d8190}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:18px 0}
      .item{padding:12px;border-radius:12px;background:#f6f9fb}.item small{display:block;color:#7a8d9c;font-size:10px;font-weight:700}.item b{display:block;margin-top:4px}
      .barcode{text-align:center;margin-top:18px;padding:16px;background:#fff;border:1px dashed #ccd8df;border-radius:12px}
      .state{display:inline-block;padding:7px 10px;border-radius:999px;background:#e8f7ee;color:#1e6a3d;font-weight:700;font-size:11px}
      @media print{body{background:#fff;padding:0}.card{box-shadow:none;border-color:#bbb}}
    </style></head><body><div class="card">
      <h1>${gimnasio.nombre || 'Mallqui Gym'}</h1>
      <div class="muted">Credencial digital de socio</div>
      <p><span class="state">${this.credencial?.estado_acceso || 'Acceso'}</span></p>
      <div class="grid">
        <div class="item"><small>SOCIO</small><b>${this.nombreSocio}</b></div>
        <div class="item"><small>CÓDIGO</small><b>${codigo}</b></div>
        <div class="item"><small>MEMBRESÍA</small><b>${plan}</b></div>
        <div class="item"><small>VIGENCIA</small><b>${vigencia}</b></div>
      </div>
      <div class="barcode">${barcode}<div class="muted">Presentar en recepción</div></div>
    </div><script>window.print()<\/script></body></html>`;
    const w=window.open('','_blank');
    if(w){w.document.write(html);w.document.close();}
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
      error: e => {
        if (e?.status === 401 || e?.status === 403) {
          this.error = this.mensajeError(e);
        } else {
          this.notificaciones = { no_leidas: 0, items: [] };
          this.notificacionesCambio.emit(0);
          this.error = '';
        }
        this.cargando = false;
      }
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

  get soportePendientes(): number {
    return (this.soporte || []).filter((s: any) => String(s?.estado || '').toLowerCase() === 'pendiente' && !s?.respuesta).length;
  }

  get soporteRespondidos(): number {
    return (this.soporte || []).filter((s: any) => Boolean(s?.respuesta) || String(s?.estado || '').toLowerCase() !== 'pendiente').length;
  }

  esSolicitudRutina(s: any): boolean {
    return String(s?.asunto || '').toLowerCase().includes('rutina');
  }

  prepararConsulta(tipo: 'rutina' | 'membresia' | 'pago' | 'clase' | 'asistencia' | 'otro'): void {
    const plantillas: Record<string, { categoria: string; asunto: string; mensaje: string }> = {
      rutina: {
        categoria: 'Rutina y ejercicios',
        asunto: 'Consulta sobre mi rutina',
        mensaje: 'Necesito ayuda con mi rutina de entrenamiento. Quisiera revisar mi objetivo, nivel, ejercicios o indicaciones del entrenador.'
      },
      membresia: {
        categoria: 'Membresía',
        asunto: 'Consulta sobre mi membresía',
        mensaje: 'Necesito ayuda con el estado, vigencia o renovación de mi membresía.'
      },
      pago: {
        categoria: 'Pago o boleta',
        asunto: 'Consulta sobre pago o boleta',
        mensaje: 'Necesito ayuda con un pago, número de operación o comprobante de mi membresía.'
      },
      clase: {
        categoria: 'Clases y reservas',
        asunto: 'Consulta sobre clases o reservas',
        mensaje: 'Necesito ayuda con horarios, disponibilidad o una reserva de clase.'
      },
      asistencia: {
        categoria: 'Ingreso y asistencia',
        asunto: 'Consulta sobre ingreso o asistencia',
        mensaje: 'Necesito ayuda con mi credencial, registro de entrada, salida o historial de asistencias.'
      },
      otro: {
        categoria: 'Otra consulta',
        asunto: '',
        mensaje: ''
      }
    };

    const p = plantillas[tipo];
    this.categoriaSoporte = p.categoria;
    this.soporteForm = { asunto: p.asunto, mensaje: p.mensaje };

    setTimeout(() => {
      document.querySelector('.support-compose-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
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

    const esRutina = this.soporteForm.asunto.trim().toLowerCase().includes('rutina');
    const rutinaPendiente = esRutina && (this.soporte || []).some((s: any) =>
      String(s?.estado || '').toLowerCase() === 'pendiente' &&
      String(s?.asunto || '').toLowerCase().includes('rutina') &&
      !s?.respuesta
    );

    if (rutinaPendiente) {
      this.error = 'Ya tienes una solicitud de rutina pendiente. Espera la respuesta del gimnasio o usa esa misma consulta para el seguimiento.';
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
        this.categoriaSoporte = '';
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
