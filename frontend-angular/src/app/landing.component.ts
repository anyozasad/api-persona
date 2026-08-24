import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="landing-page">
    <header class="topbar">
      <a class="brand" routerLink="/"><img src="assets/mallqui-logo.png" alt="Mallqui Gym"></a>
      <nav>
        <a class="active">Inicio</a><a>Nosotros</a><a>Clases</a><a>Planes</a><a>Galería</a><a>Contacto</a>
      </nav>
      <a routerLink="/usuario" class="btn btn-red">Iniciar sesión</a>
    </header>

    <section class="hero">
      <div class="hero-copy">
        <span class="eyebrow">BIENVENIDO A MALLQUI GYM</span>
        <h1>TU MEJOR VERSIÓN<br>COMIENZA <span>AQUÍ</span></h1>
        <p>Entrenamiento profesional, ambiente motivador y resultados reales. Estamos contigo en cada paso de tu transformación.</p>
        <div class="hero-actions">
          <a routerLink="/usuario" class="btn btn-red">🏋 Comenzar ahora</a>
          <a href="#planes" class="btn btn-outline">▷ Ver planes</a>
        </div>
      </div>
      <div class="hero-photo"></div>
    </section>

    <section class="benefit-strip">
      <div>◯ <b>Rutinas personalizadas</b><small>Según tu objetivo</small></div>
      <div>✪ <b>Entrenador experto</b><small>Acompañamiento profesional</small></div>
      <div>▣ <b>Equipamiento de calidad</b><small>Instalaciones de primer nivel</small></div>
      <div>♡ <b>Comunidad activa</b><small>Motivación todos los días</small></div>
    </section>

    <section class="content-grid" id="planes">
      <div class="classes">
        <div class="section-title"><h2>NUESTRAS CLASES</h2><a>Ver todas las clases →</a></div>
        <div class="class-grid">
          <article *ngFor="let c of clases">
            <div class="thumb" [style.backgroundImage]="'url('+c.img+')'"></div>
            <div class="class-body"><span class="class-icon">{{c.icon}}</span><h3>{{c.nombre}}</h3><p>{{c.desc}}</p></div>
          </article>
        </div>
      </div>
      <div class="plans">
        <div class="section-title"><h2>PLANES QUE SE ADAPTAN A TI</h2><a>Ver todos los planes →</a></div>
        <div class="plan-grid">
          <article *ngFor="let p of planes" [class.featured]="p.destacado">
            <div class="popular" *ngIf="p.destacado">MÁS POPULAR</div>
            <h3>{{p.nombre}}</h3><div class="price">S/ <b>{{p.precio}}</b><small>/mes</small></div>
            <ul><li *ngFor="let item of p.items">✓ {{item}}</li></ul>
            <button class="btn" [class.btn-red]="p.destacado" [class.btn-outline]="!p.destacado">Elegir plan</button>
          </article>
        </div>
      </div>
    </section>

    <footer>
      <div class="footer-brand"><img src="assets/mallqui-logo.png"><p>Más que un gimnasio, somos tu aliado en cada paso de tu transformación.</p></div>
      <div><b>ENLACES</b><span>Inicio</span><span>Nosotros</span><span>Clases</span><span>Planes</span></div>
      <div><b>SÍGUENOS</b><span>Facebook · Instagram · TikTok</span></div>
      <div><b>CONTACTO</b><span>Pucallpa, Perú</span><span>+51 999 888 777</span><span>info@mallquigym.com</span></div>
    </footer>
  </div>
  `
})
export class LandingComponent {
  clases = [
    {nombre:'MUSCULACIÓN', desc:'Fuerza, hipertrofia y mejor rendimiento.', icon:'🏋', img:'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80'},
    {nombre:'HIIT', desc:'Alta intensidad para máximos resultados.', icon:'⚡', img:'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=600&q=80'},
    {nombre:'SPINNING', desc:'Quema calorías y mejora tu resistencia.', icon:'🚴', img:'https://images.unsplash.com/photo-1530137073520-4ea6e2f10a48?auto=format&fit=crop&w=600&q=80'},
    {nombre:'YOGA', desc:'Equilibra tu cuerpo y mente.', icon:'🧘', img:'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80'}
  ];
  planes = [
    {nombre:'BÁSICO', precio:79, destacado:false, items:['Acceso a sala de pesas','Clases grupales','Rutinas básicas']},
    {nombre:'PREMIUM', precio:129, destacado:true, items:['Acceso total','Clases ilimitadas','Rutinas personalizadas','Evaluación mensual']},
    {nombre:'PRO', precio:179, destacado:false, items:['Todo Premium','Asesoría 1 a 1','Plan nutricional']}
  ];
}
