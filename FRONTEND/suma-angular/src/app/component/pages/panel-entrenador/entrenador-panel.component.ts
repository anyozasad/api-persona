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
  rutinaEditandoId=0;
  detalleEditandoId=0;
  rutinaForm:any={id_cliente:0,id_entrenador:0,nombre_rutina:'',objetivo:'',descripcion:'',fecha_inicio:new Date().toISOString().slice(0,10),fecha_fin:'',estado:'Activo'};
  detalleForm:any={id_rutina:0,ejercicio:'',series:3,repeticiones:12,peso_recomendado:null,descanso_segundos:60,observaciones:''};

  constructor(private api:GymApiService,private auth:AuthService,private router:Router){}
  ngOnInit(){this.cargar();}
  cargar(){this.cargando=true;this.api.cargarPortalEntrenador().subscribe({next:r=>{this.resumen=r.resumen;this.clientes=r.clientes||[];this.rutinas=r.rutinas||[];this.clases=r.clases||[];this.reservas=r.reservas||[];this.rutinaForm.id_entrenador=this.resumen?.entrenador?.id_entrenador||0;this.cargando=false;},error:e=>{this.error=this.err(e);this.cargando=false;}});}
  cambiar(s:string){this.seccion=s;this.error='';}
  crearRutina(){
    if(!this.rutinaForm.id_cliente){this.error='Selecciona un cliente.';return;}
    const d={...this.rutinaForm};
    if(!d.fecha_fin)d.fecha_fin=null;
    const req=this.rutinaEditandoId
      ? this.api.actualizarRutina(this.rutinaEditandoId,d)
      : this.api.crearRutina(d);

    req.subscribe({
      next:r=>{
        const id=Number(r?.id_rutina||this.rutinaEditandoId||0);
        this.ok(this.rutinaEditandoId?'Rutina actualizada':'Rutina creada');
        this.cancelarEdicionRutina();
        if(id)this.detalleForm.id_rutina=id;
        this.cargar();
      },
      error:e=>this.error=this.err(e)
    });
  }

  editarRutina(r:any){
    this.rutinaEditandoId=Number(r?.id_rutina||0);
    this.rutinaForm={
      id_cliente:Number(r?.id_cliente||0),
      id_entrenador:Number(r?.id_entrenador||this.resumen?.entrenador?.id_entrenador||0),
      nombre_rutina:String(r?.nombre_rutina||''),
      objetivo:String(r?.objetivo||''),
      descripcion:String(r?.descripcion||''),
      fecha_inicio:String(r?.fecha_inicio||'').slice(0,10),
      fecha_fin:r?.fecha_fin?String(r.fecha_fin).slice(0,10):'',
      estado:String(r?.estado||'Activo')
    };
    this.seccion='rutinas';
    window.scrollTo({top:0,behavior:'smooth'});
  }

  cancelarEdicionRutina(){
    this.rutinaEditandoId=0;
    this.rutinaForm={
      id_cliente:0,
      id_entrenador:this.resumen?.entrenador?.id_entrenador||0,
      nombre_rutina:'',
      objetivo:'',
      descripcion:'',
      fecha_inicio:new Date().toISOString().slice(0,10),
      fecha_fin:'',
      estado:'Activo'
    };
  }

  finalizarRutina(r:any){
    if(!r?.id_rutina)return;
    if(!confirm('¿Marcar esta rutina como finalizada?'))return;
    this.api.actualizarRutina(Number(r.id_rutina),{estado:'Finalizado'}).subscribe({
      next:()=>{this.ok('Rutina finalizada');this.cargar();},
      error:e=>this.error=this.err(e)
    });
  }

  agregarEjercicio(){
    if(!this.detalleForm.id_rutina||!String(this.detalleForm.ejercicio||'').trim()){
      this.error='Selecciona rutina y escribe el ejercicio.';
      return;
    }

    const req=this.detalleEditandoId
      ? this.api.actualizarDetalleRutina(this.detalleEditandoId,this.detalleForm)
      : this.api.crearDetalleRutina(this.detalleForm);

    req.subscribe({
      next:()=>{
        this.ok(this.detalleEditandoId?'Ejercicio actualizado':'Ejercicio agregado');
        const idRutina=this.detalleForm.id_rutina;
        this.cancelarEdicionEjercicio(idRutina);
        this.cargar();
      },
      error:e=>this.error=this.err(e)
    });
  }

  editarEjercicio(d:any){
    this.detalleEditandoId=Number(d?.id_detalle_rutina||0);
    this.detalleForm={
      id_rutina:Number(d?.id_rutina||0),
      ejercicio:String(d?.ejercicio||''),
      series:Number(d?.series||1),
      repeticiones:Number(d?.repeticiones||1),
      peso_recomendado:d?.peso_recomendado??null,
      descanso_segundos:Number(d?.descanso_segundos||0),
      observaciones:String(d?.observaciones||'')
    };
    window.scrollTo({top:0,behavior:'smooth'});
  }

  cancelarEdicionEjercicio(idRutina?:number){
    this.detalleEditandoId=0;
    this.detalleForm={
      id_rutina:Number(idRutina||0),
      ejercicio:'',
      series:3,
      repeticiones:12,
      peso_recomendado:null,
      descanso_segundos:60,
      observaciones:''
    };
  }

  eliminarEjercicio(d:any){
    if(!d?.id_detalle_rutina)return;
    if(!confirm('¿Eliminar este ejercicio de la rutina?'))return;
    this.api.eliminarDetalleRutina(Number(d.id_detalle_rutina)).subscribe({
      next:()=>{this.ok('Ejercicio eliminado');this.cargar();},
      error:e=>this.error=this.err(e)
    });
  }

  estadoReserva(id:number,estado:string){this.api.cambiarEstadoReserva(id,estado).subscribe({next:()=>{this.ok('Reserva actualizada');this.cargar();},error:e=>this.error=this.err(e)});}
  cerrarSesion(){this.auth.logout().subscribe({next:()=>{this.auth.limpiarSesion();this.router.navigate(['/login']);},error:()=>{this.auth.limpiarSesion();this.router.navigate(['/login']);}});}
  nombre(p:any){return p?`${p.nombres||''} ${p.apellidos||''}`.trim():'-';}
  ok(m:string){this.error='';this.toast='✓ '+m;setTimeout(()=>this.toast='',2500);}
  err(e:any){const er=e?.error?.errors;if(er){const p=Object.values(er)[0];if(Array.isArray(p))return String(p[0]);}return e?.error?.mensaje??e?.error?.message??'No se pudo completar la operación.';}
}
