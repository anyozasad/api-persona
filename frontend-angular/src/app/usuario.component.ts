import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrls: ['../mallqui-member.css'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="member-page">
      <header class="member-topbar">
        <a routerLink="/" class="member-logo"><img src="assets/mallqui-logo.png" alt="Mallqui Gym"></a>
        <nav>
          <a class="active">⌂ Inicio</a><a>↗ Mi progreso</a><a>🏋 Rutinas</a><a>▣ Clases</a><a>◷ Reservas</a><a>▤ Pagos</a><a>♙ Perfil</a>
        </nav>
        <div class="member-account"><span class="bell">♧<b>3</b></span><img src="https://i.pravatar.cc/80?img=12" alt="Perfil"><p><strong>César Rojas</strong><small>Miembro Premium</small></p><span>⌄</span></div>
      </header>

      <main class="member-main">
        <section class="member-welcome">
          <div><h1>Hola, César <span>👋</span></h1><p>Listo para seguir superando tus límites hoy.</p></div>
          <div class="welcome-athlete"></div>
          <aside class="coach-card">
            <span class="coach-title">Tu entrenador</span>
            <div class="coach-body"><div class="coach-avatar"></div><div><h3>Juan Pérez</h3><b>Entrenador personal</b><p>Tu único entrenador, enfocado en acompañarte de forma personalizada.</p></div></div>
            <button>💬 Enviar mensaje</button>
          </aside>
        </section>

        <section class="member-stats">
          <article><span>🏋 Entrenamiento de hoy</span><h2>Pecho & Tríceps</h2><p>◷ 60 min &nbsp; · &nbsp; Intermedio</p><button class="primary-button">Ver rutina</button></article>
          <article><span>🔥 Calorías quemadas</span><h2>2,450 <small>kcal</small></h2><div class="spark orange"></div><p class="positive">+320 kcal vs. semana pasada</p></article>
          <article><span>▣ Asistencia este mes</span><h2>12 <small>de 16 clases</small></h2><div class="progress-track"><i style="width:75%"></i></div><p>75% de tu meta</p></article>
          <article><span>↗ Progreso general</span><h2>68%</h2><div class="spark green-line"></div><p class="positive">+8% vs. el mes pasado</p></article>
        </section>

        <section class="member-grid">
          <article class="next-routine dark-card">
            <div class="routine-photo"></div>
            <div class="routine-copy"><span>Tu próxima rutina <b>Mañana</b></span><h2>Espalda & Bíceps</h2><p>◷ 60 min &nbsp; · &nbsp; Intermedio</p>
              <ul><li>Remo con barra <small>4 series x 12 reps</small></li><li>Jalón al pecho <small>4 series x 10 reps</small></li><li>Curl de bíceps <small>4 series x 12 reps</small></li><li>Face pulls <small>3 series x 15 reps</small></li></ul>
              <button class="primary-button">Ver rutina completa →</button>
            </div>
          </article>

          <article class="weekly-card">
            <div class="card-heading"><h2>Tu progreso semanal</h2><button>Esta semana⌄</button></div>
            <svg class="member-chart" viewBox="0 0 680 270" preserveAspectRatio="none"><defs><linearGradient id="memberFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ef1f2f" stop-opacity=".24"/><stop offset="1" stop-color="#ef1f2f" stop-opacity="0"/></linearGradient></defs><path d="M25 225 L120 165 L215 90 L310 140 L405 88 L500 145 L590 95 L655 35 L655 245 L25 245Z" fill="url(#memberFill)"/><polyline points="25,225 120,165 215,90 310,140 405,88 500,145 590,95 655,35" fill="none" stroke="#ef1f2f" stroke-width="4"/></svg>
            <div class="week-days"><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span></div>
            <div class="chart-summary"><span><b>4</b><small>Entrenamientos</small></span><span><b>5h 20m</b><small>Tiempo total</small></span><span><b>2,450</b><small>Calorías</small></span><span><b>68%</b><small>Progreso</small></span></div>
          </article>

          <aside class="achievements-card"><div class="card-heading"><h2>Logros recientes</h2><a>Ver todos</a></div><div class="achievement-row"><span class="medal red">🔥</span><span class="medal blue">🏋</span><span class="medal emerald">★</span></div><div class="achievement-labels"><p><b>Racha de 7 días</b><small>Entrena 7 días</small></p><p><b>Fuerza constante</b><small>Completa 10 rutinas</small></p><p><b>Disciplina total</b><small>Asiste a 12 clases</small></p></div></aside>

          <article class="reserved-card"><div class="card-heading"><h2>Próximas clases reservadas</h2><a>Ver todas</a></div><div class="reserved-list"><div *ngFor="let c of clases"><img [src]="c.img" [alt]="c.nombre"><p><b>{{c.nombre}}</b><small>{{c.lugar}}</small><span>{{c.hora}}</span></p></div></div></article>
          <article class="hydration-card dark-card"><h2>💧 Mantente hidratado</h2><p>Lleva tu botella contigo y bebe al menos 2 litros de agua al día.</p><h3>1.2 L / 2 L</h3><div class="progress-track blue"><i style="width:60%"></i></div></article>
          <article class="nutrition-card"><div><h2>🥬 Consejo de nutrición</h2><b>Incluye proteínas en cada comida</b><p>Apoya tu recuperación y desarrollo muscular.</p><a>Ver más consejos →</a></div><div class="food-photo"></div></article>
        </section>

        <section class="member-actions"><h2>Accesos rápidos</h2><div><button>▣ Reservar clase</button><button>🏋 Ver rutina</button><button>▤ Mis pagos</button><button>♙ Mi perfil</button></div></section>
      </main>
    </div>
  `
})
export class UsuarioComponent {
  clases = [
    { nombre: 'HIIT', lugar: 'Sala funcional', hora: 'Hoy · 7:00 PM', img: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=320&q=80' },
    { nombre: 'Spinning', lugar: 'Sala cycling', hora: 'Mié · 6:30 PM', img: 'https://images.unsplash.com/photo-1530137073520-4ea6e2f10a48?auto=format&fit=crop&w=320&q=80' },
    { nombre: 'Yoga', lugar: 'Sala mente', hora: 'Vie · 8:00 AM', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=320&q=80' }
  ];
}
