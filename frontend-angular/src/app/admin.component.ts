import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="admin-shell">
      <aside class="admin-nav">
        <a routerLink="/" class="admin-brand"><img src="assets/mallqui-logo.png" alt="Mallqui Gym"></a>
        <nav><a class="active">▦ Dashboard</a><a>♙ Membresías</a><a>♙ Clientes</a><a>🏋 Entrenador</a><a>◉ Clases</a><a>▣ Asistencias</a><a>▤ Pagos</a><a>▥ Reportes</a><a>✦ Promociones</a><a>✉ Mensajes</a><a>⚙ Configuración</a></nav>
        <a routerLink="/" class="admin-logout">↪ Cerrar sesión</a>
      </aside>

      <main class="admin-content">
        <header class="admin-header"><div><h1>Panel Administrador</h1><p>Resumen general del gimnasio</p></div><label class="admin-search">Buscar clientes, membresías, pagos... <span>⌕</span></label><div class="admin-profile"><span>♧<b>8</b></span><img src="https://i.pravatar.cc/80?img=11"><p><strong>Administrador</strong><small>admin@mallquigym.com</small></p><i>⌄</i></div></header>

        <section class="admin-kpis">
          <article *ngFor="let k of kpis"><span class="kpi-icon" [class.red]="k.color==='red'" [class.green]="k.color==='green'">{{k.icon}}</span><p>{{k.nombre}}</p><h2>{{k.valor}}</h2><small [class.positive]="k.good">{{k.detalle}}</small></article>
        </section>

        <section class="admin-dashboard-grid">
          <article class="income-chart"><div class="card-heading"><h2>Ingresos mensuales</h2><button>Este año⌄</button></div><svg viewBox="0 0 720 280" preserveAspectRatio="none"><defs><linearGradient id="adminFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ef1f2f" stop-opacity=".22"/><stop offset="1" stop-color="#ef1f2f" stop-opacity="0"/></linearGradient></defs><path d="M20 180 L75 155 L130 195 L185 165 L240 220 L295 178 L350 95 L405 128 L460 120 L515 140 L570 92 L630 115 L695 45 L695 245 L20 245Z" fill="url(#adminFill)"/><polyline points="20,180 75,155 130,195 185,165 240,220 295,178 350,95 405,128 460,120 515,140 570,92 630,115 695,45" fill="none" stroke="#ef1f2f" stroke-width="4"/></svg><div class="month-labels"><span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span><span>Jul</span><span>Ago</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dic</span></div></article>

          <article class="membership-chart"><h2>Distribución de membresías</h2><div class="membership-body"><div class="admin-donut"><span><b>186</b><small>Activas</small></span></div><div class="legend"><p><i class="dot blue-dot"></i>Básico <b>36</b></p><p><i class="dot red-dot"></i>Premium <b>108</b></p><p><i class="dot dark-dot"></i>Pro <b>42</b></p></div></div></article>

          <article class="attendance-chart"><h2>Asistencias por día <small>(Esta semana)</small></h2><div class="admin-bars"><div *ngFor="let b of asistencia"><span>{{b.valor}}</span><i [style.height.%]="b.valor"></i><small>{{b.dia}}</small></div></div></article>

          <article class="payments-table"><div class="card-heading"><h2>Pagos recientes</h2><a>Ver todos los pagos →</a></div><div class="table-wrap"><table><thead><tr><th>ID Pago</th><th>Cliente</th><th>Membresía</th><th>Monto</th><th>Método</th><th>Fecha</th><th>Estado</th></tr></thead><tbody><tr *ngFor="let p of pagos"><td class="payment-id">{{p.id}}</td><td>{{p.cliente}}</td><td>{{p.plan}}</td><td>{{p.monto}}</td><td>{{p.metodo}}</td><td>{{p.fecha}}</td><td><span class="status-paid">Completado</span></td></tr></tbody></table></div></article>

          <article class="next-admin-classes"><div class="card-heading"><h2>Próximas clases</h2><a>Ver todas las clases →</a></div><div *ngFor="let c of clases"><span class="class-symbol" [class.blue]="c.color==='blue'" [class.green]="c.color==='green'">{{c.icon}}</span><p><b>{{c.nombre}}</b><small>{{c.desc}}</small></p><div><b>{{c.hora}}</b><small>{{c.sala}}</small></div><em>{{c.cupos}}</em></div></article>

          <article class="recent-admin-users"><div class="card-heading"><h2>Nuevos registros</h2><a>Ver todos los registros →</a></div><div class="new-user-row"><div *ngFor="let u of usuarios"><img [src]="u.img"><p><b>{{u.nombre}}</b><small>{{u.correo}}</small><span>{{u.fecha}}</span></p><em>{{u.plan}}</em></div></div></article>

          <article class="admin-summary"><h2>Resumen rápido</h2><div><span><b>18</b><small>Clientes nuevos</small><i class="positive">+12.5%</i></span><span><b>42</b><small>Renovaciones</small><i class="positive">+8.3%</i></span><span><b>6</b><small>Cancelaciones</small><i class="negative">-14.2%</i></span><span><b>S/ 118.32</b><small>Ticket promedio</small><i class="positive">+5.6%</i></span></div></article>
        </section>
      </main>
    </div>
  `
})
export class AdminComponent {
  kpis = [
    { icon: '♙', color: 'red', nombre: 'Total clientes', valor: '248', detalle: '+18 este mes', good: true },
    { icon: '✦', color: 'blue', nombre: 'Membresías activas', valor: '186', detalle: '75.0% del total', good: false },
    { icon: '$', color: 'green', nombre: 'Ingresos del mes', valor: 'S/ 28,540', detalle: '+12.6% vs mes anterior', good: true },
    { icon: '▣', color: 'blue', nombre: 'Asistencias de hoy', valor: '72', detalle: '29.0% del total', good: false },
    { icon: '▣', color: 'red', nombre: 'Clases programadas', valor: '18', detalle: 'Hoy', good: false },
    { icon: '♙', color: 'blue', nombre: 'Entrenador activo', valor: '1', detalle: 'Único entrenador', good: false }
  ];
  asistencia = [{dia:'Lun',valor:56},{dia:'Mar',valor:64},{dia:'Mié',valor:78},{dia:'Jue',valor:72},{dia:'Vie',valor:69},{dia:'Sáb',valor:48},{dia:'Dom',valor:12}];
  pagos = [
    { id:'#P-00124',cliente:'Carlos Ramírez',plan:'Premium',monto:'S/ 129.00',metodo:'Tarjeta',fecha:'25 May 2026, 10:32' },
    { id:'#P-00123',cliente:'Ana Torres',plan:'Básico',monto:'S/ 79.00',metodo:'Yape',fecha:'25 May 2026, 09:18' },
    { id:'#P-00122',cliente:'Luis Martínez',plan:'Pro',monto:'S/ 179.00',metodo:'Tarjeta',fecha:'24 May 2026, 19:45' },
    { id:'#P-00121',cliente:'María Gómez',plan:'Premium',monto:'S/ 129.00',metodo:'Efectivo',fecha:'24 May 2026, 17:20' }
  ];
  clases = [
    {icon:'🏋',color:'red',nombre:'Musculación',desc:'Fuerza e hipertrofia',hora:'Hoy, 10:00 AM',sala:'Sala de Pesas',cupos:'8 / 12'},
    {icon:'⚡',color:'blue',nombre:'HIIT',desc:'Alta intensidad',hora:'Hoy, 11:00 AM',sala:'Sala Funcional',cupos:'10 / 15'},
    {icon:'🚴',color:'blue',nombre:'Spinning',desc:'Resistencia cardiovascular',hora:'Hoy, 6:00 PM',sala:'Sala Spinning',cupos:'6 / 12'},
    {icon:'🧘',color:'green',nombre:'Yoga',desc:'Equilibrio y mente',hora:'Mañana, 9:00 AM',sala:'Sala Mind & Body',cupos:'7 / 15'}
  ];
  usuarios = [
    {nombre:'Pedro Huamán',correo:'pedro.huaman@email.com',fecha:'25 May 2026, 11:20',plan:'Básico',img:'https://i.pravatar.cc/80?img=11'},
    {nombre:'Lucía Fernández',correo:'lucia.fernandez@email.com',fecha:'25 May 2026, 10:45',plan:'Premium',img:'https://i.pravatar.cc/80?img=32'},
    {nombre:'Diego Torres',correo:'diego.torres@email.com',fecha:'25 May 2026, 09:05',plan:'Pro',img:'https://i.pravatar.cc/80?img=12'},
    {nombre:'Valeria Rojas',correo:'valeria.rojas@email.com',fecha:'24 May 2026, 20:10',plan:'Premium',img:'https://i.pravatar.cc/80?img=47'}
  ];
}
