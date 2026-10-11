import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { normalizeStatus, parseLocalDate, safeTime } from './portal-cliente-quality';

@Component({
  selector: 'app-cliente-herramientas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="client-tools" *ngIf="modulo==='clases'" data-capability-group="101-110">
      <div class="tools-head"><div><span>BUSCADOR PERSONAL</span><h2>Encuentra una clase más rápido</h2></div><b>{{contarClasesResultado()}} resultados</b></div>
      <div class="tools-controls">
        <label>Buscar<input [(ngModel)]="busquedaClase" placeholder="Nombre, entrenador o sala"></label>
        <label>Día<select [(ngModel)]="diaClase" (ngModelChange)="seleccionarDiaClase($event)"><option value="">Todos</option><option *ngFor="let d of diasSemana" [value]="d">{{d}}</option></select></label>
        <label>Orden<select [(ngModel)]="ordenClase"><option value="nombre">Nombre</option><option value="dia">Día</option><option value="hora">Hora</option></select></label>
        <button type="button" [class.active]="soloRecomendadas" (click)="alternarSoloRecomendadas()">Solo recomendadas</button>
        <button type="button" (click)="limpiarFiltrosClases()">Limpiar</button>
      </div>
      <div class="tools-list compact">
        <article *ngFor="let c of filtrarClases() | slice:0:5">
          <div><small>{{c.dia_semana}} · {{hora(c.hora_inicio)}}</small><b>{{c.nombre}}</b><span>{{nombreEntrenador(c)}}</span></div>
          <em *ngIf="esRecomendada(c)">RECOMENDADA</em>
        </article>
        <article class="empty" *ngIf="!filtrarClases().length"><b>No hay clases con esos filtros.</b></article>
      </div>
      <div class="tools-foot"><span>{{resumenProximaClase()}}</span><button type="button" (click)="copiarResumenClase()">Copiar próxima clase</button></div>
    </section>

    <section class="client-tools" *ngIf="modulo==='reservas'" data-capability-group="111-120">
      <div class="tools-head"><div><span>ORGANIZADOR</span><h2>Controla tus reservas</h2></div><b>{{contarReservasResultado()}} visibles</b></div>
      <div class="tools-controls">
        <label>Buscar<input [(ngModel)]="busquedaReserva" placeholder="Nombre de clase"></label>
        <label>Estado<select [(ngModel)]="estadoReserva"><option value="">Todas</option><option value="Reservada">Activas</option><option value="Asistio">Asistidas</option><option value="Cancelada">Canceladas</option></select></label>
        <label>Orden<select [(ngModel)]="ordenReserva"><option value="reciente">Más recientes</option><option value="antigua">Más antiguas</option></select></label>
        <button type="button" (click)="limpiarFiltrosReservas()">Limpiar</button>
        <button type="button" (click)="exportarReservasCsv()">Exportar CSV</button>
      </div>
      <div class="tools-kpis">
        <article><small>ACTIVAS</small><b>{{mostrarReservasActivas().length}}</b></article>
        <article><small>ASISTIDAS</small><b>{{mostrarReservasAsistidas().length}}</b></article>
        <article><small>CANCELADAS</small><b>{{mostrarReservasCanceladas().length}}</b></article>
      </div>
      <div class="tools-list">
        <article *ngFor="let r of filtrarReservas() | slice:0:6"><div><small>{{fechaCorta(r.fecha_clase)}}</small><b>{{r.clase?.nombre || 'Clase'}}</b></div><em>{{r.estado}}</em></article>
        <article class="empty" *ngIf="!filtrarReservas().length"><b>No hay reservas con esos filtros.</b></article>
      </div>
      <div class="tools-foot"><span>Próxima: {{proximaReserva()?.clase?.nombre || 'Sin reserva próxima'}}</span></div>
    </section>

    <section class="client-tools" *ngIf="modulo==='asistencias'" data-capability-group="121-130">
      <div class="tools-head"><div><span>ACTIVIDAD</span><h2>Analiza tus visitas</h2></div><b>{{filtrarAsistencias().length}} registros</b></div>
      <div class="tools-controls">
        <label>Periodo<select [(ngModel)]="periodoAsistencia"><option value="">Todo</option><option value="mes">Este mes</option></select></label>
        <label>Estado<select [(ngModel)]="estadoAsistencia"><option value="">Todas</option><option value="completada">Completadas</option><option value="abierta">En curso</option></select></label>
        <label>Orden<select [(ngModel)]="ordenAsistencia"><option value="reciente">Más recientes</option><option value="antigua">Más antiguas</option></select></label>
        <button type="button" (click)="limpiarFiltrosAsistencias()">Limpiar</button>
        <button type="button" (click)="exportarAsistenciasCsv()">Exportar CSV</button>
      </div>
      <div class="tools-kpis">
        <article><small>ESTE MES</small><b>{{mostrarAsistenciasMes().length}}</b></article>
        <article><small>MINUTOS</small><b>{{minutosTotalesAsistencia()}}</b></article>
        <article><small>PROMEDIO</small><b>{{promedioMinutosAsistencia()}} min</b></article>
      </div>
      <div class="tools-list">
        <article *ngFor="let a of filtrarAsistencias() | slice:0:6"><div><small>{{fechaCorta(a.fecha_hora_entrada)}}</small><b>{{a.fecha_hora_salida ? 'Visita completada' : 'Ingreso abierto'}}</b></div><em>{{duracionMinutos(a)}} min</em></article>
        <article class="empty" *ngIf="!filtrarAsistencias().length"><b>No hay asistencias con esos filtros.</b></article>
      </div>
    </section>

    <section class="client-tools" *ngIf="modulo==='pagos'" data-capability-group="131-140">
      <div class="tools-head"><div><span>FINANZAS PERSONALES</span><h2>Revisa tus pagos</h2></div><b>S/ {{montoTotalPagado() | number:'1.2-2'}}</b></div>
      <div class="tools-controls">
        <label>Buscar<input [(ngModel)]="busquedaPago" placeholder="Plan u operación"></label>
        <label>Estado<select [(ngModel)]="estadoPago"><option value="">Todos</option><option value="Completado">Completados</option><option value="Pendiente">Pendientes</option><option value="Cancelado">Cancelados</option></select></label>
        <label>Orden<select [(ngModel)]="ordenPago"><option value="reciente">Más recientes</option><option value="antigua">Más antiguos</option></select></label>
        <button type="button" (click)="limpiarFiltrosPagos()">Limpiar</button>
        <button type="button" (click)="exportarPagosCsv()">Exportar CSV</button>
      </div>
      <div class="tools-kpis">
        <article><small>COMPLETADOS</small><b>{{mostrarPagosCompletados().length}}</b></article>
        <article><small>PENDIENTES</small><b>{{mostrarPagosPendientes().length}}</b></article>
        <article><small>CANCELADOS</small><b>{{mostrarPagosCancelados().length}}</b></article>
      </div>
      <div class="tools-list">
        <article *ngFor="let p of filtrarPagos() | slice:0:6"><div><small>{{fechaCorta(p.fecha_pago)}}</small><b>{{nombrePlanPago(p)}}</b><span>{{p.numero_operacion || 'Sin operación'}}</span></div><em>S/ {{p.monto | number:'1.2-2'}}</em></article>
        <article class="empty" *ngIf="!filtrarPagos().length"><b>No hay pagos con esos filtros.</b></article>
      </div>
      <div class="tools-foot"><span>Último pago: {{ultimoPagoCompletadoHerramienta() ? fechaCorta(ultimoPagoCompletadoHerramienta().fecha_pago) : 'Sin pagos completados'}}</span></div>
    </section>

    <section class="client-tools" *ngIf="modulo==='perfil'" data-capability-group="141-150">
      <div class="tools-head"><div><span>RESUMEN DE CUENTA</span><h2>Tu información de usuario</h2></div><b>{{porcentajePerfil()}}% completo</b></div>
      <div class="profile-progress"><i [style.width.%]="porcentajePerfil()"></i></div>
      <p class="missing" *ngIf="camposFaltantesPerfil().length">Falta completar: {{camposFaltantesPerfil().join(', ')}}</p>
      <p class="missing ok" *ngIf="!camposFaltantesPerfil().length">Tus datos principales están completos.</p>
      <div class="profile-copy-grid">
        <button type="button" (click)="copiarDni()"><small>DNI</small><b>{{perfil?.dni || '-'}}</b><span>Copiar</span></button>
        <button type="button" (click)="copiarCorreo()"><small>CORREO</small><b>{{perfil?.correo || '-'}}</b><span>Copiar</span></button>
        <button type="button" (click)="copiarTelefono()"><small>TELÉFONO</small><b>{{perfil?.telefono || '-'}}</b><span>Copiar</span></button>
        <button type="button" (click)="copiarDireccion()"><small>DIRECCIÓN</small><b>{{perfil?.direccion || '-'}}</b><span>Copiar</span></button>
      </div>
      <div class="tools-kpis">
        <article><small>MEMBRESÍA</small><b>{{estadoMembresiaHerramienta()}}</b></article>
        <article><small>DÍAS RESTANTES</small><b>{{diasRestantesMembresiaHerramienta()}}</b></article>
      </div>
      <div class="tools-foot"><button type="button" (click)="copiarResumenCuenta()">Copiar resumen</button><button type="button" (click)="exportarResumenCuenta()">Exportar resumen</button></div>
    </section>
  `,
  styles: [`
    :host{display:block}.client-tools{margin:28px 0 0;padding:22px;border:1px solid rgba(255,255,255,.09);background:#0d1115;color:#fff}
    .tools-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-end;margin-bottom:16px}.tools-head span{color:#ff3150;font-size:10px;font-weight:900;letter-spacing:1.4px}.tools-head h2{margin:4px 0 0;font-size:24px}.tools-head>b{color:#fff;font-size:15px}
    .tools-controls{display:grid;grid-template-columns:2fr 1fr 1fr auto auto;gap:8px;margin-bottom:16px}.tools-controls label{display:grid;gap:5px;color:#9ca5ad;font-size:10px;font-weight:800}.tools-controls input,.tools-controls select,.tools-controls button{min-height:40px;border:1px solid #273039;background:#11171c;color:#fff;padding:0 11px}.tools-controls button{align-self:end;cursor:pointer;font-weight:800}.tools-controls button.active{border-color:#ff3150;color:#ff3150}
    .tools-list{display:grid;gap:7px}.tools-list article{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:11px 13px;border:1px solid #202830;background:#10151a}.tools-list article div{display:grid;gap:2px}.tools-list small,.tools-list span{color:#89939b;font-size:10px}.tools-list b{font-size:13px}.tools-list em{color:#ff3150;font-size:10px;font-style:normal;font-weight:900}.tools-list .empty{justify-content:center;color:#8f99a1}
    .tools-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}.tools-kpis article{padding:13px;border:1px solid #202830;background:#10151a}.tools-kpis small{display:block;color:#8f99a1;font-size:9px}.tools-kpis b{display:block;margin-top:5px;font-size:18px}
    .tools-foot{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:14px;color:#a8b0b7;font-size:11px}.tools-foot button{border:1px solid #333d45;background:#151b20;color:#fff;padding:9px 12px;cursor:pointer;font-weight:800}
    .profile-progress{height:7px;background:#202830;margin:8px 0 10px}.profile-progress i{display:block;height:100%;background:#ff3150}.missing{color:#aab2b8;font-size:12px}.missing.ok{color:#d6dde2}.profile-copy-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:14px 0}.profile-copy-grid button{display:grid;text-align:left;gap:4px;padding:12px;border:1px solid #202830;background:#10151a;color:#fff;cursor:pointer}.profile-copy-grid small,.profile-copy-grid span{color:#8f99a1;font-size:9px}.profile-copy-grid b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    @media(max-width:850px){.tools-controls{grid-template-columns:1fr 1fr}.tools-head{align-items:flex-start;flex-direction:column}.profile-copy-grid,.tools-kpis{grid-template-columns:1fr}.tools-foot{align-items:stretch;flex-direction:column}.tools-foot button{width:100%}}
  `]
})
export class ClienteHerramientasComponent {
  @Input() modulo='';
  @Input() clases:any[]=[];
  @Input() reservas:any[]=[];
  @Input() asistencias:any[]=[];
  @Input() pagos:any[]=[];
  @Input() perfil:any={};
  @Input() membresiaActual:any=null;
  @Input() enfoque='';

  busquedaClase=''; diaClase=''; ordenClase='nombre'; soloRecomendadas=false;
  busquedaReserva=''; estadoReserva=''; ordenReserva='reciente';
  periodoAsistencia=''; estadoAsistencia=''; ordenAsistencia='reciente';
  busquedaPago=''; estadoPago=''; ordenPago='reciente';
  diasSemana=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

  filtrarClases():any[]{let x=[...(this.clases||[])];const q=this.busquedaClase.trim().toLowerCase();if(q)x=x.filter(c=>[c?.nombre,c?.sala,c?.entrenador?.nombres,c?.entrenador?.apellidos].some(v=>String(v||'').toLowerCase().includes(q)));if(this.diaClase)x=x.filter(c=>c?.dia_semana===this.diaClase);if(this.soloRecomendadas)x=x.filter(c=>this.esRecomendada(c));return this.ordenClase==='dia'?this.ordenarClasesPorDia(x):this.ordenClase==='hora'?this.ordenarClasesPorHora(x):this.ordenarClasesPorNombre(x);}
  alternarSoloRecomendadas():void{this.soloRecomendadas=!this.soloRecomendadas;}
  seleccionarDiaClase(dia:string):string{this.diaClase=dia||'';return this.diaClase;}
  ordenarClasesPorNombre(items:any[]=this.clases):any[]{return [...(items||[])].sort((a,b)=>String(a?.nombre||'').localeCompare(String(b?.nombre||''),'es'));}
  ordenarClasesPorDia(items:any[]=this.clases):any[]{return [...(items||[])].sort((a,b)=>{const ia=this.diasSemana.indexOf(a?.dia_semana);const ib=this.diasSemana.indexOf(b?.dia_semana);return (ia<0?99:ia)-(ib<0?99:ib);});}
  ordenarClasesPorHora(items:any[]=this.clases):any[]{return [...(items||[])].sort((a,b)=>String(a?.hora_inicio||'').localeCompare(String(b?.hora_inicio||'')));}
  contarClasesResultado():number{return this.filtrarClases().length;}
  limpiarFiltrosClases():void{this.busquedaClase='';this.diaClase='';this.ordenClase='nombre';this.soloRecomendadas=false;}
  resumenProximaClase():string{const c=this.filtrarClases()[0];return c?('Próxima opción: '+c.nombre+' · '+(c.dia_semana||'')+' '+this.hora(c.hora_inicio)):'No hay una clase disponible con estos filtros.';}
  copiarResumenClase():void{this.copiarTexto(this.resumenProximaClase());}

  filtrarReservas():any[]{let x=[...(this.reservas||[])];const q=this.busquedaReserva.trim().toLowerCase();if(q)x=x.filter(r=>String(r?.clase?.nombre||'').toLowerCase().includes(q));if(this.estadoReserva)x=x.filter(r=>normalizeStatus(r?.estado)===normalizeStatus(this.estadoReserva));return this.ordenReserva==='antigua'?this.ordenarReservasAntiguas(x):this.ordenarReservasRecientes(x);}
  mostrarReservasActivas():any[]{return (this.reservas||[]).filter(r=>normalizeStatus(r?.estado)==='reservada');}
  mostrarReservasAsistidas():any[]{return (this.reservas||[]).filter(r=>normalizeStatus(r?.estado)==='asistio');}
  mostrarReservasCanceladas():any[]{return (this.reservas||[]).filter(r=>normalizeStatus(r?.estado)==='cancelada');}
  ordenarReservasRecientes(items:any[]=this.reservas):any[]{return [...(items||[])].sort((a,b)=>this.time(b?.fecha_clase)-this.time(a?.fecha_clase));}
  ordenarReservasAntiguas(items:any[]=this.reservas):any[]{return [...(items||[])].sort((a,b)=>this.time(a?.fecha_clase)-this.time(b?.fecha_clase));}
  proximaReserva():any{return this.mostrarReservasActivas().filter(r=>this.time(r?.fecha_clase)>=this.inicioHoy()).sort((a,b)=>this.time(a?.fecha_clase)-this.time(b?.fecha_clase))[0]||null;}
  contarReservasResultado():number{return this.filtrarReservas().length;}
  limpiarFiltrosReservas():void{this.busquedaReserva='';this.estadoReserva='';this.ordenReserva='reciente';}
  exportarReservasCsv():void{this.descargarCsv('mis-reservas.csv',['Clase,Fecha,Estado',...this.filtrarReservas().map(r=>[r?.clase?.nombre,r?.fecha_clase,r?.estado].map(v=>this.csv(v)).join(','))]);}

  filtrarAsistencias():any[]{let x=[...(this.asistencias||[])];if(this.periodoAsistencia==='mes')x=this.mostrarAsistenciasMes();if(this.estadoAsistencia==='completada')x=x.filter(a=>!!a?.fecha_hora_salida);if(this.estadoAsistencia==='abierta')x=x.filter(a=>!a?.fecha_hora_salida);return this.ordenAsistencia==='antigua'?this.ordenarAsistenciasAntiguas(x):this.ordenarAsistenciasRecientes(x);}
  mostrarAsistenciasMes():any[]{const h=new Date();return (this.asistencias||[]).filter(a=>{const d=parseLocalDate(a?.fecha_hora_entrada);return !!d&&d.getFullYear()===h.getFullYear()&&d.getMonth()===h.getMonth();});}
  mostrarAsistenciasCompletadas():any[]{return (this.asistencias||[]).filter(a=>!!a?.fecha_hora_salida);}
  mostrarAsistenciasAbiertas():any[]{return (this.asistencias||[]).filter(a=>a?.fecha_hora_entrada&&!a?.fecha_hora_salida);}
  ordenarAsistenciasRecientes(items:any[]=this.asistencias):any[]{return [...(items||[])].sort((a,b)=>this.time(b?.fecha_hora_entrada)-this.time(a?.fecha_hora_entrada));}
  ordenarAsistenciasAntiguas(items:any[]=this.asistencias):any[]{return [...(items||[])].sort((a,b)=>this.time(a?.fecha_hora_entrada)-this.time(b?.fecha_hora_entrada));}
  minutosTotalesAsistencia():number{return this.mostrarAsistenciasMes().reduce((s,a)=>s+this.duracionMinutos(a),0);}
  promedioMinutosAsistencia():number{const x=this.mostrarAsistenciasMes();return x.length?Math.round(this.minutosTotalesAsistencia()/x.length):0;}
  limpiarFiltrosAsistencias():void{this.periodoAsistencia='';this.estadoAsistencia='';this.ordenAsistencia='reciente';}
  exportarAsistenciasCsv():void{this.descargarCsv('mis-asistencias.csv',['Entrada,Salida,Minutos',...this.filtrarAsistencias().map(a=>[a?.fecha_hora_entrada,a?.fecha_hora_salida||'',this.duracionMinutos(a)].map(v=>this.csv(v)).join(','))]);}

  filtrarPagos():any[]{let x=[...(this.pagos||[])];const q=this.busquedaPago.trim().toLowerCase();if(q)x=x.filter(p=>[this.nombrePlanPago(p),p?.numero_operacion].some(v=>String(v||'').toLowerCase().includes(q)));if(this.estadoPago)x=x.filter(p=>normalizeStatus(p?.estado_pago)===normalizeStatus(this.estadoPago));return this.ordenPago==='antigua'?this.ordenarPagosAntiguos(x):this.ordenarPagosRecientes(x);}
  mostrarPagosCompletados():any[]{return (this.pagos||[]).filter(p=>normalizeStatus(p?.estado_pago)==='completado');}
  mostrarPagosPendientes():any[]{return (this.pagos||[]).filter(p=>normalizeStatus(p?.estado_pago)==='pendiente');}
  mostrarPagosCancelados():any[]{return (this.pagos||[]).filter(p=>normalizeStatus(p?.estado_pago)==='cancelado');}
  ordenarPagosRecientes(items:any[]=this.pagos):any[]{return [...(items||[])].sort((a,b)=>this.time(b?.fecha_pago)-this.time(a?.fecha_pago));}
  ordenarPagosAntiguos(items:any[]=this.pagos):any[]{return [...(items||[])].sort((a,b)=>this.time(a?.fecha_pago)-this.time(b?.fecha_pago));}
  montoTotalPagado():number{return this.mostrarPagosCompletados().reduce((s,p)=>s+Math.max(0,Number(p?.monto||0)),0);}
  ultimoPagoCompletadoHerramienta():any{return this.ordenarPagosRecientes(this.mostrarPagosCompletados())[0]||null;}
  limpiarFiltrosPagos():void{this.busquedaPago='';this.estadoPago='';this.ordenPago='reciente';}
  exportarPagosCsv():void{this.descargarCsv('mis-pagos.csv',['Plan,Fecha,Estado,Monto,Operacion',...this.filtrarPagos().map(p=>[this.nombrePlanPago(p),p?.fecha_pago,p?.estado_pago,p?.monto,p?.numero_operacion||''].map(v=>this.csv(v)).join(','))]);}

  porcentajePerfil():number{const keys=['nombres','apellidos','correo','telefono','direccion'];return Math.round(keys.filter(k=>String(this.perfil?.[k]||'').trim()).length/keys.length*100);}
  camposFaltantesPerfil():string[]{const map:any={nombres:'nombres',apellidos:'apellidos',correo:'correo',telefono:'teléfono',direccion:'dirección'};return Object.keys(map).filter(k=>!String(this.perfil?.[k]||'').trim()).map(k=>map[k]);}
  copiarDni():void{this.copiarTexto(this.perfil?.dni||'');}
  copiarCorreo():void{this.copiarTexto(this.perfil?.correo||'');}
  copiarTelefono():void{this.copiarTexto(this.perfil?.telefono||'');}
  copiarDireccion():void{this.copiarTexto(this.perfil?.direccion||'');}
  diasRestantesMembresiaHerramienta():number{if(!this.membresiaActual?.fecha_fin)return 0;const fin=parseLocalDate(String(this.membresiaActual.fecha_fin).slice(0,10)+'T23:59:59');return fin?Math.max(0,Math.ceil((fin.getTime()-Date.now())/86400000)):0;}
  estadoMembresiaHerramienta():string{if(!this.membresiaActual)return'Sin membresía';return this.diasRestantesMembresiaHerramienta()>0?'Activa':'Vencida';}
  copiarResumenCuenta():void{this.copiarTexto(this.resumenCuenta());}
  exportarResumenCuenta():void{this.descargarTexto('resumen-cuenta-mallqui.txt',this.resumenCuenta(),'text/plain;charset=utf-8');}

  esRecomendada(c:any):boolean{const n=String(c?.nombre||'').toLowerCase();const o=String(this.enfoque||'').toLowerCase();const grupos:any={cardiovascular:['cardio','spinning','zumba','aerob'],'masa muscular':['fuerza','pesas','muscul'],'tonificación':['funcional','tonific'],'tonificacion':['funcional','tonific'],crossfit:['crossfit','funcional'],'pérdida de peso':['cardio','zumba','spinning','funcional'],'perdida de peso':['cardio','zumba','spinning','funcional']};return (grupos[o]||[]).some((x:string)=>n.includes(x));}
  nombreEntrenador(c:any):string{return [c?.entrenador?.nombres,c?.entrenador?.apellidos].filter(Boolean).join(' ')||'Entrenador por confirmar';}
  nombrePlanPago(p:any):string{return p?.cliente_membresia?.membresia?.nombre||p?.membresia?.nombre||'Membresía';}
  hora(v:any):string{return String(v||'--:--').slice(0,5);}
  fechaCorta(v:any):string{if(!v)return'-';const d=parseLocalDate(v);return d?d.toLocaleDateString('es-PE'):String(v);}
  duracionMinutos(a:any):number{if(!a?.fecha_hora_entrada)return 0;const i=parseLocalDate(a.fecha_hora_entrada);const f=a?.fecha_hora_salida?parseLocalDate(a.fecha_hora_salida):new Date();if(!i||!f)return 0;return Math.max(0,Math.floor((f.getTime()-i.getTime())/60000));}
  resumenCuenta():string{return ['MALLQUI GYM - RESUMEN DE CUENTA','Nombre: '+[this.perfil?.nombres,this.perfil?.apellidos].filter(Boolean).join(' '),'DNI: '+(this.perfil?.dni||'-'),'Correo: '+(this.perfil?.correo||'-'),'Teléfono: '+(this.perfil?.telefono||'-'),'Membresía: '+this.estadoMembresiaHerramienta(),'Días restantes: '+this.diasRestantesMembresiaHerramienta()].join('\n');}
  private inicioHoy():number{const d=new Date();d.setHours(0,0,0,0);return d.getTime();}
  private time(v:any):number{return safeTime(v);}
  private csv(v:any):string{return '"'+String(v??'').replace(/"/g,'""')+'"';}
  private copiarTexto(v:any):void{const t=String(v??'');if(navigator?.clipboard?.writeText){navigator.clipboard.writeText(t).catch(()=>this.copiaAlterna(t));}else this.copiaAlterna(t);}
  private copiaAlterna(t:string):void{const x=document.createElement('textarea');x.value=t;x.style.position='fixed';x.style.opacity='0';document.body.appendChild(x);x.select();try{document.execCommand('copy');}catch{}document.body.removeChild(x);}
  private descargarCsv(nombre:string,lineas:string[]):void{this.descargarTexto(nombre,'\uFEFF'+lineas.join('\n'),'text/csv;charset=utf-8');}
  private descargarTexto(nombre:string,contenido:string,tipo:string):void{
    const blob=new Blob([contenido],{type:tipo});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download=nombre;
    a.style.display='none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url),0);
  }
}
