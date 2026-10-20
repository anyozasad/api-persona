import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GymApiService } from '../../../core/services/gym-api.service';

@Component({
  selector: 'app-clases-public',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrl: './clases-public.component.css',
  template: `
    <div class="classes-page">
      <header class="classes-nav">
        <div class="classes-shell nav-inner">
          <nav>
            <a routerLink="/">INICIO</a>
            <a routerLink="/" fragment="entrenamiento">ENTRENAMIENTO</a>
            <a routerLink="/" fragment="entrenador">SOBRE MÍ</a>
            <a routerLink="/" fragment="victorias">VICTORIAS</a>
            <a routerLink="/" fragment="gimnasio">GIMNASIO</a>
            <a routerLink="/clases-gym">RESERVAR SESIÓN</a>
            <a routerLink="/planes">PLANES Y PRECIOS</a>
            <a routerLink="/" fragment="contacto">CONTACTO</a>
          </nav>

          <a routerLink="/login" class="login">
            <span class="user-icon"><i></i><b></b></span>
            <span>Login</span>
          </a>
        </div>
      </header>

      <main class="classes-main">
        <div class="classes-shell">
          <div class="title">
            <h1>MIS CLASES</h1>
          </div>

          <div class="class-grid">
            <article *ngFor="let c of clases">
              <img [src]="c.img" [alt]="c.nombre">
              <div class="class-body">
                <h2>{{c.nombre}}</h2>
                <p>{{c.descripcion}}</p>

                <div class="class-meta">
                  <span>{{c.nivel}}</span>
                  <span>{{c.horario}}</span>
                </div>

                <a
                  routerLink="/reservar"
                  [queryParams]="c.id_clase ? { clase:c.id_clase } : { servicio:c.codigo_servicio || c.nombre }">
                  Reservar ahora
                </a>
              </div>
            </article>
          </div>
        </div>
      </main>

      <a routerLink="/" fragment="contacto" class="chat-link" aria-label="Contacto">
        <span>••</span>
      </a>
    </div>
  `
})
export class ClasesPublicComponent implements OnInit {
  clases:any[]=[
    {
      id_clase:0,
      codigo_servicio:'inicial',
      nombre:'Entrenamiento inicial',
      descripcion:'Aprende técnica, postura y una rutina segura para comenzar.',
      nivel:'Principiante',
      horario:'Según agenda',
      img:'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=1000&q=88'
    },
    {
      id_clase:0,
      codigo_servicio:'fuerza',
      nombre:'Fuerza y masa muscular',
      descripcion:'Trabajo progresivo con cargas para mejorar fuerza e hipertrofia.',
      nivel:'Intermedio',
      horario:'Según agenda',
      img:'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1000&q=88'
    },
    {
      id_clase:0,
      codigo_servicio:'avanzado',
      nombre:'Acondicionamiento avanzado',
      descripcion:'Sesiones intensas orientadas a rendimiento y resistencia.',
      nivel:'Avanzado',
      horario:'Según agenda',
      img:'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1000&q=88'
    }
  ];

  constructor(private api:GymApiService){}

  ngOnInit():void{
    window.scrollTo({top:0,left:0,behavior:'auto'});

    this.api.informacionGym().subscribe({
      next:(r:any)=>{
        const datos=Array.isArray(r?.clases)?r.clases:[];
        if(!datos.length)return;

        const fotos=[
          'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=1000&q=88',
          'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1000&q=88',
          'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1000&q=88'
        ];

        this.clases=datos.slice(0,3).map((c:any,index:number)=>({
          id_clase:Number(c.id_clase||0),
          codigo_servicio:'',
          nombre:c.nombre||'Clase Mallqui Gym',
          descripcion:c.descripcion||'Sesión programada de Mallqui Gym.',
          nivel:c.entrenador?.especialidad||'Todos los niveles',
          horario:[c.dia_semana,String(c.hora_inicio||'').slice(0,5)]
            .filter(Boolean)
            .join(' · '),
          img:fotos[index%fotos.length]
        }));
      },
      error:()=>{}
    });
  }
}
