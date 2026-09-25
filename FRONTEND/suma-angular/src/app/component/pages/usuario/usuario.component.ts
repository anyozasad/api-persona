import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth.service';
import { GymApiService } from '../../../core/services/gym-api.service';
import { ClienteExperienciaComponent } from './cliente-experiencia.component';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, ClienteExperienciaComponent],
  styleUrls: ['../mallqui-member.css'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="member-page">
      <header class="member-topbar member-enter-down">
        <button type="button" class="member-brand" (click)="abrirModulo('inicio')" aria-label="Ir al inicio del portal">
          <img src="assets/mallqui-logo.svg" alt="Mallqui Gym">
          <span><b>MALLQUI GYM</b><small>Portal del cliente</small></span>
        </button>

        <nav class="member-nav" aria-label="Navegación del cliente">
          <button type="button" [class.active]="moduloActivo==='inicio'" (click)="abrirModulo('inicio')"><i>⌂</i><span>Inicio</span></button>
          <button type="button" [class.active]="moduloActivo==='rutinas'" (click)="abrirModulo('rutinas')"><i>🏋</i><span>Rutinas</span></button>
          <button type="button" [class.active]="moduloActivo==='casa'" (click)="abrirModulo('casa')"><i>⚡</i><span>En casa</span></button>
          <button type="button" [class.active]="moduloActivo==='clases'" (click)="abrirModulo('clases')"><i>▣</i><span>Clases</span></button>
          <button type="button" [class.active]="moduloActivo==='reservas'" (click)="abrirModulo('reservas')"><i>◷</i><span>Reservas</span></button>
          <button type="button" [class.active]="moduloActivo==='asistencias'" (click)="abrirModulo('asistencias')"><i>✓</i><span>Asistencias</span></button>
          <button type="button" [class.active]="moduloActivo==='progreso'" (click)="abrirModulo('progreso')"><i>◎</i><span>Progreso</span></button>
          <button type="button" [class.active]="moduloActivo==='calendario'" (click)="abrirModulo('calendario')"><i>◫</i><span>Calendario</span></button>
          <button type="button" [class.active]="moduloActivo==='avisos'" (click)="abrirModulo('avisos')"><i>●</i><span>Avisos</span></button>
          <button type="button" [class.active]="moduloActivo==='pagos'" (click)="abrirModulo('pagos')"><i>▤</i><span>Pagos</span></button>
          <button type="button" [class.active]="moduloActivo==='soporte'" (click)="abrirModulo('soporte')"><i>?</i><span>Soporte</span></button>
          <button type="button" [class.active]="moduloActivo==='perfil'" (click)="abrirModulo('perfil')"><i>♙</i><span>Perfil</span></button>
        </nav>

        <div class="member-user-actions">
          <div class="member-mini-profile">
            <span>{{nombreCorto.charAt(0).toUpperCase()}}</span>
            <div><b>{{nombreCorto}}</b><small>Cliente Mallqui</small></div>
          </div>
          <button class="member-logout" type="button" (click)="cerrarSesion()">Cerrar sesión</button>
        </div>
      </header>

      <main class="member-main" *ngIf="!cargando; else cargandoTpl">
        <div *ngIf="error" class="member-toast error-toast">{{error}}</div>
        <div *ngIf="toast" class="member-toast success-toast">{{toast}}</div>

        <section *ngIf="moduloActivo==='inicio'" class="member-dashboard">
          <section class="member-hero member-enter-up">
            <div class="member-hero-copy">
              <span class="member-kicker">PORTAL DEL CLIENTE</span>
              <h1>Hola, <strong>{{nombreCorto}}</strong></h1>
              <p>Tu espacio personal para revisar membresía, rutinas, clases, reservas, asistencias y pagos en un solo lugar.</p>

              <div class="member-hero-actions">
                <button type="button" class="member-primary-action" (click)="abrirModulo('casa')">Entrenar en casa <span>→</span></button>
                <button type="button" class="member-secondary-action" (click)="abrirModulo('rutinas')">Ver mis rutinas</button>
                <button type="button" class="member-secondary-action" (click)="abrirModulo('clases')">Explorar clases</button>
              </div>

              <div class="member-trust-row">
                <span>✓ Datos sincronizados</span>
                <span>✓ Acceso seguro</span>
                <span>✓ Información en tiempo real</span>
              </div>
            </div>

            <aside class="member-coach-card">
              <div class="coach-glow"></div>

              <ng-container *ngIf="rutinaActual?.entrenador; else sinEntrenador">
                <span class="coach-badge">ENTRENADOR ASIGNADO</span>
                <div class="coach-avatar-large">{{nombreEntrenador.charAt(0).toUpperCase()}}</div>
                <h3>{{nombreEntrenador}}</h3>
                <p>{{rutinaActual?.objetivo || 'Tu entrenador todavía no registró un objetivo para esta rutina.'}}</p>
                <div class="coach-tags">
                  <span>Seguimiento</span><span>Progreso</span><span>Constancia</span>
                </div>
              </ng-container>

              <ng-template #sinEntrenador>
                <span class="coach-badge">ENTRENADOR</span>
                <div class="coach-avatar-large coach-avatar-empty">?</div>
                <h3>Pendiente de asignación</h3>
                <p>Tu cuenta está activa. Mientras te asignan un entrenador puedes configurar y realizar sesiones guiadas en casa.</p>
                <button type="button" class="coach-home-button" (click)="abrirModulo('casa')">⚡ Entrenar en casa</button>
              </ng-template>
            </aside>
          </section>

          <section class="member-stats premium-stats">
            <article class="member-stat-card stat-plan">
              <div class="stat-top"><span class="stat-icon">✦</span><small>MEMBRESÍA</small></div>
              <h2>{{membresiaActual?.membresia?.nombre || 'Sin plan activo'}}</h2>
              <p *ngIf="membresiaActual">Vence: {{fecha(membresiaActual.fecha_fin)}}</p>
              <p *ngIf="!membresiaActual">Elige un plan para comenzar.</p>
              <button type="button" (click)="abrirModulo('pagos')">Ver membresía →</button>
            </article>

            <article class="member-stat-card stat-attendance">
              <div class="stat-top"><span class="stat-icon">✓</span><small>ASISTENCIAS</small></div>
              <h2>{{resumen?.asistencias_mes || 0}}</h2>
              <p>Registros durante este mes</p>
              <div class="mini-progress"><i [style.width.%]="(resumen?.asistencias_mes || 0) > 20 ? 100 : (resumen?.asistencias_mes || 0) * 5"></i></div>
            </article>

            <article class="member-stat-card stat-routine">
              <div class="stat-top"><span class="stat-icon">🏋</span><small>RUTINAS</small></div>
              <h2>{{rutinas.length}}</h2>
              <p>{{rutinaActual?.nombre_rutina || 'Sin rutina activa'}}</p>
              <button type="button" (click)="abrirModulo('rutinas')">Abrir rutinas →</button>
            </article>

            <article class="member-stat-card stat-booking">
              <div class="stat-top"><span class="stat-icon">◷</span><small>RESERVAS</small></div>
              <h2>{{reservasActivas.length}}</h2>
              <p>Clases reservadas actualmente</p>
              <button type="button" (click)="abrirModulo('reservas')">Ver reservas →</button>
            </article>
          </section>

          <section class="member-onboarding member-enter-up">
            <div class="member-onboarding-head">
              <div>
                <span>RUTA DEL CLIENTE</span>
                <h2>Empieza por aquí</h2>
                <p>El sistema te guía paso a paso para que no encuentres pantallas vacías.</p>
              </div>
              <div class="onboarding-progress">
                <strong>{{porcentajeInicio}}%</strong>
                <span>configurado</span>
              </div>
            </div>

            <div class="onboarding-track">
              <button type="button" [class.done]="perfilCompleto" (click)="abrirModulo('perfil')">
                <span>{{perfilCompleto ? '✓' : '1'}}</span>
                <div><b>Completa tu perfil</b><small>{{perfilCompleto ? 'Datos listos' : 'Teléfono y dirección'}}</small></div>
                <em>→</em>
              </button>

              <button type="button" [class.done]="!!membresiaActual" (click)="abrirModulo('pagos')">
                <span>{{membresiaActual ? '✓' : '2'}}</span>
                <div><b>Activa tu membresía</b><small>{{membresiaActual ? 'Plan activo' : 'Elige un plan y registra tu pago'}}</small></div>
                <em>→</em>
              </button>

              <button type="button" [class.done]="casaCargado" class="onboarding-home" (click)="abrirModulo('casa')">
                <span>3</span>
                <div><b>Entrena en casa</b><small>Elige músculos, días, repeticiones y temporizador</small></div>
                <em>→</em>
              </button>

              <button type="button" [class.done]="reservasActivas.length>0" (click)="abrirModulo('clases')">
                <span>{{reservasActivas.length>0 ? '✓' : '4'}}</span>
                <div><b>Reserva una clase</b><small>{{reservasActivas.length>0 ? 'Ya tienes una reserva' : 'Explora horarios disponibles'}}</small></div>
                <em>→</em>
              </button>

              <button type="button" [class.done]="actividadRegistrada" (click)="abrirModulo('asistencias')">
                <span>{{actividadRegistrada ? '✓' : '5'}}</span>
                <div><b>Revisa tu progreso</b><small>Asistencias, sesiones y actividad</small></div>
                <em>→</em>
              </button>
            </div>
          </section>

          <section *ngIf="casaCargado" class="member-home-today-card member-enter-up">
            <div class="home-today-copy">
              <span class="home-today-kicker"><i></i> ENTRENAMIENTO EN CASA · HOY</span>

              <ng-container *ngIf="entrenamientoCasaHoy?.activo; else hoyDescanso">
                <h2>{{entrenamientoCasaHoy?.zona?.icono}} Hoy toca {{entrenamientoCasaHoy?.zona?.nombre}}</h2>
                <p>
                  {{entrenamientoCasaHoy?.ejercicios}} ejercicios ·
                  {{entrenamientoCasaHoy?.minutos}} min aprox. ·
                  objetivo {{metaObjetivoCasa(planCasa.objetivo).nombre.toLowerCase()}}.
                </p>
                <div class="home-today-tags">
                  <span>Guía paso a paso</span>
                  <span>Repeticiones por lado</span>
                  <span>Descansos automáticos</span>
                </div>
              </ng-container>

              <ng-template #hoyDescanso>
                <h2>Hoy no tienes sesión programada</h2>
                <p>Puedes mantener tu día de recuperación o elegir una sesión moderada si deseas entrenar en casa.</p>
                <div class="home-today-tags">
                  <span>Plan semanal</span>
                  <span>Sesiones moderadas</span>
                  <span>Historial guardado</span>
                </div>
              </ng-template>
            </div>

            <button type="button" class="home-today-start" (click)="prepararEntrenamientoCasaHoy()">
              <span>{{entrenamientoCasaHoy?.activo ? '▶' : '⚡'}}</span>
              <div>
                <b>{{entrenamientoCasaHoy?.activo ? 'Empezar sesión de hoy' : 'Elegir entrenamiento'}}</b>
                <small>{{entrenamientoCasaHoy?.activo ? 'Ver ejercicios y comenzar' : 'Piernas, brazos, core y más'}}</small>
              </div>
              <em>→</em>
            </button>
          </section>

          <section class="member-quick-section">
            <div class="section-heading-member">
              <div><span>ACCESOS RÁPIDOS</span><h2>¿Qué quieres hacer hoy?</h2></div>
            </div>
            <div class="member-quick-actions">
              <button type="button" class="home-training-quick" (click)="abrirModulo('casa')"><i>⚡</i><b>Entrenar en casa</b><small>Temporizador y guía paso a paso</small><em>→</em></button>
              <button type="button" (click)="abrirModulo('rutinas')"><i>🏋</i><b>Mis rutinas</b><small>Revisa tu plan de ejercicios</small><em>→</em></button>
              <button type="button" (click)="abrirModulo('clases')"><i>▣</i><b>Clases</b><small>Explora horarios disponibles</small><em>→</em></button>
              <button type="button" (click)="abrirModulo('reservas')"><i>◷</i><b>Reservas</b><small>Administra tus clases</small><em>→</em></button>
              <button type="button" (click)="abrirModulo('pagos')"><i>▤</i><b>Pagos</b><small>Consulta tus movimientos</small><em>→</em></button>
              <button type="button" (click)="abrirModulo('perfil')"><i>♙</i><b>Mi perfil</b><small>Actualiza tus datos</small><em>→</em></button>
            </div>
          </section>

          <section class="member-home-grid">
            <article class="member-panel-card routine-highlight">
              <div class="panel-head">
                <div><span>PRÓXIMA RUTINA</span><h2>Tu entrenamiento</h2></div>
                <button type="button" (click)="abrirModulo('rutinas')">Ver todas →</button>
              </div>

              <ng-container *ngIf="rutinaActual; else sinRutina">
                <div class="routine-feature">
                  <div class="routine-visual"><span>🏋</span></div>
                  <div class="routine-info">
                    <span class="routine-status">RUTINA ACTIVA</span>
                    <h3>{{rutinaActual.nombre_rutina}}</h3>
                    <p>{{rutinaActual.descripcion || rutinaActual.objetivo}}</p>
                    <button type="button" (click)="abrirModulo('rutinas')">Ver ejercicios</button>
                  </div>
                </div>
              </ng-container>

              <ng-template #sinRutina>
                <div class="member-empty-state member-empty-action">
                  <span>🏋</span>
                  <h3>Aún no tienes una rutina del entrenador</h3>
                  <p>Cuando te asignen una aparecerá aquí. Mientras tanto puedes comenzar una sesión guiada en casa con temporizador y ejercicios paso a paso.</p>
                  <div class="empty-action-row">
                    <button type="button" class="member-empty-primary" (click)="abrirModulo('casa')">⚡ Entrenar en casa</button>
                    <button type="button" class="member-empty-secondary" (click)="abrirModulo('clases')">Ver clases</button>
                  </div>
                </div>
              </ng-template>
            </article>

            <aside class="member-side-stack">
              <article class="member-panel-card progress-card">
                <div class="panel-head compact"><div><span>PROGRESO</span><h2>Tu actividad</h2></div></div>
                <div class="progress-metric">
                  <div><span>Asistencias del mes</span><b>{{resumen?.asistencias_mes || 0}}</b></div>
                  <div class="progress-line"><i [style.width.%]="(resumen?.asistencias_mes || 0) > 20 ? 100 : (resumen?.asistencias_mes || 0) * 5"></i></div>
                </div>
                <div class="progress-metric">
                  <div><span>Rutinas activas</span><b>{{rutinas.length}}</b></div>
                  <div class="progress-line red"><i [style.width.%]="rutinas.length > 5 ? 100 : rutinas.length * 20"></i></div>
                </div>
                <div class="progress-metric">
                  <div><span>Reservas activas</span><b>{{reservasActivas.length}}</b></div>
                  <div class="progress-line green"><i [style.width.%]="reservasActivas.length > 5 ? 100 : reservasActivas.length * 20"></i></div>
                </div>
              </article>

              <article class="member-panel-card account-health-card">
                <div class="account-health-icon">✓</div>
                <div><span>ESTADO DE CUENTA</span><h3>Todo listo para entrenar</h3><p>Tu cuenta está activa y sincronizada con Mallqui Gym.</p></div>
              </article>
            </aside>
          </section>

          <section class="member-panel-card member-payments-home">
            <div class="panel-head">
              <div><span>MOVIMIENTOS</span><h2>Últimos pagos</h2></div>
              <button type="button" (click)="abrirModulo('pagos')">Ver historial →</button>
            </div>

            <div *ngIf="pagos.length; else sinPagosHome" class="member-payment-list">
              <div *ngFor="let p of pagos.slice(0,4)" class="member-payment-item">
                <span class="payment-icon">▤</span>
                <p><b>{{p.cliente_membresia?.membresia?.nombre || 'Membresía'}}</b><small>{{fecha(p.fecha_pago)}}</small></p>
                <strong>S/ {{p.monto}}</strong>
                <em [class.pending]="p.estado_pago!=='Pagado'">{{p.estado_pago}}</em>
              </div>
            </div>

            <ng-template #sinPagosHome>
              <div class="member-empty-state compact-empty">
                <span>▤</span><h3>Todavía no hay pagos registrados</h3><p>Cuando tengas movimientos aparecerán en este espacio.</p>
              </div>
            </ng-template>
          </section>
        </section>

        <section *ngIf="moduloActivo==='casa'" class="member-module home-training-module member-enter-up">
          <div class="member-module-hero home-training-hero">
            <div>
              <span>ENTRENAMIENTO EN CASA</span>
              <h1>Elige qué quieres fortalecer hoy</h1>
              <p>Tu sesión te indica el grupo muscular, las repeticiones, cuándo cambiar de lado, el descanso y qué ejercicio continúa.</p>
            </div>
            <div class="module-hero-icon home-training-icon">⚡</div>
          </div>

          <div *ngIf="errorCasa" class="home-training-alert">{{errorCasa}}</div>

          <section class="home-plan-layout">
            <article class="member-module-card home-plan-card">
              <div class="card-title-block">
                <span>OBJETIVO Y DÍAS</span>
                <h2>Configura tu entrenamiento</h2>
                <p>Elige un objetivo general y hasta 4 días por semana. Las sesiones son moderadas y guiadas.</p>
              </div>

              <div class="home-goal-selector">
                <button *ngFor="let objetivo of objetivosCasaMeta"
                        type="button"
                        [class.active]="planCasa.objetivo===objetivo.id"
                        (click)="seleccionarObjetivoCasa(objetivo.id)">
                  <span>{{objetivo.icono}}</span>
                  <div><b>{{objetivo.nombre}}</b><small>{{objetivo.descripcion}}</small></div>
                  <i>{{planCasa.objetivo===objetivo.id ? '✓' : ''}}</i>
                </button>
              </div>

              <div class="home-days-selector">
                <button *ngFor="let dia of diasSemanaCasa"
                        type="button"
                        [class.active]="planCasa.dias.includes(dia)"
                        (click)="toggleDiaCasa(dia)">
                  <b>{{dia.slice(0,3)}}</b>
                  <small>{{planCasa.dias.includes(dia) ? 'Entreno' : 'Descanso'}}</small>
                </button>
              </div>

              <div class="home-plan-zones">
                <span>GRUPOS PARA TU SEMANA</span>
                <div>
                  <button *ngFor="let zona of zonasCasaMeta"
                          type="button"
                          [class.active]="planCasa.zonas.includes(zona.id)"
                          (click)="toggleZonaCasa(zona.id)">
                    <i>{{zona.icono}}</i>{{zona.nombre}}
                  </button>
                </div>
              </div>

              <button type="button" class="home-save-plan" (click)="guardarPlanCasa()">Guardar plan semanal</button>
            </article>

            <article class="member-module-card home-week-card">
              <div class="card-title-block">
                <span>ESTA SEMANA</span>
                <h2>Tu agenda en casa</h2>
                <p>{{planCasa.dias.length}} días programados</p>
              </div>

              <div class="home-week-list">
                <div *ngFor="let item of agendaCasaSemanal" [class.active]="item.activo" [class.today]="item.hoy">
                  <span class="week-day">{{item.dia.slice(0,3)}}</span>
                  <div *ngIf="item.activo; else descansoCasa">
                    <b>{{item.zona?.icono}} {{item.zona?.nombre}}</b>
                    <small>{{item.ejercicios}} ejercicios · {{item.minutos}} min aprox.</small>
                  </div>
                  <ng-template #descansoCasa>
                    <div><b>Recuperación</b><small>Sin sesión programada</small></div>
                  </ng-template>
                  <em *ngIf="item.hoy">HOY</em>
                </div>
              </div>
            </article>
          </section>

          <section *ngIf="!sesionCasaActiva && !sesionCasaTerminada" class="home-workout-picker">
            <div class="home-picker-head">
              <div>
                <span>GRUPO MUSCULAR</span>
                <h2>¿Qué quieres entrenar?</h2>
                <p>Selecciona una zona. El sistema te mostrará el orden y las repeticiones exactas.</p>
              </div>
              <div class="home-picker-summary">
                <b>{{ejerciciosCasaActuales.length}}</b>
                <span>ejercicios</span>
                <small>{{duracionEstimadaCasa(zonaCasaSeleccionada)}} min aprox.</small>
              </div>
            </div>

            <div class="home-area-cards muscle-area-grid">
              <button *ngFor="let zona of zonasCasaMeta"
                      type="button"
                      [class.active]="zonaCasaSeleccionada===zona.id"
                      (click)="seleccionarZonaCasa(zona.id)">
                <span>{{zona.icono}}</span>
                <div>
                  <small>{{zona.subtitulo}}</small>
                  <h3>{{zona.nombre}}</h3>
                  <p>{{zona.descripcion}}</p>
                </div>
                <em>{{ejerciciosZonaCasa(zona.id).length}} ejercicios</em>
              </button>
            </div>

            <div class="home-exercise-preview">
              <div class="home-exercise-preview-head">
                <div>
                  <span>SESIÓN GUIADA</span>
                  <h3>{{metaZonaCasa(zonaCasaSeleccionada).nombre}}</h3>
                </div>
                <span class="home-no-equipment">Sin equipo especial</span>
              </div>

              <div class="home-exercise-list">
                <article *ngFor="let ejercicio of ejerciciosCasaActuales; let i=index">
                  <span class="exercise-number">{{i+1}}</span>
                  <span class="exercise-icon">{{ejercicio.icono}}</span>
                  <div>
                    <b>{{ejercicio.nombre}}</b>
                    <small>{{prescripcionEjercicioCasa(ejercicio)}} · descanso {{ejercicio.descanso}} s</small>
                  </div>
                  <button type="button" (click)="verEjercicioCasa=verEjercicioCasa===ejercicio.id?'':ejercicio.id">
                    {{verEjercicioCasa===ejercicio.id ? 'Ocultar' : 'Cómo hacerlo'}}
                  </button>
                  <div class="exercise-howto" *ngIf="verEjercicioCasa===ejercicio.id">
                    <p *ngIf="ejercicio.por_lado" class="side-instruction"><span>↔</span><b>Haz {{ejercicio.repeticiones}} con el lado derecho y luego {{ejercicio.repeticiones}} con el izquierdo.</b></p>
                    <p *ngFor="let paso of ejercicio.instrucciones; let p=index"><span>{{p+1}}</span>{{paso}}</p>
                  </div>
                </article>
              </div>

              <div class="home-safety-note">
                <span>✓</span>
                <p>Haz cada movimiento con control. Si aparece dolor o mareo, detén la sesión y descansa.</p>
              </div>

              <button type="button" class="home-start-session" (click)="iniciarEntrenamientoCasa()">
                <span>▶</span>
                <div>
                  <b>Comenzar {{metaZonaCasa(zonaCasaSeleccionada).nombre}}</b>
                  <small>{{ejerciciosCasaActuales.length}} ejercicios con guía, repeticiones y descansos</small>
                </div>
                <em>Empezar →</em>
              </button>
            </div>
          </section>

          <section *ngIf="sesionCasaActiva" class="home-session-live">
            <article class="home-session-main">
              <div class="home-session-top">
                <div>
                  <span class="session-live"><i></i> SESIÓN EN CURSO</span>
                  <h2 *ngIf="faseCasa==='ejercicio'">{{ejercicioCasaActual?.nombre}}</h2>
                  <h2 *ngIf="faseCasa==='descanso'">Descanso</h2>
                  <p>{{faseCasa==='ejercicio'
                    ? ('Ejercicio '+(indiceEjercicioCasa+1)+' de '+ejerciciosCasaActuales.length)
                    : 'Respira y prepárate para continuar'}}</p>
                </div>
                <span class="session-zone-badge">{{metaZonaCasa(zonaCasaSeleccionada).icono}} {{metaZonaCasa(zonaCasaSeleccionada).nombre}}</span>
              </div>

              <div class="home-timer-stage">
                <div class="home-timer-ring" [style.background]="temporizadorFondoCasa">
                  <div>
                    <small *ngIf="faseCasa==='descanso'">DESCANSO</small>
                    <small *ngIf="faseCasa==='ejercicio' && ejercicioCasaActual?.modo==='tiempo'">TIEMPO</small>
                    <small *ngIf="faseCasa==='ejercicio' && ejercicioCasaActual?.modo==='repeticiones'">REPETICIONES</small>

                    <strong *ngIf="faseCasa==='descanso' || ejercicioCasaActual?.modo==='tiempo'">{{formatoTiempoCasa(segundosCasa)}}</strong>
                    <strong class="reps-display reps-counter-live" *ngIf="faseCasa==='ejercicio' && ejercicioCasaActual?.modo==='repeticiones'">
                      {{repsCasaHechas}}<small>DE {{objetivoRepsCasa}}</small>
                      <em *ngIf="ejercicioCasaActual?.por_lado">{{ladoCasa==='derecho' ? 'LADO DERECHO' : 'LADO IZQUIERDO'}}</em>
                      <em *ngIf="!ejercicioCasaActual?.por_lado">REPETICIONES</em>
                    </strong>

                    <span>{{sesionCasaPausada ? 'PAUSADO' : (ejercicioCasaActual?.modo==='repeticiones' && faseCasa==='ejercicio' ? 'A TU RITMO' : 'EN CURSO')}}</span>
                  </div>
                </div>

                <div class="home-current-guide" *ngIf="faseCasa==='ejercicio' && ejercicioCasaActual">
                  <span class="current-exercise-icon">{{ejercicioCasaActual.icono}}</span>
                  <div class="current-instructions">
                    <span>CÓMO HACERLO</span>
                    <h3>{{prescripcionEjercicioCasa(ejercicioCasaActual)}}</h3>
                    <p *ngIf="ejercicioCasaActual.por_lado" class="live-side-message active-side-message">
                      <b>{{ladoCasa==='derecho' ? 'D' : 'I'}}</b>
                      Ahora: {{objetivoRepsCasa}} repeticiones con el lado {{ladoCasa}}.
                      <span *ngIf="ladoCasa==='derecho'">Después el sistema te pedirá cambiar al lado izquierdo.</span>
                      <span *ngIf="ladoCasa==='izquierdo'">Al terminar, pasarás al descanso.</span>
                    </p>
                    <p *ngFor="let paso of ejercicioCasaActual.instrucciones; let p=index"><b>{{p+1}}</b>{{paso}}</p>
                  </div>
                </div>

                <div class="home-current-guide rest-guide" *ngIf="faseCasa==='descanso'">
                  <span class="current-exercise-icon">◷</span>
                  <div class="current-instructions">
                    <span>SIGUE DESPUÉS</span>
                    <h3>{{siguienteEjercicioCasa?.nombre}}</h3>
                    <p>{{prescripcionEjercicioCasa(siguienteEjercicioCasa)}}. Prepárate y continúa cuando termine el descanso.</p>
                  </div>
                </div>
              </div>

              <div class="home-session-progress">
                <div><span>Progreso de la sesión</span><b>{{progresoCasa}}%</b></div>
                <div class="session-progress-track"><i [style.width.%]="progresoCasa"></i></div>
              </div>

              <div class="home-rep-counter-panel"
                   *ngIf="faseCasa==='ejercicio' && ejercicioCasaActual?.modo==='repeticiones'">
                <div>
                  <span>CONTADOR DE REPETICIONES</span>
                  <b>{{repsCasaHechas}} / {{objetivoRepsCasa}}</b>
                  <small *ngIf="ejercicioCasaActual?.por_lado">Lado {{ladoCasa}}</small>
                  <small *ngIf="!ejercicioCasaActual?.por_lado">Completa el objetivo con control</small>
                </div>
                <button type="button"
                        (click)="sumarRepeticionCasa()"
                        [disabled]="repsCasaHechas>=objetivoRepsCasa || sesionCasaPausada">
                  + 1 repetición
                </button>
              </div>

              <div class="home-session-controls">
                <button type="button" class="control-secondary" (click)="togglePausaCasa()">{{sesionCasaPausada ? '▶ Continuar' : 'Ⅱ Pausar'}}</button>

                <button type="button"
                        class="control-primary"
                        (click)="avanzarEjercicioCasa()"
                        [disabled]="faseCasa==='ejercicio' && ejercicioCasaActual?.modo==='repeticiones' && repsCasaHechas<objetivoRepsCasa">
                  <ng-container *ngIf="faseCasa==='ejercicio' && ejercicioCasaActual?.modo==='repeticiones'; else siguienteNormal">
                    {{ejercicioCasaActual?.por_lado && ladoCasa==='derecho'
                      ? 'Cambiar al lado izquierdo →'
                      : '✓ Terminé · ir al descanso'}}
                  </ng-container>
                  <ng-template #siguienteNormal>Siguiente →</ng-template>
                </button>

                <button type="button" class="control-danger" (click)="cancelarSesionCasa()">Terminar sesión</button>
              </div>
            </article>

            <aside class="home-session-queue">
              <div class="card-title-block">
                <span>SESIÓN DE HOY</span>
                <h2>{{ejerciciosCasaActuales.length}} ejercicios</h2>
                <p>Mira qué sigue antes de llegar a cada ejercicio.</p>
              </div>

              <div class="session-queue-list">
                <div *ngFor="let e of ejerciciosCasaActuales; let i=index"
                     [class.current]="i===indiceEjercicioCasa"
                     [class.done]="i<indiceEjercicioCasa">
                  <span>
                    <ng-container *ngIf="i<indiceEjercicioCasa; else numeroEjercicio">✓</ng-container>
                    <ng-template #numeroEjercicio>{{i+1}}</ng-template>
                  </span>
                  <div><b>{{e.nombre}}</b><small>{{prescripcionEjercicioCasa(e)}} · {{e.descanso}} s descanso</small></div>
                </div>
              </div>
            </aside>
          </section>

          <section *ngIf="sesionCasaTerminada" class="home-session-complete">
            <div class="complete-badge">✓</div>
            <span>SESIÓN COMPLETADA</span>
            <h2>Entrenamiento terminado</h2>
            <p>Completaste {{ejerciciosCasaActuales.length}} ejercicios de {{metaZonaCasa(zonaCasaSeleccionada).nombre}} en {{formatoTiempoCasa(segundosTranscurridosCasa)}}.</p>
            <div class="complete-actions">
              <button type="button" class="home-start-session" (click)="reiniciarSesionCasa()">
                <span>↻</span><div><b>Elegir otro entrenamiento</b><small>Volver a grupos musculares</small></div><em>Continuar →</em>
              </button>
              <button type="button" class="member-secondary-action" (click)="abrirModulo('inicio')">Volver al inicio</button>
            </div>
          </section>

          <section class="member-module-card home-history-card" *ngIf="historialCasa.length">
            <div class="card-title-block"><span>HISTORIAL</span><h2>Últimas sesiones en casa</h2><p>Tu progreso queda guardado en el sistema.</p></div>
            <div class="home-history-list">
              <div *ngFor="let sesion of historialCasa.slice(0,6)">
                <span>{{metaZonaCasa(sesion.zona).icono}}</span>
                <div><b>{{metaZonaCasa(sesion.zona).nombre}}</b><small>{{fecha(sesion.fecha)}} · {{sesion.ejercicios_completados}}/{{sesion.ejercicios_total}} ejercicios</small></div>
                <em>{{formatoTiempoCasa(sesion.duracion_segundos)}}</em>
              </div>
            </div>
          </section>
        </section>

        <section *ngIf="moduloActivo==='rutinas'" class="member-module member-enter-up">
          <div class="member-module-hero">
            <div><span>ENTRENAMIENTO</span><h1>Mis rutinas</h1><p>Consulta los ejercicios que tu entrenador preparó para ti.</p></div>
            <div class="module-hero-icon">🏋</div>
          </div>

          <div class="module-grid routine-grid">
            <article class="member-module-card routine-card" *ngFor="let r of rutinas">
              <div class="routine-card-head"><div><span>RUTINA</span><h2>{{r.nombre_rutina}}</h2></div><i>🏋</i></div>
              <p>{{r.objetivo}}</p>
              <small class="routine-period">{{fecha(r.fecha_inicio)}} — {{r.fecha_fin ? fecha(r.fecha_fin) : 'Sin fecha final'}}</small>
              <div class="routine-exercises">
                <div *ngFor="let e of r.detalles"><span>✓</span><p><b>{{e.ejercicio}}</b><small>{{e.series}} series × {{e.repeticiones}} reps · descanso {{e.descanso_segundos || 0}} s</small></p></div>
              </div>
            </article>

            <article class="member-empty-card member-empty-guided" *ngIf="!rutinas.length">
              <span>🏋</span>
              <h3>Aún no tienes una rutina del entrenador</h3>
              <p>Puedes empezar hoy mismo con una sesión guiada en casa mientras esperas tu rutina personalizada.</p>
              <div class="empty-actions">
                <button type="button" class="empty-primary" (click)="abrirModulo('casa')">⚡ Entrenar en casa</button>
                <button type="button" class="empty-secondary" (click)="abrirModulo('perfil')">Revisar mi perfil</button>
              </div>
            </article>
          </div>
        </section>

        <section *ngIf="moduloActivo==='clases'" class="member-module member-enter-up">
          <div class="member-module-hero">
            <div><span>AGENDA</span><h1>Clases disponibles</h1><p>Elige una clase, selecciona una fecha válida y reserva tu lugar.</p></div>
            <div class="module-hero-icon">▣</div>
          </div>

          <div class="member-class-grid">
            <article class="member-class-card" *ngFor="let c of clases">
              <div class="class-card-top"><span>CLASE DISPONIBLE</span><i>▣</i></div>
              <h2>{{c.nombre}}</h2>
              <div class="class-meta">
                <span><b>Día</b>{{c.dia_semana}}</span>
                <span><b>Horario</b>{{c.hora_inicio}} - {{c.hora_fin}}</span>
                <span><b>Entrenador</b>{{nombrePersona(c.entrenador)}}</span>
              </div>
              <label>Fecha de reserva<input type="date" [(ngModel)]="fechasReserva[c.id_clase]" [name]="'fecha'+c.id_clase"></label>
              <button type="button" (click)="reservar(c)">Reservar clase <span>→</span></button>
            </article>

            <article class="member-empty-card member-empty-guided" *ngIf="!clases.length">
              <span>▣</span>
              <h3>Aún no hay clases publicadas</h3>
              <p>Cuando administración publique horarios aparecerán aquí. Mientras tanto puedes seguir tu sesión en casa.</p>
              <div class="empty-actions">
                <button type="button" class="empty-primary" (click)="abrirModulo('casa')">⚡ Entrenar en casa</button>
                <button type="button" class="empty-secondary" (click)="abrirModulo('inicio')">Volver al inicio</button>
              </div>
            </article>
          </div>
        </section>

        <section *ngIf="moduloActivo==='reservas'" class="member-module member-enter-up">
          <div class="member-module-hero">
            <div><span>AGENDA PERSONAL</span><h1>Mis reservas</h1><p>Consulta y administra las clases que reservaste.</p></div>
            <div class="module-hero-icon">◷</div>
          </div>

          <div class="member-reservation-list">
            <article *ngFor="let r of reservas">
              <span class="reservation-mark">◷</span>
              <div><small>CLASE</small><h3>{{r.clase?.nombre || 'Clase'}}</h3><p>{{fecha(r.fecha_clase)}} · {{r.clase?.hora_inicio}}</p></div>
              <em [class.cancelled]="r.estado!=='Reservada'">{{r.estado}}</em>
              <button *ngIf="r.estado==='Reservada'" type="button" (click)="cancelarReserva(r)">Cancelar reserva</button>
            </article>

            <article class="member-empty-card member-empty-guided" *ngIf="!reservas.length">
              <span>◷</span><h3>Todavía no tienes reservas</h3><p>Elige una clase disponible o continúa con tu entrenamiento en casa.</p>
              <div class="empty-actions">
                <button type="button" class="empty-primary" (click)="abrirModulo('clases')">Ver clases</button>
                <button type="button" class="empty-secondary" (click)="abrirModulo('casa')">Entrenar en casa</button>
              </div>
            </article>
          </div>
        </section>

        <section *ngIf="moduloActivo==='asistencias'" class="member-module member-enter-up">
          <div class="member-module-hero">
            <div><span>HISTORIAL</span><h1>Mis asistencias</h1><p>Consulta tus entradas y salidas registradas en el gimnasio.</p></div>
            <div class="module-hero-icon">✓</div>
          </div>

          <div class="attendance-timeline">
            <article *ngFor="let a of asistencias">
              <span class="timeline-dot"></span>
              <div><small>ENTRADA</small><h3>{{fecha(a.fecha_hora_entrada)}}</h3><p>Salida: {{fecha(a.fecha_hora_salida)}}</p></div>
              <em>{{a.estado}}</em>
            </article>

            <article class="member-empty-card member-empty-guided" *ngIf="!asistencias.length">
              <span>✓</span><h3>Tu historial empieza desde cero</h3>
              <p>Las visitas al gimnasio aparecerán aquí. Tus entrenamientos en casa se guardan en su propio historial.</p>
              <div class="empty-actions">
                <button type="button" class="empty-primary" (click)="abrirModulo('casa')">Ver entrenamiento en casa</button>
                <button type="button" class="empty-secondary" (click)="abrirModulo('clases')">Buscar clases</button>
              </div>
            </article>
          </div>
        </section>

        <section *ngIf="moduloActivo==='pagos'" class="member-module member-enter-up">
          <div class="member-module-hero">
            <div><span>MEMBRESÍA</span><h1>Pagos y renovación</h1><p>Solicita una renovación y consulta tus comprobantes.</p></div>
            <div class="module-hero-icon">▤</div>
          </div>

          <section class="member-payment-layout">
            <article class="member-module-card renewal-card">
              <div class="card-title-block"><span>NUEVA SOLICITUD</span><h2>Solicitar renovación</h2><p>Completa los datos de tu pago.</p></div>
              <form class="member-form" (ngSubmit)="solicitarRenovacion()">
                <label>Plan
                  <select [(ngModel)]="pagoForm.id_membresia" name="planPago" required>
                    <option [ngValue]="0">Seleccionar plan</option>
                    <option *ngFor="let m of membresiasDisponibles" [ngValue]="m.id_membresia">{{m.nombre}} - S/ {{m.precio}}</option>
                  </select>
                </label>
                <label>Inicio<input type="date" [(ngModel)]="pagoForm.fecha_inicio" name="fechaPago"></label>
                <label>Método
                  <select [(ngModel)]="pagoForm.metodo_pago" name="metodoPago"><option>Yape</option><option>Plin</option><option>Transferencia</option><option>Tarjeta</option></select>
                </label>
                <label>N° operación<input [(ngModel)]="pagoForm.numero_operacion" name="operacionPago" placeholder="Número de operación" required></label>
                <button class="member-form-submit" type="submit">Enviar solicitud <span>→</span></button>
              </form>
            </article>

            <article class="member-module-card">
              <div class="card-title-block"><span>HISTORIAL</span><h2>Mis pagos</h2><p>Movimientos registrados en tu cuenta.</p></div>
              <div class="member-payment-list full-list">
                <div *ngFor="let p of pagos" class="member-payment-item">
                  <span class="payment-icon">▤</span>
                  <p><b>{{p.cliente_membresia?.membresia?.nombre || 'Membresía'}}</b><small>{{fecha(p.fecha_pago)}} · {{p.metodo_pago}}</small></p>
                  <strong>S/ {{p.monto}}</strong>
                  <em [class.pending]="p.estado_pago!=='Pagado'">{{p.estado_pago}}</em>
                  <button type="button" (click)="comprobante(p)">Comprobante</button>
                </div>
                <div class="member-empty-state compact-empty" *ngIf="!pagos.length"><span>▤</span><h3>Sin pagos registrados</h3><p>Tus movimientos aparecerán aquí.</p></div>
              </div>
            </article>
          </section>
        </section>

        <section *ngIf="moduloActivo==='perfil'" class="member-module member-enter-up">
          <div class="member-module-hero">
            <div><span>CUENTA PERSONAL</span><h1>Mi perfil</h1><p>Mantén actualizada tu información de contacto.</p></div>
            <div class="module-hero-icon">♙</div>
          </div>

          <section class="profile-layout">
            <aside class="profile-summary-card">
              <div class="profile-avatar">{{nombreCorto.charAt(0).toUpperCase()}}</div>
              <h2>{{nombreCorto}}</h2>
              <p>{{perfil?.correo || 'Cliente Mallqui Gym'}}</p>
              <span>CLIENTE ACTIVO</span>
              <ul><li>✓ Acceso al portal</li><li>✓ Datos sincronizados</li><li>✓ Cuenta protegida</li></ul>
            </aside>

            <article class="member-module-card profile-edit-card">
              <div class="card-title-block"><span>DATOS PERSONALES</span><h2>Actualizar información</h2><p>Modifica tus datos y guarda los cambios.</p></div>
              <form class="member-form profile-form-grid" (ngSubmit)="guardarPerfil()">
                <label>Nombres<input [(ngModel)]="perfil.nombres" name="nombres" required></label>
                <label>Apellidos<input [(ngModel)]="perfil.apellidos" name="apellidos" required></label>
                <label>Correo<input type="email" [(ngModel)]="perfil.correo" name="correo" required></label>
                <label>Teléfono<input [(ngModel)]="perfil.telefono" name="telefono"></label>
                <label class="full">Dirección<input [(ngModel)]="perfil.direccion" name="direccion"></label>
                <button class="member-form-submit full" type="submit">Guardar cambios <span>→</span></button>
              </form>
            </article>
          </section>

          <section class="profile-security-grid">
            <article class="member-module-card">
              <div class="card-title-block"><span>SEGURIDAD</span><h2>Cambiar contraseña</h2><p>Actualiza tu contraseña desde tu cuenta.</p></div>
              <form class="member-form" (ngSubmit)="cambiarContrasenaCliente()">
                <label>Contraseña actual<input type="password" [(ngModel)]="seguridadForm.actual" name="seg_actual" autocomplete="current-password" required></label>
                <label>Nueva contraseña<input type="password" [(ngModel)]="seguridadForm.nueva" name="seg_nueva" minlength="8" autocomplete="new-password" required></label>
                <label>Confirmar contraseña<input type="password" [(ngModel)]="seguridadForm.confirmacion" name="seg_confirmacion" minlength="8" autocomplete="new-password" required></label>
                <button class="member-form-submit" type="submit">Actualizar contraseña <span>→</span></button>
              </form>
            </article>

            <article class="member-module-card session-security-card">
              <div class="card-title-block"><span>SESIONES</span><h2>Proteger mi cuenta</h2><p>Si usaste tu cuenta en otro equipo, puedes cerrar todas las sesiones activas.</p></div>
              <div class="session-security-info">
                <span>✓</span>
                <div><b>Sesión protegida con Laravel Sanctum</b><p>Al cerrar todas las sesiones tendrás que iniciar sesión nuevamente.</p></div>
              </div>
              <button class="member-danger-action" type="button" (click)="cerrarTodasSesiones()">Cerrar todas las sesiones</button>
            </article>
          </section>
        </section>
        <app-cliente-experiencia
          *ngIf="moduloActivo==='progreso' || moduloActivo==='calendario' || moduloActivo==='avisos' || moduloActivo==='soporte'"
          [modulo]="moduloActivo">
        </app-cliente-experiencia>
      </main>

      <ng-template #cargandoTpl>
        <main class="member-main">
          <div class="member-loading-card">
            <span class="loading-ring"></span>
            <h2>Preparando tu portal...</h2>
            <p>Estamos cargando tu información de Mallqui Gym.</p>
          </div>
        </main>
      </ng-template>
    </div>
  `,
  styles: [`
    :host{display:block}
  `]
})
export class UsuarioComponent implements OnInit, OnDestroy {
  moduloActivo='inicio'; cargando=true; error=''; toast='';
  resumen:any=null; perfil:any={}; membresiaActual:any=null; membresiasDisponibles:any[]=[];
  pagos:any[]=[]; rutinas:any[]=[]; asistencias:any[]=[]; reservas:any[]=[]; clases:any[]=[]; compras:any[]=[];
  fechasReserva:Record<number,string>={};
  pagoForm:any={id_membresia:0,fecha_inicio:new Date().toISOString().slice(0,10),metodo_pago:'Yape',numero_operacion:''};
  seguridadForm:any={actual:'',nueva:'',confirmacion:''};

  diasSemanaCasa=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  objetivosCasaMeta=[
    {id:'fuerza',nombre:'Fuerza',icono:'⚡',descripcion:'Fortalecer músculos de forma gradual y controlada.'},
    {id:'resistencia',nombre:'Resistencia',icono:'◷',descripcion:'Mantener el esfuerzo moderado durante más tiempo.'},
    {id:'movilidad',nombre:'Movilidad',icono:'↔',descripcion:'Mejorar control, postura y amplitud cómoda de movimiento.'},
  ];
  zonasCasaMeta=[
    {id:'piernas',nombre:'Piernas',icono:'🦵',subtitulo:'TREN INFERIOR',enfoque:'Piernas y equilibrio',descripcion:'Sentadillas, zancadas y pantorrillas con control.'},
    {id:'gluteos',nombre:'Glúteos',icono:'↥',subtitulo:'CADERA Y ESTABILIDAD',enfoque:'Glúteos y cadera',descripcion:'Puentes y movimientos de cadera sin equipo especial.'},
    {id:'brazos',nombre:'Brazos',icono:'💪',subtitulo:'TREN SUPERIOR',enfoque:'Brazos y tríceps',descripcion:'Trabajo moderado de brazos usando el propio peso.'},
    {id:'pecho',nombre:'Pecho',icono:'◆',subtitulo:'EMPUJE',enfoque:'Pecho y control',descripcion:'Flexiones en pared y ejercicios de empuje suaves.'},
    {id:'espalda',nombre:'Espalda',icono:'✦',subtitulo:'POSTURA Y CONTROL',enfoque:'Espalda y postura',descripcion:'Movimientos de espalda y escápulas de forma controlada.'},
    {id:'hombros',nombre:'Hombros',icono:'↻',subtitulo:'MOVILIDAD Y FUERZA',enfoque:'Hombros y estabilidad',descripcion:'Elevaciones y movilidad sin cargas externas.'},
    {id:'core',nombre:'Abdomen / Core',icono:'◎',subtitulo:'ESTABILIDAD CENTRAL',enfoque:'Core y postura',descripcion:'Ejercicios de estabilidad del tronco y control corporal.'},
  ];
  planCasa:any={dias:['Lunes','Miércoles','Viernes'],zonas:['piernas','brazos','core'],objetivo:'fuerza'};
  catalogoCasa:Record<string,any[]>={piernas:[],gluteos:[],brazos:[],pecho:[],espalda:[],hombros:[],core:[]};
  historialCasa:any[]=[];
  zonaCasaSeleccionada='piernas';
  casaCargado=false;
  errorCasa='';
  verEjercicioCasa='';
  sesionCasaActiva=false;
  sesionCasaPausada=false;
  sesionCasaTerminada=false;
  indiceEjercicioCasa=0;
  faseCasa:'ejercicio'|'descanso'='ejercicio';
  segundosCasa=0;
  segundosTranscurridosCasa=0;
  repsCasaHechas=0;
  ladoCasa:'derecho'|'izquierdo'='derecho';
  private timerCasa:any=null;

  constructor(private api:GymApiService, private auth:AuthService, private router:Router){}

  ngOnInit():void{ this.cargar(); }
  ngOnDestroy():void{ this.detenerTimerCasa(); }

  cargar():void{
    this.cargando=true; this.error='';
    this.api.cargarPortalCliente().subscribe({
      next:r=>{this.resumen=r.resumen;this.perfil={...r.perfil};this.membresiaActual=r.membresia?.actual;this.membresiasDisponibles=r.membresiasDisponibles||[];this.pagos=r.pagos||[];this.rutinas=r.rutinas||[];this.asistencias=r.asistencias||[];this.reservas=r.reservas||[];this.clases=(r.clases||[]).filter((x:any)=>x.estado==='Activo');this.compras=r.compras||[];this.cargando=false;this.cargarEntrenamientoCasa();},
      error:e=>{this.error=this.errorApi(e);this.cargando=false;}
    });
  }
  abrirModulo(m:string){this.moduloActivo=m;if(m==='casa'&&!this.casaCargado)this.cargarEntrenamientoCasa();window.scrollTo({top:0,behavior:'smooth'});}
  get nombreCorto():string{return this.perfil?.nombres || this.auth.usuario?.nombres || 'Miembro';}
  get rutinaActual():any{return this.resumen?.rutina_actual || this.rutinas.find(r=>r.estado==='Activo') || null;}
  get nombreEntrenador():string{return this.nombrePersona(this.rutinaActual?.entrenador) || 'Sin entrenador asignado';}
  get reservasActivas():any[]{return this.reservas.filter(r=>r.estado==='Reservada');}

  get perfilCompleto():boolean{
    return Boolean(
      String(this.perfil?.nombres||'').trim() &&
      String(this.perfil?.apellidos||'').trim() &&
      String(this.perfil?.correo||'').trim() &&
      String(this.perfil?.telefono||'').trim() &&
      String(this.perfil?.direccion||'').trim()
    );
  }

  get planCasaConfigurado():boolean{
    return Boolean(
      this.casaCargado &&
      Array.isArray(this.planCasa?.dias) && this.planCasa.dias.length > 0 &&
      Array.isArray(this.planCasa?.zonas) && this.planCasa.zonas.length > 0
    );
  }

  get primeraActividadRegistrada():boolean{
    return Boolean(
      this.historialCasa.length ||
      this.reservas.length ||
      this.asistencias.length ||
      this.rutinas.length
    );
  }

  get onboardingPasos():any[]{
    return [
      {
        titulo:'Completar perfil',
        descripcion:'Confirma tus datos personales y de contacto.',
        icono:'♙',
        modulo:'perfil',
        done:this.perfilCompleto,
      },
      {
        titulo:'Elegir membresía',
        descripcion:'Selecciona el plan con el que usarás el gimnasio.',
        icono:'✦',
        modulo:'pagos',
        done:Boolean(this.membresiaActual),
      },
      {
        titulo:'Configurar entrenamiento en casa',
        descripcion:'Elige días, objetivo y zonas para tus sesiones guiadas.',
        icono:'⚡',
        modulo:'casa',
        done:this.planCasaConfigurado,
      },
      {
        titulo:'Registrar tu primera actividad',
        descripcion:'Entrena en casa, reserva una clase o registra una asistencia.',
        icono:'✓',
        modulo:'casa',
        done:this.primeraActividadRegistrada,
      },
    ];
  }

  get onboardingCompletados():number{
    return this.onboardingPasos.filter((p:any)=>p.done).length;
  }

  get onboardingProgreso():number{
    return Math.round((this.onboardingCompletados / Math.max(1,this.onboardingPasos.length))*100);
  }

  irPasoOnboarding(paso:any):void{
    this.abrirModulo(paso?.modulo || 'inicio');
  }
  get actividadRegistrada():boolean{
    return this.asistencias.length>0 || this.historialCasa.length>0;
  }
  get porcentajeInicio():number{
    const pasos=[
      this.perfilCompleto,
      !!this.membresiaActual,
      this.casaCargado,
      this.reservasActivas.length>0,
      this.actividadRegistrada
    ];
    return Math.round((pasos.filter(Boolean).length/pasos.length)*100);
  }
  nombrePersona(p:any):string{return p?[`${p.nombres||''}`,`${p.apellidos||''}`].join(' ').trim():'-';}
  fecha(v:any):string{if(!v)return '-';const d=new Date(v);return isNaN(d.getTime())?String(v):d.toLocaleString('es-PE');}

  cargarEntrenamientoCasa():void{
    this.api.entrenamientoCasaCliente().subscribe({
      next:r=>{
        this.planCasa={
          dias:r?.plan?.dias||['Lunes','Miércoles','Viernes'],
          zonas:r?.plan?.zonas||['piernas','brazos','core'],
          objetivo:r?.plan?.objetivo||'fuerza'
        };
        this.catalogoCasa=r?.catalogo||{piernas:[],gluteos:[],brazos:[],pecho:[],espalda:[],hombros:[],core:[]};
        this.historialCasa=r?.historial||[];
        this.zonaCasaSeleccionada=this.planCasa.zonas?.[0]||'piernas';
        const tocaHoy=this.agendaCasaSemanal.find((x:any)=>x.hoy&&x.activo);
        if(tocaHoy?.zona?.id)this.zonaCasaSeleccionada=tocaHoy.zona.id;
        this.casaCargado=true;
        this.errorCasa='';
      },
      error:e=>{this.errorCasa=this.errorApi(e);this.casaCargado=false;}
    });
  }

  seleccionarObjetivoCasa(objetivo:string):void{
    if(this.sesionCasaActiva)return;
    const existe=this.objetivosCasaMeta.some((o:any)=>o.id===objetivo);
    if(!existe)return;
    this.planCasa={...this.planCasa,objetivo};
    this.errorCasa='';
  }

  toggleDiaCasa(dia:string):void{
    const dias=[...(this.planCasa.dias||[])];
    const i=dias.indexOf(dia);
    if(i>=0){
      if(dias.length===1){this.errorCasa='Mantén al menos un día de entrenamiento en casa.';return;}
      dias.splice(i,1);
    }else{
      if(dias.length>=4){this.errorCasa='Puedes programar hasta 4 días por semana para estas sesiones.';return;}
      dias.push(dia);
      dias.sort((a:string,b:string)=>this.diasSemanaCasa.indexOf(a)-this.diasSemanaCasa.indexOf(b));
    }
    this.planCasa={...this.planCasa,dias};
    this.errorCasa='';
  }

  toggleZonaCasa(zona:string):void{
    const zonas=[...(this.planCasa.zonas||[])];
    const i=zonas.indexOf(zona);
    if(i>=0){
      if(zonas.length===1){this.errorCasa='Selecciona al menos una zona de entrenamiento.';return;}
      zonas.splice(i,1);
    }else{
      zonas.push(zona);
    }
    this.planCasa={...this.planCasa,zonas};
    if(!zonas.includes(this.zonaCasaSeleccionada))this.zonaCasaSeleccionada=zonas[0];
    this.errorCasa='';
  }

  guardarPlanCasa():void{
    this.errorCasa='';
    this.api.guardarPlanCasaCliente({dias:this.planCasa.dias,zonas:this.planCasa.zonas,objetivo:this.planCasa.objetivo||'fuerza'}).subscribe({
      next:r=>{this.planCasa={...r.plan};this.ok(r.mensaje||'Plan semanal guardado');},
      error:e=>this.errorCasa=this.errorApi(e)
    });
  }

  seleccionarZonaCasa(zona:string):void{
    if(this.sesionCasaActiva)return;
    this.zonaCasaSeleccionada=zona;
    this.verEjercicioCasa='';
  }

  ejerciciosZonaCasa(zona:string):any[]{return this.catalogoCasa?.[zona]||[];}
  get ejerciciosCasaActuales():any[]{return this.ejerciciosZonaCasa(this.zonaCasaSeleccionada);}
  get ejercicioCasaActual():any{return this.ejerciciosCasaActuales[this.indiceEjercicioCasa]||null;}
  get siguienteEjercicioCasa():any{return this.ejerciciosCasaActuales[Math.min(this.indiceEjercicioCasa+1,this.ejerciciosCasaActuales.length-1)]||null;}

  metaZonaCasa(zona:string):any{
    return this.zonasCasaMeta.find((z:any)=>z.id===zona)||this.zonasCasaMeta[0];
  }

  metaObjetivoCasa(objetivo:string):any{
    return this.objetivosCasaMeta.find((o:any)=>o.id===objetivo)||this.objetivosCasaMeta[0];
  }

  repeticionesObjetivoCasa(e:any):number{
    const base=Math.max(1,Number(e?.repeticiones||8));
    if((this.planCasa?.objetivo||'fuerza')==='resistencia')return Math.min(14,base+2);
    if((this.planCasa?.objetivo||'fuerza')==='movilidad')return Math.min(8,base);
    return base;
  }

  segundosObjetivoCasa(e:any):number{
    const base=Math.max(15,Number(e?.segundos||30));
    if((this.planCasa?.objetivo||'fuerza')==='resistencia')return Math.min(45,base+5);
    if((this.planCasa?.objetivo||'fuerza')==='movilidad')return Math.min(35,base);
    return base;
  }

  prescripcionEjercicioCasa(e:any):string{
    if(!e)return '-';
    if(e.modo==='repeticiones'){
      const reps=this.repeticionesObjetivoCasa(e);
      return e.por_lado ? (reps+' por cada lado') : (reps+' repeticiones');
    }
    return this.segundosObjetivoCasa(e)+' segundos';
  }

  duracionEstimadaCasa(zona:string):number{
    const total=this.ejerciciosZonaCasa(zona).reduce((s:number,e:any)=>{
      const trabajo=e?.modo==='repeticiones' ? Math.max(30,this.repeticionesObjetivoCasa(e)*(e?.por_lado?4:3)) : this.segundosObjetivoCasa(e);
      return s+trabajo+Number(e?.descanso||0);
    },0);
    return Math.max(1,Math.ceil(total/60));
  }

  get agendaCasaSemanal():any[]{
    let indiceZona=0;
    const zonas=(this.planCasa.zonas||[]).length?this.planCasa.zonas:['piernas'];
    const hoy=this.diasSemanaCasa[(new Date().getDay()+6)%7];
    return this.diasSemanaCasa.map((dia:string)=>{
      const activo=(this.planCasa.dias||[]).includes(dia);
      const zonaId=activo?zonas[indiceZona++%zonas.length]:'';
      return {
        dia,
        hoy:dia===hoy,
        activo,
        zona:activo?this.metaZonaCasa(zonaId):null,
        ejercicios:activo?this.ejerciciosZonaCasa(zonaId).length:0,
        minutos:activo?this.duracionEstimadaCasa(zonaId):0,
      };
    });
  }

  get entrenamientoCasaHoy():any{
    return this.agendaCasaSemanal.find((x:any)=>x.hoy) || null;
  }

  prepararEntrenamientoCasaHoy():void{
    const hoy=this.entrenamientoCasaHoy;
    if(hoy?.activo && hoy?.zona?.id){
      this.zonaCasaSeleccionada=hoy.zona.id;
    }
    this.abrirModulo('casa');
  }

  get objetivoRepsCasa():number{
    return this.ejercicioCasaActual?.modo==='repeticiones'
      ? this.repeticionesObjetivoCasa(this.ejercicioCasaActual)
      : 0;
  }

  sumarRepeticionCasa():void{
    if(!this.sesionCasaActiva || this.sesionCasaPausada || this.faseCasa!=='ejercicio')return;
    if(this.ejercicioCasaActual?.modo!=='repeticiones')return;
    this.repsCasaHechas=Math.min(this.objetivoRepsCasa,this.repsCasaHechas+1);
  }

  avanzarEjercicioCasa():void{
    if(!this.sesionCasaActiva)return;

    if(this.faseCasa==='descanso'){
      this.siguienteFaseCasa();
      return;
    }

    const ejercicio=this.ejercicioCasaActual;

    if(ejercicio?.modo==='repeticiones'){
      if(this.repsCasaHechas<this.objetivoRepsCasa){
        this.errorCasa='Completa las '+this.objetivoRepsCasa+' repeticiones antes de continuar.';
        return;
      }

      if(ejercicio?.por_lado && this.ladoCasa==='derecho'){
        this.ladoCasa='izquierdo';
        this.repsCasaHechas=0;
        this.errorCasa='';
        return;
      }

      this.ladoCasa='derecho';
      this.repsCasaHechas=0;
    }

    this.errorCasa='';
    this.siguienteFaseCasa();
  }

  iniciarEntrenamientoCasa():void{
    if(!this.ejerciciosCasaActuales.length){
      this.errorCasa='Todavía no hay ejercicios disponibles para esta zona.';
      return;
    }

    this.detenerTimerCasa();
    this.indiceEjercicioCasa=0;
    this.faseCasa='ejercicio';
    this.segundosCasa=this.ejercicioCasaActual?.modo==='tiempo' ? this.segundosObjetivoCasa(this.ejercicioCasaActual) : 0;
    this.segundosTranscurridosCasa=0;
    this.repsCasaHechas=0;
    this.ladoCasa='derecho';
    this.sesionCasaActiva=true;
    this.sesionCasaPausada=false;
    this.sesionCasaTerminada=false;
    this.errorCasa='';
    this.timerCasa=setInterval(()=>this.tickCasa(),1000);
  }

  private tickCasa():void{
    if(!this.sesionCasaActiva||this.sesionCasaPausada)return;

    this.segundosTranscurridosCasa++;

    if(this.faseCasa==='descanso'){
      this.segundosCasa=Math.max(0,this.segundosCasa-1);
      if(this.segundosCasa<=0)this.siguienteFaseCasa();
      return;
    }

    if(this.ejercicioCasaActual?.modo==='tiempo'){
      this.segundosCasa=Math.max(0,this.segundosCasa-1);
      if(this.segundosCasa<=0)this.siguienteFaseCasa();
    }
  }

  siguienteFaseCasa():void{
    if(!this.sesionCasaActiva)return;

    if(this.faseCasa==='ejercicio'){
      if(this.indiceEjercicioCasa>=this.ejerciciosCasaActuales.length-1){
        this.completarSesionCasa();
        return;
      }

      this.faseCasa='descanso';
      this.segundosCasa=Math.max(10,Number(this.ejercicioCasaActual?.descanso||20));
      return;
    }

    this.indiceEjercicioCasa++;
    this.faseCasa='ejercicio';
    this.repsCasaHechas=0;
    this.ladoCasa='derecho';
    this.segundosCasa=this.ejercicioCasaActual?.modo==='tiempo' ? this.segundosObjetivoCasa(this.ejercicioCasaActual) : 0;
  }

  togglePausaCasa():void{this.sesionCasaPausada=!this.sesionCasaPausada;}

  cancelarSesionCasa():void{
    if(!confirm('¿Terminar esta sesión antes de completarla?'))return;
    this.detenerTimerCasa();
    this.sesionCasaActiva=false;
    this.sesionCasaPausada=false;
    this.sesionCasaTerminada=false;
    this.indiceEjercicioCasa=0;
    this.repsCasaHechas=0;
    this.ladoCasa='derecho';
    this.segundosCasa=0;
  }

  private completarSesionCasa():void{
    this.detenerTimerCasa();
    this.sesionCasaActiva=false;
    this.sesionCasaPausada=false;
    this.sesionCasaTerminada=true;

    const total=this.ejerciciosCasaActuales.length;
    const duracion=Math.max(1,this.segundosTranscurridosCasa);

    this.api.registrarSesionCasaCliente({
      zona:this.zonaCasaSeleccionada,
      duracion_segundos:duracion,
      ejercicios_total:total,
      ejercicios_completados:total,
    }).subscribe({
      next:r=>{
        if(r?.sesion)this.historialCasa=[r.sesion,...this.historialCasa];
        this.ok(r?.mensaje||'Entrenamiento guardado');
      },
      error:e=>{
        this.errorCasa='Terminaste la sesión, pero no se pudo guardar el historial: '+this.errorApi(e);
      }
    });
  }

  reiniciarSesionCasa():void{
    this.sesionCasaTerminada=false;
    this.indiceEjercicioCasa=0;
    this.repsCasaHechas=0;
    this.ladoCasa='derecho';
    this.segundosCasa=0;
    this.segundosTranscurridosCasa=0;
    window.scrollTo({top:0,behavior:'smooth'});
  }

  private detenerTimerCasa():void{
    if(this.timerCasa){
      clearInterval(this.timerCasa);
      this.timerCasa=null;
    }
  }

  formatoTiempoCasa(segundos:any):string{
    const s=Math.max(0,Number(segundos)||0);
    const min=Math.floor(s/60);
    const sec=Math.floor(s%60);
    return String(min).padStart(2,'0')+':'+String(sec).padStart(2,'0');
  }

  get progresoCasa():number{
    const total=this.ejerciciosCasaActuales.length;
    if(!total)return 0;

    const base=(this.indiceEjercicioCasa/total)*100;
    const actual=this.ejercicioCasaActual;

    if(this.faseCasa==='ejercicio' && actual?.modo==='repeticiones'){
      const objetivo=Math.max(1,this.objetivoRepsCasa);
      const ladoBase=actual?.por_lado && this.ladoCasa==='izquierdo' ? .5 : 0;
      const divisor=actual?.por_lado ? 2 : 1;
      const fraccion=Math.min(1,ladoBase+(this.repsCasaHechas/objetivo)/divisor);
      return Math.min(100,Math.round(base+(fraccion*.72*(100/total))));
    }

    const duracion=this.faseCasa==='ejercicio'
      ? this.segundosObjetivoCasa(actual)
      : Math.max(1,Number(actual?.descanso||1));

    const parcial=duracion>0
      ? Math.min(1,Math.max(0,(duracion-this.segundosCasa)/duracion))
      : 0;

    const pesoFase=this.faseCasa==='ejercicio' ? .72 : .28;
    return Math.min(100,Math.round(base+(parcial*pesoFase*(100/total))));
  }

  get temporizadorFondoCasa():string{
    const actual=this.ejercicioCasaActual;

    if(this.faseCasa==='ejercicio' && actual?.modo==='repeticiones'){
      const objetivo=Math.max(1,this.objetivoRepsCasa);
      const ladoBase=actual?.por_lado && this.ladoCasa==='izquierdo' ? 50 : 0;
      const pct=Math.max(0,Math.min(100,ladoBase+(this.repsCasaHechas/objetivo)*(actual?.por_lado?50:100)));
      return 'conic-gradient(#ef233c '+pct+'%, #e7edf3 '+pct+'%)';
    }

    const total=this.faseCasa==='ejercicio'
      ? this.segundosObjetivoCasa(actual)
      : Math.max(1,Number(actual?.descanso||1));

    const pct=Math.max(0,Math.min(100,((total-this.segundosCasa)/Math.max(1,total))*100));
    const color=this.faseCasa==='ejercicio'?'#ef233c':'#2f78c8';

    return 'conic-gradient('+color+' '+pct+'%, #e7edf3 '+pct+'%)';
  }

  guardarPerfil(){this.api.actualizarPerfilCliente(this.perfil).subscribe({next:r=>{this.perfil={...r.cliente};this.ok('Perfil actualizado');},error:e=>this.error=this.errorApi(e)});}
  cambiarContrasenaCliente(){
    if(!this.seguridadForm.actual||!this.seguridadForm.nueva){this.error='Completa la contraseña actual y la nueva.';return;}
    if(String(this.seguridadForm.nueva).length<8){this.error='La nueva contraseña debe tener mínimo 8 caracteres.';return;}
    if(this.seguridadForm.nueva!==this.seguridadForm.confirmacion){this.error='Las contraseñas nuevas no coinciden.';return;}
    this.auth.cambiarContrasena(this.seguridadForm.actual,this.seguridadForm.nueva).subscribe({
      next:r=>{this.seguridadForm={actual:'',nueva:'',confirmacion:''};this.ok(r.mensaje||'Contraseña actualizada');},
      error:e=>this.error=this.errorApi(e)
    });
  }
  cerrarTodasSesiones(){
    if(!confirm('¿Cerrar todas las sesiones activas de tu cuenta?'))return;
    this.auth.logoutTodos().subscribe({
      next:()=>{this.auth.limpiarSesion();this.router.navigate(['/login']);},
      error:()=>{this.auth.limpiarSesion();this.router.navigate(['/login']);}
    });
  }
  reservar(c:any){const f=this.fechasReserva[c.id_clase];if(!f){this.error='Selecciona una fecha para la clase.';return;}this.api.reservarClase(c.id_clase,f).subscribe({next:r=>{this.ok(r.mensaje||'Reserva creada');this.cargarReservas();},error:e=>this.error=this.errorApi(e)});}
  cancelarReserva(r:any){if(!confirm('¿Cancelar esta reserva?'))return;this.api.cancelarReserva(r.id_reserva).subscribe({next:x=>{this.ok(x.mensaje||'Reserva cancelada');this.cargarReservas();},error:e=>this.error=this.errorApi(e)});}
  cargarReservas(){this.api.reservasCliente().subscribe({next:r=>this.reservas=r,error:e=>this.error=this.errorApi(e)});}
  solicitarRenovacion(){if(!this.pagoForm.id_membresia||!this.pagoForm.numero_operacion.trim()){this.error='Selecciona plan e ingresa el número de operación.';return;}this.api.solicitarPago({...this.pagoForm}).subscribe({next:r=>{this.ok(r.mensaje||'Solicitud enviada');this.pagoForm.numero_operacion='';this.api.pagosCliente().subscribe(x=>this.pagos=x);},error:e=>this.error=this.errorApi(e)});}
  comprobante(p:any){this.api.comprobantePagoCliente(p.id_pago).subscribe({next:r=>{const c=r.comprobante;const html=`<html><body style="font-family:Arial;padding:30px"><h2>Mallqui Gym</h2><hr><p><b>Comprobante:</b> ${c.id_pago}</p><p><b>Cliente:</b> ${c.cliente} - DNI ${c.dni}</p><p><b>Membresía:</b> ${c.membresia}</p><p><b>Periodo:</b> ${c.periodo.inicio} a ${c.periodo.fin}</p><p><b>Monto:</b> S/ ${c.monto}</p><p><b>Método:</b> ${c.metodo_pago}</p><p><b>Operación:</b> ${c.numero_operacion||'-'}</p><p><b>Estado:</b> ${c.estado}</p><script>window.print()<\/script></body></html>`;const w=window.open('','_blank');if(w){w.document.write(html);w.document.close();}},error:e=>this.error=this.errorApi(e)});}
  cerrarSesion(){this.auth.logout().subscribe({next:()=>{this.auth.limpiarSesion();this.router.navigate(['/login']);},error:()=>{this.auth.limpiarSesion();this.router.navigate(['/login']);}});}
  ok(m:string){this.error='';this.toast='✓ '+m;setTimeout(()=>this.toast='',2600);}
  errorApi(e:any):string{const er=e?.error?.errors;if(er){const p=Object.values(er)[0];if(Array.isArray(p))return String(p[0]);}return e?.error?.mensaje??e?.error?.message??'No se pudo completar la operación.';}
}
