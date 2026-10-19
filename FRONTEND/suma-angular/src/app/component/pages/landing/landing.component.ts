import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GymApiService } from '../../../core/services/gym-api.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrls: ['../mallqui-landing.css'],
  template: `
    <div class="mq-public-home">
      <header class="mq-topbar">
        <div class="mq-shell mq-nav">
          <a class="mq-brand" href="#inicio" (click)="irA('inicio', $event)" aria-label="Mallqui Gym - Inicio">
            <img src="assets/mallqui-logo.png" alt="Mallqui Gym">
            <span>MALLQUI GYM</span>
          </a>

          <nav class="mq-menu" aria-label="Navegación principal">
            <a href="#inicio" (click)="irA('inicio', $event)">INICIO</a>
            <a href="#entrenamiento" (click)="irA('entrenamiento', $event)">ENTRENAMIENTO</a>
            <a href="#entrenador" (click)="irA('entrenador', $event)">SOBRE MÍ</a>
            <a href="#victorias" (click)="irA('victorias', $event)">VICTORIAS</a>
            <a href="#gimnasio" (click)="irA('gimnasio', $event)">GIMNASIO</a>
            <a href="#clases" (click)="irA('clases', $event)">RESERVAR SESIÓN</a>
            <a href="#planes" (click)="irA('planes', $event)">PLANES Y PRECIOS</a>
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
              <a class="mq-btn mq-btn-reserva" routerLink="/login" [queryParams]="{ destino: 'reservas' }">Reservar sesión</a>
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
              <button type="button" class="mq-circle-arrow" (click)="irA('clases')">›</button>
            </div>
          </article>
          <article class="mq-level-card mq-level-pro">
            <div class="mq-level-shade"></div>
            <div class="mq-level-content">
              <h2>PROFESIONALES</h2>
              <button type="button" class="mq-circle-arrow" (click)="irA('clases')">›</button>
            </div>
          </article>
        </section>

        <section id="entrenador" class="mq-coach">
          <div class="mq-shell mq-coach-grid">
            <div class="mq-coach-copy">
              <p class="mq-section-label">ACOMPAÑAMIENTO</p>
              <h2>CONOCE AL<br><strong>ENTRENADOR</strong></h2>
              <p>
                En Mallqui Gym recibes orientación para entrenar de forma clara y ordenada.
                El acompañamiento se adapta a tu nivel, objetivo y ritmo de progreso.
              </p>
              <div class="mq-coach-facts">
                <span><b>01</b> entrenador principal</span>
                <span><b>03</b> niveles de trabajo</span>
                <span><b>100%</b> enfoque personal</span>
              </div>
              <a class="mq-text-link" routerLink="/login">INGRESAR A MI CUENTA →</a>
            </div>
            <div class="mq-coach-photo" role="img" aria-label="Entrenador en gimnasio"></div>
          </div>
        </section>

        <section id="victorias" class="mq-victories">
          <div class="mq-shell">
            <div class="mq-section-title">
              <p class="mq-section-label">DISCIPLINA · CONSTANCIA · PROGRESO</p>
              <h2>VICTORIAS</h2>
            </div>
          </div>
          <div class="mq-gallery">
            <figure *ngFor="let foto of galeria; let i = index" [class.mq-gallery-wide]="i === 1 || i === 4">
              <img [src]="foto.img" [alt]="foto.alt">
              <figcaption>{{foto.texto}}</figcaption>
            </figure>
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

        <section id="clases" class="mq-classes">
          <div class="mq-shell">
            <div class="mq-section-title centered">
              <p class="mq-section-label">ELIGE TU ENTRENAMIENTO</p>
              <h2>MIS CLASES</h2>
            </div>

            <div class="mq-class-grid">
              <article *ngFor="let c of clases">
                <img [src]="c.img" [alt]="c.nombre">
                <div class="mq-class-body">
                  <h3>{{c.nombre}}</h3>
                  <p>{{c.descripcion}}</p>
                  <div class="mq-class-meta">
                    <span>{{c.nivel}}</span>
                    <span>{{c.horario}}</span>
                  </div>
                  <a routerLink="/login" [queryParams]="{ destino: 'reservas' }">Reservar sesión</a>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="planes" class="mq-pricing">
          <div class="mq-shell">
            <div class="mq-section-title centered">
              <p class="mq-section-label">ENTRENA A TU RITMO</p>
              <h2>PLANES Y PRECIOS</h2>
            </div>

            <div class="mq-plan-grid">
              <article *ngFor="let p of planes; let i = index" [class.featured]="p.destacado || i === 1">
                <span class="mq-plan-badge" *ngIf="p.destacado || i === 1">RECOMENDADO</span>
                <h3>{{p.nombre}}</h3>
                <p class="mq-price"><small>S/</small><b>{{p.precio}}</b></p>
                <span class="mq-duration">{{p.duracion_meses}} mes{{p.duracion_meses === 1 ? '' : 'es'}}</span>
                <ul>
                  <li *ngFor="let item of p.items">✓ {{item}}</li>
                </ul>
                <a routerLink="/login" [queryParams]="{ plan: p.nombre }">Elegir plan</a>
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
        </section>
      </main>

      <footer class="mq-footer">
        <div class="mq-shell">
          <img src="assets/mallqui-logo.png" alt="Mallqui Gym">
          <span>© 2026 Mallqui Gym · Pucallpa, Perú</span>
          <a routerLink="/login">Login</a>
        </div>
      </footer>

      <button
        type="button"
        class="mq-chat-float"
        aria-label="Ir a contacto"
        title="Contacto"
        (click)="irA('contacto')">
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
  private heroTimer?: ReturnType<typeof setInterval>;
  private toastTimer?: ReturnType<typeof setTimeout>;

  heroImages = [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2000&q=90',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=2000&q=90',
    'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=2000&q=90'
  ];

  galeria = [
    { img: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=900&q=85', alt: 'Entrenamiento de fuerza', texto: 'FUERZA' },
    { img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=85', alt: 'Entrenamiento funcional', texto: 'DISCIPLINA' },
    { img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=85', alt: 'Trabajo con pesas', texto: 'PROGRESO' },
    { img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=85', alt: 'Entrenamiento intenso', texto: 'CONSTANCIA' },
    { img: 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?auto=format&fit=crop&w=1200&q=85', alt: 'Gimnasio y pesas', texto: 'SUPERACIÓN' },
    { img: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=900&q=85', alt: 'Entrenamiento profesional', texto: 'RESULTADOS' }
  ];

  clases = [
    {
      nombre: 'Entrenamiento inicial',
      descripcion: 'Aprende técnica, postura y una rutina segura para comenzar.',
      nivel: 'Principiante',
      horario: 'Según agenda',
      img: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=900&q=85'
    },
    {
      nombre: 'Fuerza y masa muscular',
      descripcion: 'Trabajo progresivo con cargas para mejorar fuerza e hipertrofia.',
      nivel: 'Intermedio',
      horario: 'Según agenda',
      img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=85'
    },
    {
      nombre: 'Acondicionamiento avanzado',
      descripcion: 'Sesiones intensas orientadas a rendimiento y resistencia.',
      nivel: 'Avanzado',
      horario: 'Según agenda',
      img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=85'
    }
  ];

  planes = [
    { nombre: 'Mensualidad 1 mes', precio: 80, duracion_meses: 1, destacado: false, items: ['Acceso al gimnasio', 'Orientación del personal', 'Control de asistencias'] },
    { nombre: 'Promoción 2 meses', precio: 120, duracion_meses: 2, destacado: true, items: ['Acceso por 2 meses', 'Orientación del personal', 'Control de asistencias'] },
    { nombre: 'Promoción 3 meses', precio: 150, duracion_meses: 3, destacado: false, items: ['Acceso por 3 meses', 'Orientación del personal', 'Control de asistencias'] }
  ];

  constructor(private api: GymApiService) {}

  get heroActual(): string {
    return this.heroImages[this.heroIndex] || this.heroImages[0];
  }

  ngOnInit(): void {
    this.api.informacionGym().subscribe({
      next: (r: any) => {
        this.gymInfo = r || {};
        const membresias = Array.isArray(r?.membresias) ? r.membresias : [];
        if (membresias.length) {
          this.planes = membresias.map((m: any, index: number) => ({
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
  }

  cambiarHero(index: number): void {
    this.heroIndex = index;
  }

  irA(id: string, event?: Event): void {
    event?.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
