import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth.service';
import { GymApiService } from '../../../core/services/gym-api.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrl: './checkout.component.css',
  template: `
    <div class="checkout-page">
      <header class="checkout-header">
        <a routerLink="/" class="checkout-brand">MALLQUI GYM</a>
        <span>PÁGINA DE PAGO</span>
      </header>

      <main class="checkout-grid" *ngIf="!cargando; else cargandoTpl">
        <section class="checkout-action">
          <div class="checkout-status-icon">✓</div>

          <ng-container *ngIf="plan; else sinPlanTpl">
            <h1>{{ autenticadoCliente ? 'Continúa con tu pago' : 'Inicia sesión para continuar' }}</h1>
            <p>
              {{ autenticadoCliente
                ? 'Revisamos tu plan. Continúa para elegir el método de pago y registrar la operación.'
                : 'Tu plan ya quedó seleccionado. Inicia sesión para continuar con el pago en Mallqui Gym.' }}
            </p>

            <button type="button" class="checkout-primary" (click)="continuar()">
              {{ autenticadoCliente ? 'Continuar al pago' : 'Iniciar sesión' }}
            </button>

            <a routerLink="/" fragment="planes" class="checkout-secondary">← Cambiar plan</a>
          </ng-container>

          <ng-template #sinPlanTpl>
            <h1>No se encontró el plan</h1>
            <p>Vuelve a la pantalla principal y selecciona una membresía disponible.</p>
            <a routerLink="/" fragment="planes" class="checkout-primary link">Ver planes</a>
          </ng-template>
        </section>

        <aside class="checkout-summary">
          <h2>Resumen del pedido <small *ngIf="plan">(1 ítem)</small></h2>

          <div class="checkout-item" *ngIf="plan">
            <div class="checkout-gift">▣</div>
            <div class="checkout-item-copy">
              <strong>{{plan.nombre}}</strong>
              <span>Duración: {{plan.duracion_meses}} mes{{plan.duracion_meses === 1 ? '' : 'es'}}</span>
            </div>
            <b>S/ {{plan.precio | number:'1.2-2'}}</b>
          </div>

          <div class="checkout-promo" *ngIf="plan">
            <span>◇</span>
            <div>
              <b>Plan seleccionado</b>
              <small>El precio se tomará del sistema de Mallqui Gym.</small>
            </div>
          </div>

          <div class="checkout-totals" *ngIf="plan">
            <p><span>Subtotal</span><b>S/ {{plan.precio | number:'1.2-2'}}</b></p>
            <p class="total"><span>Total</span><b>S/ {{plan.precio | number:'1.2-2'}}</b></p>
          </div>

          <div class="checkout-secure">🔒 Pago seguro dentro de tu cuenta Mallqui Gym</div>
        </aside>
      </main>

      <ng-template #cargandoTpl>
        <div class="checkout-loading">Cargando plan...</div>
      </ng-template>
    </div>
  `
})
export class CheckoutComponent implements OnInit {
  cargando = true;
  plan: any = null;
  planParametro = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: GymApiService,
    public auth: AuthService
  ) {}

  get autenticadoCliente(): boolean {
    return this.auth.estaAutenticado() && this.auth.rol === 'Cliente';
  }

  ngOnInit(): void {
    this.planParametro = String(this.route.snapshot.queryParamMap.get('plan') || '').trim();

    this.api.informacionGym().subscribe({
      next: (r: any) => {
        const planes = Array.isArray(r?.membresias) ? r.membresias : [];
        const parametroNumero = Number(this.planParametro);

        this.plan = planes.find((p: any) =>
          (parametroNumero > 0 && Number(p?.id_membresia) === parametroNumero) ||
          String(p?.nombre || '').toLowerCase() === this.planParametro.toLowerCase()
        ) || null;

        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  continuar(): void {
    if (!this.plan) return;

    const plan = String(this.plan.id_membresia || this.plan.nombre);

    if (!this.autenticadoCliente) {
      void this.router.navigate(['/login'], {
        queryParams: { plan, destino: 'pagos' }
      });
      return;
    }

    void this.router.navigate(['/usuario'], {
      queryParams: { modulo: 'pagos', plan }
    });
  }
}
