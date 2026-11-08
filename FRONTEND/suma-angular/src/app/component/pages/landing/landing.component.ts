import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
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
      <svg class="mq-photo-filters" aria-hidden="true" focusable="false">
        <defs>
          <filter id="mq-photo-sharpen" x="-4%" y="-4%" width="108%" height="108%" color-interpolation-filters="sRGB">
            <feConvolveMatrix
              order="3"
              kernelMatrix="0 -0.32 0 -0.32 2.28 -0.32 0 -0.32 0"
              divisor="1"
              bias="0"
              targetX="1"
              targetY="1"
              edgeMode="duplicate"
              preserveAlpha="true">
            </feConvolveMatrix>
          </filter>
        </defs>
      </svg>
      <header class="mq-topbar">
        <div class="mq-shell mq-nav">
          <nav class="mq-menu" aria-label="Navegación principal">
            <a href="#inicio" (click)="irA('inicio', $event)">INICIO</a>
            <a href="#entrenamiento" (click)="irA('entrenamiento', $event)">ENTRENAMIENTO</a>
            <a href="#entrenador" (click)="irA('entrenador', $event)">SOBRE MÍ</a>
            <a href="#victorias" (click)="irA('victorias', $event)">VICTORIAS</a>
            <a href="#gimnasio" (click)="irA('gimnasio', $event)">GIMNASIO</a>
            <a routerLink="/clases-gym">RESERVAR SESIÓN</a>
            <a routerLink="/planes">PLANES Y PRECIOS</a>
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
        <section id="inicio" class="mq-hero">
          <img
            *ngFor="let imagen of heroImages; let i = index"
            class="mq-hero-bg"
            [class.mq-hero-bg-active]="i === heroIndex"
            [src]="imagen"
            alt=""
            aria-hidden="true"
            decoding="async"
            loading="eager"
            [attr.fetchpriority]="i === 0 ? 'high' : 'low'">
          <div class="mq-hero-overlay"></div>
          <div class="mq-shell mq-hero-content">
            <p class="mq-overline">ENTRENA CON MALLQUI GYM</p>
            <h1>MALLQUI <strong>GYM</strong></h1>
            <p class="mq-hero-sub">ENTRENA CON PROPÓSITO. SUPERA TUS LÍMITES.</p>
            <div class="mq-hero-actions">
              <a class="mq-btn mq-btn-reserva" routerLink="/clases-gym">Reservar sesión</a>
            </div>
          </div>

          <button class="mq-hero-nav-arrow mq-hero-nav-prev"
                  type="button"
                  aria-label="Imagen anterior del gimnasio"
                  (click)="cambiarHero((heroIndex + heroImages.length - 1) % heroImages.length)">&#8592;</button>
          <button class="mq-hero-nav-arrow mq-hero-nav-next"
                  type="button"
                  aria-label="Siguiente imagen del gimnasio"
                  (click)="cambiarHero((heroIndex + 1) % heroImages.length)">&#8594;</button>

          <div class="mq-hero-dots" role="group" aria-label="Imágenes del gimnasio">
            <button *ngFor="let img of heroImages; let i = index"
                    type="button"
                    [class.active]="i === heroIndex"
                    [attr.aria-label]="'Mostrar imagen ' + (i + 1)"
                    [attr.aria-pressed]="i === heroIndex"
                    (click)="cambiarHero(i)"></button>
          </div>
        </section>

        <section id="entrenamiento" class="mq-levels">
          <article class="mq-level-card mq-level-beginner">
            <img
              class="mq-level-photo"
              src="/assets/mallqui/mallqui-beginner-ai-4k.webp"
              alt="Entrenamiento para principiantes en Mallqui Gym"
              decoding="sync"
              fetchpriority="high">
            <div class="mq-level-shade"></div>
            <div class="mq-level-content">
              <h2>PRINCIPIANTES</h2>
              <a class="mq-circle-arrow" routerLink="/clases-gym">›</a>
            </div>
          </article>
          <article class="mq-level-card mq-level-pro">
            <img
              class="mq-level-photo"
              src="/assets/mallqui/mallqui-pro-ai-4k.webp"
              alt="Entrenamiento profesional en Mallqui Gym"
              decoding="sync"
              fetchpriority="high">
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
            src="/assets/mallqui/mallqui-trainer-ai-4k.webp"
            alt="Entrenador de Mallqui Gym">
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
              <img [src]="foto.img" [alt]="foto.alt" loading="lazy" decoding="async">
              <span>{{foto.texto}}</span>
            </button>
          </div>
        </section>

        <section id="gimnasio" class="mq-gym">
          <img
            class="mq-gym-bg"
            src="/assets/mallqui/mallqui-gym-ai.png?v=ai-final-20261105"
            alt=""
            aria-hidden="true"
            decoding="sync"
            fetchpriority="high">
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
            <img [src]="fotosGaleria[galeriaActiva].img" [alt]="fotosGaleria[galeriaActiva].alt">
          </div>

          <div class="mq-lightbox-copy">
            <h3>{{fotosGaleria[galeriaActiva].texto}}</h3>
            <p>{{fotosGaleria[galeriaActiva].descripcion}}</p>
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
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  gymInfo: any = {};
  toast = '';
  heroIndex = 0;
  galeriaActiva: number | null = null;
  chatAbierto = false;
  mensajeChat = '';
  mensajesChat: Array<{tipo:'usuario'|'gym'; texto:string}> = [];
  private heroTimer?: ReturnType<typeof setInterval>;
  private toastTimer?: ReturnType<typeof setTimeout>;
  private readonly hashChangeHandler = (): void => {
    const id = window.location.hash.replace('#', '').trim();
    if (id) {
      this.scrollToSection(id, 'smooth');
    }
  };

  private readonly parallaxHandler = (): void => {
    const hero = document.querySelector('.mq-hero') as HTMLElement | null;
    const training = document.getElementById('entrenamiento');

    if (hero) {
      const heroOffset = Math.min(72, window.scrollY * 0.14);
      hero.style.setProperty('--mq-hero-parallax', `${heroOffset}px`);
    }

    if (training) {
      const rect = training.getBoundingClientRect();
      const distanceFromCenter = rect.top + (rect.height / 2) - (window.innerHeight / 2);
      const trainingOffset = Math.max(-52, Math.min(52, -distanceFromCenter * 0.08));
      training.style.setProperty('--mq-training-parallax', `${trainingOffset}px`);
    }
  };

  // Imágenes locales en alta definición, sin dependencias de Internet.
  heroImages = [
    '/assets/mallqui/mallqui-fondo-referencia-exacto.webp',
    '/assets/mallqui/mallqui-referencia-gym-equipos-4k.webp',
    '/assets/mallqui/mallqui-hero-interior-4k.webp'
  ];

  // Cuatro tarjetas sin mosaicos: cada tarjeta muestra UNA foto original del ZIP.
  galeria = [
    {
      img: 'assets/mallqui/fotos-reales/foto-32.jpg',
      indiceFoto: 31,
      alt: 'Equipos y máquinas reales del gimnasio Mallqui',
      texto: 'EQUIPOS Y MÁQUINAS',
      descripcion: 'Máquinas de entrenamiento y vista interior real de Mallqui Gym.'
    },
    {
      img: 'assets/mallqui/fotos-reales/foto-12.jpg',
      indiceFoto: 11,
      alt: 'Suplementos disponibles en el local',
      texto: 'PRODUCTOS Y LOCAL',
      descripcion: 'Productos y suplementos fotografiados en Mallqui Gym.'
    },
    {
      img: 'assets/mallqui/fotos-reales/foto-23.jpg',
      indiceFoto: 22,
      alt: 'Entrenador real de Mallqui Gym',
      texto: 'LOCAL Y ENTRENADOR',
      descripcion: 'El entrenador y las instalaciones reales del gimnasio.'
    },
    {
      img: 'assets/mallqui/fotos-reales/foto-05.jpg',
      indiceFoto: 4,
      alt: 'Personas entrenando dentro de Mallqui Gym',
      texto: 'MÁS DE MALLQUI GYM',
      descripcion: 'Ambiente, socios y equipos del gimnasio en fotografías reales.'
    }
  ];

  // Los 34 archivos originales del ZIP pueden verse completos en el visor.
  fotosGaleria = Array.from({ length: 34 }, (_, indice) => {
    const numero = indice + 1;
    const productos = (numero >= 9 && numero <= 17) || (numero >= 29 && numero <= 31) || numero >= 33;
    const entrenador = numero >= 23 && numero <= 28;
    const titulo = productos
      ? 'PRODUCTOS DE MALLQUI GYM'
      : entrenador
        ? 'ENTRENADOR DE MALLQUI GYM'
        : 'INSTALACIONES DE MALLQUI GYM';
    return {
      img: `assets/mallqui/fotos-reales/foto-${String(numero).padStart(2, '0')}.jpg`,
      alt: `Fotografía real ${numero} de Mallqui Gym`,
      texto: titulo,
      descripcion: `Foto ${numero} de 34 · Imagen original del gimnasio, sin mosaicos.`
    };
  });

  clases = [
    {
      id_clase: 0,
      codigo_servicio: 'inicial',
      nombre: 'Entrenamiento inicial',
      descripcion: 'Aprende técnica, postura y una rutina segura para comenzar.',
      nivel: 'Principiante',
      horario: 'Según agenda',
      img: 'assets/mallqui/mallqui-cover.webp'
    },
    {
      id_clase: 0,
      codigo_servicio: 'fuerza',
      nombre: 'Fuerza y masa muscular',
      descripcion: 'Trabajo progresivo con cargas para mejorar fuerza e hipertrofia.',
      nivel: 'Intermedio',
      horario: 'Según agenda',
      img: 'assets/mallqui/mallqui-cover.webp'
    },
    {
      id_clase: 0,
      codigo_servicio: 'avanzado',
      nombre: 'Acondicionamiento avanzado',
      descripcion: 'Sesiones intensas orientadas a rendimiento y resistencia.',
      nivel: 'Avanzado',
      horario: 'Según agenda',
      img: 'assets/mallqui/mallqui-cover.webp'
    }
  ];

  planes = [
    { id_membresia: 0, nombre: 'Mensualidad 1 mes', precio: 80, duracion_meses: 1, destacado: false, items: ['Acceso al gimnasio', 'Orientación del personal', 'Control de asistencias'] },
    { id_membresia: 0, nombre: 'Promoción 2 meses', precio: 120, duracion_meses: 2, destacado: true, items: ['Acceso por 2 meses', 'Orientación del personal', 'Control de asistencias'] },
    { id_membresia: 0, nombre: 'Promoción 3 meses', precio: 150, duracion_meses: 3, destacado: false, items: ['Acceso por 3 meses', 'Orientación del personal', 'Control de asistencias'] }
  ];

  constructor(private api: GymApiService) {}

  ngOnInit(): void {
    this.api.informacionGym().subscribe({
      next: (r: any) => {
        this.gymInfo = r || {};
        const clasesApi = Array.isArray(r?.clases) ? r.clases : [];
        if (clasesApi.length) {
          const fotos = [
            'assets/mallqui/mallqui-cover.webp',
            'assets/mallqui/mallqui-cover.webp',
            'assets/mallqui/mallqui-cover.webp'
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

    this.iniciarCarruselHero();
  }

  ngAfterViewInit(): void {
    // Quitar foco residual al regresar desde otra pantalla para que ningún botón quede "activado".
    setTimeout(() => {
      const activo = document.activeElement as HTMLElement | null;
      activo?.blur?.();
    }, 0);

    window.addEventListener('hashchange', this.hashChangeHandler);
    window.addEventListener('scroll', this.parallaxHandler, { passive: true });
    this.parallaxHandler();

    const id = window.location.hash.replace('#', '').trim();
    if (id) {
      setTimeout(() => this.scrollToSection(id, 'auto', true), 60);
    } else {
      setTimeout(() => this.activarEntrada('inicio'), 80);
    }

  }

  ngOnDestroy(): void {
    window.removeEventListener('hashchange', this.hashChangeHandler);
    window.removeEventListener('scroll', this.parallaxHandler);
    if (this.heroTimer) clearInterval(this.heroTimer);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    document.body.style.overflow = '';
  }

  private iniciarCarruselHero(): void {
    if (this.heroTimer) clearInterval(this.heroTimer);
    if (this.heroImages.length < 2 || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    this.heroTimer = setInterval(() => {
      this.heroIndex = (this.heroIndex + 1) % this.heroImages.length;
    }, 6000);
  }

  cambiarHero(index: number): void {
    if (index < 0 || index >= this.heroImages.length) return;
    this.heroIndex = index;
    this.iniciarCarruselHero();
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

    if (window.location.hash !== '#' + id) {
      window.history.pushState(null, '', '#' + id);
    }

    setTimeout(() => this.scrollToSection(id, 'smooth'), 0);
  }

  private activarEntrada(id: string): void {
    const section = document.getElementById(id);
    if (!section) return;

    const permitidas = ['inicio','entrenamiento','entrenador','victorias','gimnasio','contacto'];
    if (!permitidas.includes(id)) return;

    section.classList.remove('mq-section-enter');
    void section.offsetWidth;
    section.classList.add('mq-section-enter');
  }

  private scrollToSection(id: string, behavior: ScrollBehavior = 'smooth', animarSeccion = true): void {
    const section = document.getElementById(id);
    if (!section) return;

    if (animarSeccion) {
      this.activarEntrada(id);
    }

    const header = document.querySelector('.mq-topbar') as HTMLElement | null;
    const headerHeight = header?.offsetHeight || 0;
    const top = section.getBoundingClientRect().top + window.scrollY - headerHeight;

    window.scrollTo({
      top: Math.max(0, top),
      left: 0,
      behavior
    });
  }

  abrirGaleria(index: number): void {
    this.galeriaActiva = this.galeria[index]?.indiceFoto ?? 0;
    document.body.style.overflow = 'hidden';
  }

  cerrarGaleria(): void {
    this.galeriaActiva = null;
    document.body.style.overflow = '';
  }

  galeriaAnterior(): void {
    if (this.galeriaActiva === null) return;
    this.galeriaActiva = (this.galeriaActiva - 1 + this.fotosGaleria.length) % this.fotosGaleria.length;
  }

  galeriaSiguiente(): void {
    if (this.galeriaActiva === null) return;
    this.galeriaActiva = (this.galeriaActiva + 1) % this.fotosGaleria.length;
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
