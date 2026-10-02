import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GymApiService } from '../../../core/services/gym-api.service';

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
          <a routerLink="/planes" [class.active]="pagina==='planes'">Mensualidades</a>
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
                <a routerLink="/planes" class="primary">Conocer mensualidades <b>→</b></a>
                <a routerLink="/contacto" class="secondary">Hablar con nosotros <b>↗</b></a>
              </div>
              <div class="about-hero-stats">
                <div><b>4</b><span>modalidades</span></div>
                <div><b>6–12 / 14–21:30</b><span>horario de atención</span></div>
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
              <span><b>6–12 / 14–21:30</b><small>horario de atención</small></span>
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
            <span class="eyebrow">MENSUALIDADES MALLQUI GYM</span>
            <h1>Elige cuánto tiempo quieres entrenar</h1>
            <p>Mensualidad y promociones reales del gimnasio: 1, 2 o 3 meses.</p>
          </div>
        </section>

        <section class="public-shell content-section">
          <div class="official-gym-facts">
            <article>
              <span>◷</span>
              <div><small>HORARIO</small><b>L-V 6:00–12:00 / 14:00–21:30</b><p>Sábado hasta 20:30 · Domingo hasta el mediodía.</p></div>
            </article>
            <article>
              <span>S/</span>
              <div><small>RUTINA DIARIA</small><b>S/ {{(gymInfo?.tarifa_diaria || 6) | number:'1.2-2'}}</b><p>Tarifa diaria informada por Mallqui Gym.</p></div>
            </article>
            <article>
              <span>✓</span>
              <div><small>GUÍA E INSTRUCCIONES</small><b>Personal del gimnasio</b><p>La orientación está a cargo del mismo personal del gym.</p></div>
            </article>
          </div>

          <div class="plans-page-grid">
            <article *ngFor="let p of planes" [class.featured]="p.destacado">
              <span *ngIf="p.destacado" class="recommended">MÁS ELEGIDO</span>
              <h3>{{p.nombre}}</h3>
              <p>{{p.subtitulo}}</p>
              <div class="price"><small>S/</small><b>{{p.precio}}</b><em>/ {{p.duracion_meses}} mes{{p.duracion_meses===1 ? '' : 'es'}}</em></div>
              <ul><li *ngFor="let item of p.items">✓ {{item}}</li></ul>
              <a [routerLink]="['/login']" [queryParams]="{plan:p.nombre}" [class.primary]="p.destacado" [class.secondary]="!p.destacado">Elegir {{p.duracion_meses}} mes{{p.duracion_meses===1 ? '' : 'es'}}</a>
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
            <p>Consulta mensualidades, clases, horarios o cualquier duda sobre Mallqui Gym.</p>
          </div>
        </section>

        <section class="public-shell contact-layout">
          <div class="contact-info">
            <span class="eyebrow dark">CONTACTO</span>
            <h2>Escríbenos o visítanos</h2>
            <p>Te respondemos con información clara para que puedas elegir lo que necesitas.</p>
            <div class="contact-cards">
              <a [href]="'tel:' + (gymInfo?.telefono || '939398148')"><span>☎</span><div><small>Teléfono</small><b>{{gymInfo?.telefono || '939398148'}}</b></div></a>
              <a *ngIf="gymInfo?.correo" [href]="'mailto:' + gymInfo.correo"><span>✉</span><div><small>Correo</small><b>{{gymInfo.correo}}</b></div></a>
              <div><span>⌖</span><div><small>Ubicación</small><b>{{gymInfo?.direccion || 'Jr. Los Laureles Mz 17 Lt 18'}}</b><small>{{gymInfo?.referencia || 'Referencia: Plaza de Laura Bosso'}}</small></div></div>
              <div><span>◷</span><div><small>Horario</small><b>L-V 6–12 / 14–21:30</b><small>Sábado hasta 20:30 · Domingo hasta mediodía</small></div></div>
            </div>
          </div>

          <form class="contact-form" (submit)="enviarConsulta($event)">
            <div><span class="eyebrow dark">ENVÍANOS TU CONSULTA</span><h3>Cuéntanos qué necesitas</h3></div>
            <label>Nombre<input name="nombre" [(ngModel)]="contacto.nombre" placeholder="Tu nombre" required></label>
            <label>Correo<input type="email" name="correo" [(ngModel)]="contacto.correo" placeholder="tunombre@gmail.com" required></label>
            <label>Asunto<select name="asunto" [(ngModel)]="contacto.asunto"><option>Mensualidades</option><option>Clases</option><option>Horarios</option><option>Otro</option></select></label>
            <label>Mensaje<textarea name="mensaje" [(ngModel)]="contacto.mensaje" placeholder="Escribe tu consulta..." required></textarea></label>
            <button type="submit" class="primary">Preparar consulta</button>
            <small class="form-note">{{gymInfo?.correo ? 'Se abrirá tu aplicación de correo.' : 'La consulta se copiará para que puedas comunicarte al teléfono del gimnasio.'}}</small>
          </form>
        </section>
      </ng-container>
    </main>

    <footer class="public-footer">
      <div class="public-shell footer-inner">
        <div><img src="assets/mallqui-logo.svg" alt="Mallqui Gym"><p>Entrena. Supérate. Avanza.</p></div>
        <nav><a routerLink="/">Inicio</a><a routerLink="/nosotros">Nosotros</a><a routerLink="/clases-gym">Clases</a><a routerLink="/planes">Mensualidades</a><a routerLink="/galeria">Galería</a><a routerLink="/contacto">Contacto</a></nav>
        <span>© 2026 Mallqui Gym</span>
      </div>
    </footer>
  </div>
  `
})
export class PublicPageComponent implements OnInit, OnDestroy {
  pagina: PaginaPublica = 'nosotros';

  contacto = { nombre: '', correo: '', asunto: 'Mensualidades', mensaje: '' };

  clases = [
    { nombre:'MUSCULACIÓN', desc:'Fuerza, hipertrofia y mejor rendimiento.', icon:'🏋', nivel:'Todos los niveles', dias:'Lun · Mié · Vie', hora:'6:00 AM – 10:00 PM', cupo:12, img:'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1000&q=85' },
    { nombre:'HIIT', desc:'Sesiones de alta intensidad para mejorar condición y resistencia.', icon:'⚡', nivel:'Intermedio', dias:'Lun · Mar · Jue', hora:'7:00 AM / 7:00 PM', cupo:15, img:'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=1000&q=85' },
    { nombre:'SPINNING', desc:'Cardio dinámico para quemar calorías y mejorar tu resistencia.', icon:'🚴', nivel:'Todos los niveles', dias:'Mar · Jue · Sáb', hora:'6:30 PM', cupo:12, img:'https://images.unsplash.com/photo-1530137073520-4ea6e2f10a48?auto=format&fit=crop&w=1000&q=85' },
    { nombre:'YOGA', desc:'Movilidad, equilibrio y concentración en una sesión guiada.', icon:'🧘', nivel:'Inicial / Intermedio', dias:'Mar · Jue · Sáb', hora:'8:00 AM', cupo:14, img:'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&q=85' }
  ];

  gymInfo:any={};
  planes = [
    { nombre:'Mensualidad 1 mes', precio:80, duracion_meses:1, subtitulo:'Mensualidad individual', destacado:false, items:['Acceso al gimnasio durante 1 mes','Guía del personal del gym','Credencial digital y control de asistencias'] },
    { nombre:'Promoción 2 meses', precio:120, duracion_meses:2, subtitulo:'Promoción por 2 meses', destacado:true, items:['Acceso al gimnasio durante 2 meses','Guía del personal del gym','Credencial digital y control de asistencias'] },
    { nombre:'Promoción 3 meses', precio:150, duracion_meses:3, subtitulo:'Promoción por 3 meses', destacado:false, items:['Acceso al gimnasio durante 3 meses','Guía del personal del gym','Credencial digital y control de asistencias'] }
  ];

  galeria = [
    { nombre:'Zona de fuerza', texto:'Equipamiento para trabajar fuerza y rendimiento.', img:'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=88' },
    { nombre:'Entrenamiento funcional', texto:'Espacio para sesiones dinámicas y completas.', img:'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=1000&q=88' },
    { nombre:'Clases guiadas', texto:'Actividades para distintos niveles y objetivos.', img:'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=88' },
    { nombre:'Yoga y movilidad', texto:'Un ambiente para equilibrio, flexibilidad y recuperación.', img:'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=88' },
    { nombre:'Cardio', texto:'Mejora tu resistencia y condición física.', img:'https://images.unsplash.com/photo-1530137073520-4ea6e2f10a48?auto=format&fit=crop&w=1000&q=88' }
  ];

  constructor(private route: ActivatedRoute, private api: GymApiService) {}

  ngOnInit(): void {
    document.documentElement.classList.add('mallqui-public-scroll');
    this.route.data.subscribe(data => {
      this.pagina = (data['pagina'] || 'nosotros') as PaginaPublica;
      window.scrollTo({ top: 0, behavior: 'auto' });
    });

    this.api.informacionGym().subscribe({
      next:(r:any)=>{
        this.gymInfo=r||{};
        const datos=Array.isArray(r?.membresias)?r.membresias:[];
        if(datos.length){
          this.planes=datos.map((m:any)=>({
            nombre:m.nombre,
            precio:Number(m.precio||0),
            duracion_meses:Number(m.duracion_meses||1),
            subtitulo:Number(m.duracion_meses||1)===1 ? 'Mensualidad individual' : `Promoción por ${m.duracion_meses} meses`,
            destacado:Number(m.duracion_meses||1)===2,
            items:Array.isArray(m.beneficios)?m.beneficios:[m.descripcion].filter(Boolean)
          }));
        }
      },
      error:()=>{}
    });
  }

  ngOnDestroy(): void {
    document.documentElement.classList.remove('mallqui-public-scroll');
  }

  enviarConsulta(event: Event): void {
    event.preventDefault();
    const texto=`Hola Mallqui Gym,\n\nSoy ${this.contacto.nombre}.\n\n${this.contacto.mensaje}\n\nCorreo: ${this.contacto.correo}`;
    const correoGym=String(this.gymInfo?.correo||'').trim();

    if(correoGym){
      const asunto=encodeURIComponent(`Consulta Mallqui Gym - ${this.contacto.asunto}`);
      window.location.href=`mailto:${correoGym}?subject=${asunto}&body=${encodeURIComponent(texto)}`;
      return;
    }

    navigator.clipboard?.writeText(texto);
    alert(`Consulta copiada. Comunícate con Mallqui Gym al ${this.gymInfo?.telefono || '939398148'}.`);
  }
}
