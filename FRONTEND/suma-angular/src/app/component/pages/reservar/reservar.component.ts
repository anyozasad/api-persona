import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth.service';
import { GymApiService } from '../../../core/services/gym-api.service';

@Component({
  selector: 'app-reservar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrl: './reservar.component.css',
  template: `
    <div class="booking-page">
      <header class="booking-topbar">
        <a routerLink="/" class="booking-brand">MALLQUI GYM</a>
        <nav>
          <a routerLink="/">INICIO</a>
          <a routerLink="/" fragment="entrenamiento">ENTRENAMIENTO</a>
          <a routerLink="/" fragment="gimnasio">GIMNASIO</a>
          <a routerLink="/" fragment="planes">PLANES Y PRECIOS</a>
          <a routerLink="/" fragment="contacto">CONTACTO</a>
          <a routerLink="/login" class="login-link">Login</a>
        </nav>
      </header>

      <main class="booking-shell" *ngIf="!cargando; else loadingTpl">
        <a routerLink="/" fragment="clases" class="back-link">‹ Volver</a>

        <section *ngIf="clase; else noClaseTpl">
          <div class="booking-heading">
            <h1>Programa tu servicio</h1>
            <p>Revisa la disponibilidad y reserva la fecha y hora que más te convengan.</p>
          </div>

          <div class="booking-layout">
            <section class="calendar-panel">
              <div class="calendar-title-row">
                <h2>Selecciona fecha y hora</h2>
                <span>Horario local · Pucallpa, Perú</span>
              </div>

              <div class="calendar-controls">
                <button type="button" (click)="mesAnterior()" aria-label="Mes anterior">‹</button>
                <strong>{{ nombreMes }} {{ anioVisible }}</strong>
                <button type="button" (click)="mesSiguiente()" aria-label="Mes siguiente">›</button>
              </div>

              <div class="calendar-grid weekdays">
                <span *ngFor="let d of ['lun','mar','mié','jue','vie','sáb','dom']">{{d}}</span>
              </div>

              <div class="calendar-grid days">
                <span *ngFor="let x of huecosIniciales"></span>
                <button
                  *ngFor="let dia of diasMes"
                  type="button"
                  [disabled]="!dia.habilitado"
                  [class.selected]="dia.iso===fechaSeleccionada"
                  [class.today]="dia.esHoy"
                  (click)="seleccionarFecha(dia)">
                  {{dia.numero}}
                </button>
              </div>
            </section>

            <section class="availability-panel">
              <div class="availability-copy">
                <span>Disponibilidad para</span>
                <strong>{{ fechaSeleccionada ? fechaLegible(fechaSeleccionada) : 'Selecciona una fecha' }}</strong>
                <p *ngIf="!fechaSeleccionada">Elige uno de los días disponibles de esta clase.</p>
                <div class="time-slot" *ngIf="fechaSeleccionada">
                  <b>{{horaCorta(clase.hora_inicio)}} - {{horaCorta(clase.hora_fin)}}</b>
                  <small>{{clase.dia_semana}} · sujeto a cupo disponible</small>
                </div>
              </div>

              <button
                type="button"
                class="next-available"
                (click)="elegirProximaFecha()">
                Próxima sesión disponible
              </button>
            </section>

            <aside class="service-panel">
              <h2>Detalles del servicio</h2>
              <div class="service-details">
                <strong>{{clase.nombre}}</strong>
                <span>{{clase.descripcion || 'Clase de Mallqui Gym'}}</span>
                <span>{{clase.dia_semana}} · {{horaCorta(clase.hora_inicio)}} - {{horaCorta(clase.hora_fin)}}</span>
                <span *ngIf="clase.entrenador">
                  Entrenador: {{clase.entrenador.nombres}} {{clase.entrenador.apellidos}}
                </span>
              </div>

              <p class="booking-error" *ngIf="error">{{error}}</p>
              <p class="booking-success" *ngIf="mensaje">{{mensaje}}</p>

              <button
                type="button"
                class="booking-next"
                [disabled]="!fechaSeleccionada || procesando"
                (click)="continuar()">
                {{procesando ? 'Procesando...' : (autenticadoCliente ? 'Confirmar reserva' : 'Siguiente')}}
              </button>
            </aside>
          </div>
        </section>

        <ng-template #noClaseTpl>
          <section class="booking-empty">
            <h1>Clase no disponible</h1>
            <p>Selecciona una clase activa desde la pantalla principal.</p>
            <a routerLink="/" fragment="clases">Ver clases</a>
          </section>
        </ng-template>
      </main>

      <ng-template #loadingTpl>
        <div class="booking-loading">Cargando disponibilidad...</div>
      </ng-template>
    </div>
  `
})
export class ReservarComponent implements OnInit {
  cargando = true;
  procesando = false;
  clase: any = null;
  clases: any[] = [];
  fechaSeleccionada = '';
  error = '';
  mensaje = '';

  mesVisible = new Date().getMonth();
  anioVisible = new Date().getFullYear();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private api: GymApiService
  ) {}

  get autenticadoCliente(): boolean {
    return this.auth.estaAutenticado() && this.auth.rol === 'Cliente';
  }

  get nombreMes(): string {
    return new Date(this.anioVisible, this.mesVisible, 1)
      .toLocaleDateString('es-PE', { month: 'long' })
      .replace(/^./, x => x.toUpperCase());
  }

  get diasMes(): Array<{numero:number; iso:string; habilitado:boolean; esHoy:boolean}> {
    const total = new Date(this.anioVisible, this.mesVisible + 1, 0).getDate();
    const hoy = this.isoLocal(new Date());

    return Array.from({length: total}, (_, i) => {
      const numero = i + 1;
      const fecha = new Date(this.anioVisible, this.mesVisible, numero, 12, 0, 0);
      const iso = this.isoLocal(fecha);
      const habilitado = !!this.clase && iso >= hoy && this.coincideDia(fecha, this.clase.dia_semana);
      return { numero, iso, habilitado, esHoy: iso === hoy };
    });
  }

  get huecosIniciales(): unknown[] {
    const jsDay = new Date(this.anioVisible, this.mesVisible, 1).getDay();
    const lunesPrimero = jsDay === 0 ? 6 : jsDay - 1;
    return Array.from({length: lunesPrimero});
  }

  ngOnInit(): void {
    const idClase = Number(this.route.snapshot.queryParamMap.get('clase') || 0);
    const fecha = String(this.route.snapshot.queryParamMap.get('fecha') || '').trim();

    this.api.informacionGym().subscribe({
      next: (r: any) => {
        this.clases = Array.isArray(r?.clases) ? r.clases : [];
        this.clase = this.clases.find((c: any) => Number(c.id_clase) === idClase) || null;

        if (this.clase) {
          if (fecha && this.fechaValidaParaClase(fecha)) {
            this.fechaSeleccionada = fecha;
            const d = new Date(fecha + 'T12:00:00');
            this.mesVisible = d.getMonth();
            this.anioVisible = d.getFullYear();
          } else {
            this.elegirProximaFecha();
          }
        }

        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudo consultar las clases del gimnasio.';
        this.cargando = false;
      }
    });
  }

  mesAnterior(): void {
    const hoy = new Date();
    const actual = new Date(this.anioVisible, this.mesVisible, 1);
    const minimo = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    if (actual <= minimo) return;

    this.mesVisible--;
    if (this.mesVisible < 0) {
      this.mesVisible = 11;
      this.anioVisible--;
    }
  }

  mesSiguiente(): void {
    this.mesVisible++;
    if (this.mesVisible > 11) {
      this.mesVisible = 0;
      this.anioVisible++;
    }
  }

  seleccionarFecha(dia: {iso:string; habilitado:boolean}): void {
    if (!dia.habilitado) return;
    this.fechaSeleccionada = dia.iso;
    this.error = '';
    this.mensaje = '';
  }

  elegirProximaFecha(): void {
    if (!this.clase) return;

    const base = new Date();
    base.setHours(12, 0, 0, 0);

    for (let i = 0; i < 60; i++) {
      const fecha = new Date(base);
      fecha.setDate(base.getDate() + i);

      if (!this.coincideDia(fecha, this.clase.dia_semana)) continue;

      const iso = this.isoLocal(fecha);
      const hoy = new Date();
      const mismaFecha = iso === this.isoLocal(hoy);

      if (mismaFecha) {
        const [h, m] = String(this.clase.hora_inicio || '00:00').split(':').map(Number);
        const inicio = new Date();
        inicio.setHours(h || 0, m || 0, 0, 0);
        if (inicio <= hoy) continue;
      }

      this.fechaSeleccionada = iso;
      this.mesVisible = fecha.getMonth();
      this.anioVisible = fecha.getFullYear();
      return;
    }
  }

  continuar(): void {
    this.error = '';
    this.mensaje = '';

    if (!this.clase || !this.fechaSeleccionada) {
      this.error = 'Selecciona una fecha disponible.';
      return;
    }

    if (!this.autenticadoCliente) {
      void this.router.navigate(['/login'], {
        queryParams: {
          destino: 'reservar',
          clase: this.clase.id_clase,
          fecha: this.fechaSeleccionada
        }
      });
      return;
    }

    this.procesando = true;
    this.api.reservarClase(Number(this.clase.id_clase), this.fechaSeleccionada).subscribe({
      next: (r: any) => {
        this.procesando = false;
        this.mensaje = r?.mensaje || 'Clase reservada correctamente.';
        setTimeout(() => {
          void this.router.navigate(['/usuario'], { queryParams: { modulo: 'reservas' } });
        }, 900);
      },
      error: (e: any) => {
        this.procesando = false;
        const errors = e?.error?.errors;
        if (errors && typeof errors === 'object') {
          const first = Object.values(errors)[0];
          if (Array.isArray(first) && first.length) {
            this.error = String(first[0]);
            return;
          }
        }
        this.error = e?.error?.mensaje || e?.error?.message || 'No se pudo crear la reserva.';
      }
    });
  }

  fechaLegible(iso: string): string {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('es-PE', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    }).replace(/^./, x => x.toUpperCase());
  }

  horaCorta(valor: any): string {
    return String(valor || '--:--').slice(0, 5);
  }

  private fechaValidaParaClase(iso: string): boolean {
    const d = new Date(iso + 'T12:00:00');
    if (Number.isNaN(d.getTime())) return false;
    return iso >= this.isoLocal(new Date()) && this.coincideDia(d, this.clase?.dia_semana);
  }

  private coincideDia(fecha: Date, dia: string): boolean {
    const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    return dias[fecha.getDay()] === String(dia || '');
  }

  private isoLocal(fecha: Date): string {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
