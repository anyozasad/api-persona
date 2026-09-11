import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styleUrls: ['../mallqui-admin.css'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="admin-shell">
      <aside class="admin-nav">
        <a routerLink="/" class="admin-brand"><img src="assets/mallqui-logo.png" alt="Mallqui Gym"></a>
        <nav>
          <button *ngFor="let item of menu" type="button" [class.active]="seccion===item.id" (click)="cambiarSeccion(item.id)">
            <span>{{item.icono}}</span>{{item.nombre}}
          </button>
        </nav>
        <a routerLink="/login" class="admin-logout">↪ Cerrar sesión</a>
      </aside>

      <main class="admin-content">
        <header class="admin-header">
          <div><h1>{{tituloActual}}</h1><p>{{subtituloActual}}</p></div>
          <label class="admin-search">
            <input [(ngModel)]="busqueda" placeholder="Buscar clientes, membresías, pagos...">
            <span>⌕</span>
          </label>
          <div class="admin-profile-wrap">
            <button type="button" class="admin-profile" (click)="perfilAbierto=!perfilAbierto">
              <span>♧<b>{{mensajesNoLeidos}}</b></span>
              <img src="https://i.pravatar.cc/80?img=11" alt="Administrador">
              <p><strong>Administrador</strong><small>admin@mallquigym.com</small></p><i>⌄</i>
            </button>
            <div *ngIf="perfilAbierto" class="profile-menu">
              <button (click)="cambiarSeccion('configuracion')">⚙ Configuración</button>
              <button (click)="cambiarSeccion('mensajes')">✉ Mensajes</button>
              <a routerLink="/login">↪ Cerrar sesión</a>
            </div>
          </div>
        </header>

        <div *ngIf="toast" class="admin-toast">✓ {{toast}}</div>

        <ng-container *ngIf="seccion==='dashboard'">
          <section class="admin-kpis">
            <article *ngFor="let k of kpis"><span class="kpi-icon" [class.red]="k.color==='red'" [class.green]="k.color==='green'">{{k.icon}}</span><p>{{k.nombre}}</p><h2>{{k.valor}}</h2><small [class.positive]="k.good">{{k.detalle}}</small></article>
          </section>

          <section class="admin-dashboard-grid">
            <article class="income-chart"><div class="card-heading"><h2>Ingresos mensuales</h2><button type="button" (click)="cambiarSeccion('reportes')">Ver reporte</button></div><svg viewBox="0 0 720 280" preserveAspectRatio="none"><defs><linearGradient id="adminFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ef1f2f" stop-opacity=".22"/><stop offset="1" stop-color="#ef1f2f" stop-opacity="0"/></linearGradient></defs><path d="M20 180 L75 155 L130 195 L185 165 L240 220 L295 178 L350 95 L405 128 L460 120 L515 140 L570 92 L630 115 L695 45 L695 245 L20 245Z" fill="url(#adminFill)"/><polyline points="20,180 75,155 130,195 185,165 240,220 295,178 350,95 405,128 460,120 515,140 570,92 630,115 695,45" fill="none" stroke="#ef1f2f" stroke-width="4"/></svg><div class="month-labels"><span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span><span>Jul</span><span>Ago</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dic</span></div></article>

            <article class="membership-chart"><h2>Distribución de membresías</h2><div class="membership-body"><div class="admin-donut"><span><b>{{membresiasActivas}}</b><small>Activas</small></span></div><div class="legend"><p><i class="dot blue-dot"></i>Básico <b>36</b></p><p><i class="dot red-dot"></i>Premium <b>108</b></p><p><i class="dot dark-dot"></i>Pro <b>42</b></p></div></div></article>

            <article class="attendance-chart"><h2>Asistencias por día <small>(Esta semana)</small></h2><div class="admin-bars"><div *ngFor="let b of asistencia"><span>{{b.valor}}</span><i [style.height.%]="b.valor"></i><small>{{b.dia}}</small></div></div></article>

            <article class="payments-table"><div class="card-heading"><h2>Pagos recientes</h2><button type="button" class="text-action" (click)="cambiarSeccion('pagos')">Ver todos los pagos →</button></div><div class="table-wrap"><table><thead><tr><th>ID Pago</th><th>Cliente</th><th>Membresía</th><th>Monto</th><th>Método</th><th>Fecha</th><th>Estado</th></tr></thead><tbody><tr *ngFor="let p of pagos.slice(0,4)"><td class="payment-id">{{p.id}}</td><td>{{p.cliente}}</td><td>{{p.plan}}</td><td>{{p.monto}}</td><td>{{p.metodo}}</td><td>{{p.fecha}}</td><td><span class="status-paid">{{p.estado}}</span></td></tr></tbody></table></div></article>

            <article class="next-admin-classes"><div class="card-heading"><h2>Próximas clases</h2><button type="button" class="text-action" (click)="cambiarSeccion('clases')">Ver todas las clases →</button></div><div *ngFor="let c of clases.slice(0,4)"><span class="class-symbol" [class.blue]="c.color==='blue'" [class.green]="c.color==='green'">{{c.icon}}</span><p><b>{{c.nombre}}</b><small>{{c.desc}}</small></p><div><b>{{c.hora}}</b><small>{{c.sala}}</small></div><em>{{c.cupos}}</em></div></article>

            <article class="recent-admin-users"><div class="card-heading"><h2>Nuevos registros</h2><button type="button" class="text-action" (click)="cambiarSeccion('clientes')">Ver todos los registros →</button></div><div class="new-user-row"><div *ngFor="let u of clientes.slice(0,4)"><img [src]="u.img"><p><b>{{u.nombre}}</b><small>{{u.correo}}</small><span>{{u.fecha}}</span></p><em>{{u.plan}}</em></div></div></article>

            <article class="admin-summary"><h2>Resumen rápido</h2><div><span><b>{{clientes.length}}</b><small>Clientes registrados</small><i class="positive">Actualizado</i></span><span><b>{{membresiasActivas}}</b><small>Membresías activas</small><i class="positive">En curso</i></span><span><b>{{pagos.length}}</b><small>Pagos registrados</small><i class="positive">Historial</i></span><span><b>{{clases.length}}</b><small>Clases disponibles</small><i class="positive">Programadas</i></span></div></article>
          </section>
        </ng-container>

        <ng-container *ngIf="seccion==='clientes'">
          <section class="management-grid">
            <article class="admin-form-card">
              <div class="management-heading"><div><h2>Registrar cliente</h2><p>Agrega un nuevo miembro al gimnasio.</p></div><span>＋</span></div>
              <form (ngSubmit)="agregarCliente()">
                <label>Nombre completo<input [(ngModel)]="clienteForm.nombre" name="cnombre" required></label>
                <label>Correo<input type="email" [(ngModel)]="clienteForm.correo" name="ccorreo" required></label>
                <div class="form-row"><label>Teléfono<input [(ngModel)]="clienteForm.telefono" name="ctelefono"></label><label>Plan<select [(ngModel)]="clienteForm.plan" name="cplan"><option>Básico</option><option>Premium</option><option>Pro</option></select></label></div>
                <button class="admin-primary" type="submit">Guardar cliente</button>
              </form>
            </article>
            <article class="admin-list-card wide-card"><div class="management-heading"><div><h2>Clientes</h2><p>{{clientesFiltrados.length}} resultados</p></div><button class="admin-secondary" (click)="exportarClientes()">↓ Exportar CSV</button></div><div class="table-wrap"><table class="management-table"><thead><tr><th>Cliente</th><th>Correo</th><th>Teléfono</th><th>Plan</th><th>Estado</th><th>Acción</th></tr></thead><tbody><tr *ngFor="let c of clientesFiltrados"><td class="client-cell"><img [src]="c.img"><b>{{c.nombre}}</b></td><td>{{c.correo}}</td><td>{{c.telefono}}</td><td><span class="plan-pill">{{c.plan}}</span></td><td><span class="status-active">Activo</span></td><td><button class="table-danger" (click)="eliminarCliente(c.id)">Eliminar</button></td></tr></tbody></table></div></article>
          </section>
        </ng-container>

        <ng-container *ngIf="seccion==='membresias'">
          <section class="management-grid">
            <article class="admin-form-card"><div class="management-heading"><div><h2>Nueva membresía</h2><p>Asigna o renueva un plan.</p></div><span>✦</span></div><form (ngSubmit)="agregarMembresia()"><label>Cliente<select [(ngModel)]="membresiaForm.cliente" name="mcliente" required><option value="">Seleccionar</option><option *ngFor="let c of clientes" [value]="c.nombre">{{c.nombre}}</option></select></label><div class="form-row"><label>Plan<select [(ngModel)]="membresiaForm.plan" name="mplan"><option>Básico</option><option>Premium</option><option>Pro</option></select></label><label>Meses<input type="number" min="1" [(ngModel)]="membresiaForm.meses" name="mmeses"></label></div><button class="admin-primary">Activar membresía</button></form></article>
            <article class="admin-list-card wide-card"><div class="management-heading"><div><h2>Membresías activas</h2><p>Control de vigencia y renovación.</p></div><span class="big-number">{{membresiasActivas}}</span></div><div class="table-wrap"><table class="management-table"><thead><tr><th>ID</th><th>Cliente</th><th>Plan</th><th>Inicio</th><th>Vence</th><th>Estado</th><th>Acción</th></tr></thead><tbody><tr *ngFor="let m of membresias"><td>{{m.id}}</td><td><b>{{m.cliente}}</b></td><td>{{m.plan}}</td><td>{{m.inicio}}</td><td>{{m.fin}}</td><td><span [class.status-active]="m.estado==='Activa'" [class.status-paused]="m.estado!=='Activa'">{{m.estado}}</span></td><td><button class="table-action" (click)="alternarMembresia(m)">{{m.estado==='Activa'?'Pausar':'Activar'}}</button></td></tr></tbody></table></div></article>
          </section>
        </ng-container>

        <ng-container *ngIf="seccion==='entrenador'">
          <section class="trainer-layout"><article class="trainer-card"><div class="trainer-photo"></div><div><span class="status-active">Entrenador activo</span><h2>{{entrenador.nombre}}</h2><p>{{entrenador.especialidad}}</p><small>{{entrenador.correo}} · {{entrenador.telefono}}</small><div class="trainer-stats"><span><b>1</b><small>Entrenador</small></span><span><b>{{clases.length}}</b><small>Clases</small></span><span><b>4.9</b><small>Valoración</small></span></div></div></article><article class="admin-form-card"><div class="management-heading"><div><h2>Datos del entrenador</h2><p>Actualiza la información profesional.</p></div><span>🏋</span></div><form (ngSubmit)="guardarEntrenador()"><label>Nombre<input [(ngModel)]="entrenador.nombre" name="enombre"></label><label>Especialidad<input [(ngModel)]="entrenador.especialidad" name="eespecialidad"></label><div class="form-row"><label>Correo<input [(ngModel)]="entrenador.correo" name="ecorreo"></label><label>Teléfono<input [(ngModel)]="entrenador.telefono" name="etelefono"></label></div><button class="admin-primary">Guardar cambios</button></form></article></section>
        </ng-container>

        <ng-container *ngIf="seccion==='clases'">
          <section class="management-grid"><article class="admin-form-card"><div class="management-heading"><div><h2>Programar clase</h2><p>Organiza horarios y cupos.</p></div><span>◉</span></div><form (ngSubmit)="agregarClase()"><label>Nombre<input [(ngModel)]="claseForm.nombre" name="clnombre" required></label><label>Descripción<input [(ngModel)]="claseForm.desc" name="cldesc"></label><div class="form-row"><label>Horario<input [(ngModel)]="claseForm.hora" name="clhora" placeholder="Hoy, 6:00 PM"></label><label>Sala<input [(ngModel)]="claseForm.sala" name="clsala"></label></div><label>Cupos<input type="number" [(ngModel)]="claseForm.max" name="clmax" min="1"></label><button class="admin-primary">Programar clase</button></form></article><article class="admin-list-card wide-card"><div class="management-heading"><div><h2>Clases programadas</h2><p>{{clases.length}} clases registradas.</p></div></div><div class="class-manager-grid"><div *ngFor="let c of clases" class="class-manager-card"><span class="class-symbol" [class.blue]="c.color==='blue'" [class.green]="c.color==='green'">{{c.icon}}</span><div><h3>{{c.nombre}}</h3><p>{{c.desc}}</p><small>{{c.hora}} · {{c.sala}}</small></div><b>{{c.cupos}}</b><button class="table-danger" (click)="eliminarClase(c.id)">Eliminar</button></div></div></article></section>
        </ng-container>

        <ng-container *ngIf="seccion==='asistencias'">
          <section class="management-grid"><article class="admin-form-card"><div class="management-heading"><div><h2>Registrar asistencia</h2><p>Marca el ingreso de un cliente.</p></div><span>▣</span></div><form (ngSubmit)="registrarAsistencia()"><label>Cliente<select [(ngModel)]="asistenciaForm.cliente" name="acliente"><option value="">Seleccionar</option><option *ngFor="let c of clientes" [value]="c.nombre">{{c.nombre}}</option></select></label><label>Clase<select [(ngModel)]="asistenciaForm.clase" name="aclase"><option>Gimnasio libre</option><option *ngFor="let c of clases" [value]="c.nombre">{{c.nombre}}</option></select></label><button class="admin-primary">Registrar ingreso</button></form></article><article class="admin-list-card wide-card"><div class="management-heading"><div><h2>Asistencias de hoy</h2><p>{{registrosAsistencia.length}} ingresos registrados.</p></div></div><div class="table-wrap"><table class="management-table"><thead><tr><th>Hora</th><th>Cliente</th><th>Actividad</th><th>Estado</th></tr></thead><tbody><tr *ngFor="let a of registrosAsistencia"><td>{{a.hora}}</td><td><b>{{a.cliente}}</b></td><td>{{a.clase}}</td><td><span class="status-active">Ingresó</span></td></tr></tbody></table></div></article></section>
        </ng-container>

        <ng-container *ngIf="seccion==='pagos'">
          <section class="management-grid"><article class="admin-form-card"><div class="management-heading"><div><h2>Registrar pago</h2><p>Guarda ventas de membresías.</p></div><span>▤</span></div><form (ngSubmit)="agregarPago()"><label>Cliente<select [(ngModel)]="pagoForm.cliente" name="pcliente"><option value="">Seleccionar</option><option *ngFor="let c of clientes" [value]="c.nombre">{{c.nombre}}</option></select></label><div class="form-row"><label>Plan<select [(ngModel)]="pagoForm.plan" name="pplan"><option>Básico</option><option>Premium</option><option>Pro</option></select></label><label>Monto<input type="number" [(ngModel)]="pagoForm.monto" name="pmonto"></label></div><label>Método<select [(ngModel)]="pagoForm.metodo" name="pmetodo"><option>Efectivo</option><option>Yape</option><option>Plin</option><option>Tarjeta</option></select></label><button class="admin-primary">Registrar pago</button></form></article><article class="admin-list-card wide-card"><div class="management-heading"><div><h2>Historial de pagos</h2><p>{{pagosFiltrados.length}} registros.</p></div><button class="admin-secondary" (click)="exportarPagos()">↓ Exportar CSV</button></div><div class="table-wrap"><table class="management-table"><thead><tr><th>ID</th><th>Cliente</th><th>Plan</th><th>Monto</th><th>Método</th><th>Fecha</th><th>Estado</th></tr></thead><tbody><tr *ngFor="let p of pagosFiltrados"><td class="payment-id">{{p.id}}</td><td>{{p.cliente}}</td><td>{{p.plan}}</td><td>{{p.monto}}</td><td>{{p.metodo}}</td><td>{{p.fecha}}</td><td><span class="status-paid">{{p.estado}}</span></td></tr></tbody></table></div></article></section>
        </ng-container>

        <ng-container *ngIf="seccion==='reportes'">
          <section class="report-grid"><article><span>👥</span><p>Clientes registrados</p><h2>{{clientes.length}}</h2></article><article><span>✦</span><p>Membresías activas</p><h2>{{membresiasActivas}}</h2></article><article><span>💵</span><p>Pagos registrados</p><h2>{{pagos.length}}</h2></article><article><span>▣</span><p>Asistencias hoy</p><h2>{{registrosAsistencia.length}}</h2></article></section><article class="report-panel"><div class="management-heading"><div><h2>Reportes del negocio</h2><p>Descarga información para control y toma de decisiones.</p></div></div><div class="report-actions"><button (click)="exportarClientes()">👥 Reporte de clientes <span>CSV ↓</span></button><button (click)="exportarPagos()">💳 Reporte de pagos <span>CSV ↓</span></button><button (click)="exportarAsistencias()">▣ Reporte de asistencias <span>CSV ↓</span></button></div></article>
        </ng-container>

        <ng-container *ngIf="seccion==='promociones'">
          <section class="management-grid"><article class="admin-form-card"><div class="management-heading"><div><h2>Nueva promoción</h2><p>Crea campañas para atraer y retener clientes.</p></div><span>✦</span></div><form (ngSubmit)="agregarPromocion()"><label>Título<input [(ngModel)]="promocionForm.titulo" name="prtitulo"></label><div class="form-row"><label>Descuento %<input type="number" [(ngModel)]="promocionForm.descuento" name="prdescuento"></label><label>Vigencia<input type="date" [(ngModel)]="promocionForm.hasta" name="prhasta"></label></div><label>Descripción<textarea [(ngModel)]="promocionForm.descripcion" name="prdesc"></textarea></label><button class="admin-primary">Publicar promoción</button></form></article><article class="admin-list-card wide-card"><div class="management-heading"><div><h2>Promociones</h2><p>Activa o pausa campañas vigentes.</p></div></div><div class="promo-grid"><div *ngFor="let p of promociones" class="promo-card"><span>-{{p.descuento}}%</span><h3>{{p.titulo}}</h3><p>{{p.descripcion}}</p><small>Hasta {{p.hasta}}</small><button [class.admin-primary]="p.activa" [class.admin-secondary]="!p.activa" (click)="alternarPromocion(p)">{{p.activa?'Activa':'Pausada'}}</button></div></div></article></section>
        </ng-container>

        <ng-container *ngIf="seccion==='mensajes'">
          <section class="messages-layout"><article class="messages-list"><div class="management-heading"><div><h2>Bandeja de entrada</h2><p>Consultas y avisos de clientes.</p></div></div><button *ngFor="let m of mensajes" [class.unread]="!m.leido" (click)="abrirMensaje(m)"><span>{{m.nombre.charAt(0)}}</span><div><b>{{m.nombre}}</b><p>{{m.asunto}}</p><small>{{m.hora}}</small></div></button></article><article class="message-detail" *ngIf="mensajeSeleccionado; else sinMensaje"><div><span class="avatar-big">{{mensajeSeleccionado.nombre.charAt(0)}}</span><h2>{{mensajeSeleccionado.asunto}}</h2><p class="message-from">{{mensajeSeleccionado.nombre}} · {{mensajeSeleccionado.correo}}</p><p class="message-body">{{mensajeSeleccionado.texto}}</p></div><textarea [(ngModel)]="respuestaMensaje" placeholder="Escribe una respuesta..."></textarea><button class="admin-primary" (click)="responderMensaje()">Enviar respuesta</button></article><ng-template #sinMensaje><article class="message-empty">✉<h2>Selecciona un mensaje</h2><p>Abre una conversación para leer y responder.</p></article></ng-template></section>
        </ng-container>

        <ng-container *ngIf="seccion==='configuracion'">
          <section class="settings-grid"><article class="admin-form-card"><div class="management-heading"><div><h2>Datos del gimnasio</h2><p>Información mostrada en el sistema.</p></div><span>⚙</span></div><form (ngSubmit)="guardarConfiguracion()"><label>Nombre comercial<input [(ngModel)]="config.nombre" name="gnombre"></label><label>Dirección<input [(ngModel)]="config.direccion" name="gdireccion"></label><div class="form-row"><label>Teléfono<input [(ngModel)]="config.telefono" name="gtelefono"></label><label>Correo<input [(ngModel)]="config.correo" name="gcorreo"></label></div><label>Horario<input [(ngModel)]="config.horario" name="ghorario"></label><button class="admin-primary">Guardar configuración</button></form></article><article class="settings-preview"><img src="assets/mallqui-logo.png"><h2>{{config.nombre}}</h2><p>{{config.direccion}}</p><span>☎ {{config.telefono}}</span><span>✉ {{config.correo}}</span><span>◷ {{config.horario}}</span><div class="security-note"><b>Seguridad</b><p>Los cambios del panel se guardan localmente en este equipo. La siguiente etapa será conectarlos a la API Laravel y base de datos.</p></div></article></section>
        </ng-container>
      </main>
    </div>
  `
})
export class AdminComponent {
  seccion = 'dashboard';
  busqueda = '';
  toast = '';
  perfilAbierto = false;
  respuestaMensaje = '';
  mensajeSeleccionado: any = null;

  menu = [
    {id:'dashboard',icono:'▦',nombre:'Dashboard'}, {id:'membresias',icono:'♙',nombre:'Membresías'},
    {id:'clientes',icono:'♙',nombre:'Clientes'}, {id:'entrenador',icono:'🏋',nombre:'Entrenador'},
    {id:'clases',icono:'◉',nombre:'Clases'}, {id:'asistencias',icono:'▣',nombre:'Asistencias'},
    {id:'pagos',icono:'▤',nombre:'Pagos'}, {id:'reportes',icono:'▥',nombre:'Reportes'},
    {id:'promociones',icono:'✦',nombre:'Promociones'}, {id:'mensajes',icono:'✉',nombre:'Mensajes'},
    {id:'configuracion',icono:'⚙',nombre:'Configuración'}
  ];

  private titulos: Record<string,[string,string]> = {
    dashboard:['Panel Administrador','Resumen general del gimnasio'], membresias:['Membresías','Planes, renovaciones y vigencias'],
    clientes:['Clientes','Registro y administración de miembros'], entrenador:['Entrenador','Gestión del único entrenador de Mallqui Gym'],
    clases:['Clases','Programación, horarios y cupos'], asistencias:['Asistencias','Control diario de ingresos'],
    pagos:['Pagos','Ventas, métodos de pago e historial'], reportes:['Reportes','Indicadores para la toma de decisiones'],
    promociones:['Promociones','Campañas y descuentos comerciales'], mensajes:['Mensajes','Comunicación con clientes'],
    configuracion:['Configuración','Datos generales del gimnasio']
  };

  get tituloActual(){ return this.titulos[this.seccion][0]; }
  get subtituloActual(){ return this.titulos[this.seccion][1]; }
  get mensajesNoLeidos(){ return this.mensajes.filter(m=>!m.leido).length; }
  get membresiasActivas(){ return this.membresias.filter(m=>m.estado==='Activa').length; }
  get clientesFiltrados(){ const q=this.busqueda.toLowerCase().trim(); return !q?this.clientes:this.clientes.filter(c=>(c.nombre+c.correo+c.plan+c.telefono).toLowerCase().includes(q)); }
  get pagosFiltrados(){ const q=this.busqueda.toLowerCase().trim(); return !q?this.pagos:this.pagos.filter(p=>(p.id+p.cliente+p.plan+p.metodo).toLowerCase().includes(q)); }

  kpis = [
    { icon: '♙', color: 'red', nombre: 'Total clientes', valor: '248', detalle: '+18 este mes', good: true },
    { icon: '✦', color: 'blue', nombre: 'Membresías activas', valor: '186', detalle: '75.0% del total', good: false },
    { icon: '$', color: 'green', nombre: 'Ingresos del mes', valor: 'S/ 28,540', detalle: '+12.6% vs mes anterior', good: true },
    { icon: '▣', color: 'blue', nombre: 'Asistencias de hoy', valor: '72', detalle: '29.0% del total', good: false },
    { icon: '▣', color: 'red', nombre: 'Clases programadas', valor: '18', detalle: 'Hoy', good: false },
    { icon: '♙', color: 'blue', nombre: 'Entrenador activo', valor: '1', detalle: 'Único entrenador', good: false }
  ];
  asistencia = [{dia:'Lun',valor:56},{dia:'Mar',valor:64},{dia:'Mié',valor:78},{dia:'Jue',valor:72},{dia:'Vie',valor:69},{dia:'Sáb',valor:48},{dia:'Dom',valor:12}];

  clientes:any[] = [
    {id:1,nombre:'Pedro Huamán',correo:'pedro.huaman@email.com',telefono:'987 120 340',fecha:'25 May 2026, 11:20',plan:'Básico',img:'https://i.pravatar.cc/80?img=11'},
    {id:2,nombre:'Lucía Fernández',correo:'lucia.fernandez@email.com',telefono:'986 222 110',fecha:'25 May 2026, 10:45',plan:'Premium',img:'https://i.pravatar.cc/80?img=32'},
    {id:3,nombre:'Diego Torres',correo:'diego.torres@email.com',telefono:'985 431 900',fecha:'25 May 2026, 09:05',plan:'Pro',img:'https://i.pravatar.cc/80?img=12'},
    {id:4,nombre:'Valeria Rojas',correo:'valeria.rojas@email.com',telefono:'982 771 420',fecha:'24 May 2026, 20:10',plan:'Premium',img:'https://i.pravatar.cc/80?img=47'}
  ];
  clienteForm:any = {nombre:'',correo:'',telefono:'',plan:'Básico'};

  membresias:any[] = [
    {id:'M-001',cliente:'Lucía Fernández',plan:'Premium',inicio:'01/08/2026',fin:'31/08/2026',estado:'Activa'},
    {id:'M-002',cliente:'Diego Torres',plan:'Pro',inicio:'05/08/2026',fin:'04/09/2026',estado:'Activa'},
    {id:'M-003',cliente:'Pedro Huamán',plan:'Básico',inicio:'10/08/2026',fin:'09/09/2026',estado:'Activa'}
  ];
  membresiaForm:any = {cliente:'',plan:'Básico',meses:1};

  entrenador:any = {nombre:'Juan Pérez',especialidad:'Musculación y entrenamiento funcional',correo:'juan@mallquigym.com',telefono:'999 444 333'};

  clases:any[] = [
    {id:1,icon:'🏋',color:'red',nombre:'Musculación',desc:'Fuerza e hipertrofia',hora:'Hoy, 10:00 AM',sala:'Sala de Pesas',cupos:'8 / 12'},
    {id:2,icon:'⚡',color:'blue',nombre:'HIIT',desc:'Alta intensidad',hora:'Hoy, 11:00 AM',sala:'Sala Funcional',cupos:'10 / 15'},
    {id:3,icon:'🚴',color:'blue',nombre:'Spinning',desc:'Resistencia cardiovascular',hora:'Hoy, 6:00 PM',sala:'Sala Spinning',cupos:'6 / 12'},
    {id:4,icon:'🧘',color:'green',nombre:'Yoga',desc:'Equilibrio y mente',hora:'Mañana, 9:00 AM',sala:'Sala Mind & Body',cupos:'7 / 15'}
  ];
  claseForm:any = {nombre:'',desc:'',hora:'',sala:'Sala Principal',max:12};

  registrosAsistencia:any[] = [
    {hora:'07:12',cliente:'Pedro Huamán',clase:'Gimnasio libre'},
    {hora:'07:35',cliente:'Lucía Fernández',clase:'Musculación'},
    {hora:'08:10',cliente:'Diego Torres',clase:'HIIT'}
  ];
  asistenciaForm:any = {cliente:'',clase:'Gimnasio libre'};

  pagos:any[] = [
    { id:'#P-00124',cliente:'Carlos Ramírez',plan:'Premium',monto:'S/ 129.00',metodo:'Tarjeta',fecha:'25 May 2026, 10:32',estado:'Completado' },
    { id:'#P-00123',cliente:'Ana Torres',plan:'Básico',monto:'S/ 79.00',metodo:'Yape',fecha:'25 May 2026, 09:18',estado:'Completado' },
    { id:'#P-00122',cliente:'Luis Martínez',plan:'Pro',monto:'S/ 179.00',metodo:'Tarjeta',fecha:'24 May 2026, 19:45',estado:'Completado' },
    { id:'#P-00121',cliente:'María Gómez',plan:'Premium',monto:'S/ 129.00',metodo:'Efectivo',fecha:'24 May 2026, 17:20',estado:'Completado' }
  ];
  pagoForm:any = {cliente:'',plan:'Básico',monto:79,metodo:'Efectivo'};

  promociones:any[] = [
    {id:1,titulo:'Mes Premium',descuento:15,hasta:'2026-09-15',descripcion:'15% de descuento en el plan Premium para nuevos inscritos.',activa:true},
    {id:2,titulo:'Ven con un amigo',descuento:10,hasta:'2026-09-30',descripcion:'Descuento por recomendación para ambos clientes.',activa:true}
  ];
  promocionForm:any = {titulo:'',descuento:10,hasta:'',descripcion:''};

  mensajes:any[] = [
    {id:1,nombre:'Lucía Fernández',correo:'lucia.fernandez@email.com',asunto:'Consulta sobre renovación',texto:'Hola, quisiera saber si puedo renovar mi plan Premium antes de que termine el mes.',hora:'10:35 AM',leido:false},
    {id:2,nombre:'Pedro Huamán',correo:'pedro.huaman@email.com',asunto:'Horario de musculación',texto:'¿La clase de musculación de mañana mantiene el horario de las 10:00 AM?',hora:'09:50 AM',leido:false},
    {id:3,nombre:'Valeria Rojas',correo:'valeria.rojas@email.com',asunto:'Pago confirmado',texto:'Ya realicé mi pago por Yape. ¿Podrían confirmarme la activación?',hora:'Ayer',leido:true}
  ];

  config:any = {nombre:'Mallqui Gym',direccion:'Pucallpa, Ucayali - Perú',telefono:'+51 999 888 777',correo:'info@mallquigym.com',horario:'Lun - Sáb: 6:00 AM - 10:00 PM'};

  constructor(){
    this.cargar('mg_clientes','clientes'); this.cargar('mg_membresias','membresias'); this.cargar('mg_clases','clases');
    this.cargar('mg_asistencias','registrosAsistencia'); this.cargar('mg_pagos','pagos'); this.cargar('mg_promociones','promociones');
    this.cargar('mg_mensajes','mensajes'); this.cargar('mg_config','config'); this.cargar('mg_entrenador','entrenador');
  }

  cambiarSeccion(id:string){ this.seccion=id; this.perfilAbierto=false; this.busqueda=''; window.scrollTo({top:0,behavior:'smooth'}); }
  avisar(texto:string){ this.toast=texto; setTimeout(()=>this.toast='',2200); }
  guardar(clave:string,valor:any){ localStorage.setItem(clave,JSON.stringify(valor)); }
  cargar(clave:string,prop:string){ try{ const v=localStorage.getItem(clave); if(v) (this as any)[prop]=JSON.parse(v); }catch{} }

  agregarCliente(){ if(!this.clienteForm.nombre||!this.clienteForm.correo) return; const id=Date.now(); this.clientes.unshift({...this.clienteForm,id,fecha:new Date().toLocaleString('es-PE'),img:`https://i.pravatar.cc/80?u=${id}`}); this.guardar('mg_clientes',this.clientes); this.clienteForm={nombre:'',correo:'',telefono:'',plan:'Básico'}; this.avisar('Cliente registrado correctamente'); }
  eliminarCliente(id:number){ if(confirm('¿Eliminar este cliente?')){ this.clientes=this.clientes.filter(c=>c.id!==id); this.guardar('mg_clientes',this.clientes); this.avisar('Cliente eliminado'); } }

  agregarMembresia(){ if(!this.membresiaForm.cliente) return; const inicio=new Date(); const fin=new Date(); fin.setMonth(fin.getMonth()+Number(this.membresiaForm.meses||1)); const f=(d:Date)=>d.toLocaleDateString('es-PE'); this.membresias.unshift({id:`M-${String(Date.now()).slice(-4)}`,cliente:this.membresiaForm.cliente,plan:this.membresiaForm.plan,inicio:f(inicio),fin:f(fin),estado:'Activa'}); this.guardar('mg_membresias',this.membresias); this.avisar('Membresía activada'); }
  alternarMembresia(m:any){ m.estado=m.estado==='Activa'?'Pausada':'Activa'; this.guardar('mg_membresias',this.membresias); this.avisar(`Membresía ${m.estado.toLowerCase()}`); }

  guardarEntrenador(){ this.guardar('mg_entrenador',this.entrenador); this.avisar('Datos del entrenador actualizados'); }

  agregarClase(){ if(!this.claseForm.nombre) return; const max=Number(this.claseForm.max||12); this.clases.unshift({id:Date.now(),icon:'🏋',color:'red',nombre:this.claseForm.nombre,desc:this.claseForm.desc||'Clase programada',hora:this.claseForm.hora||'Por definir',sala:this.claseForm.sala,cupos:`0 / ${max}`}); this.guardar('mg_clases',this.clases); this.claseForm={nombre:'',desc:'',hora:'',sala:'Sala Principal',max:12}; this.avisar('Clase programada'); }
  eliminarClase(id:number){ if(confirm('¿Eliminar esta clase?')){ this.clases=this.clases.filter(c=>c.id!==id); this.guardar('mg_clases',this.clases); this.avisar('Clase eliminada'); } }

  registrarAsistencia(){ if(!this.asistenciaForm.cliente) return; const hora=new Date().toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'}); this.registrosAsistencia.unshift({hora,cliente:this.asistenciaForm.cliente,clase:this.asistenciaForm.clase}); this.guardar('mg_asistencias',this.registrosAsistencia); this.asistenciaForm={cliente:'',clase:'Gimnasio libre'}; this.avisar('Asistencia registrada'); }

  agregarPago(){ if(!this.pagoForm.cliente) return; const id=`#P-${String(Date.now()).slice(-5)}`; this.pagos.unshift({id,cliente:this.pagoForm.cliente,plan:this.pagoForm.plan,monto:`S/ ${Number(this.pagoForm.monto).toFixed(2)}`,metodo:this.pagoForm.metodo,fecha:new Date().toLocaleString('es-PE'),estado:'Completado'}); this.guardar('mg_pagos',this.pagos); this.avisar('Pago registrado correctamente'); }

  agregarPromocion(){ if(!this.promocionForm.titulo) return; this.promociones.unshift({...this.promocionForm,id:Date.now(),activa:true}); this.guardar('mg_promociones',this.promociones); this.promocionForm={titulo:'',descuento:10,hasta:'',descripcion:''}; this.avisar('Promoción publicada'); }
  alternarPromocion(p:any){ p.activa=!p.activa; this.guardar('mg_promociones',this.promociones); this.avisar(p.activa?'Promoción activada':'Promoción pausada'); }

  abrirMensaje(m:any){ m.leido=true; this.mensajeSeleccionado=m; this.respuestaMensaje=''; this.guardar('mg_mensajes',this.mensajes); }
  responderMensaje(){ if(!this.mensajeSeleccionado||!this.respuestaMensaje.trim()) return; this.avisar(`Respuesta enviada a ${this.mensajeSeleccionado.nombre}`); this.respuestaMensaje=''; }

  guardarConfiguracion(){ this.guardar('mg_config',this.config); this.avisar('Configuración guardada'); }

  exportarClientes(){ this.descargarCSV('clientes-mallqui-gym.csv',['Nombre','Correo','Teléfono','Plan'],this.clientes.map(c=>[c.nombre,c.correo,c.telefono,c.plan])); }
  exportarPagos(){ this.descargarCSV('pagos-mallqui-gym.csv',['ID','Cliente','Plan','Monto','Método','Fecha'],this.pagos.map(p=>[p.id,p.cliente,p.plan,p.monto,p.metodo,p.fecha])); }
  exportarAsistencias(){ this.descargarCSV('asistencias-mallqui-gym.csv',['Hora','Cliente','Actividad'],this.registrosAsistencia.map(a=>[a.hora,a.cliente,a.clase])); }
  descargarCSV(nombre:string,cabeceras:string[],filas:any[][]){ const escapar=(v:any)=>`"${String(v??'').replace(/"/g,'""')}"`; const csv=[cabeceras,...filas].map(f=>f.map(escapar).join(',')).join('\n'); const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=nombre; a.click(); URL.revokeObjectURL(url); this.avisar('Reporte descargado'); }
}
