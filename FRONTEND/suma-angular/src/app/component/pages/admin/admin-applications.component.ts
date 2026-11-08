import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from './admin-api.service';

type VistaApps = 'aplicaciones' | 'calendario-admin' | 'tareas-admin' | 'tablas-admin' | 'componentes-ui';
type EstadoTarea = 'Por hacer' | 'En curso' | 'Finalizada';
type NombreTabla = 'clientes' | 'productos' | 'reservas';

@Component({
  selector: 'app-admin-applications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./admin-applications.css'],
  encapsulation: ViewEncapsulation.None,
  template: `
  <main class="mg-app-center" aria-label="Centro de aplicaciones Mallqui Gym">
    <header class="mg-app-header">
      <div>
        <span class="mg-app-kicker">MALLQUI GYM / APLICACIONES</span>
        <h1>{{tituloVista}}</h1>
        <p>{{subtituloVista}}</p>
      </div>
      <div class="mg-app-header-actions">
        <button type="button" (click)="navegar.emit('dashboard')">⌂ Inicio</button>
        <button type="button" class="mg-app-primary" (click)="refrescar()" [disabled]="cargandoActual">↻ Actualizar</button>
      </div>
    </header>
    <nav class="mg-app-tabs" aria-label="Secciones de aplicaciones">
      <button type="button" *ngFor="let item of vistas" [class.active]="modulo===item.id" (click)="abrirVista(item.id)">
        <span>{{item.icono}}</span>{{item.nombre}}
      </button>
    </nav>

    <ng-container *ngIf="modulo==='aplicaciones'">
      <div class="mg-app-overview">
        <article><span>◈</span><strong>{{aplicaciones.length}}</strong><small>Accesos funcionales</small></article>
        <article><span>▣</span><strong>{{clientes.length}}</strong><small>Socios cargados</small></article>
        <article><span>◷</span><strong>{{reservas.length}}</strong><small>Reservas registradas</small></article>
        <article><span>▤</span><strong>{{productos.length}}</strong><small>Productos disponibles</small></article>
      </div>
      <div class="mg-app-section-caption">
        <div><h2>Aplicaciones del gimnasio</h2><p>Abre los módulos reales de tu sistema. No son páginas de muestra.</p></div>
        <label class="mg-app-find">⌕ <input type="search" [(ngModel)]="busquedaApp" placeholder="Buscar aplicación..." aria-label="Buscar aplicaciones"></label>
      </div>
      <div class="mg-app-grid">
        <button type="button" *ngFor="let app of aplicacionesFiltradas" (click)="navegar.emit(app.id)" class="mg-app-tile">
          <i>{{app.icono}}</i><span><strong>{{app.nombre}}</strong><small>{{app.descripcion}}</small></span><b>↗</b>
        </button>
      </div>
      <div class="mg-app-empty" *ngIf="!aplicacionesFiltradas.length">No hay aplicaciones con ese nombre.</div>
      <p class="mg-app-info">Los registros y permisos son los del backend Laravel. Algunas aplicaciones necesitan configurar primero sus tablas en MySQL.</p>
    </ng-container>

    <ng-container *ngIf="modulo==='calendario-admin'">
      <div class="mg-app-calendar-layout">
        <section class="mg-app-card mg-app-calendar">
          <header>
            <div><small>CALENDARIO OPERATIVO</small><h2>{{tituloMes}}</h2></div>
            <div class="mg-app-calendar-controls">
              <button type="button" (click)="moverMes(-1)" aria-label="Mes anterior">‹</button>
              <button type="button" (click)="irAHoy()">Hoy</button>
              <button type="button" (click)="moverMes(1)" aria-label="Mes siguiente">›</button>
            </div>
          </header>
          <div class="mg-app-calendar-days"><strong *ngFor="let d of diasSemana">{{d}}</strong></div>
          <div class="mg-app-month">
            <button type="button" *ngFor="let celda of celdasCalendario" [class.outside]="!celda.delMes" [class.selected]="celda.fecha===fechaSeleccionada" [class.today]="celda.fecha===hoyISO"
              (click)="seleccionarDia(celda.fecha)" [attr.aria-label]="'Ver movimientos del '+celda.fecha">
              <span>{{celda.numero}}</span>
              <small *ngIf="contarFecha(celda.fecha)>0">{{contarFecha(celda.fecha)}} registro(s)</small>
            </button>
          </div>
          <footer>Los eventos proceden del módulo Eventos y las reservas de Laravel/MySQL.</footer>
        </section>
        <aside class="mg-app-card mg-app-day-panel">
          <span>AGENDA DEL DÍA</span>
          <h2>{{fechaVisibleDia}}</h2>
          <div class="mg-app-day-count"><strong>{{actividadesDia.length}}</strong><small>actividades registradas</small></div>
          <div *ngFor="let item of actividadesDia" class="mg-app-day-item">
            <i [class.booking]="item.tipo==='Reserva'">{{item.tipo==='Reserva' ? '◷' : '✦'}}</i>
            <div><b>{{item.titulo}}</b><small>{{item.tipo}} · {{item.detalle}}</small></div>
          </div>
          <div class="mg-app-empty" *ngIf="!actividadesDia.length">No hay reservas ni eventos registrados para este día.</div>
          <button type="button" class="mg-app-primary" (click)="navegar.emit('reservas')">Gestionar reservas ↗</button>
          <button type="button" (click)="navegar.emit('eventos')">Administrar eventos ↗</button>
          <p *ngIf="errorEventos" class="mg-app-error">{{errorEventos}}</p>
        </aside>
      </div>
    </ng-container>

    <ng-container *ngIf="modulo==='tareas-admin'">
      <section class="mg-app-task-heading">
        <div><h2>Tablero de tareas</h2><p>Organiza pendientes, responsables y fechas. Los cambios se guardan en MySQL.</p></div>
        <button type="button" class="mg-app-primary" (click)="abrirNuevaTarea()">＋ Nueva tarea</button>
      </section>
      <p class="mg-app-error" *ngIf="errorTareas">{{errorTareas}}</p>
      <div class="mg-app-loading" *ngIf="cargandoTareas">Cargando tareas registradas...</div>
      <div class="mg-app-kanban">
        <section class="mg-app-kanban-col" *ngFor="let estado of estadosTareas">
          <header><h3><i></i>{{estado}}</h3><b>{{tareasPorEstado(estado).length}}</b></header>
          <article class="mg-app-task" *ngFor="let tarea of tareasPorEstado(estado)">
            <small class="mg-app-priority" [class.alta]="tarea.datos?.prioridad==='Alta'">{{tarea.datos?.prioridad || 'Normal'}}</small>
            <h4>{{tarea.titulo}}</h4>
            <p>{{tarea.subtitulo || 'Sin responsable asignado'}}</p>
            <p *ngIf="tarea.datos?.detalle" class="mg-app-task-desc">{{tarea.datos?.detalle}}</p>
            <div class="mg-app-task-date">{{tarea.fecha ? 'Vence: '+(tarea.fecha | date:'dd/MM/yyyy') : 'Sin vencimiento'}}</div>
            <div class="mg-app-task-buttons">
              <button type="button" (click)="editarTarea(tarea)" [disabled]="guardandoTarea">Editar</button>
              <button type="button" *ngIf="estado==='Por hacer'" (click)="cambiarEstadoTarea(tarea,'En curso')" [disabled]="guardandoTarea">Iniciar →</button>
              <button type="button" *ngIf="estado==='En curso'" (click)="cambiarEstadoTarea(tarea,'Finalizada')" [disabled]="guardandoTarea">Completar ✓</button>
              <button type="button" *ngIf="estado==='Finalizada'" (click)="cambiarEstadoTarea(tarea,'Por hacer')" [disabled]="guardandoTarea">Reabrir</button>
              <button type="button" (click)="eliminarTarea(tarea)" [disabled]="guardandoTarea" aria-label="Eliminar tarea">×</button>
            </div>
          </article>
          <div class="mg-app-empty" *ngIf="!tareasPorEstado(estado).length">Sin tareas en esta etapa.</div>
        </section>
      </div>
      <div *ngIf="modalTarea" class="mg-app-modal-backdrop">
        <form class="mg-app-task-dialog" (ngSubmit)="guardarTarea()" #formTarea="ngForm" role="dialog" aria-modal="true" aria-label="Editar tarea">
          <header><h2>{{idTareaEditando ? 'Editar tarea' : 'Nueva tarea'}}</h2><button type="button" (click)="modalTarea=false" aria-label="Cerrar">×</button></header>
          <label>Título <input [(ngModel)]="formTareaActual.titulo" name="titulo" maxlength="180" required placeholder="Ej. Revisar membresías por vencer"></label>
          <label>Responsable <input [(ngModel)]="formTareaActual.subtitulo" name="responsable" maxlength="255" placeholder="Ej. Recepción"></label>
          <label>Descripción <textarea [(ngModel)]="formTareaActual.detalle" name="detalle" rows="3" maxlength="2000"></textarea></label>
          <div class="mg-app-form-grid">
            <label>Estado <select [(ngModel)]="formTareaActual.estado" name="estado"><option *ngFor="let estado of estadosTareas">{{estado}}</option></select></label>
            <label>Prioridad <select [(ngModel)]="formTareaActual.prioridad" name="prioridad"><option>Baja</option><option>Normal</option><option>Alta</option></select></label>
          </div>
          <label>Fecha límite <input type="date" [(ngModel)]="formTareaActual.fecha" name="fecha"></label>
          <footer><button type="button" (click)="modalTarea=false">Cancelar</button><button type="submit" class="mg-app-primary" [disabled]="guardandoTarea || formTarea.invalid">{{guardandoTarea?'Guardando...':'Guardar en MySQL'}}</button></footer>
        </form>
      </div>
    </ng-container>

    <ng-container *ngIf="modulo==='tablas-admin'">
      <section class="mg-app-card mg-app-tables">
        <header>
          <div><span>DATOS DEL SISTEMA</span><h2>Tabla avanzada</h2><p>Búsqueda, ordenamiento, paginación y CSV de registros reales.</p></div>
          <div class="mg-app-table-tools">
            <select [(ngModel)]="tablaActual" (ngModelChange)="paginaTabla=1" aria-label="Seleccionar conjunto de registros">
              <option value="clientes">Socios</option><option value="productos">Productos</option><option value="reservas">Reservas</option>
            </select>
            <button type="button" (click)="exportarTabla()" [disabled]="!filasFiltradas.length">↓ Exportar CSV</button>
          </div>
        </header>
        <div class="mg-app-filter-row">
          <label>⌕ <input type="search" [(ngModel)]="buscarTabla" (ngModelChange)="paginaTabla=1" placeholder="Buscar en registros..." aria-label="Buscar registros"></label>
          <label>Filas por página <select [(ngModel)]="porPagina" (ngModelChange)="paginaTabla=1"><option [ngValue]="5">5</option><option [ngValue]="10">10</option><option [ngValue]="20">20</option></select></label>
        </div>
        <div class="mg-app-table-scroll">
          <table>
            <thead><tr>
              <th *ngFor="let cab of columnasTabla" scope="col"><button type="button" (click)="ordenarTabla(cab.clave)">{{cab.nombre}} <span>{{ordenClave===cab.clave ? (ordenAsc ? '↑' : '↓') : '↕'}}</span></button></th>
              <th scope="col">Acción</th>
            </tr></thead>
            <tbody>
              <tr *ngFor="let fila of paginaFilas">
                <td *ngFor="let cab of columnasTabla">{{fila[cab.clave] ?? '—'}}</td>
                <td><button type="button" (click)="navegar.emit(tablaActual)">Abrir módulo ↗</button></td>
              </tr>
              <tr *ngIf="!paginaFilas.length"><td [attr.colspan]="columnasTabla.length+1">No hay resultados. Comprueba los filtros o la conexión.</td></tr>
            </tbody>
          </table>
        </div>
        <footer><span>{{filasFiltradas.length}} registros · Página {{paginaTabla}} de {{totalPaginas}}</span>
          <div><button type="button" [disabled]="paginaTabla<=1" (click)="paginaTabla=paginaTabla-1">Anterior</button>
          <button type="button" [disabled]="paginaTabla>=totalPaginas" (click)="paginaTabla=paginaTabla+1">Siguiente</button></div>
        </footer>
      </section>
    </ng-container>

    <ng-container *ngIf="modulo==='componentes-ui'">
      <section class="mg-app-card mg-app-showcase">
        <div class="mg-app-section-caption"><div><h2>Componentes interactivos</h2><p>Galería de elementos UI para adaptar los formularios y vistas. Esta página es demostrativa.</p></div></div>
        <nav class="mg-app-demo-nav"><button type="button" [class.active]="demoSeccion==='controles'" (click)="demoSeccion='controles'">Controles</button><button type="button" [class.active]="demoSeccion==='formularios'" (click)="demoSeccion='formularios'">Formulario</button><button type="button" [class.active]="demoSeccion==='mensajes'" (click)="demoSeccion='mensajes'">Notificaciones</button></nav>
        <div *ngIf="demoSeccion==='controles'" class="mg-app-demo-panel">
          <h3>Botones, diálogos y acordeones</h3>
          <button type="button" class="mg-app-primary" (click)="modalDemo=true">Abrir ventana modal</button>
          <button type="button" (click)="acordeonDemo=!acordeonDemo">Ayuda y funcionamiento {{acordeonDemo?'−':'+'}}</button>
          <p *ngIf="acordeonDemo">El contenido se expande y se contrae. Puedes reutilizarlo en preguntas frecuentes, socios y membresías.</p>
        </div>
        <form *ngIf="demoSeccion==='formularios'" class="mg-app-demo-panel" (ngSubmit)="probarFormularioDemo()" #demoForm="ngForm">
          <h3>Validación de formulario</h3>
          <label>Nombre <input name="nombreDemo" [(ngModel)]="demoNombre" required minlength="3" placeholder="Escribe un nombre"></label>
          <label>Correo <input name="emailDemo" [(ngModel)]="demoCorreo" required type="email" placeholder="correo@ejemplo.com"></label>
          <label class="mg-app-check"><input name="aceptarDemo" [(ngModel)]="demoAceptado" type="checkbox"> Confirmar datos de prueba</label>
          <button type="submit" class="mg-app-primary" [disabled]="demoForm.invalid || !demoAceptado">Probar validación</button>
        </form>
        <div *ngIf="demoSeccion==='mensajes'" class="mg-app-demo-panel">
          <h3>Mensajes y estados de interfaz</h3>
          <button type="button" class="mg-app-primary" (click)="demoMensaje='Operación demostrativa completada.'">Mostrar aviso</button>
          <button type="button" (click)="demoMensaje='Esta es una advertencia de ejemplo, sin cambiar la base de datos.'">Mostrar advertencia</button>
          <p *ngIf="demoMensaje" class="mg-app-demo-toast">{{demoMensaje}} <button type="button" (click)="demoMensaje=''">×</button></p>
        </div>
      </section>
      <div *ngIf="modalDemo" class="mg-app-modal-backdrop">
        <div class="mg-app-task-dialog" role="dialog" aria-modal="true" aria-label="Componente modal">
          <header><h2>Modal interactivo</h2><button type="button" (click)="modalDemo=false">×</button></header>
          <p>Ejemplo de confirmación visual sin ejecutar operaciones contra MySQL.</p>
          <footer><button type="button" (click)="modalDemo=false">Cancelar</button><button type="button" class="mg-app-primary" (click)="modalDemo=false;demoMensaje='Ejemplo confirmado.'">Aceptar</button></footer>
        </div>
      </div>
    </ng-container>
  </main>
  `
})
export class AdminApplicationsComponent implements OnInit, OnChanges {
  @Input() modulo: string = 'aplicaciones';
  @Input() clientes: any[] = [];
  @Input() productos: any[] = [];
  @Input() reservas: any[] = [];
  @Output() navegar = new EventEmitter<string>();

  vistas: {id:VistaApps,nombre:string,icono:string}[] = [
    {id:'aplicaciones',nombre:'Aplicaciones',icono:'◈'},
    {id:'calendario-admin',nombre:'Calendario',icono:'▦'},
    {id:'tareas-admin',nombre:'Tareas',icono:'✓'},
    {id:'tablas-admin',nombre:'Tablas',icono:'▤'},
    {id:'componentes-ui',nombre:'Componentes',icono:'◫'}
  ];
  aplicaciones = [
    {id:'clientes',nombre:'Socios',icono:'♙',descripcion:'Clientes y matrículas'},
    {id:'membresias',nombre:'Membresías',icono:'✧',descripcion:'Planes y renovaciones'},
    {id:'calendario-admin',nombre:'Calendario',icono:'▦',descripcion:'Eventos y reservas del gimnasio'},
    {id:'tareas-admin',nombre:'Tareas',icono:'✓',descripcion:'Kanban de tareas del equipo'},
    {id:'soporte',nombre:'Bandeja de consultas',icono:'✉',descripcion:'Responder mensajes de socios'},
    {id:'usuarios',nombre:'Usuarios',icono:'♧',descripcion:'Cuentas y permisos'},
    {id:'ventas',nombre:'Ventas',icono:'◈',descripcion:'Productos y punto de venta'},
    {id:'productos',nombre:'Catálogo',icono:'▣',descripcion:'Productos y existencias'},
    {id:'facturas',nombre:'Facturación',icono:'▤',descripcion:'Comprobantes administrativos'},
    {id:'reportes-admin',nombre:'Analíticas',icono:'↗',descripcion:'Gráficos e indicadores reales'},
    {id:'eventos',nombre:'Eventos',icono:'◷',descripcion:'Crear y editar actividades'},
    {id:'comunicacion',nombre:'Notificaciones',icono:'♢',descripcion:'Avisos para clientes'},
    {id:'inventario',nombre:'Inventario',icono:'▦',descripcion:'Movimientos y stock'},
    {id:'reservas',nombre:'Reservas',icono:'⌁',descripcion:'Gestión de agenda'},
    {id:'configuracion',nombre:'Configuración',icono:'⚙',descripcion:'Ajustes de la empresa'},
    {id:'mantenimiento-sistema',nombre:'Mantenimiento',icono:'▥',descripcion:'Respaldo y diagnóstico'}
  ];
  busquedaApp = '';

  hoyISO = this.formatearFecha(new Date());
  fechaSeleccionada = this.hoyISO;
  mesVisible = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  diasSemana = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  eventos: any[] = [];
  errorEventos = '';
  cargandoEventos = false;

  tareas: any[] = [];
  errorTareas = '';
  cargandoTareas = false;
  guardandoTarea = false;
  modalTarea = false;
  idTareaEditando: number | null = null;
  estadosTareas: EstadoTarea[] = ['Por hacer','En curso','Finalizada'];
  formTareaActual = this.formTareaVacio();

  tablaActual: NombreTabla = 'clientes';
  buscarTabla = '';
  paginaTabla = 1;
  porPagina = 10;
  ordenClave = 'id';
  ordenAsc = true;

  demoSeccion: 'controles'|'formularios'|'mensajes' = 'controles';
  modalDemo = false;
  acordeonDemo = false;
  demoMensaje = '';
  demoNombre = '';
  demoCorreo = '';
  demoAceptado = false;

  constructor(private api: AdminApiService) {}

  ngOnInit(): void { this.refrescar(); }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modulo'] && !changes['modulo'].firstChange) this.refrescar();
  }

  get tituloVista():string {
    return ({
      'aplicaciones':'Centro de aplicaciones',
      'calendario-admin':'Calendario operativo',
      'tareas-admin':'Gestión de tareas',
      'tablas-admin':'Tablas de datos',
      'componentes-ui':'Componentes y controles'
    } as Record<string,string>)[this.modulo] || 'Aplicaciones';
  }
  get subtituloVista():string {
    return ({
      'aplicaciones':'Tus módulos administrativos, organizados en un solo lugar.',
      'calendario-admin':'Consulta eventos y reservas sin perder la relación con MySQL.',
      'tareas-admin':'Planifica el trabajo del equipo y consulta su avance.',
      'tablas-admin':'Filtra, ordena y exporta los registros operativos.',
      'componentes-ui':'Biblioteca interactiva de elementos reutilizables del dashboard.'
    } as Record<string,string>)[this.modulo] || '';
  }
  get cargandoActual():boolean{return this.cargandoEventos||this.cargandoTareas;}
  get aplicacionesFiltradas(){
    const q=this.busquedaApp.trim().toLocaleLowerCase('es-PE');
    return this.aplicaciones.filter(a=>!q||(a.nombre+' '+a.descripcion).toLocaleLowerCase('es-PE').includes(q));
  }
  abrirVista(id:VistaApps):void { this.navegar.emit(id); }

  refrescar():void {
    if(this.modulo==='calendario-admin')this.cargarEventos();
    if(this.modulo==='tareas-admin')this.cargarTareas();
  }
  cargarEventos():void {
    this.cargandoEventos=true;this.errorEventos='';
    this.api.gymRegistros('eventos').subscribe({
      next:(rows:any[])=>{this.eventos=Array.isArray(rows)?rows:[];this.cargandoEventos=false;},
      error:()=>{this.eventos=[];this.cargandoEventos=false;this.errorEventos='No se pudieron consultar los eventos del servidor.';}
    });
  }
  private formatearFecha(fecha:Date):string{
    return [fecha.getFullYear(),String(fecha.getMonth()+1).padStart(2,'0'),String(fecha.getDate()).padStart(2,'0')].join('-');
  }
  private normalizarFecha(entrada:any):string{
    const raw=String(entrada||'').trim();
    if(/^\d{4}-\d{2}-\d{2}/.test(raw))return raw.substring(0,10);
    if(/^\d{2}\/\d{2}\/\d{4}/.test(raw)){
      const partes=raw.substring(0,10).split('/');
      return [partes[2],partes[1],partes[0]].join('-');
    }
    return '';
  }
  get fechaVisibleDia():string{
    const [anio,mes,dia]=this.fechaSeleccionada.split('-').map(Number);
    return new Date(anio,mes-1,dia).toLocaleDateString('es-PE',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  }
  get tituloMes():string{
    const texto=this.mesVisible.toLocaleDateString('es-PE',{month:'long',year:'numeric'});
    return texto.charAt(0).toLocaleUpperCase('es-PE')+texto.slice(1);
  }
  moverMes(cantidad:number):void {
    this.mesVisible=new Date(this.mesVisible.getFullYear(),this.mesVisible.getMonth()+cantidad,1);
    this.fechaSeleccionada=this.formatearFecha(this.mesVisible);
  }
  irAHoy():void {
    const hoy=new Date();
    this.mesVisible=new Date(hoy.getFullYear(),hoy.getMonth(),1);
    this.fechaSeleccionada=this.hoyISO;
  }
  seleccionarDia(fecha:string):void {
    this.fechaSeleccionada=fecha;
    const [y,m]=fecha.split('-').map(Number);
    if(this.mesVisible.getFullYear()!==y || this.mesVisible.getMonth()!==m-1)
      this.mesVisible=new Date(y,m-1,1);
  }
  get celdasCalendario():Array<{fecha:string,numero:number,delMes:boolean}>{
    const año=this.mesVisible.getFullYear(),mes=this.mesVisible.getMonth();
    const offset=(new Date(año,mes,1).getDay()+6)%7;
    return Array.from({length:42},(_,n)=>{
      const fecha=new Date(año,mes,n-offset+1);
      return {fecha:this.formatearFecha(fecha),numero:fecha.getDate(),delMes:fecha.getMonth()===mes};
    });
  }
  private fechaReserva(row:any):string{
    return this.normalizarFecha(row?.fecha_clase||row?.fecha_reserva||row?.fecha||row?.fecha_hora||row?.clase?.fecha);
  }
  contarFecha(fecha:string):number{
    return this.reservas.filter(r=>this.fechaReserva(r)===fecha).length+
      this.eventos.filter(e=>this.normalizarFecha(e?.fecha)===fecha).length;
  }
  get actividadesDia():Array<{tipo:string,titulo:string,detalle:string}>{
    const fecha=this.fechaSeleccionada;
    const citas=this.reservas.filter(r=>this.fechaReserva(r)===fecha).map(r=>({
      tipo:'Reserva',titulo:String(r?.clase?.nombre||r?.nombre_clase||'Reserva del gimnasio'),
      detalle:String(r?.estado||r?.estado_reserva||'Registrada')
    }));
    const eventos=this.eventos.filter(e=>this.normalizarFecha(e?.fecha)===fecha).map(e=>({
      tipo:'Evento',titulo:String(e?.titulo||'Evento'),detalle:String(e?.subtitulo||e?.estado||'Programado')
    }));
    return [...citas,...eventos];
  }

  private formTareaVacio(){
    return {titulo:'',subtitulo:'',detalle:'',estado:'Por hacer' as EstadoTarea,prioridad:'Normal',fecha:''};
  }
  cargarTareas():void {
    this.cargandoTareas=true;this.errorTareas='';
    this.api.gymRegistros('tareas').subscribe({
      next:(rows:any[])=>{this.tareas=Array.isArray(rows)?rows:[];this.cargandoTareas=false;},
      error:(e:any)=>{
        this.errorTareas=e?.status===404
          ? 'El módulo de tareas todavía no está habilitado en Laravel. Actualiza y ejecuta la migración.'
          : 'No se pudieron cargar las tareas desde MySQL. Revisa la conexión y las migraciones.';
        this.cargandoTareas=false;
      }
    });
  }
  tareasPorEstado(estado:EstadoTarea):any[]{
    return this.tareas.filter(t=>String(t?.estado||'')===estado);
  }
  abrirNuevaTarea():void {
    this.idTareaEditando=null;
    this.formTareaActual=this.formTareaVacio();
    this.modalTarea=true;
  }
  editarTarea(tarea:any):void {
    this.idTareaEditando=Number(tarea.id);
    this.formTareaActual={
      titulo:String(tarea.titulo||''),subtitulo:String(tarea.subtitulo||''),
      detalle:String(tarea?.datos?.detalle||''),
      estado:(this.estadosTareas.includes(tarea.estado)?tarea.estado:'Por hacer') as EstadoTarea,
      prioridad:String(tarea?.datos?.prioridad||'Normal'),
      fecha:this.normalizarFecha(tarea.fecha)
    };
    this.modalTarea=true;
  }
  guardarTarea():void {
    if(this.guardandoTarea || !this.formTareaActual.titulo.trim())return;
    this.guardandoTarea=true;this.errorTareas='';
    const registro={
      titulo:this.formTareaActual.titulo.trim(),
      subtitulo:this.formTareaActual.subtitulo.trim(),
      estado:this.formTareaActual.estado,
      fecha:this.formTareaActual.fecha || null,
      monto:null,
      imagen_url:null,
      datos:{detalle:this.formTareaActual.detalle.trim(),prioridad:this.formTareaActual.prioridad}
    };
    const request=this.idTareaEditando
      ? this.api.actualizarGymRegistro('tareas',this.idTareaEditando,registro)
      : this.api.crearGymRegistro('tareas',registro);
    request.subscribe({
      next:()=>{
        this.guardandoTarea=false;this.modalTarea=false;this.idTareaEditando=null;
        this.cargarTareas();
      },
      error:(e:any)=>{
        this.guardandoTarea=false;
        this.errorTareas=e?.error?.message||'No se pudo guardar la tarea en MySQL.';
      }
    });
  }
  cambiarEstadoTarea(tarea:any,estado:EstadoTarea):void {
    if(this.guardandoTarea)return;
    this.guardandoTarea=true;this.errorTareas='';
    this.api.cambiarEstadoGymRegistro('tareas',Number(tarea.id),estado).subscribe({
      next:()=>{this.guardandoTarea=false;this.cargarTareas();},
      error:()=>{this.guardandoTarea=false;this.errorTareas='No se pudo cambiar el estado en el servidor.';}
    });
  }
  eliminarTarea(tarea:any):void {
    if(this.guardandoTarea || !confirm('¿Eliminar esta tarea de forma definitiva?'))return;
    this.guardandoTarea=true;this.errorTareas='';
    this.api.eliminarGymRegistro('tareas',Number(tarea.id)).subscribe({
      next:()=>{this.guardandoTarea=false;this.cargarTareas();},
      error:()=>{this.guardandoTarea=false;this.errorTareas='No se pudo eliminar la tarea.';}
    });
  }

  get columnasTabla():{clave:string,nombre:string}[]{
    if(this.tablaActual==='productos')return [
      {clave:'id',nombre:'ID'},{clave:'nombre',nombre:'Producto'},{clave:'categoria',nombre:'Categoría'},{clave:'precio',nombre:'Precio'},{clave:'stock',nombre:'Stock'}];
    if(this.tablaActual==='reservas')return [
      {clave:'id',nombre:'ID'},{clave:'nombre',nombre:'Actividad'},{clave:'fecha',nombre:'Fecha'},{clave:'estado',nombre:'Estado'}];
    return [
      {clave:'id',nombre:'ID'},{clave:'nombre',nombre:'Socio'},{clave:'dni',nombre:'DNI'},{clave:'telefono',nombre:'Teléfono'},{clave:'estado',nombre:'Estado'}];
  }
  get filasTabla():any[]{
    if(this.tablaActual==='productos')return this.productos.map((p:any)=>({
      id:p?.id_producto??p?.id??'',nombre:p?.nombre_producto??p?.nombre??'',
      categoria:p?.categoria?.nombre_categoria??p?.categoria?.nombre??'—',
      precio:p?.precio_venta??p?.precio??0,stock:p?.stock_actual??p?.stock??0
    }));
    if(this.tablaActual==='reservas')return this.reservas.map((r:any)=>({
      id:r?.id_reserva??r?.id??'',nombre:r?.clase?.nombre??r?.nombre_clase??'Reserva',
      fecha:this.fechaReserva(r),estado:r?.estado??r?.estado_reserva??'Registrada'
    }));
    return this.clientes.map((c:any)=>({
      id:c?.id_cliente??c?.id??'',nombre:[c?.nombres,c?.apellidos].filter(Boolean).join(' ')||c?.nombre??'',
      dni:c?.dni??'',telefono:c?.telefono??'',estado:c?.estado??''
    }));
  }
  get filasFiltradas():any[]{
    const q=this.buscarTabla.trim().toLocaleLowerCase('es-PE');
    const filas=this.filasTabla.filter(r=>!q||Object.values(r).some(v=>String(v??'').toLocaleLowerCase('es-PE').includes(q)));
    const campo=this.ordenClave,asc=this.ordenAsc?1:-1;
    return [...filas].sort((a:any,b:any)=>{
      const va=a[campo],vb=b[campo];
      if(typeof va==='number' && typeof vb==='number')return (va-vb)*asc;
      return String(va??'').localeCompare(String(vb??''),'es',{numeric:true})*asc;
    });
  }
  get totalPaginas():number{return Math.max(1,Math.ceil(this.filasFiltradas.length/this.porPagina));}
  get paginaFilas():any[]{
    const pagina=Math.min(this.paginaTabla,this.totalPaginas);
    return this.filasFiltradas.slice((pagina-1)*this.porPagina,pagina*this.porPagina);
  }
  ordenarTabla(clave:string):void {
    this.ordenAsc=this.ordenClave===clave?!this.ordenAsc:true;
    this.ordenClave=clave;this.paginaTabla=1;
  }
  exportarTabla():void {
    if(!this.filasFiltradas.length)return;
    const columnas=this.columnasTabla;
    const quoted=(valor:any)=>{
      const raw=String(valor??'');
      // Bloquear fórmulas al abrir CSV en Excel/Calc.
      const seguro=/^\s*[=+@-]/.test(raw) && !/^-?\d+(?:[.,]\d+)?$/.test(raw.trim())
        ? "'"+raw : raw;
      return '"'+seguro.replace(/"/g,'""')+'"';
    };
    const filas=[columnas.map(c=>c.nombre),...this.filasFiltradas.map(row=>columnas.map(c=>row[c.clave]))];
    const csv='\uFEFF'+filas.map(row=>row.map(quoted).join(';')).join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
    const a=document.createElement('a');
    a.href=url;a.download='mallqui_'+this.tablaActual+'.csv';document.body.appendChild(a);a.click();a.remove();
    URL.revokeObjectURL(url);
  }
  probarFormularioDemo():void{
    if(this.demoNombre.trim().length>=3 && this.demoCorreo.includes('@') && this.demoAceptado)
      this.demoMensaje='Validación demostrativa correcta. No se registraron datos reales.';
  }
}
