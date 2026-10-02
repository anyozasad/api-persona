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
      <header class="member-topbar member-enter-down">
        <div class="member-top-row">
          <button type="button" class="member-brand" (click)="abrirModulo('inicio')" aria-label="Ir al inicio del portal">
            <img src="assets/mallqui-logo.svg" alt="Mallqui Gym">
            <span><b>MALLQUI <strong>GYM</strong></b><small>Tu espacio de entrenamiento</small></span>
          </button>

          <nav class="member-nav member-nav-primary" aria-label="Navegación principal del cliente">
            <button type="button" class="nav-step nav-step-inicio" [class.active]="navPrincipalActivo==='inicio'" [attr.aria-current]="navPrincipalActivo==='inicio' ? 'page' : null" (click)="abrirModulo('inicio')">
              <i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-7h5v7"/></svg></i><span>Inicio</span>
            </button>
            <button type="button" class="nav-step nav-step-entrenar" [class.active]="navPrincipalActivo==='entrenar'" [attr.aria-current]="navPrincipalActivo==='entrenar' ? 'page' : null" (click)="abrirModulo('casa')">
              <i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-7 12h6l-1 8 7-12h-6z"/></svg></i><span>Entrenar</span>
            </button>
            <button type="button" class="nav-step nav-step-rutinas" [class.active]="navPrincipalActivo==='rutinas'" [attr.aria-current]="navPrincipalActivo==='rutinas' ? 'page' : null" (click)="abrirModulo('rutinas')">
              <i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8v8M3 10v4M19 8v8M21 10v4M7 12h10"/></svg></i><span>Rutinas</span>
            </button>
            <button type="button" class="nav-step nav-step-clases nav-step-polished" [class.active]="navPrincipalActivo==='clases'" [attr.aria-current]="navPrincipalActivo==='clases' ? 'page' : null" (click)="abrirModulo('clases')">
              <i><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/><path d="M8 14h3M13 14h3M8 17h3"/></svg></i><span>Clases</span>
            </button>
            <button type="button" class="nav-step nav-step-progreso" [class.active]="navPrincipalActivo==='progreso'" [attr.aria-current]="navPrincipalActivo==='progreso' ? 'page' : null" (click)="abrirModulo('progreso')">
              <i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10h4v10zM10 20V4h4v16zM16 20V7h4v13z"/><path d="m4 7 5-3 4 2 6-4"/></svg></i><span>Progreso</span>
            </button>
          </nav>

          <div class="member-user-actions">
            <div class="member-system-status" [class.offline]="!dbConectada" [title]="dbConectada ? 'Angular conectado con Laravel y '+dbMotor : 'Sin conexión con la base de datos'">
              <i></i>
              <span>{{dbConectada ? 'Datos en línea' : 'Sin conexión'}}</span>
            </div>
            <button type="button" class="member-alert-button" [class.active]="moduloActivo==='avisos'" (click)="abrirModulo('avisos')" aria-label="Abrir avisos">
              <span class="member-bell-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M10 21h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </span>
              <b *ngIf="avisosNoLeidos>0">{{avisosNoLeidos>9 ? '9+' : avisosNoLeidos}}</b>
            </button>
            <div class="member-mini-profile">
              <span>{{nombreCorto.charAt(0).toUpperCase()}}</span>
              <div><b>{{nombreCorto}}</b><small>{{membresiaActual?.membresia?.nombre || 'Cliente Mallqui'}}</small></div>
            </div>
            <button class="member-logout" type="button" (click)="cerrarSesion()">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5"/><path d="M14 8l4 4-4 4M18 12H9"/></svg>
              <span>Salir</span>
            </button>
          </div>
        </div>

        <div class="member-subnav">
          <div class="member-subnav-scroll">
            <button type="button" [class.active]="moduloActivo==='calendario'" (click)="abrirModulo('calendario')"><i><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/><path d="M8 14h3M13 14h3M8 17h3"/></svg></i> Calendario</button>
            <button type="button" [class.active]="moduloActivo==='reservas'" (click)="abrirModulo('reservas')"><i><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg></i> Reservas</button>
            <button type="button" [class.active]="moduloActivo==='asistencias'" (click)="abrirModulo('asistencias')"><i><svg viewBox="0 0 24 24"><path d="m5 12 4 4 10-10"/></svg></i> Asistencias</button>
            <button type="button" [class.active]="moduloActivo==='club'" (click)="abrirModulo('club')"><i><svg viewBox="0 0 24 24"><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg></i> Acceso al gym</button>
            <button type="button" [class.active]="moduloActivo==='pagos'" (click)="abrirModulo('pagos')"><i><svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/></svg></i> Membresía</button>
            <button type="button" [class.active]="moduloActivo==='soporte'" (click)="abrirModulo('soporte')"><i><svg viewBox="0 0 24 24"><path d="M9.5 9a3 3 0 1 1 4.8 2.4c-1.5 1.1-2.3 1.8-2.3 3.1"/><path d="M12 18h.01"/></svg></i> Ayuda</button>
            <button type="button" [class.active]="moduloActivo==='perfil'" (click)="abrirModulo('perfil')"><i><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3"/><path d="M5 20c.7-4 3.1-6 7-6s6.3 2 7 6"/></svg></i> Perfil</button>
          </div>

          <button type="button" class="member-membership-chip" (click)="abrirModulo('pagos')">
            <span>{{membresiaActual ? '✓' : '!'}}</span>
            <div><small>{{membresiaActual ? 'MENSUALIDAD ACTIVA' : 'MEMBRESÍA'}}</small><b>{{membresiaActual?.membresia?.nombre || 'Activar membresía'}}</b></div>
            <em>→</em>
          </button>
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

        <section *ngIf="!['inicio','casa','rutinas','clases','progreso'].includes(moduloActivo)" class="member-page-context">
          <div>
            <span>MI ESPACIO · MALLQUI GYM</span>
            <h2>{{tituloModuloActual}}</h2>
            <p>{{subtituloModuloActual}}</p>
          </div>
          <button type="button" (click)="abrirModulo('inicio')">⌂ Volver al inicio</button>
        </section>

        <section *ngIf="moduloActivo==='inicio'" class="member-dashboard dashboard-showcase-v30">
          <div class="showcase-bg-carousel" aria-hidden="true">
            <img class="showcase-bg-slide showcase-bg-slide-1"
                 src="https://images.unsplash.com/photo-1641337221253-fdc7237f6b61?auto=format&fit=crop&w=3200&q=95"
                 alt=""
                 fetchpriority="high"
                 decoding="async">
            <img class="showcase-bg-slide showcase-bg-slide-2"
                 src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=3200&q=92"
                 alt=""
                 decoding="async">
            <img class="showcase-bg-slide showcase-bg-slide-3"
                 src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=3200&q=92"
                 alt=""
                 decoding="async">
            <img class="showcase-bg-slide showcase-bg-slide-4"
                 src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=3200&q=92"
                 alt=""
                 decoding="async">
          </div>
          <div class="showcase-bg-vignette" aria-hidden="true"></div>

          <section class="showcase-hero-grid">
            <article class="showcase-hero-main">
              <img class="showcase-hero-photo" src="https://images.unsplash.com/photo-1641337221253-fdc7237f6b61?auto=format&fit=crop&w=3200&q=95" alt="" aria-hidden="true">
              <div class="showcase-hero-shade"></div>
              <div class="showcase-hero-copy">
                <span class="showcase-eyebrow">TU ESPACIO PERSONAL</span>
                <h1>Bienvenido, <strong>{{nombreCorto}}</strong></h1>
                <p>Entrena, revisa tu progreso y organiza tus próximas actividades desde un solo lugar.</p>

                <div class="showcase-hero-actions">
                  <button type="button" class="showcase-btn showcase-btn-primary" (click)="abrirModulo('casa')">
                    <i>▶</i>
                    <span><b>Entrenar en el gym</b><small>Sesión guiada en sala</small></span>
                    <em>→</em>
                  </button>
                  <button type="button" class="showcase-btn showcase-btn-secondary" (click)="abrirModulo('rutinas')">
                    <i class="showcase-line-icon"><svg viewBox="0 0 24 24"><path d="M5 8v8M3 10v4M19 8v8M21 10v4M7 12h10"/></svg></i><b>Mis rutinas</b>
                  </button>
                  <button type="button" class="showcase-btn showcase-btn-secondary" (click)="abrirModulo('clases')">
                    <i class="showcase-line-icon"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/><path d="M8 14h3M13 14h3M8 17h3"/></svg></i><b>Ver clases</b>
                  </button>
                </div>
              </div>

              <div class="showcase-quote gym-owner-phrase">
                <span>“</span>
                <b>{{gymInfo?.frase_publicitaria || 'Ven, entrena con Mallqui Gym con el propósito de tener una vida saludable.'}}</b>
              </div>

              <div class="showcase-kpis">
                <button type="button" class="showcase-kpi kpi-red" (click)="abrirModulo('asistencias')">
                  <i class="showcase-kpi-icon"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/><path d="m8 15 2 2 5-5"/></svg></i>
                  <span><small>Asistencias</small><b>{{showcaseAsistencias}}</b><em>este mes</em></span>
                  <mark>Mes actual</mark>
                </button>

                <button type="button" class="showcase-kpi kpi-orange" (click)="abrirModulo('rutinas')">
                  <i class="showcase-kpi-icon"><svg viewBox="0 0 24 24"><path d="M5 8v8M3 10v4M19 8v8M21 10v4M7 12h10"/></svg></i>
                  <span><small>Rutinas</small><b>{{showcaseRutinas}}</b><em>asignadas</em></span>
                  <mark>Asignadas</mark>
                </button>

                <button type="button" class="showcase-kpi kpi-purple" (click)="abrirModulo('reservas')">
                  <i class="showcase-kpi-icon"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/><path d="M8 14h3M13 14h3"/></svg></i>
                  <span><small>Reservas</small><b>{{showcaseReservas}}</b><em>activas</em></span>
                  <mark>Vigentes</mark>
                </button>

                <button type="button" class="showcase-kpi kpi-green" (click)="abrirModulo('progreso')">
                  <i class="showcase-kpi-icon"><svg viewBox="0 0 24 24"><path d="M4 20V11h4v9zM10 20V6h4v14zM16 20V3h4v17z"/></svg></i>
                  <span><small>Progreso</small><b>{{showcaseProgreso}}%</b><em>actividad mensual</em></span>
                  <mark>Calculado</mark>
                </button>
              </div>
            </article>

            <aside class="showcase-coach-panel">
              <div class="showcase-coach-head">
                <b><svg class="coach-title-icon" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3"/><path d="M5 20c.7-4 3.1-6 7-6s6.3 2 7 6"/></svg> Mi entrenador</b>
                <span><i></i>{{rutinaActual?.entrenador ? 'Asignado' : 'Sin asignar'}}</span>
              </div>

              <div class="showcase-coach-profile">
                <img src="https://images.unsplash.com/photo-1581009137042-c552e485697a?auto=format&fit=crop&w=500&q=86" alt="Entrenador de gimnasio">
                <div>
                  <h3>{{rutinaActual?.entrenador ? nombreEntrenador : 'Sin entrenador asignado'}}</h3>
                  <p>{{rutinaActual?.entrenador ? 'Consulta la rutina e indicaciones registradas por tu entrenador.' : 'Cuando el gimnasio te asigne un entrenador, sus datos y rutina aparecerán aquí.'}}</p>
                </div>
              </div>

              <div class="showcase-coach-tools">
                <button type="button" (click)="abrirModulo('soporte')"><i><svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-8 8 9 9 0 0 1-4-.9L3 21l1.8-5A8 8 0 1 1 21 12z"/></svg></i><span>Chat</span></button>
                <button type="button" (click)="abrirModulo('calendario')"><i><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/><path d="M8 14h3M13 14h3"/></svg></i><span>Agendar</span></button>
                <button type="button" (click)="abrirModulo('rutinas')"><i><svg viewBox="0 0 24 24"><circle cx="12" cy="7" r="3"/><path d="M5 20c.7-4 3.1-6 7-6s6.3 2 7 6"/><path d="M8 13h8"/></svg></i><span>Ver rutinas</span></button>
              </div>

              <button type="button" class="showcase-coach-start" (click)="abrirModulo('casa')">
                <i>▶</i><span>Iniciar entrenamiento</span><em>→</em>
              </button>
            </aside>
          </section>

          <section class="showcase-overview-grid">
            <article class="showcase-membership-card">
              <div class="membership-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 7 4.2 4L12 5l4.8 6L21 7l-2 11H5z"/><path d="M6 21h12"/></svg></div>
              <div class="membership-copy">
                <span>{{membresiaActual ? 'MEMBRESÍA ACTIVA' : 'MEMBRESÍA'}}</span>
                <h2>{{membresiaActual?.membresia?.nombre || 'Sin membresía activa'}}</h2>
                <p>{{membresiaActual ? ('Válido hasta: ' + fechaCortaPortal(membresiaActual.fecha_fin)) : 'Consulta las mensualidades disponibles para activar tu acceso.'}}</p>
              </div>
              <div class="membership-actions">
                <span><i></i>{{membresiaActual ? 'Activa' : 'Sin mensualidad'}}</span>
                <button type="button" (click)="abrirModulo('pagos')">{{membresiaActual ? 'Ver detalles' : 'Ver mensualidades'}} <em>→</em></button>
              </div>
            </article>

            <article class="showcase-class-card">
              <div class="showcase-card-head">
                <b>◫ Próxima clase reservada</b>
                <button type="button" (click)="abrirModulo('reservas')">Ver todas <span>→</span></button>
              </div>

              <div class="showcase-class-content">
                <img src="assets/showcase/class-showcase.svg" alt="Clase de entrenamiento">
                <div class="showcase-class-info">
                  <h3>{{reservasActivas[0]?.clase?.nombre || 'Sin reserva próxima'}}</h3>
                  <div class="showcase-class-meta">
                    <p><span>◫</span>{{reservasActivas.length ? fechaCortaPortal(reservasActivas[0]?.fecha_clase) : 'Reserva una clase'}}</p>
                    <p><span>◷</span>{{reservasActivas[0]?.clase?.hora_inicio || 'Horario por confirmar'}}</p>
                    <p><span>⌖</span>{{reservasActivas[0]?.clase?.sala || 'Sala por confirmar'}}</p>
                  </div>
                </div>
              </div>
            </article>

            <article class="showcase-progress-card">
              <div class="showcase-card-head">
                <b>Tu progreso mensual</b>
                <button type="button" (click)="abrirModulo('progreso')">Ver más <span>→</span></button>
              </div>
              <div class="showcase-progress-body">
                <div class="showcase-progress-ring" [style.background]="'conic-gradient(#ff2746 0 '+showcaseProgreso+'%, #193a58 '+showcaseProgreso+'% 100%)'">
                  <div><b>{{showcaseProgreso}}%</b></div>
                </div>
                <div class="showcase-progress-list">
                  <p><i class="dot-blue"></i><span>Sesiones completadas</span><b>{{historialCasa.length}}</b></p>
                  <p><i class="dot-green"></i><span>Asistencias este mes</span><b>{{showcaseAsistencias}}</b></p>
                  <p><i class="dot-red"></i><span>Reservas activas</span><b>{{showcaseReservas}}</b></p>
                </div>
              </div>
            </article>
          </section>

          <section class="showcase-bottom-grid">
            <article class="showcase-quick-card">
              <h2>Accesos rápidos</h2>
              <div class="showcase-quick-grid">
                <button type="button" (click)="abrirModulo('calendario')"><i class="quick-red"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/><path d="M8 14h3M13 14h3M8 17h3"/></svg></i><b>Calendario</b><small>Ver horarios</small></button>
                <button type="button" (click)="abrirModulo('reservas')"><i class="quick-blue"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg></i><b>Reservas</b><small>Mis reservas</small></button>
                <button type="button" (click)="abrirModulo('rutinas')"><i class="quick-orange"><svg viewBox="0 0 24 24"><path d="M5 8v8M3 10v4M19 8v8M21 10v4M7 12h10"/></svg></i><b>Mis rutinas</b><small>Ver y entrenar</small></button>
                <button type="button" (click)="abrirModulo('clases')"><i class="quick-purple"><svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2.5 20c.5-4 2.5-6 5.5-6s5 2 5.5 6M10.5 20c.5-4 2.5-6 5.5-6s5 2 5.5 6"/></svg></i><b>Clases</b><small>Explorar clases</small></button>
                <button type="button" (click)="abrirModulo('progreso')"><i class="quick-green"><svg viewBox="0 0 24 24"><path d="M4 20V11h4v9zM10 20V6h4v14zM16 20V3h4v17z"/></svg></i><b>Mi progreso</b><small>Estadísticas</small></button>
                <button type="button" (click)="abrirModulo('club')"><i class="quick-gold"><svg viewBox="0 0 24 24"><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg></i><b>Acceso al gym</b><small>Credencial y beneficios</small></button>
                <button type="button" (click)="abrirModulo('soporte')"><i class="quick-cyan"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.7 9.4a2.6 2.6 0 1 1 4.2 2.1c-1.3 1-1.9 1.6-1.9 2.8"/><path d="M12 17.6h.01"/></svg></i><b>Ayuda</b><small>Soporte</small></button>
              </div>
            </article>

            <article class="showcase-profile-card">
              <div class="showcase-profile-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3"/><path d="M5 20c.7-4 3.1-6 7-6s6.3 2 7 6"/></svg></div>
              <div class="showcase-profile-copy">
                <h2>{{perfilCompleto ? 'Tu perfil está completo' : 'Completa tus datos'}}</h2>
                <p>{{perfilCompleto ? 'Tu información está lista para usar todas las funciones.' : 'Agrega teléfono y dirección para una mejor experiencia.'}}</p>
                <div class="showcase-profile-progress">
                  <i [style.width.%]="porcentajeInicio"></i>
                </div>
              </div>
              <b class="showcase-profile-percent">{{porcentajeInicio}}%</b>
              <button type="button" (click)="abrirModulo('perfil')">{{perfilCompleto ? 'Ver perfil' : 'Completar perfil'}} <span>→</span></button>
            </article>
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
                  <span>🏋 Rutina asignada</span>
                  <span>✓ Datos del cliente</span>
                  <span>◷ Descansos</span>
                  <span>▦ Progreso</span>
                </div>

                <div class="train-gym-statusbar">
                  <div>
                    <small>MEMBRESÍA</small>
                    <b>{{membresiaActual?.membresia?.nombre || 'Sin membresía activa'}}</b>
                  </div>
                  <div>
                    <small>RUTINA</small>
                    <b>{{rutinaActual?.nombre_rutina || 'Sin rutina asignada'}}</b>
                  </div>
                  <div>
                    <small>ENTRENADOR</small>
                    <b>{{rutinaActual?.entrenador ? nombreEntrenador : 'Sin entrenador asignado'}}</b>
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
                          (click)="iniciarEntrenamientoCasa()"
                          [disabled]="!puedeEntrenarRutinaGym">
                    <span>▶</span>
                    <div>
                      <b>{{puedeEntrenarRutinaGym ? 'Iniciar mi rutina' : 'Rutina no disponible'}}</b>
                      <small>{{!membresiaActual ? 'Necesitas una membresía activa' : (!tieneRutinaAsignadaGym ? 'El entrenador debe asignarte una rutina' : 'Entrenamiento registrado en Mallqui Gym')}}</small>
                    </div>
                    <em>→</em>
                  </button>
                  <button type="button" class="train-ux-secondary" (click)="abrirModulo('rutinas')">
                    <span>🏋</span><b>Ver mi rutina registrada</b>
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
              <div class="train-step" [class.active]="!!membresiaActual">
                <span>1</span>
                <div><small>ACCESO</small><b>Membresía</b><p>{{membresiaActual ? 'Membresía activa' : 'Sin membresía activa'}}</p></div>
                <em *ngIf="membresiaActual">✓</em>
              </div>
              <i>›</i>
              <div class="train-step" [class.active]="tieneRutinaAsignadaGym">
                <span>2</span>
                <div><small>PLANIFICACIÓN</small><b>Rutina asignada</b><p>{{tieneRutinaAsignadaGym ? rutinaActual?.nombre_rutina : 'Pendiente del entrenador'}}</p></div>
                <em *ngIf="tieneRutinaAsignadaGym">✓</em>
              </div>
              <i>›</i>
              <div class="train-step" [class.active]="puedeEntrenarRutinaGym">
                <span>3</span>
                <div><small>EJECUCIÓN</small><b>Entrenar en sala</b><p>Series, repeticiones, carga y descansos</p></div>
                <em *ngIf="puedeEntrenarRutinaGym">LISTO</em>
              </div>
            </section>
          </section>

          <section class="gym-session-flow" *ngIf="!sesionCasaActiva && !sesionCasaTerminada">
            <article>
              <span>1</span>
              <div><small>INGRESO</small><b>Asistencia</b><p>Tu visita al gimnasio queda registrada en el módulo de Asistencias.</p></div>
            </article>
            <article>
              <span>2</span>
              <div><small>PREPARACIÓN</small><b>Calentamiento</b><p>Realiza una preparación breve antes de comenzar la rutina principal.</p></div>
            </article>
            <article>
              <span>3</span>
              <div><small>RUTINA EN SALA</small><b>Máquinas y pesas</b><p>Sigue ejercicios con equipo, series, repeticiones y descansos.</p></div>
            </article>
            <article>
              <span>4</span>
              <div><small>CIERRE</small><b>Guardar sesión</b><p>Al terminar, la sesión queda registrada en tu Progreso e Historial.</p></div>
            </article>
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
            <p>La sección Entrenar no crea ejercicios por su cuenta. Para que los requisitos funcionales sean reales, la rutina debe estar registrada para tu cliente por el administrador o entrenador. Cuando la asignen, aquí aparecerán sus ejercicios, series, repeticiones, carga, descanso e indicaciones.</p>
            <div class="empty-actions">
              <button type="button" class="empty-primary" (click)="abrirModulo('rutinas')">
                <span>🏋</span><b>Revisar mis rutinas</b>
              </button>
              <button type="button" class="empty-secondary" (click)="abrirModulo('soporte')">
                <span>?</span><b>Consultar al gimnasio</b>
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
                <article><i>▣</i><div><strong>{{clases.length}}</strong><small>clases disponibles</small></div></article>
                <article><i>◷</i><div><strong>{{reservasActivas.length}}</strong><small>reservas activas</small></div></article>
                <article><i>✓</i><div><strong>{{showcaseAsistencias}}</strong><small>asistencias del mes</small></div></article>
              </div>
              <button type="button" class="portal-side-link" (click)="actualizarSeccion('clases')">
                <span>Actualizar horarios</span><b>↻</b>
              </button>
            </aside>
          </section>

          <div class="module-window-title">
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

        <section *ngIf="moduloActivo==='reservas'" class="member-module member-enter-up">
          <div class="member-module-hero reservations-hero">
            <div><span>AGENDA PERSONAL</span><h1>Mis reservas</h1><p>Consulta y administra las clases que reservaste.</p></div>
            <button type="button" class="module-refresh-btn" (click)="sincronizarDatosCliente()" [disabled]="actualizandoModulo">
              {{actualizandoModulo ? 'Actualizando...' : '↻ Actualizar'}}
            </button>
            <div class="module-hero-icon">◷</div>
          </div>

          <section class="client-rf-summary">
            <article><small>ACTIVAS</small><b>{{reservasActivas.length}}</b><span>Reservadas</span></article>
            <article><small>ASISTIDAS</small><b>{{reservasAsistidas}}</b><span>Clases completadas</span></article>
            <article><small>CANCELADAS</small><b>{{reservasCanceladas}}</b><span>Historial</span></article>
          </section>

          <div class="member-reservation-list">
            <article *ngFor="let r of reservas">
              <span class="reservation-mark">◷</span>
              <div><small>CLASE</small><h3>{{r.clase?.nombre || 'Clase'}}</h3><p>{{fecha(r.fecha_clase)}} · {{r.clase?.hora_inicio}}</p></div>
              <em [class.cancelled]="r.estado!=='Reservada'">{{r.estado}}</em>
              <button *ngIf="r.estado==='Reservada'" type="button" (click)="cancelarReserva(r)">Cancelar reserva</button>
            </article>

            <article class="member-empty-card member-empty-guided" *ngIf="!reservas.length">
              <span>◷</span><h3>Todavía no tienes reservas</h3><p>Elige una clase disponible o continúa con tu entrenamiento en el gimnasio.</p>
              <div class="empty-actions">
                <button type="button" class="empty-primary" (click)="abrirModulo('clases')">Ver clases</button>
                <button type="button" class="empty-secondary" (click)="abrirModulo('casa')">Entrenar en el gym</button>
              </div>
            </article>
          </div>
        </section>

        <section *ngIf="moduloActivo==='asistencias'" class="member-module member-enter-up">
          <div class="member-module-hero hero-photo hero-photo-asistencias">
            <div><span>HISTORIAL</span><h1>Mis asistencias</h1><p>Consulta tus entradas y salidas registradas en el gimnasio.</p></div>
            <button type="button" class="module-refresh-btn" (click)="sincronizarDatosCliente()" [disabled]="actualizandoModulo">
              {{actualizandoModulo ? 'Actualizando...' : '↻ Actualizar'}}
            </button>
            <div class="module-hero-icon">✓</div>
          </div>

          <section class="client-rf-summary">
            <article><small>ESTE MES</small><b>{{asistenciasMesActual}}</b><span>Visitas registradas</span></article>
            <article><small>TOTAL</small><b>{{asistencias.length}}</b><span>Historial completo</span></article>
            <article><small>ESTADO ACTUAL</small><b>{{asistenciaAbierta ? 'Dentro' : 'Fuera'}}</b><span>{{asistenciaAbierta ? 'Ingreso abierto' : 'Sin ingreso abierto'}}</span></article>
          </section>

          <div class="attendance-timeline">
            <article *ngFor="let a of asistencias">
              <span class="timeline-dot"></span>
              <div>
                <small>ENTRADA</small>
                <h3>{{fecha(a.fecha_hora_entrada)}}</h3>
                <p>{{a.fecha_hora_salida ? ('Salida: '+fecha(a.fecha_hora_salida)) : 'Salida pendiente · actualmente dentro del gimnasio'}}</p>
              </div>
              <em>{{a.estado || (a.fecha_hora_salida ? 'Completada' : 'En curso')}}</em>
            </article>

            <article class="member-empty-card member-empty-guided" *ngIf="!asistencias.length">
              <span>✓</span><h3>Tu historial empieza desde cero</h3>
              <p>Las visitas y tus sesiones de entrenamiento dentro del gimnasio aparecerán aquí.</p>
              <div class="empty-actions">
                <button type="button" class="empty-primary" (click)="abrirModulo('casa')">Ver entrenamiento en el gym</button>
                <button type="button" class="empty-secondary" (click)="abrirModulo('clases')">Buscar clases</button>
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
                <h2>{{membresiaActual?.membresia?.nombre || 'Sin mensualidad activa'}}</h2>
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
                    <b>{{p.cliente_membresia?.membresia?.nombre || 'Membresía'}}</b>
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

  ngOnInit():void{ this.cargarEstadoSistema(); this.cargar(); }
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

    if(m==='casa'&&!this.casaCargado)this.cargarEntrenamientoCasa();
    if(m==='avisos')this.cargarContadorAvisos();

    // Reservas, asistencias, membresía y perfil siempre se vuelven a consultar
    // al abrir el módulo para que la interfaz no muestre información antigua.
    if(['reservas','asistencias','pagos','perfil'].includes(m)){
      this.sincronizarDatosCliente(false);
    }

    window.scrollTo({top:0,behavior:'smooth'});
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

  get rutinaActual():any{return this.resumen?.rutina_actual || this.rutinas.find(r=>r.estado==='Activo') || null;}
  get nombreEntrenador():string{return this.nombrePersona(this.rutinaActual?.entrenador) || 'Sin entrenador asignado';}
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

  nombrePersona(p:any):string{return p?[`${p.nombres||''}`,`${p.apellidos||''}`].join(' ').trim():'-';}
  fecha(v:any):string{if(!v)return '-';const d=new Date(v);return isNaN(d.getTime())?String(v):d.toLocaleString('es-PE');}

  cargarEntrenamientoCasa():void{
    this.api.entrenamientoCasaCliente().subscribe({
      next:r=>{
        const rutina=r?.rutina||null;
        this.resumen={...(this.resumen||{}),rutina_actual:rutina};

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
          this.resumen={...(this.resumen||{}),membresia_actual:this.membresiaActual};
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
    const barcode=code128Svg(String(c?.codigo_barras||numero),{height:64,module:2,quiet:14,text:true});
    const entidades:Record<string,string>={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'};
    const safe=(v:any)=>String(v??'').replace(/[&<>"']/g,(m:string)=>entidades[m]||m);
    const html=`<!doctype html><html><head><meta charset="utf-8"><title>${safe(numero)} - Mallqui Gym</title><style>
      body{font-family:Arial,sans-serif;background:#eef2f4;color:#172b3a;padding:28px}
      .receipt{max-width:720px;margin:auto;background:#fff;border:1px solid #d8e0e5;border-radius:16px;padding:28px;box-shadow:0 12px 34px rgba(20,45,65,.12)}
      .head{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #142f44;padding-bottom:18px}
      .brand h1{margin:0;color:#102f4b}.brand p{margin:5px 0;color:#667a88;font-size:13px}.doc{text-align:right}.doc b{display:block;font-size:18px}.doc span{font-size:13px;color:#5f7483}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:20px 0}.box{background:#f6f8fa;padding:12px;border-radius:10px}.box small{display:block;color:#738795;font-size:10px;font-weight:700}.box b{display:block;margin-top:4px}
      table{width:100%;border-collapse:collapse;margin:18px 0}th,td{padding:12px;border-bottom:1px solid #dce4e9;text-align:left}th{font-size:11px;color:#607482}.amount{text-align:right;font-size:22px;font-weight:800}
      .barcode{text-align:center;border:1px dashed #c9d4da;border-radius:12px;padding:14px;margin-top:18px}.note{font-size:10px;color:#6f808a;margin-top:12px;line-height:1.5}
      @media print{body{background:#fff;padding:0}.receipt{box-shadow:none;border:0}}
    </style></head><body><section class="receipt">
      <div class="head"><div class="brand"><h1>${safe(empresa.nombre||'Mallqui Gym')}</h1><p>RUC: ${safe(empresa.ruc||'No configurado')}</p><p>${safe(empresa.direccion||'Dirección no configurada')}</p><p>${safe(empresa.telefono||'')} ${empresa.correo ? ' · '+safe(empresa.correo) : ''}</p></div>
      <div class="doc"><b>BOLETA DE MEMBRESÍA</b><span>${safe(numero)}</span><p>${safe(c.fecha||c.fecha_pago||'-')}</p></div></div>
      <div class="grid">
        <div class="box"><small>CLIENTE</small><b>${safe(c.cliente||'-')}</b></div>
        <div class="box"><small>DNI</small><b>${safe(c.dni||'-')}</b></div>
        <div class="box"><small>MÉTODO DE PAGO</small><b>${safe(c.metodo_pago||'-')}</b></div>
        <div class="box"><small>N° OPERACIÓN</small><b>${safe(c.numero_operacion||'-')}</b></div>
      </div>
      <table><thead><tr><th>CONCEPTO</th><th>PERIODO</th><th style="text-align:right">IMPORTE</th></tr></thead><tbody>
        <tr><td>Membresía ${safe(c.membresia||'Mallqui Gym')}</td><td>${safe(periodoInicio)} al ${safe(periodoFin)}</td><td class="amount">S/ ${Number(c.monto||0).toFixed(2)}</td></tr>
      </tbody></table>
      <div class="barcode">${barcode}</div>
      <p class="note">${safe(c.nota_tributaria||'Comprobante interno generado por Mallqui Gym.')}</p>
    </section><script>window.print()<\/script></body></html>`;
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
