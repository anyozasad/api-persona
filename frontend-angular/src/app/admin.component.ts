import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="admin-page">
    <aside class="admin-sidebar">
      <a routerLink="/" class="admin-logo"><img src="assets/mallqui-logo.png"></a>
      <nav><a class="active">▦ Dashboard</a><a>♙ Membresías</a><a>♙ Clientes</a><a>🏋 Entrenador</a><a>◉ Clases</a><a>▣ Asistencias</a><a>▤ Pagos</a><a>▥ Reportes</a><a>✦ Promociones</a><a>✉ Mensajes</a><a>⚙ Configuración</a></nav>
      <a routerLink="/" class="logout">↪ Cerrar sesión</a>
    </aside>
    <main class="admin-main">
      <header><div><h1>Panel Administrador</h1><p>Resumen general del gimnasio</p></div><div class="search">Buscar clientes, membresías, pagos... 🔍</div><div>🔔 <b>Administrador</b></div></header>

      <section class="admin-stats">
        <div><small>Total clientes</small><b>248</b><span class="green">+18 este mes</span></div>
        <div><small>Membresías activas</small><b>186</b><span>75% del total</span></div>
        <div><small>Ingresos del mes</small><b>S/ 28,540</b><span class="green">+12.6% vs mes anterior</span></div>
        <div><small>Asistencias de hoy</small><b>72</b><span>29% del total</span></div>
        <div><small>Clases programadas</small><b>18</b><span>Hoy</span></div>
        <div><small>Entrenador activo</small><b>1</b><span>Único entrenador</span></div>
      </section>

      <section class="admin-grid">
        <article class="admin-chart"><div class="section-title"><h2>Ingresos mensuales</h2><span>Este año⌄</span></div><svg viewBox="0 0 600 250" preserveAspectRatio="none"><defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f21f32" stop-opacity=".24"/><stop offset="1" stop-color="#f21f32" stop-opacity="0"/></linearGradient></defs><path d="M15 180 L65 160 L115 190 L165 168 L215 215 L265 175 L315 90 L365 125 L415 118 L465 140 L515 90 L585 35 L585 230 L15 230 Z" fill="url(#a)"/><polyline points="15,180 65,160 115,190 165,168 215,215 265,175 315,90 365,125 415,118 465,140 515,90 585,35" fill="none" stroke="#ef1f2f" stroke-width="4"/></svg></article>
        <article class="donut-card"><h2>Distribución de membresías</h2><div class="donut"><span>186<small>Activas</small></span></div><div><p>🔵 Básico 36</p><p>🔴 Premium 108</p><p>⚫ Pro 42</p></div></article>
        <article class="attendance-card"><h2>Asistencias por día</h2><div class="bars"><i style="height:56%"></i><i style="height:64%"></i><i style="height:78%"></i><i style="height:72%"></i><i style="height:69%"></i><i style="height:48%"></i><i style="height:12%"></i></div><div class="days"><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span></div></article>
        <article class="payments"><div class="section-title"><h2>Pagos recientes</h2><a>Ver todos los pagos →</a></div><table><thead><tr><th>ID</th><th>Cliente</th><th>Membresía</th><th>Monto</th><th>Método</th><th>Estado</th></tr></thead><tbody><tr *ngFor="let p of pagos"><td>#P-00{{p.id}}</td><td>{{p.cliente}}</td><td>{{p.plan}}</td><td>S/ {{p.monto}}</td><td>{{p.metodo}}</td><td><span class="paid">Completado</span></td></tr></tbody></table></article>
        <article class="next-classes"><div class="section-title"><h2>Próximas clases</h2><a>Ver todas →</a></div><div *ngFor="let c of clases"><span>{{c.icon}}</span><div><b>{{c.nombre}}</b><small>{{c.desc}}</small></div><strong>{{c.hora}}</strong><em>{{c.cupos}}</em></div></article>
        <article class="recent-users"><div class="section-title"><h2>Nuevos registros</h2><a>Ver todos →</a></div><div class="avatar-row"><span *ngFor="let u of usuarios"><img [src]="u.img"><b>{{u.nombre}}</b><small>{{u.plan}}</small></span></div></article>
        <article class="quick-summary"><h2>Resumen rápido</h2><div><span><b>18</b><small>Clientes nuevos</small></span><span><b>42</b><small>Renovaciones</small></span><span><b>6</b><small>Cancelaciones</small></span><span><b>S/ 118.32</b><small>Ticket promedio</small></span></div></article>
      </section>
    </main>
  </div>
  `
})
export class AdminComponent {
  pagos = [
    {id:124,cliente:'Carlos Ramírez',plan:'Premium',monto:'129.00',metodo:'Tarjeta'},
    {id:123,cliente:'Ana Torres',plan:'Básico',monto:'79.00',metodo:'Yape'},
    {id:122,cliente:'Luis Martínez',plan:'Pro',monto:'179.00',metodo:'Tarjeta'},
    {id:121,cliente:'María Gómez',plan:'Premium',monto:'129.00',metodo:'Efectivo'}
  ];
  clases = [
    {icon:'🏋',nombre:'Musculación',desc:'Fuerza e hipertrofia',hora:'Hoy, 10:00 AM',cupos:'8 / 12'},
    {icon:'⚡',nombre:'HIIT',desc:'Alta intensidad',hora:'Hoy, 11:00 AM',cupos:'10 / 15'},
    {icon:'🚴',nombre:'Spinning',desc:'Resistencia cardiovascular',hora:'Hoy, 6:00 PM',cupos:'6 / 12'},
    {icon:'🧘',nombre:'Yoga',desc:'Equilibrio y mente',hora:'Mañana, 9:00 AM',cupos:'7 / 15'}
  ];
  usuarios = [
    {nombre:'Pedro Huamán',plan:'Básico',img:'https://i.pravatar.cc/80?img=11'},
    {nombre:'Lucía Fernández',plan:'Premium',img:'https://i.pravatar.cc/80?img=32'},
    {nombre:'Diego Torres',plan:'Pro',img:'https://i.pravatar.cc/80?img=12'},
    {nombre:'Valeria Rojas',plan:'Premium',img:'https://i.pravatar.cc/80?img=47'}
  ];
}
