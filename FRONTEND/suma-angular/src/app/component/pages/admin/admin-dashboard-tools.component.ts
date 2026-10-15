import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard-tools',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="dashboard-tools" aria-label="Control avanzado del dashboard">
      <header class="tools-title">
        <div>
          <span>CONTROL OPERATIVO</span>
          <h3>Resumen y revisión rápida</h3>
          <p>Filtra pendientes, revisa actividad reciente y valida los indicadores principales sin salir del dashboard.</p>
        </div>
        <div class="health" [attr.data-state]="estadoOperativo()">
          <small>ESTADO GENERAL</small>
          <b>{{etiquetaEstadoOperativo()}}</b>
          <em>{{puntajeOperativo()}}/100</em>
        </div>
      </header>

      <div class="metric-grid">
        <article><small>VENTA PROMEDIO HOY</small><b>S/ {{ventaPromedioHoy() | number:'1.2-2'}}</b><span>{{numeroSeguro(dashboard?.ventas?.hoy_cantidad)}} operaciones</span></article>
        <article><small>MARGEN DEL MES</small><b>{{margenUtilidad() | number:'1.1-1'}}%</b><span>Utilidad sobre ingresos</span></article>
        <article><small>VARIACIÓN INGRESOS</small><b>{{variacionIngresos() | number:'1.1-1'}}%</b><span>{{etiquetaVariacionIngresos()}}</span></article>
        <article><small>MEMBRESÍAS / INGRESOS</small><b>{{porcentajeIngresoMembresias() | number:'1.0-0'}}%</b><span>Participación mensual</span></article>
        <article><small>PRODUCTOS / INGRESOS</small><b>{{porcentajeIngresoProductos() | number:'1.0-0'}}%</b><span>Participación mensual</span></article>
        <article><small>ASISTENCIA PROMEDIO</small><b>{{promedioAsistenciasSemana() | number:'1.1-1'}}</b><span>visitas por día</span></article>
        <article><small>DÍA CON MÁS ASISTENCIA</small><b>{{diaPicoAsistencia()?.dia || '-'}}</b><span>{{diaPicoAsistencia()?.total || 0}} visitas</span></article>
        <article><small>RIESGO OPERATIVO</small><b>{{nivelRiesgoOperativo()}}</b><span>{{totalPendientesCalculado()}} pendientes detectados</span></article>
      </div>

      <div class="consistency" [class.warning]="!datosConsistentes()">
        <span>{{datosConsistentes() ? '✓' : '!'}}</span>
        <div>
          <b>{{datosConsistentes() ? 'Indicadores consistentes' : 'Revisar conteo de alertas'}}</b>
          <p>{{mensajeConsistencia()}}</p>
        </div>
        <button type="button" (click)="copiarResumenEjecutivo()">Copiar resumen</button>
      </div>

      <div class="tools-columns">
        <article class="tools-card">
          <header>
            <div><span>PRIORIDADES</span><h4>Qué atender primero</h4></div>
            <b>{{prioridadesFiltradas().length}}</b>
          </header>
          <div class="filters">
            <label>Nivel
              <select [(ngModel)]="filtroPrioridad">
                <option value="">Todos</option>
                <option value="alto">Alta</option>
                <option value="medio">Media</option>
                <option value="bajo">Baja</option>
              </select>
            </label>
            <label>Orden
              <select [(ngModel)]="ordenPrioridad">
                <option value="gravedad">Más importantes</option>
                <option value="cantidad">Mayor cantidad</option>
              </select>
            </label>
            <button type="button" (click)="limpiarFiltroPrioridades()">Limpiar</button>
            <button type="button" (click)="exportarPrioridadesCsv()">CSV</button>
          </div>
          <div class="list">
            <button type="button" *ngFor="let p of prioridadesFiltradas() | slice:0:6" (click)="abrirDestinoPrioridad(p)">
              <span class="level" [attr.data-level]="normalizarNivel(p?.nivel)"></span>
              <div><small>{{normalizarNivel(p?.nivel) | uppercase}}</small><b>{{p?.titulo || 'Pendiente'}}</b><p>{{p?.descripcion || ''}}</p></div>
              <em>{{numeroSeguro(p?.cantidad)}} →</em>
            </button>
            <div class="empty" *ngIf="!prioridadesFiltradas().length">No hay prioridades con este filtro.</div>
          </div>
        </article>

        <article class="tools-card">
          <header>
            <div><span>ACTIVIDAD DEL PORTAL</span><h4>Movimientos recientes</h4></div>
            <b>{{actividadFiltrada().length}}</b>
          </header>
          <div class="filters activity-filters">
            <label>Buscar<input [(ngModel)]="busquedaActividad" placeholder="Cliente o detalle"></label>
            <label>Tipo
              <select [(ngModel)]="tipoActividad">
                <option value="">Todos</option>
                <option value="reserva">Reservas</option>
                <option value="pago">Pagos</option>
                <option value="rutina">Rutinas</option>
                <option value="soporte">Soporte</option>
                <option value="opinion">Opiniones</option>
              </select>
            </label>
            <label>Orden
              <select [(ngModel)]="ordenActividad">
                <option value="reciente">Más recientes</option>
                <option value="antigua">Más antiguas</option>
              </select>
            </label>
            <button type="button" (click)="limpiarFiltroActividad()">Limpiar</button>
            <button type="button" (click)="exportarActividadCsv()">CSV</button>
          </div>
          <div class="list">
            <button type="button" *ngFor="let a of actividadFiltrada() | slice:0:6" (click)="abrirDestinoActividad(a)">
              <span class="activity-icon">{{iconoActividad(a?.tipo)}}</span>
              <div><small>{{etiquetaActividad(a?.tipo)}}</small><b>{{a?.titulo || 'Actividad'}}</b><p>{{a?.cliente || 'Cliente'}} · {{a?.detalle || ''}}</p></div>
              <em>{{fechaCorta(a?.fecha)}}</em>
            </button>
            <div class="empty" *ngIf="!actividadFiltrada().length">No hay actividad con estos filtros.</div>
          </div>
        </article>
      </div>
    </section>
  `,
  styles: [`
    :host{display:block}.dashboard-tools{margin:20px 0;padding:20px;border:1px solid #e4e9ed;border-radius:18px;background:#fff;box-shadow:0 12px 35px rgba(28,43,56,.06)}
    .tools-title{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;margin-bottom:16px}.tools-title span,.tools-card header span{font-size:9px;font-weight:900;letter-spacing:1.25px;color:#d83250}.tools-title h3{margin:5px 0 4px;font-size:23px;color:#23384c}.tools-title p{margin:0;color:#72808c;font-size:11px;max-width:650px}.health{display:grid;gap:2px;min-width:150px;padding:12px 14px;border-radius:12px;background:#f6f8fa}.health small{font-size:8px;color:#7b8792}.health b{font-size:13px;color:#24384b}.health em{font-size:10px;font-style:normal;color:#6d7a85}.health[data-state="alerta"]{background:#fff5f5}.health[data-state="atencion"]{background:#fff9ed}
    .metric-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.metric-grid article{display:grid;gap:3px;padding:13px;border:1px solid #e8edf0;border-radius:12px;background:#fafbfc}.metric-grid small{font-size:8px;font-weight:900;color:#83909b}.metric-grid b{font-size:18px;color:#24384b}.metric-grid span{font-size:9px;color:#7e8a94}
    .consistency{display:grid;grid-template-columns:32px 1fr auto;gap:10px;align-items:center;margin:12px 0;padding:11px 12px;border:1px solid #dce8e1;border-radius:12px;background:#f6fbf8}.consistency.warning{border-color:#f2d9b5;background:#fffaf2}.consistency>span{display:grid;place-items:center;width:28px;height:28px;border-radius:9px;background:#e6f5eb;color:#167743;font-weight:900}.consistency.warning>span{background:#fff0d7;color:#9a6215}.consistency b{display:block;font-size:11px;color:#2c4153}.consistency p{margin:2px 0 0;font-size:9px;color:#78858f}.consistency button,.filters button{border:1px solid #d9e0e5;background:#fff;color:#2d4050;border-radius:9px;padding:8px 10px;font-size:9px;font-weight:900;cursor:pointer}
    .tools-columns{display:grid;grid-template-columns:1fr 1fr;gap:12px}.tools-card{padding:14px;border:1px solid #e7ecef;border-radius:14px}.tools-card header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.tools-card h4{margin:4px 0 0;color:#263b4e}.tools-card header>b{display:grid;place-items:center;min-width:27px;height:27px;border-radius:9px;background:#f3f6f8;font-size:11px}
    .filters{display:grid;grid-template-columns:1fr 1fr auto auto;gap:7px;margin-bottom:10px}.activity-filters{grid-template-columns:1.4fr 1fr 1fr auto auto}.filters label{display:grid;gap:4px;font-size:8px;font-weight:900;color:#788691}.filters input,.filters select{min-width:0;height:34px;border:1px solid #dce3e7;border-radius:8px;background:#fff;padding:0 8px;font-size:10px}.filters button{align-self:end}
    .list{display:grid;gap:6px}.list>button{display:grid;grid-template-columns:24px 1fr auto;gap:9px;align-items:center;width:100%;padding:9px;border:1px solid #edf0f2;border-radius:10px;background:#fbfcfd;text-align:left;cursor:pointer}.list>button:hover{background:#f6f8fa}.list small{font-size:7px;font-weight:900;color:#8a959e}.list b{display:block;margin:2px 0;font-size:10px;color:#293d4f}.list p{margin:0;font-size:8px;color:#7b8791;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:340px}.list em{font-size:8px;font-style:normal;color:#677580;white-space:nowrap}.level{width:10px;height:10px;border-radius:999px;background:#9aa6af}.level[data-level="alto"]{background:#d6364e}.level[data-level="medio"]{background:#d99a2b}.level[data-level="bajo"]{background:#419966}.activity-icon{font-size:15px}.empty{padding:14px;text-align:center;color:#89959e;font-size:9px;background:#fafbfc;border-radius:10px}
    @media(max-width:1100px){.metric-grid{grid-template-columns:repeat(2,1fr)}.tools-columns{grid-template-columns:1fr}.activity-filters,.filters{grid-template-columns:1fr 1fr}}
    @media(max-width:650px){.tools-title{flex-direction:column}.health{width:100%;box-sizing:border-box}.metric-grid{grid-template-columns:1fr}.consistency{grid-template-columns:32px 1fr}.consistency button{grid-column:1/-1}.activity-filters,.filters{grid-template-columns:1fr}.list p{max-width:190px}}
  `]
})
export class AdminDashboardToolsComponent {
  @Input() dashboard:any=null;
  @Output() irSeccion=new EventEmitter<string>();

  filtroPrioridad='';
  ordenPrioridad='gravedad';
  busquedaActividad='';
  tipoActividad='';
  ordenActividad='reciente';

  numeroSeguro(v:any):number{const n=Number(v);return Number.isFinite(n)?Math.max(0,n):0;}
  ventaPromedioHoy():number{const total=this.numeroSeguro(this.dashboard?.ventas?.hoy_total);const cantidad=this.numeroSeguro(this.dashboard?.ventas?.hoy_cantidad);return cantidad>0?total/cantidad:0;}
  margenUtilidad():number{const ingresos=this.numeroSeguro(this.dashboard?.ingresos?.total_mes);const utilidad=Number(this.dashboard?.utilidad?.total_mes||0);return ingresos>0?Math.max(-1000,Math.min(1000,(utilidad/ingresos)*100)):0;}
  variacionIngresos():number{const v=Number(this.dashboard?.ingresos?.variacion_mes||0);return Number.isFinite(v)?v:0;}
  etiquetaVariacionIngresos():string{const v=this.variacionIngresos();return v>0?'Crecimiento frente al mes anterior':v<0?'Disminución frente al mes anterior':'Sin variación frente al mes anterior';}
  porcentajeIngresoMembresias():number{const total=this.numeroSeguro(this.dashboard?.ingresos?.total_mes);return total>0?Math.min(100,this.numeroSeguro(this.dashboard?.ingresos?.membresias_mes)*100/total):0;}
  porcentajeIngresoProductos():number{const total=this.numeroSeguro(this.dashboard?.ingresos?.total_mes);return total>0?Math.min(100,this.numeroSeguro(this.dashboard?.ingresos?.ventas_mes)*100/total):0;}
  promedioAsistenciasSemana():number{const datos=Array.isArray(this.dashboard?.tendencias?.asistencias_7_dias)?this.dashboard.tendencias.asistencias_7_dias:[];return datos.length?datos.reduce((s:number,d:any)=>s+this.numeroSeguro(d?.total),0)/datos.length:0;}
  diaPicoAsistencia():any{const datos=Array.isArray(this.dashboard?.tendencias?.asistencias_7_dias)?this.dashboard.tendencias.asistencias_7_dias:[];return [...datos].sort((a,b)=>this.numeroSeguro(b?.total)-this.numeroSeguro(a?.total))[0]||null;}

  prioridadesBase():any[]{return Array.isArray(this.dashboard?.alertas?.prioridades)?this.dashboard.alertas.prioridades:[];}
  normalizarNivel(v:any):'alto'|'medio'|'bajo'{const n=String(v||'').toLowerCase();if(['alto','alta','critico','crítico'].includes(n))return'alto';if(['medio','media'].includes(n))return'medio';return'bajo';}
  prioridadesFiltradas():any[]{let x=[...this.prioridadesBase()];if(this.filtroPrioridad)x=x.filter(p=>this.normalizarNivel(p?.nivel)===this.filtroPrioridad);const peso:any={alto:3,medio:2,bajo:1};return x.sort((a,b)=>this.ordenPrioridad==='cantidad'?this.numeroSeguro(b?.cantidad)-this.numeroSeguro(a?.cantidad):peso[this.normalizarNivel(b?.nivel)]-peso[this.normalizarNivel(a?.nivel)]||this.numeroSeguro(b?.cantidad)-this.numeroSeguro(a?.cantidad));}
  limpiarFiltroPrioridades():void{this.filtroPrioridad='';this.ordenPrioridad='gravedad';}
  prioridadesUrgentes():number{return this.prioridadesBase().filter(p=>this.normalizarNivel(p?.nivel)==='alto').reduce((s,p)=>s+this.numeroSeguro(p?.cantidad),0);}

  actividadBase():any[]{return Array.isArray(this.dashboard?.portal_clientes?.actividad_reciente)?this.dashboard.portal_clientes.actividad_reciente:[];}
  actividadFiltrada():any[]{let x=[...this.actividadBase()];const q=this.busquedaActividad.trim().toLowerCase();if(q)x=x.filter(a=>[a?.titulo,a?.cliente,a?.detalle,a?.estado].some(v=>String(v||'').toLowerCase().includes(q)));if(this.tipoActividad)x=x.filter(a=>String(a?.tipo||'').toLowerCase()===this.tipoActividad);return x.sort((a,b)=>this.ordenActividad==='antigua'?this.time(a?.fecha)-this.time(b?.fecha):this.time(b?.fecha)-this.time(a?.fecha));}
  limpiarFiltroActividad():void{this.busquedaActividad='';this.tipoActividad='';this.ordenActividad='reciente';}

  pagosPendientes():number{return this.numeroSeguro(this.dashboard?.membresias?.pagos_pendientes);}
  descuadreCaja():number{
    const c=this.dashboard?.caja?.detalle||{};
    const directo=Number(c?.diferencia);
    if(Number.isFinite(directo))return Math.abs(directo);
    const real=Number(c?.monto_real);
    const esperado=Number(c?.monto_esperado ?? c?.monto_sistema);
    return Number.isFinite(real)&&Number.isFinite(esperado)?Math.abs(real-esperado):0;
  }
  totalPendientesCalculado():number{return this.numeroSeguro(this.dashboard?.alertas?.soporte_pendiente)+this.numeroSeguro(this.dashboard?.alertas?.rutinas_pendientes)+this.numeroSeguro(this.dashboard?.alertas?.opiniones_pendientes)+this.numeroSeguro(this.dashboard?.inventario?.productos_stock_bajo)+this.numeroSeguro(this.dashboard?.membresias?.por_vencer_7_dias)+this.pagosPendientes();}
  datosConsistentes():boolean{
    const alertas=this.numeroSeguro(this.dashboard?.alertas?.total)===this.totalPendientesCalculado();
    const ingresos=this.numeroSeguro(this.dashboard?.ingresos?.total_mes);
    const partes=this.numeroSeguro(this.dashboard?.ingresos?.membresias_mes)+this.numeroSeguro(this.dashboard?.ingresos?.ventas_mes);
    const ingresosOk=Math.abs(ingresos-partes)<0.02;
    const clientes=this.numeroSeguro(this.dashboard?.clientes?.total);
    const activos=this.numeroSeguro(this.dashboard?.clientes?.activos);
    return alertas && ingresosOk && activos<=clientes && this.descuadreCaja()<0.02;
  }
  mensajeConsistencia():string{
    if(this.datosConsistentes())return 'Alertas, ingresos, clientes y caja coinciden con el detalle operativo.';
    return 'Hay una diferencia entre alertas, ingresos, clientes o caja. Revisa el módulo relacionado antes de cerrar operaciones.';
  }
  nivelRiesgoOperativo():string{const altos=this.prioridadesUrgentes();const total=this.totalPendientesCalculado();const caja=this.descuadreCaja();if(altos>0||total>=10||caja>=10)return'ALTO';if(total>0||caja>0)return'MEDIO';return'BAJO';}
  puntajeOperativo():number{let score=100;score-=Math.min(40,this.totalPendientesCalculado()*3);score-=Math.min(25,this.prioridadesUrgentes()*5);score-=Math.min(20,Math.round(this.descuadreCaja()));if(!this.datosConsistentes())score-=15;if(!this.dashboard?.fuente?.base_datos)score-=20;return Math.max(0,Math.round(score));}
  estadoOperativo():string{const p=this.puntajeOperativo();return p>=85?'estable':p>=60?'atencion':'alerta';}
  etiquetaEstadoOperativo():string{const e=this.estadoOperativo();return e==='estable'?'Estable':e==='atencion'?'Requiere atención':'Atención prioritaria';}

  copiarResumenEjecutivo():void{this.copiarTexto(this.resumenEjecutivo());}
  exportarPrioridadesCsv():void{this.descargarCsv('prioridades-dashboard.csv',['Nivel,Titulo,Cantidad,Descripcion',...this.prioridadesFiltradas().map(p=>[this.normalizarNivel(p?.nivel),p?.titulo,this.numeroSeguro(p?.cantidad),p?.descripcion].map(v=>this.csv(v)).join(','))]);}
  exportarActividadCsv():void{this.descargarCsv('actividad-dashboard.csv',['Tipo,Cliente,Titulo,Detalle,Estado,Fecha',...this.actividadFiltrada().map(a=>[a?.tipo,a?.cliente,a?.titulo,a?.detalle,a?.estado,a?.fecha].map(v=>this.csv(v)).join(','))]);}

  abrirDestinoPrioridad(p:any):void{const t=String(p?.tipo||'').toLowerCase();const map:any={rutinas:'rutinas',soporte:'soporte',opiniones:'opiniones',inventario:'inventario',membresias:'membresias',pagos:'pagos'};this.irSeccion.emit(map[t]||'dashboard');}
  abrirDestinoActividad(a:any):void{const t=String(a?.tipo||'').toLowerCase();const map:any={rutina:'rutinas',soporte:'soporte',reserva:'reservas',pago:'pagos',opinion:'opiniones'};this.irSeccion.emit(map[t]||'dashboard');}
  iconoActividad(tipo:any):string{const t=String(tipo||'').toLowerCase();return t==='rutina'?'🏋':t==='soporte'?'?':t==='reserva'?'◷':t==='pago'?'S/':t==='opinion'?'★':'●';}
  etiquetaActividad(tipo:any):string{const t=String(tipo||'').toLowerCase();return t==='rutina'?'RUTINA':t==='soporte'?'SOPORTE':t==='reserva'?'RESERVA':t==='pago'?'PAGO':t==='opinion'?'OPINIÓN':'ACTIVIDAD';}
  fechaCorta(v:any):string{if(!v)return'-';const d=new Date(v);return isNaN(d.getTime())?String(v):d.toLocaleDateString('es-PE');}

  resumenEjecutivo():string{return [
    'MALLQUI GYM - RESUMEN DEL DASHBOARD',
    'Estado: '+this.etiquetaEstadoOperativo()+' ('+this.puntajeOperativo()+'/100)',
    'Ingresos del mes: S/ '+this.numeroSeguro(this.dashboard?.ingresos?.total_mes).toFixed(2),
    'Utilidad del mes: S/ '+Number(this.dashboard?.utilidad?.total_mes||0).toFixed(2),
    'Margen: '+this.margenUtilidad().toFixed(1)+'%',
    'Venta promedio hoy: S/ '+this.ventaPromedioHoy().toFixed(2),
    'Pendientes: '+this.totalPendientesCalculado(),
    'Prioridades altas: '+this.prioridadesUrgentes(),
    'Asistencia promedio 7 días: '+this.promedioAsistenciasSemana().toFixed(1),
    'Día de mayor asistencia: '+(this.diaPicoAsistencia()?.dia||'-')
  ].join('\n');}
  private time(v:any):number{const d=new Date(v||0);return isNaN(d.getTime())?0:d.getTime();}
  private csv(v:any):string{return '"'+String(v??'').replace(/"/g,'""')+'"';}
  private copiarTexto(t:string):void{try{if(navigator?.clipboard?.writeText){navigator.clipboard.writeText(t).catch(()=>this.copiaAlterna(t));return;}}catch{}this.copiaAlterna(t);}
  private copiaAlterna(t:string):void{const x=document.createElement('textarea');x.value=t;x.style.position='fixed';x.style.opacity='0';document.body.appendChild(x);x.select();try{document.execCommand('copy');}catch{}document.body.removeChild(x);}
  private descargarCsv(nombre:string,lineas:string[]):void{const blob=new Blob(['\uFEFF'+lineas.join('\n')],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=nombre;a.style.display='none';document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(()=>URL.revokeObjectURL(url),0);}
}
