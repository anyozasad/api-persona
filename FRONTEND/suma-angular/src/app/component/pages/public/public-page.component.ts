import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

type PaginaPublica = 'nosotros' | 'clases' | 'planes' | 'galeria' | 'contacto';

@Component({
  selector: 'app-public-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styleUrls: ['./public-page.component.css'],
  template: `
  <div class="public-page">
    <header class="public-nav">
      <div class="public-shell nav-inner">
        <a routerLink="/" class="public-logo" aria-label="Mallqui Gym">
          <img src="assets/mallqui-logo.svg" alt="Mallqui Gym">
          <span><b>MALLQUI GYM</b><small>PUCALLPA · PERÚ</small></span>
        </a>

        <nav aria-label="Navegación principal">
          <a routerLink="/">Inicio</a>
          <a routerLink="/nosotros" [class.active]="pagina==='nosotros'">Nosotros</a>
          <a routerLink="/clases-gym" [class.active]="pagina==='clases'">Clases</a>
          <a routerLink="/planes" [class.active]="pagina==='planes'">Planes</a>
          <a routerLink="/galeria" [class.active]="pagina==='galeria'">Galería</a>
          <a routerLink="/contacto" [class.active]="pagina==='contacto'">Contacto</a>
        </nav>

        <a routerLink="/login" class="nav-login">Iniciar sesión</a>
      </div>
    </header>

    <main [ngSwitch]="pagina">
      <ng-container *ngSwitchCase="'nosotros'">
        <section class="page-hero hero-nosotros">
          <div class="public-shell hero-grid">
            <div class="hero-copy">
              <span class="eyebrow">CONOCE MALLQUI GYM</span>
              <h1>Más que entrenar, queremos <strong>acompañarte.</strong></h1>
              <p>Un espacio pensado para entrenar con orientación, constancia y una experiencia digital que te ayuda a organizar tu progreso.</p>
              <div class="hero-actions">
                <a routerLink="/planes" class="primary">Conocer nuestros planes <b>→</b></a>
                <a routerLink="/contacto" class="secondary">Hablar con nosotros <b>↗</b></a>
              </div>
              <div class="about-hero-stats">
                <div><b>4</b><span>modalidades</span></div>
                <div><b>06–22h</b><span>horario amplio</span></div>
                <div><b>1 portal</b><span>todo conectado</span></div>
              </div>
            </div>
            <div class="hero-photo photo-nosotros">
              <div class="about-photo-overlay"></div>
              <span>DISCIPLINA · PROGRESO · COMUNIDAD</span>
              <div class="about-photo-card">
                <small>NUESTRA FORMA DE ENTRENAR</small>
                <b>Constancia, guía y una experiencia que te acompaña.</b>
              </div>
            </div>
          </div>
        </section>

        <section class="public-shell content-section">
          <div class="section-title"><span>NUESTRA ESENCIA</span><h2>Un gimnasio pensado para avanzar de verdad</h2><p>No solo se trata de máquinas. Se trata de tener una experiencia clara, acompañada y constante.</p></div>
          <div class="value-grid">
            <article><b>01</b><h3>Entrenamiento guiado</h3><p>Rutinas y clases organizadas para distintos objetivos y niveles.</p></article>
            <article><b>02</b><h3>Acompañamiento</h3><p>Entrenadores que orientan el proceso y ayudan a mantener la constancia.</p></article>
            <article><b>03</b><h3>Seguimiento</h3><p>El sistema permite revisar membresías, reservas, asistencia y progreso.</p></article>
          </div>
        </section>
      </ng-container>

      <ng-container *ngSwitchCase="'clases'">
        <section class="page-hero compact-hero">
          <div class="public-shell">
            <span class="eyebrow">ENTRENA A TU MANERA</span>
            <h1>Clases para cada objetivo</h1>
            <p>Elige la actividad que mejor se adapte a tu ritmo y revisa horarios antes de reservar.</p>
            <div class="classes-hero-facts">
              <span><b>{{clases.length}}</b><small>modalidades</small></span>
              <span><b>06:00–22:00</b><small>horario amplio</small></span>
              <span><b>Online</b><small>reserva desde tu cuenta</small></span>
            </div>
          </div>
        </section>

        <section class="public-shell content-section">
          <div class="class-page-grid">
            <article *ngFor="let c of clases">
              <div class="class-image" [style.backgroundImage]="'url(' + c.img + ')'"><span>{{c.icon}}</span></div>
              <div class="class-body">
                <div><h3>{{c.nombre}}</h3><small>{{c.nivel}}</small></div>
                <p>{{c.desc}}</p>
                <dl><div><dt>Días</dt><dd>{{c.dias}}</dd></div><div><dt>Horario</dt><dd>{{c.hora}}</dd></div><div><dt>Cupos</dt><dd>{{c.cupo}}</dd></div></dl>
                <a routerLink="/login" class="card-action">Ingresar para reservar →</a>
              </div>
            </article>
          </div>
        </section>
      </ng-container>

      <ng-container *ngSwitchCase="'planes'">
        <section class="page-hero compact-hero plans-hero">
          <div class="public-shell">
            <span class="eyebrow">PLANES MALLQUI GYM</span>
            <h1>Elige el plan que encaje contigo</h1>
            <p>Opciones claras, sin complicaciones. Puedes iniciar con el plan que mejor se adapte a tu objetivo.</p>
          </div>
        </section>

        <section class="public-shell content-section">
          <div class="plans-page-grid">
            <article *ngFor="let p of planes" [class.featured]="p.destacado">
              <span *ngIf="p.destacado" class="recommended">MÁS ELEGIDO</span>
              <h3>{{p.nombre}}</h3>
              <p>{{p.subtitulo}}</p>
              <div class="price"><small>S/</small><b>{{p.precio}}</b><em>/ mes</em></div>
              <ul><li *ngFor="let item of p.items">✓ {{item}}</li></ul>
              <a [routerLink]="['/login']" [queryParams]="{plan:p.nombre}" [class.primary]="p.destacado" [class.secondary]="!p.destacado">Elegir {{p.nombre}}</a>
            </article>
          </div>
        </section>
      </ng-container>

      <ng-container *ngSwitchCase="'galeria'">
        <section class="page-hero compact-hero gallery-hero">
          <div class="public-shell">
            <span class="eyebrow">MALLQUI GYM POR DENTRO</span>
            <h1>Conoce el ambiente antes de venir</h1>
            <p>Entrenamiento, clases y espacios pensados para que te concentres en avanzar.</p>
          </div>
        </section>

        <section class="public-shell content-section">
          <div class="gallery-page-grid">
            <figure *ngFor="let g of galeria; let i=index" [class.big]="i===0 || i===3">
              <img [src]="g.img" [alt]="g.nombre">
              <figcaption><b>{{g.nombre}}</b><span>{{g.texto}}</span></figcaption>
            </figure>
          </div>
          <div class="gallery-cta"><div><h3>¿Quieres conocer Mallqui Gym en persona?</h3><p>Contáctanos y te ayudamos con la información que necesites.</p></div><a routerLink="/contacto" class="primary">Ir a contacto</a></div>
        </section>
      </ng-container>

      <ng-container *ngSwitchCase="'contacto'">
        <section class="page-hero compact-hero contact-hero">
          <div class="public-shell">
            <span class="eyebrow">ESTAMOS PARA AYUDARTE</span>
            <h1>Hablemos sobre tu próximo entrenamiento</h1>
            <p>Consulta planes, clases, horarios o cualquier duda sobre Mallqui Gym.</p>
          </div>
        </section>

        <section class="public-shell contact-layout">
          <div class="contact-info">
            <span class="eyebrow dark">CONTACTO</span>
            <h2>Escríbenos o visítanos</h2>
            <p>Te respondemos con información clara para que puedas elegir lo que necesitas.</p>
            <div class="contact-cards">
              <a href="tel:+51999888777"><span>☎</span><div><small>Teléfono</small><b>+51 999 888 777</b></div></a>
              <a href="mailto:info@mallquigym.com"><span>✉</span><div><small>Correo</small><b>info@mallquigym.com</b></div></a>
              <div><span>⌖</span><div><small>Ubicación</small><b>Pucallpa, Perú</b></div></div>
              <div><span>◷</span><div><small>Horario referencial</small><b>06:00 AM – 10:00 PM</b></div></div>
            </div>
          </div>

          <form class="contact-form" (submit)="enviarConsulta($event)">
            <div><span class="eyebrow dark">ENVÍANOS TU CONSULTA</span><h3>Cuéntanos qué necesitas</h3></div>
            <label>Nombre<input name="nombre" [(ngModel)]="contacto.nombre" placeholder="Tu nombre" required></label>
            <label>Correo<input type="email" name="correo" [(ngModel)]="contacto.correo" placeholder="tunombre@gmail.com" required></label>
            <label>Asunto<select name="asunto" [(ngModel)]="contacto.asunto"><option>Planes</option><option>Clases</option><option>Horarios</option><option>Otro</option></select></label>
            <label>Mensaje<textarea name="mensaje" [(ngModel)]="contacto.mensaje" placeholder="Escribe tu consulta..." required></textarea></label>
            <button type="submit" class="primary">Preparar mensaje</button>
            <small class="form-note">Se abrirá tu aplicación de correo con el mensaje preparado.</small>
          </form>
        </section>
      </ng-container>
    </main>

    <footer class="public-footer">
      <div class="public-shell footer-inner">
        <div><img src="assets/mallqui-logo.svg" alt="Mallqui Gym"><p>Entrena. Supérate. Avanza.</p></div>
        <nav><a routerLink="/">Inicio</a><a routerLink="/nosotros">Nosotros</a><a routerLink="/clases-gym">Clases</a><a routerLink="/planes">Planes</a><a routerLink="/galeria">Galería</a><a routerLink="/contacto">Contacto</a></nav>
        <span>© 2026 Mallqui Gym</span>
      </div>
    </footer>
  </div>
  `
})
export class PublicPageComponent implements OnInit {
  pagina: PaginaPublica = 'nosotros';

  contacto = { nombre: '', correo: '', asunto: 'Planes', mensaje: '' };

  clases = [
    { nombre:'MUSCULACIÓN', desc:'Fuerza, hipertrofia y mejor rendimiento.', icon:'🏋', nivel:'Todos los niveles', dias:'Lun · Mié · Vie', hora:'6:00 AM – 10:00 PM', cupo:12, img:'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1000&q=85' },
    { nombre:'HIIT', desc:'Sesiones de alta intensidad para mejorar condición y resistencia.', icon:'⚡', nivel:'Intermedio', dias:'Lun · Mar · Jue', hora:'7:00 AM / 7:00 PM', cupo:15, img:'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=1000&q=85' },
    { nombre:'SPINNING', desc:'Cardio dinámico para quemar calorías y mejorar tu resistencia.', icon:'🚴', nivel:'Todos los niveles', dias:'Mar · Jue · Sáb', hora:'6:30 PM', cupo:12, img:'https://images.unsplash.com/photo-1530137073520-4ea6e2f10a48?auto=format&fit=crop&w=1000&q=85' },
    { nombre:'YOGA', desc:'Movilidad, equilibrio y concentración en una sesión guiada.', icon:'🧘', nivel:'Inicial / Intermedio', dias:'Mar · Jue · Sáb', hora:'8:00 AM', cupo:14, img:'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&q=85' }
  ];

  planes = [
    { nombre:'BÁSICO', precio:79, subtitulo:'Ideal para comenzar', destacado:false, items:['Acceso a sala de pesas','Clases grupales','Rutinas básicas'] },
    { nombre:'PREMIUM', precio:129, subtitulo:'Para mejores resultados', destacado:true, items:['Acceso total','Clases ilimitadas','Rutinas personalizadas','Evaluación mensual'] },
    { nombre:'PRO', precio:179, subtitulo:'Experiencia completa', destacado:false, items:['Todo Premium','Asesoría 1 a 1','Plan nutricional'] }
  ];

  galeria = [
    { nombre:'Zona de fuerza', texto:'Equipamiento para trabajar fuerza y rendimiento.', img:'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=88' },
    { nombre:'Entrenamiento funcional', texto:'Espacio para sesiones dinámicas y completas.', img:'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=1000&q=88' },
    { nombre:'Clases guiadas', texto:'Actividades para distintos niveles y objetivos.', img:'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=88' },
    { nombre:'Yoga y movilidad', texto:'Un ambiente para equilibrio, flexibilidad y recuperación.', img:'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=88' },
    { nombre:'Cardio', texto:'Mejora tu resistencia y condición física.', img:'https://images.unsplash.com/photo-1530137073520-4ea6e2f10a48?auto=format&fit=crop&w=1000&q=88' }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.pagina = (data['pagina'] || 'nosotros') as PaginaPublica;
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  }

  enviarConsulta(event: Event): void {
    event.preventDefault();
    const asunto = encodeURIComponent(`Consulta Mallqui Gym - ${this.contacto.asunto}`);
    const cuerpo = encodeURIComponent(`Hola Mallqui Gym,\n\nSoy ${this.contacto.nombre}.\n\n${this.contacto.mensaje}\n\nCorreo: ${this.contacto.correo}`);
    window.location.href = `mailto:info@mallquigym.com?subject=${asunto}&body=${cuerpo}`;
  }
}
