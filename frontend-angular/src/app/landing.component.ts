import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrls: ['../mallqui-landing.css'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="landing-page">
      <section class="landing-hero">
        <header class="landing-nav shell">
          <a routerLink="/" class="landing-logo" aria-label="Mallqui Gym">
            <img src="assets/mallqui-logo.png" alt="Mallqui Gym">
          </a>
          <nav aria-label="Navegación principal">
            <a class="active" href="#inicio">Inicio</a>
            <a href="#nosotros">Nosotros</a>
            <a href="#clases">Clases</a>
            <a href="#planes">Planes</a>
            <a href="#galeria">Galería</a>
            <a href="#contacto">Contacto</a>
          </nav>
          <a routerLink="/usuario" class="primary-button small">Iniciar sesión</a>
        </header>

        <div class="hero-layout shell" id="inicio">
          <div class="hero-copy">
            <span class="hero-kicker">◉ BIENVENIDO A MALLQUI GYM</span>
            <h1>TU MEJOR VERSIÓN<br>COMIENZA <strong>AQUÍ</strong></h1>
            <p>Entrenamiento profesional, ambiente motivador y resultados reales. Estamos contigo en cada paso de tu transformación.</p>
            <div class="hero-actions">
              <a routerLink="/usuario" class="primary-button">🏋 Comenzar ahora</a>
              <a href="#planes" class="ghost-button">▷ Ver planes</a>
            </div>
          </div>
          <div class="hero-person" role="img" aria-label="Persona entrenando con mancuerna"></div>
        </div>

        <div class="feature-bar shell">
          <div><span>◯</span><p><b>Rutinas personalizadas</b><small>Según tu objetivo</small></p></div>
          <div><span>★</span><p><b>1 entrenador dedicado</b><small>Acompañamiento personal</small></p></div>
          <div><span>▣</span><p><b>Equipamiento de calidad</b><small>Instalaciones de primer nivel</small></p></div>
          <div><span>♡</span><p><b>Comunidad activa</b><small>Motivación todos los días</small></p></div>
        </div>
      </section>

      <main class="landing-content shell">
        <section id="clases" class="landing-section">
          <div class="section-heading"><div><span></span><h2>NUESTRAS CLASES</h2></div><a href="#clases">Ver todas las clases →</a></div>
          <div class="class-cards">
            <article *ngFor="let c of clases">
              <div class="class-photo" [style.backgroundImage]="'url(' + c.img + ')'">
                <span class="round-icon" [class.blue]="c.color === 'blue'" [class.green]="c.color === 'green'">{{ c.icon }}</span>
              </div>
              <div class="class-text"><h3>{{ c.nombre }}</h3><p>{{ c.desc }}</p></div>
            </article>
          </div>
        </section>

        <section id="planes" class="landing-section plans-section">
          <div class="section-heading"><div><span></span><h2>PLANES QUE SE ADAPTAN A TI</h2></div><a href="#planes">Ver todos los planes →</a></div>
          <div class="plan-cards">
            <article *ngFor="let p of planes" [class.recommended]="p.destacado">
              <div *ngIf="p.destacado" class="popular-label">MÁS POPULAR</div>
              <h3>{{ p.nombre }}</h3>
              <div class="plan-price"><span>S/</span><b>{{ p.precio }}</b><small>/mes</small></div>
              <p class="plan-subtitle">{{ p.subtitulo }}</p>
              <ul><li *ngFor="let item of p.items">✓ {{ item }}</li></ul>
              <button [class.primary-button]="p.destacado" [class.ghost-button]="!p.destacado">Elegir plan</button>
            </article>
          </div>
        </section>
      </main>

      <footer id="contacto" class="landing-footer">
        <div class="shell footer-layout">
          <div class="footer-brand"><img src="assets/mallqui-logo.png" alt="Mallqui Gym"><p>Más que un gimnasio, somos tu aliado en cada paso de tu transformación.</p></div>
          <div><h4>ENLACES</h4><a href="#inicio">Inicio</a><a href="#nosotros">Nosotros</a><a href="#clases">Clases</a><a href="#planes">Planes</a><a href="#galeria">Galería</a></div>
          <div><h4>SÍGUENOS</h4><div class="socials"><span>f</span><span>◎</span><span>♪</span><span>◉</span></div></div>
          <div><h4>CONTACTO</h4><p>⌖ Pucallpa, Perú</p><p>⌕ +51 999 888 777</p><p>✉ info@mallquigym.com</p></div>
        </div>
        <div class="copyright shell">© 2026 Mallqui Gym. Todos los derechos reservados.<span>Hecho con ♥ para tu mejor versión.</span></div>
      </footer>
    </div>
  `
})
export class LandingComponent {
  clases = [
    { nombre: 'MUSCULACIÓN', desc: 'Fuerza, hipertrofia y mejor rendimiento.', icon: '🏋', color: 'red', img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=700&q=85' },
    { nombre: 'HIIT', desc: 'Alta intensidad para máximos resultados.', icon: '⚡', color: 'blue', img: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=700&q=85' },
    { nombre: 'SPINNING', desc: 'Quema calorías y mejora tu resistencia.', icon: '🚴', color: 'blue', img: 'https://images.unsplash.com/photo-1530137073520-4ea6e2f10a48?auto=format&fit=crop&w=700&q=85' },
    { nombre: 'YOGA', desc: 'Equilibra tu cuerpo y mente.', icon: '🧘', color: 'green', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=700&q=85' }
  ];

  planes = [
    { nombre: 'BÁSICO', precio: 79, subtitulo: 'Ideal para comenzar', destacado: false, items: ['Acceso a sala de pesas', 'Clases grupales', 'Rutinas básicas'] },
    { nombre: 'PREMIUM', precio: 129, subtitulo: 'Para mejores resultados', destacado: true, items: ['Acceso total', 'Clases ilimitadas', 'Rutinas personalizadas', 'Evaluación mensual'] },
    { nombre: 'PRO', precio: 179, subtitulo: 'Experiencia completa', destacado: false, items: ['Todo Premium', 'Asesoría 1 a 1', 'Plan nutricional'] }
  ];
}
