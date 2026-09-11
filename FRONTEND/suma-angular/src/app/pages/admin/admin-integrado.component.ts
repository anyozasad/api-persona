import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminApiService } from './admin-api.service';
import { AuthService } from './auth.service';
import { ProductosComponent } from './pages/productos/productos';

@Component({
  selector: 'app-admin-integrado',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductosComponent],
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
      <button type="button" class="admin-logout" (click)="cerrarSesion()">↪ Cerrar sesión</button>
    </aside>

    <main class="admin-content">
      <header class="admin-header">
        <div><h1>{{tituloActual}}</h1><p>{{subtituloActual}}</p></div>
        <button class="admin-secondary" type="button" (click)="recargarTodo()">↻ Actualizar datos</button>
        <div class="admin-profile-wrap">
          <button type="button" class="admin-profile">
            <span>♙</span>
            <p><strong>{{auth.usuario?.nombre_usuario || 'Administrador'}}</strong><small>{{auth.usuario?.correo || ''}}</small></p>
          </button>
        </div>
      </header>

      <div *ngIf="toast" class="admin-toast">{{toast}}</div>
      <div *ngIf="error" class="admin-toast">⚠ {{error}}</div>

      <ng-container *ngIf="seccion==='dashboard'">
        <section class="admin-kpis">
          <article><span class="kpi-icon red">♙</span><p>Total clientes</p><h2>{{dashboard?.clientes?.total ?? clientes.length}}</h2><small class="positive">{{dashboard?.clientes?.activos ?? 0}} activos</small></article>
          <article><span class="kpi-icon">✦</span><p>Membresías activas</p><h2>{{dashboard?.membresias?.activas ?? membresiasCliente.length}}</h2><small>{{dashboard?.membresias?.por_vencer_7_dias ?? 0}} por vencer</small></article>
          <article><span class="kpi-icon green">$</span><p>Ingresos del mes</p><h2>S/ {{dashboard?.ingresos?.total_mes ?? 0 | number:'1.2-2'}}</h2><small class="positive">Membresías + productos</small></article>
          <article><span class="kpi-icon">▣</span><p>Asistencias hoy</p><h2>{{dashboard?.asistencias?.hoy ?? 0}}</h2><small>{{dashboard?.asistencias?.dentro_ahora ?? 0}} dentro ahora</small></article>
          <article><span class="kpi-icon red">▤</span><p>Pagos pendientes</p><h2>{{pagosPendientes.length}}</h2><small>Requieren revisión</small></article>
          <article><span class="kpi-icon">□</span><p>Stock bajo</p><h2>{{dashboard?.inventario?.productos_stock_bajo ?? 0}}</h2><small>Productos por reponer</small></article>
        </section>

        <section class="admin-dashboard-grid">
          <article class="income-chart">
            <div class="card-heading"><h2>Ingresos reales del mes</h2><button type="button" (click)="cambiarSeccion('reportes')">Ver reporte</button></div>
            <div class="report-grid">
              <article><p>Membresías</p><h2>S/ {{dashboard?.ingresos?.membresias_mes ?? 0 | number:'1.2-2'}}</h2></article>
              <article><p>Ventas de productos</p><h2>S/ {{dashboard?.ingresos?.ventas_mes ?? 0 | number:'1.2-2'}}</h2></article>
              <article><p>Total</p><h2>S/ {{dashboard?.ingresos?.total_mes ?? 0 | number:'1.2-2'}}</h2></article>
            </div>
          </article>

          <article class="payments-table">
            <div class="card-heading"><h2>Pagos recientes</h2><button class="text-action" type="button" (click)="cambiarSeccion('pagos')">Ver todos →</button></div>
            <div class="table-wrap"><table><thead><tr><th>ID</th><th>Cliente</th><th>Plan</th><th>Monto</th><th>Método</th><th>Estado</th></tr></thead><tbody>
              <tr *ngFor="let p of pagos.slice(0,5)"><td>{{p.id_pago}}</td><td>{{clientePago(p)}}</td><td>{{planPago(p)}}</td><td>S/ {{p.monto | number:'1.2-2'}}</td><td>{{p.metodo_pago}}</td><td>{{p.estado_pago}}</td></tr>
            </tbody></table></div>
          </article>

          <article class="next-admin-classes">
            <div class="card-heading"><h2>Clases programadas</h2><button class="text-action" type="button" (click)="cambiarSeccion('clases')">Administrar →</button></div>
            <div *ngFor="let c of clases.slice(0,5)"><span class="class-symbol">◉</span><p><b>{{c.nombre}}</b><small>{{c.dia_semana}}</small></p><div><b>{{c.hora_inicio}}</b><small>{{nombreEntrenador(c.entrenador)}}</small></div><em>{{c.reservas_activas ?? 0}} reservas</em></div>
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
            <div class="management-heading"><div><h2>Contratar membresía</h2><p>Registra membresía y pago en la base de datos.</p></div><span>✦</span></div>
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
        <section class="trainer-layout">
          <article class="trainer-card" *ngIf="entrenadores[0] as e"><div class="trainer-photo"></div><div><span class="status-active">{{e.estado}}</span><h2>{{nombreEntrenador(e)}}</h2><p>{{e.especialidad}}</p><small>{{e.correo}} · {{e.telefono}}</small><div class="trainer-stats"><span><b>{{entrenadores.length}}</b><small>Entrenador</small></span><span><b>{{e.clases_count ?? clases.length}}</b><small>Clases</small></span></div></div></article>
          <article class="admin-form-card">
            <div class="management-heading"><div><h2>{{entrenadores.length ? 'Actualizar entrenador' : 'Registrar entrenador'}}</h2><p>Mallqui Gym trabaja con un entrenador principal.</p></div><span>🏋</span></div>
            <form (ngSubmit)="guardarEntrenador()">
              <div class="form-row"><label>DNI<input [(ngModel)]="entrenadorForm.dni" name="edni" required></label><label>Especialidad<input [(ngModel)]="entrenadorForm.especialidad" name="eespecialidad"></label></div>
              <div class="form-row"><label>Nombres<input [(ngModel)]="entrenadorForm.nombres" name="enombres" required></label><label>Apellidos<input [(ngModel)]="entrenadorForm.apellidos" name="eapellidos" required></label></div>
              <div class="form-row"><label>Correo<input [(ngModel)]="entrenadorForm.correo" name="ecorreo"></label><label>Teléfono<input [(ngModel)]="entrenadorForm.telefono" name="etelefono"></label></div>
              <div class="form-row"><label>Fecha contratación<input type="date" [(ngModel)]="entrenadorForm.fecha_contratacion" name="efecha" required></label><label>Salario<input type="number" min="0" [(ngModel)]="entrenadorForm.salario" name="esalario" required></label></div>
              <button class="admin-primary" type="submit">Guardar entrenador</button>
            </form>
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
        <section class="management-grid"><article class="admin-form-card"><div class="management-heading"><div><h2>Registrar compra</h2><p>La compra aumenta stock y genera Kardex.</p></div><span>↓</span></div><form (ngSubmit)="registrarCompra()"><label>Proveedor<select [(ngModel)]="compraForm.id_proveedor" name="coprov"><option [ngValue]="0">Seleccionar</option><option *ngFor="let p of proveedores" [ngValue]="p.id_proveedor">{{p.razon_social}}</option></select></label><label>Producto<select [(ngModel)]="compraForm.id_producto" name="coprod"><option [ngValue]="0">Seleccionar</option><option *ngFor="let p of productos" [ngValue]="p.id_producto">{{p.nombre_producto}}</option></select></label><div class="form-row"><label>Cantidad<input type="number" min="1" [(ngModel)]="compraForm.cantidad" name="cocantidad"></label><label>Precio compra<input type="number" step="0.01" min="0.01" [(ngModel)]="compraForm.precio_compra" name="coprecio"></label></div><div class="form-row"><label>Comprobante<select [(ngModel)]="compraForm.tipo_comprobante" name="cotipo"><option>Factura</option><option>Boleta</option></select></label><label>Número<input [(ngModel)]="compraForm.numero_comprobante" name="conumero" required></label></div><button class="admin-primary">Registrar compra</button></form></article><article class="admin-list-card wide-card"><div class="management-heading"><div><h2>Compras</h2><p>{{compras.length}} registros.</p></div></div><div class="table-wrap"><table class="management-table"><thead><tr><th>ID</th><th>Proveedor</th><th>Comprobante</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Acción</th></tr></thead><tbody><tr *ngFor="let c of compras"><td>{{c.id_compra}}</td><td>{{c.proveedor?.razon_social}}</td><td>{{c.tipo_comprobante}} {{c.numero_comprobante}}</td><td>{{fecha(c.fecha_compra)}}</td><td>S/ {{c.total | number:'1.2-2'}}</td><td>{{c.estado}}</td><td><button *ngIf="c.estado!=='Anulado'" class="table-danger" type="button" (click)="anularCompra(c.id_compra)">Anular</button></td></tr></tbody></table></div></article></section>
      </ng-container>

      <ng-container *ngIf="seccion==='ventas'">
        <section class="management-grid"><article class="admin-form-card"><div class="management-heading"><div><h2>Registrar venta</h2><p>Descuenta stock y genera Kardex automáticamente.</p></div><span>↑</span></div><form (ngSubmit)="registrarVenta()"><label>Cliente<select [(ngModel)]="ventaForm.id_cliente" name="vcliente"><option [ngValue]="0">Seleccionar</option><option *ngFor="let c of clientes" [ngValue]="c.id_cliente">{{nombreCliente(c)}}</option></select></label><label>Producto<select [(ngModel)]="ventaForm.id_producto" name="vproducto"><option [ngValue]="0">Seleccionar</option><option *ngFor="let p of productos" [ngValue]="p.id_producto">{{p.nombre_producto}} (Stock {{p.stock}})</option></select></label><label>Cantidad<input type="number" min="1" [(ngModel)]="ventaForm.cantidad" name="vcantidad"></label><div class="form-row"><label>Comprobante<select [(ngModel)]="ventaForm.tipo_comprobante" name="vtipo"><option>Boleta</option><option>Factura</option></select></label><label>Número<input [(ngModel)]="ventaForm.numero_comprobante" name="vnumero" required></label></div><div class="form-row"><label>Método<select [(ngModel)]="ventaForm.metodo_pago" name="vmetodo"><option>Efectivo</option><option>Yape</option><option>Plin</option><option>Transferencia</option><option>Tarjeta</option></select></label><label>N° operación<input [(ngModel)]="ventaForm.numero_operacion" name="voperacion"></label></div><button class="admin-primary">Registrar venta</button></form></article><article class="admin-list-card wide-card"><div class="management-heading"><div><h2>Ventas</h2><p>{{ventas.length}} registros.</p></div></div><div class="table-wrap"><table class="management-table"><thead><tr><th>ID</th><th>Cliente</th><th>Comprobante</th><th>Fecha</th><th>Método</th><th>Total</th></tr></thead><tbody><tr *ngFor="let v of ventas"><td>{{v.id_venta}}</td><td>{{nombreCliente(v.cliente)}}</td><td>{{v.tipo_comprobante}} {{v.numero_comprobante}}</td><td>{{fecha(v.fecha_venta)}}</td><td>{{v.metodo_pago}}</td><td>S/ {{v.total | number:'1.2-2'}}</td></tr></tbody></table></div></article></section>
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
  seccion = 'dashboard';
  toast = '';
  error = '';
  dashboard: any = null;
  reporteIngresos: any = null;
  reporteAsistencias: any = null;

  clientes: any[] = [];
  membresiasDisponibles: any[] = [];
  membresiasCliente: any[] = [];
  pagos: any[] = [];
  pagosPendientes: any[] = [];
  entrenadores: any[] = [];
  clases: any[] = [];
  asistencias: any[] = [];
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
    {id:'productos',icono:'□',nombre:'Productos'},
    {id:'proveedores',icono:'▤',nombre:'Proveedores'},
    {id:'compras',icono:'↓',nombre:'Compras'},
    {id:'ventas',icono:'↑',nombre:'Ventas'},
    {id:'kardex',icono:'▥',nombre:'Kardex'},
    {id:'caja',icono:'$',nombre:'Caja'},
    {id:'reportes',icono:'▥',nombre:'Reportes'},
    {id:'configuracion',icono:'⚙',nombre:'Configuración'}
  ];
  titulos: Record<string,[string,string]> = {
    dashboard:['Panel Administrador','Datos reales del gimnasio'], clientes:['Clientes','Registro y administración de miembros'],
    membresias:['Membresías','Planes, vigencias y contratación'], pagos:['Pagos','Confirmación e historial de pagos'],
    entrenador:['Entrenador','Gestión del entrenador principal'], clases:['Clases','Programación, horarios y cupos'],
    asistencias:['Asistencias','Control de entradas y salidas'], productos:['Productos','CRUD de productos conectado a Laravel'],
    proveedores:['Proveedores','Proveedores de productos'], compras:['Compras','Ingreso de productos e inventario'],
    ventas:['Ventas','Ventas de productos y stock'], kardex:['Kardex','Movimientos del inventario'],
    caja:['Caja','Apertura, movimientos y cierre'], reportes:['Reportes','Indicadores calculados desde MySQL'],
    configuracion:['Configuración','Estado técnico del sistema']
  };

  clienteForm: any = {dni:'',nombres:'',apellidos:'',telefono:'',correo:'',direccion:'',estado:'Activo'};
  membresiaForm: any = {id_cliente:0,id_membresia:0,metodo_pago:'Efectivo',numero_operacion:''};
  entrenadorForm: any = {dni:'',nombres:'',apellidos:'',telefono:'',correo:'',especialidad:'',fecha_contratacion:new Date().toISOString().slice(0,10),salario:0,estado:'Activo'};
  claseForm: any = {id_entrenador:null,nombre:'',descripcion:'',dia_semana:'Lunes',hora_inicio:'08:00',hora_fin:'09:00',cupo_maximo:15,estado:'Activo'};
  asistenciaCliente = 0;
  proveedorForm: any = {ruc:'',razon_social:'',contacto:'',telefono:'',correo:'',direccion:'',estado:'Activo'};
  compraForm: any = {id_proveedor:0,id_producto:0,cantidad:1,precio_compra:0,tipo_comprobante:'Factura',numero_comprobante:''};
  ventaForm: any = {id_cliente:0,id_producto:0,cantidad:1,tipo_comprobante:'Boleta',numero_comprobante:'',metodo_pago:'Efectivo',numero_operacion:'',igv_porcentaje:18};
  ajusteForm: any = {id_producto:0,tipo:'Entrada',cantidad:1,motivo:''};
  cajaAbrirForm: any = {monto_inicial:0,observacion:''};
  movCajaForm: any = {tipo:'Ingreso',monto:0,descripcion:'',origen:'Manual'};
  cajaCerrarForm: any = {monto_real:0,observacion:''};

  constructor(public auth: AuthService, private api: AdminApiService, private router: Router) {}

  ngOnInit(): void { this.recargarTodo(); }

  get tituloActual(): string { return this.titulos[this.seccion]?.[0] ?? 'Administrador'; }
  get subtituloActual(): string { return this.titulos[this.seccion]?.[1] ?? ''; }

  cambiarSeccion(id: string): void {
    this.seccion = id;
    this.error = '';
    if (id === 'reportes') this.cargarReportes();
    window.scrollTo({top:0, behavior:'smooth'});
  }

  recargarTodo(): void {
    this.cargarDashboard(); this.cargarClientes(); this.cargarMembresias(); this.cargarPagos();
    this.cargarEntrenadores(); this.cargarClases(); this.cargarAsistencias(); this.cargarProductos();
    this.cargarProveedores(); this.cargarCompras(); this.cargarVentas(); this.cargarKardex(); this.cargarCaja(); this.cargarReportes();
  }

  cargarDashboard(){ this.api.dashboard().subscribe({next:r=>this.dashboard=r,error:e=>this.mostrarError(e)}); }
  cargarClientes(){ this.api.clientes().subscribe({next:r=>this.clientes=r,error:e=>this.mostrarError(e)}); }
  cargarMembresias(){
    this.api.membresiasDisponibles().subscribe({next:r=>this.membresiasDisponibles=r.filter(x=>x.estado==='Activo'),error:e=>this.mostrarError(e)});
    this.api.clienteMembresias().subscribe({next:r=>this.membresiasCliente=r,error:e=>this.mostrarError(e)});
  }
  cargarPagos(){
    this.api.pagos().subscribe({next:r=>this.pagos=r,error:e=>this.mostrarError(e)});
    this.api.pagosPendientes().subscribe({next:r=>this.pagosPendientes=r,error:e=>this.mostrarError(e)});
  }
  cargarEntrenadores(){ this.api.entrenadores().subscribe({next:r=>{this.entrenadores=r; if(r[0]) this.entrenadorForm={...r[0]};},error:e=>this.mostrarError(e)}); }
  cargarClases(){ this.api.clases().subscribe({next:r=>this.clases=r,error:e=>this.mostrarError(e)}); }
  cargarAsistencias(){ this.api.asistencias().subscribe({next:r=>this.asistencias=r,error:e=>this.mostrarError(e)}); }
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

  confirmarPago(id:number){ this.api.confirmarPago(id).subscribe({next:()=>{this.ok('Pago confirmado y membresía activada');this.cargarPagos();this.cargarMembresias();this.cargarDashboard();},error:e=>this.mostrarError(e)}); }
  rechazarPago(id:number){ const motivo=prompt('Motivo del rechazo:'); if(!motivo?.trim()) return; this.api.rechazarPago(id,motivo).subscribe({next:()=>{this.ok('Pago rechazado');this.cargarPagos();this.cargarMembresias();},error:e=>this.mostrarError(e)}); }

  guardarEntrenador(){
    const id=this.entrenadores[0]?.id_entrenador;
    const req=id?this.api.actualizarEntrenador(id,this.entrenadorForm):this.api.crearEntrenador(this.entrenadorForm);
    req.subscribe({next:()=>{this.ok('Entrenador guardado en MySQL');this.cargarEntrenadores();},error:e=>this.mostrarError(e)});
  }

  crearClase(){ this.api.crearClase(this.claseForm).subscribe({next:()=>{this.ok('Clase registrada');this.claseForm={id_entrenador:this.entrenadores[0]?.id_entrenador??null,nombre:'',descripcion:'',dia_semana:'Lunes',hora_inicio:'08:00',hora_fin:'09:00',cupo_maximo:15,estado:'Activo'};this.cargarClases();},error:e=>this.mostrarError(e)}); }
  desactivarClase(id:number){ if(!confirm('¿Desactivar esta clase?')) return; this.api.desactivarClase(id).subscribe({next:()=>{this.ok('Clase desactivada');this.cargarClases();},error:e=>this.mostrarError(e)}); }

  registrarEntrada(){ if(!this.asistenciaCliente){this.error='Selecciona un cliente.';return;} this.api.registrarEntrada(this.asistenciaCliente).subscribe({next:r=>{this.ok(r.mensaje||'Entrada registrada');this.cargarAsistencias();this.cargarDashboard();},error:e=>this.mostrarError(e)}); }
  registrarSalida(){ if(!this.asistenciaCliente){this.error='Selecciona un cliente.';return;} this.api.registrarSalida(this.asistenciaCliente).subscribe({next:r=>{this.ok(r.mensaje||'Salida registrada');this.cargarAsistencias();this.cargarDashboard();},error:e=>this.mostrarError(e)}); }

  crearProveedor(){ this.api.crearProveedor(this.proveedorForm).subscribe({next:()=>{this.ok('Proveedor registrado');this.proveedorForm={ruc:'',razon_social:'',contacto:'',telefono:'',correo:'',direccion:'',estado:'Activo'};this.cargarProveedores();},error:e=>this.mostrarError(e)}); }

  registrarCompra(){
    const datos={id_proveedor:this.compraForm.id_proveedor,tipo_comprobante:this.compraForm.tipo_comprobante,numero_comprobante:this.compraForm.numero_comprobante,items:[{id_producto:this.compraForm.id_producto,cantidad:this.compraForm.cantidad,precio_compra:this.compraForm.precio_compra}]};
    this.api.registrarCompra(datos).subscribe({next:r=>{this.ok(r.mensaje||'Compra registrada');this.compraForm={id_proveedor:0,id_producto:0,cantidad:1,precio_compra:0,tipo_comprobante:'Factura',numero_comprobante:''};this.cargarCompras();this.cargarProductos();this.cargarKardex();this.cargarDashboard();},error:e=>this.mostrarError(e)});
  }
  anularCompra(id:number){ if(!confirm('¿Anular esta compra?')) return; this.api.anularCompra(id).subscribe({next:r=>{this.ok(r.mensaje||'Compra anulada');this.cargarCompras();this.cargarProductos();this.cargarKardex();},error:e=>this.mostrarError(e)}); }

  registrarVenta(){
    const datos={id_cliente:this.ventaForm.id_cliente,tipo_comprobante:this.ventaForm.tipo_comprobante,numero_comprobante:this.ventaForm.numero_comprobante,metodo_pago:this.ventaForm.metodo_pago,numero_operacion:this.ventaForm.metodo_pago==='Efectivo'?null:this.ventaForm.numero_operacion,igv_porcentaje:this.ventaForm.igv_porcentaje,items:[{id_producto:this.ventaForm.id_producto,cantidad:this.ventaForm.cantidad}]};
    this.api.registrarVenta(datos).subscribe({next:r=>{this.ok(r.mensaje||'Venta registrada');this.ventaForm={id_cliente:0,id_producto:0,cantidad:1,tipo_comprobante:'Boleta',numero_comprobante:'',metodo_pago:'Efectivo',numero_operacion:'',igv_porcentaje:18};this.cargarVentas();this.cargarProductos();this.cargarKardex();this.cargarCaja();this.cargarDashboard();},error:e=>this.mostrarError(e)});
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

  ok(mensaje:string){ this.error=''; this.toast='✓ '+mensaje; setTimeout(()=>this.toast='',2600); }
  mostrarError(e:any){
    if(e?.status===401){this.auth.limpiarSesion();this.router.navigate(['/login']);return;}
    const errores=e?.error?.errors;
    if(errores){const primero=Object.values(errores)[0];this.error=Array.isArray(primero)?String(primero[0]):String(primero);return;}
    this.error=e?.error?.mensaje ?? e?.error?.message ?? e?.error?.error ?? 'No se pudo completar la operación.';
  }
}
