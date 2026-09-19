import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth.service';
import { GymApiService } from '../../../core/services/gym-api.service';

@Component({
  selector:'app-entrenador-panel',
  standalone:true,
  imports:[CommonModule,FormsModule,RouterLink],
  templateUrl:'./entrenador-panel.component.html',
  styleUrl:'./entrenador-panel.component.css'
})
export class EntrenadorPanelComponent implements OnInit{
  seccion='resumen'; cargando=true; error=''; toast=''; resumen:any=null;
  clientes:any[]=[];rutinas:any[]=[];clases:any[]=[];reservas:any[]=[];
  rutinaForm:any={id_cliente:0,id_entrenador:0,nombre_rutina:'',objetivo:'',descripcion:'',fecha_inicio:new Date().toISOString().slice(0,10),fecha_fin:'',estado:'Activo'};
  detalleForm:any={id_rutina:0,ejercicio:'',series:3,repeticiones:12,peso_recomendado:null,descanso_segundos:60,observaciones:''};

  constructor(private api:GymApiService,private auth:AuthService,private router:Router){}
  ngOnInit(){this.cargar();}
  cargar(){this.cargando=true;this.api.cargarPortalEntrenador().subscribe({next:r=>{this.resumen=r.resumen;this.clientes=r.clientes||[];this.rutinas=r.rutinas||[];this.clases=r.clases||[];this.reservas=r.reservas||[];this.rutinaForm.id_entrenador=this.resumen?.entrenador?.id_entrenador||0;this.cargando=false;},error:e=>{this.error=this.err(e);this.cargando=false;}});}
  cambiar(s:string){this.seccion=s;this.error='';}
  crearRutina(){if(!this.rutinaForm.id_cliente){this.error='Selecciona un cliente.';return;}const d={...this.rutinaForm};if(!d.fecha_fin)d.fecha_fin=null;this.api.crearRutina(d).subscribe({next:r=>{this.ok('Rutina creada');this.detalleForm.id_rutina=r.id_rutina;this.rutinaForm={id_cliente:0,id_entrenador:this.resumen?.entrenador?.id_entrenador||0,nombre_rutina:'',objetivo:'',descripcion:'',fecha_inicio:new Date().toISOString().slice(0,10),fecha_fin:'',estado:'Activo'};this.cargar();},error:e=>this.error=this.err(e)});}
  agregarEjercicio(){if(!this.detalleForm.id_rutina||!this.detalleForm.ejercicio.trim()){this.error='Selecciona rutina y escribe el ejercicio.';return;}this.api.crearDetalleRutina(this.detalleForm).subscribe({next:()=>{this.ok('Ejercicio agregado');this.detalleForm={id_rutina:this.detalleForm.id_rutina,ejercicio:'',series:3,repeticiones:12,peso_recomendado:null,descanso_segundos:60,observaciones:''};this.cargar();},error:e=>this.error=this.err(e)});}
  estadoReserva(id:number,estado:string){this.api.cambiarEstadoReserva(id,estado).subscribe({next:()=>{this.ok('Reserva actualizada');this.cargar();},error:e=>this.error=this.err(e)});}
  cerrarSesion(){this.auth.logout().subscribe({next:()=>{this.auth.limpiarSesion();this.router.navigate(['/login']);},error:()=>{this.auth.limpiarSesion();this.router.navigate(['/login']);}});}
  nombre(p:any){return p?`${p.nombres||''} ${p.apellidos||''}`.trim():'-';}
  ok(m:string){this.error='';this.toast='✓ '+m;setTimeout(()=>this.toast='',2500);}
  err(e:any){const er=e?.error?.errors;if(er){const p=Object.values(er)[0];if(Array.isArray(p))return String(p[0]);}return e?.error?.mensaje??e?.error?.message??'No se pudo completar la operación.';}
}
