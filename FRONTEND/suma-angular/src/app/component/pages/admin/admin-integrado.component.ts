import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminApiService } from './admin-api.service';
import { AuthService } from './auth.service';
import { ProductosComponent } from './pages/productos/productos';

@Component({
  selector: 'app-admin-integrado',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductosComponent],
  styleUrls: ['../mallqui-admin.css'],
  encapsulation: ViewEncapsulation.None,
  template: `
  <div class="admin-shell" [class.admin-sidebar-collapsed]="sidebarCerrado">
    <aside class="admin-nav">
      <div class="admin-nav-top">
        <button type="button" class="admin-brand" (click)="cambiarSeccion('dashboard')" aria-label="Volver al dashboard principal" title="Volver al dashboard">
          <span class="brand-glow"></span>
          <img src="assets/mallqui-logo.svg" alt="Mallqui Gym">
        </button>
        <button type="button" class="admin-brand-copy" (click)="cambiarSeccion('dashboard')" aria-label="Volver al dashboard principal">
          <strong>MALLQUI GYM</strong>
          <small>Centro de administración</small>
        </button>
      </div>

      <div class="admin-menu-label">NAVEGACIÓN</div>
      <nav>
        <button *ngFor="let item of menu" type="button" [class.active]="seccion===item.id" (click)="cambiarSeccion(item.id)">
          <span class="admin-menu-icon">{{item.icono}}</span>
          <span class="admin-menu-text">{{item.nombre}}</span>
          <i *ngIf="seccion===item.id">›</i>
        </button>
      </nav>

      <div class="admin-system-card">
        <div class="system-live-dot"></div>
        <div><b>Sistema conectado</b><small>Laravel + Angular + MySQL</small></div>
      </div>
      <button type="button" class="admin-logout" (click)="cerrarSesion()"><span>↪</span> Cerrar sesión</button>
    </aside>

    <button
      type="button"
      class="admin-sidebar-toggle"
      [class.is-collapsed]="sidebarCerrado"
      (click)="toggleSidebar()"
      [attr.aria-label]="sidebarCerrado ? 'Abrir menú lateral' : 'Cerrar menú lateral'"
      [attr.title]="sidebarCerrado ? 'Abrir menú' : 'Cerrar menú'">
      {{sidebarCerrado ? '›' : '‹'}}
    </button>

    <main class="admin-content">
      <header class="admin-header">
        <div class="admin-title-block">
          <span class="admin-title-kicker">MALLQUI GYM · ADMIN</span>
          <h1>{{tituloActual}}</h1>
          <p>{{subtituloActual}}</p>
        </div>
        <button class="admin-secondary admin-refresh-top" type="button" (click)="recargarTodo()">↻ Actualizar datos</button>
        <div class="admin-profile-wrap">
          <button type="button" class="admin-profile">
            <span class="admin-avatar">A</span>
            <p><strong>{{auth.usuario?.nombre_usuario || 'Administrador'}}</strong><small>{{auth.usuario?.correo || ''}}</small></p>
            <i>⌄</i>
          </button>
        </div>
      </header>

      <div *ngIf="toast" class="admin-toast">{{toast}}</div>
      <div *ngIf="error" class="admin-toast">⚠ {{error}}</div>

      <ng-container *ngIf="seccion==='dashboard'">
        <section class="ux-dashboard-head">
          <div>
            <span class="ux-overline">PANEL ADMINISTRATIVO · {{dashboard?.periodo?.mes || 'MES ACTUAL'}}</span>
            <h2>Todo lo importante, sin buscar de más.</h2>
            <p>Revisa el estado del gimnasio y entra directo a la acción que necesitas.</p>
          </div>
          <div class="ux-head-actions">
            <div class="ux-cash-status" [class.is-open]="dashboard?.caja?.abierta">
              <span class="ux-status-dot"></span>
              <div>
                <b>{{dashboard?.caja?.abierta ? 'Caja abierta' : 'Caja cerrada'}}</b>
                <small>{{dashboard?.periodo?.fecha || ''}}</small>
              </div>
            </div>
            <button type="button" class="ux-refresh" (click)="cargarDashboard()">↻ Actualizar</button>
          </div>
        </section>

        <section class="ux-quick-actions" aria-label="Acciones rápidas">
          <button type="button" class="ux-action primary-action" (click)="cambiarSeccion('ventas')">
            <span>＋</span><div><b>Nueva venta</b><small>Vender productos</small></div>
          </button>
          <button type="button" class="ux-action" (click)="cambiarSeccion('clientes')">
            <span>♙</span><div><b>Registrar cliente</b><small>Nuevo socio</small></div>
          </button>
          <button type="button" class="ux-action" (click)="cambiarSeccion('membresias')">
            <span>✦</span><div><b>Asignar membresía</b><small>Contratar o renovar</small></div>
          </button>
          <button type="button" class="ux-action" (click)="cambiarSeccion('asistencias')">
            <span>✓</span><div><b>Registrar asistencia</b><small>Entrada o salida</small></div>
          </button>
        </section>

        <section class="ux-primary-kpis" aria-label="Indicadores principales">
          <article class="ux-kpi">
            <div class="ux-kpi-head"><span class="ux-kpi-icon success">S/</span><small>HOY</small></div>
            <p>Ventas</p>
            <h3>S/ {{dashboard?.ventas?.hoy_total ?? 0 | number:'1.2-2'}}</h3>
            <span>{{dashboard?.ventas?.hoy_cantidad ?? 0}} operaciones válidas</span>
          </article>
          <article class="ux-kpi">
            <div class="ux-kpi-head"><span class="ux-kpi-icon">↗</span><small>ESTE MES</small></div>
            <p>Ingresos</p>
            <h3>S/ {{dashboard?.ingresos?.total_mes ?? 0 | number:'1.2-2'}}</h3>
            <span [class.ux-positive]="(dashboard?.ingresos?.variacion_mes ?? 0) >= 0">{{dashboard?.ingresos?.variacion_mes ?? 0 | number:'1.1-1'}}% vs. mes anterior</span>
          </article>
          <article class="ux-kpi">
            <div class="ux-kpi-head"><span class="ux-kpi-icon">♙</span><small>CLIENTES</small></div>
            <p>Clientes activos</p>
            <h3>{{dashboard?.clientes?.activos ?? 0}}</h3>
            <span>{{dashboard?.clientes?.nuevos_mes ?? 0}} nuevos este mes</span>
          </article>
          <article class="ux-kpi">
            <div class="ux-kpi-head"><span class="ux-kpi-icon warning">✦</span><small>MEMBRESÍAS</small></div>
            <p>Membresías activas</p>
            <h3>{{dashboard?.membresias?.activas ?? 0}}</h3>
            <span>{{dashboard?.membresias?.por_vencer_7_dias ?? 0}} por vencer</span>
          </article>
        </section>

        <section class="ux-status-strip" aria-label="Estado operativo">
          <button type="button" (click)="cambiarSeccion('reservas')"><span>◷</span><div><b>{{dashboard?.reservas?.hoy ?? 0}}</b><small>Reservas hoy</small></div></button>
          <button type="button" (click)="cambiarSeccion('asistencias')"><span>▣</span><div><b>{{dashboard?.asistencias?.hoy ?? 0}}</b><small>Asistencias hoy</small></div></button>
          <button type="button" [class.needs-attention]="(dashboard?.membresias?.pagos_pendientes ?? 0)>0" (click)="cambiarSeccion('pagos')"><span>▤</span><div><b>{{dashboard?.membresias?.pagos_pendientes ?? 0}}</b><small>Pagos pendientes</small></div></button>
          <button type="button" [class.needs-attention]="(dashboard?.inventario?.productos_stock_bajo ?? 0)>0" (click)="cambiarSeccion('productos')"><span>!</span><div><b>{{dashboard?.inventario?.productos_stock_bajo ?? 0}}</b><small>Stock bajo</small></div></button>
        </section>

        <section class="ux-alert-banner" *ngIf="(dashboard?.alertas?.total ?? 0) > 0">
          <div><span>!</span><div><b>Hay {{dashboard?.alertas?.total}} pendientes que requieren atención.</b><small>Prioriza pagos pendientes, membresías por vencer y productos con stock bajo.</small></div></div>
          <button type="button" (click)="cambiarSeccion('reportes')">Revisar detalles →</button>
        </section>

        <section class="ux-chart-layout">
          <article class="ux-card ux-revenue-card">
            <div class="ux-card-head">
              <div><span class="ux-section-label">TENDENCIA</span><h3>Ingresos de los últimos 6 meses</h3><p>Membresías y productos, sin ventas anuladas.</p></div>
              <div class="chart-legend"><span><i class="legend-membership"></i>Membresías</span><span><i class="legend-sales"></i>Productos</span></div>
            </div>
            <div class="revenue-chart ux-revenue-chart" *ngIf="dashboard?.tendencias?.ingresos_6_meses?.length; else sinIngresosGrafica">
              <div class="chart-y-label"><span>Mayor</span><span>Menor</span></div>
              <div class="revenue-columns">
                <div class="revenue-column" *ngFor="let m of dashboard?.tendencias?.ingresos_6_meses">
                  <div class="revenue-value">S/ {{m.total | number:'1.0-0'}}</div>
                  <div class="revenue-bars">
                    <i class="bar-membership" [style.height.%]="alturaIngreso(m.membresias)" [attr.title]="'Membresías: S/ '+m.membresias"></i>
                    <i class="bar-sales" [style.height.%]="alturaIngreso(m.ventas)" [attr.title]="'Productos: S/ '+m.ventas"></i>
                  </div>
                  <b>{{m.mes}}</b><small>{{m.anio}}</small>
                </div>
              </div>
            </div>
            <ng-template #sinIngresosGrafica><div class="dashboard-empty">Aún no hay ingresos suficientes para mostrar una tendencia.</div></ng-template>
          </article>

          <aside class="ux-side-stack">
            <article class="ux-card ux-cash-card">
              <div class="ux-card-head compact"><div><span class="ux-section-label">OPERACIÓN</span><h3>Estado de caja</h3></div><button type="button" class="ux-link" (click)="cambiarSeccion('caja')">Administrar →</button></div>
              <div class="ux-cash-block" [class.is-open]="dashboard?.caja?.abierta">
                <span>{{dashboard?.caja?.abierta ? 'ABIERTA' : 'CERRADA'}}</span>
                <h4 *ngIf="dashboard?.caja?.abierta">S/ {{dashboard?.caja?.detalle?.monto_esperado ?? dashboard?.caja?.detalle?.monto_inicial ?? 0 | number:'1.2-2'}}</h4>
                <h4 *ngIf="!dashboard?.caja?.abierta">Sin caja activa</h4>
                <small *ngIf="dashboard?.caja?.detalle">Abierta desde {{fecha(dashboard?.caja?.detalle?.fecha_apertura)}}</small>
              </div>
            </article>

            <article class="ux-card">
              <div class="ux-card-head compact"><div><span class="ux-section-label">HOY</span><h3>Asistencias</h3></div><strong class="ux-card-total">{{totalAsistenciasSemana}} / 7 días</strong></div>
              <div class="attendance-bars-real ux-attendance-chart" *ngIf="dashboard?.tendencias?.asistencias_7_dias?.length">
                <div class="attendance-day" *ngFor="let d of dashboard?.tendencias?.asistencias_7_dias">
                  <span>{{d.total}}</span>
                  <div class="attendance-track"><i [style.height.%]="alturaAsistencia(d.total)"></i></div>
                  <b>{{d.dia}}</b>
                </div>
              </div>
            </article>
          </aside>
        </section>

        <section class="ux-content-grid">
          <article class="ux-card">
            <div class="ux-card-head">
              <div><span class="ux-section-label">ACTIVIDAD</span><h3>Últimas ventas</h3><p>Operaciones válidas más recientes.</p></div>
              <button type="button" class="ux-link" (click)="cambiarSeccion('ventas')">Ver ventas →</button>
            </div>
            <div class="table-wrap ux-table-wrap">
              <table class="management-table ux-table">
                <thead><tr><th>Comprobante</th><th>Cliente</th><th>Método</th><th>Total</th></tr></thead>
                <tbody>
                  <tr *ngFor="let v of (dashboard?.ventas?.recientes || []).slice(0,5)">
                    <td><b>{{v.numero_comprobante}}</b><small>{{fecha(v.fecha_venta)}}</small></td>
                    <td>{{nombreCliente(v.cliente)}}</td><td>{{v.metodo_pago}}</td><td><strong>S/ {{v.total | number:'1.2-2'}}</strong></td>
                  </tr>
                  <tr *ngIf="!(dashboard?.ventas?.recientes?.length)"><td colspan="4">Todavía no hay ventas registradas.</td></tr>
                </tbody>
              </table>
            </div>
          </article>

          <article class="ux-card">
            <div class="ux-card-head"><div><span class="ux-section-label">RANKING</span><h3>Productos más vendidos</h3><p>Resultado del mes actual.</p></div></div>
            <div class="ux-ranking-row" *ngFor="let p of dashboard?.ventas?.top_productos || []; let i=index">
              <span>{{i+1}}</span><div><b>{{p.nombre_producto}}</b><small>{{p.cantidad}} unidades</small></div><strong>S/ {{p.importe | number:'1.2-2'}}</strong>
            </div>
            <div class="dashboard-empty" *ngIf="!(dashboard?.ventas?.top_productos?.length)">Sin ventas de productos este mes.</div>
          </article>
        </section>

        <section class="ux-bottom-grid">
          <article class="ux-card">
            <div class="ux-card-head compact"><div><span class="ux-section-label">PRÓXIMOS 7 DÍAS</span><h3>Membresías por vencer</h3></div><button type="button" class="ux-link" (click)="cambiarSeccion('membresias')">Gestionar →</button></div>
            <div class="ux-list-row" *ngFor="let m of (dashboard?.membresias?.detalle_por_vencer || []).slice(0,5)">
              <div><b>{{nombreCliente(m.cliente)}}</b><small>{{m.membresia?.nombre}}</small></div><span>{{m.fecha_fin}}</span>
            </div>
            <div class="dashboard-empty" *ngIf="!(dashboard?.membresias?.detalle_por_vencer?.length)">No hay membresías próximas a vencer.</div>
          </article>

          <article class="ux-card">
            <div class="ux-card-head compact"><div><span class="ux-section-label">AGENDA</span><h3>Reservas de hoy</h3></div><button type="button" class="ux-link" (click)="cambiarSeccion('reservas')">Ver agenda →</button></div>
            <div class="ux-list-row" *ngFor="let r of (dashboard?.reservas?.detalle_hoy || []).slice(0,5)">
              <div><b>{{r.clase?.nombre || 'Clase'}}</b><small>{{nombreCliente(r.cliente)}}</small></div><span>{{r.clase?.hora_inicio || ''}}</span>
            </div>
            <div class="dashboard-empty" *ngIf="!(dashboard?.reservas?.detalle_hoy?.length)">No hay reservas para hoy.</div>
          </article>

          <article class="ux-card">
            <div class="ux-card-head compact"><div><span class="ux-section-label">DISTRIBUCIÓN</span><h3>Membresías por plan</h3></div><strong class="ux-card-total">{{dashboard?.membresias?.activas ?? 0}} activas</strong></div>
            <div class="membership-progress-list ux-membership-list">
              <div *ngFor="let p of dashboard?.tendencias?.membresias_por_plan">
                <div><b>{{p.nombre}}</b><span>{{p.total}} clientes</span></div>
                <div class="membership-progress"><i [style.width.%]="porcentajePlan(p.total)"></i></div>
              </div>
              <div class="dashboard-empty" *ngIf="!(dashboard?.tendencias?.membresias_por_plan?.length)">Todavía no hay membresías activas.</div>
            </div>
          </article>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='clientes'">
        <section class="management-grid">
          <article class="admin-form-card">
            <div class="management-heading"><div><h2>Registrar cliente</h2><p>Se guarda directamente en MySQL.</p></div><span>＋</span></div>
            <form (ngSubmit)="crearCliente()">
              <div class="form-row"><label>DNI<input [(ngModel)]="clienteForm.dni" name="dni" required></label><label>Teléfono<input [(ngModel)]="clienteForm.telefono" name="telefono"></label></div>
              <div class="form-row"><label>Nombres<input [(ngModel)]="clienteForm.nombres" name="nombres" required></label><label>Apellidos<input [(ngModel)]="clienteForm.apellidos" name="apellidos" required></label></div>
              <label>Correo<input type="email" [(ngModel)]="clienteForm.correo" name="correo"></label>
              <label>Dirección<input [(ngModel)]="clienteForm.direccion" name="direccion"></label>
              <button class="admin-primary" type="submit">Guardar cliente</button>
            </form>
          </article>
          <article class="admin-list-card wide-card">
            <div class="management-heading"><div><h2>Clientes</h2><p>{{clientes.length}} registros desde Laravel.</p></div></div>
            <div class="table-wrap"><table class="management-table"><thead><tr><th>ID</th><th>DNI</th><th>Cliente</th><th>Correo</th><th>Teléfono</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
              <tr *ngFor="let c of clientes"><td>{{c.id_cliente}}</td><td>{{c.dni}}</td><td><b>{{nombreCliente(c)}}</b></td><td>{{c.correo}}</td><td>{{c.telefono}}</td><td>{{c.estado}}</td><td><button class="table-danger" type="button" (click)="desactivarCliente(c.id_cliente)">Desactivar</button></td></tr>
            </tbody></table></div>
          </article>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='membresias'">
        <section class="management-grid">
          <article class="admin-form-card">
            <div class="management-heading"><div><h2>{{planEditandoId ? 'Editar plan' : 'Nuevo plan'}}</h2><p>Configura precio, duración y estado de las membresías.</p></div><span>✦</span></div>
            <form (ngSubmit)="guardarPlan()">
              <label>Nombre<input [(ngModel)]="planForm.nombre" name="pnombre" required></label>
              <div class="form-row"><label>Duración (meses)<input type="number" min="1" [(ngModel)]="planForm.duracion_meses" name="pduracion" required></label><label>Precio S/<input type="number" min="0" step="0.01" [(ngModel)]="planForm.precio" name="pprecio" required></label></div>
              <label>Descripción<textarea [(ngModel)]="planForm.descripcion" name="pdescripcion"></textarea></label>
              <label>Estado<select [(ngModel)]="planForm.estado" name="pestado"><option>Activo</option><option>Inactivo</option></select></label>
              <div class="form-row"><button class="admin-primary" type="submit">{{planEditandoId ? 'Guardar cambios' : 'Crear plan'}}</button><button *ngIf="planEditandoId" class="admin-secondary" type="button" (click)="cancelarEdicionPlan()">Cancelar</button></div>
            </form>
          </article>
          <article class="admin-list-card wide-card">
            <div class="management-heading"><div><h2>Planes de membresía</h2><p>{{planesMembresia.length}} planes configurados.</p></div></div>
            <div class="table-wrap"><table class="management-table"><thead><tr><th>Plan</th><th>Duración</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead><tbody><tr *ngFor="let p of planesMembresia"><td><b>{{p.nombre}}</b><br><small>{{p.descripcion}}</small></td><td>{{p.duracion_meses}} mes(es)</td><td>S/ {{p.precio}}</td><td>{{p.estado}}</td><td><button class="table-action" type="button" (click)="editarPlan(p)">Editar</button> <button *ngIf="p.estado==='Activo'" class="table-danger" type="button" (click)="desactivarPlan(p.id_membresia)">Desactivar</button></td></tr></tbody></table></div>
          </article>
          <article class="admin-form-card">
            <div class="management-heading"><div><h2>Contratar membresía</h2><p>Registra membresía y pago en la base de datos.</p></div><span>＋</span></div>
            <form (ngSubmit)="contratarMembresia()">
              <label>Cliente<select [(ngModel)]="membresiaForm.id_cliente" name="mcliente" required><option [ngValue]="0">Seleccionar</option><option *ngFor="let c of clientes" [ngValue]="c.id_cliente">{{nombreCliente(c)}}</option></select></label>
              <label>Plan<select [(ngModel)]="membresiaForm.id_membresia" name="mplan" required><option [ngValue]="0">Seleccionar</option><option *ngFor="let m of membresiasDisponibles" [ngValue]="m.id_membresia">{{m.nombre}} - S/ {{m.precio}}</option></select></label>
              <div class="form-row"><label>Método<select [(ngModel)]="membresiaForm.metodo_pago" name="mmetodo"><option>Efectivo</option><option>Yape</option><option>Plin</option><option>Transferencia</option><option>Tarjeta</option></select></label><label>N° operación<input [(ngModel)]="membresiaForm.numero_operacion" name="moperacion"></label></div>
              <button class="admin-primary" type="submit">Contratar membresía</button>
            </form>
          </article>
          <article class="admin-list-card wide-card">
            <div class="management-heading"><div><h2>Membresías de clientes</h2><p>{{membresiasCliente.length}} registros.</p></div></div>
            <div class="table-wrap"><table class="management-table"><thead><tr><th>ID</th><th>Cliente</th><th>Plan</th><th>Inicio</th><th>Fin</th><th>Estado</th></tr></thead><tbody>
              <tr *ngFor="let m of membresiasCliente"><td>{{m.id_cliente_membresia}}</td><td>{{nombreCliente(m.cliente)}}</td><td>{{m.membresia?.nombre}}</td><td>{{m.fecha_inicio}}</td><td>{{m.fecha_fin}}</td><td>{{m.estado}}</td></tr>
            </tbody></table></div>
          </article>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='pagos'">
        <section class="admin-list-card">
          <div class="management-heading"><div><h2>Pagos pendientes</h2><p>Confirmación de Yape, Plin, transferencia o tarjeta.</p></div><span class="big-number">{{pagosPendientes.length}}</span></div>
          <div class="table-wrap"><table class="management-table"><thead><tr><th>ID</th><th>Cliente</th><th>Plan</th><th>Monto</th><th>Método</th><th>N° operación</th><th>Acciones</th></tr></thead><tbody>
            <tr *ngFor="let p of pagosPendientes"><td>{{p.id_pago}}</td><td>{{clientePago(p)}}</td><td>{{planPago(p)}}</td><td>S/ {{p.monto | number:'1.2-2'}}</td><td>{{p.metodo_pago}}</td><td>{{p.numero_operacion}}</td><td><button class="table-action" type="button" (click)="confirmarPago(p.id_pago)">Confirmar</button> <button class="table-danger" type="button" (click)="rechazarPago(p.id_pago)">Rechazar</button></td></tr>
            <tr *ngIf="!pagosPendientes.length"><td colspan="7">No hay pagos pendientes.</td></tr>
          </tbody></table></div>
        </section>
        <section class="admin-list-card">
          <div class="management-heading"><div><h2>Historial de pagos</h2><p>{{pagos.length}} pagos registrados.</p></div></div>
          <div class="table-wrap"><table class="management-table"><thead><tr><th>ID</th><th>Cliente</th><th>Plan</th><th>Monto</th><th>Método</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>
            <tr *ngFor="let p of pagos"><td>{{p.id_pago}}</td><td>{{clientePago(p)}}</td><td>{{planPago(p)}}</td><td>S/ {{p.monto | number:'1.2-2'}}</td><td>{{p.metodo_pago}}</td><td>{{fecha(p.fecha_pago)}}</td><td>{{p.estado_pago}}</td></tr>
          </tbody></table></div>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='entrenador'">
        <section class="management-grid">
          <article class="admin-form-card">
            <div class="management-heading"><div><h2>{{entrenadorEditandoId ? 'Editar entrenador' : 'Registrar entrenador'}}</h2><p>Administra varios entrenadores y crea su acceso al sistema.</p></div><span>🏋</span></div>
            <form (ngSubmit)="guardarEntrenador()">
              <div class="form-row"><label>DNI<input [(ngModel)]="entrenadorForm.dni" name="edni" required></label><label>Especialidad<input [(ngModel)]="entrenadorForm.especialidad" name="eespecialidad"></label></div>
              <div class="form-row"><label>Nombres<input [(ngModel)]="entrenadorForm.nombres" name="enombres" required></label><label>Apellidos<input [(ngModel)]="entrenadorForm.apellidos" name="eapellidos" required></label></div>
              <div class="form-row"><label>Correo<input type="email" [(ngModel)]="entrenadorForm.correo" name="ecorreo"></label><label>Teléfono<input [(ngModel)]="entrenadorForm.telefono" name="etelefono"></label></div>
              <div class="form-row"><label>Fecha contratación<input type="date" [(ngModel)]="entrenadorForm.fecha_contratacion" name="efecha" required></label><label>Salario<input type="number" min="0" [(ngModel)]="entrenadorForm.salario" name="esalario" required></label></div>
              <ng-container *ngIf="!entrenadorEditandoId">
                <label><input type="checkbox" [(ngModel)]="entrenadorForm.crear_acceso" name="eacceso"> Crear cuenta de acceso para el entrenador</label>
                <div class="form-row" *ngIf="entrenadorForm.crear_acceso"><label>Usuario<input [(ngModel)]="entrenadorForm.nombre_usuario" name="eusuario"></label><label>Contraseña<input type="password" minlength="8" [(ngModel)]="entrenadorForm.contrasena" name="eclave"></label></div>
              </ng-container>
              <div class="form-row"><button class="admin-primary" type="submit">{{entrenadorEditandoId ? 'Guardar cambios' : 'Crear entrenador'}}</button><button *ngIf="entrenadorEditandoId" class="admin-secondary" type="button" (click)="cancelarEdicionEntrenador()">Cancelar</button></div>
            </form>
          </article>
          <article class="admin-list-card wide-card">
            <div class="management-heading"><div><h2>Entrenadores</h2><p>{{entrenadores.length}} registrados.</p></div></div>
            <div class="table-wrap"><table class="management-table"><thead><tr><th>DNI</th><th>Entrenador</th><th>Especialidad</th><th>Clases</th><th>Rutinas</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
              <tr *ngFor="let e of entrenadores"><td>{{e.dni}}</td><td><b>{{nombreEntrenador(e)}}</b><br><small>{{e.correo}}</small></td><td>{{e.especialidad || '-'}}</td><td>{{e.clases_count || 0}}</td><td>{{e.rutinas_count || 0}}</td><td>{{e.estado}}</td><td><button class="table-action" type="button" (click)="editarEntrenador(e)">Editar</button> <button *ngIf="e.estado==='Activo'" class="table-danger" type="button" (click)="desactivarEntrenador(e.id_entrenador)">Desactivar</button></td></tr>
            </tbody></table></div>
          </article>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='clases'">
        <section class="management-grid">
          <article class="admin-form-card">
            <div class="management-heading"><div><h2>Programar clase</h2><p>La clase se guarda en MySQL.</p></div><span>◉</span></div>
            <form (ngSubmit)="crearClase()">
              <label>Nombre<input [(ngModel)]="claseForm.nombre" name="clnombre" required></label>
              <label>Descripción<input [(ngModel)]="claseForm.descripcion" name="cldescripcion"></label>
              <label>Entrenador<select [(ngModel)]="claseForm.id_entrenador" name="clentrenador"><option [ngValue]="null">Sin asignar</option><option *ngFor="let e of entrenadores" [ngValue]="e.id_entrenador">{{nombreEntrenador(e)}}</option></select></label>
              <div class="form-row"><label>Día<select [(ngModel)]="claseForm.dia_semana" name="cldia"><option *ngFor="let d of dias">{{d}}</option></select></label><label>Cupo máximo<input type="number" min="1" [(ngModel)]="claseForm.cupo_maximo" name="clcupo"></label></div>
              <div class="form-row"><label>Hora inicio<input type="time" [(ngModel)]="claseForm.hora_inicio" name="clinicio" required></label><label>Hora fin<input type="time" [(ngModel)]="claseForm.hora_fin" name="clfin" required></label></div>
              <button class="admin-primary" type="submit">Guardar clase</button>
            </form>
          </article>
          <article class="admin-list-card wide-card"><div class="management-heading"><div><h2>Clases</h2><p>{{clases.length}} clases desde la base de datos.</p></div></div><div class="table-wrap"><table class="management-table"><thead><tr><th>Clase</th><th>Entrenador</th><th>Día</th><th>Horario</th><th>Cupo</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
            <tr *ngFor="let c of clases"><td><b>{{c.nombre}}</b></td><td>{{nombreEntrenador(c.entrenador)}}</td><td>{{c.dia_semana}}</td><td>{{c.hora_inicio}} - {{c.hora_fin}}</td><td>{{c.cupo_maximo}}</td><td>{{c.estado}}</td><td><button class="table-danger" type="button" (click)="desactivarClase(c.id_clase)">Desactivar</button></td></tr>
          </tbody></table></div></article>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='asistencias'">
        <section class="management-grid">
          <article class="admin-form-card"><div class="management-heading"><div><h2>Control de asistencia</h2><p>Entrada y salida conectadas con MySQL.</p></div><span>▣</span></div><form><label>Cliente<select [(ngModel)]="asistenciaCliente" name="ascliente"><option [ngValue]="0">Seleccionar</option><option *ngFor="let c of clientes" [ngValue]="c.id_cliente">{{nombreCliente(c)}}</option></select></label><div class="form-row"><button class="admin-primary" type="button" (click)="registrarEntrada()">Registrar entrada</button><button class="admin-secondary" type="button" (click)="registrarSalida()">Registrar salida</button></div></form></article>
          <article class="admin-list-card wide-card"><div class="management-heading"><div><h2>Historial</h2><p>{{asistencias.length}} registros.</p></div></div><div class="table-wrap"><table class="management-table"><thead><tr><th>Cliente</th><th>Entrada</th><th>Salida</th><th>Estado</th></tr></thead><tbody><tr *ngFor="let a of asistencias"><td>{{nombreCliente(a.cliente)}}</td><td>{{fecha(a.fecha_hora_entrada)}}</td><td>{{fecha(a.fecha_hora_salida)}}</td><td>{{a.estado}}</td></tr></tbody></table></div></article>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='productos'">
        <div class="embedded-productos"><app-productos></app-productos></div>
      </ng-container>

      <ng-container *ngIf="seccion==='proveedores'">
        <section class="management-grid"><article class="admin-form-card"><div class="management-heading"><div><h2>Nuevo proveedor</h2><p>Registro directo en Laravel.</p></div><span>▤</span></div><form (ngSubmit)="crearProveedor()"><div class="form-row"><label>RUC<input [(ngModel)]="proveedorForm.ruc" name="pruc" required></label><label>Razón social<input [(ngModel)]="proveedorForm.razon_social" name="prazon" required></label></div><div class="form-row"><label>Contacto<input [(ngModel)]="proveedorForm.contacto" name="pcontacto"></label><label>Teléfono<input [(ngModel)]="proveedorForm.telefono" name="ptelefono"></label></div><label>Correo<input [(ngModel)]="proveedorForm.correo" name="pcorreo"></label><button class="admin-primary">Guardar proveedor</button></form></article><article class="admin-list-card wide-card"><div class="management-heading"><div><h2>Proveedores</h2><p>{{proveedores.length}} registrados.</p></div></div><div class="table-wrap"><table class="management-table"><thead><tr><th>RUC</th><th>Razón social</th><th>Contacto</th><th>Teléfono</th><th>Estado</th></tr></thead><tbody><tr *ngFor="let p of proveedores"><td>{{p.ruc}}</td><td><b>{{p.razon_social}}</b></td><td>{{p.contacto}}</td><td>{{p.telefono}}</td><td>{{p.estado}}</td></tr></tbody></table></div></article></section>
      </ng-container>

      <ng-container *ngIf="seccion==='compras'">
        <section class="management-grid">
          <article class="admin-form-card"><div class="management-heading"><div><h2>Registrar compra</h2><p>Agrega varios productos antes de confirmar.</p></div><span>↓</span></div>
            <form (ngSubmit)="registrarCompra()">
              <label>Proveedor<select [(ngModel)]="compraForm.id_proveedor" name="coprov"><option [ngValue]="0">Seleccionar</option><option *ngFor="let p of proveedores" [ngValue]="p.id_proveedor">{{p.razon_social}}</option></select></label>
              <div class="form-row"><label>Producto<select [(ngModel)]="compraForm.id_producto" name="coprod"><option [ngValue]="0">Seleccionar</option><option *ngFor="let p of productos" [ngValue]="p.id_producto">{{p.nombre_producto}}</option></select></label><label>Cantidad<input type="number" min="1" [(ngModel)]="compraForm.cantidad" name="cocantidad"></label></div>
              <div class="form-row"><label>Precio compra<input type="number" step="0.01" min="0.01" [(ngModel)]="compraForm.precio_compra" name="coprecio"></label><button class="admin-secondary" type="button" (click)="agregarItemCompra()">+ Agregar producto</button></div>
              <div class="table-wrap" *ngIf="compraItems.length"><table class="management-table"><thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th><th></th></tr></thead><tbody><tr *ngFor="let i of compraItems;let ix=index"><td>{{nombreProducto(i.id_producto)}}</td><td>{{i.cantidad}}</td><td>S/ {{i.precio_compra}}</td><td>S/ {{i.cantidad*i.precio_compra | number:'1.2-2'}}</td><td><button class="table-danger" type="button" (click)="quitarItemCompra(ix)">Quitar</button></td></tr></tbody></table></div>
              <div class="form-row"><label>Comprobante<select [(ngModel)]="compraForm.tipo_comprobante" name="cotipo"><option>Factura</option><option>Boleta</option></select></label><label>Número<input [(ngModel)]="compraForm.numero_comprobante" name="conumero" required></label></div>
              <button class="admin-primary">Registrar compra ({{compraItems.length}} productos)</button>
            </form>
          </article>
          <article class="admin-list-card wide-card"><div class="management-heading"><div><h2>Compras</h2><p>{{compras.length}} registros.</p></div></div><div class="table-wrap"><table class="management-table"><thead><tr><th>ID</th><th>Proveedor</th><th>Comprobante</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Acción</th></tr></thead><tbody><tr *ngFor="let c of compras"><td>{{c.id_compra}}</td><td>{{c.proveedor?.razon_social}}</td><td>{{c.tipo_comprobante}} {{c.numero_comprobante}}</td><td>{{fecha(c.fecha_compra)}}</td><td>S/ {{c.total | number:'1.2-2'}}</td><td>{{c.estado}}</td><td><button *ngIf="c.estado!=='Anulado'" class="table-danger" type="button" (click)="anularCompra(c.id_compra)">Anular</button></td></tr></tbody></table></div></article>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='ventas'">
        <section class="management-grid">
          <article class="admin-form-card"><div class="management-heading"><div><h2>Punto de venta</h2><p>Carrito con varios productos, IGV, stock y Kardex.</p></div><span>↑</span></div>
            <form (ngSubmit)="registrarVenta()">
              <label>Cliente<select [(ngModel)]="ventaForm.id_cliente" name="vcliente"><option [ngValue]="0">Seleccionar</option><option *ngFor="let c of clientes" [ngValue]="c.id_cliente">{{nombreCliente(c)}}</option></select></label>
              <div class="form-row"><label>Producto<select [(ngModel)]="ventaForm.id_producto" name="vproducto"><option [ngValue]="0">Seleccionar</option><option *ngFor="let p of productos" [ngValue]="p.id_producto">{{p.nombre_producto}} (Stock {{p.stock}})</option></select></label><label>Cantidad<input type="number" min="1" [(ngModel)]="ventaForm.cantidad" name="vcantidad"></label></div>
              <button class="admin-secondary" type="button" (click)="agregarItemVenta()">+ Agregar al carrito</button>
              <div class="table-wrap" *ngIf="ventaItems.length"><table class="management-table"><thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th><th></th></tr></thead><tbody><tr *ngFor="let i of ventaItems;let ix=index"><td>{{nombreProducto(i.id_producto)}}</td><td>{{i.cantidad}}</td><td>S/ {{precioProducto(i.id_producto) | number:'1.2-2'}}</td><td>S/ {{i.cantidad*precioProducto(i.id_producto) | number:'1.2-2'}}</td><td><button class="table-danger" type="button" (click)="quitarItemVenta(ix)">Quitar</button></td></tr></tbody></table></div>
              <div class="report-grid"><article><p>Subtotal sin IGV</p><h2>S/ {{subtotalVentaPreview | number:'1.2-2'}}</h2></article><article><p>IGV incluido {{ventaForm.igv_porcentaje}}%</p><h2>S/ {{igvVentaPreview | number:'1.2-2'}}</h2></article><article><p>Total a cobrar</p><h2>S/ {{totalVentaPreview | number:'1.2-2'}}</h2></article></div>
              <div class="form-row"><label>Comprobante<select [(ngModel)]="ventaForm.tipo_comprobante" name="vtipo"><option>Boleta</option><option>Factura</option></select></label><label>Número<input [(ngModel)]="ventaForm.numero_comprobante" name="vnumero" required></label></div>
              <div class="form-row"><label>Método<select [(ngModel)]="ventaForm.metodo_pago" name="vmetodo"><option>Efectivo</option><option>Yape</option><option>Plin</option><option>Transferencia</option><option>Tarjeta</option></select></label><label>N° operación<input [(ngModel)]="ventaForm.numero_operacion" name="voperacion"></label></div>
              <button class="admin-primary">Cobrar venta</button>
            </form>
          </article>
          <article class="admin-list-card wide-card"><div class="management-heading"><div><h2>Ventas</h2><p>{{ventas.length}} registros.</p></div></div><div class="table-wrap"><table class="management-table"><thead><tr><th>ID</th><th>Cliente</th><th>Comprobante</th><th>Fecha</th><th>Método</th><th>Total</th><th>Estado</th><th>Acción</th></tr></thead><tbody><tr *ngFor="let v of ventas"><td>{{v.id_venta}}</td><td>{{nombreCliente(v.cliente)}}</td><td>{{v.tipo_comprobante}} {{v.numero_comprobante}}</td><td>{{fecha(v.fecha_venta)}}</td><td>{{v.metodo_pago}}</td><td>S/ {{v.total | number:'1.2-2'}}</td><td>{{v.estado || 'Registrado'}}</td><td><button *ngIf="(v.estado||'Registrado')!=='Anulado'" class="table-danger" type="button" (click)="anularVenta(v.id_venta)">Anular</button></td></tr></tbody></table></div></article>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='kardex'">
        <section class="management-grid"><article class="admin-form-card"><div class="management-heading"><div><h2>Ajustar inventario</h2><p>Cada ajuste queda registrado en Kardex.</p></div><span>▥</span></div><form (ngSubmit)="ajustarStock()"><label>Producto<select [(ngModel)]="ajusteForm.id_producto" name="kid"><option [ngValue]="0">Seleccionar</option><option *ngFor="let p of productos" [ngValue]="p.id_producto">{{p.nombre_producto}}</option></select></label><div class="form-row"><label>Tipo<select [(ngModel)]="ajusteForm.tipo" name="ktipo"><option>Entrada</option><option>Salida</option></select></label><label>Cantidad<input type="number" min="1" [(ngModel)]="ajusteForm.cantidad" name="kcantidad"></label></div><label>Motivo<input [(ngModel)]="ajusteForm.motivo" name="kmotivo" required></label><button class="admin-primary">Registrar ajuste</button></form></article><article class="admin-list-card wide-card"><div class="management-heading"><div><h2>Kardex</h2><p>{{kardex.length}} movimientos.</p></div></div><div class="table-wrap"><table class="management-table"><thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Origen</th><th>Cantidad</th><th>Anterior</th><th>Nuevo</th></tr></thead><tbody><tr *ngFor="let k of kardex"><td>{{fecha(k.fecha_movimiento)}}</td><td>{{k.producto?.nombre_producto}}</td><td>{{k.tipo}}</td><td>{{k.origen}}</td><td>{{k.cantidad}}</td><td>{{k.stock_anterior}}</td><td>{{k.stock_nuevo}}</td></tr></tbody></table></div></article></section>
      </ng-container>

      <ng-container *ngIf="seccion==='caja'">
        <section class="management-grid">
          <article class="admin-form-card" *ngIf="!caja?.caja_abierta"><div class="management-heading"><div><h2>Abrir caja</h2><p>Necesaria para cobrar en efectivo.</p></div><span>$</span></div><form (ngSubmit)="abrirCaja()"><label>Monto inicial<input type="number" min="0" step="0.01" [(ngModel)]="cajaAbrirForm.monto_inicial" name="camonto"></label><label>Observación<input [(ngModel)]="cajaAbrirForm.observacion" name="caobs"></label><button class="admin-primary">Abrir caja</button></form></article>
          <article class="admin-form-card" *ngIf="caja?.caja_abierta"><div class="management-heading"><div><h2>Caja abierta</h2><p>Monto esperado: S/ {{caja?.resumen?.monto_esperado ?? 0 | number:'1.2-2'}}</p></div><span>$</span></div><form (ngSubmit)="movimientoCaja()"><div class="form-row"><label>Tipo<select [(ngModel)]="movCajaForm.tipo" name="mctipo"><option>Ingreso</option><option>Egreso</option></select></label><label>Monto<input type="number" min="0.01" step="0.01" [(ngModel)]="movCajaForm.monto" name="mcmonto"></label></div><label>Descripción<input [(ngModel)]="movCajaForm.descripcion" name="mcdesc" required></label><button class="admin-primary">Registrar movimiento</button></form><hr><form (ngSubmit)="cerrarCaja()"><label>Monto real contado<input type="number" min="0" step="0.01" [(ngModel)]="cajaCerrarForm.monto_real" name="ccmonto"></label><button class="admin-secondary">Cerrar caja</button></form></article>
          <article class="admin-list-card wide-card"><div class="management-heading"><div><h2>Historial de cajas</h2><p>{{historialCaja.length}} registros.</p></div></div><div class="table-wrap"><table class="management-table"><thead><tr><th>ID</th><th>Apertura</th><th>Cierre</th><th>Inicial</th><th>Esperado</th><th>Real</th><th>Estado</th></tr></thead><tbody><tr *ngFor="let c of historialCaja"><td>{{c.id_caja}}</td><td>{{fecha(c.fecha_apertura)}}</td><td>{{fecha(c.fecha_cierre)}}</td><td>S/ {{c.monto_inicial}}</td><td>S/ {{c.monto_esperado ?? '-'}}</td><td>S/ {{c.monto_real ?? '-'}}</td><td>{{c.estado}}</td></tr></tbody></table></div></article>
        </section>
      </ng-container>


      <ng-container *ngIf="seccion==='categorias'">
        <section class="management-grid">
          <article class="admin-form-card">
            <div class="management-heading"><div><h2>Nueva categoría</h2><p>Organiza los productos del gimnasio.</p></div><span>▦</span></div>
            <form (ngSubmit)="crearCategoria()">
              <label>Nombre<input [(ngModel)]="categoriaForm.nombre_categoria" name="catnombre" required></label>
              <label>Descripción<input [(ngModel)]="categoriaForm.descripcion" name="catdescripcion"></label>
              <label>Estado<select [(ngModel)]="categoriaForm.estado" name="catestado"><option>Activo</option><option>Inactivo</option></select></label>
              <button class="admin-primary" type="submit">Guardar categoría</button>
            </form>
          </article>
          <article class="admin-list-card wide-card">
            <div class="management-heading"><div><h2>Categorías</h2><p>{{categorias.length}} registradas.</p></div></div>
            <div class="table-wrap"><table class="management-table"><thead><tr><th>ID</th><th>Nombre</th><th>Descripción</th><th>Productos</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
              <tr *ngFor="let c of categorias"><td>{{c.id_categoria}}</td><td><b>{{c.nombre_categoria}}</b></td><td>{{c.descripcion || '-'}}</td><td>{{c.productos_count ?? 0}}</td><td>{{c.estado}}</td><td><button class="table-danger" type="button" (click)="desactivarCategoria(c.id_categoria)">Desactivar</button></td></tr>
              <tr *ngIf="!categorias.length"><td colspan="6">No hay categorías registradas.</td></tr>
            </tbody></table></div>
          </article>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='rutinas'">
        <section class="management-grid">
          <article class="admin-form-card">
            <div class="management-heading"><div><h2>Nueva rutina</h2><p>Asigna una rutina a un cliente y entrenador.</p></div><span>🏋</span></div>
            <form (ngSubmit)="crearRutina()">
              <label>Cliente<select [(ngModel)]="rutinaForm.id_cliente" name="rucliente" required><option [ngValue]="0">Seleccionar</option><option *ngFor="let c of clientes" [ngValue]="c.id_cliente">{{nombreCliente(c)}}</option></select></label>
              <label>Entrenador<select [(ngModel)]="rutinaForm.id_entrenador" name="ruentrenador" required><option [ngValue]="0">Seleccionar</option><option *ngFor="let e of entrenadores" [ngValue]="e.id_entrenador">{{nombreEntrenador(e)}}</option></select></label>
              <label>Nombre<input [(ngModel)]="rutinaForm.nombre_rutina" name="runombre" required></label>
              <label>Objetivo<input [(ngModel)]="rutinaForm.objetivo" name="ruobjetivo"></label>
              <label>Descripción<input [(ngModel)]="rutinaForm.descripcion" name="rudescripcion"></label>
              <div class="form-row"><label>Inicio<input type="date" [(ngModel)]="rutinaForm.fecha_inicio" name="ruinicio" required></label><label>Fin<input type="date" [(ngModel)]="rutinaForm.fecha_fin" name="rufin"></label></div>
              <button class="admin-primary" type="submit">Guardar rutina</button>
            </form>
          </article>
          <article class="admin-list-card wide-card">
            <div class="management-heading"><div><h2>Rutinas</h2><p>{{rutinas.length}} registradas.</p></div></div>
            <div class="table-wrap"><table class="management-table"><thead><tr><th>ID</th><th>Cliente</th><th>Entrenador</th><th>Rutina</th><th>Objetivo</th><th>Periodo</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
              <tr *ngFor="let r of rutinas"><td>{{r.id_rutina}}</td><td>{{nombreCliente(r.cliente)}}</td><td>{{nombreEntrenador(r.entrenador)}}</td><td><b>{{r.nombre_rutina}}</b></td><td>{{r.objetivo || '-'}}</td><td>{{r.fecha_inicio}} - {{r.fecha_fin || 'Sin fin'}}</td><td>{{r.estado}}</td><td><button class="table-danger" type="button" (click)="desactivarRutina(r.id_rutina)">Desactivar</button></td></tr>
              <tr *ngIf="!rutinas.length"><td colspan="8">No hay rutinas registradas.</td></tr>
            </tbody></table></div>
          </article>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='reservas'">
        <section class="admin-list-card">
          <div class="management-heading"><div><h2>Reservas de clases</h2><p>Controla asistencia, ausencias y cancelaciones.</p></div><span class="big-number">{{reservas.length}}</span></div>
          <div class="table-wrap"><table class="management-table"><thead><tr><th>ID</th><th>Cliente</th><th>Clase</th><th>Fecha</th><th>Entrenador</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
            <tr *ngFor="let r of reservas"><td>{{r.id_reserva}}</td><td>{{nombreCliente(r.cliente)}}</td><td>{{r.clase?.nombre}}</td><td>{{r.fecha_clase}}</td><td>{{nombreEntrenador(r.clase?.entrenador)}}</td><td>{{r.estado}}</td><td><button class="table-action" type="button" (click)="cambiarEstadoReserva(r.id_reserva,'Asistio')">Asistió</button> <button class="admin-secondary" type="button" (click)="cambiarEstadoReserva(r.id_reserva,'NoAsistio')">No asistió</button> <button class="table-danger" type="button" (click)="cambiarEstadoReserva(r.id_reserva,'Cancelada')">Cancelar</button></td></tr>
            <tr *ngIf="!reservas.length"><td colspan="7">No hay reservas registradas.</td></tr>
          </tbody></table></div>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='usuarios'">
        <section class="management-grid">
          <article class="admin-form-card">
            <div class="management-heading"><div><h2>Nuevo usuario interno</h2><p>Crea cuentas para administración o entrenadores.</p></div><span>♙</span></div>
            <form (ngSubmit)="crearUsuario()">
              <div class="form-row"><label>Usuario<input [(ngModel)]="usuarioForm.nombre_usuario" name="usunombre" required></label><label>Rol<select [(ngModel)]="usuarioForm.rol" name="usurol"><option>Administrador</option><option>Entrenador</option></select></label></div>
              <div class="form-row"><label>Nombres<input [(ngModel)]="usuarioForm.nombres" name="usunombres" required></label><label>Apellidos<input [(ngModel)]="usuarioForm.apellidos" name="usuapellidos" required></label></div>
              <div class="form-row"><label>DNI<input [(ngModel)]="usuarioForm.dni" name="usudni" required></label><label>Teléfono<input [(ngModel)]="usuarioForm.telefono" name="usutelefono"></label></div>
              <label>Correo<input type="email" [(ngModel)]="usuarioForm.correo" name="usucorreo" required></label>
              <label>Contraseña<input type="password" minlength="8" [(ngModel)]="usuarioForm.contrasena" name="usuclave" required></label>
              <button class="admin-primary" type="submit">Crear usuario</button>
            </form>
          </article>
          <article class="admin-list-card wide-card">
            <div class="management-heading"><div><h2>Usuarios</h2><p>{{usuarios.length}} cuentas registradas.</p></div></div>
            <div class="table-wrap"><table class="management-table"><thead><tr><th>ID</th><th>Usuario</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
              <tr *ngFor="let u of usuarios"><td>{{u.id_usuario}}</td><td>{{u.nombre_usuario}}</td><td>{{u.nombres}} {{u.apellidos}}</td><td>{{u.correo}}</td><td>{{u.rol}}</td><td>{{u.estado}}</td><td><button class="table-danger" type="button" (click)="desactivarUsuario(u.id_usuario)">Desactivar</button></td></tr>
              <tr *ngIf="!usuarios.length"><td colspan="7">No hay usuarios registrados.</td></tr>
            </tbody></table></div>
          </article>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='auditoria'">
        <section class="admin-list-card">
          <div class="management-heading"><div><h2>Auditoría del sistema</h2><p>Consulta las acciones registradas por Laravel.</p></div><button class="admin-secondary" type="button" (click)="exportarAuditoria()">Exportar CSV</button></div>
          <div class="form-row">
            <label>Ruta<input [(ngModel)]="auditoriaFiltros.ruta" name="auruta" placeholder="/api/ventas"></label>
            <label>Desde<input type="date" [(ngModel)]="auditoriaFiltros.desde" name="audesde"></label>
            <label>Hasta<input type="date" [(ngModel)]="auditoriaFiltros.hasta" name="auhasta"></label>
            <button class="admin-primary" type="button" (click)="cargarAuditoria()">Filtrar</button>
          </div>
          <div class="table-wrap"><table class="management-table"><thead><tr><th>Fecha</th><th>Usuario</th><th>Rol</th><th>Método</th><th>Ruta</th><th>IP</th><th>Estado HTTP</th></tr></thead><tbody>
            <tr *ngFor="let a of auditorias"><td>{{fecha(a.fecha)}}</td><td>{{a.usuario || a.id_usuario || '-'}}</td><td>{{a.rol || '-'}}</td><td>{{a.metodo}}</td><td>{{a.ruta}}</td><td>{{a.ip || '-'}}</td><td>{{a.status ?? '-'}}</td></tr>
            <tr *ngIf="!auditorias.length"><td colspan="7">No hay registros para el filtro seleccionado.</td></tr>
          </tbody></table></div>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='reportes'">
        <section class="report-grid"><article><span>👥</span><p>Clientes registrados</p><h2>{{dashboard?.clientes?.total ?? clientes.length}}</h2></article><article><span>✦</span><p>Membresías activas</p><h2>{{dashboard?.membresias?.activas ?? 0}}</h2></article><article><span>💵</span><p>Ingresos del mes</p><h2>S/ {{reporteIngresos?.total_ingresos ?? dashboard?.ingresos?.total_mes ?? 0 | number:'1.2-2'}}</h2></article><article><span>▣</span><p>Asistencias del periodo</p><h2>{{reporteAsistencias?.total ?? 0}}</h2></article></section>
        <article class="report-panel"><div class="management-heading"><div><h2>Datos reales para reportes</h2><p>Información calculada por Laravel desde MySQL.</p></div><button class="admin-secondary" type="button" (click)="cargarReportes()">Actualizar reporte</button></div><div class="table-wrap"><table class="management-table"><tbody><tr><th>Membresías</th><td>S/ {{reporteIngresos?.membresias ?? 0 | number:'1.2-2'}}</td></tr><tr><th>Ventas productos</th><td>S/ {{reporteIngresos?.ventas_productos ?? 0 | number:'1.2-2'}}</td></tr><tr><th>Total ingresos</th><td>S/ {{reporteIngresos?.total_ingresos ?? 0 | number:'1.2-2'}}</td></tr></tbody></table></div></article>
      </ng-container>

      <ng-container *ngIf="seccion==='configuracion'">
        <section class="settings-grid"><article class="admin-form-card"><div class="management-heading"><div><h2>Mallqui Gym</h2><p>Estado de integración del sistema.</p></div><span>⚙</span></div><p><b>Frontend:</b> Angular</p><p><b>Backend:</b> Laravel API</p><p><b>Base de datos:</b> MySQL</p><p><b>Autenticación principal:</b> Sanctum</p><p><b>Módulo académico:</b> JWT</p><p><b>Conexión API:</b> /api mediante proxy</p></article><article class="settings-preview"><img src="assets/mallqui-logo.png"><h2>Mallqui Gym</h2><div class="security-note"><b>Datos reales</b><p>Clientes, membresías, pagos, entrenador, clases, asistencias, productos, proveedores, compras, ventas, Kardex y caja trabajan mediante la API Laravel.</p></div></article></section>
      </ng-container>
    </main>
  </div>
  `,
  styles: [`
    .embedded-productos .productos-topbar .sesion-productos{display:none!important}
    .embedded-productos .productos-page{padding:0!important;background:transparent!important;min-height:auto!important}
    .admin-logout{width:calc(100% - 28px);margin:14px;background:none;border:0;text-align:left;cursor:pointer}
  `]
})
export class AdminIntegradoComponent implements OnInit {
  @Input() seccionInicial = 'dashboard';
  seccion = 'dashboard';
  toast = '';
  error = '';
  dashboard: any = null;
  reporteIngresos: any = null;
  reporteAsistencias: any = null;

  clientes: any[] = [];
  membresiasDisponibles: any[] = [];
  planesMembresia: any[] = [];
  membresiasCliente: any[] = [];
  pagos: any[] = [];
  pagosPendientes: any[] = [];
  entrenadores: any[] = [];
  clases: any[] = [];
  asistencias: any[] = [];
  categorias: any[] = [];
  rutinas: any[] = [];
  reservas: any[] = [];
  usuarios: any[] = [];
  auditorias: any[] = [];
  productos: any[] = [];
  proveedores: any[] = [];
  compras: any[] = [];
  ventas: any[] = [];
  kardex: any[] = [];
  caja: any = null;
  historialCaja: any[] = [];

  dias = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  menu = [
    {id:'dashboard',icono:'▦',nombre:'Dashboard'},
    {id:'clientes',icono:'♙',nombre:'Clientes'},
    {id:'membresias',icono:'✦',nombre:'Membresías'},
    {id:'pagos',icono:'▤',nombre:'Pagos'},
    {id:'entrenador',icono:'🏋',nombre:'Entrenador'},
    {id:'clases',icono:'◉',nombre:'Clases'},
    {id:'asistencias',icono:'▣',nombre:'Asistencias'},
    {id:'rutinas',icono:'🏋',nombre:'Rutinas'},
    {id:'reservas',icono:'◷',nombre:'Reservas'},
    {id:'categorias',icono:'▦',nombre:'Categorías'},
    {id:'productos',icono:'□',nombre:'Productos'},
    {id:'proveedores',icono:'▤',nombre:'Proveedores'},
    {id:'compras',icono:'↓',nombre:'Compras'},
    {id:'ventas',icono:'↑',nombre:'Ventas'},
    {id:'kardex',icono:'▥',nombre:'Kardex'},
    {id:'caja',icono:'$',nombre:'Caja'},
    {id:'reportes',icono:'▥',nombre:'Reportes'},
    {id:'usuarios',icono:'♙',nombre:'Usuarios'},
    {id:'auditoria',icono:'⌕',nombre:'Auditoría'},
    {id:'configuracion',icono:'⚙',nombre:'Configuración'}
  ];
  titulos: Record<string,[string,string]> = {
    dashboard:['Panel Administrador','Datos reales del gimnasio'], clientes:['Clientes','Registro y administración de miembros'],
    membresias:['Membresías','Planes, vigencias y contratación'], pagos:['Pagos','Confirmación e historial de pagos'],
    entrenador:['Entrenador','Gestión del entrenador principal'], clases:['Clases','Programación, horarios y cupos'],
    asistencias:['Asistencias','Control de entradas y salidas'], rutinas:['Rutinas','Planes de entrenamiento por cliente'],
    reservas:['Reservas','Control de reservas y asistencia a clases'], categorias:['Categorías','Clasificación de productos'],
    productos:['Productos','CRUD de productos conectado a Laravel'], proveedores:['Proveedores','Proveedores de productos'],
    compras:['Compras','Ingreso de productos e inventario'], ventas:['Ventas','Ventas de productos y stock'],
    kardex:['Kardex','Movimientos del inventario'], caja:['Caja','Apertura, movimientos y cierre'],
    reportes:['Reportes','Indicadores calculados desde MySQL'], usuarios:['Usuarios','Cuentas internas y permisos'],
    auditoria:['Auditoría','Trazabilidad de acciones del sistema'], configuracion:['Configuración','Estado técnico del sistema']
  };

  sidebarCerrado = false;

  clienteForm: any = {dni:'',nombres:'',apellidos:'',telefono:'',correo:'',direccion:'',estado:'Activo'};
  membresiaForm: any = {id_cliente:0,id_membresia:0,metodo_pago:'Efectivo',numero_operacion:''};
  entrenadorEditandoId = 0;
  entrenadorForm: any = {dni:'',nombres:'',apellidos:'',telefono:'',correo:'',especialidad:'',fecha_contratacion:new Date().toISOString().slice(0,10),salario:0,estado:'Activo',crear_acceso:true,nombre_usuario:'',contrasena:''};
  claseForm: any = {id_entrenador:null,nombre:'',descripcion:'',dia_semana:'Lunes',hora_inicio:'08:00',hora_fin:'09:00',cupo_maximo:15,estado:'Activo'};
  asistenciaCliente = 0;
  categoriaForm: any = {nombre_categoria:'',descripcion:'',estado:'Activo'};
  rutinaForm: any = {id_cliente:0,id_entrenador:0,nombre_rutina:'',objetivo:'',descripcion:'',fecha_inicio:new Date().toISOString().slice(0,10),fecha_fin:'',estado:'Activo'};
  usuarioForm: any = {nombre_usuario:'',contrasena:'',nombres:'',apellidos:'',dni:'',telefono:'',correo:'',rol:'Entrenador',estado:'Activo'};
  auditoriaFiltros: any = {ruta:'',desde:'',hasta:''};
  proveedorForm: any = {ruc:'',razon_social:'',contacto:'',telefono:'',correo:'',direccion:'',estado:'Activo'};
  compraForm: any = {id_proveedor:0,id_producto:0,cantidad:1,precio_compra:0,tipo_comprobante:'Factura',numero_comprobante:''};
  compraItems: any[] = [];
  ventaForm: any = {id_cliente:0,id_producto:0,cantidad:1,tipo_comprobante:'Boleta',numero_comprobante:'',metodo_pago:'Efectivo',numero_operacion:'',igv_porcentaje:18};
  ventaItems: any[] = [];
  planEditandoId = 0;
  planForm: any = {nombre:'',duracion_meses:1,precio:0,descripcion:'',estado:'Activo'};
  ajusteForm: any = {id_producto:0,tipo:'Entrada',cantidad:1,motivo:''};
  cajaAbrirForm: any = {monto_inicial:0,observacion:''};
  movCajaForm: any = {tipo:'Ingreso',monto:0,descripcion:'',origen:'Manual'};
  cajaCerrarForm: any = {monto_real:0,observacion:''};

  constructor(public auth: AuthService, private api: AdminApiService, private router: Router) {}

  ngOnInit(): void {
    this.seccion = this.seccionInicial || 'dashboard';
    this.sidebarCerrado = localStorage.getItem('mallqui_admin_sidebar_closed') === '1';
    this.recargarTodo();
  }

  toggleSidebar(): void {
    this.sidebarCerrado = !this.sidebarCerrado;
    localStorage.setItem('mallqui_admin_sidebar_closed', this.sidebarCerrado ? '1' : '0');
  }

  get tituloActual(): string { return this.titulos[this.seccion]?.[0] ?? 'Administrador'; }
  get subtituloActual(): string { return this.titulos[this.seccion]?.[1] ?? ''; }

  cambiarSeccion(id: string): void {
    this.seccion = id;
    this.error = '';
    if (id === 'reportes') this.cargarReportes();
    if (id === 'auditoria') this.cargarAuditoria();
    window.scrollTo({top:0, behavior:'smooth'});
  }

  recargarTodo(): void {
    this.cargarDashboard(); this.cargarClientes(); this.cargarMembresias(); this.cargarPagos();
    this.cargarEntrenadores(); this.cargarClases(); this.cargarAsistencias(); this.cargarCategorias();
    this.cargarRutinas(); this.cargarReservas(); this.cargarUsuarios(); this.cargarAuditoria(); this.cargarProductos();
    this.cargarProveedores(); this.cargarCompras(); this.cargarVentas(); this.cargarKardex(); this.cargarCaja(); this.cargarReportes();
  }

  cargarDashboard(){ this.api.dashboard().subscribe({next:r=>this.dashboard=r,error:e=>this.mostrarError(e)}); }
  cargarClientes(){ this.api.clientes().subscribe({next:r=>this.clientes=r,error:e=>this.mostrarError(e)}); }
  cargarMembresias(){
    this.api.membresiasDisponibles().subscribe({next:r=>{this.planesMembresia=r;this.membresiasDisponibles=r.filter(x=>x.estado==='Activo');},error:e=>this.mostrarError(e)});
    this.api.clienteMembresias().subscribe({next:r=>this.membresiasCliente=r,error:e=>this.mostrarError(e)});
  }
  cargarPagos(){
    this.api.pagos().subscribe({next:r=>this.pagos=r,error:e=>this.mostrarError(e)});
    this.api.pagosPendientes().subscribe({next:r=>this.pagosPendientes=r,error:e=>this.mostrarError(e)});
  }
  cargarEntrenadores(){ this.api.entrenadores().subscribe({next:r=>this.entrenadores=r,error:e=>this.mostrarError(e)}); }
  cargarClases(){ this.api.clases().subscribe({next:r=>this.clases=r,error:e=>this.mostrarError(e)}); }
  cargarAsistencias(){ this.api.asistencias().subscribe({next:r=>this.asistencias=r,error:e=>this.mostrarError(e)}); }
  cargarCategorias(){ this.api.categorias().subscribe({next:r=>this.categorias=r,error:e=>this.mostrarError(e)}); }
  cargarRutinas(){ this.api.rutinas().subscribe({next:r=>this.rutinas=r,error:e=>this.mostrarError(e)}); }
  cargarReservas(){ this.api.reservas().subscribe({next:r=>this.reservas=r,error:e=>this.mostrarError(e)}); }
  cargarUsuarios(){ this.api.usuarios().subscribe({next:r=>this.usuarios=r,error:e=>this.mostrarError(e)}); }
  cargarAuditoria(){ const f:any={}; if(this.auditoriaFiltros.ruta)f.ruta=this.auditoriaFiltros.ruta; if(this.auditoriaFiltros.desde)f.desde=this.auditoriaFiltros.desde; if(this.auditoriaFiltros.hasta)f.hasta=this.auditoriaFiltros.hasta; this.api.auditorias(f).subscribe({next:r=>this.auditorias=r,error:e=>this.mostrarError(e)}); }
  cargarProductos(){ this.api.productos().subscribe({next:r=>this.productos=r,error:e=>this.mostrarError(e)}); }
  cargarProveedores(){ this.api.proveedores().subscribe({next:r=>this.proveedores=r,error:e=>this.mostrarError(e)}); }
  cargarCompras(){ this.api.compras().subscribe({next:r=>this.compras=r,error:e=>this.mostrarError(e)}); }
  cargarVentas(){ this.api.ventas().subscribe({next:r=>this.ventas=r,error:e=>this.mostrarError(e)}); }
  cargarKardex(){ this.api.kardex().subscribe({next:r=>this.kardex=r,error:e=>this.mostrarError(e)}); }
  cargarCaja(){
    this.api.cajaActual().subscribe({next:r=>this.caja=r,error:e=>this.mostrarError(e)});
    this.api.historialCaja().subscribe({next:r=>this.historialCaja=r,error:e=>this.mostrarError(e)});
  }
  cargarReportes(){
    this.api.reporteIngresos().subscribe({next:r=>this.reporteIngresos=r,error:e=>this.mostrarError(e)});
    this.api.reporteAsistencias().subscribe({next:r=>this.reporteAsistencias=r,error:e=>this.mostrarError(e)});
  }

  crearCliente(){
    this.api.crearCliente(this.clienteForm).subscribe({next:()=>{this.ok('Cliente registrado en MySQL'); this.clienteForm={dni:'',nombres:'',apellidos:'',telefono:'',correo:'',direccion:'',estado:'Activo'}; this.cargarClientes(); this.cargarDashboard();},error:e=>this.mostrarError(e)});
  }
  desactivarCliente(id:number){ if(!confirm('¿Desactivar este cliente?')) return; this.api.desactivarCliente(id).subscribe({next:()=>{this.ok('Cliente desactivado');this.cargarClientes();this.cargarDashboard();},error:e=>this.mostrarError(e)}); }

  contratarMembresia(){
    if(!this.membresiaForm.id_cliente || !this.membresiaForm.id_membresia){this.error='Selecciona cliente y membresía.';return;}
    const datos={...this.membresiaForm};
    if(datos.metodo_pago==='Efectivo') datos.numero_operacion=null;
    this.api.contratarMembresia(datos).subscribe({next:()=>{this.ok('Membresía contratada y pago registrado');this.cargarMembresias();this.cargarPagos();this.cargarDashboard();this.cargarCaja();},error:e=>this.mostrarError(e)});
  }

  guardarPlan(){const datos={...this.planForm};const req=this.planEditandoId?this.api.actualizarMembresia(this.planEditandoId,datos):this.api.crearMembresia(datos);req.subscribe({next:()=>{this.ok(this.planEditandoId?'Plan actualizado':'Plan creado');this.cancelarEdicionPlan();this.cargarMembresias();},error:e=>this.mostrarError(e)});}
  editarPlan(p:any){this.planEditandoId=p.id_membresia;this.planForm={nombre:p.nombre,duracion_meses:p.duracion_meses,precio:p.precio,descripcion:p.descripcion||'',estado:p.estado};}
  cancelarEdicionPlan(){this.planEditandoId=0;this.planForm={nombre:'',duracion_meses:1,precio:0,descripcion:'',estado:'Activo'};}
  desactivarPlan(id:number){if(!confirm('¿Desactivar este plan?'))return;this.api.eliminarMembresia(id).subscribe({next:r=>{this.ok(r.mensaje||'Plan desactivado');this.cargarMembresias();},error:e=>this.mostrarError(e)});}

  confirmarPago(id:number){ this.api.confirmarPago(id).subscribe({next:()=>{this.ok('Pago confirmado y membresía activada');this.cargarPagos();this.cargarMembresias();this.cargarDashboard();},error:e=>this.mostrarError(e)}); }
  rechazarPago(id:number){ const motivo=prompt('Motivo del rechazo:'); if(!motivo?.trim()) return; this.api.rechazarPago(id,motivo).subscribe({next:()=>{this.ok('Pago rechazado');this.cargarPagos();this.cargarMembresias();},error:e=>this.mostrarError(e)}); }

  guardarEntrenador(){
    const datos={...this.entrenadorForm};
    if(this.entrenadorEditandoId){delete datos.crear_acceso;delete datos.nombre_usuario;delete datos.contrasena;}
    const req=this.entrenadorEditandoId?this.api.actualizarEntrenador(this.entrenadorEditandoId,datos):this.api.crearEntrenador(datos);
    req.subscribe({next:r=>{this.ok(r.mensaje||'Entrenador guardado');this.cancelarEdicionEntrenador();this.cargarEntrenadores();this.cargarUsuarios();},error:e=>this.mostrarError(e)});
  }
  editarEntrenador(e:any){this.entrenadorEditandoId=e.id_entrenador;this.entrenadorForm={...e,crear_acceso:false,nombre_usuario:'',contrasena:''};}
  cancelarEdicionEntrenador(){this.entrenadorEditandoId=0;this.entrenadorForm={dni:'',nombres:'',apellidos:'',telefono:'',correo:'',especialidad:'',fecha_contratacion:new Date().toISOString().slice(0,10),salario:0,estado:'Activo',crear_acceso:true,nombre_usuario:'',contrasena:''};}
  desactivarEntrenador(id:number){if(!confirm('¿Desactivar este entrenador y su acceso?'))return;this.api.eliminarEntrenador(id).subscribe({next:r=>{this.ok(r.mensaje||'Entrenador desactivado');this.cargarEntrenadores();this.cargarUsuarios();},error:e=>this.mostrarError(e)});}

  crearClase(){ this.api.crearClase(this.claseForm).subscribe({next:()=>{this.ok('Clase registrada');this.claseForm={id_entrenador:this.entrenadores[0]?.id_entrenador??null,nombre:'',descripcion:'',dia_semana:'Lunes',hora_inicio:'08:00',hora_fin:'09:00',cupo_maximo:15,estado:'Activo'};this.cargarClases();},error:e=>this.mostrarError(e)}); }
  desactivarClase(id:number){ if(!confirm('¿Desactivar esta clase?')) return; this.api.desactivarClase(id).subscribe({next:()=>{this.ok('Clase desactivada');this.cargarClases();},error:e=>this.mostrarError(e)}); }

  registrarEntrada(){ if(!this.asistenciaCliente){this.error='Selecciona un cliente.';return;} this.api.registrarEntrada(this.asistenciaCliente).subscribe({next:r=>{this.ok(r.mensaje||'Entrada registrada');this.cargarAsistencias();this.cargarDashboard();},error:e=>this.mostrarError(e)}); }
  registrarSalida(){ if(!this.asistenciaCliente){this.error='Selecciona un cliente.';return;} this.api.registrarSalida(this.asistenciaCliente).subscribe({next:r=>{this.ok(r.mensaje||'Salida registrada');this.cargarAsistencias();this.cargarDashboard();},error:e=>this.mostrarError(e)}); }

  crearProveedor(){ this.api.crearProveedor(this.proveedorForm).subscribe({next:()=>{this.ok('Proveedor registrado');this.proveedorForm={ruc:'',razon_social:'',contacto:'',telefono:'',correo:'',direccion:'',estado:'Activo'};this.cargarProveedores();},error:e=>this.mostrarError(e)}); }

  agregarItemCompra(){ if(!this.compraForm.id_producto || Number(this.compraForm.cantidad)<1 || Number(this.compraForm.precio_compra)<=0){this.error='Selecciona producto, cantidad y precio de compra.';return;} if(this.compraItems.some(i=>i.id_producto===this.compraForm.id_producto)){this.error='Ese producto ya está en la compra.';return;} this.compraItems.push({id_producto:this.compraForm.id_producto,cantidad:Number(this.compraForm.cantidad),precio_compra:Number(this.compraForm.precio_compra)});this.compraForm.id_producto=0;this.compraForm.cantidad=1;this.compraForm.precio_compra=0; }
  quitarItemCompra(i:number){this.compraItems.splice(i,1);}
  registrarCompra(){
    if(!this.compraForm.id_proveedor || !this.compraItems.length){this.error='Selecciona proveedor y agrega al menos un producto.';return;}
    const datos={id_proveedor:this.compraForm.id_proveedor,tipo_comprobante:this.compraForm.tipo_comprobante,numero_comprobante:this.compraForm.numero_comprobante,items:this.compraItems};
    this.api.registrarCompra(datos).subscribe({next:r=>{this.ok(r.mensaje||'Compra registrada');this.compraForm={id_proveedor:0,id_producto:0,cantidad:1,precio_compra:0,tipo_comprobante:'Factura',numero_comprobante:''};this.compraItems=[];this.cargarCompras();this.cargarProductos();this.cargarKardex();this.cargarDashboard();},error:e=>this.mostrarError(e)});
  }
  anularCompra(id:number){ if(!confirm('¿Anular esta compra?')) return; this.api.anularCompra(id).subscribe({next:r=>{this.ok(r.mensaje||'Compra anulada');this.cargarCompras();this.cargarProductos();this.cargarKardex();},error:e=>this.mostrarError(e)}); }

  agregarItemVenta(){ if(!this.ventaForm.id_producto || Number(this.ventaForm.cantidad)<1){this.error='Selecciona producto y cantidad.';return;} const p=this.productos.find(x=>x.id_producto===this.ventaForm.id_producto); if(!p || Number(p.stock)<Number(this.ventaForm.cantidad)){this.error='Stock insuficiente para agregar ese producto.';return;} if(this.ventaItems.some(i=>i.id_producto===this.ventaForm.id_producto)){this.error='Ese producto ya está en el carrito.';return;} this.ventaItems.push({id_producto:this.ventaForm.id_producto,cantidad:Number(this.ventaForm.cantidad)});this.ventaForm.id_producto=0;this.ventaForm.cantidad=1; }
  quitarItemVenta(i:number){this.ventaItems.splice(i,1);}
  get totalVentaPreview():number{return this.ventaItems.reduce((s,i)=>s+(Number(i.cantidad)*this.precioProducto(i.id_producto)),0);}
  get subtotalVentaPreview():number{const f=1+(Number(this.ventaForm.igv_porcentaje||0)/100);return f>0?this.totalVentaPreview/f:this.totalVentaPreview;}
  get igvVentaPreview():number{return this.totalVentaPreview-this.subtotalVentaPreview;}
  registrarVenta(){
    if(!this.ventaForm.id_cliente || !this.ventaItems.length){this.error='Selecciona cliente y agrega productos al carrito.';return;}
    const datos={id_cliente:this.ventaForm.id_cliente,tipo_comprobante:this.ventaForm.tipo_comprobante,numero_comprobante:this.ventaForm.numero_comprobante,metodo_pago:this.ventaForm.metodo_pago,numero_operacion:this.ventaForm.metodo_pago==='Efectivo'?null:this.ventaForm.numero_operacion,igv_porcentaje:this.ventaForm.igv_porcentaje,items:this.ventaItems};
    this.api.registrarVenta(datos).subscribe({next:r=>{this.ok(r.mensaje||'Venta registrada');this.ventaForm={id_cliente:0,id_producto:0,cantidad:1,tipo_comprobante:'Boleta',numero_comprobante:'',metodo_pago:'Efectivo',numero_operacion:'',igv_porcentaje:18};this.ventaItems=[];this.cargarVentas();this.cargarProductos();this.cargarKardex();this.cargarCaja();this.cargarDashboard();},error:e=>this.mostrarError(e)});
  }
  anularVenta(id:number){const motivo=prompt('Motivo de la anulación (mínimo 5 caracteres):');if(!motivo||motivo.trim().length<5)return;this.api.anularVenta(id,motivo.trim()).subscribe({next:r=>{this.ok(r.mensaje||'Venta anulada');this.cargarVentas();this.cargarProductos();this.cargarKardex();this.cargarCaja();this.cargarDashboard();},error:e=>this.mostrarError(e)});}
  nombreProducto(id:number):string{return this.productos.find(p=>p.id_producto===id)?.nombre_producto||'Producto';}
  precioProducto(id:number):number{return Number(this.productos.find(p=>p.id_producto===id)?.precio_venta||0);}

  crearCategoria(){ this.api.crearCategoria(this.categoriaForm).subscribe({next:()=>{this.ok('Categoría registrada');this.categoriaForm={nombre_categoria:'',descripcion:'',estado:'Activo'};this.cargarCategorias();},error:e=>this.mostrarError(e)}); }
  desactivarCategoria(id:number){ if(!confirm('¿Desactivar esta categoría?')) return; this.api.eliminarCategoria(id).subscribe({next:r=>{this.ok(r.mensaje||'Categoría desactivada');this.cargarCategorias();},error:e=>this.mostrarError(e)}); }

  crearRutina(){ if(!this.rutinaForm.id_cliente || !this.rutinaForm.id_entrenador){this.error='Selecciona cliente y entrenador.';return;} const datos={...this.rutinaForm}; if(!datos.fecha_fin) datos.fecha_fin=null; this.api.crearRutina(datos).subscribe({next:()=>{this.ok('Rutina registrada');this.rutinaForm={id_cliente:0,id_entrenador:0,nombre_rutina:'',objetivo:'',descripcion:'',fecha_inicio:new Date().toISOString().slice(0,10),fecha_fin:'',estado:'Activo'};this.cargarRutinas();},error:e=>this.mostrarError(e)}); }
  desactivarRutina(id:number){ if(!confirm('¿Desactivar esta rutina?')) return; this.api.eliminarRutina(id).subscribe({next:r=>{this.ok(r.mensaje||'Rutina desactivada');this.cargarRutinas();},error:e=>this.mostrarError(e)}); }

  cambiarEstadoReserva(id:number,estado:string){ this.api.cambiarEstadoReserva(id,estado).subscribe({next:r=>{this.ok(r.mensaje||'Reserva actualizada');this.cargarReservas();},error:e=>this.mostrarError(e)}); }

  crearUsuario(){ this.api.crearUsuario(this.usuarioForm).subscribe({next:()=>{this.ok('Usuario interno creado');this.usuarioForm={nombre_usuario:'',contrasena:'',nombres:'',apellidos:'',dni:'',telefono:'',correo:'',rol:'Entrenador',estado:'Activo'};this.cargarUsuarios();},error:e=>this.mostrarError(e)}); }
  desactivarUsuario(id:number){ if(!confirm('¿Desactivar este usuario?')) return; this.api.eliminarUsuario(id).subscribe({next:r=>{this.ok(r.mensaje||'Usuario desactivado');this.cargarUsuarios();},error:e=>this.mostrarError(e)}); }

  exportarAuditoria(){
    if(!this.auditorias.length){this.error='No hay registros de auditoría para exportar.';return;}
    const filas=[['Fecha','Usuario','Rol','Metodo','Ruta','IP','Estado'],...this.auditorias.map(a=>[a.fecha,a.usuario??a.id_usuario??'',a.rol??'',a.metodo,a.ruta,a.ip??'',a.status??''])];
    const csv=filas.map(f=>f.map((v:any)=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\n');
    const url=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a'); a.href=url; a.download='auditoria-mallqui-gym.csv'; a.click(); URL.revokeObjectURL(url);
  }

  ajustarStock(){ this.api.ajustarStock(this.ajusteForm).subscribe({next:r=>{this.ok(r.mensaje||'Stock ajustado');this.ajusteForm={id_producto:0,tipo:'Entrada',cantidad:1,motivo:''};this.cargarProductos();this.cargarKardex();this.cargarDashboard();},error:e=>this.mostrarError(e)}); }

  abrirCaja(){ this.api.abrirCaja(Number(this.cajaAbrirForm.monto_inicial),this.cajaAbrirForm.observacion).subscribe({next:r=>{this.ok(r.mensaje||'Caja abierta');this.cargarCaja();},error:e=>this.mostrarError(e)}); }
  movimientoCaja(){ this.api.movimientoCaja(this.movCajaForm.tipo,'Manual',this.movCajaForm.descripcion,Number(this.movCajaForm.monto)).subscribe({next:r=>{this.ok(r.mensaje||'Movimiento registrado');this.movCajaForm={tipo:'Ingreso',monto:0,descripcion:'',origen:'Manual'};this.cargarCaja();},error:e=>this.mostrarError(e)}); }
  cerrarCaja(){ if(!confirm('¿Cerrar la caja actual?')) return; this.api.cerrarCaja(Number(this.cajaCerrarForm.monto_real),this.cajaCerrarForm.observacion).subscribe({next:r=>{this.ok(r.mensaje||'Caja cerrada');this.cajaCerrarForm={monto_real:0,observacion:''};this.cargarCaja();},error:e=>this.mostrarError(e)}); }

  cerrarSesion(){ this.auth.logout().subscribe({next:()=>{this.auth.limpiarSesion();this.router.navigate(['/login']);},error:()=>{this.auth.limpiarSesion();this.router.navigate(['/login']);}}); }

  nombreCliente(c:any): string { return c ? `${c.nombres ?? ''} ${c.apellidos ?? ''}`.trim() : '-'; }
  nombreEntrenador(e:any): string { return e ? `${e.nombres ?? ''} ${e.apellidos ?? ''}`.trim() : '-'; }
  clientePago(p:any): string { return this.nombreCliente(p?.cliente_membresia?.cliente ?? p?.clienteMembresia?.cliente); }
  planPago(p:any): string { return p?.cliente_membresia?.membresia?.nombre ?? p?.clienteMembresia?.membresia?.nombre ?? '-'; }
  fecha(v:any): string { if(!v) return '-'; const d=new Date(v); return isNaN(d.getTime())?String(v):d.toLocaleString('es-PE'); }

  alturaIngreso(valor:any): number {
    const datos=this.dashboard?.tendencias?.ingresos_6_meses || [];
    const max=Math.max(...datos.map((x:any)=>Number(x.total)||0),1);
    const n=Number(valor)||0;
    return n<=0?0:Math.max(5,Math.min(100,(n/max)*100));
  }

  alturaAsistencia(valor:any): number {
    const datos=this.dashboard?.tendencias?.asistencias_7_dias || [];
    const max=Math.max(...datos.map((x:any)=>Number(x.total)||0),1);
    const n=Number(valor)||0;
    return n<=0?0:Math.max(6,Math.min(100,(n/max)*100));
  }

  porcentajePlan(valor:any): number {
    const total=Number(this.dashboard?.membresias?.activas||0);
    return total<=0?0:Math.min(100,(Number(valor)||0)*100/total);
  }

  get totalAsistenciasSemana(): number {
    return (this.dashboard?.tendencias?.asistencias_7_dias || []).reduce((s:number,d:any)=>s+(Number(d.total)||0),0);
  }

  ok(mensaje:string){ this.error=''; this.toast='✓ '+mensaje; setTimeout(()=>this.toast='',2600); }
  mostrarError(e:any){
    if(e?.status===401){this.auth.limpiarSesion();this.router.navigate(['/login']);return;}
    const errores=e?.error?.errors;
    if(errores){const primero=Object.values(errores)[0];this.error=Array.isArray(primero)?String(primero[0]):String(primero);return;}
    this.error=e?.error?.mensaje ?? e?.error?.message ?? e?.error?.error ?? 'No se pudo completar la operación.';
  }
}
