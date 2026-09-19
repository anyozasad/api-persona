import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth.service';
import { GymApiService } from '../../../core/services/gym-api.service';

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
          <a role="button" [class.active]="moduloActivo==='rutinas'" (click)="abrirModulo('rutinas')">🏋 Rutinas</a>
          <a role="button" [class.active]="moduloActivo==='clases'" (click)="abrirModulo('clases')">▣ Clases</a>
          <a role="button" [class.active]="moduloActivo==='reservas'" (click)="abrirModulo('reservas')">◷ Reservas</a>
          <a role="button" [class.active]="moduloActivo==='asistencias'" (click)="abrirModulo('asistencias')">✓ Asistencias</a>
          <a role="button" [class.active]="moduloActivo==='pagos'" (click)="abrirModulo('pagos')">▤ Pagos</a>
          <a role="button" [class.active]="moduloActivo==='perfil'" (click)="abrirModulo('perfil')">♙ Perfil</a>
        </nav>
        <button class="primary-button small" type="button" (click)="cerrarSesion()">Cerrar sesión</button>
      </header>

      <main class="member-main" *ngIf="!cargando; else cargandoTpl">
        <div *ngIf="error" class="member-toast">{{error}}</div>
        <div *ngIf="toast" class="member-toast">{{toast}}</div>

        <section *ngIf="moduloActivo==='inicio'">
          <section class="member-welcome">
            <div>
              <span class="eyebrow">PORTAL DEL CLIENTE</span>
              <h1>Hola, {{nombreCorto}}</h1>
              <p>Tu información se carga directamente desde Laravel y MySQL.</p>
            </div>
            <aside class="coach-card">
              <span class="coach-title">Entrenador asignado</span>
              <div class="coach-body"><div><h3>{{nombreEntrenador}}</h3><p>{{rutinaActual?.objetivo || 'Sin objetivo registrado'}}</p></div></div>
            </aside>
          </section>

          <section class="member-stats">
            <article><span>✦ Membresía</span><h2>{{membresiaActual?.membresia?.nombre || 'Sin plan activo'}}</h2><p *ngIf="membresiaActual">Vence: {{membresiaActual.fecha_fin}}</p></article>
            <article><span>▣ Asistencias este mes</span><h2>{{resumen?.asistencias_mes || 0}}</h2><p>Registros reales del sistema</p></article>
            <article><span>🏋 Rutinas</span><h2>{{rutinas.length}}</h2><p>{{rutinaActual?.nombre_rutina || 'Sin rutina activa'}}</p></article>
            <article><span>◷ Reservas activas</span><h2>{{reservasActivas.length}}</h2><p>Clases reservadas</p></article>
          </section>

          <section class="member-grid">
            <article class="module-card">
              <h2>Próxima rutina</h2>
              <ng-container *ngIf="rutinaActual; else sinRutina">
                <h3>{{rutinaActual.nombre_rutina}}</h3>
                <p>{{rutinaActual.descripcion || rutinaActual.objetivo}}</p>
                <div class="card-actions"><button class="primary" (click)="abrirModulo('rutinas')">Ver ejercicios</button></div>
              </ng-container>
              <ng-template #sinRutina><p>Tu entrenador todavía no ha asignado una rutina activa.</p></ng-template>
            </article>
            <article class="module-card">
              <h2>Últimos pagos</h2>
              <p *ngIf="!pagos.length">Todavía no hay pagos registrados.</p>
              <div *ngFor="let p of pagos.slice(0,3)" class="payment-row">
                <p><b>{{p.cliente_membresia?.membresia?.nombre || 'Membresía'}}</b><small>{{fecha(p.fecha_pago)}}</small></p>
                <span>S/ {{p.monto}}</span><span>{{p.estado_pago}}</span>
              </div>
            </article>
          </section>
        </section>

        <section *ngIf="moduloActivo==='rutinas'" class="member-module">
          <div class="member-module-head"><div><h1>Mis rutinas</h1><p>Rutinas asignadas por tu entrenador.</p></div></div>
          <div class="module-grid">
            <article class="module-card" *ngFor="let r of rutinas">
              <h2>{{r.nombre_rutina}}</h2><p>{{r.objetivo}}</p><small>{{r.fecha_inicio}} - {{r.fecha_fin || 'Sin fecha final'}}</small>
              <div class="routine-exercises">
                <div *ngFor="let e of r.detalles"><p><b>{{e.ejercicio}}</b><small>{{e.series}} series × {{e.repeticiones}} reps · descanso {{e.descanso_segundos || 0}} s</small></p></div>
              </div>
            </article>
            <article class="module-card" *ngIf="!rutinas.length"><p>No tienes rutinas registradas.</p></article>
          </div>
        </section>

        <section *ngIf="moduloActivo==='clases'" class="member-module">
          <div class="member-module-head"><div><h1>Clases disponibles</h1><p>Selecciona una fecha válida para reservar.</p></div></div>
          <div class="class-list">
            <div class="class-row" *ngFor="let c of clases">
              <p><b>{{c.nombre}}</b><small>{{c.dia_semana}} · {{c.hora_inicio}} - {{c.hora_fin}}</small><small>Entrenador: {{nombrePersona(c.entrenador)}}</small></p>
              <input type="date" [(ngModel)]="fechasReserva[c.id_clase]" [name]="'fecha'+c.id_clase">
              <button type="button" (click)="reservar(c)">Reservar</button>
            </div>
          </div>
        </section>

        <section *ngIf="moduloActivo==='reservas'" class="member-module">
          <div class="member-module-head"><div><h1>Mis reservas</h1><p>Reservas almacenadas en MySQL.</p></div></div>
          <div class="class-list">
            <div class="class-row" *ngFor="let r of reservas">
              <p><b>{{r.clase?.nombre}}</b><small>{{r.fecha_clase}} · {{r.clase?.hora_inicio}}</small><small>Estado: {{r.estado}}</small></p>
              <button *ngIf="r.estado==='Reservada'" class="reserved" type="button" (click)="cancelarReserva(r)">Cancelar</button>
            </div>
          </div>
        </section>

        <section *ngIf="moduloActivo==='asistencias'" class="member-module">
          <div class="member-module-head"><div><h1>Mis asistencias</h1><p>Historial de entradas y salidas.</p></div></div>
          <div class="payment-list">
            <div class="payment-row" *ngFor="let a of asistencias"><p><b>{{fecha(a.fecha_hora_entrada)}}</b><small>Salida: {{fecha(a.fecha_hora_salida)}}</small></p><span>{{a.estado}}</span></div>
          </div>
        </section>

        <section *ngIf="moduloActivo==='pagos'" class="member-module">
          <div class="member-module-head"><div><h1>Membresía y pagos</h1><p>Solicita una renovación y consulta comprobantes reales.</p></div></div>
          <section class="management-grid">
            <article class="module-card">
              <h2>Solicitar renovación</h2>
              <form class="profile-form" (ngSubmit)="solicitarRenovacion()">
                <label>Plan<select [(ngModel)]="pagoForm.id_membresia" name="planPago" required><option [ngValue]="0">Seleccionar</option><option *ngFor="let m of membresiasDisponibles" [ngValue]="m.id_membresia">{{m.nombre}} - S/ {{m.precio}}</option></select></label>
                <label>Inicio<input type="date" [(ngModel)]="pagoForm.fecha_inicio" name="fechaPago"></label>
                <label>Método<select [(ngModel)]="pagoForm.metodo_pago" name="metodoPago"><option>Yape</option><option>Plin</option><option>Transferencia</option><option>Tarjeta</option></select></label>
                <label>N° operación<input [(ngModel)]="pagoForm.numero_operacion" name="operacionPago" required></label>
                <button class="save-profile" type="submit">Enviar solicitud</button>
              </form>
            </article>
            <article class="module-card">
              <h2>Historial</h2>
              <div class="payment-list"><div class="payment-row" *ngFor="let p of pagos"><p><b>{{p.cliente_membresia?.membresia?.nombre || 'Membresía'}}</b><small>{{fecha(p.fecha_pago)}}</small></p><span>S/ {{p.monto}}</span><span>{{p.metodo_pago}}</span><div><span class="status">{{p.estado_pago}}</span><button type="button" (click)="comprobante(p)">Comprobante</button></div></div></div>
            </article>
          </section>
        </section>

        <section *ngIf="moduloActivo==='perfil'" class="member-module">
          <div class="member-module-head"><div><h1>Mi perfil</h1><p>Actualiza tus datos personales.</p></div></div>
          <article class="module-card">
            <form class="profile-form" (ngSubmit)="guardarPerfil()">
              <label>Nombres<input [(ngModel)]="perfil.nombres" name="nombres" required></label>
              <label>Apellidos<input [(ngModel)]="perfil.apellidos" name="apellidos" required></label>
              <label>Correo<input type="email" [(ngModel)]="perfil.correo" name="correo" required></label>
              <label>Teléfono<input [(ngModel)]="perfil.telefono" name="telefono"></label>
              <label class="full">Dirección<input [(ngModel)]="perfil.direccion" name="direccion"></label>
              <button class="save-profile" type="submit">Guardar cambios</button>
            </form>
          </article>
        </section>
      </main>

      <ng-template #cargandoTpl><main class="member-main"><article class="module-card"><h2>Cargando información real...</h2></article></main></ng-template>
    </div>
  `,
  styles: [`
    .member-main,.member-module{padding-bottom:40px}.member-module{padding:34px}.class-row input{max-width:170px;padding:10px;border:1px solid #ddd;border-radius:8px}.management-grid{display:grid;grid-template-columns:1fr 1.4fr;gap:22px}.routine-exercises{margin-top:14px}.routine-exercises>div{padding:10px 0;border-top:1px solid #eee}@media(max-width:900px){.management-grid{grid-template-columns:1fr}.member-topbar nav{overflow:auto}.member-module{padding:20px}}
  `]
})
export class UsuarioComponent implements OnInit {
  moduloActivo='inicio'; cargando=true; error=''; toast='';
  resumen:any=null; perfil:any={}; membresiaActual:any=null; membresiasDisponibles:any[]=[];
  pagos:any[]=[]; rutinas:any[]=[]; asistencias:any[]=[]; reservas:any[]=[]; clases:any[]=[]; compras:any[]=[];
  fechasReserva:Record<number,string>={};
  pagoForm:any={id_membresia:0,fecha_inicio:new Date().toISOString().slice(0,10),metodo_pago:'Yape',numero_operacion:''};

  constructor(private api:GymApiService, private auth:AuthService, private router:Router){}

  ngOnInit():void{ this.cargar(); }

  cargar():void{
    this.cargando=true; this.error='';
    this.api.cargarPortalCliente().subscribe({
      next:r=>{this.resumen=r.resumen;this.perfil={...r.perfil};this.membresiaActual=r.membresia?.actual;this.membresiasDisponibles=r.membresiasDisponibles||[];this.pagos=r.pagos||[];this.rutinas=r.rutinas||[];this.asistencias=r.asistencias||[];this.reservas=r.reservas||[];this.clases=(r.clases||[]).filter((x:any)=>x.estado==='Activo');this.compras=r.compras||[];this.cargando=false;},
      error:e=>{this.error=this.errorApi(e);this.cargando=false;}
    });
  }
  abrirModulo(m:string){this.moduloActivo=m;window.scrollTo({top:0,behavior:'smooth'});}
  get nombreCorto():string{return this.perfil?.nombres || this.auth.usuario?.nombres || 'Miembro';}
  get rutinaActual():any{return this.resumen?.rutina_actual || this.rutinas.find(r=>r.estado==='Activo') || null;}
  get nombreEntrenador():string{return this.nombrePersona(this.rutinaActual?.entrenador) || 'Sin entrenador asignado';}
  get reservasActivas():any[]{return this.reservas.filter(r=>r.estado==='Reservada');}
  nombrePersona(p:any):string{return p?[`${p.nombres||''}`,`${p.apellidos||''}`].join(' ').trim():'-';}
  fecha(v:any):string{if(!v)return '-';const d=new Date(v);return isNaN(d.getTime())?String(v):d.toLocaleString('es-PE');}

  guardarPerfil(){this.api.actualizarPerfilCliente(this.perfil).subscribe({next:r=>{this.perfil={...r.cliente};this.ok('Perfil actualizado');},error:e=>this.error=this.errorApi(e)});}
  reservar(c:any){const f=this.fechasReserva[c.id_clase];if(!f){this.error='Selecciona una fecha para la clase.';return;}this.api.reservarClase(c.id_clase,f).subscribe({next:r=>{this.ok(r.mensaje||'Reserva creada');this.cargarReservas();},error:e=>this.error=this.errorApi(e)});}
  cancelarReserva(r:any){if(!confirm('¿Cancelar esta reserva?'))return;this.api.cancelarReserva(r.id_reserva).subscribe({next:x=>{this.ok(x.mensaje||'Reserva cancelada');this.cargarReservas();},error:e=>this.error=this.errorApi(e)});}
  cargarReservas(){this.api.reservasCliente().subscribe({next:r=>this.reservas=r,error:e=>this.error=this.errorApi(e)});}
  solicitarRenovacion(){if(!this.pagoForm.id_membresia||!this.pagoForm.numero_operacion.trim()){this.error='Selecciona plan e ingresa el número de operación.';return;}this.api.solicitarPago({...this.pagoForm}).subscribe({next:r=>{this.ok(r.mensaje||'Solicitud enviada');this.pagoForm.numero_operacion='';this.api.pagosCliente().subscribe(x=>this.pagos=x);},error:e=>this.error=this.errorApi(e)});}
  comprobante(p:any){this.api.comprobantePagoCliente(p.id_pago).subscribe({next:r=>{const c=r.comprobante;const html=`<html><body style="font-family:Arial;padding:30px"><h2>Mallqui Gym</h2><hr><p><b>Comprobante:</b> ${c.id_pago}</p><p><b>Cliente:</b> ${c.cliente} - DNI ${c.dni}</p><p><b>Membresía:</b> ${c.membresia}</p><p><b>Periodo:</b> ${c.periodo.inicio} a ${c.periodo.fin}</p><p><b>Monto:</b> S/ ${c.monto}</p><p><b>Método:</b> ${c.metodo_pago}</p><p><b>Operación:</b> ${c.numero_operacion||'-'}</p><p><b>Estado:</b> ${c.estado}</p><script>window.print()<\/script></body></html>`;const w=window.open('','_blank');if(w){w.document.write(html);w.document.close();}},error:e=>this.error=this.errorApi(e)});}
  cerrarSesion(){this.auth.logout().subscribe({next:()=>{this.auth.limpiarSesion();this.router.navigate(['/login']);},error:()=>{this.auth.limpiarSesion();this.router.navigate(['/login']);}});}
  ok(m:string){this.error='';this.toast='✓ '+m;setTimeout(()=>this.toast='',2600);}
  errorApi(e:any):string{const er=e?.error?.errors;if(er){const p=Object.values(er)[0];if(Array.isArray(p))return String(p[0]);}return e?.error?.mensaje??e?.error?.message??'No se pudo completar la operación.';}
}
