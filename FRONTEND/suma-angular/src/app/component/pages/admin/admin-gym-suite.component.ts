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
    <section class="gym-suite" *ngIf="config">
      <header class="gym-suite-hero">
        <div class="gym-suite-heading">
          <span class="gym-suite-icon">{{config.icon}}</span>
          <div>
            <small>MALLQUI GYM · MÓDULO ADMINISTRATIVO</small>
            <h2>{{config.title}}</h2>
            <p>{{config.subtitle}}</p>
          </div>
        </div>

        <div class="gym-suite-head-actions">
          <button type="button" class="secondary" (click)="exportCsv()">⇩ Exportar CSV</button>
          <button type="button" class="primary" (click)="nuevoRegistro()">＋ Nuevo registro</button>
        </div>
      </header>

      <section class="gym-suite-kpis">
        <article>
          <small>Total registros</small>
          <strong>{{records.length}}</strong>
          <span>Información guardada</span>
        </article>
        <article>
          <small>Activos</small>
          <strong>{{activos}}</strong>
          <span>En operación</span>
        </article>
        <article>
          <small>Este mes</small>
          <strong>{{esteMes}}</strong>
          <span>Registros recientes</span>
        </article>
        <article *ngIf="config.showAmount">
          <small>Total acumulado</small>
          <strong>S/ {{totalMonto | number:'1.2-2'}}</strong>
          <span>Según registros visibles</span>
        </article>
        <article *ngIf="!config.showAmount">
          <small>Pendientes</small>
          <strong>{{pendientes}}</strong>
          <span>Requieren revisión</span>
        </article>
      </section>

      <section class="gym-suite-panel">
        <div class="gym-suite-toolbar">
          <label class="gym-suite-search">
            <span>⌕</span>
            <input
              [(ngModel)]="busqueda"
              (input)="filtrarLocal()"
              placeholder="Buscar en {{config.title | lowercase}}...">
          </label>

          <select [(ngModel)]="estadoFiltro" (change)="filtrarLocal()">
            <option value="">Todos los estados</option>
            <option *ngFor="let estado of config.states" [value]="estado">{{estado}}</option>
          </select>

          <button type="button" class="refresh" [disabled]="loading" (click)="cargar()">
            {{loading ? 'Actualizando...' : '↻ Actualizar'}}
          </button>
        </div>

        <div class="gym-suite-table-wrap" *ngIf="filtered.length; else emptyState">
          <table class="gym-suite-table">
            <thead>
              <tr>
                <th>{{config.primaryLabel}}</th>
                <th>{{config.secondaryLabel}}</th>
                <th *ngIf="config.showDate">{{config.dateLabel}}</th>
                <th *ngIf="config.showAmount">{{config.amountLabel}}</th>
                <th>Estado</th>
                <th>Actualizado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of filtered">
                <td>
                  <div class="gym-suite-main-cell">
                    <span class="gym-suite-thumb" *ngIf="config.showImage && item.imagen_url; else defaultThumb">
                      <img [src]="item.imagen_url" [alt]="item.titulo">
                    </span>
                    <ng-template #defaultThumb>
                      <span class="gym-suite-thumb fallback">{{config.icon}}</span>
                    </ng-template>
                    <div>
                      <b>{{item.titulo}}</b>
                      <small>#{{item.id}}</small>
                    </div>
                  </div>
                </td>
                <td>{{item.subtitulo || '—'}}</td>
                <td *ngIf="config.showDate">{{item.fecha || '—'}}</td>
                <td *ngIf="config.showAmount">S/ {{item.monto || 0 | number:'1.2-2'}}</td>
                <td>
                  <select class="status-select"
                          [ngModel]="item.estado"
                          (ngModelChange)="cambiarEstado(item,$event)">
                    <option *ngFor="let estado of config.states" [value]="estado">{{estado}}</option>
                  </select>
                </td>
                <td>{{item.updated_at ? (item.updated_at | date:'dd/MM/yyyy HH:mm') : '—'}}</td>
                <td>
                  <div class="gym-suite-row-actions">
                    <button type="button" title="Editar" (click)="editar(item)">✎</button>
                    <button type="button" class="danger" title="Eliminar" (click)="eliminar(item)">×</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #emptyState>
          <div class="gym-suite-empty">
            <span>{{config.icon}}</span>
            <h3>{{busqueda || estadoFiltro ? 'No encontramos coincidencias' : 'Todavía no hay registros'}}</h3>
            <p>
              {{busqueda || estadoFiltro
                ? 'Cambia los filtros o prueba con otra búsqueda.'
                : 'Crea el primer registro para comenzar a utilizar este módulo.'}}
            </p>
            <button type="button" (click)="nuevoRegistro()">＋ Crear registro</button>
          </div>
        </ng-template>
      </section>

      <div class="gym-suite-toast success" *ngIf="toast">{{toast}}</div>
      <div class="gym-suite-toast error" *ngIf="error">{{error}}</div>

      <div class="gym-suite-modal-backdrop" *ngIf="modalAbierto" (click)="cerrarModal()"></div>
      <section class="gym-suite-modal" *ngIf="modalAbierto">
        <header>
          <div>
            <small>{{editandoId ? 'EDITAR REGISTRO' : 'NUEVO REGISTRO'}}</small>
            <h3>{{config.title}}</h3>
          </div>
          <button type="button" (click)="cerrarModal()">×</button>
        </header>

        <form (ngSubmit)="guardar()" #gymForm="ngForm">
          <div class="gym-suite-form-grid">
            <label>
              {{config.primaryLabel}} *
              <input
                name="titulo"
                [(ngModel)]="form.titulo"
                required
                maxlength="180"
                [placeholder]="config.primaryLabel">
            </label>

            <label>
              {{config.secondaryLabel}}
              <input
                name="subtitulo"
                [(ngModel)]="form.subtitulo"
                maxlength="255"
                [placeholder]="config.secondaryLabel">
            </label>

            <label *ngIf="config.showDate">
              {{config.dateLabel}}
              <input name="fecha" type="date" [(ngModel)]="form.fecha">
            </label>

            <label *ngIf="config.showAmount">
              {{config.amountLabel}}
              <input name="monto" type="number" min="0" step="0.01" [(ngModel)]="form.monto">
            </label>

            <label>
              Estado *
              <select name="estado" [(ngModel)]="form.estado" required>
                <option *ngFor="let estado of config.states" [value]="estado">{{estado}}</option>
              </select>
            </label>

            <label *ngIf="config.showImage" class="span-2">
              URL de imagen
              <input
                name="imagen_url"
                [(ngModel)]="form.imagen_url"
                maxlength="500"
                placeholder="https://...">
            </label>

            <label class="span-2">
              Detalle / observación
              <textarea
                name="detalle"
                [(ngModel)]="form.detalle"
                rows="4"
                placeholder="Información adicional del registro"></textarea>
            </label>
          </div>

          <footer>
            <button type="button" class="secondary" (click)="cerrarModal()">Cancelar</button>
            <button type="submit" class="primary" [disabled]="saving || gymForm.invalid">
              {{saving ? 'Guardando...' : (editandoId ? 'Guardar cambios' : 'Crear registro')}}
            </button>
          </footer>
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
  `]
})
export class AdminGymSuiteComponent implements OnInit, OnChanges {
  @Input() modulo: GymModuleKey = 'nutricion';

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
      title: 'Equipos del gimnasio',
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
      title: 'Eventos',
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
      title: 'Noticias y novedades',
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
    return this.configs[this.modulo] || this.configs.nutricion;
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
        this.loading = false;
      },
      error: (e: any) => {
        this.loading = false;
        this.error = e?.error?.message || 'No se pudo cargar este módulo. Ejecuta las migraciones del backend.';
        this.limpiarMensaje('error');
      }
    });
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
