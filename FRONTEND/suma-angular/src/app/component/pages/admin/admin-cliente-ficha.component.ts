import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AdminApiService } from './admin-api.service';

@Component({
  selector: 'app-admin-cliente-ficha',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="client360-backdrop" *ngIf="clienteId" (click)="cerrar.emit()">
      <section class="client360-panel" (click)="$event.stopPropagation()">
        <header class="client360-head">
          <div>
            <span>FICHA 360 DEL CLIENTE</span>
            <h2>{{nombreCliente}}</h2>
            <p>{{ficha?.cliente?.dni || '-'}} · {{ficha?.cliente?.correo || 'Sin correo'}}</p>
          </div>
          <button type="button" (click)="cerrar.emit()" aria-label="Cerrar ficha">×</button>
        </header>

        <div *ngIf="cargando" class="client360-loading">Cargando información del cliente...</div>
        <div *ngIf="error" class="client360-error">⚠ {{error}}</div>

        <ng-container *ngIf="ficha && !cargando">
          <section class="client360-kpis">
            <article><span>✦</span><small>MEMBRESÍA</small><b>{{ficha?.membresia_actual?.membresia?.nombre || 'Sin plan'}}</b><p>{{ficha?.membresia_actual ? ('Vence '+fecha(ficha.membresia_actual.fecha_fin)) : 'Sin membresía activa'}}</p></article>
            <article><span>✓</span><small>ASISTENCIAS MES</small><b>{{ficha?.resumen?.asistencias_mes || 0}}</b><p>registros este mes</p></article>
            <article><span>🏋</span><small>RUTINAS ACTIVAS</small><b>{{ficha?.resumen?.rutinas_activas || 0}}</b><p>planes asignados</p></article>
            <article><span>⚡</span><small>SESIONES EN CASA</small><b>{{ficha?.resumen?.sesiones_casa_mes || 0}}</b><p>completadas este mes</p></article>
            <article><span>◷</span><small>RESERVAS</small><b>{{ficha?.resumen?.reservas_activas || 0}}</b><p>reservas activas</p></article>
            <article><span>S/</span><small>COMPRAS / VENTAS</small><b>S/ {{ficha?.resumen?.total_ventas || 0 | number:'1.2-2'}}</b><p>total registrado</p></article>
          </section>

          <section class="client360-profile">
            <article>
              <span>DATOS PERSONALES</span>
              <div><b>Nombre</b><p>{{nombreCliente}}</p></div>
              <div><b>Teléfono</b><p>{{ficha?.cliente?.telefono || '-'}}</p></div>
              <div><b>Dirección</b><p>{{ficha?.cliente?.direccion || '-'}}</p></div>
              <div><b>Estado</b><p>{{ficha?.cliente?.estado || '-'}}</p></div>
            </article>
            <article>
              <span>ESTADO OPERATIVO</span>
              <div><b>Membresía</b><p>{{ficha?.membresia_actual?.estado || 'Sin plan activo'}}</p></div>
              <div><b>Soporte pendiente</b><p>{{ficha?.resumen?.soporte_pendiente || 0}}</p></div>
              <div><b>Registro</b><p>{{fecha(ficha?.cliente?.fecha_registro)}}</p></div>
              <div><b>Reservas activas</b><p>{{ficha?.resumen?.reservas_activas || 0}}</p></div>
            </article>
          </section>

          <section class="client360-tabs">
            <button type="button" [class.active]="tab==='rutinas'" (click)="tab='rutinas'">Rutinas</button>
            <button type="button" [class.active]="tab==='asistencias'" (click)="tab='asistencias'">Asistencias</button>
            <button type="button" [class.active]="tab==='reservas'" (click)="tab='reservas'">Reservas</button>
            <button type="button" [class.active]="tab==='pagos'" (click)="tab='pagos'">Pagos</button>
            <button type="button" [class.active]="tab==='casa'" (click)="tab='casa'">En casa</button>
            <button type="button" [class.active]="tab==='ventas'" (click)="tab='ventas'">Ventas</button>
            <button type="button" [class.active]="tab==='soporte'" (click)="tab='soporte'">Soporte</button>
          </section>

          <section class="client360-history">
            <ng-container *ngIf="tab==='rutinas'">
              <div *ngFor="let x of ficha?.rutinas">
                <div><b>{{x.nombre_rutina}}</b><small>{{x.objetivo || 'Sin objetivo'}}</small></div>
                <span>{{x.entrenador ? (x.entrenador.nombres+' '+x.entrenador.apellidos) : 'Sin entrenador'}}</span>
                <em>{{x.estado}}</em>
              </div>
              <p *ngIf="!ficha?.rutinas?.length">Sin rutinas registradas.</p>
            </ng-container>

            <ng-container *ngIf="tab==='asistencias'">
              <div *ngFor="let x of ficha?.asistencias">
                <div><b>Ingreso al gimnasio</b><small>{{fecha(x.fecha_hora_entrada)}}</small></div>
                <span>{{x.fecha_hora_salida ? 'Salida '+fecha(x.fecha_hora_salida) : 'Aún dentro / sin salida'}}</span>
                <em>{{x.estado || 'Registrada'}}</em>
              </div>
              <p *ngIf="!ficha?.asistencias?.length">Sin asistencias registradas.</p>
            </ng-container>

            <ng-container *ngIf="tab==='reservas'">
              <div *ngFor="let x of ficha?.reservas">
                <div><b>{{x.clase?.nombre || 'Clase'}}</b><small>{{fecha(x.fecha_clase)}}</small></div>
                <span>{{x.clase?.entrenador ? (x.clase.entrenador.nombres+' '+x.clase.entrenador.apellidos) : 'Sin entrenador'}}</span>
                <em>{{x.estado}}</em>
              </div>
              <p *ngIf="!ficha?.reservas?.length">Sin reservas registradas.</p>
            </ng-container>

            <ng-container *ngIf="tab==='pagos'">
              <div *ngFor="let x of ficha?.pagos">
                <div><b>{{x.cliente_membresia?.membresia?.nombre || 'Membresía'}}</b><small>{{fecha(x.fecha_pago)}}</small></div>
                <span>S/ {{x.monto | number:'1.2-2'}} · {{x.metodo_pago}}</span>
                <em>{{x.estado_pago}}</em>
              </div>
              <p *ngIf="!ficha?.pagos?.length">Sin pagos registrados.</p>
            </ng-container>

            <ng-container *ngIf="tab==='casa'">
              <div *ngFor="let x of ficha?.sesiones_casa">
                <div><b>{{x.zona | titlecase}}</b><small>{{fecha(x.fecha)}}</small></div>
                <span>{{minutos(x.duracion_segundos)}} min · {{x.ejercicios_completados}} ejercicios</span>
                <em>{{x.estado}}</em>
              </div>
              <p *ngIf="!ficha?.sesiones_casa?.length">Sin sesiones en casa.</p>
            </ng-container>

            <ng-container *ngIf="tab==='ventas'">
              <div *ngFor="let x of ficha?.ventas">
                <div><b>{{x.tipo_comprobante}} {{x.numero_comprobante}}</b><small>{{fecha(x.fecha_venta)}}</small></div>
                <span>{{x.metodo_pago || '-'}}</span>
                <em>S/ {{x.total | number:'1.2-2'}}</em>
              </div>
              <p *ngIf="!ficha?.ventas?.length">Sin ventas registradas.</p>
            </ng-container>

            <ng-container *ngIf="tab==='soporte'">
              <div *ngFor="let x of ficha?.soporte">
                <div><b>{{x.asunto}}</b><small>{{fecha(x.fecha)}}</small></div>
                <span>{{x.mensaje}}</span>
                <em>{{x.estado}}</em>
              </div>
              <p *ngIf="!ficha?.soporte?.length">Sin consultas de soporte.</p>
            </ng-container>
          </section>
        </ng-container>
      </section>
    </div>
  `
})
export class AdminClienteFichaComponent implements OnChanges {
  @Input() clienteId = 0;
  @Output() cerrar = new EventEmitter<void>();

  ficha: any = null;
  cargando = false;
  error = '';
  tab: 'rutinas'|'asistencias'|'reservas'|'pagos'|'casa'|'ventas'|'soporte' = 'rutinas';

  constructor(private api: AdminApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clienteId'] && this.clienteId) this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.api.fichaCliente(this.clienteId).subscribe({
      next: r => { this.ficha = r; this.cargando = false; },
      error: e => {
        this.error = e?.error?.mensaje || e?.error?.message || 'No se pudo cargar la ficha del cliente.';
        this.cargando = false;
      }
    });
  }

  get nombreCliente(): string {
    const c = this.ficha?.cliente;
    return c ? `${c.nombres || ''} ${c.apellidos || ''}`.trim() || 'Cliente' : 'Cliente';
  }

  fecha(v: any): string {
    if (!v) return '-';
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
  }

  minutos(segundos: any): number {
    return Math.max(0, Math.round(Number(segundos || 0) / 60));
  }
}
