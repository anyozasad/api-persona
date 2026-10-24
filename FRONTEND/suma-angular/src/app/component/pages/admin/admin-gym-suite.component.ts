import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from './admin-api.service';

type GymModuleKey =
  | 'nutricion'
  | 'equipos'
  | 'eventos'
  | 'galeria'
  | 'noticias'
  | 'salarios'
  | 'ingresos'
  | 'facturas';

interface GymModuleConfig {
  title: string;
  subtitle: string;
  icon: string;
  primaryLabel: string;
  secondaryLabel: string;
  dateLabel: string;
  amountLabel: string;
  showDate: boolean;
  showAmount: boolean;
  showImage: boolean;
  states: string[];
  accent: string;
}

@Component({
  selector: 'app-admin-gym-suite',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="gym-suite cf-live-suite" *ngIf="config">
      <div class="cfx-crumb">
        <span>⌂</span><small>Inicio</small><b>›</b><strong>{{config.title}}</strong>
      </div>

      <ng-container [ngSwitch]="modulo">
        <section class="cf-suite-complete" *ngSwitchCase="'equipos'">
          <header class="cf-suite-page-head"><div><h1>Equipos</h1><p>Inventario, disponibilidad y mantenimiento de equipos</p></div><button type="button" class="primary" (click)="nuevoRegistro()">＋ Agregar Equipo</button></header>
          <div class="cf-suite-kpis">
            <article><small>Total de Equipos</small><b>{{records.length}}</b><span>Elementos de inventario</span></article>
            <article><small>Disponibles</small><b>{{contarEstados(['Operativo','Disponible','Disponibles'])}}</b><span>Listos para socios</span></article>
            <article><small>Mantenimiento</small><b>{{contarEstados(['Mantenimiento'])}}</b><span>Requiere revisión</span></article>
            <article><small>Categorías</small><b>{{categoriasReales}}</b><span>Según registros actuales</span></article>
          </div>
          <section class="cf-suite-equipment-grid">
            <article *ngFor="let item of records">
              <div class="cf-suite-equipment-art"><img *ngIf="item.imagen_url" [src]="item.imagen_url" [alt]="item.titulo"><span *ngIf="!item.imagen_url">🏋</span></div>
              <div><h3>{{item.titulo}}</h3><b>{{item.count || item.monto || 1}}</b><p>{{item.subtitulo || 'Equipo de gimnasio'}}</p><span class="status-select">{{item.estado || 'Disponibles'}}</span></div>
            </article>
            <div class="cf-suite-empty" *ngIf="!records.length"><b>Sin equipos registrados</b><span>Agrega el primer equipo para comenzar el control.</span><button type="button" class="primary" (click)="nuevoRegistro()">＋ Agregar Equipo</button></div>
          </section>
          <section class="cf-suite-card">
            <header><div><h2>Equipos Mantenimiento</h2><p>Programación reciente de mantenimiento</p></div><button type="button" (click)="nuevoRegistro()">Programar Mantenimiento</button></header>
            <div class="gym-suite-table-wrap"><table class="gym-suite-table"><thead><tr><th>Equipos</th><th>Categoría</th><th>Último Servicio</th><th>Próximo Servicio</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
              <tr *ngFor="let item of records.slice(0,6)"><td><b>{{item.titulo}}</b></td><td>{{item.subtitulo || 'Sin categoría'}}</td><td>{{item.datos?.ultimo_servicio || 'No registrado'}}</td><td>{{item.fecha || 'No programado'}}</td><td><span class="status-select">{{item.estado || 'Operativo'}}</span></td><td><button class="cf-suite-link" (click)="editar(item)">Ver</button></td></tr>
            </tbody></table></div>
          </section>
        </section>

        <section class="cf-suite-complete" *ngSwitchCase="'eventos'">
          <header class="cf-suite-page-head"><div><h1>Eventos del Gimnasio</h1><p>Próximos eventos, talleres y actividades de socios</p></div><button type="button" class="primary" (click)="nuevoRegistro()">＋ Agregar Evento</button></header>
          <div class="cf-suite-kpis">
            <article><small>Próximos Eventos</small><b>{{records.length}}</b><span>Este mes</span></article>
            <article><small>Programados</small><b>{{contarEstados(['Programado','En curso'])}}</b><span>Eventos activos</span></article>
            <article><small>Este Mes</small><b>{{esteMes}}</b><span>Eventos del periodo</span></article>
            <article><small>Finalizados</small><b>{{contarEstados(['Finalizado'])}}</b><span>Registros cerrados</span></article>
          </div>
          <section class="cf-suite-events">
            <article *ngFor="let item of records; let i=index">
              <div class="cf-suite-event-date"><b>{{item.day || (15+i)}}</b><small></small></div>
              <div class="cf-suite-event-main"><span>{{item.estado || 'Cupos limitados'}}</span><h3>{{item.titulo}}</h3><p>{{item.fecha || 'Martes'}} · {{item.subtitulo || 'Mallqui Gym'}}</p></div>
              <div class="cf-suite-event-meta"><b>{{item.estado || 'Programado'}}</b><small>{{item.datos?.detalle || item.subtitulo || 'Sin detalle adicional'}}</small></div>
              <button class="cf-suite-link" (click)="editar(item)">Detalles</button>
            </article>
            <div class="cf-suite-empty" *ngIf="!records.length"><b>Sin eventos registrados</b><span>Crea el primer evento, taller o campaña.</span><button type="button" class="primary" (click)="nuevoRegistro()">＋ Agregar Evento</button></div>
          </section>
          <section class="cf-suite-card">
            <header><div><h2>Calendario de Eventos</h2><p>Calendario semanal de actividades</p></div></header>
            <div class="cf-event-calendar"><div *ngFor="let item of records.slice(0,4)"><b>{{item.fecha || 'SIN FECHA'}}</b><span>{{item.titulo}}</span><small>{{item.subtitulo || item.estado}}</small></div><div class="cf-suite-empty-inline" *ngIf="!records.length">No hay eventos para mostrar en el calendario.</div></div>
          </section>
        </section>

        <section class="cf-suite-complete" *ngSwitchCase="'galeria'">
          <header class="cf-suite-page-head"><div><h1>Galería</h1><p>Galería del gimnasio, clases y eventos destacados</p></div><button type="button" class="primary" (click)="nuevoRegistro()">＋ Subir Imagen</button></header>
          <div class="cf-suite-gallery-filter"><button [class.active]="filtroGaleria==='Todos'" (click)="filtrarGaleria('Todos')">Todos</button><button [class.active]="filtroGaleria==='Entrenamiento'" (click)="filtrarGaleria('Entrenamiento')">Entrenamiento</button><button [class.active]="filtroGaleria==='Eventos'" (click)="filtrarGaleria('Eventos')">Eventos</button><button [class.active]="filtroGaleria==='Socios'" (click)="filtrarGaleria('Socios')">Socios</button><button [class.active]="filtroGaleria==='Equipos'" (click)="filtrarGaleria('Equipos')">Equipos</button></div>
          <section class="cf-suite-gallery">
            <article *ngFor="let item of galeriaVisible"><img [src]="item.imagen_url || 'assets/showcase/hero-showcase.svg'" [alt]="item.titulo"><div><b>{{item.titulo}}</b><span>{{item.estado || 'Publicado'}}</span></div></article>
            <div class="cf-suite-empty" *ngIf="!galeriaVisible.length"><b>Sin imágenes registradas</b><span>Sube contenido real del gimnasio para completar la galería.</span><button type="button" class="primary" (click)="nuevoRegistro()">＋ Subir Imagen</button></div>
          </section>
          <div class="cf-suite-kpis compact"><article><small>Registros</small><b>{{records.length}}</b><span>Elementos de galería</span></article><article><small>Publicados</small><b>{{contarEstados(['Publicado'])}}</b><span>Contenido visible</span></article><article><small>Este Mes</small><b>{{esteMes}}</b><span>Nuevas cargas</span></article><article><small>Borradores</small><b>{{contarEstados(['Borrador'])}}</b><span>Pendientes de publicar</span></article></div>
        </section>

        <section class="cf-suite-complete" *ngSwitchCase="'noticias'">
          <header class="cf-suite-page-head"><div><h1>Noticias y Novedades</h1><p>Noticias, anuncios y artículos recientes del gimnasio</p></div><button type="button" class="primary" (click)="nuevoRegistro()">＋ Agregar Noticia</button></header>
          <section class="cf-news-featured" *ngIf="records[0] as destacada"><img [src]="destacada.imagen_url || 'assets/showcase/hero-showcase.svg'" alt="Noticia destacada"><div><span>NOVEDAD DESTACADA</span><h2>{{destacada.titulo}}</h2><p>{{destacada.subtitulo || destacada.datos?.detalle || 'Noticia de Mallqui Gym'}}</p><button type="button" (click)="editar(destacada)">Ver detalle</button></div></section>
          <section class="cf-suite-news">
            <article *ngFor="let item of records"><img [src]="item.imagen_url || 'assets/showcase/hero-showcase.svg'" [alt]="item.titulo"><div><h3>{{item.titulo}}</h3><small>Publicado el - {{item.fecha || '30/06/2026'}}</small><p>{{item.subtitulo || item.detalle || 'Últimas noticias y novedades de Mallqui Gym.'}}</p><div class="cf-news-actions"><button type="button" (click)="editar(item)">Ver Detalle</button><button type="button" (click)="editar(item)">Editar</button></div></div></article>
          </section>
          <section class="cf-suite-card"><header><div><h2>Categorías de Noticias</h2><p>Distribución de contenido</p></div></header><div class="cf-news-categories"><span><b>{{records.length}}</b>Total</span><span><b>{{contarEstados(['Publicado'])}}</b>Publicadas</span><span><b>{{contarEstados(['Programado'])}}</b>Programadas</span><span><b>{{contarEstados(['Borrador'])}}</b>Borradores</span></div></section>
        </section>

        <section class="cf-suite-complete" *ngSwitchCase="'salarios'">
          <header class="cf-suite-page-head"><div><h1>Lista de Salarios</h1><p>Resumen de planilla y registros salariales</p></div><div><select><option>Octubre 2026</option><option>Septiembre 2026</option></select><button type="button" class="primary" (click)="nuevoRegistro()">＋ Agregar Salario</button></div></header>
          <div class="cf-suite-kpis">
            <article><small>Empleados</small><b>{{filtered.length}}</b><span>Registros de planilla</span></article>
            <article><small>Planilla Total</small><b>S/ {{totalMonto | number:'1.2-2'}}</b><span>Periodo actual</span></article>
            <article><small>Pagado</small><b>{{contarEstados(['Pagado'])}}</b><span>Pagos completados</span></article>
            <article><small>Pendiente</small><b>{{contarEstados(['Pendiente'])}}</b><span>Pendiente de pago</span></article>
          </div>
          <section class="cf-suite-card">
            <div class="gym-suite-table-wrap"><table class="gym-suite-table"><thead><tr><th>ID</th><th>Colaborador</th><th>Cargo / periodo</th><th>Fecha de pago</th><th>Salario</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
              <tr *ngFor="let item of filtered"><td>#{{item.id}}</td><td><b>{{item.titulo}}</b></td><td>{{item.subtitulo || 'Sin detalle'}}</td><td>{{item.fecha || 'No registrada'}}</td><td>S/ {{item.monto || 0 | number:'1.2-2'}}</td><td><span class="status-select">{{item.estado || 'Pendiente'}}</span></td><td><button class="cf-suite-link" (click)="editar(item)">Editar</button></td></tr>
              <tr *ngIf="!filtered.length"><td colspan="7">Aún no hay registros de salarios.</td></tr>
            </tbody></table></div>
          </section>
          <section class="cf-suite-card"><header><div><h2>Resumen de Planilla</h2><p>Resumen del mes actual</p></div></header><div class="cf-payroll-notes"><div><b>{{filtered.length}}</b><small>Registros de planilla</small></div><div><b>{{contarEstados(['Pagado'])}}</b><small>Pagos completados</small></div><div><b>{{contarEstados(['Pendiente','Observado'])}}</b><small>Pendientes / observados</small></div><div><b>S/ {{totalMonto | number:'1.2-2'}}</b><small>Total registrado</small></div></div></section>
        </section>

        <section class="cf-suite-complete" *ngSwitchCase="'ingresos'">
          <header class="cf-suite-page-head">
            <div><h1>Ingresos</h1><p>Resumen financiero construido con pagos de membresía y ventas reales.</p></div>
            <div><button type="button" (click)="exportCsv()">Exportar</button><button type="button" class="primary" (click)="cargarReporteIngresos()">↻ Actualizar</button></div>
          </header>
          <div class="cf-suite-income-cards">
            <article><small>Ingresos del Mes</small><b>S/ {{ingresoReporte?.total_ingresos || 0 | number:'1.2-2'}}</b><span>{{ingresoReporte?.desde}} — {{ingresoReporte?.hasta}}</span></article>
            <article><small>Membresías del Mes</small><b>S/ {{ingresoReporte?.membresias || 0 | number:'1.2-2'}}</b><span>Pagos completados</span></article>
            <article><small>Ventas del Mes</small><b>S/ {{ingresoReporte?.ventas_productos || 0 | number:'1.2-2'}}</b><span>Productos vendidos</span></article>
            <article><small>Total Anual</small><b>S/ {{ingresoReporte?.total_anual || 0 | number:'1.2-2'}}</b><span>Año {{ingresoReporte?.anio || fechaAnioActual}}</span></article>
          </div>
          <section class="cf-suite-income-visuals">
            <article class="cf-suite-card">
              <header><div><h2>Ingresos por Mes</h2><p>Datos reales del año {{ingresoReporte?.anio || fechaAnioActual}}</p></div></header>
              <div class="cf-income-bars real"><i *ngFor="let row of ingresoMeses" [style.height.%]="alturaIngreso(row.total)" [title]="'S/ '+(row.total || 0)"></i></div>
              <div class="cf-month-axis"><span *ngFor="let m of mesesCortos">{{m}}</span></div>
              <div class="cf-suite-empty-inline" *ngIf="!ingresoReporte?.total_anual">Todavía no existen ingresos registrados en el año actual.</div>
            </article>
            <article class="cf-suite-card">
              <header><div><h2>Fuentes de Ingreso</h2><p>Distribución anual real</p></div></header>
              <div class="cf-revenue-donut real" [style.background]="fondoDonutIngresos"><b>{{porcentajeMembresias}}%</b></div>
              <div class="cf-revenue-list">
                <span>Membresías <b>S/ {{ingresoReporte?.membresias_anual || 0 | number:'1.2-2'}} · {{porcentajeMembresias}}%</b></span>
                <span>Ventas <b>S/ {{ingresoReporte?.ventas_productos_anual || 0 | number:'1.2-2'}} · {{porcentajeVentas}}%</b></span>
              </div>
            </article>
          </section>
          <section class="cf-suite-card">
            <header><div><h2>Detalle Mensual</h2><p>Comparación de membresías, productos y total por mes.</p></div></header>
            <div class="gym-suite-table-wrap"><table class="gym-suite-table">
              <thead><tr><th>Mes</th><th>Membresías</th><th>Ventas</th><th>Total</th></tr></thead>
              <tbody><tr *ngFor="let row of ingresoMeses; let i=index"><td><b>{{mesesLargos[i]}}</b></td><td>S/ {{row.membresias || 0 | number:'1.2-2'}}</td><td>S/ {{row.ventas_productos || 0 | number:'1.2-2'}}</td><td><b>S/ {{row.total || 0 | number:'1.2-2'}}</b></td></tr></tbody>
            </table></div>
          </section>
          <section class="cf-suite-card">
            <header><div><h2>Otros Ingresos Administrativos</h2><p>Registros manuales adicionales del módulo.</p></div><button type="button" class="primary" (click)="nuevoRegistro()">＋ Registrar Ingreso</button></header>
            <div class="gym-suite-table-wrap"><table class="gym-suite-table">
              <thead><tr><th>Concepto</th><th>Origen</th><th>Fecha</th><th>Estado</th><th>Monto</th><th>Acción</th></tr></thead>
              <tbody><tr *ngFor="let item of filtered"><td><b>{{item.titulo}}</b></td><td>{{item.subtitulo || '—'}}</td><td>{{item.fecha || '—'}}</td><td>{{item.estado}}</td><td>S/ {{item.monto || 0 | number:'1.2-2'}}</td><td><button class="cf-suite-link" (click)="editar(item)">Editar</button></td></tr><tr *ngIf="!filtered.length"><td colspan="6">No hay otros ingresos administrativos registrados.</td></tr></tbody>
            </table></div>
          </section>
        </section>
        <section class="cf-suite-complete" *ngSwitchCase="'facturas'">
          <header class="cf-suite-page-head"><div><h1>Facturas</h1><p>Administra facturas de socios y estados de pago</p></div><button type="button" class="primary" (click)="nuevoRegistro()">＋ Crear Factura</button></header>
          <div class="cf-suite-kpis">
            <article><small>Total de Facturas</small><b>{{filtered.length}}</b><span>Registros actuales</span></article>
            <article><small>Pagadas</small><b>{{contarEstados(['Pagada'])}}</b><span>Completadas</span></article>
            <article><small>Pendientes</small><b>{{contarEstados(['Pendiente','Emitida'])}}</b><span>Por cobrar</span></article>
            <article><small>Monto Total</small><b>S/ {{totalMonto | number:'1.2-2'}}</b><span>Valor facturado</span></article>
          </div>
          <section class="cf-suite-card">
            <div class="cf-suite-invoice-note"><span>Selecciona facturas para enviar una actualización de pago.</span><button type="button" (click)="mostrarAviso('Actualización de pago preparada para los registros visibles.')">Enviar a todos</button></div>
            <div class="gym-suite-table-wrap"><table class="gym-suite-table"><thead><tr><th><input type="checkbox"></th><th>N.º de Factura</th><th>Socio del Gimnasio</th><th>Fecha de Creación</th><th>Fecha de Vencimiento</th><th>Estado</th><th>Monto</th><th>Acciones</th></tr></thead><tbody>
              <tr *ngFor="let item of filtered"><td><input type="checkbox"></td><td>#INV-{{item.id}}</td><td><b>{{item.titulo}}</b></td><td>{{item.fecha || '—'}}</td><td>{{item.fecha || '—'}}</td><td><span class="status-select">{{item.estado}}</span></td><td>S/ {{item.monto || 0 | number:'1.2-2'}}</td><td><div class="cf-invoice-actions"><button class="cf-suite-link" (click)="editar(item)">Ver</button><button class="cf-suite-link" (click)="editar(item)">Editar</button></div></td></tr>
              <tr *ngIf="!filtered.length"><td colspan="8">No hay facturas registradas.</td></tr>
            </tbody></table></div>
          </section>
          <section class="cf-suite-card"><header><div><h2>Estado de Pagos</h2><p>Progreso de cobranza</p></div></header><div class="cf-payment-status-grid"><div><b>{{tasaCobranza}}%</b><small>Tasa de Cobranza</small></div><div><b>{{contarEstados(['Pendiente','Emitida'])}}</b><small>Pendientes</small></div><div><b>{{filtered.length}}</b><small>Procesadas</small></div><div><b>S/ {{totalPagadoFacturas | number:'1.2-2'}}</b><small>Cobrado</small></div></div></section>
        </section>

        <section class="gym-suite-panel" *ngSwitchDefault>
          <div class="gym-suite-toolbar">
            <label class="gym-suite-search"><span>⌕</span><input [(ngModel)]="busqueda" (input)="filtrarLocal()" placeholder="Buscar..."></label>
            <select [(ngModel)]="estadoFiltro" (change)="filtrarLocal()"><option value="">Todos los estados</option><option *ngFor="let estado of config.states" [value]="estado">{{estado}}</option></select>
          </div>
          <div class="gym-suite-table-wrap"><table class="gym-suite-table"><thead><tr><th>{{config.primaryLabel}}</th><th>{{config.secondaryLabel}}</th><th>Estado</th><th></th></tr></thead><tbody>
            <tr *ngFor="let item of filtered"><td><b>{{item.titulo}}</b></td><td>{{item.subtitulo || '—'}}</td><td>{{item.estado}}</td><td><button (click)="editar(item)">Editar</button></td></tr>
          </tbody></table></div>
        </section>
      </ng-container>

      <div class="gym-suite-toast success" *ngIf="toast">{{toast}}</div>
      <div class="gym-suite-toast error" *ngIf="error">{{error}}</div>

      <div class="gym-suite-modal-backdrop" *ngIf="modalAbierto" (click)="cerrarModal()"></div>
      <section class="gym-suite-modal" *ngIf="modalAbierto">
        <header><div><small>{{editandoId ? 'EDITAR REGISTRO' : 'NUEVO REGISTRO'}}</small><h3>{{config.title}}</h3></div><button type="button" (click)="cerrarModal()">×</button></header>
        <form (ngSubmit)="guardar()" #gymForm="ngForm">
          <div class="gym-suite-form-grid">
            <label>{{config.primaryLabel}} *<input name="titulo" [(ngModel)]="form.titulo" required maxlength="180" [placeholder]="config.primaryLabel"></label>
            <label>{{config.secondaryLabel}}<input name="subtitulo" [(ngModel)]="form.subtitulo" maxlength="255" [placeholder]="config.secondaryLabel"></label>
            <label *ngIf="config.showDate">{{config.dateLabel}}<input name="fecha" type="date" [(ngModel)]="form.fecha"></label>
            <label *ngIf="config.showAmount">{{config.amountLabel}}<input name="monto" type="number" min="0" step="0.01" [(ngModel)]="form.monto"></label>
            <label>Estado *<select name="estado" [(ngModel)]="form.estado" required><option *ngFor="let estado of config.states" [value]="estado">{{estado}}</option></select></label>
            <label *ngIf="config.showImage" class="span-2">URL de imagen<input name="imagen_url" [(ngModel)]="form.imagen_url" maxlength="500" placeholder="https://..."></label>
            <label class="span-2">Detalle / observación<textarea name="detalle" [(ngModel)]="form.detalle" rows="4"></textarea></label>
          </div>
          <footer><button type="button" class="secondary" (click)="cerrarModal()">Cancelar</button><button type="submit" class="primary" [disabled]="saving || gymForm.invalid">{{saving ? 'Guardando...' : (editandoId ? 'Guardar Cambios' : 'Crear')}}</button></footer>
        </form>
      </section>
    </section>
  `,
  styles: [`
    :host{display:block}
    .gym-suite{display:grid;gap:16px;color:#243247}
    .gym-suite-hero{min-height:116px;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:22px 24px;border:1px solid #e3e8ef;border-radius:16px;background:linear-gradient(135deg,#fff 0%,#fbfcfe 100%);box-shadow:0 6px 18px rgba(16,24,40,.035)}
    .gym-suite-heading{display:flex;align-items:center;gap:15px}
    .gym-suite-icon{width:52px;height:52px;display:grid;place-items:center;border-radius:14px;background:#fff0ed;color:#d94d37;font-size:20px;font-weight:900}
    .gym-suite-heading small{display:block;margin-bottom:5px;color:#8a95a5;font-size:8px;font-weight:800;letter-spacing:1px}
    .gym-suite-heading h2{margin:0;color:#172033;font-size:24px;line-height:1.15}
    .gym-suite-heading p{margin:5px 0 0;color:#778397;font-size:10px}
    .gym-suite-head-actions{display:flex;gap:8px}
    button{font:inherit}
    .gym-suite-head-actions button,.gym-suite-modal footer button{height:38px;padding:0 14px;border-radius:9px;font-size:9px;font-weight:800;cursor:pointer}
    button.primary{border:1px solid #ff624a;background:#ff624a;color:#fff}
    button.secondary{border:1px solid #d9e0e8;background:#fff;color:#475467}
    button:disabled{opacity:.55;cursor:not-allowed}

    .gym-suite-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
    .gym-suite-kpis article{min-height:90px;padding:14px 16px;border:1px solid #e4e8ee;border-radius:13px;background:#fff}
    .gym-suite-kpis small{display:block;color:#8a95a5;font-size:8px;font-weight:700;text-transform:uppercase}
    .gym-suite-kpis strong{display:block;margin:6px 0 3px;color:#172033;font-size:23px}
    .gym-suite-kpis span{color:#98a2b3;font-size:8px}

    .gym-suite-panel{overflow:hidden;border:1px solid #e3e8ef;border-radius:15px;background:#fff;box-shadow:0 5px 15px rgba(16,24,40,.025)}
    .gym-suite-toolbar{min-height:62px;display:flex;align-items:center;gap:9px;padding:10px 14px;border-bottom:1px solid #e9edf2}
    .gym-suite-search{min-width:260px;max-width:460px;flex:1;height:36px;display:flex;align-items:center;gap:6px;padding:0 10px;border:1px solid #dce2e9;border-radius:9px;background:#f8f9fb}
    .gym-suite-search span{color:#8490a2}
    .gym-suite-search input{min-width:0;flex:1;border:0;outline:0;background:transparent;font-size:9px}
    .gym-suite-toolbar select{height:36px;min-width:150px;padding:0 10px;border:1px solid #dce2e9;border-radius:9px;background:#fff;color:#526074;font-size:9px}
    .gym-suite-toolbar .refresh{height:36px;padding:0 12px;border:1px solid #dce2e9;border-radius:9px;background:#fff;color:#526074;font-size:9px;font-weight:700;cursor:pointer}

    .gym-suite-table-wrap{overflow:auto}
    .gym-suite-table{width:100%;min-width:860px;border-collapse:collapse}
    .gym-suite-table th,.gym-suite-table td{padding:11px 13px;border-bottom:1px solid #edf0f3;text-align:left;vertical-align:middle;font-size:9px}
    .gym-suite-table th{height:38px;background:#f8f9fb;color:#7c8798;font-size:8px;font-weight:800;letter-spacing:.45px}
    .gym-suite-table tbody tr:hover{background:#fbfcfd}
    .gym-suite-main-cell{display:flex;align-items:center;gap:9px;min-width:180px}
    .gym-suite-main-cell>div{display:flex;flex-direction:column;gap:2px}
    .gym-suite-main-cell b{color:#243247;font-size:10px}
    .gym-suite-main-cell small{color:#98a2b3;font-size:7px}
    .gym-suite-thumb{width:34px;height:34px;display:grid;place-items:center;overflow:hidden;border-radius:9px;background:#f1f4f7;color:#526074;font-weight:800}
    .gym-suite-thumb img{width:100%;height:100%;object-fit:cover}
    .status-select{height:28px;padding:0 7px;border:1px solid #dce2e9;border-radius:7px;background:#fff;color:#475467;font-size:8px}
    .gym-suite-row-actions{display:flex;gap:5px}
    .gym-suite-row-actions button{width:29px;height:29px;border:1px solid #dfe4ea;border-radius:7px;background:#fff;color:#526074;cursor:pointer}
    .gym-suite-row-actions button.danger{color:#c63f52}
    .gym-suite-row-actions button:hover{background:#f5f7f9}

    .gym-suite-empty{min-height:280px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:30px}
    .gym-suite-empty>span{width:54px;height:54px;display:grid;place-items:center;border-radius:15px;background:#fff0ed;color:#d94d37;font-size:19px}
    .gym-suite-empty h3{margin:13px 0 5px;color:#253047;font-size:14px}
    .gym-suite-empty p{max-width:380px;margin:0;color:#8993a3;font-size:9px;line-height:1.5}
    .gym-suite-empty button{height:36px;margin-top:14px;padding:0 13px;border:0;border-radius:9px;background:#172033;color:#fff;font-size:9px;font-weight:800;cursor:pointer}

    .gym-suite-modal-backdrop{position:fixed;inset:0;z-index:4000;background:rgba(15,23,42,.38);backdrop-filter:blur(2px)}
    .gym-suite-modal{position:fixed;z-index:4001;top:50%;left:50%;width:min(620px,calc(100% - 32px));max-height:calc(100vh - 40px);overflow:auto;transform:translate(-50%,-50%);border-radius:16px;background:#fff;box-shadow:0 28px 70px rgba(15,23,42,.28)}
    .gym-suite-modal>header{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;padding:19px 20px 14px;border-bottom:1px solid #e8ecf1}
    .gym-suite-modal>header small{display:block;margin-bottom:4px;color:#ff624a;font-size:8px;font-weight:900;letter-spacing:1px}
    .gym-suite-modal>header h3{margin:0;color:#172033;font-size:18px}
    .gym-suite-modal>header>button{width:32px;height:32px;border:0;border-radius:8px;background:#f2f4f7;color:#667085;font-size:18px;cursor:pointer}
    .gym-suite-modal form{padding:18px 20px 20px}
    .gym-suite-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .gym-suite-form-grid label{display:flex;flex-direction:column;gap:6px;color:#475467;font-size:9px;font-weight:700}
    .gym-suite-form-grid label.span-2{grid-column:1/-1}
    .gym-suite-form-grid input,.gym-suite-form-grid select,.gym-suite-form-grid textarea{width:100%;box-sizing:border-box;border:1px solid #dce2e9;border-radius:9px;background:#fbfcfd;color:#253047;font:inherit;font-size:9px;outline:0}
    .gym-suite-form-grid input,.gym-suite-form-grid select{height:39px;padding:0 10px}
    .gym-suite-form-grid textarea{padding:10px;resize:vertical}
    .gym-suite-form-grid input:focus,.gym-suite-form-grid select:focus,.gym-suite-form-grid textarea:focus{border-color:#9eb0c8;box-shadow:0 0 0 3px rgba(69,104,146,.08)}
    .gym-suite-modal footer{display:flex;justify-content:flex-end;gap:8px;margin-top:16px;padding-top:15px;border-top:1px solid #edf0f3}

    .gym-suite-toast{position:fixed;z-index:5000;right:24px;bottom:24px;max-width:360px;padding:11px 14px;border-radius:10px;color:#fff;font-size:9px;font-weight:700;box-shadow:0 12px 30px rgba(16,24,40,.18)}
    .gym-suite-toast.success{background:#18794e}
    .gym-suite-toast.error{background:#b4233a}

    @media(max-width:900px){
      .gym-suite-hero{align-items:flex-start;flex-direction:column}
      .gym-suite-kpis{grid-template-columns:1fr 1fr}
      .gym-suite-toolbar{align-items:stretch;flex-direction:column}
      .gym-suite-search{min-width:0;max-width:none;width:auto}
      .gym-suite-form-grid{grid-template-columns:1fr}
      .gym-suite-form-grid label.span-2{grid-column:auto}
    }
    @media(max-width:560px){
      .gym-suite-kpis{grid-template-columns:1fr}
      .gym-suite-head-actions{width:100%}
      .gym-suite-head-actions button{flex:1}
    }

    /* TEMPLATE569574_SUITE_LOCK */
    :host{display:block!important;background:#f6f6fb!important}
    .gym-suite{display:block!important;gap:0!important;margin:0!important;padding:0!important;background:#f6f6fb!important;color:#2d2c3c!important}
    .cfx-crumb{height:35px!important;min-height:35px!important;padding:0 10px!important;border:0!important;border-radius:0!important;background:linear-gradient(90deg,#574fd0,#5f57d9)!important;color:#fff!important;box-shadow:none!important}
    .cfx-crumb small,.cfx-crumb strong,.cfx-crumb b,.cfx-crumb span{color:#fff!important}
    .cf-suite-page-head{min-height:48px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;margin:8px 9px 7px!important;padding:9px 10px!important;border:1px solid #ecebf3!important;border-radius:5px!important;background:#fff!important;box-shadow:0 1px 5px rgba(61,57,102,.025)!important}
    .cf-suite-page-head h1{margin:0!important;color:#2d2c3c!important;font-size:12px!important}.cf-suite-page-head p{margin:2px 0 0!important;color:#9698a6!important;font-size:8px!important}
    .cf-suite-page-head select{height:28px!important;border:1px solid #dedee8!important;border-radius:4px!important;background:#fff!important;color:#656777!important;font-size:8px!important}
    .cf-suite-equipment-grid,.cf-suite-events,.cf-suite-gallery,.cf-suite-news,.cf-suite-salary,.cf-suite-income,.cf-suite-invoices,.gym-suite-panel{margin:0 9px 9px!important}
    .cf-suite-equipment-grid,.cf-suite-gallery,.cf-suite-news{gap:9px!important}
    .cf-suite-equipment-grid>article,.cf-suite-events>article,.cf-suite-gallery>article,.cf-suite-news>article,.cf-suite-income-cards>article,.gym-suite-panel{border:1px solid #ecebf3!important;border-radius:5px!important;background:#fff!important;box-shadow:0 1px 5px rgba(61,57,102,.025)!important}
    .cf-suite-equipment-grid h3,.cf-suite-event-main h3,.cf-suite-news h3{font-size:9px!important;color:#373746!important}
    .cf-suite-equipment-grid p,.cf-suite-event-main p,.cf-suite-news p,.cf-suite-event-meta small{font-size:8px!important;color:#9698a6!important}
    .gym-suite-table-wrap{border:1px solid #ecebf3!important;border-radius:5px!important;background:#fff!important;box-shadow:none!important}
    .gym-suite-table th{padding:6px 8px!important;background:#fafafe!important;color:#777a89!important;font-size:7.5px!important}.gym-suite-table td{padding:7px 8px!important;background:#fff!important;color:#545664!important;font-size:8px!important}
    button.primary{border-color:#5f57d9!important;background:#5f57d9!important;color:#fff!important}.cf-suite-link{color:#5f57d9!important}
    .gym-suite-modal{border:1px solid #ecebf3!important;border-radius:7px!important;background:#fff!important;box-shadow:0 18px 50px rgba(42,40,83,.16)!important}
    .gym-suite-modal>header{padding:13px 14px 10px!important;border-bottom:1px solid #ecebf3!important}.gym-suite-modal>header small{color:#5f57d9!important}.gym-suite-modal>header h3{font-size:13px!important}
    .gym-suite-modal form{padding:12px 14px 14px!important}.gym-suite-form-grid{gap:9px!important}.gym-suite-form-grid label{font-size:8px!important}
    .gym-suite-form-grid input,.gym-suite-form-grid select,.gym-suite-form-grid textarea{border:1px solid #dedee8!important;border-radius:4px!important;background:#fff!important;font-size:8px!important;box-shadow:none!important}.gym-suite-form-grid input,.gym-suite-form-grid select{height:31px!important}
    .gym-suite-modal footer button{height:28px!important;border-radius:4px!important;font-size:8px!important}
    .gym-suite-toast.success{background:#5f57d9!important}
    @media(max-width:700px){.cf-suite-equipment-grid,.cf-suite-events,.cf-suite-gallery,.cf-suite-news,.cf-suite-salary,.cf-suite-income,.cf-suite-invoices,.gym-suite-panel{margin-left:8px!important;margin-right:8px!important}}


    /* TEMPLATE569574_SUITE_COMPLETE_EXT */
    .cf-suite-complete{display:grid;gap:9px;margin:0 9px 9px}
    .cf-suite-complete>.cf-suite-page-head{margin:8px 0 0!important}
    .cf-suite-page-head>div:last-child{display:flex;align-items:center;gap:6px}
    .cf-suite-page-head button,.cf-suite-card button,.cf-suite-gallery-filter button,.cf-news-featured button{min-height:27px;padding:0 8px;border:1px solid #e0dff0;border-radius:4px;background:#fff;color:#656777;font-size:8px;font-weight:600;cursor:pointer}
    .cf-suite-page-head button.primary,.cf-suite-card button.primary{border-color:#5f57d9;background:#5f57d9;color:#fff}
    .cf-suite-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
    .cf-suite-kpis article{min-height:68px;padding:9px 10px;border:1px solid #ecebf3;border-radius:5px;background:#fff;box-shadow:0 1px 5px rgba(61,57,102,.025)}
    .cf-suite-kpis small{display:block;color:#9497a5;font-size:7px}.cf-suite-kpis b{display:block;margin:3px 0;color:#2d2c3c;font-size:15px}.cf-suite-kpis span{color:#9b9daa;font-size:6.8px}
    .cf-suite-kpis.compact article{min-height:58px}
    .cf-suite-card{padding:10px;border:1px solid #ecebf3;border-radius:5px;background:#fff;box-shadow:0 1px 5px rgba(61,57,102,.025)}
    .cf-suite-card>header{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}.cf-suite-card h2{margin:0;color:#2d2c3c;font-size:10px}.cf-suite-card p{margin:2px 0 0;color:#9698a6;font-size:7.5px}
    .cf-suite-equipment-grid{margin:0!important}
    .cf-suite-equipment-grid>article{padding:8px!important}.cf-suite-equipment-grid>article>div:last-child{display:grid;gap:3px}
    .cf-suite-equipment-grid .status-select{justify-self:start}
    .cf-suite-events{margin:0!important}.cf-suite-events>article{grid-template-columns:58px minmax(0,1fr) minmax(120px,.35fr) auto!important;padding:9px!important}
    .cf-event-calendar{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.cf-event-calendar>div{display:grid;gap:3px;padding:9px;border:1px solid #efeff4;border-radius:5px}.cf-event-calendar b{font-size:7px;color:#5f57d9}.cf-event-calendar span{font-size:8px;color:#454654}.cf-event-calendar small{font-size:6.8px;color:#9698a6}
    .cf-suite-gallery-filter{display:flex;gap:5px;flex-wrap:wrap}.cf-suite-gallery-filter button.active{border-color:#5f57d9;background:#5f57d9;color:#fff}.cf-suite-gallery{margin:0!important}
    .cf-news-featured{min-height:205px;display:grid;grid-template-columns:minmax(260px,.9fr) minmax(0,1.1fr);overflow:hidden;border:1px solid #ecebf3;border-radius:5px;background:#fff}.cf-news-featured img{width:100%;height:100%;object-fit:cover;background:#f3f2fb}.cf-news-featured>div{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:18px}.cf-news-featured span{font-size:7px;color:#5f57d9;font-weight:700}.cf-news-featured h2{margin:4px 0;color:#2d2c3c;font-size:16px}.cf-news-featured p{max-width:480px;margin:0 0 9px;color:#9698a6;font-size:8px;line-height:1.5}.cf-suite-news{margin:0!important}.cf-news-actions{display:flex;gap:5px}
    .cf-news-categories{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.cf-news-categories span{padding:9px;border:1px solid #efeff4;border-radius:5px;color:#777a89;font-size:7.5px}.cf-news-categories b{display:block;margin-bottom:2px;color:#2d2c3c;font-size:15px}
    .cf-payroll-notes,.cf-payment-status-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.cf-payroll-notes>div,.cf-payment-status-grid>div{padding:9px;border:1px solid #efeff4;border-radius:5px;text-align:center}.cf-payroll-notes b,.cf-payment-status-grid b{display:block;color:#2d2c3c;font-size:15px}.cf-payroll-notes small,.cf-payment-status-grid small{color:#9698a6;font-size:6.8px}
    .cf-suite-income-visuals{display:grid;grid-template-columns:minmax(0,2fr) minmax(230px,.8fr);gap:9px}.cf-income-bars{height:150px;display:flex;align-items:end;gap:8px;padding:12px 4px 5px;border-bottom:1px solid #efeff4}.cf-income-bars i{flex:1;min-width:8px;border-radius:3px 3px 0 0;background:linear-gradient(180deg,#5f57d9,#b9b5ee)}.cf-month-axis{display:grid;grid-template-columns:repeat(12,1fr);margin-top:4px;text-align:center}.cf-month-axis span{font-size:6.5px;color:#9a9ca9}
    .cf-revenue-donut{width:108px;height:108px;display:grid;place-items:center;margin:10px auto;border-radius:50%;background:conic-gradient(#5f57d9 0 64%,#8d86e7 64% 82%,#c4c1f1 82% 92%,#ecebf7 92%)}.cf-revenue-donut:before{content:'';grid-area:1/1;width:68px;height:68px;border-radius:50%;background:#fff}.cf-revenue-donut b{grid-area:1/1;z-index:2;font-size:12px}.cf-revenue-list{display:grid;gap:5px}.cf-revenue-list span{display:flex;justify-content:space-between;color:#7d7f8c;font-size:7px}.cf-revenue-list b{color:#454654}
    .cf-invoice-actions{display:flex;gap:4px}
    @media(max-width:950px){.cf-suite-kpis{grid-template-columns:repeat(2,1fr)}.cf-event-calendar,.cf-news-categories,.cf-payroll-notes,.cf-payment-status-grid{grid-template-columns:repeat(2,1fr)}.cf-suite-income-visuals{grid-template-columns:1fr}.cf-news-featured{grid-template-columns:1fr}.cf-news-featured img{height:180px}}
    @media(max-width:650px){.cf-suite-kpis,.cf-event-calendar,.cf-news-categories,.cf-payroll-notes,.cf-payment-status-grid{grid-template-columns:1fr}.cf-suite-events>article{grid-template-columns:50px 1fr!important}.cf-suite-event-meta,.cf-suite-events>article>button{grid-column:2}.cf-suite-page-head{align-items:flex-start!important;flex-direction:column!important}}



    /* PRESENTACION_LEGIBLE_SUITE */
    :host .gym-suite{font-size:12px!important}
    :host .cfx-crumb{height:46px!important;min-height:46px!important;padding:0 16px!important}
    :host .cfx-crumb small,:host .cfx-crumb strong{font-size:11px!important}
    :host .cf-suite-complete{gap:12px!important;margin:0 16px 14px!important}
    :host .cf-suite-page-head{min-height:64px!important;padding:13px 14px!important}
    :host .cf-suite-page-head h1{font-size:18px!important}
    :host .cf-suite-page-head p{font-size:11px!important}
    :host .cf-suite-page-head button,:host .cf-suite-card button,:host .cf-suite-gallery-filter button,:host .cf-news-featured button{min-height:34px!important;padding:0 12px!important;font-size:11px!important}
    :host .cf-suite-kpis{gap:10px!important}
    :host .cf-suite-kpis article{min-height:86px!important;padding:12px 13px!important}
    :host .cf-suite-kpis small{font-size:10px!important}
    :host .cf-suite-kpis b{font-size:20px!important}
    :host .cf-suite-kpis span{font-size:9.5px!important}
    :host .cf-suite-card{padding:14px!important}
    :host .cf-suite-card h2{font-size:14px!important}
    :host .cf-suite-card p{font-size:10px!important}
    :host .cf-suite-equipment-grid h3,:host .cf-suite-event-main h3,:host .cf-suite-news h3{font-size:13px!important}
    :host .cf-suite-equipment-grid p,:host .cf-suite-event-main p,:host .cf-suite-news p{font-size:10px!important}
    :host .gym-suite-table th{padding:9px 10px!important;font-size:10.5px!important}
    :host .gym-suite-table td{padding:10px!important;font-size:11px!important}
    :host .gym-suite-form-grid label{font-size:11px!important}
    :host .gym-suite-form-grid input,:host .gym-suite-form-grid select,:host .gym-suite-form-grid textarea{min-height:38px!important;padding:8px 10px!important;font-size:11px!important}
    :host .status-select{min-height:26px!important;font-size:10px!important}
    :host .cf-news-featured h2{font-size:20px!important}
    :host .cf-news-featured p{font-size:11px!important}
    @media(max-width:700px){:host .cf-suite-complete{margin-left:10px!important;margin-right:10px!important}}


    /* MALLQUI_SUITE_FINAL_THEME_2026_10_24 */
    :host .gym-suite{gap:12px!important;color:#17191f!important;background:#fff!important}
    :host .cfx-crumb{
      height:42px!important;min-height:42px!important;padding:0 4px!important;
      background:#fff!important;color:#777c82!important;border:0!important;border-bottom:1px solid #eff1ec!important;
    }
    :host .cfx-crumb small,:host .cfx-crumb strong,:host .cfx-crumb b,:host .cfx-crumb span{color:#777c82!important}
    :host .cfx-crumb strong{color:#17191f!important}
    :host .cf-suite-complete{margin:0 0 14px!important;gap:12px!important}
    :host .cf-suite-page-head{
      min-height:72px!important;margin:0!important;padding:14px 16px!important;
      border:1px solid #eceeea!important;border-radius:10px!important;background:#fff!important;
      box-shadow:0 2px 8px rgba(23,25,31,.025)!important;
    }
    :host .cf-suite-page-head h1{color:#17191f!important;font-size:20px!important}
    :host .cf-suite-page-head p{color:#92969d!important;font-size:10px!important}
    :host .cf-suite-page-head button,:host .cf-suite-card button,:host .cf-suite-gallery-filter button,:host .cf-news-featured button{
      min-height:34px!important;padding:0 12px!important;border:1px solid #e3e7dc!important;border-radius:7px!important;
      background:#fff!important;color:#4a4f53!important;font-size:10px!important;font-weight:700!important;
    }
    :host .cf-suite-page-head button.primary,:host .cf-suite-card button.primary,:host button.primary{
      border-color:#111311!important;background:#111311!important;color:#c9f45a!important;
    }
    :host .cf-suite-page-head button:hover,:host .cf-suite-card button:hover,:host .cf-suite-gallery-filter button:hover{
      border-color:#c9f45a!important;
    }
    :host .cf-suite-kpis,:host .cf-suite-income-cards{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:10px!important}
    :host .cf-suite-kpis article,:host .cf-suite-income-cards>article{
      min-height:88px!important;padding:13px 14px!important;border:1px solid #eceeea!important;border-radius:9px!important;
      background:#fff!important;box-shadow:0 2px 8px rgba(23,25,31,.02)!important;
    }
    :host .cf-suite-kpis small,:host .cf-suite-income-cards small{color:#90949a!important;font-size:9px!important}
    :host .cf-suite-kpis b,:host .cf-suite-income-cards b{display:block!important;margin:5px 0 2px!important;color:#17191f!important;font-size:19px!important}
    :host .cf-suite-kpis span,:host .cf-suite-income-cards span{color:#969aa0!important;font-size:8.5px!important}
    :host .cf-suite-card,:host .gym-suite-panel,:host .gym-suite-table-wrap,
    :host .cf-suite-equipment-grid>article,:host .cf-suite-events>article,:host .cf-suite-gallery>article,:host .cf-suite-news>article{
      border:1px solid #eceeea!important;border-radius:9px!important;background:#fff!important;
      box-shadow:0 2px 8px rgba(23,25,31,.02)!important;
    }
    :host .cf-suite-card{padding:14px!important}
    :host .cf-suite-card h2{color:#1d2025!important;font-size:14px!important}
    :host .cf-suite-card p{color:#93979d!important;font-size:9.5px!important}
    :host .gym-suite-table th{background:#f8faf5!important;color:#6f756d!important;border-bottom-color:#e8ece3!important}
    :host .gym-suite-table td{color:#4f5458!important;border-bottom-color:#eef0ec!important}
    :host .gym-suite-table tbody tr:hover{background:#fbfdf7!important}
    :host .cf-suite-link,:host .table-action{color:#607d1f!important;background:#effbd0!important;border-color:#dcefa8!important}
    :host .status-select{background:#f2f8e5!important;color:#5d7725!important;border-color:#dfeabf!important}
    :host .cf-suite-gallery-filter button.active{
      border-color:#111311!important;background:#111311!important;color:#c9f45a!important;
    }
    :host .cf-event-calendar b{color:#71952a!important}
    :host .cf-news-featured{border-color:#eceeea!important;border-radius:10px!important}
    :host .cf-news-featured>div{background:#fff!important}
    :host .cf-news-featured>div>span{color:#759229!important}
    :host .cf-news-featured h2{color:#17191f!important}
    :host .cf-news-featured p{color:#83888d!important}
    :host .cf-income-bars i{background:linear-gradient(180deg,#c9f45a,#8fbf32)!important}
    :host .cf-revenue-donut.real:before{background:#fff!important}
    :host .cf-revenue-list span{color:#6f746f!important;font-size:9px!important}
    :host .cf-revenue-list b{color:#17191f!important}
    :host .cf-suite-invoice-note{background:#f7fbe9!important;border-color:#e2ecc8!important;color:#62685d!important}
    :host .cf-payment-status-grid>div,:host .cf-news-categories>span,:host .cf-payroll-notes>div{
      border-color:#eceeea!important;background:#fbfcf8!important
    }
    :host .cf-suite-empty{
      grid-column:1/-1!important;min-height:150px!important;display:flex!important;flex-direction:column!important;
      align-items:center!important;justify-content:center!important;gap:7px!important;padding:18px!important;
      border:1px dashed #dfe6d1!important;border-radius:9px!important;background:#fbfdf7!important;text-align:center!important;
    }
    :host .cf-suite-empty b{color:#2d312a!important;font-size:13px!important}
    :host .cf-suite-empty span{max-width:430px!important;color:#91968f!important;font-size:9px!important}
    :host .cf-suite-empty-inline{
      grid-column:1/-1!important;padding:16px!important;border:1px dashed #e1e5db!important;border-radius:8px!important;
      background:#fbfdf8!important;color:#8d9289!important;font-size:9px!important;text-align:center!important;
    }
    :host .gym-suite-modal{border-radius:12px!important;border-color:#e7eae2!important}
    :host .gym-suite-modal header{background:#f8faf5!important;border-bottom-color:#e8ebe4!important}
    :host .gym-suite-modal header small{color:#76902f!important}
    :host .gym-suite-form-grid input,:host .gym-suite-form-grid select,:host .gym-suite-form-grid textarea{
      border-color:#e2e6dd!important;background:#fff!important;color:#25282c!important
    }
    @media(max-width:950px){
      :host .cf-suite-kpis,:host .cf-suite-income-cards{grid-template-columns:repeat(2,1fr)!important}
    }
    @media(max-width:650px){
      :host .cf-suite-kpis,:host .cf-suite-income-cards{grid-template-columns:1fr!important}
    }

  `]
})
export class AdminGymSuiteComponent implements OnInit, OnChanges {
  @Input() modulo = 'nutricion';

  records: any[] = [];
  filtered: any[] = [];
  busqueda = '';
  estadoFiltro = '';
  loading = false;
  saving = false;
  modalAbierto = false;
  editandoId: number | null = null;
  toast = '';
  error = '';
  filtroGaleria = 'Todos';
  ingresoReporte:any = null;
  mesesCortos = ['E','F','M','A','M','J','J','A','S','O','N','D'];
  mesesLargos = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  fechaAnioActual = new Date().getFullYear();

  form: any = this.formVacio();

  private configs: Record<GymModuleKey, GymModuleConfig> = {
    nutricion: {
      title: 'Plan de alimentación',
      subtitle: 'Crea y administra planes nutricionales, objetivos y seguimiento de los socios.',
      icon: '🥗',
      primaryLabel: 'Nombre del plan',
      secondaryLabel: 'Socio / objetivo',
      dateLabel: 'Fecha de inicio',
      amountLabel: 'Costo',
      showDate: true,
      showAmount: false,
      showImage: false,
      states: ['Activo','Pendiente','Finalizado','Pausado'],
      accent: '#36a269'
    },
    equipos: {
      title: 'Equipos',
      subtitle: 'Controla máquinas, estado operativo, ubicación y mantenimiento.',
      icon: '🏋',
      primaryLabel: 'Equipo',
      secondaryLabel: 'Ubicación / código',
      dateLabel: 'Próximo mantenimiento',
      amountLabel: 'Valor',
      showDate: true,
      showAmount: true,
      showImage: true,
      states: ['Operativo','Mantenimiento','Fuera de servicio','Baja'],
      accent: '#3b6fc3'
    },
    eventos: {
      title: 'Eventos del Gimnasio',
      subtitle: 'Planifica actividades, competencias, campañas y eventos internos.',
      icon: '📅',
      primaryLabel: 'Evento',
      secondaryLabel: 'Lugar / responsable',
      dateLabel: 'Fecha del evento',
      amountLabel: 'Presupuesto',
      showDate: true,
      showAmount: true,
      showImage: true,
      states: ['Programado','En curso','Finalizado','Cancelado'],
      accent: '#d47c2f'
    },
    galeria: {
      title: 'Galería',
      subtitle: 'Administra imágenes y contenidos visuales del gimnasio.',
      icon: '🖼',
      primaryLabel: 'Título',
      secondaryLabel: 'Descripción',
      dateLabel: 'Fecha',
      amountLabel: 'Monto',
      showDate: true,
      showAmount: false,
      showImage: true,
      states: ['Publicado','Borrador','Archivado'],
      accent: '#8b5cc7'
    },
    noticias: {
      title: 'Noticias y Novedades',
      subtitle: 'Publica avisos, promociones y comunicados para la comunidad del gimnasio.',
      icon: '📰',
      primaryLabel: 'Título',
      secondaryLabel: 'Resumen',
      dateLabel: 'Fecha de publicación',
      amountLabel: 'Monto',
      showDate: true,
      showAmount: false,
      showImage: true,
      states: ['Publicado','Programado','Borrador','Archivado'],
      accent: '#d64e67'
    },
    salarios: {
      title: 'Salarios',
      subtitle: 'Registra pagos, periodos y estados de remuneración del personal.',
      icon: '💼',
      primaryLabel: 'Colaborador',
      secondaryLabel: 'Cargo / periodo',
      dateLabel: 'Fecha de pago',
      amountLabel: 'Salario',
      showDate: true,
      showAmount: true,
      showImage: false,
      states: ['Pagado','Pendiente','Observado','Anulado'],
      accent: '#2e8b78'
    },
    ingresos: {
      title: 'Ingresos',
      subtitle: 'Registra ingresos adicionales y conceptos financieros del gimnasio.',
      icon: '💰',
      primaryLabel: 'Concepto',
      secondaryLabel: 'Detalle / origen',
      dateLabel: 'Fecha',
      amountLabel: 'Importe',
      showDate: true,
      showAmount: true,
      showImage: false,
      states: ['Confirmado','Pendiente','Anulado'],
      accent: '#2f9c5d'
    },
    facturas: {
      title: 'Facturas',
      subtitle: 'Controla comprobantes, clientes, conceptos, importes y estados.',
      icon: '🧾',
      primaryLabel: 'Cliente / comprobante',
      secondaryLabel: 'Concepto',
      dateLabel: 'Fecha de emisión',
      amountLabel: 'Total',
      showDate: true,
      showAmount: true,
      showImage: false,
      states: ['Emitida','Pagada','Pendiente','Anulada'],
      accent: '#5269aa'
    }
  };


  constructor(private api: AdminApiService) {}

  ngOnInit(): void {
    this.cargar();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modulo'] && !changes['modulo'].firstChange) {
      this.busqueda = '';
      this.estadoFiltro = '';
      this.cargar();
    }
  }

  get config(): GymModuleConfig {
    return this.configs[this.modulo as GymModuleKey] || this.configs.nutricion;
  }

  get activos(): number {
    const inactivos = ['Finalizado','Pausado','Fuera de servicio','Baja','Cancelado','Archivado','Anulado'];
    return this.records.filter(r => !inactivos.includes(String(r?.estado || ''))).length;
  }

  get pendientes(): number {
    return this.records.filter(r => /pendiente|mantenimiento|observado|borrador|programado/i.test(String(r?.estado || ''))).length;
  }

  get totalMonto(): number {
    return this.filtered.reduce((s, r) => s + Number(r?.monto || 0), 0);
  }

  get esteMes(): number {
    const now = new Date();
    return this.records.filter(r => {
      const raw = r?.fecha || r?.created_at;
      if (!raw) return false;
      const d = new Date(raw);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
  }

  cargar(): void {
    this.loading = true;
    this.error = '';
    this.api.gymRegistros(this.modulo).subscribe({
      next: (data: any[]) => {
        this.records = Array.isArray(data) ? data : [];
        this.filtrarLocal();
        if (this.modulo === 'ingresos') this.cargarReporteIngresos();
        this.loading = false;
      },
      error: (e: any) => {
        this.loading = false;
        this.error = e?.error?.message || 'No se pudo cargar este módulo. Ejecuta las migraciones del backend.';
        this.limpiarMensaje('error');
      }
    });
  }

  contarEstados(estados:string[]): number {
    const aceptados=estados.map(x=>x.toLowerCase());
    return this.records.filter((r:any)=>aceptados.includes(String(r?.estado||'').toLowerCase())).length;
  }

  get categoriasReales(): number {
    return new Set(this.records.map((r:any)=>String(r?.subtitulo||'').trim()).filter(Boolean)).size;
  }

  cargarReporteIngresos(): void {
    this.api.reporteIngresos().subscribe({
      next:(r:any)=>this.ingresoReporte=r||null,
      error:()=>this.ingresoReporte=null
    });
  }

  get ingresoMeses(): any[] {
    const base=Array.isArray(this.ingresoReporte?.por_mes) ? this.ingresoReporte.por_mes : [];
    return Array.from({length:12},(_,i)=>base[i] || {mes:i+1,membresias:0,ventas_productos:0,total:0});
  }

  alturaIngreso(total:any): number {
    const max=Math.max(0,...this.ingresoMeses.map((r:any)=>Number(r?.total||0)));
    if(max<=0) return 3;
    return Math.max(3,Math.round((Number(total||0)/max)*100));
  }

  get porcentajeMembresias(): number {
    const total=Number(this.ingresoReporte?.total_anual||0);
    return total>0 ? Math.round((Number(this.ingresoReporte?.membresias_anual||0)/total)*100) : 0;
  }

  get porcentajeVentas(): number {
    return this.ingresoReporte?.total_anual ? Math.max(0,100-this.porcentajeMembresias) : 0;
  }

  get fondoDonutIngresos(): string {
    const p=this.porcentajeMembresias;
    return 'conic-gradient(#c9f45a 0 '+p+'%, #111311 '+p+'% 100%)';
  }

  get totalPagadoFacturas(): number {
    return this.filtered.filter((r:any)=>String(r?.estado||'').toLowerCase()==='pagada').reduce((acc:number,r:any)=>acc+Number(r?.monto||0),0);
  }

  get tasaCobranza(): number {
    if(!this.filtered.length) return 0;
    return Math.round((this.contarEstados(['Pagada'])/this.filtered.length)*100);
  }
  filtrarLocal(): void {
    const q = this.busqueda.trim().toLowerCase();
    const estado = this.estadoFiltro;
    this.filtered = this.records.filter(item => {
      const texto = [item?.titulo,item?.subtitulo,item?.estado,item?.fecha].filter(Boolean).join(' ').toLowerCase();
      return (!q || texto.includes(q)) && (!estado || item?.estado === estado);
    });
  }

  nuevoRegistro(): void {
    this.editandoId = null;
    this.form = this.formVacio();
    this.form.estado = this.config.states[0];
    this.modalAbierto = true;
  }

  editar(item: any): void {
    this.editandoId = Number(item.id);
    this.form = {
      titulo: item?.titulo || '',
      subtitulo: item?.subtitulo || '',
      estado: item?.estado || this.config.states[0],
      fecha: item?.fecha || '',
      monto: item?.monto ?? null,
      imagen_url: item?.imagen_url || '',
      detalle: item?.datos?.detalle || ''
    };
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    if (this.saving) return;
    this.modalAbierto = false;
    this.editandoId = null;
  }

  guardar(): void {
    const titulo = String(this.form?.titulo || '').trim();
    if (!titulo) {
      this.error = 'Completa el campo principal.';
      this.limpiarMensaje('error');
      return;
    }

    const payload = {
      titulo,
      subtitulo: String(this.form?.subtitulo || '').trim() || null,
      estado: this.form?.estado || this.config.states[0],
      fecha: this.form?.fecha || null,
      monto: this.config.showAmount && this.form?.monto !== '' && this.form?.monto !== null
        ? Number(this.form.monto)
        : null,
      imagen_url: this.config.showImage ? (String(this.form?.imagen_url || '').trim() || null) : null,
      datos: {
        detalle: String(this.form?.detalle || '').trim()
      }
    };

    this.saving = true;
    const req = this.editandoId
      ? this.api.actualizarGymRegistro(this.modulo, this.editandoId, payload)
      : this.api.crearGymRegistro(this.modulo, payload);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.modalAbierto = false;
        this.toast = this.editandoId ? 'Registro actualizado correctamente.' : 'Registro creado correctamente.';
        this.editandoId = null;
        this.cargar();
        this.limpiarMensaje('toast');
      },
      error: (e: any) => {
        this.saving = false;
        this.error = e?.error?.message || 'No se pudo guardar el registro.';
        this.limpiarMensaje('error');
      }
    });
  }

  cambiarEstado(item: any, estado: string): void {
    if (!item?.id || !estado || estado === item.estado) return;
    this.api.cambiarEstadoGymRegistro(this.modulo, Number(item.id), estado).subscribe({
      next: () => {
        item.estado = estado;
        this.toast = 'Estado actualizado.';
        this.filtrarLocal();
        this.limpiarMensaje('toast');
      },
      error: () => {
        this.error = 'No se pudo actualizar el estado.';
        this.limpiarMensaje('error');
      }
    });
  }

  eliminar(item: any): void {
    if (!item?.id) return;
    const nombre = item?.titulo || 'este registro';
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;

    this.api.eliminarGymRegistro(this.modulo, Number(item.id)).subscribe({
      next: () => {
        this.toast = 'Registro eliminado.';
        this.records = this.records.filter(r => r.id !== item.id);
        this.filtrarLocal();
        this.limpiarMensaje('toast');
      },
      error: () => {
        this.error = 'No se pudo eliminar el registro.';
        this.limpiarMensaje('error');
      }
    });
  }

  exportCsv(): void {
    const rows = [
      [this.config.primaryLabel,this.config.secondaryLabel,this.config.dateLabel,this.config.amountLabel,'Estado'],
      ...this.filtered.map(r => [
        r?.titulo || '',
        r?.subtitulo || '',
        r?.fecha || '',
        r?.monto || '',
        r?.estado || ''
      ])
    ];
    const csv = rows
      .map(row => row.map(v => '"' + String(v ?? '').replace(/"/g,'""') + '"').join(','))
      .join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mallqui-${this.modulo}-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }


  get galeriaVisible(): any[] {
    const base = this.records;
    if (this.filtroGaleria === 'Todos') return base;
    return base.filter((item:any) => {
      const texto = [item?.titulo,item?.subtitulo,item?.datos?.detalle,item?.categoria].filter(Boolean).join(' ').toLowerCase();
      return texto.includes(this.filtroGaleria.toLowerCase());
    });
  }

  filtrarGaleria(filtro:string): void {
    this.filtroGaleria = filtro;
    this.mostrarAviso(filtro === 'Todos' ? 'Mostrando toda la galería.' : 'Filtro de galería: ' + filtro);
  }

  mostrarAviso(mensaje:string): void {
    this.toast = mensaje;
    this.limpiarMensaje('toast');
  }

  private formVacio(): any {
    return {
      titulo: '',
      subtitulo: '',
      estado: 'Activo',
      fecha: '',
      monto: null,
      imagen_url: '',
      detalle: ''
    };
  }

  private limpiarMensaje(tipo: 'toast'|'error'): void {
    setTimeout(() => {
      if (tipo === 'toast') this.toast = '';
      else this.error = '';
    }, 3500);
  }
}
