import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GymApiService } from '../../../core/services/gym-api.service';

@Component({
  selector: 'app-planes-public',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrl: './planes-public.component.css',
  template: `
    <div class="planes-page">
      <header class="planes-nav">
        <div class="planes-shell nav-inner">
          <nav>
            <a routerLink="/" class="home-return-link" (click)="volverSinAnimacion()">INICIO</a>
            <a routerLink="/" fragment="entrenamiento" class="home-return-link" (click)="volverSinAnimacion()">ENTRENAMIENTO</a>
            <a routerLink="/" fragment="entrenador" class="home-return-link" (click)="volverSinAnimacion()">SOBRE MÍ</a>
            <a routerLink="/" fragment="victorias" class="home-return-link" (click)="volverSinAnimacion()">VICTORIAS</a>
            <a routerLink="/" fragment="gimnasio" class="home-return-link" (click)="volverSinAnimacion()">GIMNASIO</a>
            <a routerLink="/clases-gym">RESERVAR SESIÓN</a>
            <a routerLink="/planes">PLANES Y PRECIOS</a>
            <a routerLink="/" fragment="contacto" class="home-return-link" (click)="volverSinAnimacion()">CONTACTO</a>
          </nav>

          <a routerLink="/login" class="login">
            <span class="user-icon"><i></i><b></b></span>
            <span>Login</span>
          </a>
        </div>
      </header>

      <main>
        <section class="pricing">
          <div class="planes-shell">
            <div class="title">
              <p>ENTRENA A TU RITMO</p>
              <h1>PLANES Y PRECIOS</h1>
            </div>

            <div class="plan-grid">
              <article *ngFor="let p of planes; let i=index" [class.featured]="p.destacado || i===1">
                <span class="badge" *ngIf="p.destacado || i===1">RECOMENDADO</span>
                <h2>{{p.nombre}}</h2>

                <div class="price">
                  <small>S/</small>
                  <strong>{{p.precio}}</strong>
                </div>

                <span class="duration">{{p.duracion_meses}} mes{{p.duracion_meses===1?'':'es'}}</span>

                <ul>
                  <li *ngFor="let item of p.items">✓ {{item}}</li>
                </ul>

                <a routerLink="/checkout" [queryParams]="{plan:p.id_membresia || p.nombre}">
                  Elegir plan
                </a>
              </article>
            </div>
          </div>
        </section>
      </main>

    </div>
  `
})
export class PlanesPublicComponent implements OnInit {
  planes:any[]=[
    {id_membresia:0,nombre:'Mensualidad 1 mes',precio:80,duracion_meses:1,destacado:false,items:['Acceso al gimnasio durante 1 mes','Guía e instrucciones a cargo del personal del gym','Credencial digital','Rutina y control de asistencias']},
    {id_membresia:0,nombre:'Promoción 2 meses',precio:120,duracion_meses:2,destacado:true,items:['Acceso al gimnasio durante 2 meses','Guía e instrucciones a cargo del personal del gym','Credencial digital','Rutina y control de asistencias']},
    {id_membresia:0,nombre:'Promoción 3 meses',precio:150,duracion_meses:3,destacado:false,items:['Acceso al gimnasio durante 3 meses','Guía e instrucciones a cargo del personal del gym','Credencial digital','Rutina y control de asistencias']}
  ];

  constructor(private api:GymApiService){}

  volverSinAnimacion():void{
    sessionStorage.setItem('mq-return-no-animation','1');
  }

  ngOnInit():void{
    window.scrollTo({top:0,left:0,behavior:'auto'});
    this.api.informacionGym().subscribe({
      next:(r:any)=>{
        const datos=Array.isArray(r?.membresias)?r.membresias:[];

        const base=[
          {id_membresia:0,nombre:'Mensualidad 1 mes',precio:80,duracion_meses:1,destacado:false,items:['Acceso al gimnasio durante 1 mes','Guía e instrucciones a cargo del personal del gym','Credencial digital','Rutina y control de asistencias']},
          {id_membresia:0,nombre:'Promoción 2 meses',precio:120,duracion_meses:2,destacado:true,items:['Acceso al gimnasio durante 2 meses','Guía e instrucciones a cargo del personal del gym','Credencial digital','Rutina y control de asistencias']},
          {id_membresia:0,nombre:'Promoción 3 meses',precio:150,duracion_meses:3,destacado:false,items:['Acceso al gimnasio durante 3 meses','Guía e instrucciones a cargo del personal del gym','Credencial digital','Rutina y control de asistencias']}
        ];

        const normalizados=datos.map((m:any)=>({
          id_membresia:Number(m.id_membresia||0),
          nombre:m.nombre,
          precio:Number(m.precio||0),
          duracion_meses:Number(m.duracion_meses||1),
          destacado:Number(m.duracion_meses||1)===2,
          items:Array.isArray(m.beneficios)&&m.beneficios.length
            ? m.beneficios
            : [
                `Acceso al gimnasio durante ${Number(m.duracion_meses||1)} mes${Number(m.duracion_meses||1)===1?'':'es'}`,
                'Guía e instrucciones a cargo del personal del gym',
                'Credencial digital',
                'Rutina y control de asistencias'
              ]
        }));

        this.planes=base.map((fallback:any)=>{
          const real=normalizados.find((p:any)=>p.duracion_meses===fallback.duracion_meses);
          return real ? {...fallback,...real,destacado:fallback.duracion_meses===2} : fallback;
        });
      },
      error:()=>{}
    });
  }
}
