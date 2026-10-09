import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth.service';
import { GymApiService } from '../../../core/services/gym-api.service';
import { ClienteExperienciaComponent } from './cliente-experiencia.component';
import { code128DataUri, code128Svg } from '../../../shared/code128';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, ClienteExperienciaComponent],
  styleUrls: ['../mallqui-member.css'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="member-page">
      <header class="member-topbar mallqui-apex-header member-enter-down">
        <div class="mallqui-apex-nav">
          <button type="button" class="mallqui-apex-brand" (click)="abrirModulo('inicio')" aria-label="Ir al inicio de Mallqui Gym">
            <img src="assets/mallqui-logo.svg" alt="Mallqui Gym">
            <span><b>MALLQUI <strong>GYM</strong></b><small>PUCALLPA · PERÚ</small></span>
          </button>

          <nav class="mallqui-apex-menu" aria-label="Navegación principal">
            <button type="button" [class.active]="moduloActivo==='inicio'" (click)="abrirModulo('inicio')">Inicio</button>
            <button type="button" [class.active]="moduloActivo==='reservas'" (click)="abrirModulo('reservas')">Reservas</button>
            <button type="button" [class.active]="moduloActivo==='rutinas'" (click)="abrirModulo('rutinas')">Rutinas</button>
            <button type="button" [class.active]="moduloActivo==='progreso'" (click)="abrirModulo('progreso')">Progreso</button>
            <button type="button" [class.active]="moduloActivo==='pagos'" (click)="abrirModulo('pagos')">Membresía</button>
          </nav>

          <div class="mallqui-apex-user">
            <button type="button" class="mallqui-apex-bell" (click)="abrirModulo('avisos')" aria-label="Avisos">
              <svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/></svg>
              <b *ngIf="avisosNoLeidos>0">{{avisosNoLeidos>9 ? '9+' : avisosNoLeidos}}</b>
            </button>
            <button type="button" class="mallqui-apex-profile" (click)="abrirModulo('perfil')">
              <span>{{nombreCorto.charAt(0).toUpperCase()}}</span>
              <div><b>{{nombreCorto}}</b><small>{{membresiaActual ? 'Miembro activo' : 'Cliente Mallqui'}}</small></div>
            </button>
            <button type="button" class="mallqui-apex-logout" (click)="cerrarSesion()" aria-label="Cerrar sesión">
              <svg viewBox="0 0 24 24"><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5"/><path d="M14 8l4 4-4 4M18 12H9"/></svg>
            </button>
          </div>
        </div>
      </header>

      <div *ngIf="mobileMenuAbierto" class="member-mobile-menu-backdrop" (click)="mobileMenuAbierto=false">
        <aside class="member-mobile-menu-sheet" (click)="$event.stopPropagation()">
          <div class="member-mobile-menu-head">
            <div>
              <span>MALLQUI GYM</span>
              <h3>Más opciones</h3>
            </div>
            <button type="button" (click)="mobileMenuAbierto=false" aria-label="Cerrar menú">×</button>
          </div>
          <div class="member-mobile-menu-grid">
            <button type="button" (click)="abrirModulo('rutinas')"><i>🏋</i><span>Rutinas</span></button>
            <button type="button" (click)="abrirModulo('calendario')"><i>◫</i><span>Calendario</span></button>
            <button type="button" (click)="abrirModulo('reservas')"><i>◷</i><span>Reservas</span></button>
            <button type="button" (click)="abrirModulo('asistencias')"><i>✓</i><span>Asistencias</span></button>
            <button type="button" (click)="abrirModulo('club')"><i>★</i><span>Acceso al gym</span></button>
            <button type="button" (click)="abrirModulo('pagos')"><i>▤</i><span>Membresía</span></button>
            <button type="button" (click)="abrirModulo('avisos')"><i>●</i><span>Avisos</span></button>
            <button type="button" (click)="abrirModulo('soporte')"><i>?</i><span>Ayuda</span></button>
            <button type="button" (click)="abrirModulo('perfil')"><i>♙</i><span>Perfil</span></button>
          </div>
          <div class="member-mobile-system" [class.offline]="!dbConectada">
            <i></i>
            <div><b>{{dbConectada ? 'Sistema conectado' : 'Sin conexión a datos'}}</b><small>{{dbConectada ? ('Laravel + '+dbMotor) : 'Revisa Laravel y MySQL'}}</small></div>
          </div>
          <button type="button" class="member-mobile-logout" (click)="cerrarSesion()">Cerrar sesión</button>
        </aside>
      </div>

      <main class="member-main" *ngIf="!cargando; else cargandoTpl">
        <div *ngIf="error" class="member-toast member-toast-error"><span aria-hidden="true">!</span><b>{{error}}</b></div>
        <div *ngIf="toast" class="member-toast member-toast-success"><span aria-hidden="true">✓</span><b>{{toast}}</b></div>

        <section *ngIf="!['inicio','casa','rutinas','clases','progreso','reservas','pagos','avisos'].includes(moduloActivo)" class="member-page-context">
          <div>
            <span>MI ESPACIO · MALLQUI GYM</span>
            <h2>{{tituloModuloActual}}</h2>
            <p>{{subtituloModuloActual}}</p>
          </div>
          <button type="button" (click)="abrirModulo('inicio')">⌂ Volver al inicio</button>
        </section>

        <section *ngIf="moduloActivo==='inicio'" class="member-dashboard mallqui-apex-home member-enter-up">

          <section class="mallqui-apex-hero">
            <img class="mallqui-apex-static" src="assets/showcase/hero-showcase.svg" alt="" aria-hidden="true">
            <div class="mallqui-apex-carousel" aria-hidden="true">
              <img class="mallqui-apex-slide slide-1" src="assets/showcase/hero-showcase.svg" alt="" fetchpriority="high" decoding="async">
              <img class="mallqui-apex-slide slide-2" src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2400&q=92" alt="" decoding="async">
              <img class="mallqui-apex-slide slide-3" src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=2400&q=92" alt="" decoding="async">
              <img class="mallqui-apex-slide slide-4" src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=2400&q=92" alt="" decoding="async">
            </div>
            <div class="mallqui-apex-shade" aria-hidden="true"></div>

            <div class="mallqui-apex-social" aria-hidden="true">
              <span>MG</span><i></i><small>MALLQUI GYM</small>
            </div>

            <div class="mallqui-apex-copy">
              <span class="mallqui-apex-kicker">TU ESPACIO · MALLQUI GYM</span>
              <h1>ALCANZA TU<br>MÁXIMO <strong>POTENCIAL.</strong></h1>
              <h2>Entrenamiento y seguimiento para superar tus metas.</h2>
              <p>Hola, <b>{{nombreCorto}}</b>. Organiza tu entrenamiento, revisa tu progreso y sigue construyendo una mejor versión de ti.</p>

              <div class="mallqui-apex-actions">
                <button type="button" class="apex-primary" (click)="abrirModulo('casa')">
                  <span>Entrenar ahora</span><em>→</em>
                </button>
                <button type="button" class="apex-secondary" (click)="abrirModulo('rutinas')">
                  <span>Ver mi rutina</span><em>↗</em>
                </button>
              </div>

              <div class="mallqui-apex-proof">
                <span><i>✓</i>Entrenamiento guiado</span>
                <span><i>✓</i>Reservas desde tu cuenta</span>
                <span><i>✓</i>Seguimiento personal</span>
              </div>
            </div>

            <aside class="mallqui-apex-coach">
              <div class="apex-coach-top">
                <span>GUÍA EN SALA</span>
                <b><i></i>{{rutinaActual?.entrenador ? 'Entrenador asignado' : 'Disponible'}}</b>
              </div>
              <div class="apex-coach-body">
                <img src="https://images.unsplash.com/photo-1581009137042-c552e485697a?auto=format&fit=crop&w=500&q=86" alt="Personal de Mallqui Gym">
                <div>
                  <h3>{{rutinaActual?.entrenador ? nombreEntrenador : 'Personal de Mallqui Gym'}}</h3>
                  <p>{{rutinaActual?.entrenador ? 'Tu entrenador puede orientarte durante la sesión y revisar tu rutina.' : 'Recibe orientación del personal y solicita tu rutina desde tu cuenta.'}}</p>
                </div>
              </div>
              <button type="button" (click)="tieneRutinaAsignadaGym ? abrirModulo('rutinas') : solicitarRutinaAlPersonal()" [disabled]="procesandoSolicitudRutina">
                {{tieneRutinaAsignadaGym ? 'Ver mi rutina' : 'Solicitar rutina'}} <span>→</span>
              </button>
            </aside>

            <div class="mallqui-apex-bottom">
              <div>
                <small>ASISTENCIAS</small>
                <b>{{showcaseAsistencias}}</b>
                <span>este mes</span>
              </div>
              <div>
                <small>RESERVAS</small>
                <b>{{showcaseReservas}}</b>
                <span>activas</span>
              </div>
              <div>
                <small>PROGRESO</small>
                <b>{{showcaseProgreso}}%</b>
                <span>meta mensual</span>
              </div>
              <div>
                <small>MEMBRESÍA</small>
                <b>{{membresiaActual ? 'ACTIVA' : 'PENDIENTE'}}</b>
                <span>{{membresiaActual ? (diasRestantesMembresia + ' días restantes') : 'Revisa tus planes'}}</span>
              </div>
            </div>

            <div class="mallqui-apex-scroll" aria-hidden="true"><span>SCROLL</span><i>↓</i></div>
          </section>

          <section class="mallqui-apex-dashboard">
            <div class="mallqui-apex-section-title">
              <div><span>MI ACTIVIDAD</span><h2>Lo importante, sin distracciones.</h2></div>
              <p>Tu siguiente acción y el estado de tu cuenta en un solo lugar.</p>
            </div>

            <div class="mallqui-apex-grid">
              <article class="apex-next-class">
                <div class="apex-card-head">
                  <span>PRÓXIMA CLASE</span>
                  <button type="button" (click)="abrirModulo('reservas')">Ver reservas ↗</button>
                </div>
                <div class="apex-next-body">
                  <img src="assets/showcase/class-showcase.svg" alt="Próxima clase">
                  <div>
                    <h3>{{reservasActivas[0]?.clase?.nombre || 'Sin reserva próxima'}}</h3>
                    <p>{{reservasActivas.length ? fechaCortaPortal(reservasActivas[0]?.fecha_clase) : 'Reserva una clase cuando estés listo.'}}</p>
                    <small>{{reservasActivas[0]?.clase?.hora_inicio || 'Horario por confirmar'}} · {{reservasActivas[0]?.clase?.sala || 'Sala por confirmar'}}</small>
                  </div>
                </div>
              </article>

              <article class="apex-membership">
                <span>MEMBRESÍA</span>
                <div class="apex-membership-main">
                  <div>
                    <small>{{membresiaActual ? 'PLAN ACTIVO' : 'SIN PLAN ACTIVO'}}</small>
                    <h3>{{membresiaActual ? nombreMembresiaVisible(membresiaActual) : 'Activa tu membresía'}}</h3>
                    <p>{{membresiaActual ? ('Válida hasta ' + fechaCortaPortal(membresiaActual.fecha_fin)) : 'Consulta los planes disponibles.'}}</p>
                  </div>
                  <b [class.off]="!membresiaActual"><i></i>{{membresiaActual ? 'Activa' : 'Pendiente'}}</b>
                </div>
                <button type="button" (click)="abrirModulo('pagos')">Ver detalles <span>→</span></button>
              </article>

              <article class="apex-profile-card" (click)="abrirModulo('perfil')">
                <span>PERFIL</span>
                <div class="apex-profile-main">
                  <div class="apex-profile-icon">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3"/><path d="M5 20c.7-4 3.1-6 7-6s6.3 2 7 6"/></svg>
                  </div>
                  <div>
                    <h3>{{perfilCompleto ? 'Perfil completo' : 'Completa tu perfil'}}</h3>
                    <p>{{perfilCompleto ? 'Tus datos están listos.' : 'Agrega tus datos para personalizar mejor tu experiencia.'}}</p>
                  </div>
                  <b>{{porcentajeInicio}}%</b>
                </div>
                <div class="apex-profile-progress"><i [style.width.%]="porcentajeInicio"></i></div>
              </article>
            </div>
          </section>

          <section class="mallqui-focus-section">
            <div class="mallqui-focus-head">
              <div>
                <span>ENFOQUES DE ENTRENAMIENTO</span>
                <h2>Entrena según tu objetivo.</h2>
              </div>
              <p>Opciones de entrenamiento que Mallqui Gym puede trabajar contigo según tu rutina y la orientación del personal.</p>
            </div>

            <div class="mallqui-focus-grid">
              <article class="focus-action-card" role="button" tabindex="0"
                       aria-label="Ver entrenamiento cardiovascular"
                       (click)="abrirEnfoqueEntrenamiento('Cardiovascular')"
                       (keydown.enter)="abrirEnfoqueEntrenamiento('Cardiovascular')">
                <span class="focus-index">01</span>
                <div class="focus-icon">❤</div>
                <small>RESISTENCIA Y SALUD</small>
                <h3>Cardiovascular</h3>
                <p>Trabajo de resistencia, capacidad cardiovascular y acondicionamiento general.</p>
                <span class="focus-card-action">Ver entrenamiento <b>→</b></span>
              </article>

              <article class="focus-action-card" role="button" tabindex="0"
                       aria-label="Ver entrenamiento para masa muscular"
                       (click)="abrirEnfoqueEntrenamiento('Masa muscular')"
                       (keydown.enter)="abrirEnfoqueEntrenamiento('Masa muscular')">
                <span class="focus-index">02</span>
                <div class="focus-icon">◆</div>
                <small>FUERZA</small>
                <h3>Masa muscular</h3>
                <p>Rutinas orientadas al desarrollo de fuerza y masa muscular con seguimiento del gimnasio.</p>
                <span class="focus-card-action">Ver entrenamiento <b>→</b></span>
              </article>

              <article class="focus-action-card" role="button" tabindex="0"
                       aria-label="Ver entrenamiento de tonificación"
                       (click)="abrirEnfoqueEntrenamiento('Tonificación')"
                       (keydown.enter)="abrirEnfoqueEntrenamiento('Tonificación')">
                <span class="focus-index">03</span>
                <div class="focus-icon">◎</div>
                <small>ACONDICIONAMIENTO</small>
                <h3>Tonificación</h3>
                <p>Trabajo equilibrado de fuerza, resistencia y control corporal.</p>
                <span class="focus-card-action">Ver entrenamiento <b>→</b></span>
              </article>

              <article class="focus-action-card" role="button" tabindex="0"
                       aria-label="Ver entrenamiento CrossFit"
                       (click)="abrirEnfoqueEntrenamiento('CrossFit')"
                       (keydown.enter)="abrirEnfoqueEntrenamiento('CrossFit')">
                <span class="focus-index">04</span>
                <div class="focus-icon">✦</div>
                <small>ENTRENAMIENTO FUNCIONAL</small>
                <h3>CrossFit</h3>
                <p>Sesiones funcionales de intensidad adaptada, combinando fuerza, movilidad y resistencia.</p>
                <span class="focus-card-action">Ver entrenamiento <b>→</b></span>
              </article>

              <article class="focus-action-card" role="button" tabindex="0"
                       aria-label="Ver entrenamiento para pérdida de peso"
                       (click)="abrirEnfoqueEntrenamiento('Pérdida de peso')"
                       (keydown.enter)="abrirEnfoqueEntrenamiento('Pérdida de peso')">
                <span class="focus-index">05</span>
                <div class="focus-icon">↗</div>
                <small>AERÓBICO + ANAERÓBICO</small>
                <h3>Pérdida de peso</h3>
                <p>Trabajo cardiovascular y de acondicionamiento orientado a mejorar la condición física.</p>
                <span class="focus-card-action">Ver entrenamiento <b>→</b></span>
              </article>
            </div>

            <div class="mallqui-supplement-strip">
              <div>
                <span>SUPLEMENTACIÓN Y PROVEEDORES</span>
                <h3>Universal Nutrition <b>(UN)</b></h3>
                <p>Productos disponibles según stock del gimnasio. La información y registro sanitario deben verificarse según cada producto.</p>
              </div>
              <div class="mallqui-supplement-badges">
                <span>UN</span>
                <span>Universal Nutrition</span>
                <span>Referencia FDA</span>
              </div>
              <button type="button" (click)="abrirModulo('rutinas')">Ver mi rutina <span>→</span></button>
            </div>
          </section>

          <section class="mallqui-wellbeing-section">
            <div class="mallqui-wellbeing-head">
              <div>
                <span>ACTIVIDAD FÍSICA Y BIENESTAR</span>
                <h2>Muévete hoy para cuidar tu salud.</h2>
                <p>Referencia informativa basada en el material del gimnasio sobre sedentarismo y actividad física.</p>
              </div>
              <b>MENOS SEDENTARISMO · MÁS MOVIMIENTO</b>
            </div>

            <div class="mallqui-wellbeing-grid">
              <article>
                <span class="wellbeing-index">01</span>
                <div class="wellbeing-icon">♥</div>
                <small>SALUD CARDIOVASCULAR</small>
                <h3>Resistencia y corazón</h3>
                <p>La actividad física regular puede apoyar la resistencia cardiovascular y la salud general. Si una persona tiene hipertensión, enfermedad cardiaca u otra condición diagnosticada, su entrenamiento debe seguir indicaciones profesionales.</p>
                <button type="button" (click)="abrirEnfoqueEntrenamiento('Cardiovascular')">Ver enfoque cardiovascular <span>→</span></button>
              </article>

              <article>
                <span class="wellbeing-index">02</span>
                <div class="wellbeing-icon">◆</div>
                <small>MÚSCULO Y ESQUELETO</small>
                <h3>Fuerza y movilidad</h3>
                <p>El trabajo progresivo de fuerza y movilidad ayuda a mantener la función física. Ante dolor lumbar, lesión, osteoporosis o molestias articulares, el ejercicio debe adaptarse con orientación adecuada.</p>
                <button type="button" (click)="abrirEnfoqueEntrenamiento('Tonificación')">Ver enfoque de tonificación <span>→</span></button>
              </article>

              <article>
                <span class="wellbeing-index">03</span>
                <div class="wellbeing-icon">◎</div>
                <small>BIENESTAR MENTAL</small>
                <h3>Actividad y estado de ánimo</h3>
                <p>Mantenerse activo puede apoyar el bienestar, el descanso y el manejo del estrés. No reemplaza la atención de un profesional cuando existen problemas de salud mental.</p>
                <button type="button" (click)="abrirEnfoqueEntrenamiento('Cardiovascular')">Ver actividad guiada <span>→</span></button>
              </article>

              <article>
                <span class="wellbeing-index">04</span>
                <div class="wellbeing-icon">↗</div>
                <small>SALUD METABÓLICA</small>
                <h3>Acondicionamiento general</h3>
                <p>Combinar movimiento, fuerza y trabajo cardiovascular puede apoyar la salud metabólica y la condición física. El sistema no propone cambios rápidos de peso ni sustituye indicaciones médicas.</p>
                <button type="button" (click)="abrirEnfoqueEntrenamiento('Pérdida de peso')">Ver aeróbico + anaeróbico <span>→</span></button>
              </article>

              <article>
                <span class="wellbeing-index">05</span>
                <div class="wellbeing-icon">◷</div>
                <small>CAPACIDAD RESPIRATORIA</small>
                <h3>Resistencia física</h3>
                <p>El ejercicio progresivo puede mejorar la capacidad física general. Si existen asma u otras enfermedades respiratorias, la intensidad debe ajustarse con indicaciones del profesional de salud y del entrenador.</p>
                <button type="button" (click)="abrirEnfoqueEntrenamiento('Cardiovascular')">Ver entrenamiento progresivo <span>→</span></button>
              </article>
            </div>

            <div class="mallqui-wellbeing-note">
              <span>REFERENCIA DEL GIMNASIO</span>
              <p>El afiche original relaciona la inactividad física con distintas enfermedades. En el sistema esta información se usa solo como educación y prevención: <b>el ejercicio no diagnostica ni cura enfermedades</b>. La rutina final debe adaptarse al usuario y ser registrada por el entrenador.</p>
            </div>
          </section>
        </section>

        <section *ngIf="moduloActivo==='inicio'" class="gym-real-info-panel member-enter-up">
          <div class="gym-real-info-head">
            <div>
              <span>INFORMACIÓN DE MALLQUI GYM</span>
              <h2>Todo lo que necesitas antes de venir</h2>
              <p>Datos proporcionados por el gimnasio y cargados desde el sistema.</p>
            </div>
            <b>{{gymInfo?.nombre_gimnasio || 'Mallqui Gym'}}</b>
          </div>

          <div class="gym-real-info-grid">
            <article>
              <i>⌖</i>
              <div><small>UBICACIÓN</small><b>{{gymInfo?.direccion || 'Jr. Los Laureles Mz 17 Lt 18'}}</b><p>{{gymInfo?.referencia || 'Referencia: Plaza de Laura Bosso'}}</p></div>
            </article>
            <article>
              <i>☎</i>
              <div><small>CONTACTO</small><b>{{gymInfo?.telefono || '939398148'}}</b><p>Comunícate con el personal del gimnasio.</p></div>
            </article>
            <article class="wide">
              <i>◷</i>
              <div><small>HORARIO DE ATENCIÓN</small><b>Atención de lunes a domingo</b><p>{{gymInfo?.horario_detalle || 'Lunes a viernes: 6:00 a. m. - 12:00 p. m. y 2:00 p. m. - 9:30 p. m. | Sábado: 6:00 a. m. - 12:00 p. m. y 2:00 p. m. - 8:30 p. m. | Domingo: atención hasta el mediodía.'}}</p></div>
            </article>
            <article>
              <i>S/</i>
              <div><small>TARIFAS</small><b>{{resumenMensualidades}}</b><p>Ingreso o rutina diaria: S/ {{(gymInfo?.tarifa_diaria || 6) | number:'1.2-2'}}</p></div>
            </article>
            <article>
              <i>✓</i>
              <div><small>ATENCIÓN EN SALA</small><b>Guía del personal del gym</b><p>Las instrucciones y orientación están a cargo del personal de Mallqui Gym.</p></div>
            </article>
            <article class="wide">
              <i>▤</i>
              <div><small>PRODUCTOS EN RECEPCIÓN</small><b>Productos para consumo</b><p>{{gymInfo?.mensaje_productos || 'Energizantes, bebidas y productos para consumo disponibles en recepción.'}}</p></div>
            </article>
          </div>
        </section>

        <section *ngIf="moduloActivo==='casa'" class="member-module home-training-module module-training-v34 member-enter-up">
          <section class="train-ux-shell" *ngIf="!sesionCasaActiva && !sesionCasaTerminada">
            <section class="train-ux-intro">
              <article class="train-ux-copy-card">
                <div class="train-ux-kicker"><i></i> ENTRENAMIENTO DENTRO DE MALLQUI GYM</div>
                <h1>Tu <strong>rutina registrada</strong> en el gimnasio</h1>
                <p>Esta pantalla usa la rutina activa que Mallqui Gym tiene registrada para tu cuenta. Aquí se muestran exactamente los ejercicios, series, repeticiones, carga recomendada, descansos e indicaciones de tu entrenador.</p>

                <div class="train-gym-context-strip">
                  <button type="button" (click)="abrirModulo('rutinas')">🏋 Rutina asignada</button>
                  <button type="button" (click)="abrirModulo('perfil')">✓ Datos del cliente</button>
                  <button type="button" (click)="irDetalleEntrenamiento()">◷ Descansos</button>
                  <button type="button" (click)="abrirModulo('progreso')">▦ Progreso</button>
                </div>

                <div class="train-gym-statusbar">
                  <div>
                    <small>MEMBRESÍA</small>
                    <b>{{nombreMembresiaVisible(membresiaActual)}}</b>
                  </div>
                  <div>
                    <small>RUTINA</small>
                    <b>{{rutinaActual?.nombre_rutina || 'Sin rutina asignada'}}</b>
                  </div>
                  <div>
                    <small>GUÍA</small>
                    <b>{{rutinaActual?.entrenador ? nombreEntrenador : 'Personal de Mallqui Gym'}}</b>
                  </div>
                </div>

                <div class="train-ux-summary">
                  <div><span>◎</span><p><small>OBJETIVO</small><b>{{rutinaActual?.objetivo || 'Por definir'}}</b></p></div>
                  <div><span>◷</span><p><small>DURACIÓN ESTIMADA</small><b>{{tieneRutinaAsignadaGym ? (duracionEstimadaCasa(zonaCasaSeleccionada)+' min') : '-'}}</b></p></div>
                  <div><span>▦</span><p><small>EJERCICIOS</small><b>{{ejerciciosCasaActuales.length}}</b></p></div>
                </div>

                <div class="train-ux-actions">
                  <button type="button"
                          class="train-ux-primary"
                          (click)="accionEntrenamientoPrincipal()"
                          [disabled]="procesandoSolicitudRutina">
                    <span>{{puedeEntrenarRutinaGym ? '▶' : (membresiaActual ? '✉' : '▤')}}</span>
                    <div>
                      <b>{{puedeEntrenarRutinaGym ? 'Iniciar mi rutina' : (!membresiaActual ? 'Activar membresía' : (procesandoSolicitudRutina ? 'Enviando solicitud...' : 'Solicitar rutina al personal'))}}</b>
                      <small>{{!membresiaActual ? 'Elige tu mensualidad para habilitar el acceso' : (!tieneRutinaAsignadaGym ? 'Tu membresía está activa; pide al personal que registre tu rutina' : 'Entrenamiento registrado en Mallqui Gym')}}</small>
                    </div>
                    <em>→</em>
                  </button>
                  <button type="button" class="train-ux-secondary" (click)="abrirModulo(tieneRutinaAsignadaGym ? 'rutinas' : 'soporte')">
                    <span>🏋</span><b>{{tieneRutinaAsignadaGym ? 'Ver mi rutina registrada' : 'Hablar con el gimnasio'}}</b>
                  </button>
                </div>
              </article>

              <article class="train-ux-visual-card">
                <div class="train-ux-carousel" aria-hidden="true">
                  <img class="train-ux-slide train-ux-slide-1"
                       src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1400&q=90"
                       alt="">
                  <img class="train-ux-slide train-ux-slide-2"
                       src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=90"
                       alt="">
                  <img class="train-ux-slide train-ux-slide-3"
                       src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=90"
                       alt="">
                </div>
                <div class="train-ux-visual-shade"></div>

                <div class="train-ux-live-badge"><i></i> GUÍA VISUAL</div>

                <div class="train-ux-visual-info">
                  <small>RUTINA ACTIVA DEL CLIENTE</small>
                  <h2>{{rutinaActual?.nombre_rutina || 'Aún sin rutina asignada'}}</h2>
                  <p *ngIf="tieneRutinaAsignadaGym">{{ejerciciosCasaActuales.length}} ejercicios · {{duracionEstimadaCasa(zonaCasaSeleccionada)}} min aprox.</p>
                  <p *ngIf="!tieneRutinaAsignadaGym">Cuando el entrenador registre tu rutina, aparecerá aquí automáticamente.</p>
                </div>

                <div class="train-ux-no-equipment">✓ Equipamiento del gimnasio</div>
              </article>
            </section>

            <section class="train-ux-stepbar">
              <button type="button" class="train-step" [class.active]="!!membresiaActual" (click)="abrirModulo('pagos')">
                <span>1</span>
                <div><small>ACCESO</small><b>Membresía</b><p>{{membresiaActual ? 'Membresía activa' : 'Sin membresía activa'}}</p></div>
                <em *ngIf="membresiaActual">✓</em>
              </button>
              <i>›</i>
              <button type="button" class="train-step" [class.active]="tieneRutinaAsignadaGym" (click)="tieneRutinaAsignadaGym ? abrirModulo('rutinas') : solicitarRutinaAlPersonal()">
                <span>2</span>
                <div><small>PLANIFICACIÓN</small><b>Rutina asignada</b><p>{{tieneRutinaAsignadaGym ? rutinaActual?.nombre_rutina : 'Pendiente del personal'}}</p></div>
                <em *ngIf="tieneRutinaAsignadaGym">✓</em>
              </button>
              <i>›</i>
              <button type="button" class="train-step" [class.active]="puedeEntrenarRutinaGym" (click)="accionEntrenamientoPrincipal()">
                <span>3</span>
                <div><small>EJECUCIÓN</small><b>Entrenar en sala</b><p>{{puedeEntrenarRutinaGym ? 'Series, repeticiones, carga y descansos' : 'Completa el paso anterior para comenzar'}}</p></div>
                <em *ngIf="puedeEntrenarRutinaGym">LISTO</em>
              </button>
            </section>
          </section>

          <section *ngIf="membresiaActual && !sesionCasaActiva && !sesionCasaTerminada" class="membership-unlocked-panel">
            <div class="membership-unlocked-head">
              <div>
                <small>MEMBRESÍA HABILITADA</small>
                <h2>Tu acceso al gimnasio ya está activo</h2>
                <p>Ahora puedes usar las funciones de tu cuenta aunque todavía estés esperando que el personal registre una rutina.</p>
              </div>
              <span>{{diasRestantesMembresia}} días restantes</span>
            </div>

            <div class="membership-unlocked-summary">
              <article><small>MEMBRESÍA</small><b>{{nombreMembresiaVisible(membresiaActual)}}</b><p>{{fechaCortaPortal(membresiaActual.fecha_inicio)}} → {{fechaCortaPortal(membresiaActual.fecha_fin)}}</p></article>
              <article><small>ÚLTIMO PAGO</small><b>{{ultimoPagoCompletado ? ('S/ '+(ultimoPagoCompletado.monto | number:'1.2-2')) : 'Sin pago reciente'}}</b><p>{{ultimoPagoCompletado ? (ultimoPagoCompletado.metodo_pago+' · Op. '+(ultimoPagoCompletado.numero_operacion || '-')) : 'Consulta tu historial en Membresía'}}</p></article>
              <article><small>RUTINA</small><b>{{tieneRutinaAsignadaGym ? rutinaActual?.nombre_rutina : 'Pendiente del personal'}}</b><p>{{tieneRutinaAsignadaGym ? (ejerciciosCasaActuales.length+' ejercicios registrados') : 'Puedes solicitarla desde aquí'}}</p></article>
              <article><small>ACCESO</small><b>Credencial habilitada</b><p>Usa tu código de barras en recepción.</p></article>
            </div>

            <div class="membership-unlocked-actions">
              <button type="button" (click)="abrirModulo('club')"><span>▥</span><b>Credencial de acceso</b><small>Mostrar código de barras</small></button>
              <button type="button" (click)="ultimoPagoCompletado ? comprobante(ultimoPagoCompletado) : abrirModulo('pagos')"><span>▤</span><b>Mi boleta</b><small>Ver último comprobante</small></button>
              <button type="button" (click)="abrirModulo('clases')"><span>▣</span><b>Clases</b><small>Ver horarios y reservar</small></button>
              <button type="button" (click)="abrirModulo('asistencias')"><span>✓</span><b>Asistencias</b><small>Entradas y salidas</small></button>
              <button type="button" (click)="tieneRutinaAsignadaGym ? abrirModulo('rutinas') : solicitarRutinaAlPersonal()" [disabled]="procesandoSolicitudRutina"><span>🏋</span><b>{{tieneRutinaAsignadaGym ? 'Mi rutina' : 'Solicitar rutina'}}</b><small>{{tieneRutinaAsignadaGym ? 'Ver ejercicios' : 'Enviar solicitud al personal'}}</small></button>
              <button type="button" (click)="abrirModulo('perfil')"><span>♙</span><b>Mi perfil</b><small>Datos de la cuenta</small></button>
            </div>

            <div class="membership-upcoming-card" *ngIf="membresiaProxima">
              <span>PRÓXIMA MEMBRESÍA PROGRAMADA</span>
              <b>{{nombreMembresiaVisible(membresiaProxima)}}</b>
              <p>Comienza el {{fechaCortaPortal(membresiaProxima.fecha_inicio)}} y termina el {{fechaCortaPortal(membresiaProxima.fecha_fin)}}.</p>
            </div>
          </section>

          <section class="training-profile-guide" *ngIf="!sesionCasaActiva && !sesionCasaTerminada">
            <div class="training-profile-guide-head">
              <div>
                <small>ORIENTACIÓN DEL ENTRENAMIENTO</small>
                <h2>Qué te toca hacer cuando vayas al gym</h2>
                <p>El sistema organiza tu objetivo, nivel, tipo de entrenamiento y clase de sesión. La rutina definitiva la registra el entrenador.</p>
              </div>
              <span>{{enfoqueInicioSeleccionado || 'Cardiovascular'}}</span>
            </div>

            <div class="training-level-selector">
              <span>NIVEL</span>
              <button type="button"
                      [class.active]="nivelEntrenamiento==='Principiante'"
                      (click)="seleccionarNivelEntrenamiento('Principiante')">
                Principiante
              </button>
              <button type="button"
                      [class.active]="nivelEntrenamiento==='Intermedio'"
                      (click)="seleccionarNivelEntrenamiento('Intermedio')">
                Intermedio
              </button>
              <button type="button"
                      [class.active]="nivelEntrenamiento==='Avanzado'"
                      (click)="seleccionarNivelEntrenamiento('Avanzado')">
                Avanzado
              </button>
            </div>

            <div class="training-profile-cards">
              <article>
                <small>OBJETIVO</small>
                <b>{{enfoqueInicioSeleccionado || 'Cardiovascular'}}</b>
                <p>Meta seleccionada desde el inicio del usuario.</p>
              </article>
              <article>
                <small>TIPO DE ENTRENAMIENTO</small>
                <b>{{guiaEnfoqueInicio.tipo}}</b>
                <p>Clasificación general de la sesión.</p>
              </article>
              <article>
                <small>CLASE DE SESIÓN</small>
                <b>{{guiaEnfoqueInicio.clase}}</b>
                <p>{{guiaEnfoqueInicio.descripcion}}</p>
              </article>
              <article>
                <small>NIVEL</small>
                <b>{{nivelEntrenamiento}}</b>
                <p *ngIf="nivelEntrenamiento==='Principiante'">Inicio con técnica, adaptación y supervisión del personal.</p>
                <p *ngIf="nivelEntrenamiento==='Intermedio'">Para usuarios con experiencia previa y técnica estable.</p>
                <p *ngIf="nivelEntrenamiento==='Avanzado'">Debe ajustarse con el entrenador según experiencia y rutina registrada.</p>
              </article>
            </div>

            <div class="training-exercise-preview">
              <div class="training-exercise-preview-title">
                <div>
                  <small>EJERCICIOS DE REFERENCIA</small>
                  <h3>Ejemplos para esta clase de entrenamiento</h3>
                </div>
                <b>{{guiaEnfoqueInicio.ejercicios.length}} ejercicios</b>
              </div>
              <div class="training-exercise-preview-list">
                <div *ngFor="let ejercicio of guiaEnfoqueInicio.ejercicios; let i=index">
                  <span>{{i+1}}</span>
                  <div><b>{{ejercicio}}</b><small>El entrenador define series, repeticiones, carga y descanso.</small></div>
                </div>
              </div>
            </div>

            <div class="training-profile-actions">
              <button type="button"
                      class="training-profile-primary"
                      (click)="tieneRutinaAsignadaGym ? abrirModulo('rutinas') : solicitarRutinaConPerfil()"
                      [disabled]="procesandoSolicitudRutina">
                <span>🏋</span>
                <div>
                  <b>{{tieneRutinaAsignadaGym ? 'Ver mi rutina registrada' : (procesandoSolicitudRutina ? 'Enviando solicitud...' : 'Solicitar rutina con estos datos')}}</b>
                  <small>{{tieneRutinaAsignadaGym ? 'Ver ejercicios reales asignados por tu entrenador' : 'Enviar nivel, objetivo, tipo y clase al personal del gimnasio'}}</small>
                </div>
                <em>→</em>
              </button>
              <button type="button" class="training-profile-secondary" (click)="abrirModulo('inicio')">
                Cambiar objetivo
              </button>
            </div>

            <p class="training-profile-note">
              Esta guía no reemplaza la rutina asignada por el entrenador. Cuando el personal registre tu plan, la sección Entrenar mostrará los ejercicios reales, sus series, repeticiones, carga y descansos.
            </p>
          </section>

          <section class="gym-session-flow" *ngIf="!sesionCasaActiva && !sesionCasaTerminada">
            <button type="button" (click)="abrirModulo('asistencias')">
              <span>1</span>
              <div><small>INGRESO</small><b>Asistencia</b><p>Consulta tus entradas y salidas registradas en recepción.</p></div>
            </button>
            <button type="button" (click)="irDetalleEntrenamiento()">
              <span>2</span>
              <div><small>PREPARACIÓN</small><b>Guía de la sesión</b><p>Revisa ejercicios, descansos e indicaciones antes de comenzar.</p></div>
            </button>
            <button type="button" (click)="tieneRutinaAsignadaGym ? abrirModulo('rutinas') : solicitarRutinaAlPersonal()">
              <span>3</span>
              <div><small>RUTINA EN SALA</small><b>Máquinas y pesas</b><p>{{tieneRutinaAsignadaGym ? 'Ver ejercicios asignados' : 'Solicitar rutina al personal'}}</p></div>
            </button>
            <button type="button" (click)="abrirModulo('progreso')">
              <span>4</span>
              <div><small>CIERRE</small><b>Progreso e historial</b><p>Consulta las sesiones y actividades que ya fueron guardadas.</p></div>
            </button>
          </section>

          <div *ngIf="errorCasa" class="home-training-alert">{{errorCasa}}</div>

          <section class="gym-assigned-routine gym-assigned-routine-real"
                   *ngIf="!sesionCasaActiva && !sesionCasaTerminada && tieneRutinaAsignadaGym">
            <div class="gym-assigned-routine-head">
              <div class="gym-assigned-icon">🏋</div>
              <div>
                <small>RUTINA ACTIVA ASIGNADA POR TU ENTRENADOR</small>
                <h3>{{rutinaActual.nombre_rutina}}</h3>
                <p>{{rutinaActual.objetivo || 'Plan de entrenamiento personalizado'}} · {{ejerciciosCasaActuales.length}} ejercicios</p>
              </div>
              <button type="button" class="gym-assigned-view" (click)="abrirModulo('rutinas')">Ver detalle →</button>
            </div>

            <div class="gym-assigned-exercises">
              <article *ngFor="let e of ejerciciosCasaActuales; let i=index">
                <span>{{i+1}}</span>
                <div>
                  <b>{{e.nombre}}</b>
                  <small>{{e.equipo}}</small>
                </div>
                <p><b>{{e.series}}</b><small>series</small></p>
                <p><b>{{e.repeticiones}}</b><small>reps</small></p>
                <p><b>{{textoPesoGym(e)}}</b><small>carga</small></p>
                <p><b>{{e.descanso}} s</b><small>descanso</small></p>
              </article>
            </div>

            <div class="gym-assigned-actions">
              <div>
                <small>LISTA PARA ENTRENAR</small>
                <b>{{totalSeriesCasaActuales}} series programadas · {{duracionEstimadaCasa(zonaCasaSeleccionada)}} min aprox.</b>
              </div>
              <button type="button" class="gym-assigned-start" (click)="iniciarEntrenamientoCasa()" [disabled]="!membresiaActual">
                <span>▶</span>
                {{membresiaActual ? 'Iniciar rutina asignada' : 'Membresía no activa'}}
              </button>
            </div>
          </section>

          <section *ngIf="!sesionCasaActiva && !sesionCasaTerminada && !tieneRutinaAsignadaGym"
                   class="member-empty-card member-empty-guided empty-routines-panel">
            <span class="empty-state-icon" aria-hidden="true">🏋</span>
            <small class="empty-state-kicker">RUTINA DEL CLIENTE</small>
            <h3>Aún no tienes una rutina activa asignada</h3>
            <p>Ya puedes definir tu nivel y objetivo en la guía superior. Después envía esos datos al personal para que el entrenador registre la rutina final con ejercicios, series, repeticiones, carga, descanso e indicaciones.</p>
            <div class="empty-actions">
              <button type="button" class="empty-primary" (click)="abrirModulo('rutinas')">
                <span>🏋</span><b>Revisar mis rutinas</b>
              </button>
              <button type="button" class="empty-secondary" (click)="solicitarRutinaConPerfil()" [disabled]="procesandoSolicitudRutina">
                <span>?</span><b>{{procesandoSolicitudRutina ? 'Enviando...' : 'Solicitar rutina con mi objetivo'}}</b>
              </button>
            </div>
          </section>

          <section id="sesion-entrenamiento-casa" *ngIf="sesionCasaActiva" class="gym-workout-session">
            <header class="gym-workout-session-head">
              <div>
                <span><i></i> ENTRENAMIENTO EN CURSO · MALLQUI GYM</span>
                <h2>{{nombreRutinaSesionGym}}</h2>
                <p>{{rutinaActual?.entrenador ? ('Entrenador: '+nombreEntrenador) : 'Sesión de musculación en sala'}}</p>
              </div>

              <div class="gym-workout-head-stats">
                <article><small>EJERCICIO</small><b>{{indiceEjercicioCasa+1}} / {{ejerciciosCasaActuales.length}}</b></article>
                <article><small>SERIE</small><b>{{serieCasaActual}} / {{seriesCasaTotalActual}}</b></article>
                <article><small>TIEMPO</small><b>{{formatoTiempoCasa(segundosTranscurridosCasa)}}</b></article>
              </div>
            </header>

            <div *ngIf="errorCasa" class="home-training-alert">{{errorCasa}}</div>

            <section class="gym-workout-current" *ngIf="faseCasa==='ejercicio' && ejercicioCasaActual">
              <article class="gym-workout-exercise">
                <div class="gym-workout-photo">
                  <img [src]="imagenEjercicioCasa(ejercicioCasaActual)"
                       (error)="ocultarImagenEjercicio($event)"
                       [alt]="ejercicioCasaActual.nombre">
                  <span>ESTACIÓN {{indiceEjercicioCasa+1}}</span>
                </div>

                <div class="gym-workout-copy">
                  <span>EJERCICIO ACTUAL</span>
                  <h3>{{ejercicioCasaActual.nombre}}</h3>

                  <div class="gym-workout-equipment">
                    <i>🏋</i>
                    <div><small>EQUIPO / MÁQUINA</small><b>{{ejercicioCasaActual.equipo || 'Área de musculación'}}</b></div>
                  </div>

                  <div class="gym-workout-prescription">
                    <article><small>SERIES</small><b>{{seriesCasaTotalActual}}</b></article>
                    <article><small>REPETICIONES</small><b>{{prescripcionEjercicioCasa(ejercicioCasaActual)}}</b></article>
                    <article><small>CARGA</small><b>{{textoPesoGym(ejercicioCasaActual)}}</b></article>
                    <article><small>DESCANSO</small><b>{{ejercicioCasaActual.descanso || 45}} s</b></article>
                  </div>

                  <p class="gym-workout-observation" *ngIf="ejercicioCasaActual.observaciones">
                    <span>INDICACIÓN DEL ENTRENADOR</span>
                    {{ejercicioCasaActual.observaciones}}
                  </p>

                  <button type="button"
                          class="gym-technique-toggle"
                          (click)="verEjercicioCasa=verEjercicioCasa===ejercicioCasaActual.id?'':ejercicioCasaActual.id">
                    {{verEjercicioCasa===ejercicioCasaActual.id ? 'Ocultar indicaciones' : 'Ver indicaciones'}}
                  </button>

                  <div class="gym-live-technique" *ngIf="verEjercicioCasa===ejercicioCasaActual.id">
                    <p *ngFor="let paso of ejercicioCasaActual.instrucciones; let p=index">
                      <span>{{p+1}}</span>{{paso}}
                    </p>
                  </div>
                </div>
              </article>

              <aside class="gym-set-control">
                <div class="gym-set-control-head">
                  <span>CONTROL DE SERIES</span>
                  <h3>Registra lo que haces</h3>
                  <p>No necesitas tocar un botón por cada repetición. Completa la serie y márcala una sola vez.</p>
                </div>

                <div class="gym-set-list">
                  <article *ngFor="let serie of seriesArrayCasa(ejercicioCasaActual)"
                           [class.done]="serie < serieCasaActual"
                           [class.active]="serie===serieCasaActual">
                    <span>{{serie < serieCasaActual ? '✓' : serie}}</span>
                    <div>
                      <b>Serie {{serie}}</b>
                      <small>{{prescripcionEjercicioCasa(ejercicioCasaActual)}} · {{textoPesoGym(ejercicioCasaActual)}}</small>
                    </div>
                    <em>{{serie < serieCasaActual ? 'Completada' : (serie===serieCasaActual ? 'En curso' : 'Pendiente')}}</em>
                  </article>
                </div>

                <label class="gym-load-input">
                  <span>Carga usada en este ejercicio</span>
                  <div>
                    <input type="number"
                           min="0"
                           step="0.5"
                           [ngModel]="cargaActualGym(ejercicioCasaActual)"
                           (ngModelChange)="actualizarCargaGym(ejercicioCasaActual,$event)"
                           name="cargaGymActual"
                           placeholder="0">
                    <b>kg</b>
                  </div>
                  <small *ngIf="ejercicioCasaActual.peso_recomendado">
                    Recomendado por la rutina: {{ejercicioCasaActual.peso_recomendado}} kg
                  </small>
                  <small *ngIf="!ejercicioCasaActual.peso_recomendado">
                    Registra la carga que estás utilizando en el gimnasio.
                  </small>
                </label>

                <button type="button"
                        class="gym-complete-set"
                        (click)="completarSerieGym()"
                        [disabled]="sesionCasaPausada">
                  <span>✓</span>
                  <div>
                    <b>Completar serie {{serieCasaActual}}</b>
                    <small>{{prescripcionEjercicioCasa(ejercicioCasaActual)}} realizadas</small>
                  </div>
                </button>
              </aside>
            </section>

            <section class="gym-workout-rest" *ngIf="faseCasa==='descanso'">
              <article class="gym-workout-rest-timer">
                <span>DESCANSO PROGRAMADO</span>
                <strong>{{formatoTiempoCasa(segundosCasa)}}</strong>
                <p>{{textoDescansoCasa}}</p>
                <button type="button" (click)="saltarDescansoGym()">Saltar descanso →</button>
              </article>

              <article class="gym-workout-next">
                <small>{{serieCasaActual < seriesCasaTotalActual ? 'SIGUIENTE SERIE' : 'SIGUIENTE EJERCICIO'}}</small>
                <h3>{{serieCasaActual < seriesCasaTotalActual ? ejercicioCasaActual?.nombre : (siguienteEjercicioCasa?.nombre || 'Finalizar rutina')}}</h3>

                <ng-container *ngIf="serieCasaActual < seriesCasaTotalActual">
                  <p>Serie {{serieCasaActual+1}} de {{seriesCasaTotalActual}}</p>
                  <div><span>Equipo</span><b>{{ejercicioCasaActual?.equipo}}</b></div>
                  <div><span>Objetivo</span><b>{{prescripcionEjercicioCasa(ejercicioCasaActual)}}</b></div>
                  <div><span>Carga</span><b>{{textoPesoGym(ejercicioCasaActual)}}</b></div>
                </ng-container>

                <ng-container *ngIf="serieCasaActual >= seriesCasaTotalActual && siguienteEjercicioCasa">
                  <p>Prepárate para cambiar de estación.</p>
                  <div><span>Equipo</span><b>{{siguienteEjercicioCasa.equipo}}</b></div>
                  <div><span>Series</span><b>{{siguienteEjercicioCasa.series}} × {{siguienteEjercicioCasa.repeticiones}}</b></div>
                  <div><span>Carga</span><b>{{textoPesoGym(siguienteEjercicioCasa)}}</b></div>
                </ng-container>
              </article>
            </section>

            <section class="gym-workout-progress">
              <div>
                <span>PROGRESO DE LA RUTINA</span>
                <b>{{progresoCasa}}%</b>
              </div>
              <div class="gym-workout-progress-track"><i [style.width.%]="progresoCasa"></i></div>
            </section>

            <section class="gym-workout-table">
              <header>
                <div>
                  <span>RUTINA DE HOY</span>
                  <h3>{{ejerciciosCasaActuales.length}} ejercicios programados</h3>
                </div>
                <small>{{totalSeriesCasaActuales}} series en total</small>
              </header>

              <div class="gym-workout-table-head">
                <span>#</span><span>Ejercicio</span><span>Equipo</span><span>Series × reps</span><span>Carga</span><span>Descanso</span><span>Estado</span>
              </div>

              <article *ngFor="let e of ejerciciosCasaActuales; let i=index"
                       [class.current]="i===indiceEjercicioCasa"
                       [class.done]="i<indiceEjercicioCasa">
                <span>{{numeroFilaGym(i)}}</span>
                <div><b>{{e.nombre}}</b><small *ngIf="e.observaciones">{{e.observaciones}}</small></div>
                <b>{{e.equipo}}</b>
                <b>{{e.series}} × {{e.repeticiones}}</b>
                <b>{{textoPesoGym(e)}}</b>
                <b>{{e.descanso}} s</b>
                <em>{{estadoFilaGym(i)}}</em>
              </article>
            </section>

            <footer class="gym-workout-actions">
              <button type="button" class="control-secondary" (click)="togglePausaCasa()">
                {{sesionCasaPausada ? '▶ Continuar sesión' : 'Ⅱ Pausar sesión'}}
              </button>
              <button type="button" class="control-danger" (click)="cancelarSesionCasa()">Finalizar antes de tiempo</button>
            </footer>
          </section>

          <section *ngIf="sesionCasaTerminada" class="home-session-complete">
            <div class="complete-badge" aria-hidden="true">✓</div>
            <span>SESIÓN COMPLETADA</span>
            <h2>Entrenamiento terminado</h2>
            <p>Completaste tu sesión de {{metaZonaCasa(zonaCasaSeleccionada).nombre}} dentro del gimnasio. Se guardaron tus ejercicios, series y tiempo de entrenamiento.</p>

            <div class="complete-summary">
              <div><small>EJERCICIOS</small><b>{{ejerciciosCasaActuales.length}}</b></div>
              <div><small>SERIES</small><b>{{totalSeriesCasaActuales}}</b></div>
              <div><small>ZONA</small><b>{{metaZonaCasa(zonaCasaSeleccionada).nombre}}</b></div>
              <div><small>TIEMPO</small><b>{{formatoTiempoCasa(segundosTranscurridosCasa)}}</b></div>
            </div>

            <div class="complete-actions">
              <button type="button" class="complete-action-primary" (click)="reiniciarSesionCasa()">
                <span>↻</span>
                <div><b>Elegir otro entrenamiento</b><small>Volver a grupos musculares</small></div>
                <em>Continuar →</em>
              </button>

              <button type="button" class="complete-action-secondary" (click)="abrirModulo('progreso')">
                <span>▥</span>
                <div><b>Ver mi progreso</b><small>Revisar actividad guardada</small></div>
              </button>

              <button type="button" class="complete-action-ghost" (click)="abrirModulo('inicio')">
                <span>⌂</span><b>Volver al inicio</b>
              </button>
            </div>
          </section>

          <section class="member-module-card home-history-card" *ngIf="historialCasa.length">
            <div class="card-title-block"><span>HISTORIAL</span><h2>Últimas sesiones en el gym</h2><p>Tu progreso queda guardado en el sistema.</p></div>
            <div class="home-history-list">
              <div *ngFor="let sesion of historialCasa.slice(0,6)">
                <span>{{metaZonaCasa(sesion.zona).icono}}</span>
                <div><b>{{metaZonaCasa(sesion.zona).nombre}}</b><small>{{fecha(sesion.fecha)}} · {{sesion.ejercicios_completados}}/{{sesion.ejercicios_total}} ejercicios</small></div>
                <em>{{formatoTiempoCasa(sesion.duracion_segundos)}}</em>
              </div>
            </div>
          </section>
        </section>

        <section *ngIf="moduloActivo==='rutinas'" class="member-module module-routines-v34 member-enter-up">
          <section class="module-portal-head module-portal-routines">
            <article class="module-portal-hero module-portal-routines-hero">
              <div class="module-portal-copy">
                <span>ENTRENAMIENTO PERSONAL</span>
                <h1>Mis rutinas</h1>
                <p>Revisa tu planificación, ejercicios y objetivos sin salir de tu espacio Mallqui Gym.</p>
                <div class="module-portal-actions">
                  <button type="button" class="portal-action-primary" (click)="abrirModulo('casa')">
                    <i>⚡</i><span><b>Entrenar ahora</b><small>Sesión guiada en el gimnasio</small></span><em>→</em>
                  </button>
                  <button type="button" class="portal-action-secondary" (click)="actualizarSeccion('rutinas')">
                    <i>↻</i><b>Actualizar</b>
                  </button>
                </div>
              </div>
              <div class="module-portal-badge" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M5 8v8M3 10v4M19 8v8M21 10v4M7 12h10"/></svg>
              </div>
            </article>

            <aside class="module-portal-side">
              <div class="portal-side-head">
                <span>RESUMEN</span>
                <b>Tu entrenamiento</b>
              </div>
              <div class="portal-mini-stats">
                <article><i>🏋</i><div><strong>{{rutinas.length}}</strong><small>rutinas asignadas</small></div></article>
                <article><i>✓</i><div><strong>{{rutinaActual?.detalles?.length || 0}}</strong><small>ejercicios activos</small></div></article>
                <article><i>◎</i><div><strong>{{rutinaActual?.entrenador ? '1' : '0'}}</strong><small>entrenador asignado</small></div></article>
              </div>
              <button type="button" class="portal-side-link" (click)="abrirModulo('progreso')">
                <span>Ver mi progreso</span><b>→</b>
              </button>
            </aside>
          </section>

          <div class="focus-selected-notice" *ngIf="enfoqueInicioSeleccionado">
            <div>
              <small>OBJETIVO SELECCIONADO</small>
              <b>{{enfoqueInicioSeleccionado}}</b>
              <span>Revisa tus rutinas asignadas o inicia tu entrenamiento.</span>
            </div>
            <button type="button" (click)="abrirModulo('casa')">Entrenar ahora <span>→</span></button>
          </div>

          <div class="module-window-title">
            <div><span>RUTINAS ASIGNADAS</span><h2>Tu plan de entrenamiento</h2><p>Cada rutina aparece en una ventana independiente con sus ejercicios.</p></div>
          </div>

          <div class="module-grid routine-grid">
            <article class="member-module-card routine-card" *ngFor="let r of rutinas">
              <div class="routine-card-head"><div><span>RUTINA</span><h2>{{r.nombre_rutina}}</h2></div><i>🏋</i></div>
              <p>{{r.objetivo}}</p>
              <small class="routine-period">{{fecha(r.fecha_inicio)}} — {{r.fecha_fin ? fecha(r.fecha_fin) : 'Sin fecha final'}}</small>
              <div class="routine-exercises">
                <div *ngFor="let e of r.detalles"><span>✓</span><p><b>{{e.ejercicio}}</b><small>{{e.series}} series × {{e.repeticiones}} reps · {{e.peso_recomendado ? (e.peso_recomendado+' kg') : 'carga por definir'}} · descanso {{e.descanso_segundos || 0}} s</small></p></div>
              </div>
            </article>

            <article class="member-empty-card member-empty-guided empty-routines-panel" *ngIf="!rutinas.length">
              <span class="empty-state-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M5 8v8M3 10v4M19 8v8M21 10v4M7 12h10"/></svg>
              </span>
              <small class="empty-state-kicker">RUTINAS PERSONALIZADAS</small>
              <h3>Aún no tienes una rutina asignada</h3>
              <p>Mientras tu entrenador prepara tu rutina, puedes continuar con una sesión guiada dentro del gimnasio o volver a consultar si ya fue publicada.</p>
              <div class="empty-actions">
                <button type="button" class="empty-primary" (click)="abrirModulo('casa')">
                  <span>⚡</span><b>Entrenar en el gym</b>
                </button>
                <button type="button" class="empty-secondary" (click)="actualizarSeccion('rutinas')">
                  <span>↻</span><b>Actualizar rutinas</b>
                </button>
              </div>
            </article>
          </div>
        </section>

        <section *ngIf="moduloActivo==='clases'" class="member-module module-classes-v34 member-enter-up">
          <section class="module-portal-head module-portal-classes">
            <article class="module-portal-hero module-portal-classes-hero">
              <div class="module-portal-copy">
                <span>AGENDA DEL GIMNASIO</span>
                <h1>Clases</h1>
                <p>Explora horarios, reserva tu lugar y revisa tu agenda desde una misma pantalla.</p>
                <div class="module-portal-actions">
                  <button type="button" class="portal-action-primary" (click)="abrirModulo('reservas')">
                    <i>◷</i><span><b>Mis reservas</b><small>Ver clases programadas</small></span><em>→</em>
                  </button>
                  <button type="button" class="portal-action-secondary" (click)="abrirModulo('calendario')">
                    <i>▣</i><b>Calendario</b>
                  </button>
                </div>
              </div>
              <div class="module-portal-badge" aria-hidden="true">
                <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/><path d="M8 14h3M13 14h3M8 17h3"/></svg>
              </div>
            </article>

            <aside class="module-portal-side">
              <div class="portal-side-head">
                <span>HOY EN MALLQUI</span>
                <b>Tu agenda</b>
              </div>
              <div class="portal-mini-stats">
                <article class="portal-stat-action" role="button" tabindex="0"
                         (click)="irAClasesDisponibles()"
                         (keydown.enter)="irAClasesDisponibles()">
                  <i>▣</i><div><strong>{{clases.length}}</strong><small>clases disponibles</small></div>
                </article>
                <article class="portal-stat-action" role="button" tabindex="0"
                         (click)="abrirModulo('reservas')"
                         (keydown.enter)="abrirModulo('reservas')">
                  <i>◷</i><div><strong>{{reservasActivas.length}}</strong><small>reservas activas</small></div>
                </article>
                <article class="portal-stat-action" role="button" tabindex="0"
                         (click)="abrirModulo('asistencias')"
                         (keydown.enter)="abrirModulo('asistencias')">
                  <i>✓</i><div><strong>{{showcaseAsistencias}}</strong><small>asistencias del mes</small></div>
                </article>
              </div>
              <button type="button" class="portal-side-link" (click)="actualizarSeccion('clases')">
                <span>Actualizar horarios</span><b>↻</b>
              </button>
            </aside>
          </section>

          <div class="module-window-title" id="clases-disponibles">
            <div><span>CLASES DISPONIBLES</span><h2>Elige tu próxima clase</h2><p>Cada clase tiene su propia ventana con horario, entrenador y reserva.</p></div>
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

            <article class="member-empty-card member-empty-guided empty-classes-panel" *ngIf="!clases.length">
              <span class="empty-state-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/><path d="M8 14h3M13 14h3M8 17h3"/></svg>
              </span>
              <small class="empty-state-kicker">AGENDA DEL GIMNASIO</small>
              <h3>No hay clases disponibles por ahora</h3>
              <p>Puedes actualizar los horarios para comprobar nuevas clases o continuar con una sesión guiada dentro del gimnasio.</p>
              <div class="empty-actions">
                <button type="button" class="empty-primary" (click)="actualizarSeccion('clases')">
                  <span>↻</span><b>Actualizar clases</b>
                </button>
                <button type="button" class="empty-secondary" (click)="abrirModulo('casa')">
                  <span>⚡</span><b>Entrenar en el gym</b>
                </button>
              </div>
            </article>
          </div>
        </section>

        <section *ngIf="moduloActivo==='reservas'" class="member-module apex-reservations-page member-enter-up">
          <section class="apex-reservations-hero">
            <img class="apex-reservations-photo"
                 src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=2400&q=92"
                 alt="" aria-hidden="true">
            <div class="apex-reservations-shade" aria-hidden="true"></div>

            <div class="apex-reservations-side" aria-hidden="true">
              <span>MG</span><i></i><small>RESERVAS</small>
            </div>

            <div class="apex-reservations-copy">
              <span class="apex-reservations-kicker">AGENDA PERSONAL · MALLQUI GYM</span>
              <h1>ORGANIZA<br>TU <strong>RITMO.</strong></h1>
              <p>Consulta tus próximas clases, administra tus reservas y mantén tu entrenamiento bajo control.</p>
              <button type="button" class="apex-reservations-refresh" (click)="sincronizarDatosCliente()" [disabled]="actualizandoModulo">
                <span>{{actualizandoModulo ? 'Actualizando...' : 'Actualizar reservas'}}</span><em>↻</em>
              </button>
            </div>

            <div class="apex-reservations-phrase">
              <span>PLANIFICA CON PROPÓSITO</span>
              <b>Tu próxima sesión empieza con una buena organización.</b>
            </div>

            <div class="apex-reservations-metrics">
              <div><small>ACTIVAS</small><b>{{reservasActivas.length}}</b><span>reservadas</span></div>
              <div><small>ASISTIDAS</small><b>{{reservasAsistidas}}</b><span>completadas</span></div>
              <div><small>CANCELADAS</small><b>{{reservasCanceladas}}</b><span>historial</span></div>
            </div>

            <div class="apex-reservations-scroll" aria-hidden="true"><span>SCROLL</span><i>↓</i></div>
          </section>

          <section class="apex-reservations-content">
            <div class="apex-reservations-heading">
              <div><span>MIS CLASES</span><h2>Próximas reservas</h2></div>
              <button type="button" (click)="abrirModulo('clases')">Explorar clases <span>↗</span></button>
            </div>

            <div class="apex-reservation-list" *ngIf="reservas.length">
              <article *ngFor="let r of reservas">
                <div class="apex-reservation-number">◷</div>
                <div class="apex-reservation-main">
                  <small>CLASE</small>
                  <h3>{{r.clase?.nombre || 'Clase'}}</h3>
                  <p>{{fecha(r.fecha_clase)}} · {{r.clase?.hora_inicio}}</p>
                </div>
                <em [class.cancelled]="r.estado!=='Reservada'">{{r.estado}}</em>
                <button *ngIf="r.estado==='Reservada'" type="button" (click)="cancelarReserva(r)">Cancelar <span>→</span></button>
              </article>
            </div>

            <article class="apex-reservations-empty" *ngIf="!reservas.length">
              <span>AGENDA VACÍA</span>
              <h3>Tu próxima clase todavía no está reservada.</h3>
              <p>Explora las clases disponibles y elige el horario que mejor encaje con tu entrenamiento.</p>
              <div>
                <button type="button" class="primary" (click)="abrirModulo('clases')">Ver clases <span>→</span></button>
                <button type="button" class="secondary" (click)="abrirModulo('casa')">Entrenar ahora <span>↗</span></button>
              </div>
            </article>
          </section>
        </section>

        <section *ngIf="moduloActivo==='asistencias'" class="member-module member-enter-up">
          <div class="member-module-hero hero-photo hero-photo-asistencias">
            <div><span>HISTORIAL</span><h1>Mis asistencias</h1><p>Consulta tus entradas y salidas registradas en el gimnasio.</p></div>
            <button type="button" class="module-refresh-btn" (click)="sincronizarDatosCliente()" [disabled]="actualizandoModulo">
              {{actualizandoModulo ? 'Actualizando...' : '↻ Actualizar'}}
            </button>
            <div class="module-hero-icon">✓</div>
          </div>

          <section class="attendance-access-panel">
            <div class="attendance-access-copy">
              <span>CONTROL DE ACCESO · MALLQUI GYM</span>
              <h2>{{asistenciaAbierta ? 'Actualmente estás dentro del gimnasio' : 'Registra tu ingreso en recepción'}}</h2>
              <p *ngIf="!asistenciaAbierta">
                Muestra tu credencial digital en recepción. Al escanear tu código, el sistema registra automáticamente tu entrada.
              </p>
              <p *ngIf="asistenciaAbierta">
                Tu ingreso está abierto desde {{fecha(asistenciaAbierta.fecha_hora_entrada)}}. Cuando salgas, vuelve a mostrar la misma credencial para registrar la salida.
              </p>

              <div class="attendance-access-actions">
                <button type="button" class="attendance-access-primary" (click)="abrirModulo('club')">
                  <span>▥</span>
                  <div>
                    <b>{{asistenciaAbierta ? 'Mostrar credencial para salir' : 'Mostrar credencial para ingresar'}}</b>
                    <small>El código se valida en recepción</small>
                  </div>
                  <em>→</em>
                </button>

                <button type="button" class="attendance-access-secondary"
                        (click)="sincronizarDatosCliente()"
                        [disabled]="actualizandoModulo">
                  {{actualizandoModulo ? 'Actualizando...' : '↻ Ya escanearon mi código'}}
                </button>

                <button *ngIf="asistenciaAbierta"
                        type="button"
                        class="attendance-access-secondary"
                        (click)="abrirModulo('casa')">
                  Entrenar ahora
                </button>
              </div>
            </div>

            <div class="attendance-access-status" [class.inside]="!!asistenciaAbierta" [class.blocked]="!membresiaActual">
              <small>ESTADO DE ACCESO</small>
              <strong>{{!membresiaActual ? 'SIN MEMBRESÍA' : (asistenciaAbierta ? 'DENTRO' : 'LISTO PARA INGRESAR')}}</strong>
              <span>{{!membresiaActual ? 'Activa una membresía para registrar ingreso.' : (asistenciaAbierta ? 'Entrada registrada correctamente.' : 'Credencial habilitada para recepción.')}}</span>
              <div>
                <b>{{nombreMembresiaVisible(membresiaActual)}}</b>
                <small *ngIf="membresiaActual">{{diasRestantesMembresia}} días restantes</small>
              </div>
            </div>
          </section>

          <section class="attendance-how-it-works">
            <div class="attendance-how-title">
              <span>CÓMO FUNCIONA</span>
              <h2>Entrada y salida en 4 pasos</h2>
            </div>
            <div class="attendance-how-grid">
              <article><span>1</span><div><b>Abre tu credencial</b><p>Desde esta pantalla puedes mostrar tu código de socio.</p></div></article>
              <article><span>2</span><div><b>Escanea en recepción</b><p>El personal valida tu membresía y registra la entrada.</p></div></article>
              <article><span>3</span><div><b>Entrena en el gimnasio</b><p>Tu estado cambia a “Dentro” mientras permanezca abierto el ingreso.</p></div></article>
              <article><span>4</span><div><b>Registra la salida</b><p>Al volver a escanear la credencial, el sistema cierra la visita.</p></div></article>
            </div>
          </section>

          <section class="client-rf-summary">
            <article><small>ESTE MES</small><b>{{asistenciasMesActual}}</b><span>Visitas registradas</span></article>
            <article><small>TOTAL</small><b>{{asistencias.length}}</b><span>Historial completo</span></article>
            <article><small>ESTADO ACTUAL</small><b>{{asistenciaAbierta ? 'Dentro' : 'Fuera'}}</b><span>{{asistenciaAbierta ? 'Ingreso abierto' : 'Sin ingreso abierto'}}</span></article>
            <article><small>ÚLTIMA VISITA</small><b>{{ultimaAsistencia ? fechaCortaPortal(ultimaAsistencia.fecha_hora_entrada) : '-'}}</b><span>{{ultimaAsistencia ? duracionAsistencia(ultimaAsistencia) : 'Sin visitas registradas'}}</span></article>
          </section>

          <div class="attendance-timeline">
            <article *ngFor="let a of asistencias">
              <span class="timeline-dot"></span>
              <div>
                <small>ENTRADA</small>
                <h3>{{fecha(a.fecha_hora_entrada)}}</h3>
                <p>{{a.fecha_hora_salida ? ('Salida: '+fecha(a.fecha_hora_salida)) : 'Salida pendiente · actualmente dentro del gimnasio'}}</p>
                <p class="attendance-duration">Duración: {{duracionAsistencia(a)}}</p>
              </div>
              <em>{{a.estado || (a.fecha_hora_salida ? 'Completada' : 'En curso')}}</em>
            </article>

            <article class="member-empty-card member-empty-guided" *ngIf="!asistencias.length">
              <span>✓</span><h3>Tu historial empieza desde cero</h3>
              <p>Tu primera visita aparecerá aquí después de que el personal escanee tu credencial en recepción.</p>
              <div class="empty-actions">
                <button type="button" class="empty-primary" (click)="abrirModulo('club')">Mostrar mi credencial</button>
                <button type="button" class="empty-secondary" (click)="sincronizarDatosCliente()">Actualizar historial</button>
              </div>
            </article>
          </div>
        </section>

        <section *ngIf="moduloActivo==='pagos'" class="member-module membership-real-module member-enter-up">
          <div class="member-module-hero hero-photo hero-photo-pagos">
            <div>
              <span>MEMBRESÍA</span>
              <h1>Mensualidades y promociones</h1>
              <p>Elige 1, 2 o 3 meses, registra la operación y el sistema activa o programa la membresía automáticamente.</p>
            </div>
            <button type="button" class="module-refresh-btn" (click)="sincronizarDatosCliente()" [disabled]="actualizandoModulo">
              {{actualizandoModulo ? 'Actualizando...' : '↻ Actualizar'}}
            </button>
            <div class="module-hero-icon">▤</div>
          </div>

          <section class="membership-current-status">
            <article class="membership-current-card" [class.inactive]="!membresiaActual">
              <div class="membership-current-icon">{{membresiaActual ? '✓' : '!'}}</div>
              <div class="membership-current-copy">
                <small>MEMBRESÍA ACTUAL</small>
                <h2>{{nombreMembresiaVisible(membresiaActual)}}</h2>
                <p *ngIf="membresiaActual">
                  Vigente del {{fechaCortaPortal(membresiaActual.fecha_inicio)}} al {{fechaCortaPortal(membresiaActual.fecha_fin)}}
                </p>
                <p *ngIf="!membresiaActual">Selecciona una mensualidad o promoción para activar tu acceso.</p>
              </div>
              <div class="membership-current-state">
                <span [class.active]="!!membresiaActual"><i></i>{{membresiaActual ? (membresiaActual.estado || 'Activo') : 'Sin membresía'}}</span>
                <b *ngIf="membresiaActual?.membresia?.precio">S/ {{membresiaActual.membresia.precio | number:'1.2-2'}}</b>
              </div>
            </article>

            <article class="membership-current-card membership-next-card" *ngIf="membresiaProxima">
              <div class="membership-current-icon">→</div>
              <div class="membership-current-copy">
                <small>PRÓXIMA MEMBRESÍA YA COMPRADA</small>
                <h2>{{nombreMembresiaVisible(membresiaProxima)}}</h2>
                <p>Programada del {{fechaCortaPortal(membresiaProxima.fecha_inicio)}} al {{fechaCortaPortal(membresiaProxima.fecha_fin)}}.</p>
              </div>
              <div class="membership-current-state">
                <span class="active"><i></i>Programada</span>
                <b *ngIf="membresiaProxima?.membresia?.precio">S/ {{membresiaProxima.membresia.precio | number:'1.2-2'}}</b>
              </div>
            </article>
          </section>

          <section class="membership-plan-section">
            <div class="membership-section-head">
              <div>
                <span>MENSUALIDADES Y PROMOCIONES</span>
                <h2>Elige cuántos meses entrenar</h2>
                <p>Tarifas reales del gimnasio: 1 mes, 2 meses o 3 meses.</p>
              </div>
              <span class="membership-data-live"><i></i> Datos del sistema</span>
            </div>

            <div class="membership-real-plans" *ngIf="planesRenovacion.length; else sinPlanesGym">
              <button type="button"
                      class="membership-real-plan"
                      *ngFor="let m of planesRenovacion"
                      [class.selected]="pagoForm.id_membresia===m.id_membresia"
                      [class.featured]="m.duracion_meses==2"
                      (click)="seleccionarPlanRenovacion(m)">
                <span class="membership-plan-selected" *ngIf="pagoForm.id_membresia===m.id_membresia">✓ SELECCIONADO</span>
                <span class="membership-plan-recommended" *ngIf="m.duracion_meses==2 && pagoForm.id_membresia!==m.id_membresia">PROMOCIÓN</span>

                <div class="membership-plan-name">
                  <small>{{subtituloPlanGym(m)}}</small>
                  <h3>{{m.nombre}}</h3>
                </div>

                <div class="membership-plan-price">
                  <small>S/</small>
                  <strong>{{m.precio | number:'1.0-0'}}</strong>
                  <span>/ {{m.duracion_meses || 1}} mes{{(m.duracion_meses || 1)>1 ? 'es' : ''}}</span>
                </div>

                <p class="membership-plan-description">{{m.descripcion || 'Membresía Mallqui Gym'}}</p>

                <ul>
                  <li *ngFor="let beneficio of beneficiosPlanGym(m)"><span>✓</span>{{beneficio}}</li>
                </ul>

                <div class="membership-plan-footer">
                  <span>{{pagoForm.id_membresia===m.id_membresia ? 'Opción elegida' : 'Elegir'}}</span>
                  <b>→</b>
                </div>
              </button>
            </div>

            <ng-template #sinPlanesGym>
              <div class="member-empty-state">
                <span>!</span>
                <h3>No se pudieron cargar las mensualidades</h3>
                <p>Verifica que Laravel y la base de datos estén conectados.</p>
              </div>
            </ng-template>
          </section>

          <section class="membership-checkout-layout">
            <article class="member-module-card membership-checkout-card">
              <div class="card-title-block">
                <span>COMPRA DE MEMBRESÍA</span>
                <h2>{{membresiaActual ? 'Renovar mensualidad' : 'Comprar mensualidad'}}</h2>
                <p>Completa los datos de la operación. El pago corresponde al tiempo elegido y se registra automáticamente.</p>
              </div>

              <div class="membership-selected-summary" *ngIf="planPagoSeleccionado; else seleccionaPlanPago">
                <div class="membership-selected-main">
                  <span>{{iconoPlanGym(planPagoSeleccionado)}}</span>
                  <div>
                    <small>MENSUALIDAD SELECCIONADA</small>
                    <h3>{{planPagoSeleccionado.nombre}}</h3>
                    <p>{{planPagoSeleccionado.descripcion}}</p>
                  </div>
                </div>

                <div class="membership-selected-numbers">
                  <article>
                    <small>PRECIO</small>
                    <b>S/ {{planPagoSeleccionado.precio | number:'1.2-2'}}</b>
                  </article>
                  <article>
                    <small>DURACIÓN</small>
                    <b>{{planPagoSeleccionado.duracion_meses || 1}} mes{{(planPagoSeleccionado.duracion_meses || 1)>1 ? 'es' : ''}}</b>
                  </article>
                  <article>
                    <small>INICIO ESTIMADO</small>
                    <b>{{fechaCortaPortal(fechaInicioRenovacion)}}</b>
                  </article>
                </div>
              </div>

              <ng-template #seleccionaPlanPago>
                <div class="membership-select-first">
                  <span>↑</span>
                  <div><b>Primero elige una mensualidad</b><p>Selecciona 1 mes, 2 meses o 3 meses para continuar con el pago.</p></div>
                </div>
              </ng-template>

              <form class="member-form membership-payment-form" (ngSubmit)="comprarMembresia()">
                <label>Fecha solicitada de inicio
                  <input type="date"
                         [(ngModel)]="pagoForm.fecha_inicio"
                         name="fechaPago"
                         [min]="fechaMinimaPago">
                  <small *ngIf="membresiaActual">Si tu membresía sigue vigente, Laravel programará la nueva desde el día siguiente a su vencimiento.</small>
                </label>

                <label>Método de pago
                  <select [(ngModel)]="pagoForm.metodo_pago" name="metodoPago">
                    <option>Yape</option>
                    <option>Plin</option>
                    <option>Transferencia</option>
                    <option>Tarjeta</option>
                  </select>
                </label>

                <div class="membership-payment-instruction" *ngIf="planPagoSeleccionado">
                  <span>▤</span>
                  <div>
                    <small>MONTO A REGISTRAR</small>
                    <b>S/ {{planPagoSeleccionado.precio | number:'1.2-2'}}</b>
                    <p>{{instruccionMetodoPago}}</p>
                  </div>
                </div>

                <label>N° de operación
                  <input [(ngModel)]="pagoForm.numero_operacion"
                         name="operacionPago"
                         placeholder="Ejemplo: 548721963"
                         required>
                  <small>Debe coincidir con la operación realizada por el monto de la mensualidad o promoción.</small>
                </label>

                <div class="membership-payment-review" *ngIf="planPagoSeleccionado">
                  <p><span>Membresía</span><b>{{planPagoSeleccionado.nombre}}</b></p>
                  <p><span>Duración</span><b>{{planPagoSeleccionado.duracion_meses || 1}} mes{{(planPagoSeleccionado.duracion_meses || 1)>1 ? 'es' : ''}}</b></p>
                  <p><span>Método</span><b>{{pagoForm.metodo_pago}}</b></p>
                  <p class="total"><span>Total</span><b>S/ {{planPagoSeleccionado.precio | number:'1.2-2'}}</b></p>
                </div>

                <button class="member-form-submit"
                        type="submit"
                        [disabled]="procesandoCompra || !planPagoSeleccionado || !pagoForm.numero_operacion.trim()">
                  {{procesandoCompra ? 'Procesando compra...' : (membresiaActual ? 'Renovar y generar boleta' : 'Comprar y generar boleta')}}
                  <span>→</span>
                </button>

                <div class="membership-validation-note">
                  <span>✓</span>
                  <div>
                    Al confirmar, el sistema registra el pago como <b>Completado</b>,
                    activa o programa la membresía y genera la boleta automáticamente.
                    <strong>No necesita aprobación del dashboard.</strong>
                  </div>
                </div>

                <div class="membership-payment-review receipt-preview" *ngIf="ultimaBoleta">
                  <p><span>BOLETA GENERADA</span><b>{{ultimaBoleta.numero_comprobante || ('B001-'+ultimaBoleta.id_pago)}}</b></p>
                  <p><span>Membresía</span><b>{{ultimaBoleta.membresia}}</b></p>
                  <p><span>Periodo</span><b>{{ultimaBoleta.periodo?.inicio || ultimaBoleta.periodo?.fecha_inicio}} - {{ultimaBoleta.periodo?.fin || ultimaBoleta.periodo?.fecha_fin}}</b></p>
                  <p><span>Método</span><b>{{ultimaBoleta.metodo_pago}} · Op. {{ultimaBoleta.numero_operacion || '-'}}</b></p>
                  <p class="total"><span>Total pagado</span><b>S/ {{ultimaBoleta.monto | number:'1.2-2'}}</b></p>
                  <div class="receipt-barcode" *ngIf="ultimaBoletaBarcode">
                    <img [src]="ultimaBoletaBarcode" alt="Código de barras de la boleta">
                  </div>
                  <small class="receipt-tax-note">{{ultimaBoleta.nota_tributaria}}</small>
                  <div class="receipt-actions">
                    <button type="button" class="member-form-submit" (click)="imprimirBoleta(ultimaBoleta)">Imprimir / guardar PDF</button>
                    <button type="button" class="member-form-submit receipt-access-button" (click)="abrirModulo('club')">Ver credencial de acceso</button>
                  </div>
                </div>
              </form>
            </article>

            <article class="member-module-card membership-payment-history-card">
              <div class="card-title-block">
                <span>HISTORIAL REAL</span>
                <h2>Mis pagos</h2>
                <p>Movimientos guardados en tu cuenta.</p>
              </div>

              <div class="member-payment-list full-list">
                <div *ngFor="let p of pagos" class="member-payment-item">
                  <span class="payment-icon">▤</span>
                  <p>
                    <b>{{nombreMembresiaVisible(p.cliente_membresia)}}</b>
                    <small>{{fecha(p.fecha_pago)}} · {{p.metodo_pago}}</small>
                    <small *ngIf="p.numero_operacion">Op. {{p.numero_operacion}}</small>
                  </p>
                  <strong>S/ {{p.monto | number:'1.2-2'}}</strong>
                  <em [class.pending]="p.estado_pago==='Pendiente'">{{p.estado_pago}}</em>
                  <button *ngIf="p.estado_pago==='Completado'" type="button" (click)="comprobante(p)">Ver boleta</button>
                  <button *ngIf="p.estado_pago==='Pendiente'"
                          type="button"
                          class="payment-cancel"
                          (click)="usarPagoPendiente(p)">
                    Completar compra
                  </button>
                </div>

                <div class="member-empty-state compact-empty" *ngIf="!pagos.length">
                  <span>▤</span>
                  <h3>Sin pagos registrados</h3>
                  <p>Cuando compres o renueves una membresía, el pago completado aparecerá aquí con su boleta.</p>
                </div>
              </div>
            </article>
          </section>
        </section>

        <section *ngIf="moduloActivo==='perfil'" class="member-module member-enter-up">
          <div class="member-module-hero hero-photo hero-photo-perfil">
            <div><span>CUENTA PERSONAL</span><h1>Mi perfil</h1><p>Mantén actualizada tu información de contacto y seguridad.</p></div>
            <button type="button" class="module-refresh-btn" (click)="sincronizarDatosCliente()" [disabled]="actualizandoModulo">
              {{actualizandoModulo ? 'Actualizando...' : '↻ Actualizar'}}
            </button>
            <div class="module-hero-icon">♙</div>
          </div>

          <section class="profile-layout">
            <aside class="profile-summary-card">
              <div class="profile-avatar">{{nombreCorto.charAt(0).toUpperCase()}}</div>
              <h2>{{nombreCorto}}</h2>
              <p>{{perfil?.correo || 'Cliente Mallqui Gym'}}</p>
              <span>{{perfil?.estado || 'Activo'}}</span>
              <ul>
                <li>✓ Acceso al portal del cliente</li>
                <li>✓ Datos sincronizados con Laravel/MySQL</li>
                <li>✓ Cuenta protegida con sesión autenticada</li>
              </ul>
            </aside>

            <article class="member-module-card profile-edit-card">
              <div class="card-title-block"><span>DATOS PERSONALES</span><h2>Actualizar información</h2><p>Modifica tus datos y guarda los cambios.</p></div>
              <form class="member-form profile-form-grid" (ngSubmit)="guardarPerfil()">
                <label>DNI<input [value]="perfil.dni || ''" name="dni" disabled></label>
                <label>Estado<input [value]="perfil.estado || 'Activo'" name="estadoCliente" disabled></label>
                <label>Nombres<input [(ngModel)]="perfil.nombres" name="nombres" required></label>
                <label>Apellidos<input [(ngModel)]="perfil.apellidos" name="apellidos" required></label>
                <label>Correo<input type="email" [(ngModel)]="perfil.correo" name="correo" required></label>
                <label>Teléfono<input [(ngModel)]="perfil.telefono" name="telefono"></label>
                <label>Fecha de nacimiento<input type="date" [(ngModel)]="perfil.fecha_nacimiento" name="fechaNacimiento"></label>
                <label>Sexo
                  <select [(ngModel)]="perfil.sexo" name="sexo">
                    <option value="">No especificado</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </label>
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
          *ngIf="moduloActivo==='progreso' || moduloActivo==='calendario' || moduloActivo==='club' || moduloActivo==='avisos' || moduloActivo==='soporte'"
          [modulo]="moduloActivo"
          [gymInfo]="gymInfo"
          (notificacionesCambio)="avisosNoLeidos=$event">
        </app-cliente-experiencia>
      </main>

      <nav class="member-mobile-bottom-nav" aria-label="Navegación móvil">
        <button type="button" [class.active]="moduloActivo==='inicio'" (click)="abrirModulo('inicio')"><i>⌂</i><span>Inicio</span></button>
        <button type="button" [class.active]="moduloActivo==='casa'" (click)="abrirModulo('casa')"><i>⚡</i><span>Entrenar</span></button>
        <button type="button" [class.active]="moduloActivo==='clases'" (click)="abrirModulo('clases')"><i>▣</i><span>Clases</span></button>
        <button type="button" [class.active]="moduloActivo==='progreso'" (click)="abrirModulo('progreso')"><i>◎</i><span>Progreso</span></button>
        <button type="button" [class.active]="mobileMenuAbierto" (click)="mobileMenuAbierto=!mobileMenuAbierto"><i>•••</i><span>Más</span></button>
      </nav>

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
    .member-page .focus-action-card{cursor:pointer;transition:background .18s ease,transform .18s ease}
    .member-page .focus-action-card:hover{background:#15191d!important;transform:translateY(-2px)}
    .member-page .focus-action-card:focus-visible{outline:2px solid #ff3150;outline-offset:-2px}
    .member-page .focus-card-action{display:inline-flex;align-items:center;gap:8px;margin-top:18px;color:#ff3150;font-size:8px;font-weight:950;letter-spacing:.9px;text-transform:uppercase}
    .member-page .focus-card-action b{font-size:13px}
    .member-page .focus-selected-notice{display:flex;align-items:center;justify-content:space-between;gap:18px;margin:18px max(28px,2.2vw) 0;padding:16px 18px;border:1px solid rgba(255,49,80,.25);background:#101418;color:#fff}
    .member-page .focus-selected-notice div{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
    .member-page .focus-selected-notice small{color:#ff3150;font-size:7px;font-weight:950;letter-spacing:1.2px}
    .member-page .focus-selected-notice b{font-size:13px}
    .member-page .focus-selected-notice span{color:#8f989f;font-size:9px}
    .member-page .focus-selected-notice button{min-height:40px;padding:0 14px;border:1px solid #ff3150;background:#ff3150;color:#fff;font-size:8px;font-weight:950;cursor:pointer}
    .member-page .module-classes-v34 .portal-stat-action{cursor:pointer;transition:background .18s ease,border-color .18s ease}
    .member-page .module-classes-v34 .portal-stat-action:hover{background:rgba(255,49,80,.06)!important;border-color:rgba(255,49,80,.28)!important}
    .member-page .module-classes-v34 .portal-stat-action:focus-visible{outline:2px solid #ff3150;outline-offset:2px}
    .member-page .training-profile-guide{margin:18px max(28px,2.2vw);padding:28px;border:1px solid rgba(255,255,255,.10);background:#0d1013;color:#fff}
    .member-page .training-profile-guide-head{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,.09)}
    .member-page .training-profile-guide-head small,.member-page .training-exercise-preview-title small{display:block;color:#ff3150;font-size:8px;font-weight:950;letter-spacing:1.5px}
    .member-page .training-profile-guide-head h2{margin:7px 0 5px;color:#fff;font-size:29px;letter-spacing:-.7px}
    .member-page .training-profile-guide-head p{max-width:720px;margin:0;color:#8f989f;font-size:10.5px;line-height:1.55}
    .member-page .training-profile-guide-head>span{padding:9px 12px;border:1px solid rgba(255,49,80,.32);background:rgba(255,49,80,.08);color:#ff6b80;font-size:9px;font-weight:950;text-transform:uppercase}
    .member-page .training-level-selector{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:18px 0}
    .member-page .training-level-selector>span{margin-right:5px;color:#7f8a91;font-size:8px;font-weight:950;letter-spacing:1.4px}
    .member-page .training-level-selector button{min-height:36px;padding:0 12px;border:1px solid #30363b;background:#14191e;color:#adb5ba;font-size:8px;font-weight:900;cursor:pointer}
    .member-page .training-level-selector button.active{border-color:#ff3150;background:#ff3150;color:#fff}
    .member-page .training-profile-cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid rgba(255,255,255,.09);border-left:1px solid rgba(255,255,255,.09)}
    .member-page .training-profile-cards article{min-height:135px;padding:18px;border-right:1px solid rgba(255,255,255,.09);border-bottom:1px solid rgba(255,255,255,.09);background:#101418}
    .member-page .training-profile-cards small{display:block;color:#ff5d74;font-size:7px;font-weight:950;letter-spacing:1.1px}
    .member-page .training-profile-cards b{display:block;margin:9px 0 6px;color:#fff;font-size:15px;line-height:1.15}
    .member-page .training-profile-cards p{margin:0;color:#828d94;font-size:9px;line-height:1.45}
    .member-page .training-exercise-preview{margin-top:18px;border:1px solid rgba(255,255,255,.09);background:#101418}
    .member-page .training-exercise-preview-title{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px;border-bottom:1px solid rgba(255,255,255,.09)}
    .member-page .training-exercise-preview-title h3{margin:5px 0 0;color:#fff;font-size:18px}
    .member-page .training-exercise-preview-title>b{color:#ff5d74;font-size:9px}
    .member-page .training-exercise-preview-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
    .member-page .training-exercise-preview-list>div{display:grid;grid-template-columns:36px 1fr;gap:10px;align-items:center;min-height:70px;padding:12px 16px;border-right:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08)}
    .member-page .training-exercise-preview-list>div>span{width:32px;height:32px;display:grid;place-items:center;border:1px solid rgba(255,49,80,.28);background:rgba(255,49,80,.07);color:#ff3150;font-size:9px;font-weight:950}
    .member-page .training-exercise-preview-list b{display:block;color:#fff;font-size:10.5px}
    .member-page .training-exercise-preview-list small{display:block;margin-top:3px;color:#7f898f;font-size:8px}
    .member-page .training-profile-actions{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;margin-top:18px}
    .member-page .training-profile-primary{min-height:56px;padding:0 16px;border:1px solid #ff3150;background:#ff3150;color:#fff;display:grid;grid-template-columns:32px 1fr auto;gap:12px;align-items:center;text-align:left;cursor:pointer}
    .member-page .training-profile-primary b{display:block;font-size:10px}.member-page .training-profile-primary small{display:block;margin-top:3px;color:#ffd7dd;font-size:8px}
    .member-page .training-profile-primary em{font-style:normal;font-size:18px}
    .member-page .training-profile-secondary{min-height:56px;padding:0 18px;border:1px solid #30363b;background:#14191e;color:#fff;font-size:8px;font-weight:950;cursor:pointer}
    .member-page .training-profile-note{margin:14px 0 0;color:#7f898f;font-size:8.5px;line-height:1.5}
    .member-page .mallqui-wellbeing-section{padding:54px max(48px,4vw) 58px;border-top:1px solid rgba(255,255,255,.08);background:#0a0d0f;color:#fff}
    .member-page .mallqui-wellbeing-head{display:flex;align-items:flex-end;justify-content:space-between;gap:28px;margin-bottom:28px}
    .member-page .mallqui-wellbeing-head>div>span{display:block;margin-bottom:8px;color:#ff3150;font-size:8px;font-weight:950;letter-spacing:1.8px}
    .member-page .mallqui-wellbeing-head h2{margin:0;color:#fff;font-size:38px;line-height:1;letter-spacing:-1.3px}
    .member-page .mallqui-wellbeing-head p{max-width:650px;margin:9px 0 0;color:#89939a;font-size:10.5px;line-height:1.55}
    .member-page .mallqui-wellbeing-head>b{padding:9px 12px;border:1px solid rgba(255,49,80,.28);background:rgba(255,49,80,.06);color:#ff647b;font-size:8px;letter-spacing:1px;white-space:nowrap}
    .member-page .mallqui-wellbeing-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));border-top:1px solid rgba(255,255,255,.09);border-left:1px solid rgba(255,255,255,.09)}
    .member-page .mallqui-wellbeing-grid article{position:relative;min-height:310px;padding:24px 20px;border-right:1px solid rgba(255,255,255,.09);border-bottom:1px solid rgba(255,255,255,.09);background:#0f1316}
    .member-page .mallqui-wellbeing-grid .wellbeing-index{position:absolute;top:16px;right:16px;color:#566168;font-size:8px;font-weight:950}
    .member-page .mallqui-wellbeing-grid .wellbeing-icon{width:44px;height:44px;display:grid;place-items:center;margin-bottom:28px;border:1px solid rgba(255,49,80,.30);background:rgba(255,49,80,.07);color:#ff3150;font-size:15px;font-weight:950}
    .member-page .mallqui-wellbeing-grid article>small{display:block;color:#ff5e75;font-size:7px;font-weight:950;letter-spacing:1.2px}
    .member-page .mallqui-wellbeing-grid h3{margin:8px 0 9px;color:#fff;font-size:19px;line-height:1.05}
    .member-page .mallqui-wellbeing-grid p{margin:0;color:#8b959c;font-size:9px;line-height:1.55}
    .member-page .mallqui-wellbeing-grid button{position:absolute;left:20px;right:20px;bottom:20px;min-height:38px;padding:0 10px;border:1px solid rgba(255,49,80,.28);background:transparent;color:#ff6077;font-size:7.5px;font-weight:950;text-align:left;cursor:pointer}
    .member-page .mallqui-wellbeing-grid button:hover{background:rgba(255,49,80,.08)}
    .member-page .mallqui-wellbeing-grid button span{float:right;font-size:13px}
    .member-page .mallqui-wellbeing-note{margin-top:18px;padding:18px 20px;border-left:3px solid #ff3150;background:#101418}
    .member-page .mallqui-wellbeing-note>span{display:block;margin-bottom:6px;color:#ff3150;font-size:7px;font-weight:950;letter-spacing:1.4px}
    .member-page .mallqui-wellbeing-note p{margin:0;color:#9aa3a9;font-size:9.5px;line-height:1.55}
    .member-page .mallqui-wellbeing-note b{color:#fff}
    .member-page .attendance-access-panel{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(280px,.6fr);gap:16px;margin:20px max(28px,2.2vw);padding:24px;border:1px solid rgba(255,255,255,.09);background:#0d1013;color:#fff}
    .member-page .attendance-access-copy>span,.member-page .attendance-how-title>span{display:block;color:#ff3150;font-size:8px;font-weight:950;letter-spacing:1.4px}
    .member-page .attendance-access-copy h2{margin:8px 0 6px;color:#fff;font-size:27px;letter-spacing:-.6px}
    .member-page .attendance-access-copy>p{max-width:760px;margin:0;color:#8e989f;font-size:10.5px;line-height:1.55}
    .member-page .attendance-access-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:18px}
    .member-page .attendance-access-primary{min-height:54px;min-width:290px;padding:0 14px;border:1px solid #ff3150;background:#ff3150;color:#fff;display:grid;grid-template-columns:30px 1fr auto;gap:10px;align-items:center;text-align:left;cursor:pointer}
    .member-page .attendance-access-primary b{display:block;font-size:9px}.member-page .attendance-access-primary small{display:block;margin-top:2px;color:#ffd6dc;font-size:7.5px}.member-page .attendance-access-primary em{font-style:normal;font-size:16px}
    .member-page .attendance-access-secondary{min-height:54px;padding:0 14px;border:1px solid #30363b;background:#14191e;color:#fff;font-size:8px;font-weight:900;cursor:pointer}
    .member-page .attendance-access-status{padding:20px;border:1px solid #30363b;background:#11161a}
    .member-page .attendance-access-status>small{display:block;color:#7f8a91;font-size:7px;font-weight:950;letter-spacing:1.2px}
    .member-page .attendance-access-status>strong{display:block;margin:8px 0 4px;color:#fff;font-size:24px;letter-spacing:-.6px}
    .member-page .attendance-access-status>span{display:block;color:#8f989f;font-size:9px;line-height:1.45}
    .member-page .attendance-access-status>div{margin-top:18px;padding-top:14px;border-top:1px solid rgba(255,255,255,.08)}
    .member-page .attendance-access-status>div b{display:block;color:#fff;font-size:10px}.member-page .attendance-access-status>div small{display:block;margin-top:3px;color:#7f8a91;font-size:8px}
    .member-page .attendance-access-status.inside{border-color:rgba(64,199,122,.35);background:rgba(64,199,122,.05)}.member-page .attendance-access-status.inside>strong{color:#73d99f}
    .member-page .attendance-access-status.blocked{border-color:rgba(255,49,80,.28)}.member-page .attendance-access-status.blocked>strong{color:#ff6077}
    .member-page .attendance-how-it-works{margin:0 max(28px,2.2vw) 18px;padding:22px;border:1px solid rgba(255,255,255,.09);background:#101418;color:#fff}
    .member-page .attendance-how-title h2{margin:6px 0 18px;color:#fff;font-size:20px}
    .member-page .attendance-how-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid rgba(255,255,255,.08);border-left:1px solid rgba(255,255,255,.08)}
    .member-page .attendance-how-grid article{display:grid;grid-template-columns:34px 1fr;gap:10px;min-height:105px;padding:15px;border-right:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08)}
    .member-page .attendance-how-grid article>span{width:30px;height:30px;display:grid;place-items:center;border:1px solid rgba(255,49,80,.30);background:rgba(255,49,80,.07);color:#ff3150;font-size:8px;font-weight:950}
    .member-page .attendance-how-grid b{display:block;color:#fff;font-size:9.5px}.member-page .attendance-how-grid p{margin:4px 0 0;color:#7f8a91;font-size:8px;line-height:1.45}
    .member-page .attendance-timeline .attendance-duration{margin-top:4px!important;color:#ff6077!important;font-weight:800}
    .member-page .client-rf-summary{
      grid-template-columns:repeat(4,minmax(0,1fr))!important;
      gap:0!important;
      margin:0 max(28px,2.2vw) 18px!important;
      border-top:1px solid rgba(255,255,255,.09)!important;
      border-left:1px solid rgba(255,255,255,.09)!important;
      background:#0d1013!important;
    }
    .member-page .client-rf-summary article{
      min-height:112px!important;
      padding:20px!important;
      border:0!important;
      border-right:1px solid rgba(255,255,255,.09)!important;
      border-bottom:1px solid rgba(255,255,255,.09)!important;
      border-radius:0!important;
      background:#101418!important;
      box-shadow:none!important;
      color:#fff!important;
    }
    .member-page .client-rf-summary article:hover{
      background:#141a1f!important;
      transform:none!important;
    }
    .member-page .client-rf-summary article small{
      display:block!important;
      color:#ff5e75!important;
      font-size:7.5px!important;
      font-weight:950!important;
      letter-spacing:1.2px!important;
    }
    .member-page .client-rf-summary article b{
      display:block!important;
      margin:9px 0 4px!important;
      color:#fff!important;
      font-size:26px!important;
      line-height:1!important;
      letter-spacing:-.6px!important;
    }
    .member-page .client-rf-summary article span{
      color:#7f8a91!important;
      font-size:8.5px!important;
    }
    .member-page .attendance-timeline{
      margin:0 max(28px,2.2vw) 24px!important;
    }
    .member-page .attendance-timeline .member-empty-card.member-empty-guided{
      min-height:240px!important;
      display:flex!important;
      flex-direction:column!important;
      align-items:center!important;
      justify-content:center!important;
      padding:30px 20px!important;
      border:1px solid rgba(255,255,255,.09)!important;
      border-radius:0!important;
      background:
        linear-gradient(145deg,rgba(255,49,80,.045),transparent 55%),
        #0f1316!important;
      color:#fff!important;
      box-shadow:none!important;
      text-align:center!important;
    }
    .member-page .attendance-timeline .member-empty-card.member-empty-guided>span{
      width:48px!important;
      height:48px!important;
      display:grid!important;
      place-items:center!important;
      margin-bottom:14px!important;
      border:1px solid rgba(255,49,80,.32)!important;
      border-radius:0!important;
      background:rgba(255,49,80,.07)!important;
      color:#ff3150!important;
      font-size:17px!important;
    }
    .member-page .attendance-timeline .member-empty-card.member-empty-guided h3{
      margin:0 0 6px!important;
      color:#fff!important;
      font-size:18px!important;
    }
    .member-page .attendance-timeline .member-empty-card.member-empty-guided p{
      max-width:620px!important;
      margin:0!important;
      color:#8c969d!important;
      font-size:9px!important;
      line-height:1.55!important;
    }
    .member-page .attendance-timeline .empty-actions{
      display:flex!important;
      gap:9px!important;
      justify-content:center!important;
      flex-wrap:wrap!important;
      margin-top:18px!important;
    }
    .member-page .attendance-timeline .empty-actions button{
      min-height:44px!important;
      padding:0 16px!important;
      border-radius:0!important;
      font-size:8px!important;
      font-weight:950!important;
      cursor:pointer!important;
    }
    .member-page .attendance-timeline .empty-primary{
      border:1px solid #ff3150!important;
      background:#ff3150!important;
      color:#fff!important;
    }
    .member-page .attendance-timeline .empty-secondary{
      border:1px solid #30373c!important;
      background:#141a1f!important;
      color:#fff!important;
    }
    .member-page .attendance-timeline .empty-primary:hover{background:#e82946!important}
    .member-page .attendance-timeline .empty-secondary:hover{border-color:#ff3150!important}
    @media(max-width:1000px){.member-page .attendance-access-panel{grid-template-columns:1fr}.member-page .attendance-how-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.member-page .client-rf-summary{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
    @media(max-width:620px){.member-page .attendance-access-panel,.member-page .attendance-how-it-works{margin-left:14px;margin-right:14px;padding:18px}.member-page .attendance-access-actions{display:grid}.member-page .attendance-access-primary{min-width:0;width:100%}.member-page .attendance-how-grid,.member-page .client-rf-summary{grid-template-columns:1fr!important}}
    @media(max-width:1200px){.member-page .mallqui-wellbeing-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.member-page .mallqui-wellbeing-grid article{min-height:270px}}
    @media(max-width:700px){.member-page .mallqui-wellbeing-section{padding:36px 14px 42px}.member-page .mallqui-wellbeing-head{align-items:flex-start;flex-direction:column}.member-page .mallqui-wellbeing-head h2{font-size:31px}.member-page .mallqui-wellbeing-head>b{white-space:normal}.member-page .mallqui-wellbeing-grid{grid-template-columns:1fr}}
    @media(max-width:900px){.member-page .training-profile-cards{grid-template-columns:repeat(2,minmax(0,1fr))}.member-page .training-profile-actions{grid-template-columns:1fr}}
    @media(max-width:620px){.member-page .training-profile-guide{margin:14px;padding:18px}.member-page .training-profile-guide-head{flex-direction:column}.member-page .training-profile-cards,.member-page .training-exercise-preview-list{grid-template-columns:1fr}.member-page .training-level-selector button{flex:1}}
    @media(max-width:700px){.member-page .focus-selected-notice{align-items:flex-start;flex-direction:column}.member-page .focus-selected-notice button{width:100%}}
  `]
})
export class UsuarioComponent implements OnInit, OnDestroy {
  moduloActivo='inicio'; cargando=true; error=''; toast='';
  avisosNoLeidos=0;
  mobileMenuAbierto=false;
  apiConectada=false;
  dbConectada=false;
  dbMotor='MySQL';
  resumen:any=null; perfil:any={}; membresiaActual:any=null; membresiaProxima:any=null; membresiasDisponibles:any[]=[]; gymInfo:any={};
  pagos:any[]=[]; rutinas:any[]=[]; asistencias:any[]=[]; reservas:any[]=[]; clases:any[]=[]; compras:any[]=[];
  fechasReserva:Record<number,string>={};
  pagoForm:any={id_membresia:0,fecha_inicio:new Date().toISOString().slice(0,10),metodo_pago:'Yape',numero_operacion:''};
  ultimaBoleta:any=null;
  procesandoCompra=false;
  procesandoSolicitudRutina=false;
  actualizandoModulo=false;
  seguridadForm:any={actual:'',nueva:'',confirmacion:''};
  enfoqueInicioSeleccionado='';
  nivelEntrenamiento='Principiante';

  diasSemanaCasa=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  objetivosCasaMeta=[
    {id:'fuerza',nombre:'Fuerza',icono:'⚡',descripcion:'Fortalecer músculos de forma gradual y controlada.'},
    {id:'resistencia',nombre:'Resistencia',icono:'◷',descripcion:'Mantener el esfuerzo moderado durante más tiempo.'},
    {id:'movilidad',nombre:'Movilidad',icono:'↔',descripcion:'Mejorar control, postura y amplitud cómoda de movimiento.'},
  ];
  zonasCasaMeta=[
    {id:'piernas',nombre:'Piernas',icono:'🦵',subtitulo:'MÁQUINAS + PESAS',enfoque:'Tren inferior',descripcion:'Prensa, extensión de cuádriceps, curl femoral y sentadilla con mancuernas.'},
    {id:'gluteos',nombre:'Glúteos',icono:'↥',subtitulo:'BANCO + POLEA',enfoque:'Glúteos y cadera',descripcion:'Hip thrust, sentadilla sumo, abductores y patada de glúteo en polea.'},
    {id:'brazos',nombre:'Brazos',icono:'💪',subtitulo:'MANCUERNAS + POLEA',enfoque:'Bíceps y tríceps',descripcion:'Curl de bíceps, martillo y extensiones de tríceps con polea y mancuerna.'},
    {id:'pecho',nombre:'Pecho',icono:'◆',subtitulo:'BANCO + MÁQUINA',enfoque:'Pecho y empuje',descripcion:'Press de banca, press en máquina, aperturas con mancuernas y banco.'},
    {id:'espalda',nombre:'Espalda',icono:'✦',subtitulo:'POLEAS + MANCUERNA',enfoque:'Dorsales y espalda',descripcion:'Jalón al pecho, remo sentado, remo con mancuerna y pullover en polea.'},
    {id:'hombros',nombre:'Hombros',icono:'↻',subtitulo:'PESAS + POLEA',enfoque:'Deltoides',descripcion:'Press de hombros, elevaciones con mancuernas y face pull en polea.'},
    {id:'core',nombre:'Abdomen / Core',icono:'◎',subtitulo:'MÁQUINA + BANCO',enfoque:'Zona media',descripcion:'Crunch en máquina, plancha, elevación de rodillas y press Pallof en polea.'},
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
  serieCasaActual=1;
  cargasGym:Record<string,string|number>={};
  ladoCasa:'derecho'|'izquierdo'='derecho';
  private timerCasa:any=null;

  constructor(private api:GymApiService, private auth:AuthService, private router:Router){}

  ngOnInit():void{
    try{
      this.enfoqueInicioSeleccionado=localStorage.getItem('mallqui_enfoque_entrenamiento')||'Cardiovascular';
      this.nivelEntrenamiento=localStorage.getItem('mallqui_nivel_entrenamiento')||'Principiante';
    }catch{
      this.enfoqueInicioSeleccionado='Cardiovascular';
      this.nivelEntrenamiento='Principiante';
    }
    this.cargarEstadoSistema();
    this.cargar();
  }
  ngOnDestroy():void{ this.detenerTimerCasa(); }

  cargarEstadoSistema():void{
    this.api.estadoSistema().subscribe({
      next:r=>{
        this.apiConectada=Boolean(r?.api);
        this.dbConectada=Boolean(r?.database);
        this.dbMotor=String(r?.motor || 'MySQL').toUpperCase();
      },
      error:e=>{
        this.apiConectada=Boolean(e?.error?.api);
        this.dbConectada=false;
        this.dbMotor=String(e?.error?.motor || 'MySQL').toUpperCase();
      }
    });
  }

  cargar():void{
    this.cargando=true; this.error='';
    this.api.cargarPortalCliente().subscribe({
      next:r=>{this.resumen=r.resumen;this.perfil=this.normalizarPerfil(r.perfil);this.membresiaActual=r.membresia?.actual;this.membresiaProxima=r.membresia?.proxima||null;this.membresiasDisponibles=r.membresiasDisponibles||[];this.gymInfo=r.gymInfo||{};this.pagos=r.pagos||[];this.rutinas=r.rutinas||[];this.asistencias=r.asistencias||[];this.reservas=r.reservas||[];this.clases=(r.clases||[]).filter((x:any)=>x.estado==='Activo');this.compras=r.compras||[];this.preseleccionarPlanActual();this.cargando=false;this.cargarEntrenamientoCasa();this.cargarContadorAvisos();},
      error:e=>{this.error=this.errorApi(e);this.cargando=false;}
    });
  }
  preseleccionarPlanActual():void{
    if(Number(this.pagoForm?.id_membresia||0)>0)return;

    const idActual=Number(this.membresiaActual?.membresia?.id_membresia||this.membresiaActual?.id_membresia||0);
    const actual=this.planesRenovacion.find((m:any)=>Number(m?.id_membresia)===idActual);

    const pagoPendiente=this.pagos.find((p:any)=>p?.estado_pago==='Pendiente');
    const idPendiente=Number(
      pagoPendiente?.cliente_membresia?.membresia?.id_membresia||
      pagoPendiente?.cliente_membresia?.id_membresia||
      0
    );
    const planPendiente=this.planesRenovacion.find((m:any)=>Number(m?.id_membresia)===idPendiente);

    const planInicial=actual||planPendiente||this.planesRenovacion[0]||null;
    if(planInicial){
      this.pagoForm={
        ...this.pagoForm,
        id_membresia:Number(planInicial.id_membresia),
        numero_operacion:String(
          planPendiente && pagoPendiente?.numero_operacion
            ? pagoPendiente.numero_operacion
            : (this.pagoForm?.numero_operacion||'')
        )
      };
    }
  }

  abrirModulo(m:string){
    this.mobileMenuAbierto=false;
    this.moduloActivo=m;
    this.error='';

    if(m==='casa'){
      // Entrenar siempre vuelve a consultar rutina y membresía para reflejar
      // asignaciones hechas por el personal sin obligar al cliente a recargar la página.
      this.cargarEntrenamientoCasa();
    }
    if(m==='avisos')this.cargarContadorAvisos();

    // Los módulos operativos siempre consultan datos actuales al abrirse.
    if(['casa','rutinas','clases','reservas','asistencias','pagos','perfil'].includes(m)){
      this.sincronizarDatosCliente(false);
    }

    window.scrollTo({top:0,behavior:'smooth'});
  }

  abrirEnfoqueEntrenamiento(enfoque:string):void{
    this.enfoqueInicioSeleccionado=enfoque;
    try{localStorage.setItem('mallqui_enfoque_entrenamiento',enfoque);}catch{}
    this.abrirModulo('casa');
    this.ok('Objetivo seleccionado: '+enfoque);
  }

  seleccionarNivelEntrenamiento(nivel:'Principiante'|'Intermedio'|'Avanzado'):void{
    this.nivelEntrenamiento=nivel;
    try{localStorage.setItem('mallqui_nivel_entrenamiento',nivel);}catch{}
  }

  get guiaEnfoqueInicio():any{
    const objetivo=this.enfoqueInicioSeleccionado||'Cardiovascular';
    const nivel=this.nivelEntrenamiento||'Principiante';

    const guias:Record<string,any>={
      'Cardiovascular':{
        tipo:'Aeróbico cardiovascular',
        descripcion:'Trabajo progresivo para mejorar resistencia y condición física general.',
        niveles:{
          Principiante:{clase:'Adaptación cardiovascular',ejercicios:['Caminata en cinta','Bicicleta estática','Elíptica suave','Movilidad general']},
          Intermedio:{clase:'Cardio de resistencia moderada',ejercicios:['Caminata con inclinación o trote suave','Bicicleta con intervalos moderados','Elíptica','Remo ergómetro']},
          Avanzado:{clase:'Resistencia cardiovascular supervisada',ejercicios:['Intervalos controlados en cinta','Bicicleta por bloques','Remo ergómetro','Trabajo de movilidad y recuperación']}
        }
      },
      'Masa muscular':{
        tipo:'Fuerza y musculación',
        descripcion:'Entrenamiento de fuerza con progresión técnica y cargas definidas por el entrenador.',
        niveles:{
          Principiante:{clase:'Adaptación a máquinas',ejercicios:['Prensa de piernas','Press de pecho en máquina','Remo sentado','Jalón al pecho']},
          Intermedio:{clase:'Fuerza de cuerpo completo',ejercicios:['Sentadilla goblet','Press de pecho','Remo en polea','Press de hombros con carga moderada']},
          Avanzado:{clase:'Musculación planificada por grupos',ejercicios:['Prensa o sentadilla según técnica','Press de pecho según rutina','Remo con resistencia','Jalón o trabajo de espalda según plan']}
        }
      },
      'Tonificación':{
        tipo:'Fuerza + acondicionamiento',
        descripcion:'Combinación de fuerza, movilidad y resistencia con prioridad en técnica y control corporal.',
        niveles:{
          Principiante:{clase:'Circuito básico de cuerpo completo',ejercicios:['Sentadilla al banco','Remo en polea','Press de pecho en máquina','Plancha modificada']},
          Intermedio:{clase:'Circuito de acondicionamiento',ejercicios:['Sentadilla goblet','Remo en polea','Press con mancuernas','Press Pallof']},
          Avanzado:{clase:'Circuito de fuerza y resistencia',ejercicios:['Trabajo de piernas según rutina','Empuje de tren superior','Tracción de espalda','Core y movilidad']}
        }
      },
      'CrossFit':{
        tipo:'Entrenamiento funcional',
        descripcion:'Trabajo funcional adaptado al nivel. La técnica y la supervisión tienen prioridad sobre la intensidad.',
        niveles:{
          Principiante:{clase:'CrossFit técnico adaptado',ejercicios:['Sentadilla sin carga','Step-up bajo','Remo en máquina','Movilidad general']},
          Intermedio:{clase:'Circuito funcional moderado',ejercicios:['Sentadilla goblet','Step-up','Remo ergómetro','Trabajo de empuje controlado']},
          Avanzado:{clase:'Circuito funcional supervisado',ejercicios:['Patrones de sentadilla','Patrones de empuje','Patrones de tracción','Trabajo cardiovascular por estaciones']}
        }
      },
      'Pérdida de peso':{
        tipo:'Aeróbico + anaeróbico',
        descripcion:'Enfoque de acondicionamiento y salud que combina cardio y fuerza. No propone cambios rápidos de peso ni dietas restrictivas.',
        niveles:{
          Principiante:{clase:'Cardio + fuerza básica',ejercicios:['Caminata en cinta','Bicicleta estática','Prensa de piernas','Remo sentado']},
          Intermedio:{clase:'Circuito aeróbico y de fuerza',ejercicios:['Cardio moderado por bloques','Prensa de piernas','Remo en polea','Circuito de cuerpo completo']},
          Avanzado:{clase:'Acondicionamiento mixto supervisado',ejercicios:['Intervalos cardiovasculares controlados','Circuito de fuerza','Trabajo funcional','Movilidad y recuperación']}
        }
      }
    };

    const base=guias[objetivo]||guias['Cardiovascular'];
    const detalle=base.niveles[nivel]||base.niveles.Principiante;
    return {
      tipo:base.tipo,
      clase:detalle.clase,
      descripcion:base.descripcion,
      ejercicios:detalle.ejercicios
    };
  }

  solicitarRutinaConPerfil():void{
    if(!this.membresiaActual){
      this.abrirModulo('pagos');
      return;
    }
    if(this.tieneRutinaAsignadaGym){
      this.abrirModulo('rutinas');
      return;
    }
    if(this.procesandoSolicitudRutina)return;

    this.procesandoSolicitudRutina=true;
    this.errorCasa='';
    const g=this.guiaEnfoqueInicio;
    const mensaje=[
      'Solicito una rutina de entrenamiento en Mallqui Gym.',
      'Nivel: '+this.nivelEntrenamiento+'.',
      'Objetivo: '+this.enfoqueInicioSeleccionado+'.',
      'Tipo de entrenamiento: '+g.tipo+'.',
      'Clase de sesión: '+g.clase+'.',
      'Ejercicios de referencia: '+g.ejercicios.join(', ')+'.',
      'Solicito que el entrenador revise estos datos y registre la rutina final con series, repeticiones, carga y descansos.'
    ].join(' ');

    this.api.crearSoporteCliente({
      asunto:'Solicitud de rutina - '+this.enfoqueInicioSeleccionado,
      mensaje
    }).subscribe({
      next:r=>{
        this.procesandoSolicitudRutina=false;
        this.ok(r?.mensaje||'Solicitud de rutina enviada con tu nivel y objetivo.');
        this.abrirModulo('soporte');
      },
      error:e=>{
        this.procesandoSolicitudRutina=false;
        this.errorCasa=this.errorApi(e);
      }
    });
  }

  irAClasesDisponibles():void{
    if(this.moduloActivo!=='clases'){
      this.moduloActivo='clases';
    }
    setTimeout(()=>{
      document.getElementById('clases-disponibles')?.scrollIntoView({behavior:'smooth',block:'start'});
    },0);
  }

  normalizarPerfil(datos:any):any{
    const p={...(datos||{})};
    if(p.fecha_nacimiento){
      p.fecha_nacimiento=String(p.fecha_nacimiento).slice(0,10);
    }
    return p;
  }

  sincronizarDatosCliente(mostrarAviso=true):void{
    if(this.actualizandoModulo)return;
    this.actualizandoModulo=true;
    this.error='';

    this.api.cargarPortalCliente().subscribe({
      next:r=>{
        this.resumen=r.resumen;
        this.perfil=this.normalizarPerfil(r.perfil);
        this.membresiaActual=r.membresia?.actual||null;
        this.membresiaProxima=r.membresia?.proxima||null;
        this.membresiasDisponibles=r.membresiasDisponibles||[];
        this.gymInfo=r.gymInfo||this.gymInfo||{};
        this.pagos=r.pagos||[];
        this.rutinas=r.rutinas||[];
        this.asistencias=r.asistencias||[];
        this.reservas=r.reservas||[];
        this.clases=(r.clases||[]).filter((x:any)=>x.estado==='Activo');
        this.compras=r.compras||[];
        this.preseleccionarPlanActual();
        this.actualizandoModulo=false;
        if(mostrarAviso)this.ok('Información actualizada');
      },
      error:e=>{
        this.actualizandoModulo=false;
        this.error=this.errorApi(e);
      }
    });
  }

  irConfigCasa():void{
    setTimeout(()=>{
      document.getElementById('config-entreno-casa')?.scrollIntoView({behavior:'smooth',block:'start'});
    },0);
  }

  actualizarSeccion(modulo:'rutinas'|'clases'):void{
    this.cargando=true;
    this.error='';
    this.api.cargarPortalCliente().subscribe({
      next:r=>{
        this.resumen=r.resumen;
        this.perfil=this.normalizarPerfil(r.perfil);
        this.membresiaActual=r.membresia?.actual;
        this.membresiaProxima=r.membresia?.proxima||null;
        this.membresiasDisponibles=r.membresiasDisponibles||[];
        this.gymInfo=r.gymInfo||this.gymInfo||{};
        this.pagos=r.pagos||[];
        this.rutinas=r.rutinas||[];
        this.asistencias=r.asistencias||[];
        this.reservas=r.reservas||[];
        this.clases=(r.clases||[]).filter((x:any)=>x.estado==='Activo');
        this.compras=r.compras||[];
        this.moduloActivo=modulo;
        this.cargando=false;
        this.toast=modulo==='rutinas' ? 'Rutinas actualizadas' : 'Clases actualizadas';
        setTimeout(()=>{ if(this.toast.includes('actualizadas')) this.toast=''; },2200);
      },
      error:e=>{
        this.error=this.errorApi(e);
        this.cargando=false;
      }
    });
  }

  /* Mantiene el menú principal sincronizado con la acción que está viendo el usuario.
     Flujo: Inicio → Entrenar → Rutinas → Clases/Reservas → Progreso/Asistencias. */
  get navPrincipalActivo():string{
    const m=this.moduloActivo;
    if(m==='casa')return 'entrenar';
    if(m==='rutinas')return 'rutinas';
    if(m==='clases' || m==='reservas' || m==='calendario')return 'clases';
    if(m==='progreso' || m==='asistencias')return 'progreso';
    return 'inicio';
  }
  cargarContadorAvisos(){this.api.notificacionesCliente().subscribe({next:r=>this.avisosNoLeidos=Number(r?.no_leidas||0),error:()=>{}});}
  get nombreCorto():string{
    const valor=String(this.perfil?.nombres || this.auth.usuario?.nombres || 'Miembro').trim();
    return valor.split(/\s+/).filter(Boolean).map((p:string)=>p.charAt(0).toUpperCase()+p.slice(1).toLowerCase()).join(' ');
  }
  get tituloModuloActual():string{
    const titulos:Record<string,string>={
      casa:'Entrenamiento en el gimnasio',rutinas:'Mis rutinas',clases:'Clases del gimnasio',
      reservas:'Mis reservas',asistencias:'Mis asistencias',progreso:'Mi progreso',
      calendario:'Mi calendario',club:'Acceso al gimnasio',avisos:'Avisos',pagos:'Membresía y pagos',
      soporte:'Ayuda y soporte',perfil:'Mi perfil'
    };
    return titulos[this.moduloActivo] || 'Mi espacio';
  }
  get subtituloModuloActual():string{
    const textos:Record<string,string>={
      casa:'Planifica tu sesión dentro del gimnasio y sigue cada ejercicio paso a paso.',
      rutinas:'Consulta las rutinas asignadas por tu entrenador.',
      clases:'Encuentra horarios disponibles y reserva sin complicaciones.',
      reservas:'Revisa tus próximas clases y administra tus reservas.',
      asistencias:'Consulta tus ingresos registrados en el gimnasio.',
      progreso:'Mira tu actividad, constancia e historial reciente.',
      calendario:'Ten tus próximas actividades y fechas importantes en un solo lugar.',
      club:'Muestra tu credencial con código de barras para ingresar al gimnasio y consulta tus beneficios.',
      avisos:'Mensajes importantes del gimnasio y recordatorios.',
      pagos:'Revisa tu membresía, compras realizadas y boletas generadas.',
      soporte:'Escríbenos cuando necesites ayuda y revisa nuestras respuestas.',
      perfil:'Actualiza tus datos y protege tu cuenta.'
    };
    return textos[this.moduloActivo] || '';
  }

  get planesRenovacion():any[]{
    const nombresOficiales=new Set(['MENSUALIDAD 1 MES','PROMOCIÓN 2 MESES','PROMOCION 2 MESES','PROMOCIÓN 3 MESES','PROMOCION 3 MESES']);
    return [...(this.membresiasDisponibles||[])]
      .filter((m:any)=>String(m?.estado||'Activo').toLowerCase()==='activo')
      .filter((m:any)=>{
        const nombre=String(m?.nombre||'').trim().toUpperCase();
        return nombresOficiales.has(nombre);
      })
      .sort((a:any,b:any)=>Number(a?.duracion_meses||0)-Number(b?.duracion_meses||0));
  }

  nombrePlanNormalizado(plan:any):string{
    return String(plan?.nombre||'').trim().toUpperCase();
  }

  subtituloPlanGym(plan:any):string{
    const meses=Number(plan?.duracion_meses||1);
    if(meses===1)return 'MENSUALIDAD';
    if(meses===2)return 'PROMOCIÓN 2 MESES';
    if(meses===3)return 'PROMOCIÓN 3 MESES';
    return 'MEMBRESÍA MALLQUI GYM';
  }

  iconoPlanGym(plan:any):string{
    const meses=Number(plan?.duracion_meses||1);
    if(meses===1)return '1';
    if(meses===2)return '2';
    if(meses===3)return '3';
    return '▤';
  }

  beneficiosPlanGym(plan:any):string[]{
    if(Array.isArray(plan?.beneficios) && plan.beneficios.length){
      return plan.beneficios
        .map((x:any)=>String(x||'').trim())
        .filter((x:string)=>Boolean(x));
    }

    const meses=Number(plan?.duracion_meses||1);
    return [
      `Acceso al gimnasio durante ${meses} mes${meses===1?'':'es'}`,
      'Guía e instrucciones a cargo del personal del gym',
      'Credencial digital y control de asistencias'
    ];
  }

  get resumenMensualidades():string{
    const opciones=this.planesRenovacion
      .slice(0,3)
      .map((m:any)=>{
        const meses=Number(m?.duracion_meses||1);
        return `${meses} mes${meses===1?'':'es'} S/ ${Number(m?.precio||0).toFixed(0)}`;
      });
    return opciones.length ? opciones.join(' · ') : '1 mes S/ 80 · 2 meses S/ 120 · 3 meses S/ 150';
  }

  seleccionarPlanRenovacion(plan:any):void{
    const id=Number(plan?.id_membresia||0);
    if(!id)return;
    this.pagoForm={...this.pagoForm,id_membresia:id};
    this.error='';
  }

  get planPagoSeleccionado():any{
    const id=Number(this.pagoForm?.id_membresia||0);
    return this.planesRenovacion.find((m:any)=>Number(m?.id_membresia)===id)||null;
  }

  get fechaMinimaPago():string{
    return new Date().toISOString().slice(0,10);
  }

  get fechaInicioRenovacion():string{
    const solicitada=String(this.pagoForm?.fecha_inicio||this.fechaMinimaPago);
    if(!this.membresiaActual?.fecha_fin)return solicitada;

    const fin=new Date(this.membresiaActual.fecha_fin);
    if(isNaN(fin.getTime()))return solicitada;

    const siguiente=new Date(fin);
    siguiente.setDate(siguiente.getDate()+1);

    const pedida=new Date(solicitada+'T00:00:00');
    const real=!isNaN(pedida.getTime()) && pedida>siguiente ? pedida : siguiente;
    return real.toISOString().slice(0,10);
  }

  get instruccionMetodoPago():string{
    const metodo=String(this.pagoForm?.metodo_pago||'Yape');
    if(metodo==='Yape' || metodo==='Plin'){
      return 'Realiza el pago por el monto exacto y registra el número de operación.';
    }
    if(metodo==='Transferencia'){
      return 'Realiza la transferencia por el monto exacto y registra el código de operación.';
    }
    return 'Registra el número de operación o comprobante entregado al realizar el pago.';
  }

  get siguientePasoModulo():string{
    if(!this.perfilCompleto)return 'perfil';
    if(!this.membresiaActual)return 'pagos';
    if(!this.tieneRutinaAsignadaGym)return 'rutinas';
    if(!this.reservasActivas.length)return 'clases';
    return 'progreso';
  }
  get siguientePasoTitulo():string{
    const m=this.siguientePasoModulo;
    if(m==='perfil')return 'Completa tus datos';
    if(m==='pagos')return 'Activa tu mensualidad';
    if(m==='rutinas')return 'Revisa tu rutina asignada';
    if(m==='clases')return 'Reserva tu próxima clase';
    return 'Revisa tu progreso';
  }
  get siguientePasoDescripcion():string{
    const m=this.siguientePasoModulo;
    if(m==='perfil')return 'Agrega teléfono y dirección para dejar tu cuenta lista.';
    if(m==='pagos')return 'Elige una mensualidad o promoción y registra tu pago para comenzar a usar el gimnasio.';
    if(m==='rutinas')return 'Tu entrenador debe registrar la rutina que usarás dentro de Mallqui Gym.';
    if(m==='clases')return 'Explora horarios disponibles y reserva una clase que te convenga.';
    return 'Mira tus sesiones, asistencias, calendario y actividad reciente.';
  }
  get siguientePasoBoton():string{
    const m=this.siguientePasoModulo;
    if(m==='perfil')return 'Completar perfil';
    if(m==='pagos')return 'Ver membresías';
    if(m==='rutinas')return 'Ver mis rutinas';
    if(m==='clases')return 'Explorar clases';
    return 'Ver progreso';
  }
  get siguientePasoIcono():string{
    const m=this.siguientePasoModulo;
    if(m==='perfil')return '♙';
    if(m==='pagos')return '✦';
    if(m==='rutinas')return '🏋';
    if(m==='clases')return '▣';
    return '◎';
  }
  irSiguientePaso(){this.abrirModulo(this.siguientePasoModulo);}

  get rutinaActual():any{
    if(this.resumen?.rutina_actual)return this.resumen.rutina_actual;
    const hoy=new Date();
    hoy.setHours(0,0,0,0);
    return this.rutinas.find((r:any)=>{
      if(String(r?.estado||'').toLowerCase()!=='activo')return false;
      const inicio=r?.fecha_inicio ? new Date(String(r.fecha_inicio).slice(0,10)+'T00:00:00') : null;
      const fin=r?.fecha_fin ? new Date(String(r.fecha_fin).slice(0,10)+'T23:59:59') : null;
      return (!inicio || inicio.getTime()<=hoy.getTime()) && (!fin || fin.getTime()>=hoy.getTime());
    }) || null;
  }
  get nombreEntrenador():string{return this.nombrePersona(this.rutinaActual?.entrenador) || 'Personal de Mallqui Gym';}
  get reservasActivas():any[]{return this.reservas.filter(r=>r.estado==='Reservada');}
  get reservasAsistidas():number{return this.reservas.filter(r=>r.estado==='Asistio').length;}
  get reservasCanceladas():number{return this.reservas.filter(r=>r.estado==='Cancelada').length;}
  get asistenciasMesActual():number{
    const hoy=new Date();
    return this.asistencias.filter((a:any)=>{
      const d=new Date(a?.fecha_hora_entrada);
      return !isNaN(d.getTime()) && d.getFullYear()===hoy.getFullYear() && d.getMonth()===hoy.getMonth();
    }).length;
  }
  get asistenciaAbierta():any{
    return this.asistencias.find((a:any)=>a?.fecha_hora_entrada && !a?.fecha_hora_salida)||null;
  }

  get ultimaAsistencia():any{
    return Array.isArray(this.asistencias) && this.asistencias.length ? this.asistencias[0] : null;
  }

  duracionAsistencia(a:any):string{
    if(!a?.fecha_hora_entrada)return '-';
    const inicio=new Date(a.fecha_hora_entrada);
    const fin=a?.fecha_hora_salida ? new Date(a.fecha_hora_salida) : new Date();
    if(isNaN(inicio.getTime()) || isNaN(fin.getTime()))return '-';
    const minutos=Math.max(0,Math.floor((fin.getTime()-inicio.getTime())/60000));
    const h=Math.floor(minutos/60);
    const m=minutos%60;
    if(h<=0)return m+' min';
    return h+' h '+String(m).padStart(2,'0')+' min';
  }

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
        descripcion:'Selecciona la mensualidad o promoción con la que usarás el gimnasio.',
        icono:'✦',
        modulo:'pagos',
        done:Boolean(this.membresiaActual),
      },
      {
        titulo:'Tener una rutina asignada',
        descripcion:'Tu entrenador registra los ejercicios, series, repeticiones, carga y descansos.',
        icono:'⚡',
        modulo:'rutinas',
        done:this.tieneRutinaAsignadaGym,
      },
      {
        titulo:'Registrar tu primera actividad',
        descripcion:'Entrena dentro del gym, reserva una clase o registra una asistencia.',
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
      this.tieneRutinaAsignadaGym,
      this.reservasActivas.length>0,
      this.actividadRegistrada
    ];
    return Math.round((pasos.filter(Boolean).length/pasos.length)*100);
  }
  get progresoMensualPortal():number{
    const asistencias=Math.min(Number(this.resumen?.asistencias_mes||0),12)/12;
    const rutinas=Math.min(this.rutinas.length,4)/4;
    const reservas=Math.min(this.reservasActivas.length,4)/4;
    return Math.max(0,Math.min(100,Math.round((asistencias*.45+rutinas*.30+reservas*.25)*100)));
  }

  /* El inicio muestra únicamente información real de la cuenta del cliente.
     Si todavía no existen registros, se muestra 0 en lugar de datos de demostración. */
  get showcaseAsistencias():number{return Number(this.resumen?.asistencias_mes||0);}
  get showcaseRutinas():number{return this.rutinas.length;}
  get showcaseReservas():number{return this.reservasActivas.length;}
  get showcaseProgreso():number{return this.progresoMensualPortal;}

  fechaCortaPortal(v:any):string{
    if(!v)return 'Por confirmar';
    const d=new Date(v);
    if(isNaN(d.getTime()))return String(v);
    return d.toLocaleDateString('es-PE',{day:'2-digit',month:'short',year:'numeric'});
  }

  nombreMembresiaVisible(relacion:any):string{
    if(!relacion)return 'Sin membresía activa';
    const membresia=relacion?.membresia||relacion||{};
    const nombre=String(membresia?.nombre||'').trim();
    const meses=Math.max(0,Number(membresia?.duracion_meses||0));
    const oficial=/^(Mensualidad 1 mes|Promoción 2 meses|Promocion 2 meses|Promoción 3 meses|Promocion 3 meses)$/i.test(nombre);
    if(oficial)return nombre;
    if(meses===1)return 'Mensualidad vigente · 1 mes';
    if(meses>1)return `Membresía vigente · ${meses} meses`;
    return nombre || 'Membresía vigente';
  }

  get ultimoPagoCompletado():any{
    return (this.pagos||[]).find((p:any)=>String(p?.estado_pago||'').toLowerCase()==='completado')||null;
  }

  get diasRestantesMembresia():number{
    if(!this.membresiaActual?.fecha_fin)return 0;
    const fin=new Date(String(this.membresiaActual.fecha_fin).slice(0,10)+'T23:59:59');
    const hoy=new Date();
    return Math.max(0,Math.ceil((fin.getTime()-hoy.getTime())/86400000));
  }

  accionEntrenamientoPrincipal():void{
    if(!this.membresiaActual){
      this.abrirModulo('pagos');
      return;
    }
    if(!this.tieneRutinaAsignadaGym){
      this.solicitarRutinaAlPersonal();
      return;
    }
    this.iniciarEntrenamientoCasa();
  }

  solicitarRutinaAlPersonal():void{
    if(!this.membresiaActual){
      this.abrirModulo('pagos');
      return;
    }
    if(this.tieneRutinaAsignadaGym){
      this.abrirModulo('rutinas');
      return;
    }
    if(this.procesandoSolicitudRutina)return;

    this.procesandoSolicitudRutina=true;
    this.errorCasa='';
    const crear=()=>{
      this.api.crearSoporteCliente({
        asunto:'Solicitud de rutina',
        mensaje:'Tengo una membresía vigente y solicito que el personal de Mallqui Gym registre mi rutina de entrenamiento en el sistema.'
      }).subscribe({
        next:r=>{
          this.procesandoSolicitudRutina=false;
          this.ok(r?.mensaje||'Solicitud de rutina enviada al personal del gimnasio.');
          this.abrirModulo('soporte');
        },
        error:e=>{
          this.procesandoSolicitudRutina=false;
          this.errorCasa=this.errorApi(e);
        }
      });
    };

    this.api.soporteCliente().subscribe({
      next:(items:any[])=>{
        const pendiente=(items||[]).find((s:any)=>
          String(s?.estado||'').toLowerCase()==='pendiente' &&
          String(s?.asunto||'').toLowerCase().includes('rutina')
        );
        if(pendiente){
          this.procesandoSolicitudRutina=false;
          this.ok('Ya tienes una solicitud de rutina pendiente con el gimnasio.');
          this.abrirModulo('soporte');
          return;
        }
        crear();
      },
      error:()=>crear()
    });
  }

  irDetalleEntrenamiento():void{
    if(!this.tieneRutinaAsignadaGym){
      this.solicitarRutinaAlPersonal();
      return;
    }
    setTimeout(()=>{
      document.querySelector('.gym-assigned-routine-real')?.scrollIntoView({behavior:'smooth',block:'start'});
    },0);
  }

  nombrePersona(p:any):string{return p?[`${p.nombres||''}`,`${p.apellidos||''}`].join(' ').trim():'-';}
  fecha(v:any):string{if(!v)return '-';const d=new Date(v);return isNaN(d.getTime())?String(v):d.toLocaleString('es-PE');}

  cargarEntrenamientoCasa():void{
    this.api.entrenamientoCasaCliente().subscribe({
      next:r=>{
        const rutina=r?.rutina||null;
        this.membresiaActual=r?.membresia||this.membresiaActual||null;
        this.resumen={
          ...(this.resumen||{}),
          rutina_actual:rutina,
          membresia_actual:this.membresiaActual
        };

        if(rutina){
          const resto=(this.rutinas||[]).filter((x:any)=>Number(x?.id_rutina)!==Number(rutina.id_rutina));
          this.rutinas=[rutina,...resto];
        }

        this.planCasa={
          dias:[],
          zonas:[],
          objetivo:String(rutina?.objetivo||'')
        };
        this.catalogoCasa={piernas:[],gluteos:[],brazos:[],pecho:[],espalda:[],hombros:[],core:[]};
        this.historialCasa=r?.historial||[];
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
      if(dias.length===1){this.errorCasa='Mantén al menos un día de entrenamiento en el gimnasio.';return;}
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

  get tieneRutinaAsignadaGym():boolean{
    return Array.isArray(this.rutinaActual?.detalles) && this.rutinaActual.detalles.length>0;
  }

  normalizarTextoGym(valor:any):string{
    return String(valor||'')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .trim()
      .toLowerCase();
  }

  equipoRutinaGym(nombre:any):string{
    const n=this.normalizarTextoGym(nombre);
    if(n.includes('prensa'))return 'Máquina de prensa';
    if(n.includes('extension') && n.includes('cuadr'))return 'Máquina de extensión de cuádriceps';
    if(n.includes('femoral'))return 'Máquina de curl femoral';
    if(n.includes('abdu'))return 'Máquina de abductores';
    if(n.includes('aductor'))return 'Máquina de aductores';
    if(n.includes('jalon'))return 'Polea alta';
    if(n.includes('face pull'))return 'Polea alta con cuerda';
    if(n.includes('triceps') && n.includes('polea'))return 'Polea alta';
    if(n.includes('pallof'))return 'Polea';
    if(n.includes('polea'))return 'Polea';
    if(n.includes('remo') && n.includes('mancuerna'))return 'Banco y mancuerna';
    if(n.includes('remo'))return 'Polea baja';
    if(n.includes('press') && n.includes('banca'))return 'Banco y peso libre';
    if(n.includes('press') && n.includes('pecho'))return 'Máquina de pecho';
    if(n.includes('press') && n.includes('hombro'))return 'Banco y mancuernas';
    if(n.includes('hip thrust'))return 'Banco y barra';
    if(n.includes('sentadilla'))return 'Rack / peso libre';
    if(n.includes('curl') || n.includes('biceps'))return 'Mancuernas';
    if(n.includes('elevacion'))return 'Mancuernas';
    if(n.includes('apertura'))return 'Banco y mancuernas';
    if(n.includes('crunch'))return 'Máquina abdominal';
    if(n.includes('plancha'))return 'Colchoneta';
    return 'Área de musculación';
  }

  get ejerciciosRutinaAsignadaGym():any[]{
    const detalles=Array.isArray(this.rutinaActual?.detalles) ? this.rutinaActual.detalles : [];
    return detalles.map((d:any,i:number)=>({
      id:'rutina_'+String(d?.id_detalle_rutina||i+1),
      id_detalle_rutina:Number(d?.id_detalle_rutina||0),
      nombre:String(d?.ejercicio||('Ejercicio '+(i+1))),
      modo:'repeticiones',
      repeticiones:Math.max(1,Number(d?.repeticiones||10)),
      por_lado:false,
      series:Math.max(1,Number(d?.series||3)),
      segundos:45,
      descanso:Math.max(10,Number(d?.descanso_segundos||45)),
      icono:'🏋',
      equipo:this.equipoRutinaGym(d?.ejercicio),
      peso_recomendado:Number(d?.peso_recomendado||0),
      observaciones:String(d?.observaciones||'').trim(),
      instrucciones:String(d?.observaciones||'').trim()
        ? [String(d.observaciones)]
        : ['No hay indicaciones adicionales registradas por el entrenador para este ejercicio.'],
      origen:'rutina_asignada'
    }));
  }

  get ejerciciosCasaActuales():any[]{
    return this.tieneRutinaAsignadaGym ? this.ejerciciosRutinaAsignadaGym : [];
  }

  get puedeEntrenarRutinaGym():boolean{
    return Boolean(this.membresiaActual && this.tieneRutinaAsignadaGym);
  }

  get ejercicioCasaActual():any{return this.ejerciciosCasaActuales[this.indiceEjercicioCasa]||null;}
  get siguienteEjercicioCasa():any{
    const siguienteIndice=this.indiceEjercicioCasa+1;
    return siguienteIndice<this.ejerciciosCasaActuales.length
      ? this.ejerciciosCasaActuales[siguienteIndice]
      : null;
  }

  get nombreRutinaSesionGym():string{
    return this.tieneRutinaAsignadaGym
      ? String(this.rutinaActual?.nombre_rutina||'Rutina asignada')
      : 'Sin rutina asignada';
  }

  claveEjercicioGym(e:any):string{
    return String(e?.id||e?.nombre||'ejercicio');
  }

  cargaActualGym(e:any):string|number{
    const clave=this.claveEjercicioGym(e);
    const valor=this.cargasGym[clave];
    if(valor!==undefined && valor!==null && valor!=='')return valor;
    const recomendado=Number(e?.peso_recomendado||0);
    return recomendado>0 ? recomendado : '';
  }

  actualizarCargaGym(e:any,valor:any):void{
    const clave=this.claveEjercicioGym(e);
    this.cargasGym={...this.cargasGym,[clave]:valor};
  }

  textoPesoGym(e:any):string{
    const carga=this.cargaActualGym(e);
    if(carga!=='' && carga!==null && carga!==undefined)return String(carga)+' kg';
    const recomendado=Number(e?.peso_recomendado||0);
    return recomendado>0 ? recomendado+' kg recomendados' : 'Según indicación del entrenador';
  }

  numeroFilaGym(indice:number):string|number{
    return indice<this.indiceEjercicioCasa ? '✓' : indice+1;
  }

  estadoFilaGym(indice:number):string{
    if(indice<this.indiceEjercicioCasa)return 'Completado';
    if(indice>this.indiceEjercicioCasa)return 'Pendiente';
    return this.faseCasa==='descanso' ? 'Descanso' : 'En curso';
  }

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
      const reps=e?.origen==='rutina_asignada'
        ? Math.max(1,Number(e?.repeticiones||1))
        : this.repeticionesObjetivoCasa(e);
      return e.por_lado ? (reps+' por cada lado') : (reps+' repeticiones');
    }
    return this.segundosObjetivoCasa(e)+' segundos';
  }

  duracionEstimadaCasa(zona:string):number{
    const lista=this.tieneRutinaAsignadaGym ? this.ejerciciosRutinaAsignadaGym : [];
    const total=lista.reduce((s:number,e:any)=>{
      const trabajo=e?.modo==='repeticiones'
        ? Math.max(30,this.repeticionesObjetivoCasa(e)*(e?.por_lado?4:3))
        : this.segundosObjetivoCasa(e);
      const series=this.seriesEjercicioCasa(e);
      const descanso=Math.max(0,Number(e?.descanso||0));
      return s+((trabajo+descanso)*series);
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

  get seriesCasaTotalActual():number{
    return Math.max(1,Number(this.ejercicioCasaActual?.series||1));
  }

  seriesEjercicioCasa(e:any):number{
    return Math.max(1,Number(e?.series||1));
  }

  seriesArrayCasa(e:any):number[]{
    return Array.from({length:this.seriesEjercicioCasa(e)},(_,i)=>i+1);
  }

  get totalSeriesCasaActuales():number{
    return this.ejerciciosCasaActuales.reduce((total:number,e:any)=>total+this.seriesEjercicioCasa(e),0);
  }

  get equiposCasaActuales():string[]{
    return Array.from(new Set(this.ejerciciosCasaActuales.map((e:any)=>String(e?.equipo||'Equipo del gimnasio'))));
  }

  get textoDescansoCasa():string{
    if(this.serieCasaActual<this.seriesCasaTotalActual){
      return 'Descansa y prepárate para la serie '+(this.serieCasaActual+1)+' de '+this.seriesCasaTotalActual;
    }
    return this.siguienteEjercicioCasa
      ? 'Recupera antes de pasar a '+this.siguienteEjercicioCasa.nombre
      : 'Último descanso antes de completar la sesión';
  }

  get objetivoRepsCasa():number{
    return this.ejercicioCasaActual?.modo==='repeticiones'
      ? this.repeticionesObjetivoCasa(this.ejercicioCasaActual)
      : 0;
  }

  completarSerieGym():void{
    if(!this.sesionCasaActiva || this.sesionCasaPausada || this.faseCasa!=='ejercicio')return;
    this.errorCasa='';
    this.siguienteFaseCasa();
  }

  saltarDescansoGym():void{
    if(!this.sesionCasaActiva || this.faseCasa!=='descanso')return;
    this.segundosCasa=0;
    this.siguienteFaseCasa();
  }

  avanzarEjercicioCasa():void{
    if(!this.sesionCasaActiva)return;
    if(this.faseCasa==='descanso'){
      this.saltarDescansoGym();
      return;
    }
    this.completarSerieGym();
  }

  iniciarEntrenamientoCasa():void{
    if(!this.membresiaActual){
      this.errorCasa='No puedes iniciar una sesión porque no tienes una membresía activa registrada.';
      return;
    }
    if(!this.tieneRutinaAsignadaGym){
      this.errorCasa='Aún no tienes una rutina activa asignada. El entrenador o administrador debe registrarla primero.';
      return;
    }
    if(!this.ejerciciosCasaActuales.length){
      this.errorCasa='La rutina asignada todavía no tiene ejercicios registrados.';
      return;
    }

    this.detenerTimerCasa();
    this.indiceEjercicioCasa=0;
    this.faseCasa='ejercicio';
    this.segundosCasa=this.ejercicioCasaActual?.modo==='tiempo' ? this.segundosObjetivoCasa(this.ejercicioCasaActual) : 0;
    this.segundosTranscurridosCasa=0;
    this.repsCasaHechas=0;
    this.serieCasaActual=1;
    this.ladoCasa='derecho';
    this.cargasGym={};
    for(const ejercicio of this.ejerciciosCasaActuales){
      const recomendado=Number(ejercicio?.peso_recomendado||0);
      if(recomendado>0)this.cargasGym[this.claveEjercicioGym(ejercicio)]=recomendado;
    }
    this.sesionCasaActiva=true;
    this.sesionCasaPausada=false;
    this.sesionCasaTerminada=false;
    this.errorCasa='';
    this.timerCasa=setInterval(()=>this.tickCasa(),1000);

    setTimeout(()=>{
      document.querySelector('#sesion-entrenamiento-casa')?.scrollIntoView({behavior:'smooth',block:'start'});
    },80);
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
      this.faseCasa='descanso';
      this.segundosCasa=Math.max(10,Number(this.ejercicioCasaActual?.descanso||30));
      return;
    }

    // Si todavía faltan series del ejercicio actual, repetimos el mismo ejercicio.
    if(this.serieCasaActual<this.seriesCasaTotalActual){
      this.serieCasaActual++;
      this.faseCasa='ejercicio';
      this.repsCasaHechas=0;
      this.ladoCasa='derecho';
      this.segundosCasa=this.ejercicioCasaActual?.modo==='tiempo'
        ? this.segundosObjetivoCasa(this.ejercicioCasaActual)
        : 0;
      return;
    }

    // Al completar todas las series, avanzamos al siguiente ejercicio.
    if(this.indiceEjercicioCasa>=this.ejerciciosCasaActuales.length-1){
      this.completarSesionCasa();
      return;
    }

    this.indiceEjercicioCasa++;
    this.serieCasaActual=1;
    this.faseCasa='ejercicio';
    this.repsCasaHechas=0;
    this.ladoCasa='derecho';
    this.segundosCasa=this.ejercicioCasaActual?.modo==='tiempo'
      ? this.segundosObjetivoCasa(this.ejercicioCasaActual)
      : 0;
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
    this.serieCasaActual=1;
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

    const idRutina=Number(this.rutinaActual?.id_rutina||0);
    const ejercicios=this.ejerciciosCasaActuales.map((e:any)=>({
      id_detalle_rutina:Number(e?.id_detalle_rutina||0),
      series_realizadas:this.seriesEjercicioCasa(e),
      repeticiones_realizadas:Math.max(1,Number(e?.repeticiones||1)),
      peso_utilizado:(()=>{
        const valor=Number(this.cargaActualGym(e));
        return Number.isFinite(valor) && valor>0 ? valor : null;
      })(),
      completado:true
    }));

    this.api.registrarSesionCasaCliente({
      id_rutina:idRutina,
      duracion_segundos:duracion,
      ejercicios
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
    this.serieCasaActual=1;
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
    const ejercicios=this.ejerciciosCasaActuales;
    if(!ejercicios.length)return 0;

    const totalSeries=ejercicios.reduce((s:number,e:any)=>s+this.seriesEjercicioCasa(e),0);
    if(!totalSeries)return 0;

    const seriesAnteriores=ejercicios
      .slice(0,this.indiceEjercicioCasa)
      .reduce((s:number,e:any)=>s+this.seriesEjercicioCasa(e),0);

    const completasAntesActual=seriesAnteriores+Math.max(0,this.serieCasaActual-1);
    const actualCompletada=this.faseCasa==='descanso' ? 1 : 0;

    return Math.min(100,Math.round(((completasAntesActual+actualCompletada)/totalSeries)*100));
  }

  get temporizadorFondoCasa():string{
    const actual=this.ejercicioCasaActual;
    const total=Math.max(1,Number(actual?.descanso||30));
    const pct=this.faseCasa==='descanso'
      ? Math.max(0,Math.min(100,((total-this.segundosCasa)/total)*100))
      : 0;
    return 'conic-gradient(#2f78c8 '+pct+'%, #e7edf3 '+pct+'%)';
  }

  imagenEjercicioCasa(ejercicio:any):string{
    const id=String(ejercicio?.id||'');
    const mapa:Record<string,string>={
      sentadilla_silla:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=520&q=86',
      zancada_asistida:'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=520&q=86',
      talones:'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=520&q=86',
      marcha:'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=520&q=86',
      flexion_pared_brazos:'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=520&q=86',
      circulos_brazos:'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=520&q=86',
      empuje_palmas:'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=520&q=86',
      extension_triceps_pared:'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=520&q=86',
      flexion_pared_pecho:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=520&q=86',
      presion_pecho:'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=520&q=86',
      apertura_brazos:'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=520&q=86',
      plancha_pared_pecho:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=520&q=86',
      bird_dog_espalda:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=520&q=86',
      angel_pared:'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=520&q=86',
      remo_isometrico:'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=520&q=86',
      cobra_suave:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=520&q=86',
      elevacion_lateral_hombros:'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=520&q=86',
      deslizamiento_pared:'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=520&q=86',
      rotacion_externa:'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=520&q=86',
      circulos_hombros:'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=520&q=86',
      puente_gluteos:'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=520&q=86',
      abduccion_pie:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=520&q=86',
      patada_atras:'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=520&q=86',
      sentadilla_gluteos:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=520&q=86',
      dead_bug:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=520&q=86',
      bird_dog_core:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=520&q=86',
      rodilla_mano:'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=520&q=86',
      respiracion_core:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=520&q=86',
      sentadilla_mancuernas:'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=520&q=86',
      prensa_piernas:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=520&q=86',
      extension_cuadriceps:'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=520&q=86',
      curl_femoral:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=520&q=86',
      curl_biceps_mancuernas:'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=520&q=86',
      curl_martillo:'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=520&q=86',
      triceps_polea:'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=520&q=86',
      triceps_mancuerna:'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=520&q=86',
      press_banca_mancuernas:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=520&q=86',
      press_pecho_maquina:'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=520&q=86',
      aperturas_mancuernas:'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=520&q=86',
      flexiones_banco:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=520&q=86',
      jalon_pecho:'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=520&q=86',
      remo_sentado:'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=520&q=86',
      remo_mancuerna:'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=520&q=86',
      pullover_polea:'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=520&q=86',
      press_hombros:'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=520&q=86',
      elevacion_lateral_mancuernas:'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=520&q=86',
      face_pull:'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=520&q=86',
      elevacion_frontal_mancuernas:'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=520&q=86',
      hip_thrust_banco:'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=520&q=86',
      sentadilla_sumo_mancuerna:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=520&q=86',
      abduccion_maquina:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=520&q=86',
      patada_polea:'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=520&q=86',
      crunch_maquina:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=520&q=86',
      plancha_colchoneta:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=520&q=86',
      elevacion_rodillas_banco:'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=520&q=86',
      pallof_polea:'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=520&q=86'
    };
    return mapa[id] || 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=520&q=86';
  }

  ocultarImagenEjercicio(event:any):void{
    const img=event?.target as HTMLImageElement;
    if(img)img.style.display='none';
  }

  guardarPerfil(){
    this.api.actualizarPerfilCliente(this.perfil).subscribe({
      next:r=>{
        this.perfil=this.normalizarPerfil(r.cliente);
        this.ok('Perfil actualizado');
      },
      error:e=>this.error=this.errorApi(e)
    });
  }
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
  reservar(c:any){
    const f=this.fechasReserva[c.id_clase];
    if(!f){this.error='Selecciona una fecha para la clase.';return;}
    this.api.reservarClase(c.id_clase,f).subscribe({
      next:r=>{
        this.ok(r.mensaje||'Reserva creada');
        this.fechasReserva[c.id_clase]='';
        this.sincronizarDatosCliente(false);
      },
      error:e=>this.error=this.errorApi(e)
    });
  }
  cancelarReserva(r:any){
    if(!confirm('¿Cancelar esta reserva?'))return;
    this.api.cancelarReserva(r.id_reserva).subscribe({
      next:x=>{
        this.ok(x.mensaje||'Reserva cancelada');
        this.sincronizarDatosCliente(false);
      },
      error:e=>this.error=this.errorApi(e)
    });
  }
  cargarReservas(){
    this.api.reservasCliente().subscribe({
      next:r=>this.reservas=r,
      error:e=>this.error=this.errorApi(e)
    });
  }
  get ultimaBoletaBarcode():string{
    const codigo=String(this.ultimaBoleta?.codigo_barras||'').trim();
    return codigo ? code128DataUri(codigo,{height:54,module:2,quiet:12,text:true}) : '';
  }

  comprarMembresia(){
    if(this.procesandoCompra)return;
    if(!this.planPagoSeleccionado){
      this.error='Selecciona una mensualidad o promoción disponible.';
      return;
    }
    if(!String(this.pagoForm.numero_operacion||'').trim()){
      this.error='Ingresa el número de operación del pago.';
      return;
    }

    this.procesandoCompra=true;
    this.error='';
    this.api.comprarMembresiaCliente({...this.pagoForm}).subscribe({
      next:r=>{
        this.procesandoCompra=false;
        this.ultimaBoleta=r?.comprobante||null;
        this.ok(r.mensaje||'Compra completada');
        this.pagoForm.numero_operacion='';
        this.api.pagosCliente().subscribe(x=>this.pagos=x);
        this.api.membresiaCliente().subscribe(x=>{
          this.membresiaActual=x?.actual||this.membresiaActual;
          this.membresiaProxima=x?.proxima||null;
          this.resumen={
            ...(this.resumen||{}),
            membresia_actual:this.membresiaActual,
            membresia_proxima:this.membresiaProxima
          };
        });
      },
      error:e=>{
        this.procesandoCompra=false;
        this.error=this.errorApi(e);
      }
    });
  }
  usarPagoPendiente(p:any){
    if(!p || p.estado_pago!=='Pendiente')return;
    const idPlan=Number(
      p?.cliente_membresia?.membresia?.id_membresia||
      p?.cliente_membresia?.id_membresia||
      0
    );
    if(idPlan){
      this.pagoForm={
        ...this.pagoForm,
        id_membresia:idPlan,
        numero_operacion:String(p?.numero_operacion||'')
      };
    }
    this.error='';
    this.toast='✓ Pago anterior cargado. Pulsa Comprar y generar boleta.';
    setTimeout(()=>this.toast='',2600);
    setTimeout(()=>{
      document.querySelector('.membership-checkout-card')?.scrollIntoView({behavior:'smooth',block:'start'});
    },0);
  }
  cancelarSolicitudPago(p:any){
    if(!p?.id_pago||p.estado_pago!=='Pendiente')return;
    if(!confirm('¿Cancelar este registro pendiente del flujo anterior?'))return;
    this.api.cancelarSolicitudPago(Number(p.id_pago)).subscribe({
      next:r=>{this.ok(r.mensaje||'Registro cancelado');this.api.pagosCliente().subscribe(x=>this.pagos=x);},
      error:e=>this.error=this.errorApi(e)
    });
  }
  imprimirBoleta(c:any){
    if(!c)return;

    const empresa=c?.empresa||{};
    const periodoInicio=c?.periodo?.inicio||c?.periodo?.fecha_inicio||'-';
    const periodoFin=c?.periodo?.fin||c?.periodo?.fecha_fin||'-';
    const numero=String(c?.numero_comprobante||('B001-'+String(c?.id_pago||'').padStart(8,'0')));
    const monto=Math.max(0,Number(c?.monto||0));
    const gravado=monto/1.18;
    const igv=monto-gravado;

    const entidades:Record<string,string>={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'};
    const safe=(v:any)=>String(v??'').replace(/[&<>"']/g,(m:string)=>entidades[m]||m);

    const fechaRaw=String(c?.fecha||c?.fecha_pago||'');
    let fechaTexto=fechaRaw||'-';
    let horaTexto='-';
    if(fechaRaw){
      const d=new Date(fechaRaw);
      if(!isNaN(d.getTime())){
        fechaTexto=d.toLocaleDateString('es-PE',{day:'2-digit',month:'2-digit',year:'numeric'});
        horaTexto=d.toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'});
      }
    }

    const unidades=[
      '', 'UNO','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE',
      'DIEZ','ONCE','DOCE','TRECE','CATORCE','QUINCE','DIECISÉIS','DIECISIETE','DIECIOCHO','DIECINUEVE','VEINTE'
    ];
    const decenas=['','','VEINTE','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA'];
    const centenas=['','CIENTO','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS','SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];
    const enteroLetras=(n:number):string=>{
      n=Math.max(0,Math.floor(n));
      if(n===0)return 'CERO';
      if(n===100)return 'CIEN';
      if(n<21)return unidades[n];
      if(n<30)return 'VEINTI'+unidades[n-20];
      if(n<100){
        const d=Math.floor(n/10),u=n%10;
        return decenas[d]+(u?' Y '+unidades[u]:'');
      }
      if(n<1000){
        const cen=Math.floor(n/100),r=n%100;
        return centenas[cen]+(r?' '+enteroLetras(r):'');
      }
      if(n<1000000){
        const miles=Math.floor(n/1000),r=n%1000;
        const pref=miles===1?'MIL':enteroLetras(miles)+' MIL';
        return pref+(r?' '+enteroLetras(r):'');
      }
      return String(n);
    };

    const centimos=Math.round((monto-Math.floor(monto))*100);
    const montoLetras=enteroLetras(Math.floor(monto))+' CON '+String(centimos).padStart(2,'0')+'/100 SOLES';

    const ruc=String(empresa.ruc||'').trim();
    const rucValido=/^\d{11}$/.test(ruc);
    const documentoTitulo=rucValido ? 'BOLETA DE VENTA ELECTRÓNICA' : 'BOLETA DE VENTA';

    const qrContenido=[
      'MALLQUI GYM',
      'COMPROBANTE '+numero,
      'DNI '+String(c?.dni||''),
      'FECHA '+fechaTexto,
      'TOTAL '+monto.toFixed(2),
      'OPERACION '+String(c?.numero_operacion||'')
    ].join('|');
    const qrUrl='https://quickchart.io/qr?size=280&margin=1&text='+encodeURIComponent(qrContenido);

    const html=`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${safe(numero)} - Mallqui Gym</title>
<style>
  @page{size:A4 portrait;margin:8mm}
  *{box-sizing:border-box}
  html,body{margin:0;padding:0;background:#fff;color:#000}
  body{
    font-family:"Courier New",Courier,monospace;
    font-size:11px;
    line-height:1.25;
    -webkit-print-color-adjust:exact;
    print-color-adjust:exact;
  }
  .ticket{
    width:104mm;
    margin:0 auto;
    padding:4mm 5mm 6mm;
    background:#fff;
  }
  .center{text-align:center}
  .empresa{
    font-size:15px;
    font-weight:900;
    line-height:1.08;
    text-transform:uppercase;
  }
  .empresa-sub{
    margin-top:2px;
    font-size:10px;
    font-weight:700;
    line-height:1.2;
    text-transform:uppercase;
  }
  .ruc{
    margin-top:3px;
    font-size:11px;
    font-weight:900;
  }
  .contacto{
    margin-top:2px;
    font-size:9px;
    line-height:1.25;
  }
  .doc-title{
    margin-top:7px;
    font-size:12px;
    font-weight:900;
    text-transform:uppercase;
  }
  .numero{
    margin-top:2px;
    font-size:12px;
    font-weight:900;
  }
  .buyer{
    margin-top:9px;
    font-size:10px;
    line-height:1.45;
  }
  .buyer b{
    font-size:11px;
    font-weight:900;
  }
  .row{
    display:grid;
    grid-template-columns:42mm 1fr;
    gap:3mm;
    margin-top:2px;
  }
  .label{font-weight:900}
  .sep{
    border-top:1px solid #000;
    margin:8px 0 6px;
  }
  table{
    width:100%;
    border-collapse:collapse;
    table-layout:fixed;
  }
  thead{
    border-top:1px solid #000;
    border-bottom:1px solid #000;
  }
  th{
    padding:5px 2px;
    font-size:9px;
    font-weight:900;
    text-align:left;
  }
  td{
    padding:6px 2px;
    font-size:9px;
    vertical-align:top;
  }
  .cant{width:12%}
  .descripcion{width:50%}
  .pu{width:18%;text-align:right}
  .totalcol{width:20%;text-align:right}
  .desc-main{font-weight:900}
  .desc-sub{
    display:block;
    margin-top:2px;
    font-size:8px;
    line-height:1.25;
  }
  .totals{
    margin-top:8px;
    border-top:1px solid #000;
    border-bottom:1px solid #000;
    padding:5px 0;
  }
  .total-line{
    display:grid;
    grid-template-columns:1fr 13mm 23mm;
    gap:2mm;
    align-items:center;
    padding:2px 0;
    font-size:11px;
    font-weight:900;
  }
  .total-line span:nth-child(2),
  .total-line span:nth-child(3){text-align:right}
  .importe{
    margin-top:7px;
    font-size:10px;
    font-weight:900;
  }
  .detalle{
    margin-top:6px;
    font-size:9px;
    line-height:1.35;
  }
  .detalle b{font-weight:900}
  .footer{
    margin-top:8px;
    padding-top:6px;
    border-top:1px solid #000;
    text-align:center;
    font-size:8px;
    line-height:1.35;
  }
  .qr{
    margin-top:7px;
    text-align:center;
    min-height:48mm;
  }
  .qr img{
    width:46mm;
    height:46mm;
    object-fit:contain;
    image-rendering:pixelated;
  }
  .qr-fallback{
    margin-top:4px;
    font-size:7px;
    word-break:break-all;
  }
  .nota-legal{
    margin-top:5px;
    font-size:7px;
    line-height:1.25;
    font-weight:700;
  }
  @media print{
    html,body{width:auto!important;min-width:0!important;background:#fff!important}
    .ticket{
      width:104mm!important;
      max-width:104mm!important;
      margin:0 auto!important;
      padding:0!important;
    }
  }
</style>
</head>
<body>
<section class="ticket">
  <header class="center">
    <div class="empresa">${safe(empresa.nombre||'MALLQUI GYM')}</div>
    <div class="empresa-sub">${safe(empresa.direccion||'JR. LOS LAURELES MZ 17 LT 18')}<br>PUCALLPA - UCAYALI - PERÚ</div>
    ${rucValido ? '<div class="ruc">RUC '+safe(ruc)+'</div>' : ''}
    <div class="contacto">
      ${empresa.telefono ? 'TELÉFONO '+safe(empresa.telefono) : 'TELÉFONO 939398148'}
      ${empresa.correo ? '<br>'+safe(empresa.correo) : ''}
    </div>
    <div class="doc-title">${safe(documentoTitulo)}</div>
    <div class="numero">${safe(numero)}</div>
  </header>

  <section class="buyer">
    <b>ADQUIRIENTE</b>
    <div><span class="label">DNI:</span> ${safe(c?.dni||'-')}</div>
    <div><span class="label">NOMBRE:</span> ${safe(c?.cliente||'-')}</div>
    <div><span class="label">FECHA EMISIÓN:</span> ${safe(fechaTexto)} &nbsp; ${safe(horaTexto)}</div>
    <div><span class="label">VIGENCIA HASTA:</span> ${safe(periodoFin)}</div>
    <div><span class="label">MONEDA:</span> SOLES</div>
    <div><span class="label">IGV:</span> 18.00 %</div>
  </section>

  <div class="sep"></div>

  <table>
    <thead>
      <tr>
        <th class="cant">[ CANT. ]</th>
        <th class="descripcion">DESCRIPCIÓN</th>
        <th class="pu">P/U</th>
        <th class="totalcol">TOTAL</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="cant">[ 1 ]</td>
        <td class="descripcion">
          <span class="desc-main">MEMBRESÍA ${safe(c?.membresia||'MALLQUI GYM')}</span>
          <span class="desc-sub">Servicio de gimnasio</span>
          <span class="desc-sub">Periodo: ${safe(periodoInicio)} al ${safe(periodoFin)}</span>
          <span class="desc-sub">Código: ${safe(String(c?.id_pago||numero).replace(/\D/g,'').slice(-12)||'-')}</span>
        </td>
        <td class="pu">${monto.toFixed(2)}</td>
        <td class="totalcol">${monto.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <section class="totals">
    <div class="total-line"><span>GRAVADA</span><span>S/</span><span>${gravado.toFixed(2)}</span></div>
    <div class="total-line"><span>IGV</span><span>S/</span><span>${igv.toFixed(2)}</span></div>
    <div class="total-line"><span>TOTAL</span><span>S/</span><span>${monto.toFixed(2)}</span></div>
  </section>

  <div class="importe">IMPORTE EN LETRAS: ${safe(montoLetras)}</div>

  <section class="detalle">
    <div><b>FORMA DE PAGO:</b> ${safe(c?.metodo_pago||'CONTADO')}</div>
    <div><b>COND. VENTA:</b> CONTADO</div>
    <div><b>N° OPERACIÓN:</b> ${safe(c?.numero_operacion||'-')}</div>
    <div><b>OBSERVACIONES:</b> MEMBRESÍA REGISTRADA EN MALLQUI GYM.</div>
  </section>

  <footer class="footer">
    Representación impresa de la ${safe(documentoTitulo)}.<br>
    Conserva este comprobante como constancia de tu pago.
    <div class="qr">
      <img src="${safe(qrUrl)}" alt="Código QR del comprobante">
      <div class="qr-fallback">${safe(numero)}</div>
    </div>
    <div class="nota-legal">
      ${rucValido
        ? 'La validez tributaria electrónica depende de la emisión autorizada e integración con SUNAT.'
        : 'RUC no configurado. Este documento funciona como constancia interna hasta completar la emisión electrónica autorizada.'}
    </div>
  </footer>
</section>

<script>
  window.addEventListener('load',function(){
    setTimeout(function(){window.print();},700);
  });
<\/script>
</body>
</html>`;

    const w=window.open('','_blank');
    if(w){w.document.write(html);w.document.close();}
  }

  comprobante(p:any){
    this.api.comprobantePagoCliente(p.id_pago).subscribe({
      next:r=>this.imprimirBoleta(r.comprobante),
      error:e=>this.error=this.errorApi(e)
    });
  }
  cerrarSesion(){this.auth.logout().subscribe({next:()=>{this.auth.limpiarSesion();this.router.navigate(['/login']);},error:()=>{this.auth.limpiarSesion();this.router.navigate(['/login']);}});}
  ok(m:string){this.error='';this.toast='✓ '+m;setTimeout(()=>this.toast='',2600);}
  errorApi(e:any):string{const er=e?.error?.errors;if(er){const p=Object.values(er)[0];if(Array.isArray(p))return String(p[0]);}return e?.error?.mensaje??e?.error?.message??'No se pudo completar la operación.';}
}
