import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GymApiService } from '../../../core/services/gym-api.service';

@Component({
  selector: 'app-planes-public',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  styleUrl: './planes-public.component.css',
  template: `
    <div class="planes-page">
      <header class="planes-nav">
        <div class="planes-shell nav-inner">
          <nav>
            <a routerLink="/">INICIO</a>
            <a routerLink="/" fragment="entrenamiento">ENTRENAMIENTO</a>
            <a routerLink="/" fragment="entrenador">SOBRE MÍ</a>
            <a routerLink="/" fragment="victorias">VICTORIAS</a>
            <a routerLink="/" fragment="gimnasio">GIMNASIO</a>
            <a routerLink="/clases-gym">RESERVAR SESIÓN</a>
            <a routerLink="/planes">PLANES Y PRECIOS</a>
            <a href="#contacto-planes" (click)="irAContacto($event)">CONTACTO</a>
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

        <section class="planes-contact" id="contacto-planes">
          <div class="planes-contact-inner">
            <div class="planes-contact-copy">
              <div class="planes-contact-kicker">CONTACTO</div>
              <h2>ESCRIBE O LLÁMAME SI<br>TIENES ALGUNA PREGUNTA.</h2>
              <a *ngIf="gymInfo?.correo" [href]="'mailto:' + gymInfo.correo">{{gymInfo.correo}}</a>
              <a [href]="'tel:' + (gymInfo?.telefono || '939398148')">{{gymInfo?.telefono || '939398148'}}</a>
              <p>{{gymInfo?.direccion || 'Jr. Los Laureles Mz 17 Lt 18'}}</p>
            </div>

            <form class="planes-contact-form" (submit)="enviarContacto($event)">
              <div class="planes-form-row">
                <label>Nombre *
                  <input name="nombrePlanes" required>
                </label>
                <label>Apellido *
                  <input name="apellidoPlanes" required>
                </label>
              </div>

              <label>Email *
                <input name="emailPlanes" type="email" required>
              </label>

              <label>Asunto
                <input name="asuntoPlanes">
              </label>

              <label>Mensaje
                <textarea name="mensajePlanes" rows="4" required></textarea>
              </label>

              <button type="submit">Enviar</button>
            </form>
          </div>
        </section>
      </main>

      <section class="planes-chat-panel" *ngIf="chatAbierto" aria-label="Chat Mallqui Gym">
        <header class="planes-chat-header">
          <div>
            <strong>Mallqui Gym</strong>
            <span><i></i> Te responderemos tan pronto como podamos.</span>
          </div>
          <button type="button" aria-label="Cerrar chat" (click)="chatAbierto=false">×</button>
        </header>

        <div class="planes-chat-messages">
          <div class="planes-chat-welcome">
            <strong>¡Hola! 👋</strong>
            <p>Bienvenido a Mallqui Gym. Escríbenos tu consulta y te ayudaremos.</p>
          </div>

          <div
            *ngFor="let m of mensajesChat"
            class="planes-chat-message"
            [class.usuario]="m.tipo==='usuario'"
            [class.gym]="m.tipo==='gym'">
            {{m.texto}}
          </div>
        </div>

        <form class="planes-chat-input" (submit)="enviarChat($event)">
          <input
            name="mensajeChatPlanes"
            [(ngModel)]="mensajeChat"
            placeholder="Escribe tu mensaje..."
            autocomplete="off">
          <button type="submit" aria-label="Enviar mensaje">➤</button>
        </form>
      </section>

      <button
        type="button"
        class="planes-chat-float"
        aria-label="Abrir chat"
        title="Chat"
        [class.open]="chatAbierto"
        (click)="chatAbierto=!chatAbierto">
        <span aria-hidden="true"></span>
      </button>

      <div class="planes-toast" *ngIf="toast">{{toast}}</div>
    </div>
  `
})
export class PlanesPublicComponent implements OnInit {
  gymInfo:any = {};
  chatAbierto = false;
  mensajeChat = '';
  mensajesChat: Array<{tipo:'usuario'|'gym'; texto:string}> = [];
  toast = '';
  private toastTimer?: ReturnType<typeof setTimeout>;

  planes:any[]=[
    {id_membresia:0,nombre:'Mensualidad 1 mes',precio:80,duracion_meses:1,destacado:false,items:['Acceso al gimnasio durante 1 mes','Guía e instrucciones a cargo del personal del gym','Credencial digital','Rutina y control de asistencias']},
    {id_membresia:0,nombre:'Promoción 2 meses',precio:120,duracion_meses:2,destacado:true,items:['Acceso al gimnasio durante 2 meses','Guía e instrucciones a cargo del personal del gym','Credencial digital','Rutina y control de asistencias']},
    {id_membresia:0,nombre:'Promoción 3 meses',precio:150,duracion_meses:3,destacado:false,items:['Acceso al gimnasio durante 3 meses','Guía e instrucciones a cargo del personal del gym','Credencial digital','Rutina y control de asistencias']}
  ];

  constructor(private api:GymApiService){}

  irAContacto(event: Event): void {
    event.preventDefault();
    document.getElementById('contacto-planes')?.scrollIntoView({behavior:'smooth',block:'start'});
  }

  enviarChat(event: Event): void {
    event.preventDefault();
    const texto = this.mensajeChat.trim();
    if (!texto) return;

    this.mensajesChat.push({tipo:'usuario',texto});
    this.mensajeChat='';

    setTimeout(()=>{
      this.mensajesChat.push({
        tipo:'gym',
        texto:'Gracias por escribirnos. Hemos recibido tu mensaje y te responderemos lo antes posible.'
      });
    },450);
  }

  enviarContacto(event: Event): void {
    event.preventDefault();
    const form=event.target as HTMLFormElement;
    if(!form.checkValidity()){
      form.reportValidity();
      return;
    }
    if(this.toastTimer) clearTimeout(this.toastTimer);
    this.toast='Mensaje preparado. También puedes comunicarte directamente con Mallqui Gym por teléfono.';
    this.toastTimer=setTimeout(()=>this.toast='',4200);
    form.reset();
  }

  ngOnInit():void{
    window.scrollTo({top:0,left:0,behavior:'auto'});
    this.api.informacionGym().subscribe({
      next:(r:any)=>{
        this.gymInfo=r?.gimnasio || r?.gym || r?.informacion || {};
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
