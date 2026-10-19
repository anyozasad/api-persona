import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GymApiService } from '../../../core/services/gym-api.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  styleUrls: ['../mallqui-landing.css'],
  template: `
    <div class="mq-public-home">
      <header class="mq-topbar">
        <div class="mq-shell mq-nav">
          <nav class="mq-menu" aria-label="Navegación principal">
            <a href="#inicio" (click)="irA('inicio', $event)">INICIO</a>
            <a href="#entrenamiento" (click)="irA('entrenamiento', $event)">ENTRENAMIENTO</a>
            <a href="#entrenador" (click)="irA('entrenador', $event)">SOBRE MÍ</a>
            <a href="#gimnasio" (click)="irA('gimnasio', $event)">GIMNASIO</a>
            <a class="mq-nav-action" routerLink="/clases-gym">RESERVAR SESIÓN</a>
            <a class="mq-nav-action" routerLink="/planes">PLANES Y PRECIOS</a>
            <a href="#contacto" (click)="irA('contacto', $event)">CONTACTO</a>
          </nav>

          <a class="mq-login" routerLink="/login">
            <span class="mq-user-icon" aria-hidden="true">
              <span class="mq-user-head"></span>
              <span class="mq-user-body"></span>
            </span>
            <span>Login</span>
          </a>
        </div>
      </header>

      <main>
        <section id="inicio" class="mq-hero" [style.backgroundImage]="'url(' + heroActual + ')'">
          <div class="mq-hero-overlay"></div>
          <div class="mq-shell mq-hero-content">
            <p class="mq-overline">ENTRENA CON MALLQUI GYM</p>
            <h1>MALLQUI <strong>GYM</strong></h1>
            <p class="mq-hero-sub">ENTRENA CON PROPÓSITO. SUPERA TUS LÍMITES.</p>
            <div class="mq-hero-actions">
              <a class="mq-btn mq-btn-reserva" routerLink="/clases-gym">Reservar sesión</a>
            </div>
          </div>

          <div class="mq-hero-dots" aria-hidden="true">
            <button *ngFor="let img of heroImages; let i = index"
                    type="button"
                    [class.active]="i === heroIndex"
                    (click)="cambiarHero(i)"></button>
          </div>
        </section>

        <section id="entrenamiento" class="mq-levels">
          <article class="mq-level-card mq-level-beginner">
            <div class="mq-level-shade"></div>
            <div class="mq-level-content">
              <h2>PRINCIPIANTES</h2>
              <a class="mq-circle-arrow" routerLink="/clases-gym">›</a>
            </div>
          </article>
          <article class="mq-level-card mq-level-pro">
            <div class="mq-level-shade"></div>
            <div class="mq-level-content">
              <h2>PROFESIONALES</h2>
              <a class="mq-circle-arrow" routerLink="/clases-gym">›</a>
            </div>
          </article>
        </section>

        <section id="entrenador" class="mq-coach">
          <img
            class="mq-coach-bg"
            src="https://images.unsplash.com/photo-1639504031468-081c8219bb8a?auto=format&fit=crop&w=2000&q=90"
            alt="Entrenador realizando ejercicio en barra">
          <div class="mq-coach-overlay"></div>

          <div class="mq-shell mq-coach-content">
            <div class="mq-coach-copy">
              <p class="mq-section-label">SOBRE MÍ</p>
              <h2>CONOCE AL<br>ENTRENADOR</h2>

              <p>
                En Mallqui Gym te acompañamos para que entrenes de forma segura,
                ordenada y de acuerdo con tu nivel.
              </p>

              <p>
                Cada rutina se adapta a tus objetivos y a tu progreso para que
                avances con técnica, constancia y disciplina.
              </p>
            </div>
          </div>
        </section>

        <section id="victorias" class="mq-victories">
          <div class="mq-gallery-cta">
            <p>COMIENZA HOY A ENTRENAR</p>
            <a routerLink="/clases-gym">Reservar sesión</a>
          </div>

          <div class="mq-gallery">
            <button
              type="button"
              class="mq-gallery-item"
              *ngFor="let foto of galeria; let i = index"
              [class.mq-gallery-wide]="i === 1 || i === 4"
              (click)="abrirGaleria(i)"
              [attr.aria-label]="'Abrir ' + foto.texto">
              <img [src]="foto.img" [alt]="foto.alt">
              <span>{{foto.texto}}</span>
            </button>
          </div>
        </section>

        <section id="gimnasio" class="mq-gym">
          <div class="mq-gym-overlay"></div>
          <div class="mq-shell mq-gym-content">
            <p class="mq-section-label light">MALLQUI GYM</p>
            <h2>GIMNASIO</h2>
            <p class="mq-gym-intro">
              Un espacio preparado para entrenar fuerza, resistencia, tonificación y acondicionamiento físico.
            </p>

            <div class="mq-gym-info">
              <article>
                <small>DIRECCIÓN</small>
                <b>{{gymInfo?.direccion || 'Jr. Los Laureles Mz 17 Lt 18'}}</b>
                <span>{{gymInfo?.referencia || 'Referencia: Plaza de Laura Bosso'}}</span>
              </article>
              <article>
                <small>HORARIO</small>
                <b>Lunes a domingo</b>
                <span>{{gymInfo?.horario_detalle || 'Atención mañana y tarde según horario del gimnasio.'}}</span>
              </article>
              <article>
                <small>TELÉFONO</small>
                <b>{{gymInfo?.telefono || '939398148'}}</b>
                <a [href]="'tel:' + (gymInfo?.telefono || '939398148')">Llamar ahora</a>
              </article>
            </div>
          </div>
        </section>

        <section id="contacto" class="mq-contact">
          <div class="mq-shell mq-contact-grid">
            <div class="mq-contact-copy">
              <p class="mq-section-label dark">CONTACTO</p>
              <h2>ESCRIBE O LLÁMAME SI<br>TIENES ALGUNA PREGUNTA.</h2>
              <a *ngIf="gymInfo?.correo" [href]="'mailto:' + gymInfo.correo">{{gymInfo.correo}}</a>
              <a [href]="'tel:' + (gymInfo?.telefono || '939398148')">{{gymInfo?.telefono || '939398148'}}</a>
              <p>{{gymInfo?.direccion || 'Jr. Los Laureles Mz 17 Lt 18'}}</p>
            </div>

            <form class="mq-contact-form" (submit)="enviarContacto($event)">
              <div class="mq-form-row">
                <label>Nombre *
                  <input name="nombre" required>
                </label>
                <label>Apellido *
                  <input name="apellido" required>
                </label>
              </div>
              <label>Email *
                <input name="email" type="email" required>
              </label>
              <label>Asunto
                <input name="asunto">
              </label>
              <label>Mensaje
                <textarea name="mensaje" rows="4" required></textarea>
              </label>
              <button type="submit">Enviar</button>
            </form>
          </div>

          <div class="mq-shell mq-contact-bottom">
            <div class="mq-socials" aria-label="Redes sociales">
              <button type="button" aria-label="Facebook">f</button>
              <button type="button" aria-label="X">𝕏</button>
              <button type="button" aria-label="Instagram">◎</button>
            </div>

            <button
              type="button"
              class="mq-back-top"
              aria-label="Volver arriba"
              title="Volver arriba"
              (click)="volverArriba()">⌃</button>

            <div class="mq-copyright">© 2026 MALLQUI GYM · PUCALLPA, PERÚ</div>
          </div>
        </section>
      </main>

      <div
        class="mq-lightbox"
        *ngIf="galeriaActiva !== null"
        (click)="cerrarGaleria()"
        role="dialog"
        aria-modal="true"
        aria-label="Galería Mallqui Gym">
        <div class="mq-lightbox-inner" (click)="$event.stopPropagation()">
          <button type="button" class="mq-lightbox-close" aria-label="Cerrar" (click)="cerrarGaleria()">×</button>

          <button type="button" class="mq-lightbox-arrow prev" aria-label="Imagen anterior" (click)="galeriaAnterior()">‹</button>

          <div class="mq-lightbox-photo">
            <img [src]="galeria[galeriaActiva].img" [alt]="galeria[galeriaActiva].alt">
          </div>

          <div class="mq-lightbox-copy">
            <h3>{{galeria[galeriaActiva].texto}}</h3>
            <p>{{galeria[galeriaActiva].descripcion}}</p>
            <a routerLink="/clases-gym" (click)="cerrarGaleria()">Reservar sesión</a>
          </div>

          <button type="button" class="mq-lightbox-arrow next" aria-label="Imagen siguiente" (click)="galeriaSiguiente()">›</button>
        </div>
      </div>

      <section class="mq-chat-panel" *ngIf="chatAbierto" aria-label="Chat Mallqui Gym">
        <header class="mq-chat-header">
          <div>
            <strong>Mallqui Gym</strong>
            <span><i></i> Te responderemos tan pronto como podamos.</span>
          </div>
          <button type="button" aria-label="Cerrar chat" (click)="chatAbierto=false">×</button>
        </header>

        <div class="mq-chat-messages">
          <div class="mq-chat-welcome">
            <strong>¡Hola! 👋</strong>
            <p>Bienvenido a Mallqui Gym. Escríbenos tu consulta y te ayudaremos.</p>
          </div>

          <div
            *ngFor="let m of mensajesChat"
            class="mq-chat-message"
            [class.usuario]="m.tipo==='usuario'"
            [class.gym]="m.tipo==='gym'">
            {{m.texto}}
          </div>
        </div>

        <form class="mq-chat-input" (submit)="enviarChat($event)">
          <input
            name="mensajeChat"
            [(ngModel)]="mensajeChat"
            placeholder="Escribe tu mensaje..."
            autocomplete="off">
          <button type="submit" aria-label="Enviar mensaje">➤</button>
        </form>
      </section>

      <button
        type="button"
        class="mq-chat-float"
        aria-label="Abrir chat"
        title="Chat"
        [class.open]="chatAbierto"
        (click)="chatAbierto=!chatAbierto">
        <span class="mq-chat-bubble" aria-hidden="true">
          <i></i>
          <i></i>
        </span>
      </button>

      <div class="mq-toast" *ngIf="toast">{{toast}}</div>
    </div>
  `
})
export class LandingComponent implements OnInit, OnDestroy {
  gymInfo: any = {};
  toast = '';
  heroIndex = 0;
  galeriaActiva: number | null = null;
  chatAbierto = false;
  mensajeChat = '';
  mensajesChat: Array<{tipo:'usuario'|'gym'; texto:string}> = [];
  private heroTimer?: ReturnType<typeof setInterval>;
  private toastTimer?: ReturnType<typeof setTimeout>;

  heroImages = [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2000&q=90',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=2000&q=90',
    'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=2000&q=90'
  ];

  galeria = [
    { img: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=900&q=85', alt: 'Entrenamiento de fuerza', texto: 'FUERZA', descripcion: 'Entrena fuerza con técnica, constancia y una progresión adecuada a tu nivel.' },
    { img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=85', alt: 'Entrenamiento funcional', texto: 'DISCIPLINA', descripcion: 'La disciplina convierte cada sesión en un paso más hacia tu objetivo.' },
    { img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=85', alt: 'Trabajo con pesas', texto: 'PROGRESO', descripcion: 'Registra tu avance y mejora poco a poco con un entrenamiento organizado.' },
    { img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=85', alt: 'Entrenamiento intenso', texto: 'CONSTANCIA', descripcion: 'Mantener la constancia es la base para conseguir cambios sostenibles.' },
    { img: 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?auto=format&fit=crop&w=1200&q=85', alt: 'Gimnasio y pesas', texto: 'SUPERACIÓN', descripcion: 'Cada entrenamiento es una oportunidad para superar tu propio rendimiento.' },
    { img: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=900&q=85', alt: 'Entrenamiento profesional', texto: 'RESULTADOS', descripcion: 'Los resultados llegan con un plan claro, buena técnica y continuidad.' }
  ];

  clases = [
    {
      id_clase: 0,
      codigo_servicio: 'inicial',
      nombre: 'Entrenamiento inicial',
      descripcion: 'Aprende técnica, postura y una rutina segura para comenzar.',
      nivel: 'Principiante',
      horario: 'Según agenda',
      img: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=900&q=85'
    },
    {
      id_clase: 0,
      codigo_servicio: 'fuerza',
      nombre: 'Fuerza y masa muscular',
      descripcion: 'Trabajo progresivo con cargas para mejorar fuerza e hipertrofia.',
      nivel: 'Intermedio',
      horario: 'Según agenda',
      img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=85'
    },
    {
      id_clase: 0,
      codigo_servicio: 'avanzado',
      nombre: 'Acondicionamiento avanzado',
      descripcion: 'Sesiones intensas orientadas a rendimiento y resistencia.',
      nivel: 'Avanzado',
      horario: 'Según agenda',
      img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=85'
    }
  ];

  planes = [
    { id_membresia: 0, nombre: 'Mensualidad 1 mes', precio: 80, duracion_meses: 1, destacado: false, items: ['Acceso al gimnasio', 'Orientación del personal', 'Control de asistencias'] },
    { id_membresia: 0, nombre: 'Promoción 2 meses', precio: 120, duracion_meses: 2, destacado: true, items: ['Acceso por 2 meses', 'Orientación del personal', 'Control de asistencias'] },
    { id_membresia: 0, nombre: 'Promoción 3 meses', precio: 150, duracion_meses: 3, destacado: false, items: ['Acceso por 3 meses', 'Orientación del personal', 'Control de asistencias'] }
  ];

  constructor(private api: GymApiService) {}

  get heroActual(): string {
    return this.heroImages[this.heroIndex] || this.heroImages[0];
  }

  ngOnInit(): void {
    this.api.informacionGym().subscribe({
      next: (r: any) => {
        this.gymInfo = r || {};
        const clasesApi = Array.isArray(r?.clases) ? r.clases : [];
        if (clasesApi.length) {
          const fotos = [
            'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=85'
          ];

          this.clases = clasesApi.slice(0, 3).map((clase: any, index: number) => ({
            id_clase: Number(clase.id_clase || 0),
            nombre: clase.nombre || 'Clase Mallqui Gym',
            descripcion: clase.descripcion || 'Sesión programada de Mallqui Gym.',
            nivel: clase.entrenador?.especialidad || 'Todos los niveles',
            horario: [clase.dia_semana, String(clase.hora_inicio || '').slice(0, 5)]
              .filter(Boolean)
              .join(' · '),
            img: fotos[index % fotos.length]
          }));
        }

        const membresias = Array.isArray(r?.membresias) ? r.membresias : [];
        if (membresias.length) {
          this.planes = membresias.map((m: any, index: number) => ({
            id_membresia: Number(m.id_membresia || 0),
            nombre: m.nombre,
            precio: Number(m.precio || 0),
            duracion_meses: Number(m.duracion_meses || 1),
            destacado: Number(m.duracion_meses || 1) === 2 || index === 1,
            items: Array.isArray(m.beneficios) && m.beneficios.length
              ? m.beneficios
              : [m.descripcion || 'Acceso al gimnasio', 'Orientación del personal', 'Control de asistencias']
          }));
        }
      },
      error: () => {}
    });

    this.heroTimer = setInterval(() => {
      this.heroIndex = (this.heroIndex + 1) % this.heroImages.length;
    }, 5500);
  }

  ngOnDestroy(): void {
    if (this.heroTimer) clearInterval(this.heroTimer);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    document.body.style.overflow = '';
  }

  cambiarHero(index: number): void {
    this.heroIndex = index;
  }

  volverArriba(): void {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  irA(id: string, event?: Event): void {
    event?.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  abrirGaleria(index: number): void {
    this.galeriaActiva = index;
    document.body.style.overflow = 'hidden';
  }

  cerrarGaleria(): void {
    this.galeriaActiva = null;
    document.body.style.overflow = '';
  }

  galeriaAnterior(): void {
    if (this.galeriaActiva === null) return;
    this.galeriaActiva = (this.galeriaActiva - 1 + this.galeria.length) % this.galeria.length;
  }

  galeriaSiguiente(): void {
    if (this.galeriaActiva === null) return;
    this.galeriaActiva = (this.galeriaActiva + 1) % this.galeria.length;
  }

  enviarChat(event: Event): void {
    event.preventDefault();
    const texto = this.mensajeChat.trim();
    if (!texto) return;

    this.mensajesChat.push({ tipo: 'usuario', texto });
    this.mensajeChat = '';

    setTimeout(() => {
      this.mensajesChat.push({
        tipo: 'gym',
        texto: 'Gracias por escribirnos. Hemos recibido tu mensaje y te responderemos lo antes posible.'
      });
    }, 450);
  }

  enviarContacto(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    this.mostrarToast('Mensaje preparado. También puedes comunicarte directamente con Mallqui Gym por teléfono.');
    form.reset();
  }

  private mostrarToast(mensaje: string): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast = mensaje;
    this.toastTimer = setTimeout(() => this.toast = '', 4200);
  }
}
