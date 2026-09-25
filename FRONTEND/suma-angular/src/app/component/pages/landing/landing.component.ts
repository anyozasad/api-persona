import { AfterViewInit, Component, HostListener, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrls: ['../mallqui-landing.css', '../mallqui-landing-actions.css'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="landing-page">
      <div class="landing-scroll-progress" [style.width.%]="progresoScroll" aria-hidden="true"></div>
      <section class="landing-hero">
        <header class="landing-nav shell">
          <a routerLink="/" class="landing-logo" aria-label="Mallqui Gym">
            <img src="assets/mallqui-logo.png" alt="Mallqui Gym">
            <span><b>MALLQUI GYM</b><small>PUCALLPA · PERÚ</small></span>
          </a>
          <nav aria-label="Navegación principal">
            <a routerLink="/" class="active">Inicio</a>
            <a routerLink="/nosotros">Nosotros</a>
            <a routerLink="/clases-gym">Clases</a>
            <a routerLink="/planes">Planes</a>
            <a routerLink="/galeria">Galería</a>
            <a routerLink="/contacto">Contacto</a>
          </nav>
          <a routerLink="/login" class="primary-button small">Iniciar sesión</a>
        </header>

        <div class="hero-layout shell" id="inicio">
          <div class="hero-copy hero-enter">
            <span class="hero-kicker"><i></i> BIENVENIDO A MALLQUI GYM</span>
            <h1>TU MEJOR VERSIÓN<br>COMIENZA <strong>AQUÍ</strong></h1>
            <p>Entrena con una experiencia clara, moderna y acompañada. Rutinas, clases y seguimiento para que cada visita tenga un propósito.</p>
            <div class="hero-actions">
              <a routerLink="/login" class="primary-button"><span>Comenzar ahora</span><b>→</b></a>
              <a routerLink="/planes" class="ghost-button"><span>Ver planes</span><b>↗</b></a>
            </div>
            <div class="hero-trust">
              <span><i>✓</i> Entrenamiento guiado</span>
              <span><i>✓</i> Reserva desde tu cuenta</span>
              <span><i>✓</i> Seguimiento personal</span>
            </div>
          </div>
          <div class="hero-person hero-image-enter" role="img" aria-label="Persona entrenando con mancuerna">
            <div class="hero-image-shade"></div>
            <div class="hero-photo-badge">
              <span><i></i> MALLQUI GYM · PUCALLPA</span>
            </div>
            <div class="hero-photo-message">
              <small>ENTRENA CON PROPÓSITO</small>
              <b>Disciplina hoy.<br>Resultados mañana.</b>
            </div>
            <div class="hero-photo-info">
              <article><small>HORARIO</small><b>06:00 - 22:00</b></article>
              <article><small>CLASES</small><b>{{clases.length}} modalidades</b></article>
              <article><small>ACCESO</small><b>Todos los días</b></article>
            </div>
          </div>
        </div>

        <div class="feature-bar shell mq-reveal">
          <div><span>◯</span><p><b>Rutinas personalizadas</b><small>Según tu objetivo</small></p></div>
          <div><span>★</span><p><b>1 entrenador dedicado</b><small>Acompañamiento personal</small></p></div>
          <div><span>▣</span><p><b>Equipamiento de calidad</b><small>Instalaciones de primer nivel</small></p></div>
          <div><span>♡</span><p><b>Comunidad activa</b><small>Motivación todos los días</small></p></div>
        </div>
      </section>

      <section id="nosotros" class="landing-about shell">
        <div class="landing-about-panel mq-reveal">
          <div class="landing-about-copy">
            <span class="eyebrow">CONOCE MALLQUI GYM</span>
            <h2>Un gimnasio pensado para <strong>acompañarte de verdad</strong></h2>
            <p>Mallqui Gym combina entrenamiento, seguimiento y atención personalizada en un solo lugar. El sistema te permite conocer tus clases, elegir un plan y continuar luego desde tu propia cuenta.</p>
          </div>
          <div class="about-points">
            <article><span>🏋</span><b>Entrenamiento</b><small>Rutinas y clases para distintos objetivos.</small></article>
            <article><span>♙</span><b>Acompañamiento</b><small>Un entrenador dedicado para orientar a los miembros.</small></article>
            <article><span>↗</span><b>Progreso</b><small>Seguimiento continuo desde el panel del usuario.</small></article>
          </div>
        </div>
      </section>

      <main class="landing-content shell">
        <section id="clases" class="landing-section mq-reveal">
          <div class="section-heading">
            <div><span></span><h2>NUESTRAS CLASES</h2></div>
            <a routerLink="/clases-gym">Ver todas las clases →</a>
          </div>
          <div class="class-cards">
            <article
              *ngFor="let c of clases"
              role="button"
              tabindex="0"
              [attr.aria-label]="'Ver detalles de ' + c.nombre"
              (click)="abrirClase(c)"
              (keydown.enter)="abrirClase(c)">
              <div class="class-photo" [style.backgroundImage]="'url(' + c.img + ')'">
                <span class="round-icon" [class.blue]="c.color === 'blue'" [class.green]="c.color === 'green'">{{ c.icon }}</span>
              </div>
              <div class="class-text"><h3>{{ c.nombre }}</h3><p>{{ c.desc }}</p></div>
            </article>
          </div>
        </section>

        <section id="planes" class="landing-section plans-section mq-reveal">
          <div class="section-heading">
            <div><span></span><h2>PLANES QUE SE ADAPTAN A TI</h2></div>
            <a routerLink="/planes">Ver todos los planes →</a>
          </div>
          <div class="plan-cards">
            <article *ngFor="let p of planes" [class.recommended]="p.destacado">
              <div *ngIf="p.destacado" class="popular-label">MÁS POPULAR</div>
              <h3>{{ p.nombre }}</h3>
              <div class="plan-price"><span>S/</span><b>{{ p.precio }}</b><small>/mes</small></div>
              <p class="plan-subtitle">{{ p.subtitulo }}</p>
              <ul><li *ngFor="let item of p.items">✓ {{ item }}</li></ul>
              <a
                [routerLink]="['/login']"
                [queryParams]="{ plan: p.nombre }"
                [class.primary-button]="p.destacado"
                [class.ghost-button]="!p.destacado">
                Elegir plan
              </a>
            </article>
          </div>
        </section>
      </main>

      <section id="galeria" class="landing-gallery shell mq-reveal">
        <div class="section-heading">
          <div><span></span><h2>GALERÍA MALLQUI GYM</h2></div>
          <a routerLink="/contacto">¿Quieres conocernos? →</a>
        </div>
        <div class="gallery-grid">
          <button
            class="gallery-card"
            type="button"
            *ngFor="let c of clases"
            (click)="abrirClase(c)"
            [attr.aria-label]="'Abrir imagen y detalles de ' + c.nombre">
            <img [src]="c.img" [alt]="c.nombre">
            <span>{{c.nombre}}</span>
          </button>
        </div>
      </section>

      <footer id="contacto" class="landing-footer mq-reveal">
        <div class="shell footer-layout">
          <div class="footer-brand"><img src="assets/mallqui-logo.png" alt="Mallqui Gym"><p>Más que un gimnasio, somos tu aliado en cada paso de tu transformación.</p></div>
          <div>
            <h4>ENLACES</h4>
            <a routerLink="/">Inicio</a>
            <a routerLink="/nosotros">Nosotros</a>
            <a routerLink="/clases-gym">Clases</a>
            <a routerLink="/planes">Planes</a>
            <a routerLink="/galeria">Galería</a>
          </div>
          <div>
            <h4>SÍGUENOS</h4>
            <div class="socials">
              <button type="button" aria-label="Facebook" (click)="mostrarRed('Facebook')">f</button>
              <button type="button" aria-label="Instagram" (click)="mostrarRed('Instagram')">◎</button>
              <button type="button" aria-label="TikTok" (click)="mostrarRed('TikTok')">♪</button>
              <button type="button" aria-label="WhatsApp" (click)="mostrarRed('WhatsApp')">◉</button>
            </div>
          </div>
          <div>
            <h4>CONTACTO</h4>
            <p>⌖ Pucallpa, Perú</p>
            <a class="footer-contact-link" href="tel:+51999888777">⌕ +51 999 888 777</a>
            <a class="footer-contact-link" href="mailto:info@mallquigym.com">✉ info@mallquigym.com</a>
          </div>
        </div>
        <div class="copyright shell">© 2026 Mallqui Gym. Todos los derechos reservados.<span>Hecho con ♥ para tu mejor versión.</span></div>
      </footer>

      <div *ngIf="modal" class="landing-modal-backdrop" (click)="cerrarModal()" role="presentation">
        <section class="landing-modal" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
          <button type="button" class="landing-modal-close" aria-label="Cerrar" (click)="cerrarModal()">×</button>

          <ng-container *ngIf="modal.tipo==='clase'">
            <div class="modal-class-hero" [style.backgroundImage]="'url(' + modal.data.img + ')'">
              <span>{{modal.data.icon}}</span>
            </div>
            <h2>{{modal.data.nombre}}</h2>
            <p>{{modal.data.desc}}</p>
            <div class="modal-meta">
              <div><b>Días</b><span>{{modal.data.dias}}</span></div>
              <div><b>Horario</b><span>{{modal.data.hora}}</span></div>
              <div><b>Nivel</b><span>{{modal.data.nivel}}</span></div>
            </div>
            <div class="modal-actions">
              <button type="button" class="ghost-button" (click)="cerrarModal()">Seguir viendo</button>
              <a routerLink="/login" class="primary-button" (click)="cerrarModal()">Reservar / ingresar →</a>
            </div>
          </ng-container>

          <ng-container *ngIf="modal.tipo==='clases'">
            <h2>Todas nuestras clases</h2>
            <p>Consulta rápidamente los horarios disponibles antes de ingresar a tu cuenta.</p>
            <div class="modal-list">
              <div class="modal-list-row" *ngFor="let c of clases">
                <span class="modal-list-icon">{{c.icon}}</span>
                <p><b>{{c.nombre}}</b><small>{{c.dias}} · {{c.hora}}</small></p>
                <em>{{c.nivel}}</em>
              </div>
            </div>
            <div class="modal-actions"><a routerLink="/login" class="primary-button" (click)="cerrarModal()">Ingresar para reservar →</a></div>
          </ng-container>

          <ng-container *ngIf="modal.tipo==='planes'">
            <h2>Compara nuestros planes</h2>
            <p>Elige el plan que se adapte mejor a lo que buscas. Al seleccionarlo continuarás al inicio de sesión.</p>
            <div class="plan-compare">
              <article *ngFor="let p of planes" [class.recommended]="p.destacado">
                <h3>{{p.nombre}}</h3>
                <strong>S/ {{p.precio}}</strong>
                <small>{{p.subtitulo}}</small>
                <ul><li *ngFor="let item of p.items">{{item}}</li></ul>
                <a [routerLink]="['/login']" [queryParams]="{plan:p.nombre}" [class.primary-button]="p.destacado" [class.ghost-button]="!p.destacado" (click)="cerrarModal()">Elegir plan</a>
              </article>
            </div>
          </ng-container>
        </section>
      </div>

      <button
        *ngIf="mostrarSubir"
        type="button"
        class="landing-back-top"
        aria-label="Volver al inicio"
        title="Volver al inicio"
        (click)="irA('inicio')">↑</button>

      <div *ngIf="toast" class="landing-toast" role="status">{{toast}}</div>
    </div>
  `
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  seccionActiva = 'inicio';
  modal: { tipo: 'clase' | 'clases' | 'planes'; data?: any } | null = null;
  toast = '';
  progresoScroll = 0;
  mostrarSubir = false;
  private toastTimer?: ReturnType<typeof setTimeout>;
  private revealObserver?: IntersectionObserver;

  clases = [
    { nombre: 'MUSCULACIÓN', desc: 'Fuerza, hipertrofia y mejor rendimiento.', icon: '🏋', color: 'red', dias: 'Lun · Mié · Vie', hora: '6:00 AM – 10:00 PM', nivel: 'Todos los niveles', cupo: 12, img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=700&q=85' },
    { nombre: 'HIIT', desc: 'Alta intensidad para máximos resultados.', icon: '⚡', color: 'blue', dias: 'Lun · Mar · Jue', hora: '7:00 AM / 7:00 PM', nivel: 'Intermedio', cupo: 15, img: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=700&q=85' },
    { nombre: 'SPINNING', desc: 'Quema calorías y mejora tu resistencia.', icon: '🚴', color: 'blue', dias: 'Mar · Jue · Sáb', hora: '6:30 PM', nivel: 'Todos los niveles', cupo: 12, img: 'https://images.unsplash.com/photo-1530137073520-4ea6e2f10a48?auto=format&fit=crop&w=700&q=85' },
    { nombre: 'YOGA', desc: 'Equilibra tu cuerpo y mente.', icon: '🧘', color: 'green', dias: 'Mar · Jue · Sáb', hora: '8:00 AM', nivel: 'Inicial / Intermedio', cupo: 14, img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=700&q=85' }
  ];

  planes = [
    { nombre: 'BÁSICO', precio: 79, subtitulo: 'Ideal para comenzar', destacado: false, items: ['Acceso a sala de pesas', 'Clases grupales', 'Rutinas básicas'] },
    { nombre: 'PREMIUM', precio: 129, subtitulo: 'Para mejores resultados', destacado: true, items: ['Acceso total', 'Clases ilimitadas', 'Rutinas personalizadas', 'Evaluación mensual'] },
    { nombre: 'PRO', precio: 179, subtitulo: 'Experiencia completa', destacado: false, items: ['Todo Premium', 'Asesoría 1 a 1', 'Plan nutricional'] }
  ];

  ngAfterViewInit(): void {
    document.documentElement.classList.add('mallqui-public-scroll');
    const elementos = Array.from(document.querySelectorAll<HTMLElement>('.mq-reveal'));

    if (!('IntersectionObserver' in window)) {
      elementos.forEach(el => el.classList.add('is-visible'));
      return;
    }

    this.revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add('is-visible');
          this.revealObserver?.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });

    elementos.forEach((el, index) => {
      el.style.setProperty('--reveal-delay', `${Math.min(index * 55, 220)}ms`);
      this.revealObserver?.observe(el);
    });

    this.actualizarScroll();
  }

  ngOnDestroy(): void {
    document.documentElement.classList.remove('mallqui-public-scroll');
    this.revealObserver?.disconnect();
    if (this.toastTimer) clearTimeout(this.toastTimer);
    document.body.style.overflow = '';
  }

  @HostListener('window:scroll')
  actualizarScroll(): void {
    const doc = document.documentElement;
    const total = Math.max(doc.scrollHeight - window.innerHeight, 1);
    this.progresoScroll = Math.min(100, Math.max(0, (window.scrollY / total) * 100));
    this.mostrarSubir = window.scrollY > 520;
  }

  irA(id: string, event?: Event): void {
    event?.preventDefault();
    this.seccionActiva = id;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  abrirClase(clase: any): void {
    this.modal = { tipo: 'clase', data: clase };
    document.body.style.overflow = 'hidden';
  }

  abrirListadoClases(event?: Event): void {
    event?.preventDefault();
    this.modal = { tipo: 'clases' };
    document.body.style.overflow = 'hidden';
  }

  abrirComparadorPlanes(event?: Event): void {
    event?.preventDefault();
    this.modal = { tipo: 'planes' };
    document.body.style.overflow = 'hidden';
  }

  cerrarModal(): void {
    this.modal = null;
    document.body.style.overflow = '';
  }

  mostrarRed(red: string): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast = `${red}: enlace oficial pendiente de configurar en Mallqui Gym.`;
    this.toastTimer = setTimeout(() => this.toast = '', 2600);
  }

  @HostListener('document:keydown.escape')
  cerrarConEscape(): void {
    if (this.modal) this.cerrarModal();
  }
}
