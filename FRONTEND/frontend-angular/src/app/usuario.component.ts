import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styleUrls: ['../mallqui-member.css'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="member-page">
      <header class="member-topbar">
        <a routerLink="/" class="member-logo"><img src="assets/mallqui-logo.png" alt="Mallqui Gym"></a>
        <nav>
          <a role="button" [class.active]="moduloActivo==='inicio'" (click)="abrirModulo('inicio')">⌂ Inicio</a>
          <a role="button" [class.active]="moduloActivo==='progreso'" (click)="abrirModulo('progreso')">↗ Mi progreso</a>
          <a role="button" [class.active]="moduloActivo==='rutinas'" (click)="abrirModulo('rutinas')">🏋 Rutinas</a>
          <a role="button" [class.active]="moduloActivo==='clases'" (click)="abrirModulo('clases')">▣ Clases</a>
          <a role="button" [class.active]="moduloActivo==='reservas'" (click)="abrirModulo('reservas')">◷ Reservas</a>
          <a role="button" [class.active]="moduloActivo==='pagos'" (click)="abrirModulo('pagos')">▤ Pagos</a>
          <a role="button" [class.active]="moduloActivo==='perfil'" (click)="abrirModulo('perfil')">♙ Perfil</a>
        </nav>
        <div class="member-account" [class.open]="mostrarCuenta" (click)="toggleCuenta($event)">
          <span class="bell" (click)="toggleNotificaciones($event)">♧<b>{{notificaciones.length}}</b></span>
          <img src="https://i.pravatar.cc/80?img=12" alt="Perfil">
          <p><strong>{{perfil.nombre}}</strong><small>Miembro Premium</small></p>
          <span class="account-caret">⌄</span>

          <div *ngIf="mostrarNotificaciones" class="member-popover notifications" (click)="$event.stopPropagation()">
            <h4>Notificaciones</h4>
            <div class="notice-item" *ngFor="let n of notificaciones">
              <span class="notice-icon">{{n.icono}}</span>
              <p><b>{{n.titulo}}</b><br>{{n.texto}}<br><small>{{n.hora}}</small></p>
            </div>
          </div>

          <div *ngIf="mostrarCuenta" class="member-popover account-menu" (click)="$event.stopPropagation()">
            <button (click)="abrirModulo('perfil'); mostrarCuenta=false">♙ Mi perfil</button>
            <button (click)="abrirModulo('pagos'); mostrarCuenta=false">▤ Mis pagos</button>
            <button (click)="abrirModulo('reservas'); mostrarCuenta=false">◷ Mis reservas</button>
            <button class="danger" (click)="cerrarSesion()">↪ Cerrar sesión</button>
          </div>
        </div>
      </header>

      <ng-container *ngIf="moduloActivo==='inicio'; else moduloInterno">
        <main class="member-main">
          <section class="member-welcome">
            <div><h1>Hola, {{nombreCorto}} <span>👋</span></h1><p>Listo para seguir superando tus límites hoy.</p></div>
            <div class="welcome-athlete"></div>
            <aside class="coach-card">
              <span class="coach-title">Tu entrenador</span>
              <div class="coach-body"><div class="coach-avatar"></div><div><h3>Juan Pérez</h3><b>Entrenador personal</b><p>Tu único entrenador, enfocado en acompañarte de forma personalizada.</p></div></div>
              <button (click)="abrirMensaje()">💬 Enviar mensaje</button>
            </aside>
          </section>

          <section class="member-stats">
            <article><span>🏋 Entrenamiento de hoy</span><h2>Pecho & Tríceps</h2><p>◷ 60 min &nbsp; · &nbsp; Intermedio</p><button class="primary-button" (click)="abrirRutina(rutinas[0])">Ver rutina</button></article>
            <article><span>🔥 Calorías quemadas</span><h2>2,450 <small>kcal</small></h2><div class="spark orange"></div><p class="positive">+320 kcal vs. semana pasada</p></article>
            <article><span>▣ Asistencia este mes</span><h2>12 <small>de 16 clases</small></h2><div class="progress-track"><i style="width:75%"></i></div><p>75% de tu meta</p></article>
            <article><span>↗ Progreso general</span><h2>68%</h2><div class="spark green-line"></div><p class="positive">+8% vs. el mes pasado</p></article>
          </section>

          <section class="member-grid">
            <article class="next-routine dark-card">
              <div class="routine-photo"></div>
              <div class="routine-copy"><span>Tu próxima rutina <b>Mañana</b></span><h2>Espalda & Bíceps</h2><p>◷ 60 min &nbsp; · &nbsp; Intermedio</p>
                <ul><li>Remo con barra <small>4 series x 12 reps</small></li><li>Jalón al pecho <small>4 series x 10 reps</small></li><li>Curl de bíceps <small>4 series x 12 reps</small></li><li>Face pulls <small>3 series x 15 reps</small></li></ul>
                <button class="primary-button" (click)="abrirRutina(rutinas[1])">Ver rutina completa →</button>
              </div>
            </article>

            <article class="weekly-card">
              <div class="card-heading"><h2>Tu progreso semanal</h2><button (click)="cambiarPeriodo()">{{periodoProgreso}}⌄</button></div>
              <svg class="member-chart" viewBox="0 0 680 270" preserveAspectRatio="none"><defs><linearGradient id="memberFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ef1f2f" stop-opacity=".24"/><stop offset="1" stop-color="#ef1f2f" stop-opacity="0"/></linearGradient></defs><path d="M25 225 L120 165 L215 90 L310 140 L405 88 L500 145 L590 95 L655 35 L655 245 L25 245Z" fill="url(#memberFill)"/><polyline points="25,225 120,165 215,90 310,140 405,88 500,145 590,95 655,35" fill="none" stroke="#ef1f2f" stroke-width="4"/></svg>
              <div class="week-days"><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span></div>
              <div class="chart-summary"><span><b>4</b><small>Entrenamientos</small></span><span><b>5h 20m</b><small>Tiempo total</small></span><span><b>2,450</b><small>Calorías</small></span><span><b>68%</b><small>Progreso</small></span></div>
            </article>

            <aside class="achievements-card"><div class="card-heading"><h2>Logros recientes</h2><a role="button" (click)="abrirModulo('progreso')">Ver todos</a></div><div class="achievement-row"><span class="medal red">🔥</span><span class="medal blue">🏋</span><span class="medal emerald">★</span></div><div class="achievement-labels"><p><b>Racha de 7 días</b><small>Entrena 7 días</small></p><p><b>Fuerza constante</b><small>Completa 10 rutinas</small></p><p><b>Disciplina total</b><small>Asiste a 12 clases</small></p></div></aside>

            <article class="reserved-card"><div class="card-heading"><h2>Próximas clases reservadas</h2><a role="button" (click)="abrirModulo('reservas')">Ver todas</a></div><div class="reserved-list"><div *ngFor="let c of clasesReservadas().slice(0,3)"><img [src]="c.img" [alt]="c.nombre"><p><b>{{c.nombre}}</b><small>{{c.lugar}}</small><span>{{c.hora}}</span></p></div></div></article>
            <article class="hydration-card dark-card"><h2>💧 Mantente hidratado</h2><p>Lleva tu botella contigo y bebe al menos 2 litros de agua al día.</p><h3>1.2 L / 2 L</h3><div class="progress-track blue"><i style="width:60%"></i></div></article>
            <article class="nutrition-card"><div><h2>🥬 Consejo de nutrición</h2><b>Incluye proteínas en cada comida</b><p>Apoya tu recuperación y desarrollo muscular.</p><a role="button" (click)="abrirNutricion()">Ver más consejos →</a></div><div class="food-photo"></div></article>
          </section>

          <section class="member-actions"><h2>Accesos rápidos</h2><div><button (click)="abrirModulo('clases')">▣ Reservar clase</button><button (click)="abrirModulo('rutinas')">🏋 Ver rutina</button><button (click)="abrirModulo('pagos')">▤ Mis pagos</button><button (click)="abrirModulo('perfil')">♙ Mi perfil</button></div></section>
        </main>
      </ng-container>

      <ng-template #moduloInterno>
        <main class="member-module">
          <section *ngIf="moduloActivo==='progreso'">
            <div class="member-module-head"><div><h1>Mi progreso</h1><p>Resumen de tu rendimiento, asistencia y constancia.</p></div><div class="module-actions"><button (click)="abrirModulo('inicio')">← Volver al inicio</button><button (click)="cambiarPeriodo()">{{periodoProgreso}}⌄</button></div></div>
            <div class="module-grid">
              <article class="module-card"><div class="module-stat"><div><h3>Progreso general</h3><span>Objetivo mensual</span></div><strong>68%</strong></div><div class="mini-progress"><i style="width:68%"></i></div></article>
              <article class="module-card"><div class="module-stat"><div><h3>Asistencia</h3><span>12 de 16 clases</span></div><strong>75%</strong></div><div class="mini-progress blue"><i style="width:75%"></i></div></article>
              <article class="module-card"><div class="module-stat"><div><h3>Constancia</h3><span>Racha actual</span></div><strong>7 días</strong></div><div class="mini-progress green"><i style="width:82%"></i></div></article>
              <article class="module-card"><h3>🔥 Racha de 7 días</h3><p>Completaste actividad durante siete días consecutivos. Mantén el ritmo.</p></article>
              <article class="module-card"><h3>🏋 Fuerza constante</h3><p>Ya completaste más de 10 rutinas registradas en tu plan.</p></article>
              <article class="module-card"><h3>★ Disciplina total</h3><p>Alcanzaste 12 asistencias registradas durante el mes.</p></article>
            </div>
          </section>

          <section *ngIf="moduloActivo==='rutinas'">
            <div class="member-module-head"><div><h1>Mis rutinas</h1><p>Consulta el detalle de tus entrenamientos asignados.</p></div><div class="module-actions"><button (click)="abrirModulo('inicio')">← Volver al inicio</button></div></div>
            <div class="module-grid">
              <article class="module-card" *ngFor="let r of rutinas"><h2>{{r.nombre}}</h2><div class="meta"><span>◷ {{r.duracion}}</span><span>🏋 {{r.nivel}}</span><span>{{r.ejercicios.length}} ejercicios</span></div><p>{{r.descripcion}}</p><div class="card-actions"><button class="primary" (click)="abrirRutina(r)">Ver rutina completa</button></div></article>
            </div>
          </section>

          <section *ngIf="moduloActivo==='clases'">
            <div class="member-module-head"><div><h1>Clases</h1><p>Reserva o cancela tus clases disponibles.</p></div><div class="module-actions"><button (click)="abrirModulo('reservas')">Ver mis reservas</button><button (click)="abrirModulo('inicio')">← Inicio</button></div></div>
            <div class="class-list"><div class="class-row" *ngFor="let c of clasesDisponibles"><img [src]="c.img" [alt]="c.nombre"><p><b>{{c.nombre}}</b><small>{{c.lugar}} · {{c.entrenador}}</small><small>{{c.hora}} · Cupos {{c.cupos}}</small></p><button [class.reserved]="c.reservada" (click)="toggleReserva(c)">{{c.reservada ? '✓ Reservada' : 'Reservar clase'}}</button></div></div>
          </section>

          <section *ngIf="moduloActivo==='reservas'">
            <div class="member-module-head"><div><h1>Mis reservas</h1><p>Administra las clases que tienes reservadas.</p></div><div class="module-actions"><button (click)="abrirModulo('clases')">+ Nueva reserva</button><button (click)="abrirModulo('inicio')">← Inicio</button></div></div>
            <div class="class-list" *ngIf="clasesReservadas().length; else sinReservas"><div class="class-row" *ngFor="let c of clasesReservadas()"><img [src]="c.img" [alt]="c.nombre"><p><b>{{c.nombre}}</b><small>{{c.lugar}} · {{c.entrenador}}</small><small>{{c.hora}}</small></p><button class="reserved" (click)="toggleReserva(c)">Cancelar reserva</button></div></div>
            <ng-template #sinReservas><article class="module-card"><h3>No tienes reservas activas</h3><p>Entra a Clases y reserva una sesión disponible.</p><div class="card-actions"><button class="primary" (click)="abrirModulo('clases')">Ver clases</button></div></article></ng-template>
          </section>

          <section *ngIf="moduloActivo==='pagos'">
            <div class="member-module-head"><div><h1>Mis pagos</h1><p>Consulta movimientos y comprobantes de tu membresía.</p></div><div class="module-actions"><button (click)="renovarMembresia()">Renovar membresía</button><button (click)="abrirModulo('inicio')">← Inicio</button></div></div>
            <div class="payment-list"><div class="payment-row" *ngFor="let p of pagos"><p><b>{{p.concepto}}</b><small>{{p.id}} · {{p.fecha}}</small></p><span>S/ {{p.monto}}</span><span>{{p.metodo}}</span><div><span class="status">{{p.estado}}</span><button (click)="descargarComprobante(p)">Comprobante</button></div></div></div>
          </section>

          <section *ngIf="moduloActivo==='perfil'">
            <div class="member-module-head"><div><h1>Mi perfil</h1><p>Actualiza tus datos personales y objetivo de entrenamiento.</p></div><div class="module-actions"><button (click)="abrirModulo('inicio')">← Volver al inicio</button></div></div>
            <article class="module-card">
              <form class="profile-form" (ngSubmit)="guardarPerfil()">
                <label>Nombre completo<input name="nombre" [(ngModel)]="perfil.nombre" required></label>
                <label>Correo electrónico<input type="email" name="email" [(ngModel)]="perfil.email" required></label>
                <label>Teléfono<input name="telefono" [(ngModel)]="perfil.telefono"></label>
                <label>Plan<select name="plan" [(ngModel)]="perfil.plan"><option>Básico</option><option>Premium</option><option>Pro</option></select></label>
                <label class="full">Objetivo<textarea name="objetivo" [(ngModel)]="perfil.objetivo"></textarea></label>
                <button class="save-profile" type="submit">Guardar cambios</button>
              </form>
            </article>
          </section>
        </main>
      </ng-template>

      <div *ngIf="modalActivo" class="member-modal-backdrop" (click)="cerrarModal()">
        <section class="member-modal" [class.large]="modalActivo==='rutina'" (click)="$event.stopPropagation()">
          <div class="member-modal-head"><div><h2>{{tituloModal}}</h2><p>{{subtituloModal}}</p></div><button class="member-modal-close" (click)="cerrarModal()">×</button></div>

          <div *ngIf="modalActivo==='rutina' && rutinaSeleccionada">
            <div class="routine-exercises"><div *ngFor="let e of rutinaSeleccionada.ejercicios; let i=index"><span>{{i+1}}</span><p><b>{{e.nombre}}</b><small>{{e.detalle}}</small></p><em>{{e.series}}</em></div></div>
          </div>

          <div *ngIf="modalActivo==='mensaje'" class="message-box">
            <textarea [(ngModel)]="mensajeEntrenador" placeholder="Escribe tu mensaje para Juan Pérez..."></textarea>
            <button class="modal-primary" (click)="enviarMensaje()">Enviar mensaje</button>
          </div>

          <div *ngIf="modalActivo==='nutricion'" class="nutrition-tips">
            <div><b>🥩 Proteína en cada comida</b><p>Incluye una fuente de proteína para apoyar tu recuperación muscular.</p></div>
            <div><b>🥗 Combina colores</b><p>Agrega diferentes verduras y frutas para mejorar la variedad de nutrientes.</p></div>
            <div><b>💧 Hidratación</b><p>Mantén agua disponible durante el día y durante tus entrenamientos.</p></div>
          </div>
        </section>
      </div>

      <div *ngIf="toast" class="member-toast">{{toast}}</div>
    </div>
  `
})
export class UsuarioComponent {
  moduloActivo = 'inicio';
  mostrarNotificaciones = false;
  mostrarCuenta = false;
  modalActivo = '';
  rutinaSeleccionada: any = null;
  mensajeEntrenador = '';
  toast = '';
  periodoProgreso = 'Esta semana';

  perfil = {
    nombre: 'César Rojas',
    email: 'cesar@mallquigym.com',
    telefono: '987 654 321',
    plan: 'Premium',
    objetivo: 'Mejorar fuerza, resistencia y mantener una rutina constante.'
  };

  notificaciones = [
    { icono: '🏋', titulo: 'Rutina disponible', texto: 'Tu rutina de Espalda & Bíceps está lista.', hora: 'Hace 20 min' },
    { icono: '▣', titulo: 'Clase confirmada', texto: 'Tu reserva de HIIT fue confirmada.', hora: 'Hace 1 h' },
    { icono: '★', titulo: 'Nuevo logro', texto: 'Completaste una racha de 7 días.', hora: 'Ayer' }
  ];

  rutinas = [
    {
      nombre: 'Pecho & Tríceps', duracion: '60 min', nivel: 'Intermedio', descripcion: 'Rutina enfocada en fuerza y volumen del tren superior.',
      ejercicios: [
        { nombre: 'Press de banca', detalle: 'Controla el descenso y mantén estabilidad.', series: '4 x 12' },
        { nombre: 'Press inclinado', detalle: 'Mantén los hombros firmes.', series: '4 x 10' },
        { nombre: 'Fondos asistidos', detalle: 'Evita balancear el cuerpo.', series: '3 x 12' },
        { nombre: 'Extensión de tríceps', detalle: 'Movimiento controlado.', series: '3 x 15' }
      ]
    },
    {
      nombre: 'Espalda & Bíceps', duracion: '60 min', nivel: 'Intermedio', descripcion: 'Trabajo completo de espalda y brazos con énfasis en técnica.',
      ejercicios: [
        { nombre: 'Remo con barra', detalle: 'Espalda neutra y codos hacia atrás.', series: '4 x 12' },
        { nombre: 'Jalón al pecho', detalle: 'Lleva la barra hacia la parte alta del pecho.', series: '4 x 10' },
        { nombre: 'Curl de bíceps', detalle: 'No uses impulso.', series: '4 x 12' },
        { nombre: 'Face pulls', detalle: 'Controla la fase de regreso.', series: '3 x 15' }
      ]
    },
    {
      nombre: 'Piernas & Core', duracion: '55 min', nivel: 'Intermedio', descripcion: 'Fortalece piernas, glúteos y zona media.',
      ejercicios: [
        { nombre: 'Sentadilla guiada', detalle: 'Rodillas alineadas y espalda firme.', series: '4 x 12' },
        { nombre: 'Prensa de piernas', detalle: 'No bloquees completamente las rodillas.', series: '4 x 12' },
        { nombre: 'Peso muerto rumano', detalle: 'Controla la cadera y mantén la espalda neutra.', series: '3 x 10' },
        { nombre: 'Plancha', detalle: 'Mantén abdomen activo.', series: '3 x 45 s' }
      ]
    }
  ];

  clasesDisponibles: any[] = [
    { id: 1, nombre: 'HIIT', lugar: 'Sala funcional', entrenador: 'Juan Pérez', hora: 'Hoy · 7:00 PM', cupos: '10/15', reservada: true, img: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=320&q=80' },
    { id: 2, nombre: 'Spinning', lugar: 'Sala cycling', entrenador: 'Juan Pérez', hora: 'Mié · 6:30 PM', cupos: '6/12', reservada: true, img: 'https://images.unsplash.com/photo-1530137073520-4ea6e2f10a48?auto=format&fit=crop&w=320&q=80' },
    { id: 3, nombre: 'Yoga', lugar: 'Sala mente', entrenador: 'Juan Pérez', hora: 'Vie · 8:00 AM', cupos: '8/12', reservada: true, img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=320&q=80' },
    { id: 4, nombre: 'Musculación', lugar: 'Sala de pesas', entrenador: 'Juan Pérez', hora: 'Sáb · 10:00 AM', cupos: '8/12', reservada: false, img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=320&q=80' }
  ];

  pagos: any[] = [
    { id: 'P-00124', concepto: 'Membresía Premium', monto: '129.00', metodo: 'Tarjeta', fecha: '25 May 2026', estado: 'Completado' },
    { id: 'P-00103', concepto: 'Membresía Premium', monto: '129.00', metodo: 'Yape', fecha: '25 Abr 2026', estado: 'Completado' },
    { id: 'P-00082', concepto: 'Membresía Premium', monto: '129.00', metodo: 'Efectivo', fecha: '25 Mar 2026', estado: 'Completado' }
  ];

  constructor(private router: Router) {
    this.cargarEstado();
  }

  get nombreCorto(): string {
    return (this.perfil.nombre || 'Miembro').split(' ')[0];
  }

  get tituloModal(): string {
    if (this.modalActivo === 'rutina') return this.rutinaSeleccionada?.nombre || 'Rutina';
    if (this.modalActivo === 'mensaje') return 'Mensaje a tu entrenador';
    if (this.modalActivo === 'nutricion') return 'Consejos de nutrición';
    return 'Mallqui Gym';
  }

  get subtituloModal(): string {
    if (this.modalActivo === 'rutina') return `${this.rutinaSeleccionada?.duracion || ''} · ${this.rutinaSeleccionada?.nivel || ''}`;
    if (this.modalActivo === 'mensaje') return 'Juan Pérez · Entrenador personal';
    if (this.modalActivo === 'nutricion') return 'Recomendaciones generales para acompañar tu entrenamiento.';
    return '';
  }

  abrirModulo(modulo: string): void {
    this.moduloActivo = modulo;
    this.mostrarCuenta = false;
    this.mostrarNotificaciones = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleNotificaciones(event: Event): void {
    event.stopPropagation();
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
    this.mostrarCuenta = false;
  }

  toggleCuenta(event: Event): void {
    event.stopPropagation();
    this.mostrarCuenta = !this.mostrarCuenta;
    this.mostrarNotificaciones = false;
  }

  abrirRutina(rutina: any): void {
    this.rutinaSeleccionada = rutina;
    this.modalActivo = 'rutina';
  }

  abrirMensaje(): void {
    this.mensajeEntrenador = '';
    this.modalActivo = 'mensaje';
  }

  abrirNutricion(): void {
    this.modalActivo = 'nutricion';
  }

  cerrarModal(): void {
    this.modalActivo = '';
    this.rutinaSeleccionada = null;
  }

  enviarMensaje(): void {
    if (!this.mensajeEntrenador.trim()) {
      this.mostrarToast('Escribe un mensaje antes de enviarlo.');
      return;
    }
    const historial = this.leerLocal<any[]>('mallqui_mensajes_usuario', []);
    historial.push({ texto: this.mensajeEntrenador.trim(), fecha: new Date().toISOString() });
    localStorage.setItem('mallqui_mensajes_usuario', JSON.stringify(historial));
    this.cerrarModal();
    this.mostrarToast('Mensaje enviado a Juan Pérez.');
  }

  toggleReserva(clase: any): void {
    clase.reservada = !clase.reservada;
    localStorage.setItem('mallqui_reservas_usuario', JSON.stringify(this.clasesDisponibles.filter(c => c.reservada).map(c => c.id)));
    this.mostrarToast(clase.reservada ? `${clase.nombre}: reserva confirmada.` : `${clase.nombre}: reserva cancelada.`);
  }

  clasesReservadas(): any[] {
    return this.clasesDisponibles.filter(c => c.reservada);
  }

  cambiarPeriodo(): void {
    const periodos = ['Esta semana', 'Este mes', 'Últimos 3 meses'];
    const actual = periodos.indexOf(this.periodoProgreso);
    this.periodoProgreso = periodos[(actual + 1) % periodos.length];
    this.mostrarToast(`Progreso actualizado: ${this.periodoProgreso}.`);
  }

  renovarMembresia(): void {
    const nuevo = {
      id: `P-${String(125 + this.pagos.length).padStart(5, '0')}`,
      concepto: `Membresía ${this.perfil.plan}`,
      monto: this.perfil.plan === 'Básico' ? '79.00' : this.perfil.plan === 'Pro' ? '179.00' : '129.00',
      metodo: 'Yape',
      fecha: new Date().toLocaleDateString('es-PE'),
      estado: 'Completado'
    };
    this.pagos.unshift(nuevo);
    localStorage.setItem('mallqui_pagos_usuario', JSON.stringify(this.pagos));
    this.mostrarToast('Membresía renovada correctamente.');
  }

  descargarComprobante(pago: any): void {
    const contenido = `MALLQUI GYM\nComprobante: ${pago.id}\nConcepto: ${pago.concepto}\nMonto: S/ ${pago.monto}\nMétodo: ${pago.metodo}\nFecha: ${pago.fecha}\nEstado: ${pago.estado}`;
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `comprobante-${pago.id}.txt`;
    enlace.click();
    URL.revokeObjectURL(url);
    this.mostrarToast('Comprobante generado.');
  }

  guardarPerfil(): void {
    localStorage.setItem('mallqui_perfil_usuario', JSON.stringify(this.perfil));
    this.mostrarToast('Perfil actualizado correctamente.');
  }

  cerrarSesion(): void {
    this.router.navigate(['/login']);
  }

  private cargarEstado(): void {
    const perfilGuardado = this.leerLocal<any>('mallqui_perfil_usuario', null);
    if (perfilGuardado) this.perfil = { ...this.perfil, ...perfilGuardado };

    const idsReservados = this.leerLocal<number[]>('mallqui_reservas_usuario', []);
    if (idsReservados.length) this.clasesDisponibles.forEach(c => c.reservada = idsReservados.includes(c.id));

    const pagosGuardados = this.leerLocal<any[]>('mallqui_pagos_usuario', []);
    if (pagosGuardados.length) this.pagos = pagosGuardados;
  }

  private leerLocal<T>(clave: string, valorPorDefecto: T): T {
    try {
      const valor = localStorage.getItem(clave);
      return valor ? JSON.parse(valor) as T : valorPorDefecto;
    } catch {
      return valorPorDefecto;
    }
  }

  private mostrarToast(texto: string): void {
    this.toast = texto;
    setTimeout(() => {
      if (this.toast === texto) this.toast = '';
    }, 2600);
  }
}
