import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminApiService } from './admin-api.service';
import { AuthService } from './auth.service';
import { ProductosComponent } from './pages/productos/productos';
import { AdminComunicacionComponent } from './admin-comunicacion.component';
import { AdminClienteFichaComponent } from './admin-cliente-ficha.component';
import { AdminDashboardToolsComponent } from './admin-dashboard-tools.component';
import { AdminGymSuiteComponent } from './admin-gym-suite.component';
import { AdminCrossfitExtrasComponent } from './admin-crossfit-extras.component';

@Component({
  selector: 'app-admin-integrado',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductosComponent, AdminComunicacionComponent, AdminClienteFichaComponent, AdminDashboardToolsComponent, AdminGymSuiteComponent, AdminCrossfitExtrasComponent],
  styleUrls: ['../mallqui-admin.css', '../ui-readable.css', './admin-live.css', '../crossfit-final.css'],
  encapsulation: ViewEncapsulation.None,
  template: `
  <div class="admin-shell admin-home-redesign" [class.admin-sidebar-collapsed]="sidebarCerrado">
    <header class="admin-wix-topbar">
      <button type="button" class="admin-top-brand" (click)="toggleSidebar()" title="Abrir o cerrar menú">
        <span class="admin-top-brand-mark">☰</span>
        <span class="crossfit-top-logo"><span class="cf-logo-stack" aria-hidden="true"><i></i><i></i><i></i></span><strong>Mallqui Gym</strong></span>
      </button>

      <div class="crossfit-top-spacer"></div>

      <label class="admin-wix-search">
        <span>⌕</span>
        <input
          type="text"
          [(ngModel)]="busquedaAdmin"
          (keydown.enter)="buscarEnPanel()"
          placeholder="Search modules, members, payments, invoices..."
          aria-label="Search dashboard">
        <button type="button" (click)="buscarEnPanel()">Buscar</button>
      </label>

      <div class="admin-top-actions">
        <button type="button" (click)="cambiarSeccion('comunicacion')" title="Activity" aria-label="Activity">＋</button>
        <button type="button" (click)="cambiarSeccion('comunicacion')" title="Alerts" aria-label="Alerts">⚑</button>
        <button type="button" (click)="cambiarSeccion('comunicacion')" title="Messages" aria-label="Messages">✉</button>
        <button type="button" (click)="cambiarSeccion('configuracion')" title="Settings" aria-label="Settings">⚙</button>
        <button type="button" class="admin-top-user" (click)="cambiarSeccion('my-profile')" title="My Profile">
          {{(auth.usuario?.nombre_usuario || 'A').charAt(0).toUpperCase()}}
        </button>
      </div>
    </header>
    <aside class="admin-nav">
      <div class="admin-nav-top crossfit-profile-card">
        <button type="button" class="crossfit-profile-avatar" (click)="cambiarSeccion('usuarios')" aria-label="Abrir perfil">
          <img src="assets/showcase/coach-showcase.svg" alt="Administrador Mallqui Gym">
          <span class="crossfit-profile-status"></span>
        </button>
        <div class="crossfit-profile-copy">
          <strong>{{auth.usuario?.nombre_usuario || 'Administrador'}}</strong>
          <small>Gym Admin</small>
          <em>Administrador</em>
        </div>
      </div>

      <nav class="admin-main-nav crossfit-sidebar-nav" aria-label="Módulos principales">
        <button type="button" [class.active]="seccion==='dashboard'" (click)="cambiarSeccion('dashboard')">
          <span class="admin-main-nav-icon">⌂</span><span>Dashboard</span>
        </button>
        <button type="button" [class.active]="seccion==='reportes'" (click)="cambiarSeccion('reportes')">
          <span class="admin-main-nav-icon">⌁</span><span>My Reports</span>
        </button>
        <button type="button" [class.active]="seccion==='rutinas'" (click)="cambiarSeccion('rutinas')">
          <span class="admin-main-nav-icon">▣</span><span>My Workout Plan</span>
        </button>
        <button type="button" [class.active]="seccion==='nutricion'" (click)="cambiarSeccion('nutricion')">
          <span class="admin-main-nav-icon">♨</span><span>My Diet Plan</span>
        </button>
        <button type="button" [class.active]="seccion==='asistencias'" (click)="cambiarSeccion('asistencias')">
          <span class="admin-main-nav-icon">▦</span><span>Attendance Tracker</span>
        </button>
        <button type="button" [class.active]="seccion==='entrenador'" (click)="cambiarSeccion('entrenador')">
          <span class="admin-main-nav-icon">♙</span><span>Trainers</span>
        </button>
        <button type="button" [class.active]="seccion==='trainer-profile'" (click)="cambiarSeccion('trainer-profile')">
          <span class="admin-main-nav-icon">◎</span><span>Trainer Profile</span>
        </button>

        <button type="button" class="cf-nav-group-head" [class.active]="['members-list','members-cards','add-member','edit-member-details'].includes(seccion)" (click)="toggleNavGroup('members')">
          <span class="admin-main-nav-icon">♚</span><span>Gym Members</span><i>{{navGroups.members?'⌄':'›'}}</i>
        </button>
        <div class="cf-nav-children" *ngIf="navGroups.members">
          <button type="button" [class.active]="seccion==='members-list'" (click)="cambiarSeccion('members-list')"><span>•</span><span>Members List</span></button>
          <button type="button" [class.active]="seccion==='members-cards'" (click)="cambiarSeccion('members-cards')"><span>•</span><span>Members Cards</span></button>
          <button type="button" [class.active]="seccion==='add-member'" (click)="cambiarSeccion('add-member')"><span>•</span><span>Add Member</span></button>
          <button type="button" [class.active]="seccion==='edit-member-details'" (click)="cambiarSeccion('edit-member-details')"><span>•</span><span>Edit Member Details</span></button>
        </div>

        <button type="button" class="cf-nav-group-head" [class.active]="['ingresos','pagos','facturas','invoice-details','create-invoice','expenses'].includes(seccion)" (click)="toggleNavGroup('payments')">
          <span class="admin-main-nav-icon">S/</span><span>Payments</span><i>{{navGroups.payments?'⌄':'›'}}</i>
        </button>
        <div class="cf-nav-children" *ngIf="navGroups.payments">
          <button type="button" [class.active]="seccion==='ingresos'" (click)="cambiarSeccion('ingresos')"><span>•</span><span>Income</span></button>
          <button type="button" [class.active]="seccion==='pagos'" (click)="cambiarSeccion('pagos')"><span>•</span><span>Payments</span></button>
          <button type="button" [class.active]="seccion==='facturas'" (click)="cambiarSeccion('facturas')"><span>•</span><span>Invoices</span></button>
          <button type="button" [class.active]="seccion==='invoice-details'" (click)="cambiarSeccion('invoice-details')"><span>•</span><span>Invoice Details</span></button>
          <button type="button" [class.active]="seccion==='create-invoice'" (click)="cambiarSeccion('create-invoice')"><span>•</span><span>Create Invoice</span></button>
          <button type="button" [class.active]="seccion==='expenses'" (click)="cambiarSeccion('expenses')"><span>•</span><span>Expenses</span></button>
        </div>

        <button type="button" [class.active]="seccion==='equipos'" (click)="cambiarSeccion('equipos')"><span class="admin-main-nav-icon">◆</span><span>Equipments</span></button>
        <button type="button" [class.active]="seccion==='eventos'" (click)="cambiarSeccion('eventos')"><span class="admin-main-nav-icon">◫</span><span>Gym Events</span></button>
        <button type="button" [class.active]="seccion==='galeria'" (click)="cambiarSeccion('galeria')"><span class="admin-main-nav-icon">▧</span><span>Gallery</span></button>
        <button type="button" [class.active]="seccion==='noticias'" (click)="cambiarSeccion('noticias')"><span class="admin-main-nav-icon">◇</span><span>News & Updates</span></button>
        <button type="button" [class.active]="seccion==='planes'" (click)="cambiarSeccion('planes')"><span class="admin-main-nav-icon">★</span><span>Pricing Plans</span></button>

        <button type="button" class="cf-nav-group-head" [class.active]="['salarios','payslip'].includes(seccion)" (click)="toggleNavGroup('salaries')">
          <span class="admin-main-nav-icon">▤</span><span>Salaries</span><i>{{navGroups.salaries?'⌄':'›'}}</i>
        </button>
        <div class="cf-nav-children" *ngIf="navGroups.salaries">
          <button type="button" [class.active]="seccion==='salarios'" (click)="cambiarSeccion('salarios')"><span>•</span><span>Salary List</span></button>
          <button type="button" [class.active]="seccion==='payslip'" (click)="cambiarSeccion('payslip')"><span>•</span><span>Payslip</span></button>
        </div>

        <button type="button" class="cf-nav-group-head" [class.active]="['alerts','avatars','badges','buttons','button-groups','cards-ui','advanced-cards','dropdowns','list-items','progress-bars','placeholders','spinners'].includes(seccion)" (click)="toggleNavGroup('ui')">
          <span class="admin-main-nav-icon">✦</span><span>UI Elements</span><i>{{navGroups.ui?'⌄':'›'}}</i>
        </button>
        <div class="cf-nav-children" *ngIf="navGroups.ui">
          <button *ngFor="let x of uiElementLinks" type="button" [class.active]="seccion===x.id" (click)="cambiarSeccion(x.id)"><span>•</span><span>{{x.label}}</span></button>
        </div>

        <button type="button" class="cf-nav-group-head" [class.active]="['accordions','carousel','modals','popovers','tabs-ui','tooltips'].includes(seccion)" (click)="toggleNavGroup('jquery')">
          <span class="admin-main-nav-icon">⌘</span><span>Jquery Components</span><i>{{navGroups.jquery?'⌄':'›'}}</i>
        </button>
        <div class="cf-nav-children" *ngIf="navGroups.jquery">
          <button *ngFor="let x of jqueryLinks" type="button" [class.active]="seccion===x.id" (click)="cambiarSeccion(x.id)"><span>•</span><span>{{x.label}}</span></button>
        </div>

        <button type="button" class="cf-nav-group-head" [class.active]="['form-inputs','checkbox-radio','file-input','validations','date-time','input-masks','input-tags'].includes(seccion)" (click)="toggleNavGroup('forms')">
          <span class="admin-main-nav-icon">☷</span><span>Forms</span><i>{{navGroups.forms?'⌄':'›'}}</i>
        </button>
        <div class="cf-nav-children" *ngIf="navGroups.forms">
          <button *ngFor="let x of formLinks" type="button" [class.active]="seccion===x.id" (click)="cambiarSeccion(x.id)"><span>•</span><span>{{x.label}}</span></button>
        </div>

        <button type="button" [class.active]="seccion==='tables'" (click)="cambiarSeccion('tables')"><span class="admin-main-nav-icon">▦</span><span>Tables</span></button>

        <button type="button" class="cf-nav-group-head" [class.active]="['apex','morris'].includes(seccion)" (click)="toggleNavGroup('graphs')">
          <span class="admin-main-nav-icon">↗</span><span>Graphs</span><i>{{navGroups.graphs?'⌄':'›'}}</i>
        </button>
        <div class="cf-nav-children" *ngIf="navGroups.graphs">
          <button type="button" [class.active]="seccion==='apex'" (click)="cambiarSeccion('apex')"><span>•</span><span>Apex Graphs</span></button>
          <button type="button" [class.active]="seccion==='morris'" (click)="cambiarSeccion('morris')"><span>•</span><span>Morris Graphs</span></button>
        </div>

        <button type="button" [class.active]="seccion==='vector-maps'" (click)="cambiarSeccion('vector-maps')"><span class="admin-main-nav-icon">◎</span><span>Vector Maps</span></button>
        <button type="button" [class.active]="seccion==='icons'" (click)="cambiarSeccion('icons')"><span class="admin-main-nav-icon">★</span><span>Icons</span></button>
        <button type="button" [class.active]="seccion==='account-settings'" (click)="cambiarSeccion('account-settings')"><span class="admin-main-nav-icon">⚙</span><span>Account Settings</span></button>
        <button type="button" [class.active]="seccion==='my-profile'" (click)="cambiarSeccion('my-profile')"><span class="admin-main-nav-icon">♙</span><span>My Profile</span></button>
        <button type="button" [class.active]="seccion==='contact'" (click)="cambiarSeccion('contact')"><span class="admin-main-nav-icon">☎</span><span>Contact</span></button>
        <button type="button" [class.active]="seccion==='typography'" (click)="cambiarSeccion('typography')"><span class="admin-main-nav-icon">T</span><span>Typography</span></button>

        <button type="button" class="cf-nav-group-head" [class.active]="['login-page','signup-page','forgot-password','reset-password-page'].includes(seccion)" (click)="toggleNavGroup('auth')">
          <span class="admin-main-nav-icon">↪</span><span>Login/Signup</span><i>{{navGroups.auth?'⌄':'›'}}</i>
        </button>
        <div class="cf-nav-children" *ngIf="navGroups.auth">
          <button type="button" [class.active]="seccion==='login-page'" (click)="cambiarSeccion('login-page')"><span>•</span><span>Login</span></button>
          <button type="button" [class.active]="seccion==='signup-page'" (click)="cambiarSeccion('signup-page')"><span>•</span><span>Signup</span></button>
          <button type="button" [class.active]="seccion==='forgot-password'" (click)="cambiarSeccion('forgot-password')"><span>•</span><span>Forgot Password</span></button>
          <button type="button" [class.active]="seccion==='reset-password-page'" (click)="cambiarSeccion('reset-password-page')"><span>•</span><span>Reset Password</span></button>
        </div>

        <button type="button" [class.active]="seccion==='page-not-found'" (click)="cambiarSeccion('page-not-found')"><span class="admin-main-nav-icon">404</span><span>Page Not Found</span></button>
        <button type="button" [class.active]="seccion==='maintenance'" (click)="cambiarSeccion('maintenance')"><span class="admin-main-nav-icon">⚙</span><span>Maintenance</span></button>

        <button type="button" class="cf-nav-group-head" [class.active]="['menu-level-1','menu-level-2','menu-level-3'].includes(seccion)" (click)="toggleNavGroup('menu')">
          <span class="admin-main-nav-icon">☷</span><span>Menu Level</span><i>{{navGroups.menu?'⌄':'›'}}</i>
        </button>
        <div class="cf-nav-children" *ngIf="navGroups.menu">
          <button type="button" [class.active]="seccion==='menu-level-1'" (click)="cambiarSeccion('menu-level-1')"><span>•</span><span>Level One Link</span></button>
          <button type="button" [class.active]="seccion==='menu-level-2'" (click)="cambiarSeccion('menu-level-2')"><span>•</span><span>Level One Menu</span></button>
          <button type="button" [class.active]="seccion==='menu-level-2'" (click)="cambiarSeccion('menu-level-2')" style="padding-left:28px"><span>◦</span><span>Level Two Link</span></button>
          <button type="button" [class.active]="seccion==='menu-level-3'" (click)="cambiarSeccion('menu-level-3')" style="padding-left:28px"><span>◦</span><span>Level Two Menu</span></button>
          <button type="button" [class.active]="seccion==='menu-level-3'" (click)="cambiarSeccion('menu-level-3')" style="padding-left:42px"><span>·</span><span>Level Three Link</span></button>
          <button type="button" [class.active]="seccion==='menu-level-3'" (click)="cambiarSeccion('menu-level-3')" style="padding-left:42px"><span>·</span><span>Level Three Link</span></button>
          <button type="button" [class.active]="seccion==='menu-level-1'" (click)="cambiarSeccion('menu-level-1')"><span>•</span><span>Level One Link</span></button>
        </div>

        <button type="button" [class.active]="seccion==='external-link'" (click)="cambiarSeccion('external-link')"><span class="admin-main-nav-icon">↗</span><span>External Link</span></button>
        <button type="button" [class.active]="seccion==='chip'" (click)="cambiarSeccion('chip')"><span class="admin-main-nav-icon">#</span><span>Chip 6</span></button>
        <button type="button" [class.active]="seccion==='badge-link'" (click)="cambiarSeccion('badge-link')"><span class="admin-main-nav-icon">●</span><span>Badge Chip</span></button>
        <button type="button" disabled><span class="admin-main-nav-icon">⊘</span><span>Disabled Link</span></button>
      </nav>

      <button type="button" class="cf-fitness-center-card" (click)="cambiarSeccion('contact')">
        <span>☎</span>
        <div><small>Fitness Center</small><b>{{configuracionForm.telefono || '000000000'}}</b></div>
      </button>
      <button type="button" class="admin-system-card" [class.is-offline]="!dashboard?.fuente?.base_datos" (click)="cambiarSeccion('configuracion')" title="Estado del sistema">
        <div class="system-live-dot"></div>
        <div><b>{{dashboard?.fuente?.base_datos ? 'Sistema en línea' : 'Verificando sistema'}}</b><small>{{dashboard?.fuente?.base_datos ? ('BD: '+dashboard.fuente.base_datos) : 'Esperando conexión'}}</small></div>
      </button>
      <button type="button" class="admin-logout" (click)="cerrarSesion()"><span>↪</span> Cerrar sesión</button>
    </aside>

    <button
      type="button"
      class="admin-sidebar-toggle"
      [class.is-collapsed]="sidebarCerrado"
      (click)="toggleSidebar()"
      [attr.aria-label]="sidebarCerrado ? 'Abrir menú lateral' : 'Cerrar menú lateral'"
      [attr.title]="sidebarCerrado ? 'Abrir menú' : 'Cerrar menú'">
      {{sidebarCerrado ? '›' : '‹'}}
    </button>

    <main class="admin-content">
      

      <nav class="admin-mobile-modules" aria-label="Módulos principales en móvil">
        <button type="button" [class.active]="moduloActivo==='dashboard'" (click)="abrirModuloAdmin('dashboard')"><span>⌂</span><b>Inicio</b></button>
        <button type="button" [class.active]="moduloActivo==='socios'" (click)="abrirModuloAdmin('socios')"><span>♙</span><b>Socios</b><i *ngIf="badgeModulo('socios')>0">{{badgeModulo('socios')}}</i></button>
        <button type="button" [class.active]="moduloActivo==='servicios'" (click)="abrirModuloAdmin('servicios')"><span>◉</span><b>Servicios</b><i *ngIf="badgeModulo('servicios')>0">{{badgeModulo('servicios')}}</i></button>
        <button type="button" [class.active]="moduloActivo==='operacion'" (click)="abrirModuloAdmin('operacion')"><span>▣</span><b>Caja</b></button>
        <button type="button" [class.active]="moduloActivo==='inventario'" (click)="abrirModuloAdmin('inventario')"><span>▦</span><b>Stock</b><i *ngIf="badgeModulo('inventario')>0">{{badgeModulo('inventario')}}</i></button>
        <button type="button" [class.active]="moduloActivo==='gestion-fitness'" (click)="abrirModuloAdmin('gestion-fitness')"><span>✦</span><b>Fitness</b></button>
        <button type="button" [class.active]="moduloActivo==='atencion'" (click)="abrirModuloAdmin('atencion')"><span>●</span><b>Atención</b><i *ngIf="badgeModulo('atencion')>0">{{badgeModulo('atencion')}}</i></button>
        <button type="button" [class.active]="moduloActivo==='reportes'" (click)="abrirModuloAdmin('reportes')"><span>↗</span><b>Reportes</b></button>
        <button type="button" [class.active]="moduloActivo==='sistema'" (click)="abrirModuloAdmin('sistema')"><span>⚙</span><b>Sistema</b></button>
      </nav>

      <!-- CORE PAGES · Estructura tomada de la demo viva Crossfit -->
      <section class="cf-live-page" *ngIf="seccion==='reportes'">
        <div class="cf-special-crumb"><span>⌂</span><small>Home</small><b>›</b><strong>My Reports</strong></div>
        <section class="cf-live-welcome">
          <div>
            <small>WELCOME BACK,</small>
            <h1>{{auth.usuario?.nombre_usuario || 'Administrador'}}</h1>
            <p>Here's your fitness summary for today</p>
          </div>
          <div class="cf-live-summary4">
            <article><span>👟</span><b>{{dashboard?.asistencias?.hoy ?? 0}}</b><small>Steps Today</small></article>
            <article><span>🔥</span><b>{{dashboard?.ventas?.hoy_cantidad ?? 0}}</b><small>Calories Burned</small></article>
            <article><span>⚡</span><b>{{totalAsistenciasSemana}}</b><small>Active Minutes</small></article>
            <article><span>♥</span><b>{{progresoSemanal()}}</b><small>Fitness Score</small></article>
          </div>
        </section>

        <section class="cf-live-activity4">
          <article><div class="cf-live-ring">☾</div><div><small>Sleep</small><b>8.3h</b><p>Last night sleep duration</p><em>8.5hrs avg last week.</em></div></article>
          <article><div class="cf-live-ring">◉</div><div><small>Cycling</small><b>3.5 km</b><p>Distance covered today</p><em>2.3hrs avg last week.</em></div></article>
          <article><div class="cf-live-ring">↗</div><div><small>Running</small><b>2.8 km</b><p>Distance covered today</p><em>2.6hrs avg last week.</em></div></article>
          <article><div class="cf-live-ring">🏋</div><div><small>Gym</small><b>{{dashboard?.asistencias?.hoy ?? 0}}h</b><p>Workout duration today</p><em>{{dashboard?.operacion?.rutinas_activas ?? 0}} active routines</em></div></article>
        </section>

        <section class="cf-live-report-grid">
          <article class="cf-live-card cf-live-diet-card">
            <header><div><h2>My Diet Plan</h2><p>Balanced weekly nutrition plan</p></div><b>1,850 kcal/day</b></header>
            <div class="cf-live-meals">
              <div *ngFor="let n of nutricionPreview.slice(0,3); let i=index">
                <span>{{i===0?'🥣':(i===1?'🥗':'🍎')}}</span>
                <div><b>{{n.titulo || (i===0?'Protein Breakfast Bowl':(i===1?'Lean Chicken Bowl':'Green Detox Salad'))}}</b><small>{{n.subtitulo || 'Healthy meal plan'}}</small></div>
                <em>{{i===0?'Breakfast':(i===1?'Lunch':'Dinner')}}</em>
              </div>
              <div *ngIf="!nutricionPreview.length"><span>🥣</span><div><b>Protein Breakfast Bowl</b><small>Oats + eggs + peanut butter</small></div><em>Breakfast</em></div>
              <div *ngIf="!nutricionPreview.length"><span>🥗</span><div><b>Lean Chicken Bowl</b><small>Chicken + rice + veggies</small></div><em>Lunch</em></div>
              <div *ngIf="!nutricionPreview.length"><span>🍎</span><div><b>Green Detox Salad</b><small>Spinach + avocado + seeds</small></div><em>Dinner</em></div>
            </div>
          </article>

          <article class="cf-live-card">
            <header><div><h2>Upcoming Events</h2><p>Your scheduled fitness activities</p></div><b>{{reservas.length || 0}} Events</b></header>
            <div class="cf-live-list">
              <div *ngFor="let r of reservas.slice(0,4)"><span>◫</span><div><b>{{r.clase?.nombre || 'Fitness Session'}}</b><small>{{r.fecha_clase || 'Scheduled'}} · {{nombreEntrenador(r.clase?.entrenador)}}</small></div></div>
              <div *ngIf="!reservas.length"><span>◫</span><div><b>Fitness Retreat Weekend</b><small>Wellness · Outdoor</small></div></div>
              <div *ngIf="!reservas.length"><span>◫</span><div><b>Zumba Dance Session</b><small>Cardio · Group Class</small></div></div>
            </div>
          </article>

          <article class="cf-live-card">
            <header><div><h2>Personal Trainers</h2><p>Top rated fitness experts</p></div><b>1 Trainer</b></header>
            <div class="cf-live-trainer-row" *ngIf="entrenadores[0] as t">
              <img src="assets/showcase/coach-showcase.svg" alt="Trainer">
              <div><b>{{nombreEntrenador(t)}}</b><small>{{t.especialidad || 'Fitness Coach'}}</small><em>Available</em></div>
            </div>
            <div class="cf-live-trainer-row" *ngIf="!entrenadores.length">
              <img src="assets/showcase/coach-showcase.svg" alt="Trainer"><div><b>Mallqui Trainer</b><small>Strength · Conditioning</small><em>Available</em></div>
            </div>
          </article>

          <article class="cf-live-card">
            <header><div><h2>Workout Goals</h2><p>Weekly targets vs progress</p></div><b>3 Active Goals</b></header>
            <div class="cf-live-goal"><label><span>Cardio Training</span><b>80%</b></label><div><i style="width:80%"></i></div><small>Running + Cycling</small></div>
            <div class="cf-live-goal"><label><span>Strength Training</span><b>65%</b></label><div><i style="width:65%"></i></div><small>Weights & Resistance</small></div>
            <div class="cf-live-goal"><label><span>Mobility & Recovery</span><b>45%</b></label><div><i style="width:45%"></i></div><small>Stretching & Yoga</small></div>
          </article>

          <article class="cf-live-card cf-live-chart-card">
            <header><div><h2>Fitness Activity</h2><p>Weekly performance</p></div></header>
            <svg viewBox="0 0 600 180" preserveAspectRatio="none"><path d="M0 135 C70 112 110 125 165 92 S280 118 350 70 S470 88 600 43" fill="none" stroke="#5b55d9" stroke-width="4"/><path d="M0 150 C70 134 110 143 170 120 S285 130 355 98 S470 108 600 76" fill="none" stroke="#9edcc8" stroke-width="3" stroke-dasharray="6 5"/></svg>
          </article>

          <article class="cf-live-card cf-live-chart-card">
            <header><div><h2>Weight Statistics</h2><p>Progress overview</p></div><b>-35 lbs</b></header>
            <div class="cf-live-weight"><span>Start <b>190 lbs</b></span><div><i style="width:78%"></i></div><span>Current <b>155 lbs</b></span></div>
          </article>
        </section>
      </section>

      <section class="cf-live-page" *ngIf="seccion==='rutinas'">
        <div class="cf-special-crumb"><span>⌂</span><small>Home</small><b>›</b><strong>My Workout Plan</strong></div>
        <section class="cf-live-workout-head">
          <div><h1>Great work, {{auth.usuario?.nombre_usuario || 'Administrador'}}</h1><p>You've completed {{progresoSemanal()}}% of your weekly fitness goal.</p></div>
          <div class="cf-live-workout-progress"><small>This Week</small><b>5 of 7 days active</b><em>+12% ↑ vs last week</em><div><i [style.width.%]="progresoSemanal()"></i></div><span>Goal: 100% weekly activity <strong>On Track</strong></span></div>
        </section>
        <section class="cf-live-week-tabs">
          <button *ngFor="let w of [1,2,3,4]" [class.active]="workoutSemana===w" (click)="workoutSemana=w">Week {{w}}</button>
          <button [class.active]="workoutSemana===0" (click)="workoutSemana=0">Summary</button>
        </section>
        <section class="cf-live-exercise-grid">
          <article *ngFor="let r of rutinas.slice(0,3); let i=index">
            <div class="cf-live-exercise-img"><img src="assets/exercises/deadbug_human.webp" alt="Exercise"></div>
            <h3>{{r.nombre_rutina || (i===0?'Squats':(i===1?'Lunges':'Push Ups'))}}</h3>
            <p>{{r.objetivo || '4 Sets • 30 Sec'}}</p>
            <span>{{r.estado || (i===2?'In Progress':'Completed')}}</span>
          </article>
          <ng-container *ngIf="!rutinas.length">
            <article><div class="cf-live-exercise-img"><img src="assets/exercises/deadbug_human.webp" alt="Squats"></div><h3>Squats</h3><p>4 Sets • 30 Sec</p><span>Completed</span></article>
            <article><div class="cf-live-exercise-img"><img src="assets/exercises/deadbug_human.webp" alt="Lunges"></div><h3>Lunges</h3><p>4 Sets • 30 Sec</p><span>Completed</span></article>
            <article><div class="cf-live-exercise-img"><img src="assets/exercises/deadbug_human.webp" alt="Push Ups"></div><h3>Push Ups</h3><p>3 Sets • 40 Sec</p><span>In Progress</span></article>
          </ng-container>
        </section>
        <section class="cf-live-week-summary">
          <h2>{{workoutSemana===0?'Summary':('Week '+workoutSemana)}}</h2>
          <p>{{workoutSemana===4?'Recovery & stretching focus':'6 workouts completed • 1h 20m active'}}</p>
        </section>
      </section>

      <section class="cf-live-page" *ngIf="seccion==='nutricion'">
        <div class="cf-special-crumb"><span>⌂</span><small>Home</small><b>›</b><strong>My Diet Plan</strong></div>
        <section class="cf-live-diet-top">
          <article class="cf-live-card cf-live-diet-main">
            <header><div><h1>Hello {{auth.usuario?.nombre_usuario || 'Administrador'}},</h1><p>Your personalized diet plan for today</p></div><b>3 Meals</b></header>
            <div class="cf-live-dish-grid">
              <div><img src="assets/showcase/class-showcase.svg" alt="Meal"><b>Greek Salad</b><span>210 kcal</span><small>Breakfast</small></div>
              <div><img src="assets/showcase/class-showcase.svg" alt="Meal"><b>Lentil Chili</b><span>180 kcal</span><small>Lunch</small></div>
              <div><img src="assets/showcase/class-showcase.svg" alt="Meal"><b>Apple Salad</b><span>120 kcal</span><small>Dinner</small></div>
            </div>
          </article>
          <article class="cf-live-card cf-live-progress-card">
            <h2>Progress</h2><p>Weekly goal</p><div class="cf-live-progress-ring"><b>{{progresoSemanal()}}%</b></div><small>{{progresoSemanal()}}% of your goal completed.</small>
          </article>
        </section>
        <section class="cf-live-diet-bottom">
          <article class="cf-live-card">
            <header><div><h2>Best Dietitians</h2><p>Nutrition experts</p></div></header>
            <div class="cf-live-list">
              <div><img src="assets/showcase/coach-showcase.svg" alt="Coach"><div><b>{{entrenadores[0] ? nombreEntrenador(entrenadores[0]) : 'Mallqui Coach'}}</b><small>Nutrition Specialist</small></div><em>895 reviews</em></div>
              <div><img src="assets/showcase/coach-showcase.svg" alt="Coach"><div><b>Sports Nutrition</b><small>Wellness Coach</small></div><em>683 reviews</em></div>
              <div><img src="assets/showcase/coach-showcase.svg" alt="Coach"><div><b>Weight Management</b><small>Fitness Nutrition</small></div><em>669 reviews</em></div>
            </div>
          </article>
          <article class="cf-live-card">
            <header><div><h2>Best Dishes</h2><p>Recommended meals</p></div></header>
            <div class="cf-live-meals">
              <div><span>🥗</span><div><b>Protein Bowl</b><small>High protein meal</small></div><em>320 kcal</em></div>
              <div><span>🥣</span><div><b>Lean Chicken Bowl</b><small>Balanced lunch</small></div><em>450 kcal</em></div>
              <div><span>🍎</span><div><b>Green Detox Salad</b><small>Light dinner</small></div><em>280 kcal</em></div>
            </div>
          </article>
        </section>
      </section>

      <section class="cf-live-page" *ngIf="seccion==='asistencias'">
        <div class="cf-special-crumb"><span>⌂</span><small>Home</small><b>›</b><strong>Attendance Tracker</strong></div>
        <section class="cf-live-summary4">
          <article><span>✓</span><b>{{dashboard?.asistencias?.dentro_ahora ?? 0}}</b><small>Present</small></article>
          <article><span>−</span><b>{{clientesActivos}}</b><small>Not Checked-In</small></article>
          <article><span>＋</span><b>{{dashboard?.clientes?.nuevos_mes ?? 0}}</b><small>New Members</small></article>
          <article><span>♙</span><b>{{entrenadores.length || 1}}</b><small>Trainers</small></article>
        </section>
        <section class="cf-live-card cf-live-attendance-card">
          <header><div><h2>Attendance Tracker</h2><p>Member check-in and check-out activity</p></div>
            <div class="cf-live-scan">
              <input [(ngModel)]="asistenciaCodigo" placeholder="MG-000001 or DNI">
              <button (click)="registrarAccesoPorCodigo()" [disabled]="procesandoAccesoCodigo || !asistenciaCodigo.trim()">Check-In</button>
            </div>
          </header>
          <div class="table-wrap"><table class="management-table"><thead><tr><th>Member</th><th>ID</th><th>Date</th><th>Check-In</th><th>Check-Out</th><th>Trainer</th><th>Plan</th><th>Method</th><th>Status</th></tr></thead><tbody>
            <tr *ngFor="let a of asistencias.slice(0,12)">
              <td><b>{{nombreCliente(a.cliente)}}</b></td><td>#M{{a.id_asistencia || a.id || '-'}}</td><td>{{fecha(a.fecha_hora_entrada)}}</td><td>{{fecha(a.fecha_hora_entrada)}}</td><td>{{a.fecha_hora_salida ? fecha(a.fecha_hora_salida) : '-'}}</td><td>{{entrenadores[0] ? nombreEntrenador(entrenadores[0]) : 'Mallqui Trainer'}}</td><td>Mallqui Gym</td><td>Manual</td><td>{{a.estado || 'Completed'}}</td>
            </tr>
            <tr *ngIf="!asistencias.length"><td colspan="9">No attendance records yet.</td></tr>
          </tbody></table></div>
        </section>
      </section>

      <section class="cf-live-page" *ngIf="seccion==='entrenador'">
        <div class="cf-special-crumb"><span>⌂</span><small>Home</small><b>›</b><strong>Trainers</strong></div>
        <section class="cf-live-welcome cf-live-trainers-head">
          <div><h1>Hello, {{auth.usuario?.nombre_usuario || 'Administrador'}}</h1><p>Checkout the list of our world class trainers.</p></div>
          <div class="cf-live-summary4">
            <article><span>🏋</span><b>{{entrenadores[0]?.clases_count || 0}}</b><small>Strength Sessions</small></article>
            <article><span>◌</span><b>{{clases.length}}</b><small>Yoga Classes</small></article>
            <article><span>↗</span><b>{{rutinas.length}}</b><small>Cardio Workouts</small></article>
            <article><span>♙</span><b>1</b><small>Personal Training</small></article>
          </div>
        </section>
        <section class="cf-live-trainer-grid">
          <article class="cf-live-trainer-card" *ngIf="entrenadores[0] as t; else trainerEmpty">
            <img src="assets/showcase/coach-showcase.svg" alt="Gym trainer">
            <h2>{{nombreEntrenador(t)}}</h2><p>{{t.especialidad || 'Strength & Conditioning'}}</p>
            <ul><li><b>Experience</b><span>Mallqui Gym</span></li><li><b>Available</b><span>{{configuracionForm.hora_apertura}} - {{configuracionForm.hora_cierre}}</span></li><li><b>Clients Trained</b><span>{{clientesActivos}}+</span></li></ul>
            <button (click)="cambiarSeccion('trainer-profile')">View Profile</button>
          </article>
          <ng-template #trainerEmpty><article class="cf-live-trainer-card"><img src="assets/showcase/coach-showcase.svg" alt="Gym trainer"><h2>Mallqui Trainer</h2><p>Strength & Conditioning</p><button (click)="seccion='entrenador-admin'">Register Trainer</button></article></ng-template>
        </section>
      </section>

      <section class="cf-live-page" *ngIf="seccion==='planes'">
        <div class="cf-special-crumb"><span>⌂</span><small>Home</small><b>›</b><strong>Pricing Plans</strong></div>
        <section class="cf-live-pricing-head"><h1>Try us for Free,</h1><p>Get your free 1-day pass!</p></section>
        <section class="cf-live-pricing-grid">
          <article *ngFor="let p of planesMembresia.slice(0,3); let i=index" [class.featured]="i===1">
            <h2>{{p.nombre || (i===0?'Basic':(i===1?'Premium':'Enterprise'))}}</h2>
            <h3>S/ {{p.precio || 0}} <small>Per {{p.duracion_meses || 1}} Month</small></h3>
            <b>{{i===0?'30':(i===1?'70':'150')}} Credits</b>
            <ul><li>✓ Gym access</li><li>✓ Workout sessions</li><li>✓ Member support</li><li [class.disabled]="i===0">✓ Trainer</li><li [class.disabled]="i<2">✓ Analytics Dashboard</li></ul>
            <button>{{i===0?'Current Package':'Select Plan'}}</button>
          </article>
          <ng-container *ngIf="!planesMembresia.length">
            <article><h2>Basic</h2><h3>S/ 60 <small>Per Month</small></h3><b>30 Credits</b><ul><li>✓ Gym access</li><li>✓ Workout sessions</li><li>✓ Member support</li><li class="disabled">No Trainer</li><li class="disabled">No Analytics</li></ul><button>Current Package</button></article>
            <article class="featured"><h2>Premium</h2><h3>S/ 90 <small>Per Month</small></h3><b>70 Credits</b><ul><li>✓ Gym access</li><li>✓ Workout sessions</li><li>✓ Junior Trainer</li><li>✓ Member support</li><li class="disabled">No Analytics</li></ul><button>Select Plan</button></article>
            <article><h2>Enterprise</h2><h3>S/ 120 <small>Per Month</small></h3><b>150 Credits</b><ul><li>✓ Gym access</li><li>✓ Workout sessions</li><li>✓ Dedicated Trainer</li><li>✓ Member support</li><li>✓ Analytics Dashboard</li></ul><button>Select Plan</button></article>
          </ng-container>
        </section>
      </section>

      <section class="cf-live-page" *ngIf="seccion==='pagos'">
        <div class="cf-special-crumb"><span>⌂</span><small>Home</small><b>›</b><strong>Payments</strong></div>
        <section class="cf-live-card cf-live-payments">
          <header><div><h2>Payments by Month</h2><p>Summary</p></div><b>{{pagos.length}} records</b></header>
          <div class="table-wrap"><table class="management-table"><thead><tr><th>#</th><th>Invoice No.</th><th>Member Name</th><th>Payment Method</th><th>Paid Date</th><th>Amount</th><th>Status</th></tr></thead><tbody>
            <tr *ngFor="let p of pagos; let i=index"><td>{{i+1}}</td><td>#INV-{{p.id_pago}}</td><td>{{clientePago(p)}}</td><td>{{p.metodo_pago}}</td><td>{{fecha(p.fecha_pago)}}</td><td>S/ {{p.monto | number:'1.2-2'}}</td><td>{{p.estado_pago}}</td></tr>
            <tr *ngIf="!pagos.length"><td colspan="7">No payments registered.</td></tr>
          </tbody></table></div>
        </section>
      </section>

      <section class="cf-universal-module" *ngIf="seccion!=='dashboard' && !['reportes','rutinas','nutricion','asistencias','entrenador','planes','pagos'].includes(seccion) && !extraModules.includes(seccion) && !suiteModules.includes(seccion)">
        <div class="cf-special-crumb">
          <span>⌂</span><small>Inicio</small><b>›</b><strong>{{tituloActual}}</strong>
          <em>{{estadoModuloActual}}</em>
        </div>

        <section class="cf-universal-hero" [ngClass]="'variant-'+estiloModuloActual">
          <div class="cf-universal-copy">
            <span>{{etiquetaModuloActual}}</span>
            <h1>{{tituloActual}}</h1>
            <p>{{subtituloActual}}</p>

            <div class="cf-universal-metrics">
              <article *ngFor="let m of metricasModuloActual; let i=index">
                <span>{{m.icon}}</span>
                <div><b>{{m.value}}</b><small>{{m.label}}</small></div>
              </article>
            </div>
          </div>

          <div class="cf-universal-art" aria-hidden="true">
            <svg *ngIf="estiloModuloActual==='personas'" viewBox="0 0 560 280">
              <rect width="560" height="280" fill="#f8f7ff"/>
              <circle cx="472" cy="48" r="28" fill="#ffa11a"/>
              <path d="M0 225c100-50 205-42 302-10 92 31 171 8 258-28v93H0z" fill="#acd596"/>
              <g fill="#d9d7f4"><rect x="352" y="102" width="42" height="118"/><rect x="403" y="78" width="51" height="142"/><rect x="465" y="119" width="39" height="101"/></g>
              <circle cx="160" cy="109" r="24" fill="#2f3159"/>
              <path d="M135 151c13-28 53-28 67 0l19 68h-106z" fill="#6b64e8"/>
              <circle cx="277" cy="121" r="21" fill="#ff9b55"/>
              <path d="M254 155c12-22 46-22 58 0l18 61h-94z" fill="#ff8e42"/>
              <circle cx="84" cy="132" r="18" fill="#65c99f"/>
              <path d="M63 161c9-18 39-18 49 0l15 54H48z" fill="#77d1ad"/>
            </svg>

            <svg *ngIf="estiloModuloActual==='operacion'" viewBox="0 0 560 280">
              <rect width="560" height="280" fill="#f8f7ff"/>
              <path d="M0 232c108-44 201-36 288-15 104 25 178 10 272-28v91H0z" fill="#edf6e8"/>
              <g fill="#d9d7f4"><rect x="355" y="95" width="48" height="132"/><rect x="414" y="72" width="58" height="155"/><rect x="483" y="111" width="40" height="116"/></g>
              <g stroke="#2f3159" stroke-width="5" fill="none">
                <circle cx="113" cy="217" r="28"/><circle cx="210" cy="217" r="28"/>
                <path d="M113 217l43-40 29 40h-45l32-56 38 56"/>
              </g>
              <circle cx="162" cy="135" r="12" fill="#2f3159"/>
              <path d="M156 149c14 12 18 26 16 45" stroke="#ff8e42" stroke-width="11" stroke-linecap="round"/>
              <path d="M169 169l33 11" stroke="#ff8e42" stroke-width="8" stroke-linecap="round"/>
              <path d="M170 190l-18 35M176 191l26 32" stroke="#4a57a7" stroke-width="8" stroke-linecap="round"/>
              <rect x="292" y="173" width="92" height="14" rx="7" fill="#6b65e6"/>
              <rect x="318" y="128" width="14" height="60" rx="7" fill="#ff9f43"/>
              <rect x="344" y="137" width="14" height="51" rx="7" fill="#ff9f43"/>
            </svg>

            <svg *ngIf="estiloModuloActual==='finanzas'" viewBox="0 0 560 280">
              <rect width="560" height="280" fill="#f8f7ff"/>
              <circle cx="474" cy="48" r="27" fill="#ffa11a"/>
              <path d="M0 232c104-50 220-34 309-7 100 30 168 9 251-24v79H0z" fill="#eaf5e5"/>
              <rect x="86" y="89" width="55" height="137" rx="9" fill="#c8c5f4"/>
              <rect x="157" y="126" width="55" height="100" rx="9" fill="#aaa6ed"/>
              <rect x="228" y="67" width="55" height="159" rx="9" fill="#7770e7"/>
              <rect x="299" y="107" width="55" height="119" rx="9" fill="#928ceb"/>
              <path d="M76 176c72-54 133-7 197-61 47-40 85-33 147-78" fill="none" stroke="#5a55dd" stroke-width="7" stroke-linecap="round"/>
              <circle cx="420" cy="37" r="9" fill="#5a55dd"/>
            </svg>

            <svg *ngIf="estiloModuloActual==='contenido'" viewBox="0 0 560 280">
              <rect width="560" height="280" fill="#f8f7ff"/>
              <path d="M0 226c110-60 222-38 308-7 101 36 168 8 252-28v89H0z" fill="#a8d092"/>
              <circle cx="470" cy="51" r="27" fill="#ffa11a"/>
              <rect x="89" y="74" width="192" height="133" rx="15" fill="#fff" stroke="#dad8f3" stroke-width="4"/>
              <rect x="108" y="96" width="154" height="73" rx="9" fill="#eeeefe"/>
              <circle cx="144" cy="127" r="18" fill="#ff9a54"/>
              <path d="M119 158l34-24 24 17 33-33 42 51H109z" fill="#8d87e9"/>
              <rect x="111" y="184" width="89" height="8" rx="4" fill="#c7c4ef"/>
              <rect x="212" y="184" width="39" height="8" rx="4" fill="#dfddf6"/>
              <g transform="translate(330 112)">
                <circle cx="45" cy="20" r="17" fill="#2f3159"/>
                <path d="M28 49c9-20 38-20 47 0l18 70H10z" fill="#6b64e8"/>
                <path d="M26 65l-26 24M76 65l27 20" stroke="#efaa83" stroke-width="9" stroke-linecap="round"/>
              </g>
            </svg>

            <svg *ngIf="estiloModuloActual==='sistema'" viewBox="0 0 560 280">
              <rect width="560" height="280" fill="#f8f7ff"/>
              <circle cx="472" cy="50" r="26" fill="#ffa11a"/>
              <path d="M0 231c97-48 208-38 292-13 99 30 171 12 268-23v85H0z" fill="#edf6e9"/>
              <rect x="92" y="71" width="241" height="145" rx="14" fill="#fff" stroke="#d9d7f4" stroke-width="4"/>
              <rect x="111" y="91" width="203" height="84" rx="8" fill="#f0efff"/>
              <rect x="169" y="188" width="88" height="9" rx="4" fill="#716be4"/>
              <circle cx="383" cy="109" r="44" fill="#ebe9ff"/>
              <path d="M383 78v62M352 109h62" stroke="#625ce1" stroke-width="13" stroke-linecap="round"/>
              <circle cx="451" cy="173" r="33" fill="#fff0e7"/>
              <path d="M451 153v40M431 173h40" stroke="#ef9846" stroke-width="10" stroke-linecap="round"/>
            </svg>
          </div>
        </section>

        <section class="cf-universal-panels">
          <article *ngFor="let p of panelesModuloActual; let i=index" [class.accent]="i===1">
            <header><span>{{p.icon}}</span><div><h3>{{p.title}}</h3><p>{{p.subtitle}}</p></div><b>{{p.badge}}</b></header>
            <div class="cf-panel-visual" [ngClass]="'visual-'+estiloModuloActual">
              <i *ngFor="let h of p.bars" [style.height.%]="h"></i>
            </div>
          </article>
        </section>
      </section>

      <nav class="admin-module-tabs" *ngIf="seccion!=='dashboard' && tabsModuloActual.length" [attr.aria-label]="'Opciones de '+nombreModuloActual">
        <button type="button"
                *ngFor="let tab of tabsModuloActual"
                [class.active]="seccion===tab.id"
                (click)="cambiarSeccion(tab.id)">
          <span>{{tab.nombre}}</span>
          <b *ngIf="badgeTab(tab.id)>0">{{badgeTab(tab.id)}}</b>
        </button>
      </nav>

      <div *ngIf="toast" class="admin-toast success">{{toast}}</div>
      <div *ngIf="error && seccion!=='dashboard'" class="admin-toast error">⚠ {{error}}</div>

      <ng-container *ngIf="seccion==='dashboard'">
        <section class="cf-reference-dashboard" data-dashboard-ui="crossfit-reference">
          <section class="crossfit-dashboard-breadcrumb">
            <span>⌂</span>
            <small>Home</small>
            <b>›</b>
            <strong>My Dashboard</strong>
            <em class="cf-goal">Weekly Goal Progress: {{progresoSemanal()}}% Achieved</em>
          </section>

          <section class="cf-ref-hero">
            <div class="cf-ref-hero-copy">
              <h1>Hey, {{auth.usuario?.nombre_usuario || 'Administrador'}}</h1>
              <p>Here is your daily activity and reports.</p>

              <div class="cf-ref-mini-chart" aria-label="Actividad semanal">
                <div class="cf-ref-mini-day" *ngFor="let d of diasActividadDashboard()">
                  <div class="cf-ref-mini-track">
                    <div class="cf-ref-mini-fill" [style.height.%]="alturaAsistenciaSemana(d.total)">
                      <span></span><i></i>
                    </div>
                  </div>
                  <small>{{d.dia}}</small>
                </div>
              </div>
              <div class="cf-ref-mini-legend">
                <span><i class="mint"></i>Cardio</span>
                <span><i class="purple"></i>Strength</span>
              </div>
            </div>

            <div class="cf-ref-hero-art" aria-hidden="true">
              <svg viewBox="0 0 760 430" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <linearGradient id="refHill" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#b7dda7"/>
                    <stop offset="100%" stop-color="#8cc67d"/>
                  </linearGradient>
                </defs>
                <rect width="760" height="430" fill="#fbfbff"/>
                <path d="M55 170c73-98 177-120 280-82 84 31 103 103 188 96 65-6 113-45 182-10v95H55z" fill="#f0effd"/>
                <circle cx="623" cy="97" r="39" fill="#ffa31a"/>
                <g fill="#d9d8ef">
                  <rect x="352" y="188" width="54" height="139" rx="2"/>
                  <rect x="419" y="165" width="67" height="162" rx="2"/>
                  <rect x="499" y="208" width="53" height="119" rx="2"/>
                  <rect x="566" y="177" width="65" height="150" rx="2"/>
                  <rect x="646" y="216" width="47" height="111" rx="2"/>
                </g>
                <g fill="#f3f2fb">
                  <path d="M352 212h54v10h-54zM352 240h54v10h-54zM352 268h54v10h-54zM352 296h54v10h-54z"/>
                  <path d="M419 190h67v11h-67zM419 219h67v11h-67zM419 248h67v11h-67zM419 277h67v11h-67z"/>
                  <path d="M499 232h53v10h-53zM499 258h53v10h-53zM499 284h53v10h-53z"/>
                  <path d="M566 200h65v11h-65zM566 228h65v11h-65zM566 256h65v11h-65zM566 284h65v11h-65z"/>
                  <path d="M646 240h47v10h-47zM646 265h47v10h-47zM646 290h47v10h-47z"/>
                </g>
                <path d="M0 340c111-69 238-69 365-32 141 41 273 12 395-2v124H0z" fill="url(#refHill)"/>

                <g transform="translate(60 253)">
                  <circle cx="44" cy="90" r="34" fill="none" stroke="#2d3157" stroke-width="6"/>
                  <circle cx="160" cy="90" r="34" fill="none" stroke="#2d3157" stroke-width="6"/>
                  <path d="M44 90l50-48 34 48H76l38-65 46 65" fill="none" stroke="#f18b3d" stroke-width="6" stroke-linejoin="round"/>
                  <circle cx="106" cy="7" r="12" fill="#293053"/>
                  <path d="M100 23c15 15 20 27 18 43" fill="none" stroke="#ff984f" stroke-width="12" stroke-linecap="round"/>
                  <path d="M116 47l32 12M113 63l-19 40M119 65l29 36" fill="none" stroke="#354d96" stroke-width="8" stroke-linecap="round"/>
                </g>

                <g transform="translate(275 241) scale(.93)">
                  <circle cx="44" cy="90" r="34" fill="none" stroke="#2d3157" stroke-width="6"/>
                  <circle cx="160" cy="90" r="34" fill="none" stroke="#2d3157" stroke-width="6"/>
                  <path d="M44 90l50-48 34 48H76l38-65 46 65" fill="none" stroke="#f18b3d" stroke-width="6" stroke-linejoin="round"/>
                  <circle cx="106" cy="7" r="12" fill="#293053"/>
                  <path d="M100 23c15 15 20 27 18 43" fill="none" stroke="#6962df" stroke-width="12" stroke-linecap="round"/>
                  <path d="M116 47l32 12M113 63l-19 40M119 65l29 36" fill="none" stroke="#354d96" stroke-width="8" stroke-linecap="round"/>
                </g>

                <g transform="translate(484 260) scale(.78)">
                  <circle cx="44" cy="90" r="34" fill="none" stroke="#2d3157" stroke-width="6"/>
                  <circle cx="160" cy="90" r="34" fill="none" stroke="#2d3157" stroke-width="6"/>
                  <path d="M44 90l50-48 34 48H76l38-65 46 65" fill="none" stroke="#f18b3d" stroke-width="6" stroke-linejoin="round"/>
                  <circle cx="106" cy="7" r="12" fill="#293053"/>
                  <path d="M100 23c15 15 20 27 18 43" fill="none" stroke="#ff9f43" stroke-width="12" stroke-linecap="round"/>
                  <path d="M116 47l32 12M113 63l-19 40M119 65l29 36" fill="none" stroke="#354d96" stroke-width="8" stroke-linecap="round"/>
                </g>
              </svg>
            </div>
          </section>

          <section class="cf-ref-stats">
            <button type="button" (click)="cambiarSeccion('reportes')">
              <div><small>Calories Burned</small><strong>1,240 kcal</strong><span>+12% this week</span></div>
              <i>🔥</i>
            </button>
            <button type="button" (click)="cambiarSeccion('rutinas')">
              <div><small>Active Minutes</small><strong>92 mins</strong><span>Goal Achieved</span></div>
              <i>⚡</i>
            </button>
            <button type="button" (click)="cambiarSeccion('asistencias')">
              <div><small>Steps</small><strong>8,420</strong><span>Goal: 10,000</span></div>
              <i>↗</i>
            </button>
            <button type="button" (click)="cambiarSeccion('reportes')">
              <div><small>Sleep</small><strong>7h 20m</strong><span>Good Recovery</span></div>
              <i>☾</i>
            </button>
          </section>

          <section class="cf-ref-bottom">
            <article class="cf-ref-activity">
              <header>
                <div><h2>Weekly Activity</h2><p>Performance breakdown · last 7 days</p></div>
                <span>6 Workouts · 5h 40m</span>
              </header>
              <div class="cf-ref-chart-legend">
                <span><i class="purple"></i>Attendance</span>
                <span><i class="mint"></i>Progress</span>
              </div>
              <div class="cf-ref-line-chart">
                <div class="cf-ref-grid-lines"><i></i><i></i><i></i><i></i><i></i></div>
                <svg viewBox="0 0 760 220" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#6a63df" stop-opacity=".22"/>
                      <stop offset="100%" stop-color="#6a63df" stop-opacity=".01"/>
                    </linearGradient>
                  </defs>
                  <path d="M0 157 C80 137 110 124 170 132 S275 150 335 119 S445 91 510 78 S625 58 760 68 L760 220 L0 220Z" fill="url(#activityFill)"/>
                  <path d="M0 157 C80 137 110 124 170 132 S275 150 335 119 S445 91 510 78 S625 58 760 68" fill="none" stroke="#5d57d8" stroke-width="3"/>
                  <path d="M0 167 C80 147 120 139 175 143 S278 151 340 130 S448 108 515 95 S625 75 760 82" fill="none" stroke="#9edac4" stroke-width="2" stroke-dasharray="5 5"/>
                </svg>
                <div class="cf-ref-xaxis"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
              </div>
            </article>

            <article class="cf-ref-split">
              <header><div><h2>Workout Split</h2><p>Last 7 days activity</p></div><span>12 Sessions</span></header>
              <div class="cf-ref-donut"><div><strong>100%</strong><small>Total</small></div></div>
              <div class="cf-ref-split-list">
                <p><span><i class="purple"></i>Cardio</span><b>48%</b></p>
                <p><span><i class="mint"></i>Strength</span><b>34%</b></p>
                <p><span><i class="soft"></i>Mobility</span><b>26%</b></p>
              </div>
            </article>
          </section>

          <section class="cf-ref-secondary">
            <article class="cf-ref-history">
              <header><div><h2>Workout History</h2><p>Recent training activity</p></div></header>
              <div class="cf-ref-history-list">
                <div><span>↗</span><div><b>Morning Run</b><small>Outdoor • Moderate pace</small></div><em>35 min<br>320 kcal</em><strong>Today</strong></div>
                <div><span>🏋</span><div><b>Strength Training</b><small>Upper body • Push focus</small></div><em>50 min<br>410 kcal</em><strong>Yesterday</strong></div>
                <div><span>◉</span><div><b>Cycling Session</b><small>Indoor bike • Resistance 6</small></div><em>40 min<br>290 kcal</em><strong>2d ago</strong></div>
                <div><span>⚡</span><div><b>HIIT Workout</b><small>High intensity interval</small></div><em>25 min<br>260 kcal</em><strong>3d ago</strong></div>
              </div>
            </article>

            <article class="cf-ref-strength">
              <header><div><h2>Strength Progress</h2><p>Bench Press • 12-week performance trend</p></div><b>+18% Improvement</b></header>
              <div class="cf-ref-strength-chart">
                <svg viewBox="0 0 560 180" preserveAspectRatio="none"><path d="M10 150 C80 145 110 128 160 130 S245 112 300 104 S390 80 445 70 S510 48 550 40" fill="none" stroke="#5b55d9" stroke-width="4"/></svg>
              </div>
              <footer><span>Start <b>60 kg</b></span><span>Latest <b>85 kg</b></span><span>Best Set <b>90 kg</b></span><span>Target <b>100 kg</b></span></footer>
            </article>
          </section>

          <section class="cf-ref-tertiary">
            <article>
              <header><div><h2>Sleep Recovery</h2><p>Last 7 days • Quality tracking</p></div><b>7.6h avg • Good</b></header>
              <div class="cf-ref-sleep-bars"><i style="height:66%"></i><i style="height:78%"></i><i style="height:72%"></i><i style="height:88%"></i><i style="height:81%"></i><i style="height:92%"></i><i style="height:85%"></i></div>
              <footer><span>Best Night <b>8.4h</b></span><span>Consistency <b>+12%</b></span><span>Deep Sleep <b>2.1h</b></span></footer>
            </article>
            <article>
              <header><div><h2>Workout Frequency</h2><p>Target 60/90</p></div></header>
              <div class="cf-ref-frequency"><div><strong>{{progresoSemanal()}}%</strong><small>Weekly</small></div></div>
            </article>
          </section>

          <section class="cf-ref-insights">
            <article class="cf-ref-smart">
              <header><div><h2>Smart Insights</h2><p>AI-based weekly performance summary</p></div><b>Live Analysis</b></header>
              <div class="cf-ref-insight-list">
                <div><span>☾</span><div><b>Sleep Improvement</b><small>You slept 12% better than last week with improved recovery cycles.</small></div><em>+12%</em></div>
                <div><span>↘</span><div><b>Weekend Drop in Activity</b><small>Your workout activity dropped significantly on weekends compared to weekdays.</small></div><em>-18%</em></div>
                <div><span>◎</span><div><b>Goal Progress</b><small>You've completed {{progresoSemanal()}}% of your weekly fitness goal. Keep the momentum.</small></div><em>{{progresoSemanal()}}%</em></div>
                <div><span>🔥</span><div><b>Calorie Burn Trend</b><small>Your average calorie burn increased during strength sessions this week.</small></div><em>+9%</em></div>
              </div>
            </article>
            <article class="cf-ref-weight">
              <header><div><h2>Weight Management</h2><p>Progress overview • Last 12 months</p></div><b>-35 lbs</b></header>
              <div class="cf-ref-weight-track"><i style="width:78%"></i></div>
              <div class="cf-ref-weight-labels"><span>Start <b>190 lbs</b></span><span>Steady Fat Loss</span><span>Current <b>155 lbs</b></span></div>
              <small>Target: 160 lbs</small>
            </article>
          </section>
        </section>
      </ng-container>

      <app-admin-crossfit-extras
        *ngIf="extraModules.includes(seccion)"
        [section]="seccion">
      </app-admin-crossfit-extras>

      <app-admin-gym-suite
        *ngIf="suiteModules.includes(seccion)"
        [modulo]="seccion">
      </app-admin-gym-suite>

      <ng-container *ngIf="seccion==='clientes'">
        <section class="clients-v3-shell">
          <header class="clients-v3-hero">
            <div class="clients-v3-hero-copy">
              <span>MEMBERS MANAGEMENT</span>
              <h2>Members</h2>
              <p>Administra los datos, accesos y estado de tus miembros desde un solo lugar.</p>
            </div>
            <button type="button" class="clients-v3-new" (click)="nuevoCliente()">
              <span>＋</span>
              Add Member
            </button>
          </header>

          <section class="clients-v3-stats">
            <article>
              <span class="clients-v3-stat-icon">♙</span>
              <div><small>TOTAL MEMBERS</small><b>{{clientes.length}}</b><p>registros en el sistema</p></div>
            </article>
            <article>
              <span class="clients-v3-stat-icon success">✓</span>
              <div><small>ACTIVE MEMBERS</small><b>{{clientesActivos}}</b><p>pueden usar el servicio</p></div>
            </article>
            <article>
              <span class="clients-v3-stat-icon muted">–</span>
              <div><small>INACTIVE MEMBERS</small><b>{{clientesInactivos}}</b><p>historial conservado</p></div>
            </article>
          </section>

          <article class="clients-v3-card">
            <div class="clients-v3-toolbar">
              <div class="clients-v3-search">
                <span>⌕</span>
                <input
                  [(ngModel)]="clientesBusqueda"
                  (ngModelChange)="clientesPagina=1"
                  placeholder="Buscar por DNI, nombre, correo o teléfono">
              </div>

              <select
                class="clients-v3-filter"
                [(ngModel)]="clientesEstadoFiltro"
                (ngModelChange)="clientesPagina=1">
                <option value="">Todos los estados</option>
                <option value="Activo">Solo activos</option>
                <option value="Inactivo">Solo inactivos</option>
              </select>

              <button type="button" class="clients-v3-refresh" (click)="cargarClientes()">
                ↻ Actualizar
              </button>
            </div>

            <div class="clients-v3-table-wrap">
              <table class="clients-v3-table">
                <thead>
                  <tr>
                    <th>CLIENTE</th>
                    <th>DNI</th>
                    <th>CONTACTO</th>
                    <th>ESTADO</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let c of clientesPaginados">
                    <td>
                      <div class="clients-v3-person">
                        <span>{{inicialesCliente(c)}}</span>
                        <div>
                          <b>{{nombreCliente(c)}}</b>
                          <small>Cliente #{{c.id_cliente}}</small>
                        </div>
                      </div>
                    </td>
                    <td><span class="clients-v3-dni">{{c.dni || 'Sin DNI'}}</span></td>
                    <td>
                      <div class="clients-v3-contact">
                        <b>{{c.correo || 'Sin correo'}}</b>
                        <small>{{c.telefono || 'Sin teléfono'}}</small>
                      </div>
                    </td>
                    <td>
                      <span class="clients-v3-status" [class.inactive]="c.estado!=='Activo'">
                        <i></i>{{c.estado}}
                      </span>
                    </td>
                    <td>
                      <div class="clients-v3-actions">
                        <button type="button" class="view" (click)="abrirFichaCliente(c.id_cliente)">Ver ficha</button>
                        <button type="button" class="edit" (click)="editarCliente(c)">Editar</button>
                        <button *ngIf="c.estado==='Activo'" type="button" class="danger" (click)="desactivarCliente(c.id_cliente)">Desactivar</button>
                      </div>
                    </td>
                  </tr>

                  <tr *ngIf="!clientesPaginados.length">
                    <td colspan="5">
                      <div class="clients-v3-empty">
                        <span>⌕</span>
                        <b>No encontramos clientes</b>
                        <p>Prueba otra búsqueda o registra un nuevo miembro.</p>
                        <button type="button" (click)="nuevoCliente()">＋ Registrar cliente</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <footer class="clients-v3-footer">
              <span>Mostrando {{clientesPaginados.length}} de {{clientesFiltrados.length}} clientes</span>
              <div *ngIf="clientesPaginasTotal>1">
                <button type="button" [disabled]="clientesPagina<=1" (click)="clientesPagina=clientesPagina-1">←</button>
                <b>{{clientesPagina}} / {{clientesPaginasTotal}}</b>
                <button type="button" [disabled]="clientesPagina>=clientesPaginasTotal" (click)="clientesPagina=clientesPagina+1">→</button>
              </div>
            </footer>
          </article>
        </section>

        <div *ngIf="clienteFormularioAbierto" class="client-editor-backdrop" (click)="cerrarFormularioCliente()">
          <aside class="client-editor-panel" (click)="$event.stopPropagation()">
            <header class="client-editor-head">
              <div>
                <span>{{clienteEditandoId ? 'EDITAR MIEMBRO' : 'NUEVO MIEMBRO'}}</span>
                <h2>{{clienteEditandoId ? 'Actualizar cliente' : 'Registrar cliente'}}</h2>
                <p>{{clienteEditandoId ? 'Modifica la información y guarda los cambios.' : 'Completa los datos principales del nuevo miembro.'}}</p>
              </div>
              <button type="button" (click)="cerrarFormularioCliente()" aria-label="Cerrar">×</button>
            </header>

            <form #clienteNgForm="ngForm" class="client-editor-form" (ngSubmit)="guardarCliente()">
              <section class="client-editor-section">
                <div class="client-editor-section-title">
                  <span>1</span>
                  <div><b>Datos personales</b><small>Información principal del miembro</small></div>
                </div>

                <div class="client-editor-grid two">
                  <label>DNI
                    <input [(ngModel)]="clienteForm.dni" name="dni" required maxlength="15" placeholder="Ej. 74257012">
                  </label>
                  <label>Estado
                    <select [(ngModel)]="clienteForm.estado" name="clienteEstado">
                      <option>Activo</option>
                      <option>Inactivo</option>
                    </select>
                  </label>
                </div>

                <div class="client-editor-grid two">
                  <label>Nombres
                    <input [(ngModel)]="clienteForm.nombres" name="nombres" required placeholder="Nombres">
                  </label>
                  <label>Apellidos
                    <input [(ngModel)]="clienteForm.apellidos" name="apellidos" required placeholder="Apellidos">
                  </label>
                </div>
              </section>

              <section class="client-editor-section">
                <div class="client-editor-section-title">
                  <span>2</span>
                  <div><b>Contacto</b><small>Datos para comunicación con el cliente</small></div>
                </div>

                <div class="client-editor-grid two">
                  <label>Teléfono
                    <input [(ngModel)]="clienteForm.telefono" name="telefono" placeholder="Ej. 999 999 999">
                  </label>
                  <label>Correo
                    <input type="email" [(ngModel)]="clienteForm.correo" name="correo"
                      [required]="!clienteEditandoId && clienteForm.crear_acceso"
                      placeholder="cliente@gmail.com">
                  </label>
                </div>

                <label>Dirección
                  <input [(ngModel)]="clienteForm.direccion" name="direccion" placeholder="Dirección del cliente">
                </label>
              </section>

              <section *ngIf="!clienteEditandoId" class="client-editor-section access-section">
                <div class="client-editor-section-title">
                  <span>3</span>
                  <div><b>Acceso al portal</b><small>Opcional: crea su cuenta de cliente ahora</small></div>
                </div>

                <label class="client-editor-switch">
                  <input type="checkbox" [(ngModel)]="clienteForm.crear_acceso" name="crear_acceso">
                  <span class="switch-ui"><i></i></span>
                  <div>
                    <b>Crear cuenta de acceso</b>
                    <small>El cliente podrá iniciar sesión en su portal personal.</small>
                  </div>
                </label>

                <div *ngIf="clienteForm.crear_acceso" class="client-editor-access-fields">
                  <label>Usuario
                    <input [(ngModel)]="clienteForm.nombre_usuario" name="cliente_usuario" required placeholder="Ej. german7425">
                  </label>
                  <label>Contraseña temporal
                    <input type="password" minlength="8" [(ngModel)]="clienteForm.contrasena" name="cliente_clave" required placeholder="Mínimo 8 caracteres">
                  </label>
                </div>
              </section>

              <footer class="client-editor-footer">
                <button type="button" class="cancel" (click)="cerrarFormularioCliente()">Cancelar</button>
                <button type="submit" class="save" [disabled]="clienteNgForm.invalid || guardandoCliente">
                  <span>{{guardandoCliente ? 'Guardando...' : (clienteEditandoId ? 'Guardar cambios' : 'Registrar cliente')}}</span>
                  <b>{{guardandoCliente ? '•••' : '→'}}</b>
                </button>
              </footer>
            </form>
          </aside>
        </div>
      </ng-container>

      <ng-container *ngIf="seccion==='membresias'">
        <section class="management-grid">
          <article class="admin-form-card">
            <div class="management-heading">
              <div>
                <h2>Asignar o renovar membresía</h2>
                <p>Selecciona un socio y una tarifa activa. Este flujo registra la membresía y su pago.</p>
              </div>
              <span>✦</span>
            </div>
            <form (ngSubmit)="contratarMembresia()">
              <label>Cliente
                <select [(ngModel)]="membresiaForm.id_cliente" name="mcliente" required>
                  <option [ngValue]="0">Seleccionar</option>
                  <option *ngFor="let c of clientes" [ngValue]="c.id_cliente">{{nombreCliente(c)}}</option>
                </select>
              </label>
              <label>Tarifa
                <select [(ngModel)]="membresiaForm.id_membresia" name="mplan" required>
                  <option [ngValue]="0">Seleccionar</option>
                  <option *ngFor="let m of membresiasDisponibles" [ngValue]="m.id_membresia">{{m.nombre}} · {{m.duracion_meses}} mes(es) · S/ {{m.precio}}</option>
                </select>
              </label>
              <div class="form-row">
                <label>Método
                  <select [(ngModel)]="membresiaForm.metodo_pago" name="mmetodo">
                    <option>Efectivo</option><option>Yape</option><option>Plin</option><option>Transferencia</option><option>Tarjeta</option>
                  </select>
                </label>
                <label>N° operación
                  <input [(ngModel)]="membresiaForm.numero_operacion" name="moperacion" [required]="membresiaForm.metodo_pago!=='Efectivo'" [placeholder]="membresiaForm.metodo_pago==='Efectivo' ? 'No requerido' : 'Requerido'">
                </label>
              </div>
              <button class="admin-primary" type="submit">Asignar membresía</button>
              <button class="admin-secondary" type="button" (click)="cambiarSeccion('planes')">Administrar tarifas</button>
            </form>
          </article>

          <article class="admin-list-card wide-card">
            <div class="management-heading">
              <div><h2>Membresías de socios</h2><p>Vigencia real registrada en MySQL.</p></div>
              <span class="big-number">{{membresiasCliente.length}}</span>
            </div>
            <div class="table-wrap">
              <table class="management-table">
                <thead><tr><th>ID</th><th>Cliente</th><th>Membresía</th><th>Inicio</th><th>Fin</th><th>Estado</th></tr></thead>
                <tbody>
                  <tr *ngFor="let m of membresiasCliente">
                    <td>{{m.id_cliente_membresia}}</td>
                    <td><b>{{nombreCliente(m.cliente)}}</b></td>
                    <td>{{m.membresia?.nombre}}</td>
                    <td>{{m.fecha_inicio}}</td>
                    <td>{{m.fecha_fin}}</td>
                    <td>{{m.estado}}</td>
                  </tr>
                  <tr *ngIf="!membresiasCliente.length"><td colspan="6">No hay membresías asignadas todavía.</td></tr>
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='pagos-admin'">
        <section class="admin-list-card">
          <div class="management-heading">
            <div>
              <h2>Historial de pagos de membresías</h2>
              <p>Los pagos digitales se registran automáticamente. Los pagos en efectivo quedan pendientes hasta ser confirmados en recepción.</p>
            </div>
            <span class="big-number">{{pagos.length}}</span>
          </div>
          <div class="table-wrap"><table class="management-table"><thead><tr><th>ID</th><th>Cliente</th><th>Plan</th><th>Monto</th><th>Método</th><th>N° operación</th><th>Fecha</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
            <tr *ngFor="let p of pagos">
              <td>{{p.id_pago}}</td><td>{{clientePago(p)}}</td><td>{{planPago(p)}}</td><td>S/ {{p.monto | number:'1.2-2'}}</td><td>{{p.metodo_pago}}</td><td>{{p.numero_operacion || '-'}}</td><td>{{fecha(p.fecha_pago)}}</td><td>{{p.estado_pago}}</td>
              <td>
                <ng-container *ngIf="p.estado_pago==='Pendiente' && p.metodo_pago==='Efectivo'; else sinAccionPago">
                  <button type="button" (click)="confirmarPagoEfectivo(p)">Confirmar</button>
                  <button type="button" (click)="rechazarPagoEfectivo(p)">Rechazar</button>
                </ng-container>
                <ng-template #sinAccionPago>-</ng-template>
              </td>
            </tr>
            <tr *ngIf="!pagos.length"><td colspan="9">No hay pagos registrados.</td></tr>
          </tbody></table></div>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='entrenador-admin'">
        <section class="trainer-single-layout">
          <article class="admin-form-card trainer-single-form" *ngIf="!entrenadores.length || entrenadorEditandoId">
            <div class="management-heading">
              <div>
                <h2>{{entrenadorEditandoId ? 'Editar entrenador principal' : 'Registrar entrenador principal'}}</h2>
                <p>Mallqui Gym trabaja con un solo entrenador. Sus datos se usarán en clases y rutinas.</p>
              </div>
              <span>🏋</span>
            </div>

            <form (ngSubmit)="guardarEntrenador()">
              <div class="form-row">
                <label>DNI<input [(ngModel)]="entrenadorForm.dni" name="edni" required></label>
                <label>Especialidad<input [(ngModel)]="entrenadorForm.especialidad" name="eespecialidad" placeholder="Ej. Musculación y acondicionamiento"></label>
              </div>
              <div class="form-row">
                <label>Nombres<input [(ngModel)]="entrenadorForm.nombres" name="enombres" required></label>
                <label>Apellidos<input [(ngModel)]="entrenadorForm.apellidos" name="eapellidos" required></label>
              </div>
              <div class="form-row">
                <label>Correo<input type="email" [(ngModel)]="entrenadorForm.correo" name="ecorreo"></label>
                <label>Teléfono<input [(ngModel)]="entrenadorForm.telefono" name="etelefono"></label>
              </div>
              <div class="form-row">
                <label>Fecha contratación<input type="date" [(ngModel)]="entrenadorForm.fecha_contratacion" name="efecha" required></label>
                <label>Salario<input type="number" min="0" [(ngModel)]="entrenadorForm.salario" name="esalario" required></label>
              </div>

              <ng-container *ngIf="!entrenadorEditandoId">
                <label class="trainer-access-check">
                  <input type="checkbox" [(ngModel)]="entrenadorForm.crear_acceso" name="eacceso">
                  Crear cuenta de acceso para el entrenador
                </label>
                <div class="form-row" *ngIf="entrenadorForm.crear_acceso">
                  <label>Usuario<input [(ngModel)]="entrenadorForm.nombre_usuario" name="eusuario" placeholder="Correo o nombre de usuario"></label>
                  <label>Contraseña<input type="password" minlength="8" [(ngModel)]="entrenadorForm.contrasena" name="eclave"></label>
                </div>
              </ng-container>

              <div class="form-row">
                <button class="admin-primary" type="submit">{{entrenadorEditandoId ? 'Guardar cambios' : 'Registrar entrenador'}}</button>
                <button *ngIf="entrenadorEditandoId" class="admin-secondary" type="button" (click)="cancelarEdicionEntrenador()">Cancelar</button>
              </div>
            </form>
          </article>

          <article class="trainer-main-card" *ngIf="entrenadores[0] as e; else sinEntrenadorPrincipal">
            <div class="trainer-main-top">
              <div class="trainer-main-avatar">{{(e.nombres || 'E').charAt(0)}}{{(e.apellidos || '').charAt(0)}}</div>
              <div>
                <span>ENTRENADOR PRINCIPAL</span>
                <h2>{{nombreEntrenador(e)}}</h2>
                <p>{{e.especialidad || 'Sin especialidad registrada'}}</p>
              </div>
              <span class="trainer-main-status" [class.inactive]="e.estado!=='Activo'">{{e.estado}}</span>
            </div>

            <div class="trainer-main-data">
              <article><small>DNI</small><b>{{e.dni || '-'}}</b></article>
              <article><small>CORREO</small><b>{{e.correo || '-'}}</b></article>
              <article><small>TELÉFONO</small><b>{{e.telefono || '-'}}</b></article>
              <article><small>CLASES</small><b>{{e.clases_count || 0}}</b></article>
              <article><small>RUTINAS</small><b>{{e.rutinas_count || 0}}</b></article>
              <article><small>CONTRATACIÓN</small><b>{{e.fecha_contratacion || '-'}}</b></article>
            </div>

            <div class="trainer-main-note">
              <span>✓</span>
              <div>
                <b>Este entrenador se asigna como responsable principal del gimnasio.</b>
                <small>Cuando crees una clase o una rutina, el sistema lo seleccionará automáticamente.</small>
              </div>
            </div>

            <button class="admin-primary trainer-edit-button" type="button" (click)="editarEntrenador(e)">Editar datos del entrenador</button>
          </article>

          <ng-template #sinEntrenadorPrincipal>
            <article class="trainer-main-card trainer-empty-card">
              <span>🏋</span>
              <h2>Aún no hay entrenador registrado</h2>
              <p>Completa el formulario para registrar al único entrenador principal de Mallqui Gym.</p>
            </article>
          </ng-template>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='clases'">
        <section class="management-grid">
          <article class="admin-form-card">
            <div class="management-heading"><div><h2>{{claseEditandoId ? 'Editar clase' : 'Programar clase'}}</h2><p>{{claseEditandoId ? 'Actualiza horario, entrenador, cupo o estado.' : 'La clase se guarda en MySQL.'}}</p></div><span>◉</span></div>
            <form (ngSubmit)="guardarClase()">
              <label>Nombre<input [(ngModel)]="claseForm.nombre" name="clnombre" required></label>
              <label>Descripción<input [(ngModel)]="claseForm.descripcion" name="cldescripcion"></label>
              <label *ngIf="entrenadores[0] as entrenadorPrincipal">Entrenador principal
                <input [value]="nombreEntrenador(entrenadorPrincipal)" readonly>
              </label>
              <div *ngIf="!entrenadores.length" class="trainer-required-note">
                <span>!</span><div><b>Falta registrar el entrenador principal.</b><small>Regístralo primero en la sección Entrenador.</small></div>
              </div>
              <div class="form-row"><label>Día<select [(ngModel)]="claseForm.dia_semana" name="cldia"><option *ngFor="let d of dias">{{d}}</option></select></label><label>Cupo máximo<input type="number" min="1" [(ngModel)]="claseForm.cupo_maximo" name="clcupo"></label></div>
              <div class="form-row"><label>Hora inicio<input type="time" [(ngModel)]="claseForm.hora_inicio" name="clinicio" required></label><label>Hora fin<input type="time" [(ngModel)]="claseForm.hora_fin" name="clfin" required></label></div>
              <label>Estado<select [(ngModel)]="claseForm.estado" name="clestado"><option>Activo</option><option>Inactivo</option></select></label>
              <div class="form-row">
                <button class="admin-primary" type="submit">{{claseEditandoId ? 'Guardar cambios' : 'Guardar clase'}}</button>
                <button *ngIf="claseEditandoId" class="admin-secondary" type="button" (click)="cancelarEdicionClase()">Cancelar</button>
              </div>
            </form>
          </article>
          <article class="admin-list-card wide-card"><div class="management-heading"><div><h2>Clases</h2><p>{{clases.length}} clases desde la base de datos.</p></div></div><div class="table-wrap"><table class="management-table"><thead><tr><th>Clase</th><th>Entrenador</th><th>Día</th><th>Horario</th><th>Cupo</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
            <tr *ngFor="let c of clases"><td><b>{{c.nombre}}</b></td><td>{{nombreEntrenador(c.entrenador)}}</td><td>{{c.dia_semana}}</td><td>{{c.hora_inicio}} - {{c.hora_fin}}</td><td>{{c.cupo_maximo}}</td><td>{{c.estado}}</td><td><button class="table-action" type="button" (click)="editarClase(c)">Editar</button> <button *ngIf="c.estado==='Activo'" class="table-danger" type="button" (click)="desactivarClase(c.id_clase)">Desactivar</button></td></tr>
          </tbody></table></div></article>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='attendance-tools'">
        <section class="management-grid">
          <article class="admin-form-card">
            <div class="management-heading">
              <div><h2>Acceso con credencial</h2><p>Escanea el código de barras del socio o escribe su código MG/DNI.</p></div>
              <span>▥</span>
            </div>
            <form (ngSubmit)="registrarAccesoPorCodigo()">
              <label>Código de acceso
                <input [(ngModel)]="asistenciaCodigo"
                       name="ascodigo"
                       autocomplete="off"
                       placeholder="MG-000001 o DNI"
                       maxlength="40">
              </label>
              <button class="admin-primary" type="submit" [disabled]="procesandoAccesoCodigo || !asistenciaCodigo.trim()">
                {{procesandoAccesoCodigo ? 'Validando...' : 'Escanear / registrar acceso'}}
              </button>
            </form>
            <div class="access-scan-result" *ngIf="ultimoAccesoCodigo">
              <span [class.exit]="ultimoAccesoCodigo.accion==='Salida'">{{ultimoAccesoCodigo.accion==='Salida' ? 'SALIDA' : 'ACCESO OK'}}</span>
              <div>
                <b>{{nombreCliente(ultimoAccesoCodigo.cliente)}}</b>
                <small>{{ultimoAccesoCodigo.codigo_socio}} · {{ultimoAccesoCodigo.membresia?.membresia?.nombre || 'Membresía validada'}}</small>
              </div>
            </div>
          </article>

          <article class="admin-form-card">
            <div class="management-heading"><div><h2>Control manual</h2><p>Alternativa para recepción cuando no se usa lector.</p></div><span>▣</span></div>
            <form>
              <label>Cliente
                <select [(ngModel)]="asistenciaCliente" name="ascliente">
                  <option [ngValue]="0">Seleccionar</option>
                  <option *ngFor="let c of clientes" [ngValue]="c.id_cliente">{{nombreCliente(c)}}</option>
                </select>
              </label>
              <div class="form-row">
                <button class="admin-primary" type="button" (click)="registrarEntrada()">Registrar entrada</button>
                <button class="admin-secondary" type="button" (click)="registrarSalida()">Registrar salida</button>
              </div>
            </form>
          </article>

          <article class="admin-list-card wide-card">
            <div class="management-heading"><div><h2>Historial</h2><p>{{asistencias.length}} registros.</p></div></div>
            <div class="table-wrap"><table class="management-table"><thead><tr><th>Cliente</th><th>Entrada</th><th>Salida</th><th>Estado</th></tr></thead><tbody>
              <tr *ngFor="let a of asistencias"><td>{{nombreCliente(a.cliente)}}</td><td>{{fecha(a.fecha_hora_entrada)}}</td><td>{{fecha(a.fecha_hora_salida)}}</td><td>{{a.estado}}</td></tr>
            </tbody></table></div>
          </article>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='productos'">
        <div class="embedded-productos"><app-productos></app-productos></div>
      </ng-container>

      <ng-container *ngIf="seccion==='proveedores'">
        <section class="management-grid">
          <article class="admin-form-card">
            <div class="management-heading"><div><h2>{{proveedorEditandoId ? 'Editar proveedor' : 'Nuevo proveedor'}}</h2><p>{{proveedorEditandoId ? 'Modifica los datos y guarda los cambios.' : 'Registro directo en Laravel.'}}</p></div><span>▤</span></div>
            <form (ngSubmit)="guardarProveedor()">
              <div class="form-row"><label>RUC<input [(ngModel)]="proveedorForm.ruc" name="pruc" required></label><label>Razón social<input [(ngModel)]="proveedorForm.razon_social" name="prazon" required></label></div>
              <div class="form-row"><label>Contacto<input [(ngModel)]="proveedorForm.contacto" name="pcontacto"></label><label>Teléfono<input [(ngModel)]="proveedorForm.telefono" name="ptelefono"></label></div>
              <label>Correo<input type="email" [(ngModel)]="proveedorForm.correo" name="pcorreo"></label>
              <label>Dirección<input [(ngModel)]="proveedorForm.direccion" name="pdireccion"></label>
              <label>Estado<select [(ngModel)]="proveedorForm.estado" name="pestado"><option>Activo</option><option>Inactivo</option></select></label>
              <div class="form-row">
                <button class="admin-primary" type="submit">{{proveedorEditandoId ? 'Guardar cambios' : 'Guardar proveedor'}}</button>
                <button *ngIf="proveedorEditandoId" class="admin-secondary" type="button" (click)="cancelarEdicionProveedor()">Cancelar</button>
              </div>
            </form>
          </article>
          <article class="admin-list-card wide-card">
            <div class="management-heading"><div><h2>Proveedores</h2><p>{{proveedores.length}} registrados.</p></div></div>
            <div class="table-wrap"><table class="management-table"><thead><tr><th>RUC</th><th>Razón social</th><th>Contacto</th><th>Teléfono</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
              <tr *ngFor="let p of proveedores"><td>{{p.ruc}}</td><td><b>{{p.razon_social}}</b></td><td>{{p.contacto}}</td><td>{{p.telefono}}</td><td>{{p.estado}}</td><td><button class="table-action" type="button" (click)="editarProveedor(p)">Editar</button> <button *ngIf="p.estado==='Activo'" class="table-danger" type="button" (click)="desactivarProveedor(p.id_proveedor)">Desactivar</button></td></tr>
            </tbody></table></div>
          </article>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='compras'">
        <section class="management-grid">
          <article class="admin-form-card"><div class="management-heading"><div><h2>Registrar compra</h2><p>Agrega varios productos antes de confirmar.</p></div><span>↓</span></div>
            <form (ngSubmit)="registrarCompra()">
              <label>Proveedor<select [(ngModel)]="compraForm.id_proveedor" name="coprov"><option [ngValue]="0">Seleccionar</option><option *ngFor="let p of proveedores" [ngValue]="p.id_proveedor">{{p.razon_social}}</option></select></label>
              <div class="form-row"><label>Producto<select [(ngModel)]="compraForm.id_producto" name="coprod"><option [ngValue]="0">Seleccionar</option><option *ngFor="let p of productos" [ngValue]="p.id_producto">{{p.nombre_producto}}</option></select></label><label>Cantidad<input type="number" min="1" [(ngModel)]="compraForm.cantidad" name="cocantidad"></label></div>
              <div class="form-row"><label>Precio compra<input type="number" step="0.01" min="0.01" [(ngModel)]="compraForm.precio_compra" name="coprecio"></label><button class="admin-secondary" type="button" (click)="agregarItemCompra()">+ Agregar producto</button></div>
              <div class="table-wrap" *ngIf="compraItems.length"><table class="management-table"><thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th><th></th></tr></thead><tbody><tr *ngFor="let i of compraItems;let ix=index"><td>{{nombreProducto(i.id_producto)}}</td><td>{{i.cantidad}}</td><td>S/ {{i.precio_compra}}</td><td>S/ {{i.cantidad*i.precio_compra | number:'1.2-2'}}</td><td><button class="table-danger" type="button" (click)="quitarItemCompra(ix)">Quitar</button></td></tr></tbody></table></div>
              <div class="form-row"><label>Comprobante<select [(ngModel)]="compraForm.tipo_comprobante" name="cotipo"><option>Factura</option><option>Boleta</option></select></label><label>Número<input [(ngModel)]="compraForm.numero_comprobante" name="conumero" required></label></div>
              <button class="admin-primary">Registrar compra ({{compraItems.length}} productos)</button>
            </form>
          </article>
          <article class="admin-list-card wide-card"><div class="management-heading"><div><h2>Compras</h2><p>{{compras.length}} registros.</p></div></div><div class="table-wrap"><table class="management-table"><thead><tr><th>ID</th><th>Proveedor</th><th>Comprobante</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Acción</th></tr></thead><tbody><tr *ngFor="let c of compras"><td>{{c.id_compra}}</td><td>{{c.proveedor?.razon_social}}</td><td>{{c.tipo_comprobante}} {{c.numero_comprobante}}</td><td>{{fecha(c.fecha_compra)}}</td><td>S/ {{c.total | number:'1.2-2'}}</td><td>{{c.estado}}</td><td><button *ngIf="c.estado!=='Anulado'" class="table-danger" type="button" (click)="anularCompra(c.id_compra)">Anular</button></td></tr></tbody></table></div></article>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='ventas'">
        <form class="sales-pos-form" (ngSubmit)="registrarVenta()">
          <section class="sales-pos-layout">
            <article class="admin-form-card sales-entry-card">
              <div class="management-heading">
                <div>
                  <h2>Nueva venta</h2>
                  <p>Selecciona el cliente y agrega los productos que llevará.</p>
                </div>
                <span>＋</span>
              </div>

              <label>
                Cliente
                <select [(ngModel)]="ventaForm.id_cliente" name="vcliente">
                  <option [ngValue]="0">Público general</option>
                  <option *ngFor="let c of clientes" [ngValue]="c.id_cliente">{{nombreCliente(c)}}</option>
                </select>
              </label>

              <div class="form-row sales-product-row">
                <label>
                  Producto
                  <select [(ngModel)]="ventaForm.id_producto" name="vproducto">
                    <option [ngValue]="0">Seleccionar producto</option>
                    <option *ngFor="let p of productos" [ngValue]="p.id_producto">
                      {{p.nombre_producto}} · Stock {{p.stock}}
                    </option>
                  </select>
                </label>
                <label>
                  Cantidad
                  <input type="number" min="1" [(ngModel)]="ventaForm.cantidad" name="vcantidad">
                </label>
              </div>

              <button class="admin-secondary sales-add-button" type="button" (click)="agregarItemVenta()">
                + Agregar al carrito
              </button>

              <div class="sales-entry-help">
                <span>1</span>
                <p><b>Agrega los productos primero.</b><small>El resumen y el cobro se completan a la derecha.</small></p>
              </div>
            </article>

            <article class="admin-list-card sales-cart-card">
              <div class="management-heading">
                <div>
                  <h2>Carrito de compra</h2>
                  <p>{{ventaItems.length}} {{ventaItems.length === 1 ? 'producto agregado' : 'productos agregados'}}.</p>
                </div>
                <span>▤</span>
              </div>

              <div class="sales-cart-empty" *ngIf="!ventaItems.length">
                <span>🛒</span>
                <div>
                  <b>El carrito está vacío</b>
                  <p>Selecciona un producto y presiona “Agregar al carrito”.</p>
                </div>
              </div>

              <div class="table-wrap sales-cart-table" *ngIf="ventaItems.length">
                <table class="management-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cant.</th>
                      <th>Precio</th>
                      <th>Subtotal</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let i of ventaItems; let ix=index">
                      <td><b>{{nombreProducto(i.id_producto)}}</b></td>
                      <td>{{i.cantidad}}</td>
                      <td>S/ {{precioProducto(i.id_producto) | number:'1.2-2'}}</td>
                      <td><b>S/ {{i.cantidad*precioProducto(i.id_producto) | number:'1.2-2'}}</b></td>
                      <td><button class="table-danger" type="button" (click)="quitarItemVenta(ix)">Quitar</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>

            <article class="admin-form-card sales-checkout-card">
              <div class="management-heading">
                <div>
                  <h2>Resumen de cobro</h2>
                  <p>Revisa el total, selecciona el comprobante y registra el pago.</p>
                </div>
                <span>S/</span>
              </div>

              <div class="sales-checkout-content">
                <div class="sales-totals">
                  <article>
                    <p>Subtotal sin IGV</p>
                    <h2>S/ {{subtotalVentaPreview | number:'1.2-2'}}</h2>
                  </article>
                  <article>
                    <p>IGV incluido {{ventaForm.igv_porcentaje}}%</p>
                    <h2>S/ {{igvVentaPreview | number:'1.2-2'}}</h2>
                  </article>
                  <article class="sales-total-main">
                    <p>Total a cobrar</p>
                    <h2>S/ {{totalVentaPreview | number:'1.2-2'}}</h2>
                  </article>
                </div>

                <div class="sales-payment-fields">
                  <label>
                    Comprobante
                    <select [(ngModel)]="ventaForm.tipo_comprobante" name="vtipo">
                      <option>Boleta</option>
                      <option>Factura</option>
                    </select>
                  </label>
                  <label>
                    Número
                    <input [value]="ventaForm.numero_comprobante || 'Se genera al cobrar'" name="vnumero" readonly>
                  </label>
                  <label>
                    Método de pago
                    <select [(ngModel)]="ventaForm.metodo_pago" name="vmetodo">
                      <option>Efectivo</option>
                      <option>Yape</option>
                      <option>Plin</option>
                      <option>Transferencia</option>
                      <option>Tarjeta</option>
                    </select>
                  </label>
                  <label>
                    N° operación
                    <input [(ngModel)]="ventaForm.numero_operacion" name="voperacion" placeholder="Opcional para efectivo">
                  </label>
                </div>

                <button class="admin-primary sales-charge-button" type="submit" [disabled]="!ventaItems.length">
                  Cobrar venta · S/ {{totalVentaPreview | number:'1.2-2'}}
                </button>
              </div>
            </article>
          </section>
        </form>
      </ng-container>

      <ng-container *ngIf="seccion==='caja'">
        <section class="management-grid">
          <article class="admin-form-card" *ngIf="!caja?.caja_abierta"><div class="management-heading"><div><h2>Abrir caja</h2><p>Necesaria para cobrar en efectivo.</p></div><span>$</span></div><form (ngSubmit)="abrirCaja()"><label>Monto inicial<input type="number" min="0" step="0.01" [(ngModel)]="cajaAbrirForm.monto_inicial" name="camonto"></label><label>Observación<input [(ngModel)]="cajaAbrirForm.observacion" name="caobs"></label><button class="admin-primary">Abrir caja</button></form></article>
          <article class="admin-form-card" *ngIf="caja?.caja_abierta"><div class="management-heading"><div><h2>Caja abierta</h2><p>Monto esperado: S/ {{caja?.resumen?.monto_esperado ?? 0 | number:'1.2-2'}}</p></div><span>$</span></div><form (ngSubmit)="movimientoCaja()"><div class="form-row"><label>Tipo<select [(ngModel)]="movCajaForm.tipo" name="mctipo"><option>Ingreso</option><option>Egreso</option></select></label><label>Monto<input type="number" min="0.01" step="0.01" [(ngModel)]="movCajaForm.monto" name="mcmonto"></label></div><label>Descripción<input [(ngModel)]="movCajaForm.descripcion" name="mcdesc" required></label><button class="admin-primary">Registrar movimiento</button></form><hr><form (ngSubmit)="cerrarCaja()"><label>Monto real contado<input type="number" min="0" step="0.01" [(ngModel)]="cajaCerrarForm.monto_real" name="ccmonto"></label><button class="admin-secondary">Cerrar caja</button></form></article>
          <article class="admin-list-card wide-card"><div class="management-heading"><div><h2>Historial de cajas</h2><p>{{historialCaja.length}} registros.</p></div></div><div class="table-wrap"><table class="management-table"><thead><tr><th>ID</th><th>Apertura</th><th>Cierre</th><th>Inicial</th><th>Esperado</th><th>Real</th><th>Estado</th></tr></thead><tbody><tr *ngFor="let c of historialCaja"><td>{{c.id_caja}}</td><td>{{fecha(c.fecha_apertura)}}</td><td>{{fecha(c.fecha_cierre)}}</td><td>S/ {{c.monto_inicial}}</td><td>S/ {{c.monto_esperado ?? '-'}}</td><td>S/ {{c.monto_real ?? '-'}}</td><td>{{c.estado}}</td></tr></tbody></table></div></article>
        </section>
      </ng-container>



      <ng-container *ngIf="seccion==='historial-ventas'">
        <section class="admin-list-card">
          <div class="management-heading">
            <div><h2>Historial de ventas</h2><p>{{ventas.length}} operaciones registradas.</p></div>
            <button class="admin-secondary" type="button" (click)="cargarVentas()">↻ Actualizar</button>
          </div>
          <div class="table-wrap">
            <table class="management-table">
              <thead><tr><th>ID</th><th>Cliente</th><th>Comprobante</th><th>Fecha</th><th>Método</th><th>Total</th><th>Estado</th></tr></thead>
              <tbody>
                <tr *ngFor="let v of ventas">
                  <td>{{v.id_venta}}</td>
                  <td>{{nombreClienteVenta(v.cliente)}}</td>
                  <td>{{v.tipo_comprobante}} {{v.numero_comprobante}}</td>
                  <td>{{fecha(v.fecha_venta)}}</td>
                  <td>{{v.metodo_pago}}</td>
                  <td><b>S/ {{v.total | number:'1.2-2'}}</b></td>
                  <td>{{v.estado || 'Registrado'}}</td>
                </tr>
                <tr *ngIf="!ventas.length"><td colspan="7">Aún no hay ventas registradas.</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='planes-admin'">
        <section class="management-grid">
          <article class="admin-form-card">
            <div class="management-heading"><div><h2>{{planEditandoId ? 'Editar tarifa' : 'Nueva tarifa'}}</h2><p>Configura precio, duración y estado.</p></div><span>◆</span></div>
            <form (ngSubmit)="guardarPlan()">
              <label>Nombre<input [(ngModel)]="planForm.nombre" name="plan_nombre" required></label>
              <div class="form-row">
                <label>Duración (meses)<input type="number" min="1" [(ngModel)]="planForm.duracion_meses" name="plan_duracion" required></label>
                <label>Precio S/<input type="number" min="0" step="0.01" [(ngModel)]="planForm.precio" name="plan_precio" required></label>
              </div>
              <label>Descripción<textarea [(ngModel)]="planForm.descripcion" name="plan_descripcion"></textarea></label>
              <label>Beneficios (uno por línea)<textarea [(ngModel)]="planForm.beneficios_texto" name="plan_beneficios"></textarea></label>
              <label><input type="checkbox" [(ngModel)]="planForm.permite_reservas" name="plan_reservas"> Permite reservar clases</label>
              <label>Estado<select [(ngModel)]="planForm.estado" name="plan_estado"><option>Activo</option><option>Inactivo</option></select></label>
              <div class="form-row">
                <button class="admin-primary" type="submit">{{planEditandoId ? 'Guardar cambios' : 'Crear tarifa'}}</button>
                <button *ngIf="planEditandoId" class="admin-secondary" type="button" (click)="cancelarEdicionPlan()">Cancelar</button>
              </div>
            </form>
          </article>
          <article class="admin-list-card wide-card">
            <div class="management-heading"><div><h2>Planes disponibles</h2><p>{{planesMembresia.length}} planes configurados.</p></div></div>
            <div class="table-wrap">
              <table class="management-table">
                <thead><tr><th>Membresía</th><th>Duración</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>
                  <tr *ngFor="let p of planesMembresia">
                    <td><b>{{p.nombre}}</b><br><small>{{p.descripcion}}</small></td>
                    <td>{{p.duracion_meses}} mes(es)</td>
                    <td>S/ {{p.precio}}</td>
                    <td>{{p.estado}}</td>
                    <td><button class="table-action" type="button" (click)="editarPlan(p)">Editar</button> <button *ngIf="p.estado==='Activo'" class="table-danger" type="button" (click)="desactivarPlan(p.id_membresia)">Desactivar</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='gastos'">
        <section class="operation-locked-state" *ngIf="!caja?.caja_abierta; else gastosCajaAbierta">
          <div class="operation-locked-main">
            <span class="operation-locked-icon">▣</span>
            <small>CAJA REQUERIDA</small>
            <h2>Abre la caja antes de registrar un gasto</h2>
            <p>Todo egreso debe quedar asociado a una caja abierta para que el cierre, los reportes y la auditoría cuadren correctamente.</p>
            <button type="button" class="admin-primary" (click)="cambiarSeccion('caja')">Ir a abrir caja</button>
          </div>
          <article class="operation-locked-side">
            <span>Última operación</span>
            <ng-container *ngIf="historialCaja[0] as ultima; else sinHistorialCaja">
              <h3>Caja #{{ultima.id_caja}}</h3>
              <p>{{ultima.estado}} · {{fecha(ultima.fecha_apertura)}}</p>
              <div><small>Monto inicial</small><b>S/ {{ultima.monto_inicial ?? 0 | number:'1.2-2'}}</b></div>
              <div><small>Monto real</small><b>S/ {{ultima.monto_real ?? 0 | number:'1.2-2'}}</b></div>
            </ng-container>
            <ng-template #sinHistorialCaja>
              <h3>Sin historial todavía</h3>
              <p>La primera caja aparecerá aquí después de abrirla.</p>
            </ng-template>
          </article>
        </section>

        <ng-template #gastosCajaAbierta>
          <section class="management-grid">
            <article class="admin-form-card">
              <div class="management-heading">
                <div>
                  <h2>Registrar gasto</h2>
                  <p>Caja abierta · saldo esperado S/ {{caja?.resumen?.monto_esperado ?? 0 | number:'1.2-2'}}</p>
                </div>
                <span>↓</span>
              </div>
              <form (ngSubmit)="registrarGasto()">
                <label>Descripción
                  <input [(ngModel)]="gastoForm.descripcion" name="gasto_descripcion" required minlength="3" placeholder="Ej. compra de productos de limpieza">
                </label>
                <label>Monto S/
                  <input type="number" min="0.01" step="0.01" [(ngModel)]="gastoForm.monto" name="gasto_monto" required>
                </label>
                <button class="admin-primary" type="submit" [disabled]="!gastoForm.descripcion.trim() || gastoForm.monto<=0">Registrar gasto</button>
              </form>
            </article>
            <article class="admin-list-card wide-card">
              <div class="management-heading">
                <div><h2>Gastos de la caja actual</h2><p>{{gastosActuales.length}} egresos registrados.</p></div>
                <strong class="expense-total">S/ {{totalGastosCajaActual | number:'1.2-2'}}</strong>
              </div>
              <div class="table-wrap" *ngIf="gastosActuales.length; else sinGastosCaja">
                <table class="management-table">
                  <thead><tr><th>Fecha</th><th>Descripción</th><th>Origen</th><th>Monto</th><th>Estado</th></tr></thead>
                  <tbody>
                    <tr *ngFor="let g of gastosActuales">
                      <td>{{fecha(g.fecha_movimiento)}}</td>
                      <td><b>{{g.descripcion}}</b></td>
                      <td>{{g.origen}}</td>
                      <td><b>S/ {{g.monto | number:'1.2-2'}}</b></td>
                      <td>{{g.estado}}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ng-template #sinGastosCaja>
                <div class="admin-empty-state compact">
                  <span>✓</span><b>Sin gastos en esta caja</b><p>Aún no se han registrado egresos durante la caja actual.</p>
                </div>
              </ng-template>
            </article>
          </section>
        </ng-template>
      </ng-container>
      <ng-container *ngIf="seccion==='inventario'">
        <div class="embedded-productos"><app-productos></app-productos></div>
      </ng-container>

      <ng-container *ngIf="seccion==='kardex'">
        <section class="management-grid">
          <article class="admin-form-card">
            <div class="management-heading">
              <div><h2>Ajustar stock</h2><p>Usa esta opción para correcciones, mermas o ingresos manuales que no provienen de una compra.</p></div><span>↕</span>
            </div>
            <form (ngSubmit)="ajustarStock()">
              <label>Producto
                <select [(ngModel)]="ajusteForm.id_producto" name="ajproducto" required>
                  <option [ngValue]="0">Seleccionar</option>
                  <option *ngFor="let p of productos" [ngValue]="p.id_producto">{{p.nombre_producto}} · Stock {{p.stock}}</option>
                </select>
              </label>
              <div class="form-row">
                <label>Tipo<select [(ngModel)]="ajusteForm.tipo" name="ajtipo"><option>Entrada</option><option>Salida</option></select></label>
                <label>Cantidad<input type="number" min="1" [(ngModel)]="ajusteForm.cantidad" name="ajcantidad" required></label>
              </div>
              <label>Motivo<input [(ngModel)]="ajusteForm.motivo" name="ajmotivo" required minlength="3" placeholder="Ej. Corrección de conteo físico"></label>
              <button class="admin-primary" type="submit" [disabled]="!ajusteForm.id_producto || ajusteForm.cantidad<1 || !ajusteForm.motivo.trim()">Registrar ajuste</button>
            </form>
          </article>

          <article class="admin-list-card wide-card">
            <div class="management-heading">
              <div><h2>Kardex de inventario</h2><p>{{kardex.length}} movimientos registrados. Cada movimiento conserva su origen y saldo.</p></div>
              <button type="button" class="admin-secondary" (click)="cargarKardex()">↻ Actualizar</button>
            </div>
            <div class="table-wrap">
              <table class="management-table">
                <thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Stock anterior</th><th>Stock nuevo</th><th>Motivo / origen</th></tr></thead>
                <tbody>
                  <tr *ngFor="let k of kardex">
                    <td>{{fecha(k.fecha || k.created_at)}}</td>
                    <td><b>{{k.producto?.nombre_producto || k.nombre_producto || nombreProducto(k.id_producto)}}</b></td>
                    <td>{{k.tipo || k.tipo_movimiento || '-'}}</td>
                    <td>{{k.cantidad ?? '-'}}</td>
                    <td>{{k.stock_anterior ?? '-'}}</td>
                    <td><b>{{k.stock_nuevo ?? k.stock_actual ?? '-'}}</b></td>
                    <td>{{k.motivo || k.origen || k.descripcion || '-'}}</td>
                  </tr>
                  <tr *ngIf="!kardex.length"><td colspan="7">Todavía no hay movimientos de Kardex.</td></tr>
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='reporte-asistencias'">
        <section class="report-grid">
          <article><span>✓</span><p>Total asistencias</p><h2>{{reporteAsistencias?.total ?? 0}}</h2></article>
          <article><span>◷</span><p>Desde</p><h2>{{reporteAsistencias?.desde || '-'}}</h2></article>
          <article><span>◷</span><p>Hasta</p><h2>{{reporteAsistencias?.hasta || '-'}}</h2></article>
        </section>
        <section class="admin-list-card">
          <div class="management-heading"><div><h2>Asistencias por día</h2><p>Reporte calculado directamente desde MySQL.</p></div><button type="button" class="admin-secondary" (click)="cargarReportes()">↻ Actualizar</button></div>
          <div class="table-wrap">
            <table class="management-table">
              <thead><tr><th>Fecha</th><th>Total de asistencias</th></tr></thead>
              <tbody>
                <tr *ngFor="let d of reporteAsistencias?.por_dia"><td>{{d.fecha}}</td><td><b>{{d.total}}</b></td></tr>
                <tr *ngIf="!reporteAsistencias?.por_dia?.length"><td colspan="2">No hay asistencias para el periodo actual.</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='categorias'">
        <section class="management-grid">
          <article class="admin-form-card">
            <div class="management-heading"><div><h2>{{categoriaEditandoId ? 'Editar categoría' : 'Nueva categoría'}}</h2><p>{{categoriaEditandoId ? 'Actualiza la categoría seleccionada.' : 'Organiza los productos del gimnasio.'}}</p></div><span>▦</span></div>
            <form (ngSubmit)="guardarCategoria()">
              <label>Nombre<input [(ngModel)]="categoriaForm.nombre_categoria" name="catnombre" required></label>
              <label>Descripción<input [(ngModel)]="categoriaForm.descripcion" name="catdescripcion"></label>
              <label>Estado<select [(ngModel)]="categoriaForm.estado" name="catestado"><option>Activo</option><option>Inactivo</option></select></label>
              <div class="form-row">
                <button class="admin-primary" type="submit">{{categoriaEditandoId ? 'Guardar cambios' : 'Guardar categoría'}}</button>
                <button *ngIf="categoriaEditandoId" class="admin-secondary" type="button" (click)="cancelarEdicionCategoria()">Cancelar</button>
              </div>
            </form>
          </article>
          <article class="admin-list-card wide-card">
            <div class="management-heading"><div><h2>Categorías</h2><p>{{categorias.length}} registradas.</p></div></div>
            <div class="table-wrap"><table class="management-table"><thead><tr><th>ID</th><th>Nombre</th><th>Descripción</th><th>Productos</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
              <tr *ngFor="let c of categorias"><td>{{c.id_categoria}}</td><td><b>{{c.nombre_categoria}}</b></td><td>{{c.descripcion || '-'}}</td><td>{{c.productos_count ?? 0}}</td><td>{{c.estado}}</td><td><button class="table-action" type="button" (click)="editarCategoria(c)">Editar</button> <button *ngIf="c.estado==='Activo'" class="table-danger" type="button" (click)="desactivarCategoria(c.id_categoria)">Desactivar</button></td></tr>
              <tr *ngIf="!categorias.length"><td colspan="6">No hay categorías registradas.</td></tr>
            </tbody></table></div>
          </article>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='rutinas-admin'">
        <div *ngIf="solicitudRutinaContexto" class="admin-request-context">
          <div>
            <span>SOLICITUD DEL PORTAL DEL CLIENTE</span>
            <b>{{nombreSolicitudRutina(solicitudRutinaContexto)}}</b>
            <p>{{solicitudRutinaContexto.mensaje || solicitudRutinaContexto.detalle || 'El cliente solicitó una rutina personalizada.'}}</p>
            <small>Completa la rutina con ejercicios reales. Al guardar, la solicitud se cerrará y el cliente recibirá una notificación.</small>
          </div>
          <button type="button" (click)="cancelarSolicitudRutinaContexto()" aria-label="Cerrar solicitud">×</button>
        </div>

        <section class="management-grid routine-management">
          <article class="admin-form-card routine-editor-card">
            <div class="management-heading">
              <div>
                <h2>{{rutinaEditandoId ? 'Editar rutina' : 'Crear rutina completa'}}</h2>
                <p>{{rutinaEditandoId ? 'Actualiza datos y ejercicios de la rutina.' : 'Asigna cliente, entrenador y ejercicios para que el usuario vea un plan útil en su cuenta.'}}</p>
              </div>
              <span>🏋</span>
            </div>

            <form (ngSubmit)="guardarRutina()">
              <div class="form-row">
                <label>Cliente
                  <select [(ngModel)]="rutinaForm.id_cliente" name="rucliente" required>
                    <option [ngValue]="0">Seleccionar</option>
                    <option *ngFor="let c of clientes" [ngValue]="c.id_cliente">{{nombreCliente(c)}}</option>
                  </select>
                </label>
                <label *ngIf="entrenadores[0] as entrenadorPrincipal">Entrenador principal
                  <input [value]="nombreEntrenador(entrenadorPrincipal)" readonly>
                </label>
                <div *ngIf="!entrenadores.length" class="trainer-required-note compact">
                  <span>!</span><div><b>Primero registra el entrenador principal.</b><small>La rutina necesita un entrenador responsable.</small></div>
                </div>
              </div>

              <label>Nombre de la rutina
                <input [(ngModel)]="rutinaForm.nombre_rutina" name="runombre" required placeholder="Ej. Rutina fuerza inicial">
              </label>
              <label>Objetivo
                <input [(ngModel)]="rutinaForm.objetivo" name="ruobjetivo" placeholder="Ej. Ganar fuerza y mejorar resistencia">
              </label>
              <label>Indicaciones generales
                <textarea [(ngModel)]="rutinaForm.descripcion" name="rudescripcion" placeholder="Indicaciones que verá el cliente"></textarea>
              </label>

              <div class="form-row">
                <label>Inicio<input type="date" [(ngModel)]="rutinaForm.fecha_inicio" name="ruinicio" required></label>
                <label>Fin<input type="date" [(ngModel)]="rutinaForm.fecha_fin" name="rufin"></label>
              </div>
              <label>Estado
                <select [(ngModel)]="rutinaForm.estado" name="ruestado">
                  <option>Activo</option><option>Finalizado</option><option>Inactivo</option>
                </select>
              </label>

              <section class="routine-exercises-editor">
                <header>
                  <div><span>EJERCICIOS</span><h3>Plan que verá el cliente</h3><p>Agrega series, repeticiones, peso y descanso para que la rutina tenga sentido al entrenar.</p></div>
                  <button type="button" class="admin-secondary" (click)="agregarEjercicioRutina()">＋ Agregar ejercicio</button>
                </header>

                <article *ngFor="let d of rutinaDetallesForm; let i=index" class="routine-exercise-row">
                  <div class="routine-exercise-number">{{i+1}}</div>
                  <div class="routine-exercise-fields">
                    <label>Ejercicio
                      <input [(ngModel)]="d.ejercicio" [name]="'ejercicio_'+i" required placeholder="Ej. Press de banca">
                    </label>
                    <div class="routine-exercise-grid">
                      <label>Series<input type="number" min="1" max="20" [(ngModel)]="d.series" [name]="'series_'+i" required></label>
                      <label>Repeticiones<input type="number" min="1" max="200" [(ngModel)]="d.repeticiones" [name]="'reps_'+i" required></label>
                      <label>Peso recomendado<input type="number" min="0" step="0.5" [(ngModel)]="d.peso_recomendado" [name]="'peso_'+i" placeholder="Opcional"></label>
                      <label>Descanso (seg)<input type="number" min="0" max="3600" [(ngModel)]="d.descanso_segundos" [name]="'descanso_'+i"></label>
                    </div>
                    <label>Observaciones
                      <input [(ngModel)]="d.observaciones" [name]="'obs_'+i" placeholder="Ej. Mantener técnica y controlar el movimiento">
                    </label>
                  </div>
                  <button *ngIf="rutinaDetallesForm.length>1" type="button" class="table-danger routine-remove" (click)="quitarEjercicioRutina(i)">Quitar</button>
                </article>
              </section>

              <div class="form-row">
                <button class="admin-primary" type="submit">{{rutinaEditandoId ? 'Guardar rutina completa' : 'Asignar rutina al cliente'}}</button>
                <button *ngIf="rutinaEditandoId" class="admin-secondary" type="button" (click)="cancelarEdicionRutina()">Cancelar</button>
              </div>
            </form>
          </article>

          <article class="admin-list-card wide-card">
            <div class="management-heading">
              <div><h2>Rutinas asignadas</h2><p>{{rutinas.length}} registradas. El cliente ve la rutina activa y sus ejercicios desde su portal.</p></div>
            </div>
            <div class="table-wrap">
              <table class="management-table">
                <thead><tr><th>Cliente</th><th>Entrenador</th><th>Rutina</th><th>Ejercicios</th><th>Periodo</th><th>Estado</th><th>Acción</th></tr></thead>
                <tbody>
                  <tr *ngFor="let r of rutinas">
                    <td><b>{{nombreCliente(r.cliente)}}</b></td>
                    <td>{{nombreEntrenador(r.entrenador)}}</td>
                    <td><b>{{r.nombre_rutina}}</b><br><small>{{r.objetivo || 'Sin objetivo indicado'}}</small></td>
                    <td><b>{{r.detalles?.length || 0}}</b> ejercicio(s)</td>
                    <td>{{r.fecha_inicio}} - {{r.fecha_fin || 'Sin fin'}}</td>
                    <td>{{r.estado}}</td>
                    <td>
                      <button class="table-action" type="button" (click)="editarRutina(r)">Editar</button>
                      <button *ngIf="r.estado==='Activo'" class="table-danger" type="button" (click)="desactivarRutina(r.id_rutina)">Desactivar</button>
                    </td>
                  </tr>
                  <tr *ngIf="!rutinas.length"><td colspan="7">No hay rutinas registradas.</td></tr>
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='reservas'">
        <section class="admin-list-card">
          <div class="management-heading"><div><h2>Reservas de clases</h2><p>Controla asistencia, ausencias y cancelaciones.</p></div><span class="big-number">{{reservas.length}}</span></div>
          <div class="table-wrap"><table class="management-table"><thead><tr><th>ID</th><th>Cliente</th><th>Clase</th><th>Fecha</th><th>Entrenador</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
            <tr *ngFor="let r of reservas"><td>{{r.id_reserva}}</td><td>{{nombreCliente(r.cliente)}}</td><td>{{r.clase?.nombre}}</td><td>{{r.fecha_clase}}</td><td>{{nombreEntrenador(r.clase?.entrenador)}}</td><td>{{r.estado}}</td><td><button class="table-action" type="button" (click)="cambiarEstadoReserva(r.id_reserva,'Asistio')">Asistió</button> <button class="admin-secondary" type="button" (click)="cambiarEstadoReserva(r.id_reserva,'NoAsistio')">No asistió</button> <button class="table-danger" type="button" (click)="cambiarEstadoReserva(r.id_reserva,'Cancelada')">Cancelar</button></td></tr>
            <tr *ngIf="!reservas.length"><td colspan="7">No hay reservas registradas.</td></tr>
          </tbody></table></div>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='usuarios'">
        <section class="management-grid">
          <article class="admin-form-card">
            <div class="management-heading"><div><h2>{{usuarioEditandoId ? 'Editar usuario' : 'Nuevo usuario interno'}}</h2><p>{{usuarioEditandoId ? 'Modifica la cuenta y guarda los cambios.' : 'Crea cuentas para administración o entrenadores.'}}</p></div><span>♙</span></div>
            <form (ngSubmit)="guardarUsuario()">
              <div class="form-row"><label>Usuario<input [(ngModel)]="usuarioForm.nombre_usuario" name="usunombre" required></label><label>Rol<select [(ngModel)]="usuarioForm.rol" name="usurol"><option>Administrador</option><option>Entrenador</option><option>Cliente</option></select></label></div>
              <div class="form-row"><label>Nombres<input [(ngModel)]="usuarioForm.nombres" name="usunombres" required></label><label>Apellidos<input [(ngModel)]="usuarioForm.apellidos" name="usuapellidos" required></label></div>
              <div class="form-row"><label>DNI<input [(ngModel)]="usuarioForm.dni" name="usudni" required></label><label>Teléfono<input [(ngModel)]="usuarioForm.telefono" name="usutelefono"></label></div>
              <label>Correo<input type="email" [(ngModel)]="usuarioForm.correo" name="usucorreo" required></label>
              <label>{{usuarioEditandoId ? 'Nueva contraseña (opcional)' : 'Contraseña'}}<input type="password" minlength="8" [(ngModel)]="usuarioForm.contrasena" name="usuclave" [required]="!usuarioEditandoId"></label>
              <label>Estado<select [(ngModel)]="usuarioForm.estado" name="usuestado"><option>Activo</option><option>Inactivo</option></select></label>
              <div class="form-row">
                <button class="admin-primary" type="submit">{{usuarioEditandoId ? 'Guardar cambios' : 'Crear usuario'}}</button>
                <button *ngIf="usuarioEditandoId" class="admin-secondary" type="button" (click)="cancelarEdicionUsuario()">Cancelar</button>
              </div>
            </form>
          </article>
          <article class="admin-list-card wide-card">
            <div class="management-heading"><div><h2>Usuarios</h2><p>{{usuarios.length}} cuentas registradas.</p></div></div>
            <div class="table-wrap"><table class="management-table"><thead><tr><th>ID</th><th>Usuario</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
              <tr *ngFor="let u of usuarios"><td>{{u.id_usuario}}</td><td>{{u.nombre_usuario}}</td><td>{{u.nombres}} {{u.apellidos}}</td><td>{{u.correo}}</td><td>{{u.rol}}</td><td>{{u.estado}}</td><td><button class="table-action" type="button" (click)="editarUsuario(u)">Editar</button> <button *ngIf="u.estado==='Activo'" class="table-danger" type="button" (click)="desactivarUsuario(u.id_usuario)">Desactivar</button></td></tr>
              <tr *ngIf="!usuarios.length"><td colspan="7">No hay usuarios registrados.</td></tr>
            </tbody></table></div>
          </article>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='reportes-admin'">
        <section class="report-grid">
          <article><span>👥</span><p>Clientes registrados</p><h2>{{dashboard?.clientes?.total ?? clientes.length}}</h2></article>
          <article><span>✦</span><p>Membresías activas</p><h2>{{dashboard?.membresias?.activas ?? 0}}</h2></article>
          <article><span>💵</span><p>Ingresos del mes</p><h2>S/ {{reporteIngresos?.total_ingresos ?? dashboard?.ingresos?.total_mes ?? 0 | number:'1.2-2'}}</h2></article>
          <article><span>▣</span><p>Asistencias del periodo</p><h2>{{reporteAsistencias?.total ?? 0}}</h2></article>
          <article><span>!</span><p>Membresías por vencer</p><h2>{{reporteVencimientos.length || dashboard?.membresias?.por_vencer_7_dias || 0}}</h2></article>
        </section>
        <article class="report-panel">
          <div class="management-heading">
            <div><h2>Datos reales para reportes</h2><p>Información calculada por Laravel desde MySQL.</p></div>
            <div class="report-actions">
              <button class="admin-secondary" type="button" (click)="cargarReportes()">Actualizar reporte</button>
              <button class="admin-primary" type="button" (click)="exportarReporteCsv()">Exportar CSV</button>
            </div>
          </div>
          <div class="table-wrap">
            <table class="management-table">
              <tbody>
                <tr><th>Membresías</th><td>S/ {{reporteIngresos?.membresias ?? 0 | number:'1.2-2'}}</td></tr>
                <tr><th>Ventas productos</th><td>S/ {{reporteIngresos?.ventas_productos ?? 0 | number:'1.2-2'}}</td></tr>
                <tr><th>Total ingresos</th><td>S/ {{reporteIngresos?.total_ingresos ?? 0 | number:'1.2-2'}}</td></tr>
                <tr><th>Asistencias</th><td>{{reporteAsistencias?.total ?? 0}}</td></tr>
                <tr><th>Vencimientos próximos</th><td>{{reporteVencimientos.length || dashboard?.membresias?.por_vencer_7_dias || 0}}</td></tr>
              </tbody>
            </table>
          </div>
        </article>
        <article class="report-panel">
          <div class="management-heading"><div><h2>Próximos vencimientos</h2><p>Socios que requieren seguimiento para renovar su membresía.</p></div><button type="button" class="admin-secondary" (click)="cambiarSeccion('membresias')">Gestionar membresías</button></div>
          <div class="table-wrap">
            <table class="management-table">
              <thead><tr><th>Socio</th><th>Plan</th><th>Fecha fin</th><th>Días restantes</th></tr></thead>
              <tbody>
                <tr *ngFor="let v of (reporteVencimientos.length ? reporteVencimientos : (dashboard?.membresias?.detalle_por_vencer || [])).slice(0,20)">
                  <td><b>{{nombreCliente(v.cliente)}}</b></td>
                  <td>{{v.membresia?.nombre || v.plan || v.nombre_membresia || '-'}}</td>
                  <td>{{v.fecha_fin || '-'}}</td>
                  <td>{{v.dias_restantes ?? '-'}}</td>
                </tr>
                <tr *ngIf="!(reporteVencimientos.length ? reporteVencimientos : (dashboard?.membresias?.detalle_por_vencer || [])).length"><td colspan="4">No hay membresías próximas a vencer.</td></tr>
              </tbody>
            </table>
          </div>
        </article>
      </ng-container>
      <ng-container *ngIf="seccion==='auditoria'">
        <section class="audit-page">
          <header class="audit-hero">
            <div>
              <span class="audit-eyebrow">SEGURIDAD · TRAZABILIDAD</span>
              <h2>Auditoría del sistema</h2>
              <p>Consulta las acciones registradas por Laravel para saber quién modificó información y si la operación terminó correctamente.</p>
            </div>
            <button type="button" class="audit-export" (click)="exportarAuditoria()">⇩ Exportar CSV</button>
          </header>

          <section class="audit-kpis">
            <article><span class="audit-kpi-icon blue">◎</span><div><small>EVENTOS HOY</small><b>{{auditoriaEventosHoy}}</b><p>acciones registradas</p></div></article>
            <article><span class="audit-kpi-icon violet">♙</span><div><small>USUARIOS</small><b>{{auditoriaUsuariosUnicos}}</b><p>usuarios identificados</p></div></article>
            <article><span class="audit-kpi-icon amber">!</span><div><small>CAMBIOS</small><b>{{auditoriaAccionesCriticas}}</b><p>POST, PUT, PATCH o DELETE</p></div></article>
            <article><span class="audit-kpi-icon red">×</span><div><small>ERRORES</small><b>{{auditoriaErrores}}</b><p>respuestas HTTP 4xx/5xx</p></div></article>
          </section>

          <article class="audit-filter-card">
            <div class="audit-filter-head">
              <div><h3>Buscar eventos</h3><p>Filtra por usuario, ruta, método, estado y rango de fechas.</p></div>
              <button type="button" class="audit-mode" [class.active]="auditoriaSoloImportantes" (click)="auditoriaSoloImportantes=!auditoriaSoloImportantes;auditoriaPagina=1">Solo cambios importantes</button>
            </div>
            <div class="audit-filters">
              <label class="audit-search-field"><span>⌕</span><input [(ngModel)]="auditoriaBusqueda" (ngModelChange)="auditoriaPagina=1" placeholder="Usuario, ruta, IP o estado"></label>
              <label><span>MÉTODO</span><select [(ngModel)]="auditoriaMetodo" (ngModelChange)="auditoriaPagina=1"><option value="">Todos</option><option>GET</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option></select></label>
              <label><span>RESULTADO</span><select [(ngModel)]="auditoriaEstado" (ngModelChange)="auditoriaPagina=1"><option value="">Todos</option><option value="ok">Correctos</option><option value="error">Con error</option></select></label>
              <label><span>DESDE</span><input type="date" [(ngModel)]="auditoriaFiltros.desde"></label>
              <label><span>HASTA</span><input type="date" [(ngModel)]="auditoriaFiltros.hasta"></label>
              <label class="audit-route-field"><span>RUTA CONTIENE</span><input [(ngModel)]="auditoriaFiltros.ruta" placeholder="/api/clientes"></label>
              <div class="audit-filter-actions">
                <button type="button" class="audit-clear" (click)="limpiarFiltrosAuditoria()">Limpiar</button>
                <button type="button" class="audit-apply" (click)="aplicarFiltrosAuditoria()">Aplicar</button>
              </div>
            </div>
          </article>

          <article class="audit-table-card">
            <div class="audit-table-head">
              <div><h3>Registro de actividad</h3><p>Historial generado por el middleware de auditoría.</p></div>
              <span class="audit-page-info">{{auditoriasFiltradas.length}} eventos · Página {{auditoriaPagina}} de {{auditoriaTotalPaginas}}</span>
            </div>
            <div class="table-wrap" *ngIf="auditoriasPaginadas.length; else auditEmpty">
              <table class="audit-table">
                <thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Método</th><th>Ruta</th><th>IP</th><th>Resultado</th><th></th></tr></thead>
                <tbody>
                  <tr *ngFor="let a of auditoriasPaginadas">
                    <td><div class="audit-date"><b>{{fechaCortaAuditoria(a.fecha)}}</b><small>{{horaAuditoria(a.fecha)}}</small></div></td>
                    <td><div class="audit-user"><span>{{inicialAuditoria(a)}}</span><div><b>{{a.usuario || ('Usuario #'+(a.id_usuario||'-'))}}</b><small>{{a.rol || 'Sistema'}}</small></div></div></td>
                    <td><span class="audit-action-label">{{accionAuditoria(a.metodo)}}</span></td>
                    <td><span class="audit-method" [ngClass]="claseMetodoAuditoria(a.metodo)">{{a.metodo}}</span></td>
                    <td><code class="audit-route" [title]="a.ruta">{{a.ruta}}</code></td>
                    <td><code class="audit-ip">{{a.ip || '-'}}</code></td>
                    <td><span class="audit-status" [class.error]="esErrorAuditoria(a.status)"><i></i>{{estadoAuditoria(a.status)}}</span></td>
                    <td><button type="button" class="audit-detail-btn" (click)="auditoriaDetalle=a">Detalle</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ng-template #auditEmpty>
              <div class="audit-empty"><span>◎</span><b>No hay eventos con estos filtros</b><p>Prueba otro rango de fechas o limpia los filtros.</p></div>
            </ng-template>
            <div class="audit-pagination" *ngIf="auditoriasFiltradas.length>auditoriaPorPagina">
              <button type="button" [disabled]="auditoriaPagina<=1" (click)="auditoriaPaginaAnterior()">← Anterior</button>
              <div><button type="button" *ngFor="let p of auditoriaPaginasVisibles" [class.active]="p===auditoriaPagina" (click)="auditoriaPagina=p">{{p}}</button></div>
              <button type="button" [disabled]="auditoriaPagina>=auditoriaTotalPaginas" (click)="auditoriaPaginaSiguiente()">Siguiente →</button>
            </div>
          </article>

          <div class="audit-detail-overlay" *ngIf="auditoriaDetalle as a" (click)="auditoriaDetalle=null">
            <aside class="audit-detail-panel" (click)="$event.stopPropagation()">
              <div class="audit-detail-head">
                <div><span>DETALLE DEL EVENTO</span><h3>{{accionAuditoria(a.metodo)}} · {{a.metodo}}</h3></div>
                <button type="button" (click)="auditoriaDetalle=null">×</button>
              </div>
              <div class="audit-detail-grid">
                <div><small>Fecha</small><b>{{fecha(a.fecha)}}</b></div>
                <div><small>Resultado</small><b>{{estadoAuditoria(a.status)}} ({{a.status || '-'}})</b></div>
                <div><small>Usuario</small><b>{{a.usuario || a.id_usuario || 'Sistema'}}</b></div>
                <div><small>Rol</small><b>{{a.rol || '-'}}</b></div>
                <div><small>IP</small><code>{{a.ip || '-'}}</code></div>
                <div><small>Método</small><b>{{a.metodo || '-'}}</b></div>
                <div class="span-2"><small>Ruta</small><code>{{a.ruta || '-'}}</code></div>
              </div>
              <div class="audit-detail-note"><b>¿Para qué sirve?</b><p>Este registro ayuda a rastrear cambios importantes, intentos fallidos y operaciones realizadas por usuarios internos.</p></div>
              <button type="button" class="audit-close-detail" (click)="auditoriaDetalle=null">Cerrar detalle</button>
            </aside>
          </div>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='configuracion'">
        <section class="config-page">
          <div class="config-hero">
            <div>
              <span class="config-eyebrow">CONFIGURACIÓN GENERAL</span>
              <h2>Administra Mallqui Gym desde un solo lugar</h2>
              <p>Datos reales del gimnasio, mensualidades, horarios, contacto, reglas operativas y estado del sistema.</p>
            </div>
            <div class="config-health" [class.ok]="configEstado?.mysql">
              <span></span>
              <div><b>{{configEstado?.mysql ? 'Sistema operativo' : 'Revisar conexión'}}</b><small>Laravel API + MySQL</small></div>
            </div>
          </div>

          <div class="config-main-grid">
            <article class="config-card config-business">
              <div class="config-card-head">
                <div><span>01</span><div><h3>Datos del gimnasio</h3><p>Información principal que identifica al negocio.</p></div></div>
                <img src="assets/mallqui-logo.svg" alt="Mallqui Gym">
              </div>

              <div class="config-form-grid">
                <label class="span-2">Nombre del gimnasio
                  <input [(ngModel)]="configuracionForm.nombre_gimnasio" name="cfg_nombre" placeholder="Mallqui Gym">
                </label>
                <label>RUC
                  <input [(ngModel)]="configuracionForm.ruc" name="cfg_ruc" placeholder="Opcional">
                </label>
                <label>Teléfono
                  <input [(ngModel)]="configuracionForm.telefono" name="cfg_telefono" placeholder="+51 ...">
                </label>
                <label>Correo de contacto
                  <input type="email" [(ngModel)]="configuracionForm.correo" name="cfg_correo" placeholder="contacto@...">
                </label>
                <label>Dirección
                  <input [(ngModel)]="configuracionForm.direccion" name="cfg_direccion" placeholder="Dirección del gimnasio">
                </label>
                <label>Referencia
                  <input [(ngModel)]="configuracionForm.referencia" name="cfg_referencia" placeholder="Referencia del local">
                </label>
                <label>Tarifa diaria
                  <input type="number" min="0" step="0.50" [(ngModel)]="configuracionForm.tarifa_diaria" name="cfg_tarifa_diaria">
                </label>
                <label class="span-2">Frase del gimnasio
                  <input [(ngModel)]="configuracionForm.frase_publicitaria" name="cfg_frase" placeholder="Frase que verá el cliente">
                </label>
                <label class="span-2">Información de productos
                  <textarea [(ngModel)]="configuracionForm.mensaje_productos" name="cfg_productos" rows="3"></textarea>
                </label>
              </div>
            </article>

            <article class="config-card">
              <div class="config-card-head simple">
                <div><span>02</span><div><h3>Horario de atención</h3><p>Define cuándo atiende el gimnasio.</p></div></div>
              </div>
              <div class="config-time-grid">
                <label>Apertura<input type="time" [(ngModel)]="configuracionForm.hora_apertura" name="cfg_apertura"></label>
                <label>Cierre<input type="time" [(ngModel)]="configuracionForm.hora_cierre" name="cfg_cierre"></label>
              </div>
              <div class="config-days">
                <button type="button" *ngFor="let dia of diasSemana"
                  [class.active]="configuracionForm.dias_atencion?.includes(dia)"
                  (click)="toggleDiaConfiguracion(dia)">
                  {{dia.substring(0,3)}}
                </button>
              </div>
              <label class="config-schedule-detail">Horario detallado
                <textarea [(ngModel)]="configuracionForm.horario_detalle" name="cfg_horario_detalle" rows="5"></textarea>
              </label>
            </article>
          </div>

          <div class="config-secondary-grid">
            <article class="config-card">
              <div class="config-card-head simple">
                <div><span>03</span><div><h3>Reglas operativas</h3><p>Automatiza controles que el personal usa todos los días.</p></div></div>
              </div>
              <div class="config-rules">
                <label><div><b>Aviso de vencimiento</b><small>Días antes de vencer una membresía</small></div><input type="number" min="1" max="60" [(ngModel)]="configuracionForm.dias_aviso_vencimiento" name="cfg_aviso"></label>
                <label><div><b>Cancelación de reserva</b><small>Minutos mínimos de anticipación</small></div><input type="number" min="0" max="1440" [(ngModel)]="configuracionForm.minutos_cancelacion_reserva" name="cfg_cancelacion"></label>
                <label><div><b>Reserva anticipada</b><small>Días máximos para reservar una clase</small></div><input type="number" min="0" max="60" [(ngModel)]="configuracionForm.dias_anticipacion_reserva" name="cfg_anticipacion"></label>
                <label><div><b>Alerta de inventario</b><small>Stock mínimo por defecto</small></div><input type="number" min="0" max="9999" [(ngModel)]="configuracionForm.stock_minimo_default" name="cfg_stock"></label>
              </div>
            </article>

            <article class="config-card">
              <div class="config-card-head simple">
                <div><span>04</span><div><h3>Notificaciones internas</h3><p>Elige qué situaciones deben generar alertas.</p></div></div>
              </div>
              <div class="config-switches">
                <label><div><b>Membresías por vencer</b><small>Mostrar alertas antes del vencimiento.</small></div><input type="checkbox" [(ngModel)]="configuracionForm.notificar_vencimientos" name="cfg_not_venc"><i></i></label>
                <label><div><b>Stock bajo</b><small>Avisar cuando un producto llegue al mínimo.</small></div><input type="checkbox" [(ngModel)]="configuracionForm.notificar_stock_bajo" name="cfg_not_stock"><i></i></label>
                <label><div><b>Compras de membresía</b><small>Las compras del portal se registran automáticamente y quedan en el historial.</small></div><input type="checkbox" [(ngModel)]="configuracionForm.notificar_pagos_pendientes" name="cfg_not_pagos"><i></i></label>
              </div>
            </article>
          </div>

          <div class="config-secondary-grid">
            <article class="config-card">
              <div class="config-card-head simple">
                <div><span>05</span><div><h3>Seguridad del administrador</h3><p>Cambia tu contraseña sin salir del panel.</p></div></div>
              </div>
              <div class="config-password">
                <label>Contraseña actual<input type="password" [(ngModel)]="configPassword.actual" name="cfg_pass_actual" autocomplete="current-password"></label>
                <label>Nueva contraseña<input type="password" [(ngModel)]="configPassword.nueva" name="cfg_pass_nueva" autocomplete="new-password"></label>
                <label>Confirmar nueva<input type="password" [(ngModel)]="configPassword.confirmacion" name="cfg_pass_confirmar" autocomplete="new-password"></label>
                <button type="button" class="config-secondary-button" (click)="cambiarContrasenaConfiguracion()">Actualizar contraseña</button>
              </div>
            </article>

            <article class="config-card">
              <div class="config-card-head simple">
                <div><span>06</span><div><h3>Respaldo y mantenimiento</h3><p>Herramientas para cuidar la información del sistema.</p></div></div>
              </div>
              <div class="config-backup-status">
                <span>▣</span>
                <div>
                  <b>{{ultimoRespaldo ? 'Último respaldo' : 'Sin respaldos registrados'}}</b>
                  <small *ngIf="ultimoRespaldo">{{fecha(ultimoRespaldo.fecha)}} · {{ultimoRespaldo.tamano_kb}} KB</small>
                  <small *ngIf="!ultimoRespaldo">Crea la primera copia de seguridad de MySQL.</small>
                </div>
              </div>
              <div class="config-action-grid">
                <button type="button" (click)="crearRespaldoConfiguracion()" [disabled]="configAccion==='respaldo'">▣ {{configAccion==='respaldo' ? 'Generando...' : 'Crear respaldo'}}</button>
                <button type="button" (click)="verificarSistemaConfiguracion()" [disabled]="configAccion==='estado'">✓ Verificar sistema</button>
                <button type="button" (click)="limpiarCacheConfiguracion()" [disabled]="configAccion==='cache'">↻ Limpiar caché</button>
              </div>
            </article>
          </div>

          <article class="config-card config-system-info">
            <div class="config-card-head simple">
              <div><span>07</span><div><h3>Información del sistema</h3><p>Datos técnicos para soporte y diagnóstico.</p></div></div>
              <small *ngIf="configEstado?.fecha_revision">Revisado: {{fecha(configEstado.fecha_revision)}}</small>
            </div>
            <div class="config-tech-grid">
              <div><span class="tech-dot ok"></span><p><b>Frontend</b><small>Angular</small></p><em>ACTIVO</em></div>
              <div><span class="tech-dot" [class.ok]="configEstado?.api"></span><p><b>API</b><small>Laravel {{configEstado?.laravel || ''}}</small></p><em>{{configEstado?.api ? 'CONECTADA' : 'ERROR'}}</em></div>
              <div><span class="tech-dot" [class.ok]="configEstado?.mysql"></span><p><b>Base de datos</b><small>MySQL</small></p><em>{{configEstado?.mysql ? 'CONECTADA' : 'ERROR'}}</em></div>
              <div><span class="tech-dot" [class.ok]="configEstado?.sanctum"></span><p><b>Seguridad</b><small>Laravel Sanctum</small></p><em>{{configEstado?.sanctum ? 'ACTIVA' : 'REVISAR'}}</em></div>
            </div>
          </article>

          <div class="config-save-bar">
            <div><b>Cambios de configuración</b><small>Los datos se guardan en MySQL y se mantienen al reiniciar el sistema.</small></div>
            <button type="button" (click)="guardarConfiguracion()" [disabled]="configGuardando">{{configGuardando ? 'Guardando...' : 'Guardar configuración'}}</button>
          </div>
        </section>
      </ng-container>
      <ng-container *ngIf="seccion==='opiniones'">
        <section class="feedback-admin-shell">
          <header class="feedback-admin-head">
            <div>
              <span>VOZ DEL CLIENTE</span>
              <h2>Opiniones recibidas desde el portal</h2>
              <p>Lo que el cliente envía desde “Tu opinión” aparece aquí. Al marcarlo como revisado, el cliente recibe un aviso.</p>
            </div>
            <button type="button" class="admin-secondary" (click)="cargarOpiniones()">↻ Actualizar</button>
          </header>

          <section class="feedback-admin-kpis">
            <article><small>TOTAL</small><b>{{opiniones.length}}</b><span>opiniones registradas</span></article>
            <article><small>PENDIENTES</small><b>{{opinionesPendientesCount}}</b><span>por revisar</span></article>
            <article><small>PROMEDIO</small><b>{{promedioOpiniones | number:'1.1-1'}} / 5</b><span>calificación general</span></article>
          </section>

          <section class="feedback-admin-list">
            <article *ngFor="let o of opiniones" [class.reviewed]="o.estado==='Revisada'">
              <div class="feedback-admin-rating">
                <span>{{estrellasOpinion(o.calificacion)}}</span>
                <small>{{o.calificacion}} / 5</small>
              </div>
              <div class="feedback-admin-copy">
                <small>{{o.categoria}} · {{fecha(o.fecha)}}</small>
                <h3>{{nombreCliente(o.cliente)}}</h3>
                <p>{{o.comentario}}</p>
              </div>
              <div class="feedback-admin-actions">
                <span [class.done]="o.estado==='Revisada'">{{o.estado}}</span>
                <button *ngIf="o.estado!=='Revisada'" type="button" class="admin-primary" (click)="cambiarEstadoOpinion(o,'Revisada')">Marcar revisada</button>
                <button *ngIf="o.estado==='Revisada'" type="button" class="admin-secondary" (click)="cambiarEstadoOpinion(o,'Enviada')">Volver a pendiente</button>
              </div>
            </article>

            <div *ngIf="!opiniones.length" class="feedback-admin-empty">
              <span>★</span><b>Aún no hay opiniones</b><p>Cuando un cliente califique el servicio desde su portal, aparecerá aquí.</p>
            </div>
          </section>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='comunicacion' || seccion==='soporte'">
        <app-admin-comunicacion
          [modo]="seccion==='soporte' ? 'soporte' : 'comunicacion'"
          (atenderRutina)="atenderSolicitudRutina($event)">
        </app-admin-comunicacion>
      </ng-container>

      <app-admin-cliente-ficha
        *ngIf="clienteFichaId"
        [clienteId]="clienteFichaId"
        (cerrar)="clienteFichaId=0">
      </app-admin-cliente-ficha>
    </main>
  </div>
  `,
  styles: [`
    .embedded-productos .productos-topbar .sesion-productos{display:none!important}
    .embedded-productos .productos-page{padding:0!important;background:transparent!important;min-height:auto!important}
    .admin-logout{width:calc(100% - 28px);margin:14px;background:none;border:0;text-align:left;cursor:pointer}
    .access-scan-result{display:flex;gap:12px;align-items:center;margin-top:14px;padding:13px;border:1px solid #dbe9df;border-radius:12px;background:#f4fbf6}
    .access-scan-result>span{padding:6px 9px;border-radius:999px;background:#198754;color:#fff;font-size:10px;font-weight:900;letter-spacing:.5px}
    .access-scan-result>span.exit{background:#35536b}
    .access-scan-result div{display:grid;gap:2px}.access-scan-result small{color:#6a7d8d}
    .admin-request-context{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin:0 0 18px;padding:18px 20px;border:1px solid #f2c9cd;border-left:5px solid #d7192d;border-radius:16px;background:#fff8f8;box-shadow:0 10px 28px rgba(71,21,28,.06)}
    .admin-request-context>div{display:grid;gap:5px}.admin-request-context span{font-size:11px;font-weight:900;letter-spacing:.9px;color:#d7192d}.admin-request-context b{font-size:18px;color:#202833}.admin-request-context p{margin:0;color:#4b5966}.admin-request-context small{color:#76838e}
    .admin-request-context>button{border:0;background:#fff;color:#7e8992;width:34px;height:34px;border-radius:10px;cursor:pointer;font-size:22px;box-shadow:0 2px 10px rgba(0,0,0,.08)}
    .routine-management{grid-template-columns:minmax(0,1fr)!important;gap:18px!important}
    .routine-management>.routine-editor-card,.routine-management>.wide-card{grid-column:1/-1;width:100%;max-width:none;box-sizing:border-box}
    .routine-editor-card{overflow:visible!important;padding:24px!important}
    .routine-editor-card form{max-width:none!important}
    .routine-exercises-editor{display:grid;gap:14px;margin:18px 0;padding-top:18px;border-top:1px solid #e7edf1;min-width:0}.routine-exercises-editor>header{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap}.routine-exercises-editor>header>div{min-width:0;flex:1 1 420px}.routine-exercises-editor>header span{font-size:10px;font-weight:900;letter-spacing:.8px;color:#d7192d}.routine-exercises-editor>header h3{margin:3px 0}.routine-exercises-editor>header p{margin:0;color:#6c7882;font-size:12px}
    .routine-exercise-row{display:grid;grid-template-columns:34px minmax(0,1fr) auto;gap:12px;align-items:start;padding:16px;border:1px solid #e2e8ec;border-radius:14px;background:#fbfcfd;min-width:0}.routine-exercise-number{display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:#1f2a33;color:#fff;font-weight:900}.routine-exercise-fields{display:grid;gap:10px;min-width:0}.routine-exercise-grid{display:grid;grid-template-columns:repeat(4,minmax(120px,1fr));gap:12px;min-width:0}.routine-exercise-grid label{min-width:0}.routine-exercise-grid input{width:100%!important;min-width:0!important}.routine-remove{align-self:center}
    @media(max-width:1100px){.routine-exercise-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:650px){.routine-editor-card{padding:16px!important}.routine-exercise-row{grid-template-columns:30px minmax(0,1fr)}.routine-remove{grid-column:2;justify-self:start}.routine-exercise-grid{grid-template-columns:1fr}.routine-exercises-editor>header .admin-secondary{width:100%}}
    .feedback-admin-shell{display:grid;gap:18px}.feedback-admin-head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;padding:22px;border:1px solid #e5eaee;border-radius:18px;background:#fff}.feedback-admin-head span{font-size:10px;font-weight:900;letter-spacing:.9px;color:#d7192d}.feedback-admin-head h2{margin:5px 0}.feedback-admin-head p{margin:0;color:#66737e}.feedback-admin-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.feedback-admin-kpis article{display:grid;gap:4px;padding:18px;border:1px solid #e5eaee;border-radius:16px;background:#fff}.feedback-admin-kpis small{font-weight:900;color:#7a8791}.feedback-admin-kpis b{font-size:28px}.feedback-admin-kpis span{font-size:12px;color:#75818b}
    .feedback-admin-list{display:grid;gap:12px}.feedback-admin-list>article{display:grid;grid-template-columns:150px 1fr auto;gap:18px;align-items:center;padding:18px;border:1px solid #e5eaee;border-left:4px solid #d7192d;border-radius:16px;background:#fff}.feedback-admin-list>article.reviewed{border-left-color:#198754}.feedback-admin-rating{display:grid;gap:4px}.feedback-admin-rating span{font-size:18px;letter-spacing:1px;color:#d99800}.feedback-admin-rating small{color:#77848e}.feedback-admin-copy small{color:#7a8791}.feedback-admin-copy h3{margin:4px 0}.feedback-admin-copy p{margin:0;color:#4f5d67}.feedback-admin-actions{display:grid;justify-items:end;gap:9px}.feedback-admin-actions>span{padding:5px 9px;border-radius:999px;background:#fff1f2;color:#b51625;font-size:10px;font-weight:900}.feedback-admin-actions>span.done{background:#eef8f1;color:#187743}.feedback-admin-empty{display:grid;place-items:center;gap:5px;padding:40px;border:1px dashed #d4dce2;border-radius:16px;background:#fff;color:#66737e}.feedback-admin-empty>span{font-size:28px}
    .trainer-single-layout{display:grid;grid-template-columns:minmax(360px,520px) minmax(0,1fr);gap:18px;margin-top:22px;align-items:start}
    .trainer-main-card{padding:24px;border:1px solid #e3e8ef;border-radius:16px;background:#fff;box-shadow:0 7px 24px rgba(12,32,60,.045)}
    .trainer-main-top{display:grid;grid-template-columns:58px minmax(0,1fr) auto;gap:14px;align-items:center}
    .trainer-main-avatar{width:58px;height:58px;border-radius:16px;display:grid;place-items:center;background:linear-gradient(135deg,#071a33,#174774);color:#fff;font-size:20px;font-weight:900}
    .trainer-main-top>div:nth-child(2)>span{font-size:9px;font-weight:900;letter-spacing:1px;color:#d7192d}.trainer-main-top h2{margin:3px 0;font-size:22px}.trainer-main-top p{margin:0;color:#6d7984}
    .trainer-main-status{padding:6px 10px;border-radius:999px;background:#eaf7ef;color:#16804a;font-size:9px;font-weight:900}.trainer-main-status.inactive{background:#fff0f1;color:#ba2433}
    .trainer-main-data{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:20px 0}.trainer-main-data article{display:grid;gap:4px;padding:13px;border:1px solid #e7ecf0;border-radius:12px;background:#fafcfd}.trainer-main-data small{font-size:8px;font-weight:900;color:#7d8994}.trainer-main-data b{font-size:11px;color:#24374b;overflow-wrap:anywhere}
    .trainer-main-note{display:flex;gap:10px;padding:14px;border-radius:12px;background:#f2f7fb}.trainer-main-note>span{display:grid;place-items:center;width:28px;height:28px;border-radius:9px;background:#e3f4ea;color:#16804a;font-weight:900}.trainer-main-note div{display:grid;gap:3px}.trainer-main-note b{font-size:10px}.trainer-main-note small{font-size:9px;color:#6f7d88}
    .trainer-edit-button{margin-top:16px;width:100%}.trainer-empty-card{min-height:260px;display:grid;place-items:center;align-content:center;text-align:center;color:#72808d}.trainer-empty-card>span{font-size:34px}.trainer-empty-card h2{margin:8px 0 4px;color:#26394d}.trainer-empty-card p{margin:0;max-width:420px}
    .trainer-access-check{display:grid!important;grid-template-columns:22px 1fr!important;align-items:center!important}.trainer-access-check input{width:18px!important;height:18px!important}
    .trainer-required-note{display:flex;gap:9px;align-items:center;padding:12px;border:1px solid #ffd8dc;border-radius:10px;background:#fff7f7;color:#8b2630}.trainer-required-note>span{font-weight:900}.trainer-required-note div{display:grid;gap:2px}.trainer-required-note b{font-size:10px}.trainer-required-note small{font-size:8px}.trainer-required-note.compact{min-height:42px;box-sizing:border-box}
    @media(max-width:900px){
      .trainer-single-layout{grid-template-columns:1fr}
      .trainer-main-data{grid-template-columns:repeat(2,minmax(0,1fr))}
      .routine-exercise-grid{grid-template-columns:repeat(2,1fr)}
      .feedback-admin-kpis{grid-template-columns:1fr}
      .feedback-admin-list>article{grid-template-columns:1fr}
      .feedback-admin-actions{justify-items:start}
    }
    @media(max-width:560px){
      .trainer-main-top{grid-template-columns:52px minmax(0,1fr)}
      .trainer-main-status{grid-column:1/-1;justify-self:start}
      .trainer-main-data{grid-template-columns:1fr}
    }
  `]
})
export class AdminIntegradoComponent implements OnInit, OnDestroy {
  @Input() seccionInicial = 'dashboard';
  seccion = 'dashboard';
  toast = '';
  error = '';
  dashboard: any = null;
  reporteIngresos: any = null;
  reporteAsistencias: any = null;
  reporteVencimientos: any[] = [];

  clientes: any[] = [];
  membresiasDisponibles: any[] = [];
  planesMembresia: any[] = [];
  membresiasCliente: any[] = [];
  pagos: any[] = [];
  entrenadores: any[] = [];
  clases: any[] = [];
  asistencias: any[] = [];
  categorias: any[] = [];
  rutinas: any[] = [];
  reservas: any[] = [];
  usuarios: any[] = [];
  opiniones: any[] = [];
  auditorias: any[] = [];
  auditoriaBusqueda = '';
  auditoriaMetodo = '';
  auditoriaEstado = '';
  auditoriaSoloImportantes = false;
  auditoriaPagina = 1;
  auditoriaPorPagina = 12;
  auditoriaDetalle: any = null;
  productos: any[] = [];
  proveedores: any[] = [];
  compras: any[] = [];
  ventas: any[] = [];
  kardex: any[] = [];
  caja: any = null;
  historialCaja: any[] = [];

  dias = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  titulos: Record<string,[string,string]> = {
    dashboard:['Panel Administrador','Datos reales del gimnasio'], clientes:['Members','Member registration and management'],
    membresias:['Membresías','Asignación, renovación y vigencia de socios'], pagos:['Payments','Membership payments and member purchases'],
    planes:['Pricing Plans','Prices, duration and membership benefits'],
    gastos:['Gastos','Registro de egresos de la caja activa'],
    inventario:['Inventario','Productos, stock y control del inventario'],
    kardex:['Kardex y stock','Ajustes manuales y trazabilidad de movimientos de inventario'],
    'historial-ventas':['Historial de Ventas','Consulta de todas las ventas registradas'],
    'reporte-asistencias':['Reporte de Asistencias','Resumen y detalle de asistencias registradas'],
    entrenador:['Trainers','Main trainer management'], clases:['Clases','Programación, horarios y cupos'],
    asistencias:['Asistencias','Control de entradas y salidas'], rutinas:['My Workout Plan','Workout routines and member tracking'],
    reservas:['Reservas','Reservas creadas desde el portal y control de asistencia'], categorias:['Categorías','Clasificación de productos'],
    productos:['Productos','Registro, precios y control de stock'], proveedores:['Proveedores','Proveedores de productos'],
    compras:['Compras','Ingreso de productos e inventario'], ventas:['Ventas','Ventas de productos y stock'],
    caja:['Caja','Apertura, movimientos y cierre'],
    reportes:['My Reports','Gym performance indicators'], usuarios:['Usuarios','Cuentas internas y permisos'],
    comunicacion:['Notificaciones','Avisos que reciben los clientes en su portal'], soporte:['Soporte','Consultas y solicitudes enviadas desde el portal del cliente'],
    opiniones:['Opiniones','Comentarios y calificaciones enviadas desde el portal del cliente'],
    auditoria:['Auditoría','Historial de acciones, usuarios, rutas y resultados del sistema'],
    configuracion:['Configuración','Ajustes generales y mantenimiento del sistema'],
    nutricion:['My Diet Plan','Nutrition plans and member tracking'],
    equipos:['Equipments','Machines, maintenance and operating status'],
    eventos:['Gym Events','Gym activities, campaigns and events'],
    galeria:['Gallery','Gym visual content and photos'],
    noticias:['News & Updates','Announcements, promotions and updates'],
    salarios:['Salaries','Staff remuneration and payments'],
    ingresos:['Income','Additional income and financial concepts'],
    facturas:['Invoices','Invoices, amounts and payment status']
  };

  sidebarCerrado = false;
  actualizandoDatos = false;
  ultimaActualizacion = '';
  ultimaActualizacionTs = 0;
  dashboardCargando = false;
  dashboardError = '';
  autoRefreshActivo = true;
  busquedaAdmin = '';
  mostrarAnalisisAvanzado = false;
  workoutSemana = 1;
  semanaDashboardDemo = [
    {dia:'Mon',total:5},{dia:'Tue',total:7},{dia:'Wed',total:4},{dia:'Thu',total:6},
    {dia:'Fri',total:6},{dia:'Sat',total:9},{dia:'Sun',total:4}
  ];
  nutricionPreview: any[] = [];
  suiteModules = ['equipos','eventos','galeria','noticias','salarios','ingresos','facturas'];
  navGroups:any = {members:false,payments:false,salaries:false,ui:false,jquery:false,forms:false,graphs:false,auth:false,menu:false};
  uiElementLinks = [
    {id:'alerts',label:'Alerts'},{id:'avatars',label:'Avatars'},{id:'badges',label:'Badges'},
    {id:'buttons',label:'Buttons'},{id:'button-groups',label:'Button Groups'},{id:'cards-ui',label:'Cards'},
    {id:'advanced-cards',label:'Advanced Cards'},{id:'dropdowns',label:'Dropdowns'},{id:'list-items',label:'List Items'},
    {id:'progress-bars',label:'Progress Bars'},{id:'placeholders',label:'Placeholders'},{id:'spinners',label:'Spinners'}
  ];
  jqueryLinks = [
    {id:'accordions',label:'Accordions'},{id:'carousel',label:'Carousel'},{id:'modals',label:'Modals'},
    {id:'popovers',label:'Popovers'},{id:'tabs-ui',label:'Tabs'},{id:'tooltips',label:'Tooltips'}
  ];
  formLinks = [
    {id:'form-inputs',label:'Form Inputs'},{id:'checkbox-radio',label:'Checkbox & Radio'},
    {id:'file-input',label:'File Input'},{id:'validations',label:'Validations'},{id:'date-time',label:'Date Time Pickers'},
    {id:'input-masks',label:'Input Masks'},{id:'input-tags',label:'Input Tags'}
  ];

  extraModules = [
    'sports-components','trainer-profile','members-list','members-cards','add-member','edit-member','edit-member-details',
    'invoices-list','add-invoice','edit-invoice','invoice-details','create-invoice','expenses','payslip',
    'tables','data-tables','graphs','apex','morris','vector-maps',
    'accordions','carousel','modals','popovers','tabs-ui','tooltips',
    'forms','form-inputs','checkbox-radio','file-input','validations','date-time','input-masks','input-tags',
    'alerts','avatars','badges','buttons','button-groups','cards-ui','advanced-cards','dropdowns','list-items',
    'progress-bars','placeholders','spinners','icons','account-settings','my-profile','contact','typography',
    'login-signup','login-page','signup-page','forgot-password','reset-password-page',
    'page-not-found','maintenance','menu-level','menu-level-1','menu-level-2','menu-level-3',
    'external-link','chip','badge-link','disabled-link'
  ];

  private autoRefreshId: any = null;

  diasSemana = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  configuracionForm: any = {
    nombre_gimnasio:'Mallqui Gym', ruc:'', telefono:'939398148', correo:'',
    direccion:'Jr. Los Laureles Mz 17 Lt 18', referencia:'Referencia: Plaza de Laura Bosso',
    frase_publicitaria:'Ven, entrena con Mallqui Gym con el propósito de tener una vida saludable.',
    horario_detalle:'Lunes a viernes: 6:00 a. m. - 12:00 p. m. y 2:00 p. m. - 9:30 p. m. | Sábado: 6:00 a. m. - 12:00 p. m. y 2:00 p. m. - 8:30 p. m. | Domingo: atención hasta el mediodía.',
    tarifa_diaria:6, mensaje_productos:'Energizantes, bebidas y productos para consumo disponibles en recepción.',
    hora_apertura:'06:00', hora_cierre:'21:30',
    dias_atencion:['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'],
    dias_aviso_vencimiento:7, minutos_cancelacion_reserva:120,
    dias_anticipacion_reserva:7, stock_minimo_default:5,
    notificar_vencimientos:true, notificar_stock_bajo:true, notificar_pagos_pendientes:true
  };
  configEstado: any = null;
  ultimoRespaldo: any = null;
  configPassword: any = {actual:'',nueva:'',confirmacion:''};
  configGuardando = false;
  configAccion = '';

  clienteEditandoId = 0;
  clienteFichaId = 0;
  clienteFormularioAbierto = false;
  guardandoCliente = false;
  clientesBusqueda = '';
  clientesEstadoFiltro = '';
  clientesPagina = 1;
  clientesPorPagina = 8;
  clienteForm: any = {dni:'',nombres:'',apellidos:'',telefono:'',correo:'',direccion:'',estado:'Activo',crear_acceso:false,nombre_usuario:'',contrasena:''};
  membresiaForm: any = {id_cliente:0,id_membresia:0,metodo_pago:'Efectivo',numero_operacion:''};
  entrenadorEditandoId = 0;
  entrenadorForm: any = {dni:'',nombres:'',apellidos:'',telefono:'',correo:'',especialidad:'',fecha_contratacion:new Date().toISOString().slice(0,10),salario:0,estado:'Activo',crear_acceso:true,nombre_usuario:'',contrasena:''};
  claseEditandoId = 0;
  claseForm: any = {id_entrenador:null,nombre:'',descripcion:'',dia_semana:'Lunes',hora_inicio:'08:00',hora_fin:'09:00',cupo_maximo:15,estado:'Activo'};
  asistenciaCliente = 0;
  asistenciaCodigo = '';
  ultimoAccesoCodigo: any = null;
  procesandoAccesoCodigo = false;
  categoriaEditandoId = 0;
  categoriaForm: any = {nombre_categoria:'',descripcion:'',estado:'Activo'};
  rutinaEditandoId = 0;
  rutinaForm: any = {id_cliente:0,id_entrenador:0,nombre_rutina:'',objetivo:'',descripcion:'',fecha_inicio:new Date().toISOString().slice(0,10),fecha_fin:'',estado:'Activo'};
  rutinaDetallesForm: any[] = [{ejercicio:'',series:3,repeticiones:12,peso_recomendado:null,descanso_segundos:60,observaciones:''}];
  solicitudRutinaContexto: any = null;
  solicitudRutinaIdPendiente = 0;
  usuarioEditandoId = 0;
  usuarioForm: any = {nombre_usuario:'',contrasena:'',nombres:'',apellidos:'',dni:'',telefono:'',correo:'',rol:'Entrenador',estado:'Activo'};
  auditoriaFiltros: any = {ruta:'',desde:'',hasta:''};
  proveedorEditandoId = 0;
  proveedorForm: any = {ruc:'',razon_social:'',contacto:'',telefono:'',correo:'',direccion:'',estado:'Activo'};
  compraForm: any = {id_proveedor:0,id_producto:0,cantidad:1,precio_compra:0,tipo_comprobante:'Factura',numero_comprobante:''};
  compraItems: any[] = [];
  ventaForm: any = {id_cliente:0,id_producto:0,cantidad:1,tipo_comprobante:'Boleta',numero_comprobante:'',metodo_pago:'Efectivo',numero_operacion:'',igv_porcentaje:18};
  ventaItems: any[] = [];
  planEditandoId = 0;
  planForm: any = {nombre:'',duracion_meses:1,precio:0,descripcion:'',beneficios_texto:'',permite_reservas:true,estado:'Activo'};
  ajusteForm: any = {id_producto:0,tipo:'Entrada',cantidad:1,motivo:''};
  cajaAbrirForm: any = {monto_inicial:0,observacion:''};
  movCajaForm: any = {tipo:'Ingreso',monto:0,descripcion:'',origen:'Manual'};
  gastoForm: any = {descripcion:'',monto:0};
  cajaCerrarForm: any = {monto_real:0,observacion:''};

  constructor(public auth: AuthService, private api: AdminApiService, private router: Router) {}

  ngOnInit(): void {
    this.seccion = this.normalizarSeccion(this.seccionInicial || 'dashboard');
    try{
      this.sidebarCerrado = localStorage.getItem('mallqui_admin_sidebar_closed') === '1';
      this.autoRefreshActivo = localStorage.getItem('mallqui_admin_auto_refresh') !== '0';
    }catch{
      this.sidebarCerrado = false;
      this.autoRefreshActivo = true;
    }
    this.cargarDashboard();
    if (this.seccion !== 'dashboard') this.cargarSeccion(this.seccion);

    // Refresco inteligente: no interrumpe formularios ni trabaja cuando la pestaña está oculta.
    this.autoRefreshId = setInterval(() => {
      if (this.autoRefreshActivo && !document.hidden && !this.actualizandoDatos && this.puedeAutoActualizar) {
        this.actualizarSeccionActual(true);
      }
    }, 15000);
  }

  ngOnDestroy(): void {
    if (this.autoRefreshId) {
      clearInterval(this.autoRefreshId);
      this.autoRefreshId = null;
    }
  }


  buscarEnPanel(): void {
    const q=String(this.busquedaAdmin||'')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'');

    if(!q){
      this.ok('Escribe qué módulo necesitas abrir');
      return;
    }

    const destinos:Array<{claves:string[],seccion:string}>=[
      {claves:['historial venta','historial ventas'],seccion:'historial-ventas'},
      {claves:['reporte asistencia','reporte asistencias'],seccion:'reporte-asistencias'},
      {claves:['socio','socios','cliente','clientes','miembro','miembros'],seccion:'clientes'},
      {claves:['membresia','membresias'],seccion:'membresias'},
      {claves:['pago','pagos'],seccion:'pagos'},
      {claves:['asistencia','asistencias','entrada','salida'],seccion:'asistencias'},
      {claves:['tarifa','tarifas','plan','planes'],seccion:'planes'},
      {claves:['clase','clases'],seccion:'clases'},
      {claves:['reserva','reservas','agenda'],seccion:'reservas'},
      {claves:['rutina','rutinas'],seccion:'rutinas'},
      {claves:['entrenador','entrenadores'],seccion:'entrenador'},
      {claves:['trainer profile','perfil entrenador'],seccion:'trainer-profile'},
      {claves:['sports components','componentes deportivos','fitness widgets'],seccion:'sports-components'},
      {claves:['caja','apertura','cierre'],seccion:'caja'},
      {claves:['venta','ventas','punto de venta'],seccion:'ventas'},
      {claves:['gasto','gastos','egreso','egresos'],seccion:'gastos'},
      {claves:['compra','compras'],seccion:'compras'},
      {claves:['proveedor','proveedores'],seccion:'proveedores'},
      {claves:['kardex','movimiento inventario'],seccion:'kardex'},
      {claves:['categoria','categorias'],seccion:'categorias'},
      {claves:['producto','productos','inventario','stock'],seccion:'inventario'},
      {claves:['soporte','consulta','consultas'],seccion:'soporte'},
      {claves:['opinion','opiniones','comentario'],seccion:'opiniones'},
      {claves:['notificacion','notificaciones','comunicacion','avisos'],seccion:'comunicacion'},
      {claves:['reporte','reportes','indicadores'],seccion:'reportes'},
      {claves:['usuario','usuarios','cuenta interna'],seccion:'usuarios'},
      {claves:['auditoria','auditoria','logs','registro actividad'],seccion:'auditoria'},
      {claves:['nutricion','dieta','alimentacion','plan alimentacion'],seccion:'nutricion'},
      {claves:['equipo','equipos','maquina','maquinas','mantenimiento'],seccion:'equipos'},
      {claves:['evento','eventos','actividad'],seccion:'eventos'},
      {claves:['galeria','foto','fotos','imagen'],seccion:'galeria'},
      {claves:['noticia','noticias','novedad','novedades','promocion'],seccion:'noticias'},
      {claves:['salario','salarios','sueldo','sueldos'],seccion:'salarios'},
      {claves:['ingreso','ingresos'],seccion:'ingresos'},
      {claves:['factura','facturas','comprobante'],seccion:'facturas'},
      {claves:['members list','lista socios','lista miembros'],seccion:'members-list'},
      {claves:['add member','agregar socio','nuevo socio'],seccion:'add-member'},
      {claves:['edit member','editar socio','editar miembro'],seccion:'edit-member'},
      {claves:['invoices list','lista facturas'],seccion:'invoices-list'},
      {claves:['add invoice','agregar factura','nueva factura'],seccion:'add-invoice'},
      {claves:['edit invoice','editar factura'],seccion:'edit-invoice'},
      {claves:['tables','tabla','tablas'],seccion:'tables'},
      {claves:['data table','datatable','filtros tabla'],seccion:'data-tables'},
      {claves:['graph','graphs','graficos','gráficos'],seccion:'graphs'},
      {claves:['apex','apex charts'],seccion:'apex'},
      {claves:['morris','morris charts'],seccion:'morris'},
      {claves:['mapa','maps','vector maps'],seccion:'vector-maps'},
      {claves:['accordion','accordions'],seccion:'accordions'},
      {claves:['carousel','carrusel'],seccion:'carousel'},
      {claves:['modal','modals'],seccion:'modals'},
      {claves:['popover','popovers'],seccion:'popovers'},
      {claves:['tabs','pestañas'],seccion:'tabs-ui'},
      {claves:['tooltip','tooltips'],seccion:'tooltips'},
      {claves:['forms','formularios'],seccion:'forms'},
      {claves:['inputs','form inputs'],seccion:'form-inputs'},
      {claves:['checkbox','radio'],seccion:'checkbox-radio'},
      {claves:['archivo','file input','upload'],seccion:'file-input'},
      {claves:['validacion','validaciones'],seccion:'validations'},
      {claves:['fecha hora','date time'],seccion:'date-time'},
      {claves:['input mask','mascaras'],seccion:'input-masks'},
      {claves:['tags','etiquetas'],seccion:'input-tags'},
      {claves:['alerts','alertas'],seccion:'alerts'},
      {claves:['avatars','avatares'],seccion:'avatars'},
      {claves:['badges','insignias'],seccion:'badges'},
      {claves:['buttons','botones'],seccion:'buttons'},
      {claves:['cards','tarjetas'],seccion:'cards-ui'},
      {claves:['dropdown','desplegable'],seccion:'dropdowns'},
      {claves:['progress','progreso'],seccion:'progress-bars'},
      {claves:['icons','iconos'],seccion:'icons'},
      {claves:['account settings','cuenta'],seccion:'account-settings'},
      {claves:['my profile','perfil'],seccion:'my-profile'},
      {claves:['contact','contacto'],seccion:'contact'},
      {claves:['typography','tipografia'],seccion:'typography'},
      {claves:['login signup','autenticacion'],seccion:'login-signup'},
      {claves:['404','page not found'],seccion:'page-not-found'},
      {claves:['maintenance','mantenimiento'],seccion:'maintenance'},
      {claves:['configuracion','sistema','ajustes'],seccion:'configuracion'},
      {claves:['dashboard','inicio','panel'],seccion:'dashboard'}
    ];

    const encontrado=destinos.find(x=>x.claves.some(k=>q.includes(k)));
    if(encontrado){
      this.cambiarSeccion(encontrado.seccion);
      this.busquedaAdmin='';
      return;
    }

    this.error='No encontré esa función. Prueba con socios, reservas, caja, ventas, inventario, reportes o sistema.';
  }

  toggleNavGroup(group:string):void{
    this.navGroups[group]=!this.navGroups[group];
  }

  toggleSidebar(): void {
    this.sidebarCerrado = !this.sidebarCerrado;
    try{localStorage.setItem('mallqui_admin_sidebar_closed', this.sidebarCerrado ? '1' : '0');}catch{}
  }

  get estiloModuloActual():string{
    if(['clientes','membresias','pagos','asistencias','reporte-asistencias','entrenador','clases','reservas','planes'].includes(this.seccion)) return 'personas';
    if(['ventas','historial-ventas','caja','gastos','inventario','productos','kardex','categorias','proveedores','compras'].includes(this.seccion)) return 'operacion';
    if(['salarios','ingresos','facturas'].includes(this.seccion)) return 'finanzas';
    if(['equipos','eventos','galeria','noticias','soporte','opiniones','comunicacion'].includes(this.seccion)) return 'contenido';
    return 'sistema';
  }

  get etiquetaModuloActual():string{
    const mapa:any={
      clientes:'GESTIÓN DE SOCIOS',membresias:'MEMBRESÍAS',pagos:'PAGOS Y COBROS',
      asistencias:'CONTROL DE ASISTENCIA','reporte-asistencias':'REPORTE DE ASISTENCIA',
      entrenador:'EQUIPO DE ENTRENADORES',clases:'CLASES DEL GIMNASIO',reservas:'RESERVAS',
      planes:'PLANES Y PRECIOS',ventas:'VENTAS', 'historial-ventas':'HISTORIAL DE VENTAS',
      caja:'CONTROL DE CAJA',gastos:'GASTOS',inventario:'INVENTARIO',productos:'PRODUCTOS',
      kardex:'MOVIMIENTOS DE STOCK',categorias:'CATEGORÍAS',proveedores:'PROVEEDORES',
      compras:'COMPRAS',equipos:'EQUIPOS DEL GIMNASIO',eventos:'EVENTOS',galeria:'GALERÍA',
      noticias:'NOTICIAS',salarios:'SALARIOS',ingresos:'INGRESOS',facturas:'FACTURACIÓN',
      soporte:'ATENCIÓN AL CLIENTE',opiniones:'OPINIONES',comunicacion:'COMUNICACIÓN',
      usuarios:'USUARIOS',auditoria:'AUDITORÍA',configuracion:'CONFIGURACIÓN'
    };
    return mapa[this.seccion]||'MALLQUI GYM';
  }

  get estadoModuloActual():string{
    if(['caja'].includes(this.seccion)) return this.dashboard?.caja?.abierta?'Caja abierta':'Caja cerrada';
    if(['inventario','productos','kardex'].includes(this.seccion)) return (this.dashboard?.inventario?.productos_stock_bajo||0)+' alertas de stock';
    if(['pagos','ventas','ingresos','facturas','salarios','gastos'].includes(this.seccion)) return 'Control financiero';
    if(['clientes','membresias','asistencias','entrenador','clases','reservas','planes'].includes(this.seccion)) return 'Gestión activa';
    return this.dashboard?.fuente?.base_datos?'Sistema en línea':'Panel administrativo';
  }

  get panelesModuloActual():Array<{title:string,subtitle:string,badge:string,icon:string,bars:number[]}>{
    const m=this.metricasModuloActual;
    const barsA=[28,45,62,78,54,70,42];
    const barsB=[35,52,40,82,66,58,74];
    const barsC=[22,38,57,49,71,86,64];
    const barsD=[30,68,44,76,55,80,61];
    switch(this.estiloModuloActual){
      case 'personas':
        return [
          {title:'Actividad de socios',subtitle:m[0]?.label||'Actividad',badge:m[0]?.value||'0',icon:'♚',bars:barsA},
          {title:'Seguimiento',subtitle:m[1]?.label||'Estado',badge:m[1]?.value||'0',icon:'✓',bars:barsB},
          {title:'Movimiento semanal',subtitle:m[2]?.label||'Semana',badge:m[2]?.value||'0',icon:'⌁',bars:barsC},
          {title:'Estado general',subtitle:m[3]?.label||'Total',badge:m[3]?.value||'0',icon:'★',bars:barsD}
        ];
      case 'operacion':
        return [
          {title:'Operación de hoy',subtitle:m[0]?.label||'Operación',badge:m[0]?.value||'0',icon:'▣',bars:barsB},
          {title:'Movimiento',subtitle:m[1]?.label||'Movimiento',badge:m[1]?.value||'0',icon:'↗',bars:barsD},
          {title:'Control',subtitle:m[2]?.label||'Control',badge:m[2]?.value||'0',icon:'▦',bars:barsA},
          {title:'Rendimiento',subtitle:m[3]?.label||'Rendimiento',badge:m[3]?.value||'0',icon:'⌘',bars:barsC}
        ];
      case 'finanzas':
        return [
          {title:'Resumen financiero',subtitle:m[0]?.label||'Ingresos',badge:m[0]?.value||'0',icon:'S/',bars:barsD},
          {title:'Flujo del día',subtitle:m[1]?.label||'Ventas',badge:m[1]?.value||'0',icon:'↗',bars:barsB},
          {title:'Operaciones',subtitle:m[2]?.label||'Operaciones',badge:m[2]?.value||'0',icon:'▤',bars:barsA},
          {title:'Estado de caja',subtitle:m[3]?.label||'Caja',badge:m[3]?.value||'0',icon:'▣',bars:barsC}
        ];
      case 'contenido':
        return [
          {title:'Contenido activo',subtitle:m[0]?.label||'Activos',badge:m[0]?.value||'0',icon:'◇',bars:barsA},
          {title:'Actividad reciente',subtitle:m[1]?.label||'Actividad',badge:m[1]?.value||'0',icon:'◫',bars:barsB},
          {title:'Participación',subtitle:m[2]?.label||'Participación',badge:m[2]?.value||'0',icon:'♚',bars:barsC},
          {title:'Estado',subtitle:m[3]?.label||'Sistema',badge:m[3]?.value||'0',icon:'●',bars:barsD}
        ];
      default:
        return [
          {title:'Usuarios y acceso',subtitle:m[0]?.label||'Usuarios',badge:m[0]?.value||'0',icon:'♙',bars:barsC},
          {title:'Actividad del sistema',subtitle:m[1]?.label||'Eventos',badge:m[1]?.value||'0',icon:'⌘',bars:barsA},
          {title:'Estado del servicio',subtitle:m[2]?.label||'Estado',badge:m[2]?.value||'0',icon:'●',bars:barsB},
          {title:'Base de datos',subtitle:m[3]?.label||'Datos',badge:m[3]?.value||'0',icon:'▦',bars:barsD}
        ];
    }
  }

  get metricasModuloActual():Array<{label:string,value:string,icon:string}>{
    const n=(v:any)=>Number(v||0);
    const len=(v:any)=>Array.isArray(v)?v.length:0;
    const money=(v:any)=>'S/ '+n(v).toFixed(2);
    const activos=(lista:any[])=>Array.isArray(lista)
      ? lista.filter((x:any)=>String(x?.estado||'').toLowerCase()==='activo').length
      : 0;

    switch(this.seccion){
      case 'clientes':
        return [
          {label:'Socios registrados',value:String(len(this.clientes)),icon:'♚'},
          {label:'Socios activos',value:String(n(this.dashboard?.clientes?.activos)),icon:'✓'},
          {label:'Nuevos este mes',value:String(n(this.dashboard?.clientes?.nuevos_mes)),icon:'+'},
          {label:'Membresías activas',value:String(n(this.dashboard?.membresias?.activas)),icon:'★'}
        ];
      case 'membresias':
      case 'planes':
        return [
          {label:'Membresías activas',value:String(n(this.dashboard?.membresias?.activas)),icon:'★'},
          {label:'Por vencer',value:String(n(this.dashboard?.membresias?.por_vencer_7_dias)),icon:'!'},
          {label:'Planes disponibles',value:String(len(this.planesMembresia)),icon:'▤'},
          {label:'Pagos registrados',value:String(len(this.pagos)),icon:'S/'}
        ];
      case 'pagos':
        return [
          {label:'Pagos registrados',value:String(len(this.pagos)),icon:'S/'},
          {label:'Ingresos del mes',value:money(this.dashboard?.ingresos?.total_mes),icon:'↗'},
          {label:'Membresías activas',value:String(n(this.dashboard?.membresias?.activas)),icon:'★'},
          {label:'Por vencer',value:String(n(this.dashboard?.membresias?.por_vencer_7_dias)),icon:'!'}
        ];
      case 'asistencias':
      case 'reporte-asistencias':
        return [
          {label:'Dentro del gym',value:String(n(this.dashboard?.asistencias?.dentro_ahora)),icon:'✓'},
          {label:'Accesos hoy',value:String(n(this.dashboard?.asistencias?.hoy)),icon:'⌁'},
          {label:'Registros',value:String(len(this.asistencias)),icon:'▣'},
          {label:'Socios activos',value:String(n(this.dashboard?.clientes?.activos)),icon:'♚'}
        ];
      case 'rutinas':
        return [
          {label:'Rutinas',value:String(len(this.rutinas)),icon:'☷'},
          {label:'Pendientes',value:String(n(this.dashboard?.alertas?.rutinas_pendientes)),icon:'!'},
          {label:'Entrenadores',value:String(len(this.entrenadores)),icon:'♙'},
          {label:'Socios activos',value:String(n(this.dashboard?.clientes?.activos)),icon:'♚'}
        ];
      case 'clases':
      case 'reservas':
        return [
          {label:'Clases activas',value:String(n(this.dashboard?.operacion?.clases_activas)),icon:'◷'},
          {label:'Reservas hoy',value:String(n(this.dashboard?.reservas?.hoy)),icon:'◫'},
          {label:'Entrenadores',value:String(len(this.entrenadores)),icon:'♙'},
          {label:'Socios activos',value:String(n(this.dashboard?.clientes?.activos)),icon:'♚'}
        ];
      case 'entrenador':
        return [
          {label:'Entrenadores',value:String(len(this.entrenadores)),icon:'♙'},
          {label:'Activos',value:String(activos(this.entrenadores)),icon:'✓'},
          {label:'Clases activas',value:String(n(this.dashboard?.operacion?.clases_activas)),icon:'◷'},
          {label:'Rutinas',value:String(len(this.rutinas)),icon:'☷'}
        ];
      case 'ventas':
      case 'historial-ventas':
        return [
          {label:'Ventas hoy',value:money(this.dashboard?.ventas?.hoy_total),icon:'S/'},
          {label:'Operaciones',value:String(n(this.dashboard?.ventas?.hoy_cantidad)),icon:'▤'},
          {label:'Ingresos del mes',value:money(this.dashboard?.ingresos?.total_mes),icon:'↗'},
          {label:'Ventas registradas',value:String(len(this.ventas)),icon:'✓'}
        ];
      case 'caja':
      case 'gastos':
        return [
          {label:'Estado de caja',value:this.dashboard?.caja?.abierta?'Abierta':'Cerrada',icon:'▣'},
          {label:'Ventas hoy',value:money(this.dashboard?.ventas?.hoy_total),icon:'S/'},
          {label:'Ingresos del mes',value:money(this.dashboard?.ingresos?.total_mes),icon:'↗'},
          {label:'Gastos actuales',value:money(this.totalGastosCajaActual),icon:'↓'}
        ];
      case 'inventario':
      case 'productos':
      case 'kardex':
      case 'categorias':
      case 'proveedores':
      case 'compras':
        return [
          {label:'Productos',value:String(len(this.productos)),icon:'▦'},
          {label:'Stock bajo',value:String(n(this.dashboard?.inventario?.productos_stock_bajo)),icon:'!'},
          {label:'Proveedores',value:String(len(this.proveedores)),icon:'◆'},
          {label:'Compras',value:String(len(this.compras)),icon:'↘'}
        ];
      case 'reportes':
        return [
          {label:'Ingresos del mes',value:money(this.dashboard?.ingresos?.total_mes),icon:'↗'},
          {label:'Socios activos',value:String(n(this.dashboard?.clientes?.activos)),icon:'♚'},
          {label:'Asistencias hoy',value:String(n(this.dashboard?.asistencias?.hoy)),icon:'✓'},
          {label:'Ventas hoy',value:money(this.dashboard?.ventas?.hoy_total),icon:'S/'}
        ];
      case 'usuarios':
      case 'auditoria':
      case 'configuracion':
        return [
          {label:'Usuarios',value:String(len(this.usuarios)),icon:'♙'},
          {label:'Auditorías',value:String(len(this.auditorias)),icon:'⌘'},
          {label:'Sistema',value:this.dashboard?.fuente?.base_datos?'En línea':'Revisando',icon:'●'},
          {label:'Base de datos',value:String(this.dashboard?.fuente?.base_datos||'—'),icon:'▦'}
        ];
      case 'soporte':
      case 'opiniones':
      case 'comunicacion':
        return [
          {label:'Alertas',value:String(n(this.dashboard?.alertas?.total)),icon:'!'},
          {label:'Opiniones',value:String(len(this.opiniones)),icon:'◇'},
          {label:'Socios activos',value:String(n(this.dashboard?.clientes?.activos)),icon:'♚'},
          {label:'Reservas hoy',value:String(n(this.dashboard?.reservas?.hoy)),icon:'◫'}
        ];
      case 'salarios':
      case 'ingresos':
      case 'facturas':
        return [
          {label:'Ingresos del mes',value:money(this.dashboard?.ingresos?.total_mes),icon:'↗'},
          {label:'Ventas hoy',value:money(this.dashboard?.ventas?.hoy_total),icon:'S/'},
          {label:'Operaciones hoy',value:String(n(this.dashboard?.ventas?.hoy_cantidad)),icon:'▤'},
          {label:'Caja',value:this.dashboard?.caja?.abierta?'Abierta':'Cerrada',icon:'▣'}
        ];
      case 'nutricion':
      case 'equipos':
      case 'eventos':
      case 'galeria':
      case 'noticias':
        return [
          {label:'Socios activos',value:String(n(this.dashboard?.clientes?.activos)),icon:'♚'},
          {label:'Clases activas',value:String(n(this.dashboard?.operacion?.clases_activas)),icon:'◷'},
          {label:'Reservas hoy',value:String(n(this.dashboard?.reservas?.hoy)),icon:'◫'},
          {label:'Sistema',value:this.dashboard?.fuente?.base_datos?'En línea':'Revisando',icon:'●'}
        ];
      default:
        return [
          {label:'Socios activos',value:String(n(this.dashboard?.clientes?.activos)),icon:'♚'},
          {label:'Ingresos',value:money(this.dashboard?.ingresos?.total_mes),icon:'↗'},
          {label:'Reservas',value:String(n(this.dashboard?.reservas?.hoy)),icon:'◫'},
          {label:'Alertas',value:String(n(this.dashboard?.alertas?.total)),icon:'!'}
        ];
    }
  }

  get tituloActual(): string { return this.titulos[this.seccion]?.[0] ?? 'Administrador'; }
  get subtituloActual(): string { return this.titulos[this.seccion]?.[1] ?? ''; }
  get esSeccionSociosSecundaria(): boolean {
    return ['clientes','membresias','asistencias','pagos'].includes(this.seccion);
  }
  get esSeccionServiciosSecundaria(): boolean {
    return ['reservas','rutinas','clases'].includes(this.seccion);
  }
  get esSeccionAtencionSecundaria(): boolean {
    return ['soporte','opiniones','comunicacion'].includes(this.seccion);
  }
  get esSeccionGestionSecundaria(): boolean {
    return ['entrenador','planes','gastos','reportes','reporte-asistencias','usuarios','auditoria','configuracion','caja','ventas','historial-ventas','inventario','kardex','proveedores','compras','categorias','productos','nutricion','equipos','eventos','galeria','noticias','salarios','ingresos','facturas'].includes(this.seccion);
  }

  get puedeAutoActualizar(): boolean {
    return this.seccion === 'dashboard';
  }

  get datosDesactualizados(): boolean {
    return Boolean(this.ultimaActualizacionTs) && (Date.now()-this.ultimaActualizacionTs)>60000;
  }

  private normalizarSeccion(id:string):string{
    if(id==='socios-hub') return 'clientes';
    if(id==='servicios') return 'clases';
    if(id==='atencion') return 'soporte';
    if(id==='gestion') return 'caja';
    return id;
  }

  get moduloActivo():string{
    const s=this.seccion;
    if(s==='dashboard') return 'dashboard';
    if(['clientes','membresias','asistencias','pagos','planes'].includes(s)) return 'socios';
    if(['clases','reservas','rutinas','entrenador'].includes(s)) return 'servicios';
    if(['caja','ventas','historial-ventas','gastos'].includes(s)) return 'operacion';
    if(['inventario','productos','kardex','proveedores','compras','categorias'].includes(s)) return 'inventario';
    if(['nutricion','equipos','eventos','galeria','noticias','salarios','ingresos','facturas'].includes(s)) return 'gestion-fitness';
    if(['soporte','opiniones','comunicacion'].includes(s)) return 'atencion';
    if(['reportes','reporte-asistencias'].includes(s)) return 'reportes';
    if(['usuarios','auditoria','configuracion'].includes(s)) return 'sistema';
    return 'dashboard';
  }

  get nombreModuloActual():string{
    const nombres:any={
      dashboard:'Dashboard',socios:'Socios',servicios:'Servicios',
      operacion:'Caja y ventas',inventario:'Inventario',
      atencion:'Atención al cliente',reportes:'Reportes',sistema:'Sistema','gestion-fitness':'Gestión Fitness'
    };
    return nombres[this.moduloActivo]||'Administración';
  }

  get tabsModuloActual():Array<{id:string,nombre:string}>{
    switch(this.moduloActivo){
      case 'socios':
        return [
          {id:'clientes',nombre:'Clientes'},
          {id:'membresias',nombre:'Membresías'},
          {id:'pagos',nombre:'Pagos'},
          {id:'asistencias',nombre:'Asistencia'},
          {id:'planes',nombre:'Tarifas'}
        ];
      case 'servicios':
        return [
          {id:'clases',nombre:'Clases'},
          {id:'reservas',nombre:'Reservas'},
          {id:'rutinas',nombre:'Rutinas'},
          {id:'entrenador',nombre:'Entrenador'}
        ];
      case 'operacion':
        return [
          {id:'caja',nombre:'Caja'},
          {id:'ventas',nombre:'Punto de venta'},
          {id:'historial-ventas',nombre:'Historial'},
          {id:'gastos',nombre:'Gastos'}
        ];
      case 'inventario':
        return [
          {id:'inventario',nombre:'Productos'},
          {id:'compras',nombre:'Compras'},
          {id:'proveedores',nombre:'Proveedores'},
          {id:'kardex',nombre:'Kardex'},
          {id:'categorias',nombre:'Categorías'}
        ];
      case 'gestion-fitness':
        return [
          {id:'nutricion',nombre:'Nutrición'},
          {id:'equipos',nombre:'Equipos'},
          {id:'eventos',nombre:'Eventos'},
          {id:'galeria',nombre:'Galería'},
          {id:'noticias',nombre:'Noticias'},
          {id:'salarios',nombre:'Salarios'},
          {id:'ingresos',nombre:'Ingresos'},
          {id:'facturas',nombre:'Facturas'}
        ];
      case 'atencion':
        return [
          {id:'soporte',nombre:'Soporte'},
          {id:'opiniones',nombre:'Opiniones'},
          {id:'comunicacion',nombre:'Notificaciones'}
        ];
      case 'reportes':
        return [
          {id:'reportes',nombre:'Resumen'},
          {id:'reporte-asistencias',nombre:'Asistencias'}
        ];
      case 'sistema':
        return [
          {id:'usuarios',nombre:'Usuarios'},
          {id:'auditoria',nombre:'Auditoría'},
          {id:'configuracion',nombre:'Configuración'}
        ];
      default:
        return [];
    }
  }

  abrirModuloAdmin(modulo:string):void{
    const destino:any={
      dashboard:'dashboard',
      socios:'clientes',
      servicios:'clases',
      operacion:'caja',
      inventario:'inventario',
      'gestion-fitness':'nutricion',
      atencion:'soporte',
      reportes:'reportes',
      sistema:'configuracion'
    };
    this.cambiarSeccion(destino[modulo]||'dashboard');
  }

  badgeModulo(modulo:string):number{
    if(modulo==='socios') return Number(this.dashboard?.membresias?.por_vencer_7_dias||0);
    if(modulo==='servicios') return Number(this.dashboard?.alertas?.rutinas_pendientes||0);
    if(modulo==='inventario') return Number(this.dashboard?.inventario?.productos_stock_bajo||0);
    if(modulo==='atencion') return Number(this.dashboard?.alertas?.soporte_pendiente||0)+Number(this.dashboard?.alertas?.opiniones_pendientes||0);
    return 0;
  }

  badgeTab(id:string):number{
    if(id==='membresias') return Number(this.dashboard?.membresias?.por_vencer_7_dias||0);
    if(id==='rutinas') return Number(this.dashboard?.alertas?.rutinas_pendientes||0);
    if(id==='inventario') return Number(this.dashboard?.inventario?.productos_stock_bajo||0);
    if(id==='soporte') return Number(this.dashboard?.alertas?.soporte_pendiente||0);
    if(id==='opiniones') return Number(this.dashboard?.alertas?.opiniones_pendientes||0);
    return 0;
  }

  toggleAutoRefresh(): void {
    this.autoRefreshActivo=!this.autoRefreshActivo;
    try{localStorage.setItem('mallqui_admin_auto_refresh',this.autoRefreshActivo?'1':'0');}catch{}
    this.ok(this.autoRefreshActivo?'Actualización automática activada':'Actualización automática pausada');
  }

  abrirPrioridad(p:any):void{
    const tipo=String(p?.tipo||'').toLowerCase();
    if(tipo==='rutinas'){ this.cambiarSeccion('rutinas'); return; }
    if(tipo==='soporte'){ this.cambiarSeccion('soporte'); return; }
    if(tipo==='opiniones'){ this.cambiarSeccion('opiniones'); return; }
    if(tipo==='inventario'){ this.cambiarSeccion('inventario'); return; }
    if(tipo==='membresias'){ this.cambiarSeccion('membresias'); return; }
    if(tipo==='pagos'){ this.cambiarSeccion('pagos'); return; }
    this.cambiarSeccion('dashboard');
  }

  iconoPrioridad(tipo:any):string{
    const t=String(tipo||'');
    if(t==='rutinas')return '🏋';
    if(t==='soporte')return '?';
    if(t==='opiniones')return '★';
    if(t==='inventario')return '!';
    if(t==='membresias')return '✦';
    return '●';
  }

  progresoSemanal():number{
    const total=(this.dashboard?.tendencias?.asistencias_7_dias||[])
      .reduce((sum:number,x:any)=>sum+Number(x?.total||0),0);
    const objetivo=35;
    return Math.max(0,Math.min(100,Math.round((total/objetivo)*100)));
  }

  alturaAsistenciaSemana(total:any):number{
    const datos=this.diasActividadDashboard().map((x:any)=>Number(x?.total||0));
    const max=Math.max(1,...datos);
    const valor=Math.max(0,Number(total||0));
    return Math.max(12,Math.min(100,(valor/max)*100));
  }

  exportarDashboardCsv():void{
    const d=this.dashboard||{};
    const filas:any[][]=[
      ['MALLQUI GYM','RESUMEN DEL DASHBOARD'],
      ['Fecha',d?.periodo?.fecha||new Date().toLocaleDateString('es-PE')],
      ['Indicador','Valor'],
      ['Socios registrados',d?.clientes?.total??0],
      ['Socios activos',d?.clientes?.activos??0],
      ['Socios nuevos del mes',d?.clientes?.nuevos_mes??0],
      ['Membresías activas',d?.membresias?.activas??0],
      ['Membresías por vencer',d?.membresias?.por_vencer_7_dias??0],
      ['Personas dentro del gym',d?.asistencias?.dentro_ahora??0],
      ['Asistencias de hoy',d?.asistencias?.hoy??0],
      ['Reservas de hoy',d?.reservas?.hoy??0],
      ['Ventas de hoy',d?.ventas?.hoy_cantidad??0],
      ['Total vendido hoy',d?.ventas?.hoy_total??0],
      ['Ingresos del mes',d?.ingresos?.total_mes??0],
      ['Gastos del mes',d?.gastos?.total_mes??0],
      ['Utilidad neta',d?.utilidad?.total_mes??0],
      ['Clases activas',d?.operacion?.clases_activas??0],
      ['Rutinas activas',d?.operacion?.rutinas_activas??0],
      ['Entrenadores activos',d?.operacion?.entrenadores_activos??0],
      ['Stock bajo',d?.inventario?.productos_stock_bajo??0],
      ['Pendientes totales',d?.alertas?.total??0]
    ];
    const csv=filas.map(f=>f.map((v:any)=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\n');
    const url=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');
    a.href=url;
    a.download='dashboard-mallqui-gym-'+new Date().toISOString().slice(0,10)+'.csv';
    a.style.display='none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url),0);
    this.ok('Resumen del dashboard exportado');
  }

  imprimirDashboard():void{
    window.print();
  }

  reintentarDashboard():void{
    this.dashboardError='';
    this.cargarDashboard();
  }

  get clientesActivos(): number {
    return this.clientes.filter((c:any)=>c.estado==='Activo').length;
  }

  get clientesInactivos(): number {
    return this.clientes.filter((c:any)=>c.estado!=='Activo').length;
  }

  inicialesCliente(c:any): string {
    const nombres=String(c?.nombres||'').trim();
    const apellidos=String(c?.apellidos||'').trim();
    return ((nombres.charAt(0)||'C')+(apellidos.charAt(0)||'')).toUpperCase();
  }

  get clientesFiltrados(): any[] {
    const q=this.clientesBusqueda.trim().toLowerCase();
    return this.clientes.filter((c:any)=>{
      const coincideEstado=!this.clientesEstadoFiltro || c.estado===this.clientesEstadoFiltro;
      const texto=[c.dni,c.nombres,c.apellidos,c.correo,c.telefono].filter(Boolean).join(' ').toLowerCase();
      return coincideEstado && (!q || texto.includes(q));
    });
  }

  get clientesPaginasTotal(): number {
    return Math.max(1,Math.ceil(this.clientesFiltrados.length/this.clientesPorPagina));
  }

  get clientesPaginados(): any[] {
    const pagina=Math.min(Math.max(1,this.clientesPagina),this.clientesPaginasTotal);
    const inicio=(pagina-1)*this.clientesPorPagina;
    return this.clientesFiltrados.slice(inicio,inicio+this.clientesPorPagina);
  }

  diasActividadDashboard(): any[] {
    const dias = this.dashboard?.tendencias?.asistencias_7_dias;
    return Array.isArray(dias) && dias.length ? dias.slice(-7) : this.semanaDashboardDemo;
  }

  totalActividadSemanal(): number {
    return this.diasActividadDashboard().reduce((total:number, d:any) => total + Number(d?.total || 0), 0);
  }

  cambiarSeccion(id: string): void {
    const destino=this.normalizarSeccion(id);
    this.seccion = destino;
    this.error = '';
    this.cargarSeccion(destino);
    window.scrollTo({top:0, behavior:'smooth'});
  }

  abrirNuevoSocioDesdeDashboard(): void {
    this.cambiarSeccion('clientes');
    setTimeout(() => this.nuevoCliente(), 0);
  }

  actualizarSeccionActual(silencioso = false): void {
    if (this.actualizandoDatos && !silencioso) return;

    if (!silencioso) {
      this.actualizandoDatos = true;
      this.error = '';
    }

    this.cargarDashboard();
    if (this.seccion !== 'dashboard') {
      this.cargarSeccion(this.seccion);
    }

    if (!silencioso) {
      setTimeout(() => {
        this.actualizandoDatos = false;
        this.ultimaActualizacion = new Date().toLocaleTimeString('es-PE');
      }, 900);
    }
  }

  private cargarSeccion(id: string): void {
    switch (id) {
      case 'dashboard':
        this.cargarDashboard();
        break;
      case 'nutricion':
        this.api.gymRegistros('nutricion').subscribe({
          next:(r:any[])=>this.nutricionPreview=Array.isArray(r)?r:[],
          error:()=>this.nutricionPreview=[]
        });
        break;
      case 'equipos':
      case 'eventos':
      case 'galeria':
      case 'noticias':
      case 'salarios':
      case 'ingresos':
      case 'facturas':
        break;
      case 'sports-components':
      case 'trainer-profile':
      case 'members-list':
      case 'add-member':
      case 'edit-member':
      case 'invoices-list':
      case 'add-invoice':
      case 'edit-invoice':
        break;
      case 'tables':
      case 'data-tables':
      case 'graphs':
      case 'apex':
      case 'morris':
      case 'vector-maps':
      case 'accordions':
      case 'carousel':
      case 'modals':
      case 'popovers':
      case 'tabs-ui':
      case 'tooltips':
      case 'forms':
      case 'form-inputs':
      case 'checkbox-radio':
      case 'file-input':
      case 'validations':
      case 'date-time':
      case 'input-masks':
      case 'input-tags':
      case 'alerts':
      case 'avatars':
      case 'badges':
      case 'buttons':
      case 'button-groups':
      case 'cards-ui':
      case 'advanced-cards':
      case 'dropdowns':
      case 'list-items':
      case 'progress-bars':
      case 'placeholders':
      case 'spinners':
      case 'icons':
      case 'account-settings':
      case 'my-profile':
      case 'contact':
      case 'typography':
      case 'login-signup':
      case 'page-not-found':
      case 'maintenance':
      case 'menu-level':
      case 'external-link':
      case 'chip':
      case 'badge-link':
      case 'disabled-link':
        break;

      case 'socios-hub':
        this.cargarSeccion('clientes');
        break;
      case 'servicios':
        this.cargarSeccion('clases');
        break;
      case 'atencion':
        this.cargarSeccion('soporte');
        break;
      case 'gestion':
        this.cargarSeccion('caja');
        break;
      case 'clientes':
        this.cargarClientes();
        break;
      case 'membresias':
        this.cargarClientes();
        this.cargarMembresias();
        this.cargarPagos();
        break;
      case 'pagos':
        this.cargarClientes();
        this.cargarMembresias();
        this.cargarPagos();
        break;
      case 'entrenador':
        this.cargarEntrenadores();
        this.cargarUsuarios();
        break;
      case 'clases':
        this.cargarClases();
        this.cargarEntrenadores();
        break;
      case 'asistencias':
        this.cargarAsistencias();
        this.cargarClientes();
        break;
      case 'rutinas':
        this.cargarRutinas();
        this.cargarClientes();
        this.cargarEntrenadores();
        break;
      case 'reservas':
        this.cargarReservas();
        this.cargarClases();
        this.cargarClientes();
        break;
      case 'historial-ventas':
        this.cargarVentas();
        break;
      case 'planes':
        this.cargarMembresias();
        break;
      case 'gastos':
        this.cargarCaja();
        break;
      case 'inventario':
        this.cargarProductos();
        this.cargarCategorias();
        this.cargarKardex();
        break;
      case 'kardex':
        this.cargarProductos();
        this.cargarKardex();
        break;
      case 'reporte-asistencias':
        this.cargarReportes();
        break;
      case 'categorias':
        this.cargarCategorias();
        break;
      case 'productos':
        this.cargarProductos();
        this.cargarCategorias();
        break;
      case 'proveedores':
        this.cargarProveedores();
        break;
      case 'compras':
        this.cargarCompras();
        this.cargarProveedores();
        this.cargarProductos();
        break;
      case 'ventas':
        this.cargarVentas();
        this.cargarClientes();
        this.cargarProductos();
        this.cargarCaja();
        break;
      case 'caja':
        this.cargarCaja();
        break;
      case 'reportes':
        this.cargarReportes();
        break;
      case 'usuarios':
        this.cargarUsuarios();
        break;
      case 'opiniones':
        this.cargarOpiniones();
        break;
      case 'auditoria':
        this.cargarAuditoria();
        break;
      case 'comunicacion':
      case 'soporte':
        break;
      case 'configuracion':
        this.cargarConfiguracion();
        break;
    }
  }

  get gastosActuales(): any[] {
    const movimientos = this.caja?.caja?.movimientos;
    return Array.isArray(movimientos)
      ? movimientos.filter((m:any)=>String(m?.tipo||'').toLowerCase()==='egreso')
      : [];
  }

  get totalGastosCajaActual(): number {
    return this.gastosActuales.reduce((total:number,g:any)=>total+Number(g?.monto||0),0);
  }

  registrarGasto(): void {
    const descripcion=String(this.gastoForm.descripcion||'').trim();
    const monto=Number(this.gastoForm.monto||0);
    if(!descripcion || monto<=0){
      this.error='Completa la descripción y un monto válido.';
      return;
    }
    this.api.movimientoCaja('Egreso','Gasto',descripcion,monto).subscribe({
      next:(r:any)=>{
        this.gastoForm={descripcion:'',monto:0};
        this.ok(r?.mensaje || 'Gasto registrado correctamente');
        this.cargarCaja();
        this.cargarDashboard();
      },
      error:e=>this.mostrarError(e)
    });
  }

  recargarTodo(): void {
    this.cargarDashboard();
    if (this.seccion !== 'dashboard') this.cargarSeccion(this.seccion);
  }

  cargarDashboard(){
    if(!this.dashboard)this.dashboardCargando=true;
    this.api.dashboard().subscribe({
      next:r=>{
        this.dashboard=r;
        this.dashboardCargando=false;
        this.dashboardError='';
        this.ultimaActualizacionTs=Date.now();
        this.ultimaActualizacion=new Date(this.ultimaActualizacionTs).toLocaleTimeString('es-PE');
      },
      error:e=>{
        this.dashboardCargando=false;
        this.dashboardError=e?.error?.mensaje ?? e?.error?.message ?? 'No se pudo conectar con el resumen administrativo.';
        if(!this.dashboard)this.mostrarError(e);
      }
    });
  }
  cargarClientes(){ this.api.clientes().subscribe({next:r=>this.clientes=r,error:e=>this.mostrarError(e)}); }
  cargarMembresias(){
    this.api.membresiasDisponibles().subscribe({next:r=>{this.planesMembresia=r;this.membresiasDisponibles=r.filter(x=>x.estado==='Activo');},error:e=>this.mostrarError(e)});
    this.api.clienteMembresias().subscribe({next:r=>this.membresiasCliente=r,error:e=>this.mostrarError(e)});
  }
  cargarPagos(){
    this.api.pagos().subscribe({next:r=>this.pagos=r,error:e=>this.mostrarError(e)});
  }

  confirmarPagoEfectivo(p:any){
    if(!p?.id_pago || p?.estado_pago!=='Pendiente' || p?.metodo_pago!=='Efectivo')return;
    if(!confirm('¿Confirmar que recepción recibió el pago en efectivo?'))return;
    this.api.confirmarPagoPendiente(Number(p.id_pago)).subscribe({
      next:r=>{this.ok(r?.mensaje||'Pago confirmado');this.cargarPagos();this.cargarMembresias();this.cargarDashboard();},
      error:e=>this.mostrarError(e)
    });
  }

  rechazarPagoEfectivo(p:any){
    if(!p?.id_pago || p?.estado_pago!=='Pendiente' || p?.metodo_pago!=='Efectivo')return;
    const motivo=String(prompt('Motivo del rechazo del pago en efectivo:')||'').trim();
    if(!motivo)return;
    this.api.rechazarPagoPendiente(Number(p.id_pago),motivo).subscribe({
      next:r=>{this.ok(r?.mensaje||'Pago rechazado');this.cargarPagos();this.cargarMembresias();this.cargarDashboard();},
      error:e=>this.mostrarError(e)
    });
  }
  cargarEntrenadores(){
    this.api.entrenadores().subscribe({
      next:r=>{
        this.entrenadores=r||[];
        const principal=this.entrenadores[0];
        if(principal){
          if(!this.claseForm.id_entrenador) this.claseForm.id_entrenador=principal.id_entrenador;
          if(!this.rutinaForm.id_entrenador) this.rutinaForm.id_entrenador=principal.id_entrenador;
        }
      },
      error:e=>this.mostrarError(e)
    });
  }
  cargarClases(){ this.api.clases().subscribe({next:r=>this.clases=r,error:e=>this.mostrarError(e)}); }
  cargarAsistencias(){ this.api.asistencias().subscribe({next:r=>this.asistencias=r,error:e=>this.mostrarError(e)}); }
  cargarCategorias(){ this.api.categorias().subscribe({next:r=>this.categorias=r,error:e=>this.mostrarError(e)}); }
  cargarRutinas(){ this.api.rutinas().subscribe({next:r=>this.rutinas=r,error:e=>this.mostrarError(e)}); }
  cargarReservas(){ this.api.reservas().subscribe({next:r=>this.reservas=r,error:e=>this.mostrarError(e)}); }
  cargarUsuarios(){ this.api.usuarios().subscribe({next:r=>this.usuarios=r,error:e=>this.mostrarError(e)}); }
  cargarOpiniones(){ this.api.opinionesClientes().subscribe({next:r=>this.opiniones=r||[],error:e=>this.mostrarError(e)}); }
  cargarAuditoria(){
    const f:any={};
    if(this.auditoriaFiltros.ruta)f.ruta=this.auditoriaFiltros.ruta;
    if(this.auditoriaFiltros.desde)f.desde=this.auditoriaFiltros.desde;
    if(this.auditoriaFiltros.hasta)f.hasta=this.auditoriaFiltros.hasta;
    this.api.auditorias(f).subscribe({next:r=>{this.auditorias=r;this.auditoriaPagina=1;},error:e=>this.mostrarError(e)});
  }
  cargarProductos(){ this.api.productos().subscribe({next:r=>this.productos=r,error:e=>this.mostrarError(e)}); }
  cargarProveedores(){ this.api.proveedores().subscribe({next:r=>this.proveedores=r,error:e=>this.mostrarError(e)}); }
  cargarCompras(){ this.api.compras().subscribe({next:r=>this.compras=r,error:e=>this.mostrarError(e)}); }
  cargarVentas(){ this.api.ventas().subscribe({next:r=>this.ventas=r,error:e=>this.mostrarError(e)}); }
  cargarKardex(){ this.api.kardex().subscribe({next:r=>this.kardex=r,error:e=>this.mostrarError(e)}); }
  cargarCaja(){
    this.api.cajaActual().subscribe({next:r=>this.caja=r,error:e=>this.mostrarError(e)});
    this.api.historialCaja().subscribe({next:r=>this.historialCaja=r,error:e=>this.mostrarError(e)});
  }
  cargarReportes(){
    this.api.reporteIngresos().subscribe({next:r=>this.reporteIngresos=r,error:e=>this.mostrarError(e)});
    this.api.reporteAsistencias().subscribe({next:r=>this.reporteAsistencias=r,error:e=>this.mostrarError(e)});
    this.api.reporteVencimientos().subscribe({next:r=>this.reporteVencimientos=Array.isArray(r)?r:[],error:e=>this.mostrarError(e)});
  }

  exportarReporteCsv(){
    const filas=[
      ['Indicador','Valor'],
      ['Clientes registrados',this.dashboard?.clientes?.total ?? this.clientes.length],
      ['Clientes activos',this.dashboard?.clientes?.activos ?? 0],
      ['Membresías activas',this.dashboard?.membresias?.activas ?? 0],
      ['Pagos de membresía registrados',this.pagos.length],
      ['Ingresos membresías',this.reporteIngresos?.membresias ?? 0],
      ['Ingresos ventas',this.reporteIngresos?.ventas_productos ?? 0],
      ['Ingresos totales',this.reporteIngresos?.total_ingresos ?? this.dashboard?.ingresos?.total_mes ?? 0],
      ['Asistencias',this.reporteAsistencias?.total ?? 0],
      ['Membresías por vencer',this.reporteVencimientos.length || this.dashboard?.membresias?.por_vencer_7_dias || 0],
      ['Soporte pendiente',this.dashboard?.alertas?.soporte_pendiente ?? 0]
    ];
    const csv=filas.map(f=>f.map((v:any)=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\n');
    const url=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');
    a.href=url;
    a.download='reporte-mallqui-gym.csv';
    a.click();
    URL.revokeObjectURL(url);
    this.ok('Reporte CSV generado');
  }

  nuevoCliente(){
    this.clienteEditandoId=0;
    this.clienteForm={dni:'',nombres:'',apellidos:'',telefono:'',correo:'',direccion:'',estado:'Activo',crear_acceso:false,nombre_usuario:'',contrasena:''};
    this.error='';
    this.clienteFormularioAbierto=true;
  }

  guardarCliente(){
    if(this.guardandoCliente)return;

    const datos={...this.clienteForm};
    if(this.clienteEditandoId){
      delete datos.crear_acceso;
      delete datos.nombre_usuario;
      delete datos.contrasena;
    }

    this.guardandoCliente=true;
    this.error='';

    const eraEdicion=Boolean(this.clienteEditandoId);
    const req=eraEdicion
      ? this.api.actualizarCliente(this.clienteEditandoId,datos)
      : this.api.crearCliente(datos);

    req.subscribe({
      next:(r:any)=>{
        this.guardandoCliente=false;
        this.ok(r?.mensaje || (eraEdicion?'Cliente actualizado correctamente':'Cliente registrado correctamente'));
        this.cancelarEdicionCliente();
        this.cargarClientes();
        this.cargarDashboard();
      },
      error:e=>{
        this.guardandoCliente=false;
        this.mostrarError(e);
      }
    });
  }

  abrirFichaCliente(id:number){this.clienteFichaId=id;}

  editarCliente(c:any){
    this.clienteEditandoId=c.id_cliente;
    this.clienteForm={
      dni:c.dni||'',nombres:c.nombres||'',apellidos:c.apellidos||'',telefono:c.telefono||'',
      correo:c.correo||'',direccion:c.direccion||'',estado:c.estado||'Activo',
      crear_acceso:false,nombre_usuario:'',contrasena:''
    };
    this.error='';
    this.clienteFormularioAbierto=true;
  }

  cerrarFormularioCliente(){
    this.cancelarEdicionCliente();
  }

  cancelarEdicionCliente(){
    this.clienteEditandoId=0;
    this.clienteFormularioAbierto=false;
    this.guardandoCliente=false;
    this.clienteForm={dni:'',nombres:'',apellidos:'',telefono:'',correo:'',direccion:'',estado:'Activo',crear_acceso:false,nombre_usuario:'',contrasena:''};
  }
  desactivarCliente(id:number){ if(!confirm('¿Desactivar este cliente?')) return; this.api.desactivarCliente(id).subscribe({next:()=>{this.ok('Cliente desactivado');this.cancelarEdicionCliente();this.cargarClientes();this.cargarDashboard();},error:e=>this.mostrarError(e)}); }

  contratarMembresia(){
    if(!this.membresiaForm.id_cliente || !this.membresiaForm.id_membresia){this.error='Selecciona cliente y membresía.';return;}
    const datos={...this.membresiaForm};
    if(datos.metodo_pago==='Efectivo') datos.numero_operacion=null;
    this.api.contratarMembresia(datos).subscribe({next:()=>{this.ok('Membresía contratada y pago registrado');this.cargarMembresias();this.cargarPagos();this.cargarDashboard();this.cargarCaja();},error:e=>this.mostrarError(e)});
  }

  guardarPlan(){
    const datos:any={...this.planForm};
    datos.beneficios=String(datos.beneficios_texto||'')
      .split('\n')
      .map((x:string)=>x.trim())
      .filter((x:string)=>Boolean(x));
    delete datos.beneficios_texto;

    const req=this.planEditandoId
      ? this.api.actualizarMembresia(this.planEditandoId,datos)
      : this.api.crearMembresia(datos);

    req.subscribe({
      next:()=>{
        this.ok(this.planEditandoId?'Tarifa actualizada':'Tarifa creada');
        this.cancelarEdicionPlan();
        this.cargarMembresias();
      },
      error:e=>this.mostrarError(e)
    });
  }
  editarPlan(p:any){
    this.planEditandoId=p.id_membresia;
    this.planForm={
      nombre:p.nombre,
      duracion_meses:p.duracion_meses,
      precio:p.precio,
      descripcion:p.descripcion||'',
      beneficios_texto:Array.isArray(p.beneficios)?p.beneficios.join('\n'):'',
      permite_reservas:p.permite_reservas!==false,
      estado:p.estado
    };
  }
  cancelarEdicionPlan(){
    this.planEditandoId=0;
    this.planForm={nombre:'',duracion_meses:1,precio:0,descripcion:'',beneficios_texto:'',permite_reservas:true,estado:'Activo'};
  }
  desactivarPlan(id:number){if(!confirm('¿Desactivar esta tarifa?'))return;this.api.eliminarMembresia(id).subscribe({next:r=>{this.ok(r.mensaje||'Tarifa desactivada');this.cargarMembresias();},error:e=>this.mostrarError(e)});}

  guardarEntrenador(){
    const datos={...this.entrenadorForm};
    if(this.entrenadorEditandoId){
      delete datos.crear_acceso;
      delete datos.nombre_usuario;
      delete datos.contrasena;
    }

    const req=this.entrenadorEditandoId
      ? this.api.actualizarEntrenador(this.entrenadorEditandoId,datos)
      : this.api.crearEntrenador(datos);

    req.subscribe({
      next:r=>{
        this.ok(r?.mensaje || (this.entrenadorEditandoId ? 'Entrenador actualizado' : 'Entrenador principal registrado'));
        this.cancelarEdicionEntrenador();
        this.cargarEntrenadores();
        this.cargarUsuarios();
      },
      error:e=>this.mostrarError(e)
    });
  }

  editarEntrenador(e:any){
    this.entrenadorEditandoId=Number(e.id_entrenador||0);
    this.entrenadorForm={
      dni:e.dni||'',
      nombres:e.nombres||'',
      apellidos:e.apellidos||'',
      telefono:e.telefono||'',
      correo:e.correo||'',
      especialidad:e.especialidad||'',
      fecha_contratacion:String(e.fecha_contratacion||new Date().toISOString()).slice(0,10),
      salario:Number(e.salario||0),
      estado:e.estado||'Activo',
      crear_acceso:false,
      nombre_usuario:'',
      contrasena:''
    };
    window.scrollTo({top:0,behavior:'smooth'});
  }

  cancelarEdicionEntrenador(){
    this.entrenadorEditandoId=0;
    this.entrenadorForm={dni:'',nombres:'',apellidos:'',telefono:'',correo:'',especialidad:'',fecha_contratacion:new Date().toISOString().slice(0,10),salario:0,estado:'Activo',crear_acceso:true,nombre_usuario:'',contrasena:''};
  }

  guardarClase(){
    const entrenadorPrincipal=this.entrenadores[0];
    if(!entrenadorPrincipal){
      this.error='Primero registra el entrenador principal antes de programar una clase.';
      return;
    }
    this.claseForm.id_entrenador=Number(entrenadorPrincipal.id_entrenador);
    const datos={...this.claseForm,hora_inicio:String(this.claseForm.hora_inicio||'').slice(0,5),hora_fin:String(this.claseForm.hora_fin||'').slice(0,5)};
    const req=this.claseEditandoId
      ? this.api.actualizarClase(this.claseEditandoId,datos)
      : this.api.crearClase(datos);
    req.subscribe({
      next:()=>{
        this.ok(this.claseEditandoId?'Clase actualizada correctamente':'Clase registrada');
        this.cancelarEdicionClase();
        this.cargarClases();
        this.cargarDashboard();
      },
      error:e=>this.mostrarError(e)
    });
  }
  editarClase(c:any){
    this.claseEditandoId=c.id_clase;
    this.claseForm={
      id_entrenador:c.id_entrenador??null,
      nombre:c.nombre||'',
      descripcion:c.descripcion||'',
      dia_semana:c.dia_semana||'Lunes',
      hora_inicio:String(c.hora_inicio||'08:00').slice(0,5),
      hora_fin:String(c.hora_fin||'09:00').slice(0,5),
      cupo_maximo:Number(c.cupo_maximo||15),
      estado:c.estado||'Activo'
    };
    window.scrollTo({top:0,behavior:'smooth'});
  }
  cancelarEdicionClase(){
    this.claseEditandoId=0;
    this.claseForm={id_entrenador:this.entrenadores[0]?.id_entrenador??null,nombre:'',descripcion:'',dia_semana:'Lunes',hora_inicio:'08:00',hora_fin:'09:00',cupo_maximo:15,estado:'Activo'};
  }
  desactivarClase(id:number){ if(!confirm('¿Desactivar esta clase?')) return; this.api.desactivarClase(id).subscribe({next:()=>{this.ok('Clase desactivada');this.cancelarEdicionClase();this.cargarClases();},error:e=>this.mostrarError(e)}); }

  registrarAccesoPorCodigo(){
    const codigo=String(this.asistenciaCodigo||'').trim();
    if(!codigo){this.error='Escanea o escribe el código del socio.';return;}
    if(this.procesandoAccesoCodigo)return;

    this.procesandoAccesoCodigo=true;
    this.error='';
    this.api.registrarAccesoCodigo(codigo).subscribe({
      next:r=>{
        this.procesandoAccesoCodigo=false;
        this.ultimoAccesoCodigo=r;
        this.asistenciaCodigo='';
        this.ok(r?.mensaje||'Acceso registrado');
        this.cargarAsistencias();
        this.cargarDashboard();
      },
      error:e=>{
        this.procesandoAccesoCodigo=false;
        this.ultimoAccesoCodigo=null;
        this.mostrarError(e);
      }
    });
  }
  registrarEntrada(){ if(!this.asistenciaCliente){this.error='Selecciona un cliente.';return;} this.api.registrarEntrada(this.asistenciaCliente).subscribe({next:r=>{this.ok(r.mensaje||'Entrada registrada');this.cargarAsistencias();this.cargarDashboard();},error:e=>this.mostrarError(e)}); }
  registrarSalida(){ if(!this.asistenciaCliente){this.error='Selecciona un cliente.';return;} this.api.registrarSalida(this.asistenciaCliente).subscribe({next:r=>{this.ok(r.mensaje||'Salida registrada');this.cargarAsistencias();this.cargarDashboard();},error:e=>this.mostrarError(e)}); }

  guardarProveedor(){
    const datos={...this.proveedorForm};
    const req=this.proveedorEditandoId
      ? this.api.actualizarProveedor(this.proveedorEditandoId,datos)
      : this.api.crearProveedor(datos);
    req.subscribe({
      next:()=>{
        this.ok(this.proveedorEditandoId?'Proveedor actualizado correctamente':'Proveedor registrado');
        this.cancelarEdicionProveedor();
        this.cargarProveedores();
      },
      error:e=>this.mostrarError(e)
    });
  }
  editarProveedor(p:any){
    this.proveedorEditandoId=p.id_proveedor;
    this.proveedorForm={
      ruc:p.ruc||'',razon_social:p.razon_social||'',contacto:p.contacto||'',
      telefono:p.telefono||'',correo:p.correo||'',direccion:p.direccion||'',estado:p.estado||'Activo'
    };
    window.scrollTo({top:0,behavior:'smooth'});
  }
  cancelarEdicionProveedor(){
    this.proveedorEditandoId=0;
    this.proveedorForm={ruc:'',razon_social:'',contacto:'',telefono:'',correo:'',direccion:'',estado:'Activo'};
  }
  desactivarProveedor(id:number){
    if(!confirm('¿Desactivar este proveedor?'))return;
    this.api.desactivarProveedor(id).subscribe({
      next:r=>{this.ok(r.mensaje||'Proveedor desactivado');this.cancelarEdicionProveedor();this.cargarProveedores();},
      error:e=>this.mostrarError(e)
    });
  }

  agregarItemCompra(){ if(!this.compraForm.id_producto || Number(this.compraForm.cantidad)<1 || Number(this.compraForm.precio_compra)<=0){this.error='Selecciona producto, cantidad y precio de compra.';return;} if(this.compraItems.some(i=>i.id_producto===this.compraForm.id_producto)){this.error='Ese producto ya está en la compra.';return;} this.compraItems.push({id_producto:this.compraForm.id_producto,cantidad:Number(this.compraForm.cantidad),precio_compra:Number(this.compraForm.precio_compra)});this.compraForm.id_producto=0;this.compraForm.cantidad=1;this.compraForm.precio_compra=0; }
  quitarItemCompra(i:number){this.compraItems.splice(i,1);}
  registrarCompra(){
    if(!this.compraForm.id_proveedor || !this.compraItems.length){this.error='Selecciona proveedor y agrega al menos un producto.';return;}
    const datos={id_proveedor:this.compraForm.id_proveedor,tipo_comprobante:this.compraForm.tipo_comprobante,numero_comprobante:this.compraForm.numero_comprobante,items:this.compraItems};
    this.api.registrarCompra(datos).subscribe({next:r=>{this.ok(r.mensaje||'Compra registrada');this.compraForm={id_proveedor:0,id_producto:0,cantidad:1,precio_compra:0,tipo_comprobante:'Factura',numero_comprobante:''};this.compraItems=[];this.cargarCompras();this.cargarProductos();this.cargarKardex();this.cargarDashboard();},error:e=>this.mostrarError(e)});
  }
  anularCompra(id:number){ if(!confirm('¿Anular esta compra?')) return; this.api.anularCompra(id).subscribe({next:r=>{this.ok(r.mensaje||'Compra anulada');this.cargarCompras();this.cargarProductos();this.cargarKardex();},error:e=>this.mostrarError(e)}); }

  agregarItemVenta(){ if(!this.ventaForm.id_producto || Number(this.ventaForm.cantidad)<1){this.error='Selecciona producto y cantidad.';return;} const p=this.productos.find(x=>x.id_producto===this.ventaForm.id_producto); if(!p || Number(p.stock)<Number(this.ventaForm.cantidad)){this.error='Stock insuficiente para agregar ese producto.';return;} if(this.ventaItems.some(i=>i.id_producto===this.ventaForm.id_producto)){this.error='Ese producto ya está en el carrito.';return;} this.ventaItems.push({id_producto:this.ventaForm.id_producto,cantidad:Number(this.ventaForm.cantidad)});this.ventaForm.id_producto=0;this.ventaForm.cantidad=1; }
  quitarItemVenta(i:number){this.ventaItems.splice(i,1);}
  get totalVentaPreview():number{return this.ventaItems.reduce((s,i)=>s+(Number(i.cantidad)*this.precioProducto(i.id_producto)),0);}
  get subtotalVentaPreview():number{const f=1+(Number(this.ventaForm.igv_porcentaje||0)/100);return f>0?this.totalVentaPreview/f:this.totalVentaPreview;}
  get igvVentaPreview():number{return this.totalVentaPreview-this.subtotalVentaPreview;}
  registrarVenta(){
    if(!this.ventaItems.length){this.error='Agrega al menos un producto al carrito.';return;}
    if(this.ventaForm.metodo_pago!=='Efectivo' && !String(this.ventaForm.numero_operacion||'').trim()){
      this.error='Ingresa el número de operación para el método de pago seleccionado.';
      return;
    }
    const datos={
      id_cliente:this.ventaForm.id_cliente||null,
      tipo_comprobante:this.ventaForm.tipo_comprobante,
      metodo_pago:this.ventaForm.metodo_pago,
      numero_operacion:this.ventaForm.metodo_pago==='Efectivo'?null:String(this.ventaForm.numero_operacion||'').trim(),
      igv_porcentaje:this.ventaForm.igv_porcentaje,
      items:this.ventaItems
    };
    this.api.registrarVenta(datos).subscribe({
      next:r=>{
        const numero=r?.numero_comprobante ? ` · ${this.ventaForm.tipo_comprobante} ${r.numero_comprobante}` : '';
        this.ok((r.mensaje||'Venta registrada')+numero);
        this.ventaForm={id_cliente:0,id_producto:0,cantidad:1,tipo_comprobante:'Boleta',numero_comprobante:'',metodo_pago:'Efectivo',numero_operacion:'',igv_porcentaje:18};
        this.ventaItems=[];
        this.cargarVentas();this.cargarProductos();this.cargarKardex();this.cargarCaja();this.cargarDashboard();
      },
      error:e=>this.mostrarError(e)
    });
  }
  anularVenta(id:number){const motivo=prompt('Motivo de la anulación (mínimo 5 caracteres):');if(!motivo||motivo.trim().length<5)return;this.api.anularVenta(id,motivo.trim()).subscribe({next:r=>{this.ok(r.mensaje||'Venta anulada');this.cargarVentas();this.cargarProductos();this.cargarKardex();this.cargarCaja();this.cargarDashboard();},error:e=>this.mostrarError(e)});}
  nombreProducto(id:number):string{return this.productos.find(p=>p.id_producto===id)?.nombre_producto||'Producto';}
  precioProducto(id:number):number{return Number(this.productos.find(p=>p.id_producto===id)?.precio_venta||0);}

  guardarCategoria(){
    const datos={...this.categoriaForm};
    const req=this.categoriaEditandoId
      ? this.api.actualizarCategoria(this.categoriaEditandoId,datos)
      : this.api.crearCategoria(datos);
    req.subscribe({
      next:()=>{
        this.ok(this.categoriaEditandoId?'Categoría actualizada correctamente':'Categoría registrada');
        this.cancelarEdicionCategoria();
        this.cargarCategorias();
      },
      error:e=>this.mostrarError(e)
    });
  }
  editarCategoria(cat:any){
    this.categoriaEditandoId=cat.id_categoria;
    this.categoriaForm={nombre_categoria:cat.nombre_categoria||'',descripcion:cat.descripcion||'',estado:cat.estado||'Activo'};
    window.scrollTo({top:0,behavior:'smooth'});
  }
  cancelarEdicionCategoria(){
    this.categoriaEditandoId=0;
    this.categoriaForm={nombre_categoria:'',descripcion:'',estado:'Activo'};
  }
  desactivarCategoria(id:number){ if(!confirm('¿Desactivar esta categoría?')) return; this.api.eliminarCategoria(id).subscribe({next:r=>{this.ok(r.mensaje||'Categoría desactivada');this.cancelarEdicionCategoria();this.cargarCategorias();},error:e=>this.mostrarError(e)}); }

  guardarRutina(){
    if(!this.rutinaForm.id_cliente || !this.rutinaForm.id_entrenador){
      this.error='Selecciona cliente y entrenador.';
      return;
    }

    const detalles=(this.rutinaDetallesForm||[])
      .map((d:any)=>({
        ejercicio:String(d.ejercicio||'').trim(),
        series:Number(d.series||0),
        repeticiones:Number(d.repeticiones||0),
        peso_recomendado:d.peso_recomendado===''||d.peso_recomendado===null?null:Number(d.peso_recomendado),
        descanso_segundos:d.descanso_segundos===''||d.descanso_segundos===null?null:Number(d.descanso_segundos),
        observaciones:String(d.observaciones||'').trim()||null
      }))
      .filter((d:any)=>d.ejercicio);

    if(!detalles.length){
      this.error='Agrega al menos un ejercicio a la rutina.';
      return;
    }
    if(detalles.some((d:any)=>d.series<1 || d.repeticiones<1)){
      this.error='Cada ejercicio debe tener series y repeticiones válidas.';
      return;
    }

    const datos={...this.rutinaForm,detalles};
    if(!datos.fecha_fin) datos.fecha_fin=null;

    const eraEdicion=Boolean(this.rutinaEditandoId);
    const idSolicitud=!eraEdicion ? Number(this.solicitudRutinaIdPendiente||0) : 0;
    const req=eraEdicion
      ? this.api.actualizarRutina(this.rutinaEditandoId,datos)
      : this.api.crearRutina(datos);

    req.subscribe({
      next:()=>{
        this.cancelarEdicionRutina();
        this.cargarRutinas();

        if(idSolicitud){
          this.api.responderSoporte(
            idSolicitud,
            'Tu rutina completa ya fue asignada por Mallqui Gym. Revísala en Rutinas: allí encontrarás ejercicios, series, repeticiones, carga y descansos.',
            'Cerrado'
          ).subscribe({
            next:()=>{
              this.solicitudRutinaIdPendiente=0;
              this.solicitudRutinaContexto=null;
              this.ok('Rutina completa asignada y cliente notificado');
              this.cargarDashboard();
            },
            error:()=>{
              this.ok('Rutina guardada. La solicitud sigue pendiente de cerrar en Soporte.');
              this.cargarDashboard();
            }
          });
          return;
        }

        this.ok(eraEdicion?'Rutina y ejercicios actualizados':'Rutina completa asignada');
        this.cargarDashboard();
      },
      error:e=>this.mostrarError(e)
    });
  }

  agregarEjercicioRutina(){
    this.rutinaDetallesForm.push({ejercicio:'',series:3,repeticiones:12,peso_recomendado:null,descanso_segundos:60,observaciones:''});
  }

  quitarEjercicioRutina(index:number){
    if(this.rutinaDetallesForm.length<=1)return;
    this.rutinaDetallesForm.splice(index,1);
  }

  editarRutina(r:any){
    this.rutinaEditandoId=r.id_rutina;
    this.rutinaForm={
      id_cliente:Number(r.id_cliente||r.cliente?.id_cliente||0),
      id_entrenador:Number(r.id_entrenador||r.entrenador?.id_entrenador||0),
      nombre_rutina:r.nombre_rutina||'',
      objetivo:r.objetivo||'',
      descripcion:r.descripcion||'',
      fecha_inicio:String(r.fecha_inicio||'').slice(0,10),
      fecha_fin:r.fecha_fin?String(r.fecha_fin).slice(0,10):'',
      estado:r.estado||'Activo'
    };
    const detalles=Array.isArray(r.detalles)?r.detalles:[];
    this.rutinaDetallesForm=detalles.length
      ? detalles.map((d:any)=>({
          ejercicio:d.ejercicio||'',
          series:Number(d.series||3),
          repeticiones:Number(d.repeticiones||12),
          peso_recomendado:d.peso_recomendado===null?null:Number(d.peso_recomendado),
          descanso_segundos:d.descanso_segundos===null?60:Number(d.descanso_segundos||60),
          observaciones:d.observaciones||''
        }))
      : [{ejercicio:'',series:3,repeticiones:12,peso_recomendado:null,descanso_segundos:60,observaciones:''}];
    this.solicitudRutinaContexto=null;
    this.solicitudRutinaIdPendiente=0;
    window.scrollTo({top:0,behavior:'smooth'});
  }

  cancelarEdicionRutina(){
    this.rutinaEditandoId=0;
    this.rutinaForm={id_cliente:0,id_entrenador:Number(this.entrenadores[0]?.id_entrenador||0),nombre_rutina:'',objetivo:'',descripcion:'',fecha_inicio:new Date().toISOString().slice(0,10),fecha_fin:'',estado:'Activo'};
    this.rutinaDetallesForm=[{ejercicio:'',series:3,repeticiones:12,peso_recomendado:null,descanso_segundos:60,observaciones:''}];
  }
  desactivarRutina(id:number){ if(!confirm('¿Desactivar esta rutina?')) return; this.api.eliminarRutina(id).subscribe({next:r=>{this.ok(r.mensaje||'Rutina desactivada');this.cancelarEdicionRutina();this.cargarRutinas();},error:e=>this.mostrarError(e)}); }

  cambiarEstadoReserva(id:number,estado:string){ this.api.cambiarEstadoReserva(id,estado).subscribe({next:r=>{this.ok(r.mensaje||'Reserva actualizada');this.cargarReservas();},error:e=>this.mostrarError(e)}); }

  guardarUsuario(){
    const datos={...this.usuarioForm};
    if(this.usuarioEditandoId && !datos.contrasena) delete datos.contrasena;
    const req=this.usuarioEditandoId
      ? this.api.actualizarUsuario(this.usuarioEditandoId,datos)
      : this.api.crearUsuario(datos);
    req.subscribe({
      next:()=>{
        this.ok(this.usuarioEditandoId?'Usuario actualizado correctamente':'Usuario interno creado');
        this.cancelarEdicionUsuario();
        this.cargarUsuarios();
      },
      error:e=>this.mostrarError(e)
    });
  }
  editarUsuario(u:any){
    this.usuarioEditandoId=u.id_usuario;
    this.usuarioForm={
      nombre_usuario:u.nombre_usuario||'',
      contrasena:'',
      nombres:u.nombres||'',
      apellidos:u.apellidos||'',
      dni:u.dni||'',
      telefono:u.telefono||'',
      correo:u.correo||'',
      rol:u.rol||'Entrenador',
      estado:u.estado||'Activo'
    };
    window.scrollTo({top:0,behavior:'smooth'});
  }
  cancelarEdicionUsuario(){
    this.usuarioEditandoId=0;
    this.usuarioForm={nombre_usuario:'',contrasena:'',nombres:'',apellidos:'',dni:'',telefono:'',correo:'',rol:'Entrenador',estado:'Activo'};
  }
  desactivarUsuario(id:number){ if(!confirm('¿Desactivar este usuario?')) return; this.api.eliminarUsuario(id).subscribe({next:r=>{this.ok(r.mensaje||'Usuario desactivado');this.cancelarEdicionUsuario();this.cargarUsuarios();},error:e=>this.mostrarError(e)}); }

  get auditoriasFiltradas(): any[] {
    const texto=this.auditoriaBusqueda.trim().toLowerCase();
    const metodo=this.auditoriaMetodo.trim().toUpperCase();
    return this.auditorias.filter((a:any)=>{
      const status=Number(a.status)||0;
      const m=String(a.metodo||'').toUpperCase();
      if(metodo && m!==metodo) return false;
      if(this.auditoriaEstado==='ok' && status>=400) return false;
      if(this.auditoriaEstado==='error' && status<400) return false;
      if(this.auditoriaSoloImportantes && !['POST','PUT','PATCH','DELETE'].includes(m)) return false;
      if(texto){
        const bolsa=[a.usuario,a.id_usuario,a.rol,a.ruta,a.ip,a.metodo,a.status].map(v=>String(v??'').toLowerCase()).join(' ');
        if(!bolsa.includes(texto)) return false;
      }
      return true;
    });
  }

  get auditoriasPaginadas(): any[] {
    const inicio=(this.auditoriaPagina-1)*this.auditoriaPorPagina;
    return this.auditoriasFiltradas.slice(inicio,inicio+this.auditoriaPorPagina);
  }

  get auditoriaTotalPaginas(): number { return Math.max(1,Math.ceil(this.auditoriasFiltradas.length/this.auditoriaPorPagina)); }
  get auditoriaPaginasVisibles(): number[] {
    const total=this.auditoriaTotalPaginas;
    const desde=Math.max(1,Math.min(this.auditoriaPagina-2,total-4));
    const hasta=Math.min(total,desde+4);
    const paginas:number[]=[];
    for(let i=desde;i<=hasta;i++) paginas.push(i);
    return paginas;
  }
  get auditoriaEventosHoy(): number {
    const hoy=new Date(); const clave=hoy.toISOString().slice(0,10);
    return this.auditorias.filter((a:any)=>{const d=new Date(a.fecha);return !isNaN(d.getTime())&&d.toISOString().slice(0,10)===clave;}).length;
  }
  get auditoriaUsuariosUnicos(): number {
    return new Set(this.auditorias.map((a:any)=>String(a.usuario||a.id_usuario||'')).filter(Boolean)).size;
  }
  get auditoriaAccionesCriticas(): number {
    return this.auditorias.filter((a:any)=>['POST','PUT','PATCH','DELETE'].includes(String(a.metodo||'').toUpperCase())).length;
  }
  get auditoriaErrores(): number { return this.auditorias.filter((a:any)=>Number(a.status)>=400).length; }

  aplicarFiltrosAuditoria(){ this.auditoriaPagina=1; this.cargarAuditoria(); }
  limpiarFiltrosAuditoria(){
    this.auditoriaFiltros={ruta:'',desde:'',hasta:''};
    this.auditoriaBusqueda=''; this.auditoriaMetodo=''; this.auditoriaEstado=''; this.auditoriaSoloImportantes=false; this.auditoriaPagina=1;
    this.cargarAuditoria();
  }
  auditoriaPaginaAnterior(){ if(this.auditoriaPagina>1)this.auditoriaPagina--; }
  auditoriaPaginaSiguiente(){ if(this.auditoriaPagina<this.auditoriaTotalPaginas)this.auditoriaPagina++; }
  accionAuditoria(metodo:any): string {
    const m=String(metodo||'').toUpperCase();
    if(m==='POST')return 'Registro'; if(m==='PUT'||m==='PATCH')return 'Cambio'; if(m==='DELETE')return 'Eliminación'; return 'Consulta';
  }
  claseMetodoAuditoria(metodo:any): string { return 'method-'+String(metodo||'').toLowerCase(); }
  esErrorAuditoria(status:any): boolean { return Number(status)>=400; }
  estadoAuditoria(status:any): string {
    const s=Number(status)||0;
    if(s>=500)return 'Error servidor'; if(s===401)return 'No autorizado'; if(s===403)return 'Prohibido'; if(s===404)return 'No encontrado'; if(s>=400)return 'Error'; if(s>=200&&s<300)return 'Correcto'; return s?String(s):'Sin estado';
  }
  fechaCortaAuditoria(v:any): string {
    if(!v)return '-'; const d=new Date(v); return isNaN(d.getTime())?String(v):d.toLocaleDateString('es-PE',{day:'2-digit',month:'2-digit',year:'numeric'});
  }
  horaAuditoria(v:any): string {
    if(!v)return ''; const d=new Date(v); return isNaN(d.getTime())?'':d.toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'});
  }
  inicialAuditoria(a:any): string {
    const valor=String(a?.usuario||a?.rol||'S').trim(); return valor.charAt(0).toUpperCase()||'S';
  }

  exportarAuditoria(){
    const datos=this.auditoriasFiltradas;
    if(!datos.length){this.error='No hay registros de auditoría para exportar.';return;}
    const filas=[['Fecha','Usuario','Rol','Accion','Metodo','Ruta','IP','Estado'],...datos.map(a=>[a.fecha,a.usuario??a.id_usuario??'',a.rol??'',this.accionAuditoria(a.metodo),a.metodo,a.ruta,a.ip??'',a.status??''])];
    const csv=filas.map(f=>f.map((v:any)=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\n');
    const url=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a'); a.href=url; a.download='auditoria-mallqui-gym.csv'; a.click(); URL.revokeObjectURL(url);
  }

  ajustarStock(){ this.api.ajustarStock(this.ajusteForm).subscribe({next:r=>{this.ok(r.mensaje||'Stock ajustado');this.ajusteForm={id_producto:0,tipo:'Entrada',cantidad:1,motivo:''};this.cargarProductos();this.cargarKardex();this.cargarDashboard();},error:e=>this.mostrarError(e)}); }

  abrirCaja(){ this.api.abrirCaja(Number(this.cajaAbrirForm.monto_inicial),this.cajaAbrirForm.observacion).subscribe({next:r=>{this.ok(r.mensaje||'Caja abierta');this.cargarCaja();},error:e=>this.mostrarError(e)}); }
  movimientoCaja(){ this.api.movimientoCaja(this.movCajaForm.tipo,'Manual',this.movCajaForm.descripcion,Number(this.movCajaForm.monto)).subscribe({next:r=>{this.ok(r.mensaje||'Movimiento registrado');this.movCajaForm={tipo:'Ingreso',monto:0,descripcion:'',origen:'Manual'};this.cargarCaja();},error:e=>this.mostrarError(e)}); }
  cerrarCaja(){ if(!confirm('¿Cerrar la caja actual?')) return; this.api.cerrarCaja(Number(this.cajaCerrarForm.monto_real),this.cajaCerrarForm.observacion).subscribe({next:r=>{this.ok(r.mensaje||'Caja cerrada');this.cajaCerrarForm={monto_real:0,observacion:''};this.cargarCaja();},error:e=>this.mostrarError(e)}); }

  cargarConfiguracion(){
    this.api.configuracion().subscribe({
      next:r=>{
        const cfg=r?.configuracion || {};
        this.configuracionForm={
          ...this.configuracionForm,
          ...cfg,
          hora_apertura:String(cfg.hora_apertura || '06:00').slice(0,5),
          hora_cierre:String(cfg.hora_cierre || '22:00').slice(0,5),
          dias_atencion:Array.isArray(cfg.dias_atencion)?cfg.dias_atencion:this.configuracionForm.dias_atencion
        };
        this.configEstado=r?.estado || null;
        this.ultimoRespaldo=r?.ultimo_respaldo || null;
      },
      error:e=>this.mostrarError(e)
    });
  }

  toggleDiaConfiguracion(dia:string){
    const actuales=Array.isArray(this.configuracionForm.dias_atencion)?[...this.configuracionForm.dias_atencion]:[];
    const existe=actuales.includes(dia);
    if(existe && actuales.length===1){this.error='Debe existir al menos un día de atención.';return;}
    this.error='';
    this.configuracionForm.dias_atencion=existe?actuales.filter((d:string)=>d!==dia):[...actuales,dia];
  }

  guardarConfiguracion(){
    if(!this.configuracionForm.nombre_gimnasio?.trim()){this.error='Ingresa el nombre del gimnasio.';return;}
    this.configGuardando=true;
    const datos={...this.configuracionForm,hora_apertura:String(this.configuracionForm.hora_apertura).slice(0,5),hora_cierre:String(this.configuracionForm.hora_cierre).slice(0,5)};
    this.api.guardarConfiguracion(datos).subscribe({
      next:r=>{this.configGuardando=false;this.configuracionForm={...this.configuracionForm,...r.configuracion,hora_apertura:String(r.configuracion?.hora_apertura||datos.hora_apertura).slice(0,5),hora_cierre:String(r.configuracion?.hora_cierre||datos.hora_cierre).slice(0,5)};this.ok(r.mensaje||'Configuración guardada');},
      error:e=>{this.configGuardando=false;this.mostrarError(e);}
    });
  }

  verificarSistemaConfiguracion(){
    this.configAccion='estado';
    this.api.estadoSistema().subscribe({
      next:r=>{this.configAccion='';this.configEstado=r;this.ok(r.mysql?'Sistema verificado: API y MySQL conectados.':'La API responde, pero MySQL requiere revisión.');},
      error:e=>{this.configAccion='';this.mostrarError(e);}
    });
  }

  crearRespaldoConfiguracion(){
    if(!confirm('¿Crear una copia de seguridad de la base de datos ahora?')) return;
    this.configAccion='respaldo';
    this.api.crearRespaldo().subscribe({
      next:r=>{this.configAccion='';this.ultimoRespaldo=r.respaldo||null;this.ok(r.mensaje||'Respaldo creado');},
      error:e=>{this.configAccion='';this.mostrarError(e);}
    });
  }

  limpiarCacheConfiguracion(){
    this.configAccion='cache';
    this.api.limpiarCacheSistema().subscribe({
      next:r=>{this.configAccion='';this.ok(r.mensaje||'Caché limpiada');},
      error:e=>{this.configAccion='';this.mostrarError(e);}
    });
  }

  cambiarContrasenaConfiguracion(){
    if(!this.configPassword.actual || !this.configPassword.nueva){this.error='Completa la contraseña actual y la nueva.';return;}
    if(this.configPassword.nueva.length<8){this.error='La nueva contraseña debe tener mínimo 8 caracteres.';return;}
    if(this.configPassword.nueva!==this.configPassword.confirmacion){this.error='La confirmación de la contraseña no coincide.';return;}
    this.auth.cambiarContrasena(this.configPassword.actual,this.configPassword.nueva).subscribe({
      next:r=>{this.configPassword={actual:'',nueva:'',confirmacion:''};this.ok(r.mensaje||'Contraseña actualizada');},
      error:e=>this.mostrarError(e)
    });
  }

  cerrarSesion(){ this.auth.logout().subscribe({next:()=>{this.auth.limpiarSesion();this.router.navigate(['/login']);},error:()=>{this.auth.limpiarSesion();this.router.navigate(['/login']);}}); }

  iconoActividadPortal(tipo:any):string{
    const t=String(tipo||'').toLowerCase();
    if(t==='rutina')return '🏋';
    if(t==='soporte')return '?';
    if(t==='reserva')return '◷';
    if(t==='pago')return 'S/';
    if(t==='opinion')return '★';
    return '●';
  }

  etiquetaActividadPortal(tipo:any):string{
    const t=String(tipo||'').toLowerCase();
    if(t==='rutina')return 'SOLICITUD DE RUTINA';
    if(t==='soporte')return 'SOPORTE';
    if(t==='reserva')return 'RESERVA';
    if(t==='pago')return 'PAGO';
    if(t==='opinion')return 'OPINIÓN';
    return 'ACTIVIDAD';
  }

  abrirActividadPortal(a:any):void{
    const t=String(a?.tipo||'').toLowerCase();
    if(t==='rutina'){ this.atenderSolicitudRutina(a); return; }
    if(t==='soporte'){ this.cambiarSeccion('soporte'); return; }
    if(t==='reserva'){ this.cambiarSeccion('reservas'); return; }
    if(t==='pago'){ this.cambiarSeccion('pagos'); return; }
    if(t==='opinion'){ this.cambiarSeccion('opiniones'); return; }
  }

  irAlertasPendientes():void{
    if((this.dashboard?.alertas?.rutinas_pendientes ?? 0)>0 || (this.dashboard?.alertas?.soporte_pendiente ?? 0)>0){
      this.cambiarSeccion('soporte');
      return;
    }
    if((this.dashboard?.alertas?.opiniones_pendientes ?? 0)>0){
      this.cambiarSeccion('opiniones');
      return;
    }
    if((this.dashboard?.inventario?.productos_stock_bajo ?? 0)>0){
      this.cambiarSeccion('inventario');
      return;
    }
    if((this.dashboard?.membresias?.por_vencer_7_dias ?? 0)>0){
      this.cambiarSeccion('membresias');
      return;
    }
    this.cambiarSeccion('dashboard');
  }

  atenderSolicitudRutina(s:any):void{
    const idCliente=Number(s?.id_cliente ?? s?.cliente?.id_cliente ?? 0);
    if(!idCliente){
      this.error='No se pudo identificar al cliente de la solicitud de rutina.';
      return;
    }

    this.solicitudRutinaContexto=s;
    this.solicitudRutinaIdPendiente=Number(s?.id_soporte ?? s?.id ?? 0);
    this.rutinaEditandoId=0;
    this.rutinaForm={
      id_cliente:idCliente,
      id_entrenador:Number(this.entrenadores[0]?.id_entrenador||0),
      nombre_rutina:'',
      objetivo:'',
      descripcion:'',
      fecha_inicio:new Date().toISOString().slice(0,10),
      fecha_fin:'',
      estado:'Activo'
    };
    this.rutinaDetallesForm=[{ejercicio:'',series:3,repeticiones:12,peso_recomendado:null,descanso_segundos:60,observaciones:''}];
    this.cambiarSeccion('rutinas');
    this.ok('Solicitud cargada: completa la rutina y guárdala para notificar al cliente');
  }

  cancelarSolicitudRutinaContexto():void{
    this.solicitudRutinaContexto=null;
    this.solicitudRutinaIdPendiente=0;
    if(!this.rutinaEditandoId){
      this.rutinaForm={id_cliente:0,id_entrenador:Number(this.entrenadores[0]?.id_entrenador||0),nombre_rutina:'',objetivo:'',descripcion:'',fecha_inicio:new Date().toISOString().slice(0,10),fecha_fin:'',estado:'Activo'};
      this.rutinaDetallesForm=[{ejercicio:'',series:3,repeticiones:12,peso_recomendado:null,descanso_segundos:60,observaciones:''}];
    }
  }

  get opinionesPendientesCount():number{
    return this.opiniones.filter((o:any)=>String(o?.estado||'').toLowerCase()==='enviada').length;
  }

  get promedioOpiniones():number{
    if(!this.opiniones.length)return 0;
    return this.opiniones.reduce((s:number,o:any)=>s+(Number(o?.calificacion)||0),0)/this.opiniones.length;
  }

  cambiarEstadoOpinion(o:any,estado:'Enviada'|'Revisada'){
    if(!o?.id_opinion)return;
    this.api.cambiarEstadoOpinion(Number(o.id_opinion),estado).subscribe({
      next:r=>{this.ok(r?.mensaje||'Opinión actualizada');this.cargarOpiniones();this.cargarDashboard();},
      error:e=>this.mostrarError(e)
    });
  }

  estrellasOpinion(n:any):string{
    const total=Math.max(0,Math.min(5,Number(n)||0));
    return '★'.repeat(total)+'☆'.repeat(5-total);
  }

  nombreSolicitudRutina(s:any):string{
    if(typeof s?.cliente==='string' && s.cliente.trim()) return s.cliente.trim();
    const cliente=s?.cliente;
    const nombre=cliente ? `${cliente.nombres ?? ''} ${cliente.apellidos ?? ''}`.trim() : '';
    return nombre || 'Cliente';
  }

  nombreCliente(c:any): string { return c ? `${c.nombres ?? ''} ${c.apellidos ?? ''}`.trim() : '-'; }
  nombreClienteVenta(c:any): string {
    const nombre=this.nombreCliente(c);
    return nombre==='-' || !nombre ? 'Público general' : nombre;
  }
  nombreEntrenador(e:any): string { return e ? `${e.nombres ?? ''} ${e.apellidos ?? ''}`.trim() : '-'; }
  clientePago(p:any): string { return this.nombreCliente(p?.cliente_membresia?.cliente ?? p?.clienteMembresia?.cliente); }
  planPago(p:any): string { return p?.cliente_membresia?.membresia?.nombre ?? p?.clienteMembresia?.membresia?.nombre ?? '-'; }
  fecha(v:any): string { if(!v) return '-'; const d=new Date(v); return isNaN(d.getTime())?String(v):d.toLocaleString('es-PE'); }

  alturaIngreso(valor:any): number {
    const datos=this.dashboard?.tendencias?.ingresos_6_meses || [];
    const max=Math.max(...datos.map((x:any)=>Number(x.total)||0),1);
    const n=Number(valor)||0;
    return n<=0?0:Math.max(5,Math.min(100,(n/max)*100));
  }

  alturaAsistencia(valor:any): number {
    const datos=this.dashboard?.tendencias?.asistencias_7_dias || [];
    const max=Math.max(...datos.map((x:any)=>Number(x.total)||0),1);
    const n=Number(valor)||0;
    return n<=0?0:Math.max(6,Math.min(100,(n/max)*100));
  }

  porcentajePlan(valor:any): number {
    const total=Number(this.dashboard?.membresias?.activas||0);
    return total<=0?0:Math.min(100,(Number(valor)||0)*100/total);
  }

  get totalAsistenciasSemana(): number {
    return (this.dashboard?.tendencias?.asistencias_7_dias || []).reduce((s:number,d:any)=>s+(Number(d.total)||0),0);
  }

  get hayIngresosGrafica(): boolean {
    return (this.dashboard?.tendencias?.ingresos_6_meses || []).some((m:any) => Number(m.total) > 0);
  }

  get hayAsistenciasGrafica(): boolean {
    return this.totalAsistenciasSemana > 0;
  }

  ok(mensaje:string){ this.error=''; this.toast='✓ '+mensaje; setTimeout(()=>this.toast='',2600); }
  mostrarError(e:any){
    if(e?.status===401){this.auth.limpiarSesion();this.router.navigate(['/login']);return;}
    const errores=e?.error?.errors;
    if(errores){const primero=Object.values(errores)[0];this.error=Array.isArray(primero)?String(primero[0]):String(primero);return;}
    this.error=e?.error?.mensaje ?? e?.error?.message ?? e?.error?.error ?? 'No se pudo completar la operación.';
  }
}
