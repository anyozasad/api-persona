import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [RouterLink],
  template: `
  <div class="user-page">
    <header class="user-nav">
      <a routerLink="/" class="brand-small"><img src="assets/mallqui-logo.png"></a>
      <nav><a class="active">⌂ Inicio</a><a>↗ Mi progreso</a><a>🏋 Rutinas</a><a>▣ Clases</a><a>◷ Reservas</a><a>▤ Pagos</a><a>♙ Perfil</a></nav>
      <div class="user-mini">🔔 <span class="badge">3</span><img src="https://i.pravatar.cc/80?img=12"> <b>César</b></div>
    </header>

    <main class="user-wrap">
      <section class="user-hello">
        <div><h1>Hola, César 👋</h1><p>Listo para seguir superando tus límites hoy.</p></div>
        <div class="trainer-card">
          <div class="trainer-photo"></div><div><small>TU ENTRENADOR</small><h3>Juan Pérez</h3><p>Entrenador personal</p><button>Enviar mensaje</button></div>
        </div>
      </section>

      <section class="stats-row">
        <div><span>Entrenamiento de hoy</span><b>Pecho & Tríceps</b><small>60 min · Intermedio</small><button>Ver rutina</button></div>
        <div><span>🔥 Calorías quemadas</span><b>2,450 <small>kcal</small></b><small class="green">+320 kcal vs. semana pasada</small></div>
        <div><span>▣ Asistencia este mes</span><b>12 <small>de 16 clases</small></b><div class="progress"><i style="width:75%"></i></div><small>75% de tu meta</small></div>
        <div><span>↗ Progreso general</span><b>68%</b><small class="green">+8% vs. el mes pasado</small></div>
      </section>

      <section class="dashboard-grid">
        <article class="routine-dark">
          <div class="routine-img"></div>
          <div><small>TU PRÓXIMA RUTINA · MAÑANA</small><h2>Espalda & Bíceps</h2>
          <p>◉ Remo con barra <span>4 x 12</span></p><p>◉ Jalón al pecho <span>4 x 10</span></p><p>◉ Curl de bíceps <span>4 x 12</span></p><p>◉ Face pulls <span>3 x 15</span></p>
          <button class="btn btn-red">Ver rutina completa →</button></div>
        </article>

        <article class="chart-card"><div class="section-title"><h2>Tu progreso semanal</h2><span>Esta semana⌄</span></div>
          <div class="line-chart"><svg viewBox="0 0 600 240" preserveAspectRatio="none"><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ef1f2f" stop-opacity=".25"/><stop offset="1" stop-color="#ef1f2f" stop-opacity="0"/></linearGradient></defs><path d="M20 200 L105 145 L190 85 L275 125 L360 80 L445 125 L530 65 L580 25 L580 220 L20 220 Z" fill="url(#fill)"/><polyline points="20,200 105,145 190,85 275,125 360,80 445,125 530,65 580,25" fill="none" stroke="#ef1f2f" stroke-width="4"/><g fill="#ef1f2f"><circle cx="20" cy="200" r="6"/><circle cx="105" cy="145" r="6"/><circle cx="190" cy="85" r="6"/><circle cx="275" cy="125" r="6"/><circle cx="360" cy="80" r="6"/><circle cx="445" cy="125" r="6"/><circle cx="530" cy="65" r="6"/><circle cx="580" cy="25" r="6"/></g></svg></div>
          <div class="mini-stats"><span>🏋 <b>4</b><small>Entrenamientos</small></span><span>◷ <b>5h 20m</b><small>Tiempo total</small></span><span>🔥 <b>2,450</b><small>Calorías</small></span><span>↗ <b>68%</b><small>Progreso</small></span></div>
        </article>

        <aside class="achievements"><h2>Logros recientes</h2><div class="medals"><span>🔥<b>Racha de 7 días</b></span><span>🏋<b>Fuerza constante</b></span><span>★<b>Disciplina total</b></span></div></aside>

        <article class="classes-user"><div class="section-title"><h2>Próximas clases reservadas</h2><a>Ver todas</a></div><div class="class-list"><div>⚡ <b>HIIT</b><small>Hoy · 7:00 PM</small></div><div>🚴 <b>Spinning</b><small>Mié · 6:30 PM</small></div><div>🧘 <b>Yoga</b><small>Vie · 8:00 AM</small></div></div></article>
        <article class="tip-dark"><h2>💧 Mantente hidratado</h2><p>Lleva tu botella contigo y bebe al menos 2 litros de agua al día.</p><b>1.2 L / 2 L</b><div class="progress blue"><i style="width:60%"></i></div></article>
        <article class="nutrition"><div><h2>🥗 Consejo de nutrición</h2><b>Incluye proteínas en cada comida</b><p>Ayuda a tu recuperación y desarrollo muscular.</p></div></article>
      </section>
    </main>
  </div>
  `
})
export class UsuarioComponent {}
