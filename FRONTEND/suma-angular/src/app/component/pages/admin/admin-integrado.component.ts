import { Component, HostListener, Input, OnDestroy, OnInit, Optional, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminApiService } from './admin-api.service';
import { AuthService } from './auth.service';
import { ProductosComponent } from './pages/productos/productos';
import { AdminComunicacionComponent } from './admin-comunicacion.component';
import { AdminClienteFichaComponent } from './admin-cliente-ficha.component';
import { AdminGymSuiteComponent } from './admin-gym-suite.component';
import { AdminApplicationsComponent } from './admin-applications.component';
import { AdminDashboardToolsComponent } from './admin-dashboard-tools.component';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-admin-integrado',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductosComponent, AdminComunicacionComponent, AdminClienteFichaComponent, AdminGymSuiteComponent, AdminApplicationsComponent, AdminDashboardToolsComponent],
  styleUrls: ['../mallqui-admin.css', '../ui-readable.css', './styles/admin-live.css', '../crossfit-final.css', './styles/admin-dashboard-polish.css', './styles/admin-dashboard-premium.css', './styles/admin-mantis-interactions.css', './styles/admin-dashboard-refined.css', './styles/admin-mantis-reference.css', './styles/admin-efsrt-validation.css', './styles/admin-mallqui-original-palette.css', './styles/admin-claridad.css', './styles/admin-efsrt-simplificado.css', './styles/admin-navegacion-clara.css'],
  encapsulation: ViewEncapsulation.None,
  template: `
  <div class="admin-shell admin-home-redesign" [class.admin-sidebar-collapsed]="sidebarCerrado" [class.mg-mantis-collapsed]="sidebarCerrado" [class.mg-mantis-dark]="modoDashboard==='oscuro'" [class.mg-mantis-compact]="densidadDashboard==='compacta'" [class.mg-mantis-blue]="acentoDashboard==='azul'" [class.mg-mantis-green]="acentoDashboard==='verde'" [class.mg-mantis-coral]="acentoDashboard==='coral'">
    <header class="mg-current-topbar">
      <div class="mg-mantis-identity">
        <button type="button" class="mg-mantis-icon-button mg-mantis-nav-toggle" (click)="toggleSidebar()"
          [attr.aria-label]="sidebarCerrado ? 'Expandir menú' : 'Contraer menú'" [attr.title]="sidebarCerrado ? 'Expandir menú' : 'Contraer menú'">☰</button>
        <div class="mg-top-greeting">
          <h1>{{seccion==='dashboard' ? 'Inicio' : tituloActual}}</h1>
          <span>{{fechaDashboard}}</span>
        </div>
      </div>

      <div class="mg-mantis-search-wrap">
        <label class="admin-wix-search">
          <span>⌕</span>
          <input type="text" [(ngModel)]="busquedaAdmin"
            (input)="abrirBuscadorMantis()"
            (keydown.enter)="buscarEnPanel(); cerrarMenusMantis()"
            placeholder="Buscar módulos y funciones..." aria-label="Buscar módulo del panel"
            autocomplete="off">
          <kbd>↵</kbd>
        </label>
        <div *ngIf="busquedaAbierta && busquedaAdmin.trim().length > 0" class="mg-mantis-search-results" role="listbox" aria-label="Módulos disponibles">
          <div class="mg-mantis-dropdown-title">ACCESO RÁPIDO</div>
          <button type="button" *ngFor="let modulo of accesosRapidosDashboard" (click)="irAAccesoRapido(modulo.id)"
            role="option" [attr.aria-selected]="seccion===modulo.id">
            <span>↗</span><strong>{{modulo.nombre}}</strong><small>Abrir módulo</small>
          </button>
          <p *ngIf="!accesosRapidosDashboard.length">No hay coincidencias. Prueba con socios, pagos, inventario o reservas.</p>
        </div>
      </div>

      <div class="mg-mantis-top-actions">
        <button type="button" class="mg-mantis-icon-button" (click)="actualizarDashboardCompleto()"
          [disabled]="actualizandoDatos" aria-label="Actualizar información" title="Actualizar información">↻</button>
        <button type="button" class="mg-mantis-icon-button mg-mantis-bell"
          (click)="alternarAlertasMantis()" [attr.aria-expanded]="avisosAbiertos"
          aria-label="Notificaciones y pendientes" title="Notificaciones">
          ♧ <i *ngIf="totalAlertasDashboard()>0"></i>
        </button>
        <button type="button" class="mg-mantis-profile-button"
          (click)="alternarPerfilMantis()" [attr.aria-expanded]="perfilAbiertoMantis"
          aria-label="Opciones de la cuenta" title="Opciones de la cuenta">
          {{(auth.usuario?.nombre_usuario || 'A').charAt(0).toUpperCase()}}
        </button>
      </div>

      <div *ngIf="avisosAbiertos" class="mg-mantis-dropdown mg-mantis-alerts" role="region" aria-label="Notificaciones">
        <div class="mg-mantis-dropdown-heading">
          <strong>Notificaciones</strong>
          <button type="button" (click)="cerrarMenusMantis()" aria-label="Cerrar notificaciones">×</button>
        </div>
        <p class="mg-mantis-dropdown-subtitle">{{totalAlertasDashboard()}} pendientes registrados</p>
        <button type="button" *ngFor="let aviso of alertasRapidasDashboard" (click)="irAAccesoRapido(aviso.id)">
          <span class="mg-mantis-alert-icon">{{aviso.icono}}</span>
          <span><strong>{{aviso.nombre}}</strong><small>{{aviso.cantidad}} pendientes · Abrir módulo</small></span>
          <b>›</b>
        </button>
        <p *ngIf="!alertasRapidasDashboard.length" class="mg-mantis-no-alerts">Sin pendientes registrados por el sistema.</p>
        <button type="button" class="mg-mantis-dropdown-footer" (click)="irAAccesoRapido('comunicacion')">Ver todas las notificaciones ›</button>
      </div>

      <div *ngIf="perfilAbiertoMantis" class="mg-mantis-dropdown mg-mantis-profile-dropdown" role="region" aria-label="Perfil del administrador">
        <div class="mg-mantis-dropdown-heading">
          <strong>Mi cuenta</strong>
          <button type="button" (click)="cerrarMenusMantis()" aria-label="Cerrar perfil">×</button>
        </div>
        <p class="mg-mantis-dropdown-subtitle">{{auth.usuario?.nombre_usuario || 'Administrador'}} · Administrador</p>
        <button type="button" (click)="irAAccesoRapido('configuracion')">⚙ Configuración y contraseña</button>
        <button type="button" (click)="irAAccesoRapido('auditoria')">▤ Historial de actividad</button>
        <button type="button" (click)="cerrarMenusMantis(); cerrarSesion()">↪ Cerrar sesión</button>
      </div>
    </header>
    <button *ngIf="busquedaAbierta || avisosAbiertos || perfilAbiertoMantis" type="button"
      class="mg-mantis-dismiss" aria-label="Cerrar desplegables" (click)="cerrarMenusMantis()"></button>

    <div *ngIf="personalizadorAbierto" class="mg-mantis-drawer-overlay">
      <button type="button" class="mg-mantis-drawer-backdrop" (click)="personalizadorAbierto=false" aria-label="Cerrar personalizador"></button>
      <aside class="mg-mantis-drawer" role="dialog" aria-modal="true" aria-label="Personalizar dashboard">
        <header>
          <div><small>APARIENCIA</small><h2>Personalizar panel</h2><p>Los cambios se guardan en este navegador.</p></div>
          <button type="button" (click)="personalizadorAbierto=false" aria-label="Cerrar personalizador">×</button>
        </header>
        <section>
          <h3>Tema</h3>
          <div class="mg-mantis-setting-row">
            <button type="button" [class.active]="modoDashboard==='claro'" (click)="guardarAparienciaMantis('tema','claro')">☀ Claro</button>
            <button type="button" [class.active]="modoDashboard==='oscuro'" (click)="guardarAparienciaMantis('tema','oscuro')">☾ Oscuro</button>
          </div>
        </section>
        <section>
          <h3>Color principal</h3>
          <div class="mg-mantis-setting-row">
            <button type="button" [class.active]="acentoDashboard==='coral'" (click)="guardarAparienciaMantis('color','coral')">● Coral</button>
            <button type="button" [class.active]="acentoDashboard==='azul'" (click)="guardarAparienciaMantis('color','azul')">● Azul</button>
            <button type="button" [class.active]="acentoDashboard==='verde'" (click)="guardarAparienciaMantis('color','verde')">● Verde</button>
          </div>
        </section>
        <section>
          <h3>Espaciado</h3>
          <div class="mg-mantis-setting-row">
            <button type="button" [class.active]="densidadDashboard==='normal'" (click)="guardarAparienciaMantis('densidad','normal')">Cómodo</button>
            <button type="button" [class.active]="densidadDashboard==='compacta'" (click)="guardarAparienciaMantis('densidad','compacta')">Compacto</button>
          </div>
        </section>
        <section>
          <h3>Menú lateral</h3>
          <button type="button" class="mg-mantis-setting-wide" (click)="toggleSidebar()">{{sidebarCerrado ? 'Expandir menú' : 'Contraer menú'}}</button>
        </section>
        <footer><button type="button" (click)="restablecerAparienciaMantis()">Restablecer apariencia</button></footer>
      </aside>
    </div>
    <aside class="mg-current-sidebar">
      <button type="button" class="mg-brand" (click)="cambiarSegcion('dashboard')" aria-label="Ir al inicio">
        <span class="mg-brand-icon">M</span>
        <span><strong>Mallqui</strong><b>Gym</b></span>
      </button>

      <nav class="admin-main-nav crossfit-sidebar-nav mg-clear-navigation" aria-label="Navegación del gimnasio">
        <span class="mg-nav-caption">EMPEZAR AQUÍ</span>
        <button type="button" class="mg-direct-home" [class.active]="seccion==='dashboard'"
          [attr.aria-current]="seccion==='dashboard' ? 'page' : null"
          (click)="cambiarSegcion('dashboard')">
          <span class="admin-main-nav-icon" aria-hidden="true">⌂</span><span>Inicio</span>
        </button>
        <button type="button" class="mg-direct-home mg-action-registrar"
          (click)="abrirNuevoSocioDesdeDashboard()" aria-label="Registrar un socio nuevo">
          <span class="admin-main-nav-icon" aria-hidden="true">＋</span><span>Nuevo socio</span>
        </button>
        <span class="mg-nav-caption mg-nav-section-separator">ÁREAS DEL GIMNASIO</span>
        <ng-container *ngFor="let grupo of menuPrincipal">
          <ng-container *ngIf="grupo.id!=='apps'">
            <button type="button" class="cf-nav-group-head mg-admin-group"
              [class.active]="!!navGroups[grupo.id]"
              [attr.aria-expanded]="!!navGroups[grupo.id]"
              (click)="toggleNavGroup(grupo.id)">
              <span class="admin-main-nav-icon" aria-hidden="true">{{grupo.icono}}</span>
              <span>{{grupo.titulo}}</span>
              <i aria-hidden="true">{{navGroups[grupo.id]?'⌃':'⌄'}}</i>
            </button>
            <div class="cf-nav-children mg-clear-submenu" *ngIf="navGroups[grupo.id]">
              <button type="button" *ngFor="let item of grupo.items"
                [class.active]="seccion===item.id && !item.accion"
                [attr.aria-current]="seccion===item.id && !item.accion ? 'page' : null"
                (click)="navegarMenu(item)">
                <span aria-hidden="true">•</span><span>{{item.nombre}}</span>
              </button>
            </div>
          </ng-container>
        </ng-container>
        <span class="mg-nav-caption mg-nav-section-separator">MÁS OPCIONES</span>
        <button type="button" class="mg-direct-home mg-catalogo-acceso"
          [class.active]="seccion==='catalogo' || esModuloAdicionalActivo"
          [attr.aria-current]="seccion==='catalogo' ? 'page' : null"
          (click)="cambiarSegcion('catalogo')">
          <span class="admin-main-nav-icon" aria-hidden="true">⊞</span><span>Todas las funciones</span>
        </button>
      </nav>

      <div class="mg-sidebar-bottom">
        <span class="mg-sidebar-tip">Abre un área para ver sus opciones. Las otras están en “Todas las funciones”.</span>
        <button type="button" (click)="cerrarSesion()">
          <span>↪</span><b>Cerrar sesión</b>
        </button>
      </div>
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

    <main class="mg-current-content">
      

      <nav class="admin-mobile-modules mg-efsrt-mobile-menu" aria-label="Acceso rápido en móvil">
        <button type="button" [class.active]="seccion==='dashboard'" (click)="cambiarSegcion('dashboard')"><span>⌂</span><b>Inicio</b></button>
        <button type="button" [class.active]="seccion==='clientes'" (click)="cambiarSegcion('clientes')"><span>♙</span><b>Socios</b></button>
        <button type="button" [class.active]="seccion==='reservas'" (click)="cambiarSegcion('reservas')"><span>◫</span><b>Reservas</b></button>
        <button type="button" [class.active]="seccion==='productos'" (click)="cambiarSegcion('productos')"><span>▦</span><b>Productos</b></button>
        <button type="button" (click)="toggleSidebar()" [attr.aria-expanded]="!sidebarCerrado"><span>☰</span><b>Menú</b></button>
      </nav>

      <div class="mg-current-workspace">
      <nav class="mg-mantis-breadcrumb" aria-label="Ruta del panel">
        <button type="button" (click)="cambiarSegcion('dashboard')">Mallqui Gym</button>
        <span>›</span>
        <span>{{seccion==='dashboard' ? 'Dashboard / Principal' : tituloActual}}</span>
      </nav>

      <section class="mg-module-shell-head" *ngIf="seccion!=='dashboard'">
        <div class="mg-module-shell-copy">
          <span>{{etiquetaModuloActual}}</span>
          <h2>{{tituloActual}}</h2>
          <p>{{subtituloActual}}</p>
        </div>
        <div class="mg-module-shell-actions">
          <span class="mg-module-state">{{estadoModuloActual}}</span>
          <button type="button" class="mg-back-home"
            (click)="cambiarSegcion(['usuarios','auditoria','mantenimiento-sistema','verificacion-efsrt'].includes(seccion) ? 'configuracion' : 'dashboard')"
            [attr.aria-label]="['usuarios','auditoria','mantenimiento-sistema','verificacion-efsrt'].includes(seccion) ? 'Volver a configuración' : 'Volver al panel principal'">
            {{['usuarios','auditoria','mantenimiento-sistema','verificacion-efsrt'].includes(seccion) ? '← Configuración' : '← Inicio'}}
          </button>
          <button type="button" (click)="actualizarSegcionActual()" [disabled]="actualizandoDatos">
            {{actualizandoDatos ? 'Actualizando...' : '↻ Actualizar'}}
          </button>
        </div>
      </section>



      <ng-container *ngIf="seccion==='catalogo'">
        <section class="mg-catalogo-funciones" aria-label="Todas las funciones administrativas">
          <header class="mg-catalogo-intro">
            <h2>Encuentra lo que necesitas</h2>
            <p>Las tareas diarias están en el menú lateral. Aquí están las otras herramientas del gimnasio, agrupadas por área.</p>
          </header>
          <div class="mg-catalogo-categorias">
            <section *ngFor="let categoria of categoriasMenuOpcional" class="mg-catalogo-categoria">
              <h3>{{categoria.nombre}}</h3>
              <div class="mg-catalogo-enlaces">
                <ng-container *ngFor="let item of menuPrincipal[4].items">
                  <button *ngIf="categoria.items.includes(item.id)" type="button"
                    (click)="navegarMenu(item)">
                    <span>{{item.nombre}}</span><span aria-hidden="true">›</span>
                  </button>
                </ng-container>
              </div>
            </section>
          </div>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='dashboard'">
        <section class="mg-dashboard mg-efsrt-dashboard" aria-label="Panel de control de Mallqui Gym">
          <header class="mg-efsrt-hero">
            <div>
              <span class="mg-efsrt-eyebrow">MALLQUI GYM · ADMINISTRACIÓN</span>
              <h2>Panel principal</h2>
              <p>Control diario de socios, reservas, asistencia e inventario.</p>
            </div>
            <div class="mg-efsrt-hero-aside">
              <span class="mg-efsrt-connection" [class.problem]="!sistemaSincronizado">
                {{sistemaSincronizado ? '● Sistema conectado' : (estadoOperativoDashboard?.database ? '● Esquema pendiente' : '● Revisar conexión')}}
              </span>
              <button type="button" (click)="actualizarDashboardCompleto()" [disabled]="actualizandoDatos">
                {{actualizandoDatos ? 'Actualizando...' : '↻ Actualizar'}}
              </button>
            </div>
          </header>

          <section class="mg-efsrt-work">
            <div class="mg-efsrt-heading">
              <h3>¿Qué necesitas hacer hoy?</h3>
              <p>Selecciona una tarea para abrir directamente el módulo.</p>
            </div>
            <div class="mg-efsrt-actions">
              <button type="button" (click)="abrirNuevoSocioDesdeDashboard()">
                <span aria-hidden="true">♙</span><strong>Matricular socio</strong><small>Nuevo registro</small>
              </button>
              <button type="button" (click)="cambiarSegcion('reservas')">
                <span aria-hidden="true">◫</span><strong>Reservas</strong><small>Gestionar sesiones</small>
              </button>
              <button type="button" (click)="cambiarSegcion('asistencias')">
                <span aria-hidden="true">✓</span><strong>Asistencia</strong><small>Entrada y salida</small>
              </button>
              <button type="button" (click)="cambiarSegcion('rutinas')">
                <span aria-hidden="true">✦</span><strong>Rutinas</strong><small>Plan de entrenamiento</small>
              </button>
              <button type="button" (click)="cambiarSegcion('productos')">
                <span aria-hidden="true">▦</span><strong>Productos</strong><small>Fotos y stock</small>
              </button>
              <button type="button" (click)="cambiarSegcion('pagos')">
                <span aria-hidden="true">S/</span><strong>Pagos</strong><small>Cobros y membresías</small>
              </button>
            </div>
          </section>

          <section class="mg-efsrt-kpis" aria-label="Indicadores obtenidos de MySQL">
            <article>
              <span>Socios activos</span>
              <strong>{{fuenteKpiDisponible('socios') ? (dashboard?.clientes?.activos ?? clientesActivos ?? 0) : '—'}}</strong>
              <small>{{fuenteKpiDisponible('socios') ? 'Miembros registrados' : 'Datos de socios no disponibles'}}</small>
            </article>
            <article>
              <span>Reservas de hoy</span>
              <strong>{{fuenteKpiDisponible('reservas') ? (dashboard?.reservas?.hoy ?? reservasHoyDashboard().length) : '—'}}</strong>
              <small>{{fuenteKpiDisponible('reservas') ? 'Sesiones programadas' : 'Falta habilitar las reservas en MySQL'}}</small>
            </article>
            <article>
              <span>Asistencias de hoy</span>
              <strong>{{fuenteKpiDisponible('asistencias') ? (dashboard?.asistencias?.hoy ?? 0) : '—'}}</strong>
              <small>{{fuenteKpiDisponible('asistencias') ? 'Ingresos al gimnasio' : 'Falta habilitar la asistencia en MySQL'}}</small>
            </article>
            <article>
              <span>Ingresos del mes</span>
              <strong>{{fuenteKpiDisponible('ingresos') ? 'S/ ' + ((dashboard?.ingresos?.total_mes ?? 0) | number:'1.2-2') : '—'}}</strong>
              <small>{{fuenteKpiDisponible('ingresos') ? 'Pagos y ventas' : 'Faltan tablas de pagos y ventas'}}</small>
            </article>
          </section>

          <section class="mg-efsrt-pulse" aria-label="Pendientes de la operación del gimnasio">
            <div class="mg-efsrt-pulse-intro">
              <strong>Estado de la operación</strong>
              <small>{{sistemaSincronizado ? 'Pendientes calculados desde MySQL' : 'Datos parciales: verifica la conexión y las tablas pendientes'}}</small>
            </div>
            <div class="mg-efsrt-pulse-items">
              <button type="button" (click)="cambiarSegcion('renovaciones')"
                [class.has-pending]="(dashboard?.membresias?.por_vencer_7_dias ?? 0)>0">
                <strong>{{dashboard?.membresias?.por_vencer_7_dias ?? '—'}}</strong>
                <span>Membresías por vencer<small>Próximos 7 días</small></span>
                <span class="mg-efsrt-pulse-action" aria-hidden="true">›</span>
              </button>
              <button type="button" (click)="cambiarSegcion('inventario')"
                [class.has-pending]="(dashboard?.inventario?.productos_stock_bajo ?? 0)>0">
                <strong>{{dashboard?.inventario?.productos_stock_bajo ?? '—'}}</strong>
                <span>Productos con stock bajo<small>Revisar inventario</small></span>
                <span class="mg-efsrt-pulse-action" aria-hidden="true">›</span>
              </button>
              <button type="button" (click)="cambiarSegcion('pagos')"
                [class.has-pending]="(dashboard?.membresias?.pagos_pendientes ?? 0)>0">
                <strong>{{dashboard?.membresias?.pagos_pendientes ?? '—'}}</strong>
                <span>Pagos pendientes<small>Revisar cobros</small></span>
                <span class="mg-efsrt-pulse-action" aria-hidden="true">›</span>
              </button>
            </div>
          </section>

          <div class="mg-efsrt-grid">
            <section class="mg-efsrt-panel mg-efsrt-renewals" [class.warning]="totalMembresiasPorVencerDashboard > 0">
              <div class="mg-efsrt-heading"><h3>Vencimientos de membresías</h3><p>Alertas para el administrador.</p></div>
              <strong class="mg-efsrt-renewal-count">{{totalMembresiasPorVencerDashboard}}</strong>
              <p *ngIf="!totalMembresiasPorVencerDashboard">
                {{dashboard ? 'No hay vencimientos durante los próximos siete días.' : 'Actualiza el panel para comprobar las membresías.'}}
              </p>
              <div class="mg-efsrt-renewal-rows" *ngIf="totalMembresiasPorVencerDashboard">
                <p *ngFor="let registro of membresiasPorVencerDashboard.slice(0,3)">
                  <b>{{nombreCliente(registro.cliente)}}</b>
                  <span>{{registro.fecha_fin}} · {{registro.membresia?.nombre || 'Membresía'}}</span>
                </p>
              </div>
              <button type="button" (click)="cambiarSegcion('renovaciones')">Revisar vencimientos</button>
            </section>

            <section class="mg-efsrt-panel mg-efsrt-bookings">
              <div class="mg-efsrt-heading"><h3>Próximas reservas</h3><p>Sesiones registradas para hoy.</p></div>
              <div *ngIf="reservasHoyDashboard().length; else sinAgendaEfsrt">
                <p *ngFor="let reserva of reservasHoyDashboard().slice(0,4)">
                  <strong>{{reserva.clase?.hora_inicio || '—'}}</strong>
                  <span>{{nombreCliente(reserva.cliente) || 'Socio'}} · {{reserva.clase?.nombre || 'Sesión'}}</span>
                </p>
              </div>
              <ng-template #sinAgendaEfsrt><p class="mg-efsrt-empty">No hay reservas registradas para hoy.</p></ng-template>
            </section>
          </div>

          <section class="mg-catalog-preview mg-efsrt-product-preview" aria-label="Productos y fotografías reales de MySQL">
            <header>
              <div>
                <span>INVENTARIO</span>
                <h2>Productos del gimnasio</h2>
                <p>Fotos, precios y existencias guardados en MySQL.</p>
              </div>
              <button type="button" (click)="cambiarSegcion('productos')">Gestionar productos</button>
            </header>
            <div class="mg-catalog-summary" *ngIf="productos.length">
              <span><strong>{{productos.length}}</strong> productos</span>
              <span><strong>{{productosConImagenDashboard}}</strong> con foto</span>
              <span *ngIf="productosConImagenDashboard < productos.length" class="mg-catalog-missing">
                <strong>{{productos.length - productosConImagenDashboard}}</strong> sin fotografía
              </span>
            </div>
            <div class="mg-catalog-cards" *ngIf="productos.length; else sinProductosEfsrt">
              <article *ngFor="let p of productosDestacadosDashboard" class="mg-catalog-product">
                <div class="mg-catalog-product-photo">
                  <img *ngIf="fotoProductoDisponibleDashboard(p.foto)" [src]="p.foto"
                    [alt]="'Foto de ' + p.nombre_producto">
                  <span *ngIf="!fotoProductoDisponibleDashboard(p.foto)" class="mg-catalog-no-photo">
                    <i>▧</i><small>Foto pendiente</small>
                  </span>
                </div>
                <strong>{{p.nombre_producto}}</strong>
                <small>{{p.codigo_producto || 'Sin código'}} · Stock {{p.stock ?? 0}}</small>
                <b>S/ {{p.precio_venta ?? 0 | number:'1.2-2'}}</b>
              </article>
            </div>
            <ng-template #sinProductosEfsrt>
              <p class="mg-efsrt-empty">No hay productos cargados desde MySQL. Registra productos y sus fotos desde Inventario.</p>
            </ng-template>
          </section>

          <section class="mg-efsrt-optional">
            <button type="button" class="mg-efsrt-optional-toggle"
              [attr.aria-expanded]="mostrarGraficosDashboard"
              (click)="mostrarGraficosDashboard=!mostrarGraficosDashboard">
              <span>Gráficos y análisis de ingresos</span>
              <span>{{mostrarGraficosDashboard ? 'Ocultar −' : 'Mostrar +'}}</span>
            </button>
            <ng-container *ngIf="mostrarGraficosDashboard">
            <section class="mg-premium-analytics" aria-label="Gráficos de actividad e ingresos">
              <div class="mg-premium-analytics-head">
                <div><span>ANALÍTICA REAL</span><h2>Tendencias del gimnasio</h2><p>Gráficos construidos con información de la base de datos.</p></div>
                <button type="button" (click)="cambiarSegcion('reportes-admin')">Ver reportes completos <span>↗</span></button>
              </div>
              <div class="mg-premium-analytics-grid">
                <article class="mg-premium-card mg-revenue-card">
                  <header><div><span>RENDIMIENTO FINANCIERO</span><h3>Ingresos de los últimos 6 meses</h3></div><i>S/</i></header>
                  <div class="mg-mantis-chart-switch" role="group" aria-label="Tipo de ingresos">
                    <button type="button" [class.active]="tipoIngresoDashboard==='total'" (click)="tipoIngresoDashboard='total'">Total</button>
                    <button type="button" [class.active]="tipoIngresoDashboard==='membresias'" (click)="tipoIngresoDashboard='membresias'">Membresías</button>
                    <button type="button" [class.active]="tipoIngresoDashboard==='ventas'" (click)="tipoIngresoDashboard='ventas'">Ventas</button>
                  </div>
                  <div class="mg-revenue-overview">
                    <strong>S/ {{totalIngresoMesSeleccionado() | number:'1.2-2'}}</strong>
                    <span>{{nombreIngresoSeleccionado}} · Mes actual</span>
                  </div>
                  <div class="mg-revenue-chart" *ngIf="fuenteKpiDisponible('ingresos') && ingresosMensualesDashboard().length; else sinDatosIngresos">
                    <svg viewBox="0 0 720 245" preserveAspectRatio="none" role="img" aria-label="Evolución de ingresos mensuales en soles">
                      <defs>
                        <linearGradient id="mgRealRevenueFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0" stop-color="#f56e58" stop-opacity=".23"/>
                          <stop offset="1" stop-color="#f56e58" stop-opacity=".015"/>
                        </linearGradient>
                      </defs>
                      <path d="M50 57H687 M50 107H687 M50 157H687 M50 207H687" class="mg-revenue-grid"/>
                      <text x="4" y="62">{{maxIngresoGrafico() | number:'1.0-0'}}</text>
                      <text x="4" y="211">0</text>
                      <path [attr.d]="areaIngresosDashboard()" fill="url(#mgRealRevenueFill)"/>
                      <polyline [attr.points]="lineaIngresosDashboard()" class="mg-revenue-line"/>
                      <circle *ngFor="let punto of puntosIngresosDashboard()" [attr.cx]="punto.x" [attr.cy]="punto.y" r="6" class="mg-revenue-dot"/>
                    </svg>
                    <div class="mg-revenue-labels"><span *ngFor="let mes of ingresosMensualesDashboard()">{{mes.mes}}</span></div>
                  </div>
                  <ng-template #sinDatosIngresos><div class="mg-no-chart-data">No se pudieron comprobar ingresos mensuales. Revisa las tablas de pagos y ventas.</div></ng-template>
                  <footer><span><i></i>Ingresos calculados por el sistema</span><b>{{dashboard?.periodo?.mes || 'Mes actual'}}</b></footer>
                </article>

                <article class="mg-premium-card mg-attendance-card">
                  <header><div><span>ASISTENCIA</span><h3>Últimos 7 días</h3></div><i>↗</i></header>
                  <div class="mg-attendance-total"><strong>{{fuenteKpiDisponible('asistencias') && dashboard?.tendencias?.asistencias_7_dias?.length ? totalActividadSemanal() : '—'}}</strong><span>asistencias registradas</span></div>
                  <div class="mg-real-bars" *ngIf="fuenteKpiDisponible('asistencias') && dashboard?.tendencias?.asistencias_7_dias?.length; else faltanAsistenciasGrafica" role="img" aria-label="Cantidad de asistencias registradas cada día de los últimos siete días">
                    <div class="mg-real-day" *ngFor="let d of diasActividadDashboard()">
                      <b>{{d.total ?? 0}}</b>
                      <div class="mg-real-track"><i [style.height.%]="alturaAsistenciaSemana(d.total)"></i></div>
                      <span>{{d.dia}}</span>
                    </div>
                  </div>
                  <ng-template #faltanAsistenciasGrafica><div class="mg-no-chart-data">La tabla de asistencias no está disponible o no se pudo consultar.</div></ng-template>
                  <footer>Registros de asistencia recuperados del servidor.</footer>
                </article>

                <article class="mg-premium-card mg-operations-card">
                  <header><div><span>MOVIMIENTO DE HOY</span><h3>Actividad operativa</h3></div><i>◉</i></header>
                  <div class="mg-operations-visual" *ngIf="fuenteKpiDisponible('asistencias') || fuenteKpiDisponible('reservas') || fuenteKpiDisponible('ingresos'); else faltaOperacionGrafica">
                    <div class="mg-operations-ring">
                      <svg viewBox="0 0 180 180" role="img" aria-label="Distribución entre asistencias, reservas y ventas de hoy">
                        <circle cx="90" cy="90" r="62" pathLength="100" class="mg-operations-track"/>
                        <circle cx="90" cy="90" r="62" pathLength="100" class="mg-operations-att"
                          [attr.stroke-dasharray]="porcentajeActividadOperativa('asistencias') + ' ' + (100-porcentajeActividadOperativa('asistencias'))"/>
                        <circle cx="90" cy="90" r="62" pathLength="100" class="mg-operations-res"
                          [attr.stroke-dasharray]="porcentajeActividadOperativa('reservas') + ' ' + (100-porcentajeActividadOperativa('reservas'))"
                          [attr.stroke-dashoffset]="-porcentajeActividadOperativa('asistencias')"/>
                        <circle cx="90" cy="90" r="62" pathLength="100" class="mg-operations-ven"
                          [attr.stroke-dasharray]="porcentajeActividadOperativa('ventas') + ' ' + (100-porcentajeActividadOperativa('ventas'))"
                          [attr.stroke-dashoffset]="-(porcentajeActividadOperativa('asistencias')+porcentajeActividadOperativa('reservas'))"/>
                      </svg>
                      <div><strong>{{totalActividadOperativa()}}</strong><span>movimientos</span></div>
                    </div>
                    <div class="mg-operations-breakdown">
                      <div><span><i class="a"></i>Asistencias</span><b>{{fuenteKpiDisponible('asistencias') ? (dashboard?.asistencias?.hoy ?? 0) : '—'}}</b></div>
                      <div><span><i class="r"></i>Reservas</span><b>{{fuenteKpiDisponible('reservas') ? (dashboard?.reservas?.hoy ?? 0) : '—'}}</b></div>
                      <div><span><i class="v"></i>Ventas</span><b>{{fuenteKpiDisponible('ingresos') ? (dashboard?.ventas?.hoy_cantidad ?? 0) : '—'}}</b></div>
                    </div>
                  </div>
                  <ng-template #faltaOperacionGrafica><div class="mg-no-chart-data">No hay información operativa recuperada.</div></ng-template>
                  <footer *ngIf="dashboard && totalActividadOperativa() === 0">Todavía no hay movimientos registrados hoy.</footer>
                  <footer *ngIf="totalActividadOperativa() > 0">Distribución calculada a partir de registros reales.</footer>
                </article>
              </div>
            </section>
              <section class="mg-advanced-tools-shell">
                <div class="mg-advanced-tools-head">
                  <div>
                    <small>DATOS OPERATIVOS</small>
                    <h3>Análisis avanzado</h3>
                    <p>Consulta y exporta datos cuando necesites un reporte más completo.</p>
                  </div>
                  <button type="button" class="admin-secondary"
                    [attr.aria-expanded]="herramientasAvanzadasAbiertas"
                    (click)="herramientasAvanzadasAbiertas=!herramientasAvanzadasAbiertas">
                    {{herramientasAvanzadasAbiertas ? 'Cerrar detalle' : 'Abrir detalle'}}
                  </button>
                </div>
                <app-admin-dashboard-tools
                  *ngIf="herramientasAvanzadasAbiertas"
                  [dashboard]="dashboard"
                  (irSeccion)="cambiarSeccion($event)">
                </app-admin-dashboard-tools>
              </section>
            </ng-container>
          </section>

          <section class="mg-efsrt-data-status" [class.problem]="!sistemaSincronizado">
            <div>
              <strong>{{sistemaSincronizado ? 'Datos sincronizados con Laravel y MySQL' : 'Hay módulos con estructura de datos pendiente'}}</strong>
              <p>{{mensajeSincronizacion}}</p>
              <small>Socios: {{clientes.length}} · Productos: {{productos.length}} · Pagos: {{pagos.length}} · Reservas: {{reservas.length}}</small>
            </div>
            <button type="button" (click)="cambiarSegcion('verificacion-efsrt')">Verificar sistema</button>
          </section>

        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='progreso-fisico'">
        <section class="mg-business-page">
          <header class="mg-business-head">
            <div><span>PROGRESO FÍSICO</span><h2>Medidas y evolución del socio</h2><p>Registra peso, grasa corporal, cintura y brazo para controlar el avance real.</p></div>
          </header>
          <section class="mg-business-selector">
            <label>Socio
              <select [(ngModel)]="progresoClienteId" (ngModelChange)="cargarProgresoFisico()">
                <option [ngValue]="0">Seleccionar socio</option>
                <option *ngFor="let c of clientes" [ngValue]="c.id_cliente">{{nombreCliente(c)}} · {{c.dni}}</option>
              </select>
            </label>
          </section>

          <ng-container *ngIf="progresoClienteId">
            <section class="mg-progress-kpis">
              <article><small>Peso actual</small><b>{{progresoDatos?.medidas?.[0]?.peso ?? '-'}} <em>kg</em></b></article>
              <article><small>Grasa corporal</small><b>{{progresoDatos?.medidas?.[0]?.grasa ?? '-'}} <em>%</em></b></article>
              <article><small>Cintura</small><b>{{progresoDatos?.medidas?.[0]?.cintura ?? '-'}} <em>cm</em></b></article>
              <article><small>Brazo</small><b>{{progresoDatos?.medidas?.[0]?.brazo ?? '-'}} <em>cm</em></b></article>
            </section>

            <section class="mg-business-grid two">
              <article class="mg-business-card">
                <h3>Registrar nueva medición</h3>
                <form class="mg-measure-form" (ngSubmit)="guardarMedidaProgreso()">
                  <div><label>Peso (kg)<input type="number" step="0.1" min="0" [(ngModel)]="medidaForm.peso" name="mpeso"></label>
                  <label>Grasa (%)<input type="number" step="0.1" min="0" [(ngModel)]="medidaForm.grasa" name="mgrasa"></label></div>
                  <div><label>Cintura (cm)<input type="number" step="0.1" min="0" [(ngModel)]="medidaForm.cintura" name="mcintura"></label>
                  <label>Brazo (cm)<input type="number" step="0.1" min="0" [(ngModel)]="medidaForm.brazo" name="mbrazo"></label></div>
                  <label>Fecha<input type="date" [(ngModel)]="medidaForm.fecha" name="mfecha"></label>
                  <button type="submit" class="admin-primary">Guardar medición</button>
                </form>
              </article>

              <article class="mg-business-card">
                <h3>Rutina actual</h3>
                <div class="mg-routine-summary" *ngIf="progresoDatos?.rutina; else sinRutinaProgreso">
                  <b>Rutina asignada</b>
                  <p>{{progresoDatos?.rutina?.observaciones || 'Plan de entrenamiento activo.'}}</p>
                  <button type="button" class="admin-secondary" (click)="cambiarSegcion('rutinas')">Gestionar rutina</button>
                </div>
                <ng-template #sinRutinaProgreso><p class="mg-empty-copy">El socio todavía no tiene una rutina asignada.</p></ng-template>
              </article>
            </section>

            <article class="mg-business-card">
              <div class="mg-business-card-head"><div><h3>Historial de mediciones</h3><p>Evolución ordenada desde la medición más reciente.</p></div></div>
              <div class="table-wrap">
                <table class="management-table">
                  <thead><tr><th>Fecha</th><th>Peso</th><th>Grasa</th><th>Cintura</th><th>Brazo</th><th>Acción</th></tr></thead>
                  <tbody>
                    <tr *ngFor="let m of progresoDatos?.medidas || []">
                      <td>{{m.fecha}}</td><td>{{m.peso ?? '-'}} kg</td><td>{{m.grasa ?? '-'}}%</td><td>{{m.cintura ?? '-'}} cm</td><td>{{m.brazo ?? '-'}} cm</td>
                      <td><button type="button" class="table-danger" (click)="eliminarMedidaProgreso(m.id)">Eliminar</button></td>
                    </tr>
                    <tr *ngIf="!(progresoDatos?.medidas || []).length"><td colspan="6">No hay mediciones registradas.</td></tr>
                  </tbody>
                </table>
              </div>
            </article>
          </ng-container>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='renovaciones'">
        <section class="mg-business-page">
          <header class="mg-business-head">
            <div><span>RENOVACIONES Y AVISOS</span><h2>Membresías próximas a vencer</h2><p>Controla renovaciones y comunica al socio antes de que pierda acceso al gimnasio.</p></div>
            <div class="mg-business-actions">
              <select [(ngModel)]="renovacionesDias" (ngModelChange)="cargarRenovaciones()"><option [ngValue]="7">7 días</option><option [ngValue]="15">15 días</option><option [ngValue]="30">30 días</option></select>
              <button type="button" class="admin-primary" (click)="enviarAvisosTodos()">Enviar avisos disponibles</button>
            </div>
          </header>

          <section class="mg-renewal-summary">
            <article><small>Por vencer</small><b>{{renovacionesLista.length}}</b><span>socios requieren seguimiento</span></article>
            <article><small>Con teléfono</small><b>{{renovacionesConTelefono}}</b><span>contactos disponibles</span></article>
            <article><small>Con WhatsApp configurado</small><b>{{renovacionesConWhatsapp}}</b><span>avisos automáticos listos</span></article>
          </section>

          <article class="mg-business-card">
            <div class="table-wrap">
              <table class="management-table">
                <thead><tr><th>Socio</th><th>Plan</th><th>Vence</th><th>Teléfono</th><th>WhatsApp</th><th>Acciones</th></tr></thead>
                <tbody>
                  <tr *ngFor="let v of renovacionesLista">
                    <td><b>{{v.nombre}}</b></td><td>{{v.nombre_plan}}</td><td>{{v.fecha_fin}}</td><td>{{v.telefono || 'Sin teléfono'}}</td>
                    <td><span class="mg-follow-status" [class.warning]="!v.whatsapp_api_key">{{v.whatsapp_api_key ? 'Configurado' : 'Sin API Key'}}</span></td>
                    <td>
                      <button type="button" class="admin-secondary" (click)="configurarWhatsapp(v)">Configurar</button>
                      <button type="button" class="admin-primary" [disabled]="!v.telefono || !v.whatsapp_api_key" (click)="enviarAvisoWhatsapp(v)">Enviar aviso</button>
                      <button type="button" class="table-action" (click)="abrirRenovacionSocio(v)">Renovar</button>
                    </td>
                  </tr>
                  <tr *ngIf="!renovacionesLista.length"><td colspan="6">No hay membresías próximas a vencer en este rango.</td></tr>
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='documentos-socio'">
        <section class="mg-business-page">
          <header class="mg-business-head">
            <div><span>DOCUMENTOS DEL SOCIO</span><h2>Carnet y comprobantes</h2><p>Genera información de identificación y comprobantes desde los registros reales del socio.</p></div>
          </header>
          <section class="mg-business-grid two">
            <article class="mg-business-card">
              <h3>Carnet de socio</h3>
              <label>Seleccionar socio
                <select [(ngModel)]="documentoClienteId">
                  <option [ngValue]="0">Seleccionar</option>
                  <option *ngFor="let c of clientes" [ngValue]="c.id_cliente">{{nombreCliente(c)}} · {{c.dni}}</option>
                </select>
              </label>
              <button type="button" class="admin-primary" [disabled]="!documentoClienteId" (click)="generarCarnetSocio()">Generar carnet</button>

              <div class="mg-member-card" *ngIf="carnetDatos">
                <div class="mg-member-card-brand">MALLQUI <b>GYM</b></div>
                <div class="mg-member-card-person">
                  <span>{{inicialesCliente(carnetDatos.socio)}}</span>
                  <div><strong>{{nombreCliente(carnetDatos.socio)}}</strong><small>DNI {{carnetDatos.socio?.dni}}</small></div>
                </div>
                <div class="mg-member-card-info">
                  <p><span>Plan</span><b>{{carnetDatos.suscripcion?.plan || 'Sin plan'}}</b></p>
                  <p><span>Vencimiento</span><b>{{carnetDatos.suscripcion?.fecha_fin || '-'}}</b></p>
                  <p><span>Código</span><b>{{carnetDatos.qr_texto || carnetDatos.socio?.dni}}</b></p>
                </div>
              </div>
            </article>

            <article class="mg-business-card">
              <h3>Constancia de pago de membresía</h3>
              <p>Selecciona un pago confirmado. Las solicitudes pendientes o rechazadas no generan constancias.</p>
              <label>Pago confirmado
                <select [(ngModel)]="documentoPagoId" (ngModelChange)="comprobanteDatos=null">
                  <option [ngValue]="0">Seleccionar pago</option>
                  <option *ngFor="let p of pagos" [ngValue]="p.id_pago" [disabled]="p.estado_pago!=='Completado'">
                    {{clientePago(p)}} · {{planPago(p)}} · S/ {{p.monto | number:'1.2-2'}} · {{p.estado_pago}}
                  </option>
                </select>
              </label>
              <button type="button" class="admin-primary" [disabled]="!documentoPagoId" (click)="generarComprobanteMembresia()">Consultar comprobante</button>
              <div class="mg-receipt-preview" *ngIf="comprobanteDatos">
                <strong>CONSTANCIA INTERNA — {{comprobanteDatos.numero_comprobante}}</strong>
                <p>Socio: {{comprobanteDatos.cliente}}</p>
                <p>DNI: {{comprobanteDatos.dni}}</p>
                <p>Plan: {{comprobanteDatos.membresia}}</p>
                <p>Fecha de pago: {{fecha(comprobanteDatos.fecha_pago)}}</p>
                <p>Método: {{comprobanteDatos.metodo_pago}}</p>
                <p>Estado: {{comprobanteDatos.estado_pago}}</p>
                <p>Total: S/ {{comprobanteDatos.monto | number:'1.2-2'}}</p>
                <p><small>{{comprobanteDatos.nota_tributaria}}</small></p>
                <button type="button" class="admin-primary" (click)="imprimirComprobantePago()">Abrir / imprimir constancia</button>
              </div>
            </article>
          </section>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='verificacion-efsrt'">
        <section class="efsrt-head">
          <div>
            <small>REVISIÓN TÉCNICA DEL PROYECTO</small>
            <h2>Comprobación EFSRT — Mallqui Gym</h2>
            <p>Verificación de la conexión MySQL, existencia de tablas y coherencia de los registros reales.</p>
          </div>
          <div class="efsrt-export-actions">
            <button type="button" class="admin-secondary"
              (click)="descargarInformeEfsrt()" [disabled]="verificacionEfsrtCargando || !verificacionEfsrt?.semanas?.length">
              Descargar revisión CSV
            </button>
            <button type="button" class="admin-primary"
              (click)="cargarVerificacionEfsrt()" [disabled]="verificacionEfsrtCargando">
              {{verificacionEfsrtCargando ? 'Comprobando...' : '↻ Comprobar de nuevo'}}
            </button>
          </div>
        </section>
        <p class="efsrt-notice warn" *ngIf="verificacionEfsrtError">{{verificacionEfsrtError}}</p>
        <p class="efsrt-notice" *ngIf="verificacionEfsrtCargando">Consultando datos reales del servidor...</p>
        <ng-container *ngIf="verificacionEfsrt as revision">
          <section class="efsrt-summary">
            <article><span>Conexión</span><strong>MySQL</strong><small>{{revision.conexion}}</small></article>
            <article><span>Módulos revisados</span><strong>{{revision.total_modulos}}</strong><small>Revisión de estructura</small></article>
            <article><span>Estructura disponible</span><strong>{{revision.modulos_con_estructura}}</strong><small>Sin tablas faltantes</small></article>
            <article><span>Problemas detectados</span><strong>{{revision.faltantes + revision.alertas.length}}</strong><small>Tablas faltantes y alertas</small></article>
          </section>
          <p class="efsrt-notice">{{revision.nota}} Fecha de la consulta: {{revision.fecha_revision}}. Base: {{revision.base_datos}}.</p>
          <section class="efsrt-weekly" *ngIf="revision.semanas?.length" aria-label="Revisión de las 11 semanas EFSRT">
            <div class="efsrt-weekly-head">
              <div><h3>Revisión de las 11 semanas</h3>
                <p>Los pendientes se calculan con datos reales. Tener un módulo visible no significa haber aprobado sus pruebas.</p></div>
              <strong>{{revision.semanas_pendientes}} con observaciones</strong>
            </div>
            <div class="efsrt-weekly-grid">
              <article *ngFor="let semana of revision.semanas" class="efsrt-week-card">
                <div class="efsrt-week-top">
                  <b>Semana {{semana.semana < 10 ? '0' + semana.semana : semana.semana}}</b>
                  <span [class.pending]="semana.estado==='pendiente'">{{
                    semana.estado==='pendiente' ? 'Pendiente' : 'Verificar en equipo'
                  }}</span>
                </div>
                <h4>{{semana.titulo}}</h4>
                <p *ngFor="let detalle of semana.observaciones">{{detalle}}</p>
                <details class="efsrt-week-activities" *ngIf="semana.actividades?.length">
                  <summary>Ver las {{semana.actividades.length}} actividades de la bitácora</summary>
                  <ol>
                    <li *ngFor="let actividad of semana.actividades">
                      <span>{{actividad.actividad}}</span>
                      <small>Evidencia: {{actividad.evidencia}} ·
                        {{actividad.estado==='programada_por_validar' ? 'Programada / no validada' : 'Requiere comprobación'}}
                      </small>
                    </li>
                  </ol>
                </details>
                <button type="button" (click)="cambiarSegcion(semana.destino)">Revisar función</button>
              </article>
            </div>
          </section>
          <div class="efsrt-table-wrap">
            <table class="efsrt-table">
              <thead><tr><th>Área del proyecto</th><th>Estructura</th><th>Registros</th><th>Faltantes</th><th>Acción</th></tr></thead>
              <tbody>
                <tr *ngFor="let modulo of revision.modulos">
                  <td><b>{{modulo.nombre}}</b></td>
                  <td><span class="efsrt-status" [class.missing]="modulo.estado!=='estructura_disponible'">
                    {{modulo.estado==='estructura_disponible' ? 'Disponible' : 'Incompleta'}}
                  </span></td>
                  <td>{{modulo.registros===null ? 'Sin tabla' : modulo.registros}}</td>
                  <td>{{modulo.faltantes.length ? modulo.faltantes.join(', ') : 'Ninguna'}}</td>
                  <td><button type="button" (click)="cambiarSegcion(modulo.destino)">Abrir módulo</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <section class="efsrt-issues">
            <h3>Coherencia de la base de datos</h3>
            <p *ngIf="!revision.alertas.length" class="efsrt-noproblems">No se detectaron duplicados, pagos sin membresía ni stock negativo en los controles aplicados.</p>
            <article *ngFor="let alerta of revision.alertas">
              <p><b>{{alerta.cantidad}}</b> · {{alerta.mensaje}}</p>
              <button type="button" (click)="cambiarSegcion(alerta.destino)">Revisar datos ›</button>
            </article>
          </section>
          <p class="efsrt-notice warn">La presencia de tablas no prueba por sí sola que todos los formularios funcionen. Para la evaluación hay que ejecutar altas, cambios, reservas, pagos, asistencia, pruebas y respaldos con el profesor.</p>
        </ng-container>
      </ng-container>

      <ng-container *ngIf="seccion==='mantenimiento-sistema'">
        <section class="mg-business-page">
          <header class="mg-business-head">
            <div><span>MANTENIMIENTO DEL SISTEMA</span><h2>Respaldo y mantenimiento técnico</h2><p>Herramientas para proteger la información y mantener el sistema estable.</p></div>
          </header>
          <section class="mg-maintenance-grid">
            <article class="mg-maintenance-card">
              <i>⇩</i><div><h3>Crear backup</h3><p>Descarga una copia SQL de la base de datos principal.</p></div>
              <button type="button" class="admin-primary" (click)="descargarBackupSistema()">Descargar backup</button>
            </article>
            <article class="mg-maintenance-card">
              <i>↻</i><div><h3>Limpiar caché</h3><p>Actualiza cachés internas sin eliminar información del gimnasio.</p></div>
              <button type="button" class="admin-secondary" (click)="limpiarCacheSistema()">Limpiar caché</button>
            </article>
            <article class="mg-maintenance-card">
              <i>⇧</i><div><h3>Restaurar backup</h3><p>Selecciona un archivo SQL generado previamente por Mallqui Gym.</p></div>
              <input type="file" accept=".sql" (change)="seleccionarBackupRestaurar($event)">
              <button type="button" class="admin-secondary" [disabled]="!backupRestaurarArchivo" (click)="restaurarBackupSistema()">Restaurar</button>
            </article>
          </section>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='seguimiento'">
        <section class="mg-follow-page">
          <header class="mg-follow-head">
            <div>
              <span>SEGUIMIENTO DE SOCIOS</span>
              <h2>Estado general de cada socio</h2>
              <p>Consulta membresía, asistencias y rutinas usando los datos reales registrados en el sistema.</p>
            </div>
            <button type="button" (click)="cargarSeguimiento()">↻ Actualizar</button>
          </header>

          <section class="mg-follow-kpis">
            <article><i>♚</i><div><small>Socios activos</small><b>{{clientesActivos}}</b></div></article>
            <article><i>✦</i><div><small>Membresías activas</small><b>{{dashboard?.membresias?.activas ?? 0}}</b></div></article>
            <article class="warning"><i>!</i><div><small>Por vencer</small><b>{{totalMembresiasPorVencerDashboard}}</b></div></article>
            <article><i>🏋</i><div><small>Rutinas activas</small><b>{{dashboard?.operacion?.rutinas_activas ?? rutinas.length}}</b></div></article>
          </section>

          <article class="mg-follow-table-card">
            <div class="mg-follow-table-head">
              <div><h3>Seguimiento individual</h3><p>{{clientes.length}} socios registrados</p></div>
              <button type="button" (click)="abrirNuevoSocioDesdeDashboard()">＋ Matricular socio</button>
            </div>
            <div class="table-wrap">
              <table class="management-table mg-follow-table">
                <thead>
                  <tr><th>Socio</th><th>Membresía</th><th>Vencimiento</th><th>Asistencias</th><th>Rutinas</th><th>Estado</th><th>Acción</th></tr>
                </thead>
                <tbody>
                  <tr *ngFor="let c of clientes">
                    <td><b>{{nombreCliente(c)}}</b><small>{{c.dni || 'Sin DNI'}}</small></td>
                    <td>{{membresiaSeguimiento(c)?.membresia?.nombre || 'Sin membresía'}}</td>
                    <td>
                      <span [class.mg-expiring]="esMembresiaPorVencer(c)">
                        {{membresiaSeguimiento(c)?.fecha_fin || '-'}}
                      </span>
                    </td>
                    <td><b>{{asistenciasClienteSeguimiento(c)}}</b></td>
                    <td><b>{{rutinasClienteSeguimiento(c)}}</b></td>
                    <td>
                      <span class="mg-follow-status" [class.warning]="esMembresiaPorVencer(c)" [class.danger]="!membresiaSeguimiento(c)">
                        {{estadoSeguimiento(c)}}
                      </span>
                    </td>
                    <td>
                      <button type="button" class="table-action" (click)="abrirFichaCliente(c.id_cliente)">Ver ficha</button>
                      <button type="button" class="admin-secondary" (click)="renovarDesdeSeguimiento(c)">Renovar</button>
                    </td>
                  </tr>
                  <tr *ngIf="!clientes.length"><td colspan="7">No hay socios registrados para seguimiento.</td></tr>
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </ng-container>

      <app-admin-applications
        *ngIf="['aplicaciones','calendario-admin','tareas-admin','tablas-admin','componentes-ui'].includes(seccion)"
        [modulo]="seccion"
        [clientes]="clientes"
        [productos]="productos"
        [reservas]="reservas"
        (navegar)="cambiarSegcion($event)"
        (refrescarDatos)="actualizarDashboardCompleto()">
      </app-admin-applications>

      <app-admin-gym-suite
        *ngIf="suiteModules.includes(seccion)"
        [modulo]="seccion">
      </app-admin-gym-suite>

      <ng-container *ngIf="seccion==='clientes'">
        <section class="clients-v3-shell" *ngIf="!clienteFormularioAbierto">
          <header class="clients-v3-hero">
            <div class="clients-v3-hero-copy">
              <span>GESTIÓN DE SOCIOS</span>
              <h2>Socios</h2>
              <p>Administra los datos, accesos y estado de tus miembros desde un solo lugar.</p>
            </div>
            <button type="button" class="clients-v3-new" (click)="nuevoCliente()">
              <span>＋</span>
              Agregar Socio
            </button>
          </header>

          <section class="clients-v3-stats">
            <article>
              <span class="clients-v3-stat-icon">♙</span>
              <div><small>TOTAL DE SOCIOS</small><b>{{clientes.length}}</b><p>registros en el sistema</p></div>
            </article>
            <article>
              <span class="clients-v3-stat-icon success">✓</span>
              <div><small>SOCIOS ACTIVOS</small><b>{{clientesActivos}}</b><p>pueden usar el servicio</p></div>
            </article>
            <article>
              <span class="clients-v3-stat-icon muted">–</span>
              <div><small>SOCIOS INACTIVOS</small><b>{{clientesInactivos}}</b><p>historial conservado</p></div>
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

        <section *ngIf="clienteFormularioAbierto" class="client-editor-workspace" aria-label="Formulario de registro de socio">
          <div class="client-editor-panel">
            <header class="client-editor-head">
              <div>
                <span>{{clienteEditandoId ? 'EDITAR MIEMBRO' : 'NUEVO MIEMBRO'}}</span>
                <h2>{{clienteEditandoId ? 'Actualizar cliente' : 'Registrar cliente'}}</h2>
                <p>{{clienteEditandoId ? 'Modifica la información y guarda los cambios.' : 'Completa los datos principales del nuevo miembro.'}}</p>
              </div>
              <button type="button" class="mg-back-to-members" (click)="cerrarFormularioCliente()" aria-label="Volver a la lista de socios">← Volver a socios</button>
            </header>

            <form #clienteNgForm="ngForm" class="client-editor-form" autocomplete="off" (ngSubmit)="guardarCliente()">
              <section class="client-editor-section">
                <div class="client-editor-section-title">
                  <span>1</span>
                  <div><b>Datos personales</b><small>Información principal del miembro</small></div>
                </div>

                <div class="client-editor-grid two">
                  <label>DNI
                    <input [(ngModel)]="clienteForm.dni" name="dni" required minlength="8" maxlength="8" inputmode="numeric" pattern="[0-9]{8}" autocomplete="off" placeholder="8 dígitos">
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
          </div>
        </section>
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
              <button class="admin-secondary" type="button" (click)="cambiarSegcion('planes')">Administrar tarifas</button>
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

      <ng-container *ngIf="seccion==='pagos'">
        <section class="admin-list-card">
          <div class="management-heading">
            <div>
              <h2>Historial de pagos de membresías</h2>
              <p>Los pagos digitales se registran automáticamente. Los pagos en efectivo quedan pendientes hasta ser confirmados en recepción.</p>
            </div>
            <span class="big-number">{{pagos.length}}</span>
          </div>
          <div *ngIf="comprobanteDatos && seccion==='pagos'" class="mg-receipt-preview" aria-live="polite">
            <strong>Constancia interna: {{comprobanteDatos.numero_comprobante}}</strong>
            <p>{{comprobanteDatos.cliente}} · {{comprobanteDatos.membresia}} · S/ {{comprobanteDatos.monto | number:'1.2-2'}}</p>
            <p>{{comprobanteDatos.nota_tributaria}}</p>
            <button type="button" class="admin-primary" (click)="imprimirComprobantePago()">Abrir / imprimir</button>
            <button type="button" class="admin-secondary" (click)="comprobanteDatos=null">Cerrar</button>
          </div>
          <div class="table-wrap"><table class="management-table"><thead><tr><th>ID</th><th>Cliente</th><th>Plan</th><th>Monto</th><th>Método</th><th>N° operación</th><th>Fecha</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
            <tr *ngFor="let p of pagos">
              <td>{{p.id_pago}}</td><td>{{clientePago(p)}}</td><td>{{planPago(p)}}</td><td>S/ {{p.monto | number:'1.2-2'}}</td><td>{{p.metodo_pago}}</td><td>{{p.numero_operacion || '-'}}</td><td>{{fecha(p.fecha_pago)}}</td><td>{{p.estado_pago}}</td>
              <td>
                <ng-container *ngIf="p.estado_pago==='Pendiente' && p.metodo_pago==='Efectivo'">
                  <button type="button" (click)="confirmarPagoEfectivo(p)">Confirmar</button>
                  <button type="button" (click)="rechazarPagoEfectivo(p)">Rechazar</button>
                </ng-container>
                <button *ngIf="p.estado_pago==='Completado'" type="button" class="table-action"
                  (click)="verComprobantePago(p)">Ver comprobante</button>
                <small *ngIf="p.estado_pago!=='Pendiente' && p.estado_pago!=='Completado'">Sin constancia</small>
              </td>
            </tr>
            <tr *ngIf="!pagos.length"><td colspan="9">No hay pagos registrados.</td></tr>
          </tbody></table></div>
        </section>
      </ng-container>

      <ng-container *ngIf="seccion==='entrenador'">
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

      <ng-container *ngIf="seccion==='asistencias' || seccion==='attendance-tools'">
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
              <button class="admin-primary" type="submit">Registrar compra ({{compraItems.length}} productos)</button>
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
                <select [(ngModel)]="ventaForm.id_cliente" name="vcliente" required>
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
          <article class="admin-form-card" *ngIf="!caja?.caja_abierta"><div class="management-heading"><div><h2>Abrir caja</h2><p>Necesaria para cobrar en efectivo.</p></div><span>$</span></div><form (ngSubmit)="abrirCaja()"><label>Monto inicial<input type="number" min="0" step="0.01" [(ngModel)]="cajaAbrirForm.monto_inicial" name="camonto"></label><label>Observación<input [(ngModel)]="cajaAbrirForm.observacion" name="caobs"></label><button class="admin-primary" type="submit">Abrir caja</button></form></article>
          <article class="admin-form-card" *ngIf="caja?.caja_abierta"><div class="management-heading"><div><h2>Caja abierta</h2><p>Monto esperado: S/ {{caja?.resumen?.monto_esperado ?? 0 | number:'1.2-2'}}</p></div><span>$</span></div><form (ngSubmit)="movimientoCaja()"><div class="form-row"><label>Tipo<select [(ngModel)]="movCajaForm.tipo" name="mctipo"><option>Ingreso</option><option>Egreso</option></select></label><label>Monto<input type="number" min="0.01" step="0.01" [(ngModel)]="movCajaForm.monto" name="mcmonto"></label></div><label>Descripción<input [(ngModel)]="movCajaForm.descripcion" name="mcdesc" required></label><button class="admin-primary" type="submit">Registrar movimiento</button></form><hr><form (ngSubmit)="cerrarCaja()"><label>Monto real contado<input type="number" min="0" step="0.01" [(ngModel)]="cajaCerrarForm.monto_real" name="ccmonto"></label><button class="admin-secondary" type="submit">Cerrar caja</button></form></article>
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

      <ng-container *ngIf="seccion==='planes'">
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
        <section class="operation-locked-main expense-fetch-note" *ngIf="cajaCargando">
          <h2>Consultando estado de caja</h2>
          <p>Revisando la caja actual y sus movimientos guardados en MySQL.</p>
        </section>
        <section class="operation-locked-main expense-fetch-note" *ngIf="!cajaCargando && cajaError">
          <small>NO SE PUDO CONSULTAR CAJA</small>
          <h2>Estado de caja sin verificar</h2>
          <p>{{cajaError}}. No se permite registrar egresos hasta confirmar el saldo.</p>
          <button type="button" class="admin-secondary" (click)="cargarCaja()">Volver a consultar</button>
        </section>
        <ng-container *ngIf="!cajaCargando && !cajaError">
          <section class="operation-locked-state" *ngIf="!caja?.caja_abierta; else gastosCajaAbierta">
            <div class="operation-locked-main">
              <span class="operation-locked-icon">▣</span>
              <small>{{cajaInconsistente ? 'REVISIÓN NECESARIA' : 'CAJA SIN APERTURA ACTIVA'}}</small>
              <h2>{{cajaInconsistente ? 'El historial y el estado actual no coinciden' : 'No hay caja abierta para registrar gastos'}}</h2>
              <p>{{cajaInconsistente ? 'El historial registra una caja abierta, pero la consulta de la caja actual no la encontró. Revisa Caja antes de mover dinero.' : 'Puedes revisar el historial. Para registrar un nuevo gasto primero debes abrir la caja en el módulo Caja.'}}</p>
              <button type="button" class="admin-primary" (click)="cambiarSegcion('caja')">
                {{cajaInconsistente ? 'Revisar estado de caja' : 'Abrir caja'}}
              </button>
            </div>
            <article class="operation-locked-side">
              <span>Última caja registrada</span>
              <ng-container *ngIf="historialCaja[0] as ultima; else sinHistorialCaja">
                <h3>{{etiquetaCaja(ultima)}}</h3>
                <p>{{ultima.estado || 'Sin estado registrado'}} · Apertura: {{fecha(ultima.fecha_apertura)}}</p>
                <div><small>Monto inicial</small><b>S/ {{ultima.monto_inicial ?? 0 | number:'1.2-2'}}</b></div>
                <div *ngIf="ultima.fecha_cierre && ultima.monto_real != null">
                  <small>Monto contado al cierre</small><b>S/ {{ultima.monto_real | number:'1.2-2'}}</b>
                </div>
                <p class="expense-no-close" *ngIf="!ultima.fecha_cierre">Esta caja no tiene cierre confirmado en el historial.</p>
              </ng-container>
              <ng-template #sinHistorialCaja>
                <h3>Sin cajas registradas</h3>
                <p>Al abrir la primera caja aparecerá aquí.</p>
              </ng-template>
            </article>
          </section>
          <section class="expense-history-card" *ngIf="!caja?.caja_abierta && historialCaja.length">
            <div class="management-heading">
              <div><h2>Historial reciente de caja</h2><p>Registros conservados en MySQL; consultar no modifica ningún movimiento.</p></div>
              <button type="button" class="admin-secondary" (click)="cambiarSegcion('caja')">Ver caja y movimientos</button>
            </div>
            <div class="table-wrap">
              <table class="management-table">
                <thead><tr><th>Caja</th><th>Apertura</th><th>Cierre</th><th>Estado</th><th>Monto inicial</th><th>Contado al cierre</th></tr></thead>
                <tbody>
                  <tr *ngFor="let fila of historialCaja.slice(0,5)">
                    <td>{{etiquetaCaja(fila)}}</td>
                    <td>{{fecha(fila.fecha_apertura)}}</td>
                    <td>{{fila.fecha_cierre ? fecha(fila.fecha_cierre) : 'Sin cierre'}}</td>
                    <td>{{fila.estado || 'Sin información'}}</td>
                    <td>S/ {{fila.monto_inicial ?? 0 | number:'1.2-2'}}</td>
                    <td>{{fila.fecha_cierre && fila.monto_real != null ? 'S/ ' + (fila.monto_real | number:'1.2-2') : 'Pendiente de cierre'}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          <ng-template #gastosCajaAbierta>
            <section class="management-grid">
              <article class="admin-form-card">
                <div class="management-heading">
                  <div>
                    <h2>Registrar gasto</h2>
                    <p>{{etiquetaCaja(caja?.caja)}} · saldo esperado S/ {{caja?.resumen?.monto_esperado ?? 0 | number:'1.2-2'}}</p>
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

      <ng-container *ngIf="seccion==='rutinas'">
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

              <div class="routine-profile-helper" *ngIf="!rutinaEditandoId">
                <div>
                  <strong>Preparar rutina según el perfil</strong>
                  <small *ngIf="clienteSeleccionadoRutina() as perfil">
                    Nivel: {{perfil.nivel_entrenamiento || 'Sin nivel definido'}} ·
                    Objetivo: {{perfil.enfoque_entrenamiento || 'General'}}
                  </small>
                  <small *ngIf="!clienteSeleccionadoRutina()">Selecciona un socio para usar su nivel y tipo de entrenamiento.</small>
                </div>
                <button type="button" class="admin-secondary"
                  [disabled]="!rutinaForm.id_cliente" (click)="prepararRutinaSegunPerfil()">
                  Sugerir ejercicios
                </button>
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
        <section class="management-grid">
          <article class="admin-form-card">
            <div class="management-heading">
              <div>
                <h2>{{reservaEditandoId ? 'Editar reserva' : 'Nueva reserva'}}</h2>
                <p>Valida socio, membresía, fecha, horario y cupos disponibles.</p>
              </div>
              <span>◫</span>
            </div>
            <form (ngSubmit)="guardarReservaAdmin()">
              <label>Socio
                <select name="resSocio" [(ngModel)]="reservaForm.id_cliente" required>
                  <option [ngValue]="0">Selecciona un socio</option>
                  <option *ngFor="let c of clientes" [ngValue]="c.id_cliente" [disabled]="c.estado!=='Activo'">
                    {{nombreCliente(c)}} · {{c.dni}}
                  </option>
                </select>
              </label>
              <label>Clase
                <select name="resClase" [(ngModel)]="reservaForm.id_clase" required>
                  <option [ngValue]="0">Selecciona una clase</option>
                  <option *ngFor="let c of clases" [ngValue]="c.id_clase" [disabled]="c.estado!=='Activo'">
                    {{c.nombre}} · {{c.dia_semana}} · {{c.hora_inicio}}
                  </option>
                </select>
              </label>
              <label>Fecha de la clase
                <input type="date" name="resFecha" [(ngModel)]="reservaForm.fecha_clase"
                  [min]="fechaMinimaReserva" required>
              </label>
              <p>Solo se permiten clases futuras, con membresía vigente y cupo disponible.</p>
              <div class="form-row">
                <button class="admin-primary" type="submit" [disabled]="reservaGuardando">
                  {{reservaGuardando ? 'Guardando...' : (reservaEditandoId ? 'Guardar cambios' : 'Registrar reserva')}}
                </button>
                <button *ngIf="reservaEditandoId" class="admin-secondary" type="button"
                  (click)="cancelarEdicionReservaAdmin()">Cancelar edición</button>
              </div>
            </form>
          </article>
          <article class="admin-list-card wide-card">
            <div class="management-heading"><div><h2>Reservas de clases</h2><p>Alta, consulta, edición y cancelación con historial.</p></div><span class="big-number">{{reservas.length}}</span></div>
            <div class="table-wrap"><table class="management-table">
              <thead><tr><th>ID</th><th>Socio</th><th>Clase</th><th>Fecha</th><th>Entrenador</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                <tr *ngFor="let r of reservas">
                  <td>{{r.id_reserva}}</td><td>{{nombreCliente(r.cliente)}}</td>
                  <td>{{r.clase?.nombre}}</td><td>{{r.fecha_clase | date:'dd/MM/yyyy'}}</td>
                  <td>{{nombreEntrenador(r.clase?.entrenador)}}</td><td>{{r.estado}}</td>
                  <td>
                    <button class="table-action" type="button" [disabled]="!reservaAdmiteCambioEstado(r)"
                      (click)="editarReservaAdmin(r)">Editar</button>
                    <button class="table-action" type="button" [disabled]="!reservaAdmiteCambioEstado(r)"
                      (click)="cambiarEstadoReserva(r.id_reserva,'Asistio')">Asistió</button>
                    <button class="admin-secondary" type="button" [disabled]="!reservaAdmiteCambioEstado(r)"
                      (click)="cambiarEstadoReserva(r.id_reserva,'NoAsistio')">No asistió</button>
                    <button class="table-danger" type="button" [disabled]="!reservaAdmiteCambioEstado(r)"
                      title="Cancelar sin eliminar el historial"
                      (click)="cancelarReservaAdmin(r)">Eliminar / cancelar</button>
                  </td>
                </tr>
                <tr *ngIf="!reservas.length"><td colspan="7">No hay reservas registradas.</td></tr>
              </tbody>
            </table></div>
          </article>
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
          <div class="management-heading"><div><h2>Próximos vencimientos</h2><p>Socios que requieren seguimiento para renovar su membresía.</p></div><button type="button" class="admin-secondary" (click)="cambiarSegcion('membresias')">Gestionar membresías</button></div>
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
            <div class="config-health" [class.ok]="configDisponible && configEstado?.mysql && configEstado?.operativo===true" [class.warning]="configEstado?.mysql && configEstado?.operativo!==true">
              <span></span>
              <div><b>{{estadoConfiguracionTexto}}</b><small>{{configEstado?.operativo===false ? 'Hay requisitos de estructura pendientes' : 'Consulta en Laravel y MySQL'}}</small></div>
            </div>
          </div>

          <div class="config-fetch-status" *ngIf="configCargando">
            Consultando la configuración del gimnasio desde MySQL...
          </div>
          <div class="config-fetch-status warning" *ngIf="!configCargando && !configDisponible" role="alert">
            <strong>No se pudo conectar con la configuración de MySQL</strong>
            <span>{{configError || 'El servidor todavía no entregó datos confirmados.'}}</span>
            <span>Las opciones siguen visibles para revisión, pero no se guardarán cambios hasta recuperar el servidor y su tabla de configuración.</span>
            <div class="config-recovery-actions">
              <button type="button" class="admin-secondary" (click)="cargarConfiguracion()">Reintentar conexión</button>
              <button type="button" class="admin-secondary" (click)="cambiarSegcion('verificacion-efsrt')">Revisar tablas del sistema</button>
            </div>
          </div>
          <ng-container *ngIf="!configCargando">
            <p class="config-source-info" *ngIf="configDisponible">
              Datos consultados desde MySQL. Comprueba que el contacto, los horarios y las tarifas correspondan al gimnasio.
              <span *ngIf="configUltimoGuardado">Última modificación: {{fecha(configUltimoGuardado)}}</span>
            </p>
            <p class="config-source-info warning" *ngIf="!configDisponible">
              Los campos están disponibles para inspección. No se presenta ninguna información como guardada ni se permiten cambios hasta recuperar MySQL.
            </p>
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
                <label>RUC del gimnasio (si está registrado)
                  <input [(ngModel)]="configuracionForm.ruc" name="cfg_ruc" inputmode="numeric" maxlength="11" pattern="[0-9]{11}" placeholder="11 dígitos">
                </label>
                <label>Teléfono
                  <input [(ngModel)]="configuracionForm.telefono" name="cfg_telefono" inputmode="tel" placeholder="Teléfono de contacto">
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
                <label>Tarifa diaria (S/)
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
                <div><span>02</span><div><h3>Horario de atención</h3><p>Horario general y excepciones de cada día, guardados en MySQL.</p></div></div>
              </div>
              <div class="config-time-grid">
                <label>Primera apertura habitual<input type="time" [(ngModel)]="configuracionForm.hora_apertura" name="cfg_apertura" required></label>
                <label>Último cierre habitual<input type="time" [(ngModel)]="configuracionForm.hora_cierre" name="cfg_cierre" required></label>
              </div>
              <div class="config-days">
                <button type="button" *ngFor="let dia of diasSemana"
                  [class.active]="configuracionForm.dias_atencion?.includes(dia)"
                  (click)="toggleDiaConfiguracion(dia)" [attr.aria-pressed]="configuracionForm.dias_atencion?.includes(dia)">
                  {{dia.substring(0,3)}}
                </button>
              </div>
              <p class="config-schedule-help">Selecciona los días de atención. Indica abajo descansos, horario del sábado y domingo u otros cambios: este detalle se muestra en el portal del cliente.</p>
              <label class="config-schedule-detail">Horario detallado por día y descansos
                <textarea [(ngModel)]="configuracionForm.horario_detalle" name="cfg_horario_detalle" rows="5" placeholder="Ej. Lunes a viernes 6:00-12:00 y 14:00-21:30; sábado 6:00-12:00..."></textarea>
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
                <div><span>04</span><div><h3>Notificaciones internas</h3><p>Preferencias guardadas para los módulos de avisos del gimnasio.</p></div></div>
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
              <div class="config-action-grid" aria-label="Accesos de seguridad administrativa">
                <button type="button" (click)="cambiarSegcion('usuarios')">Usuarios y permisos</button>
                <button type="button" (click)="cambiarSegcion('auditoria')">Historial de actividad</button>
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
                <button type="button" (click)="cambiarSegcion('mantenimiento-sistema')">Gestionar respaldos</button>
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
            <div class="config-action-grid" aria-label="Diagnóstico técnico">
              <button type="button" (click)="cambiarSegcion('verificacion-efsrt')">Diagnóstico avanzado</button>
            </div>
          </article>

          <div class="config-save-bar">
            <div><b>Configuración del negocio</b><small>Los cambios se confirman desde Laravel y se guardan en MySQL.</small></div>
            <button type="button" (click)="guardarConfiguracion()" [disabled]="configGuardando || !configDisponible">{{configGuardando ? 'Guardando...' : 'Guardar configuración en MySQL'}}</button>
          </div>
          </ng-container>
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

      </div>
      <footer class="cf-global-footer">© Mallqui Gym 2026</footer>
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
    .admin-request-context{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin:0 0 18px;padding:18px 20px;border:1px solid #dfe7c8;border-left:5px solid #647a2d;border-radius:16px;background:#f8fce9;box-shadow:0 10px 28px rgba(71,21,28,.06)}
    .admin-request-context>div{display:grid;gap:5px}.admin-request-context span{font-size:11px;font-weight:900;letter-spacing:.9px;color:#647a2d}.admin-request-context b{font-size:18px;color:#252a24}.admin-request-context p{margin:0;color:#687066}.admin-request-context small{color:#8a9087}
    .admin-request-context>button{border:0;background:#fff;color:#7e8992;width:34px;height:34px;border-radius:10px;cursor:pointer;font-size:22px;box-shadow:0 2px 10px rgba(0,0,0,.08)}
    .routine-management{grid-template-columns:minmax(0,1fr)!important;gap:18px!important}
    .routine-management>.routine-editor-card,.routine-management>.wide-card{grid-column:1/-1;width:100%;max-width:none;box-sizing:border-box}
    .routine-editor-card{overflow:visible!important;padding:24px!important}
    .routine-editor-card form{max-width:none!important}
    .routine-exercises-editor{display:grid;gap:14px;margin:18px 0;padding-top:18px;border-top:1px solid #e5e9df;min-width:0}.routine-exercises-editor>header{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap}.routine-exercises-editor>header>div{min-width:0;flex:1 1 420px}.routine-exercises-editor>header span{font-size:10px;font-weight:900;letter-spacing:.8px;color:#647a2d}.routine-exercises-editor>header h3{margin:3px 0}.routine-exercises-editor>header p{margin:0;color:#8a9087;font-size:12px}
    .routine-exercise-row{display:grid;grid-template-columns:34px minmax(0,1fr) auto;gap:12px;align-items:start;padding:16px;border:1px solid #e2e8ec;border-radius:14px;background:#fbfcfd;min-width:0}.routine-exercise-number{display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:#1f2a33;color:#fff;font-weight:900}.routine-exercise-fields{display:grid;gap:10px;min-width:0}.routine-exercise-grid{display:grid;grid-template-columns:repeat(4,minmax(120px,1fr));gap:12px;min-width:0}.routine-exercise-grid label{min-width:0}.routine-exercise-grid input{width:100%!important;min-width:0!important}.routine-remove{align-self:center}
    @media(max-width:1100px){.routine-exercise-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:650px){.routine-editor-card{padding:16px!important}.routine-exercise-row{grid-template-columns:30px minmax(0,1fr)}.routine-remove{grid-column:2;justify-self:start}.routine-exercise-grid{grid-template-columns:1fr}.routine-exercises-editor>header .admin-secondary{width:100%}}
    .feedback-admin-shell{display:grid;gap:18px}.feedback-admin-head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;padding:22px;border:1px solid #e5e9df;border-radius:18px;background:#fff}.feedback-admin-head span{font-size:10px;font-weight:900;letter-spacing:.9px;color:#647a2d}.feedback-admin-head h2{margin:5px 0}.feedback-admin-head p{margin:0;color:#8a9087}.feedback-admin-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.feedback-admin-kpis article{display:grid;gap:4px;padding:18px;border:1px solid #e5e9df;border-radius:16px;background:#fff}.feedback-admin-kpis small{font-weight:900;color:#7a8791}.feedback-admin-kpis b{font-size:28px}.feedback-admin-kpis span{font-size:12px;color:#8a9087}
    .feedback-admin-list{display:grid;gap:12px}.feedback-admin-list>article{display:grid;grid-template-columns:150px 1fr auto;gap:18px;align-items:center;padding:18px;border:1px solid #e5e9df;border-left:4px solid #647a2d;border-radius:16px;background:#fff}.feedback-admin-list>article.reviewed{border-left-color:#198754}.feedback-admin-rating{display:grid;gap:4px}.feedback-admin-rating span{font-size:18px;letter-spacing:1px;color:#d99800}.feedback-admin-rating small{color:#8a9087}.feedback-admin-copy small{color:#7a8791}.feedback-admin-copy h3{margin:4px 0}.feedback-admin-copy p{margin:0;color:#687066}.feedback-admin-actions{display:grid;justify-items:end;gap:9px}.feedback-admin-actions>span{padding:5px 9px;border-radius:999px;background:#f7f8f5;color:#687066;font-size:10px;font-weight:900}.feedback-admin-actions>span.done{background:#eef8f1;color:#187743}.feedback-admin-empty{display:grid;place-items:center;gap:5px;padding:40px;border:1px dashed #d4dce2;border-radius:16px;background:#fff;color:#8a9087}.feedback-admin-empty>span{font-size:28px}
    .trainer-single-layout{display:grid;grid-template-columns:minmax(360px,520px) minmax(0,1fr);gap:18px;margin-top:22px;align-items:start}
    .trainer-main-card{padding:24px;border:1px solid #e3e8ef;border-radius:16px;background:#fff;box-shadow:0 7px 24px rgba(12,32,60,.045)}
    .trainer-main-top{display:grid;grid-template-columns:58px minmax(0,1fr) auto;gap:14px;align-items:center}
    .trainer-main-avatar{width:58px;height:58px;border-radius:16px;display:grid;place-items:center;background:#111311;color:#fff;font-size:20px;font-weight:900}
    .trainer-main-top>div:nth-child(2)>span{font-size:9px;font-weight:900;letter-spacing:1px;color:#647a2d}.trainer-main-top h2{margin:3px 0;font-size:22px}.trainer-main-top p{margin:0;color:#6d7984}
    .trainer-main-status{padding:6px 10px;border-radius:999px;background:#eaf7ef;color:#16804a;font-size:9px;font-weight:900}.trainer-main-status.inactive{background:#fff0f1;color:#ba2433}
    .trainer-main-data{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:20px 0}.trainer-main-data article{display:grid;gap:4px;padding:13px;border:1px solid #e7ecf0;border-radius:12px;background:#fafcfd}.trainer-main-data small{font-size:8px;font-weight:900;color:#7d8994}.trainer-main-data b{font-size:11px;color:#2a2f28;overflow-wrap:anywhere}
    .trainer-main-note{display:flex;gap:10px;padding:14px;border-radius:12px;background:#f2f7fb}.trainer-main-note>span{display:grid;place-items:center;width:28px;height:28px;border-radius:9px;background:#e3f4ea;color:#16804a;font-weight:900}.trainer-main-note div{display:grid;gap:3px}.trainer-main-note b{font-size:10px}.trainer-main-note small{font-size:9px;color:#6f7d88}
    .trainer-edit-button{margin-top:16px;width:100%}.trainer-empty-card{min-height:260px;display:grid;place-items:center;align-content:center;text-align:center;color:#72808d}.trainer-empty-card>span{font-size:34px}.trainer-empty-card h2{margin:8px 0 4px;color:#252a24}.trainer-empty-card p{margin:0;max-width:420px}
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

    /* SIDEBAR_REFERENCIA_569574_2026_10_23 */
    .admin-home-redesign .cf-nav-section-label{
      padding:14px 10px 7px!important;
      color:#8f91a8!important;
      font-size:10px!important;
      font-weight:800!important;
      letter-spacing:.45px!important;
      text-transform:uppercase!important;
    }
    .admin-home-redesign .cf-nav-section-label-secondary{
      margin-top:8px!important;
      padding-top:16px!important;
      border-top:1px solid rgba(255,255,255,.055)!important;
    }
    .admin-home-redesign .crossfit-sidebar-nav>button{
      min-height:44px!important;
      border-radius:5px!important;
    }
    .admin-home-redesign .crossfit-sidebar-nav>button>span:nth-child(2){
      font-size:12.5px!important;
      font-weight:600!important;
    }
    .admin-home-redesign .cf-nav-group-head>i{
      margin-left:auto!important;
      font-size:14px!important;
      opacity:.8!important;
    }
    .admin-home-redesign .cf-nav-ui-list{
      padding-top:4px!important;
      padding-bottom:8px!important;
    }
    .admin-home-redesign .cf-nav-ui-list button{
      min-height:36px!important;
    }
    .admin-home-redesign .cf-nav-ui-list button>span:nth-child(2){
      font-size:11.5px!important;
    }


    /* NEW_UI_FINAL_PRIORITY_2026_11_07 */
    :host{display:block!important;background:#f5f6f2!important;color:#1b1e19!important}
    .admin-shell.admin-home-redesign{background:#f5f6f2!important;color:#1b1e19!important}
    .admin-shell.admin-home-redesign>.admin-content{background:#f5f6f2!important}

    .admin-shell.admin-home-redesign .admin-form-card,
    .admin-shell.admin-home-redesign .admin-list-card,
    .admin-shell.admin-home-redesign .trainer-main-card,
    .admin-shell.admin-home-redesign .report-panel,
    .admin-shell.admin-home-redesign .feedback-admin-head,
    .admin-shell.admin-home-redesign .feedback-admin-kpis article,
    .admin-shell.admin-home-redesign .feedback-admin-list>article,
    .admin-shell.admin-home-redesign .config-card,
    .admin-shell.admin-home-redesign .mg-business-card,
    .admin-shell.admin-home-redesign .mg-maintenance-card{
      border:1px solid #e5e9df!important;
      border-radius:10px!important;
      background:#fff!important;
      box-shadow:0 4px 16px rgba(24,29,20,.035)!important;
    }

    .admin-shell.admin-home-redesign .management-heading{
      margin-bottom:12px!important;padding-bottom:10px!important;border-bottom:1px solid #eef1ea!important;
    }
    .admin-shell.admin-home-redesign .management-heading h2,
    .admin-shell.admin-home-redesign .trainer-main-card h2,
    .admin-shell.admin-home-redesign .mg-business-card h3,
    .admin-shell.admin-home-redesign .config-card h3{
      color:#1d211c!important;font-size:13px!important;font-weight:800!important;
    }
    .admin-shell.admin-home-redesign .management-heading p,
    .admin-shell.admin-home-redesign .mg-business-card p,
    .admin-shell.admin-home-redesign .config-card p{
      color:#8a9087!important;font-size:12px!important;
    }
    .admin-shell.admin-home-redesign .management-heading>span,
    .admin-shell.admin-home-redesign .management-heading .big-number{
      min-width:32px!important;height:32px!important;display:grid!important;place-items:center!important;
      border-radius:8px!important;background:#effbd0!important;color:#5d7624!important;font-size:10px!important;font-weight:900!important;
    }

    .admin-shell.admin-home-redesign .admin-form-card input,
    .admin-shell.admin-home-redesign .admin-form-card select,
    .admin-shell.admin-home-redesign .admin-form-card textarea,
    .admin-shell.admin-home-redesign .mg-business-card input,
    .admin-shell.admin-home-redesign .mg-business-card select,
    .admin-shell.admin-home-redesign .mg-business-card textarea,
    .admin-shell.admin-home-redesign .config-card input,
    .admin-shell.admin-home-redesign .config-card select,
    .admin-shell.admin-home-redesign .config-card textarea{
      border:1px solid #dfe4da!important;border-radius:7px!important;background:#fbfcfa!important;color:#272b26!important;
      box-shadow:none!important;outline:none!important;
    }
    .admin-shell.admin-home-redesign .admin-form-card input,
    .admin-shell.admin-home-redesign .admin-form-card select,
    .admin-shell.admin-home-redesign .mg-business-card input,
    .admin-shell.admin-home-redesign .mg-business-card select,
    .admin-shell.admin-home-redesign .config-card input,
    .admin-shell.admin-home-redesign .config-card select{min-height:36px!important}
    .admin-shell.admin-home-redesign .admin-form-card input:focus,
    .admin-shell.admin-home-redesign .admin-form-card select:focus,
    .admin-shell.admin-home-redesign .admin-form-card textarea:focus,
    .admin-shell.admin-home-redesign .mg-business-card input:focus,
    .admin-shell.admin-home-redesign .mg-business-card select:focus,
    .admin-shell.admin-home-redesign .mg-business-card textarea:focus{
      border-color:#a7c94b!important;box-shadow:0 0 0 3px rgba(201,244,90,.16)!important;
    }

    .admin-shell.admin-home-redesign .admin-primary,
    .admin-shell.admin-home-redesign .config-save-bar button{
      border:1px solid #111311!important;border-radius:7px!important;background:#111311!important;color:#c9f45a!important;
      box-shadow:none!important;font-weight:800!important;
    }
    .admin-shell.admin-home-redesign .admin-secondary,
    .admin-shell.admin-home-redesign .table-action,
    .admin-shell.admin-home-redesign .config-secondary-button{
      border:1px solid #dde2d8!important;border-radius:7px!important;background:#fff!important;color:#40463e!important;
      box-shadow:none!important;font-weight:800!important;
    }
    .admin-shell.admin-home-redesign .table-danger{
      border:1px solid #efd8d3!important;border-radius:7px!important;background:#fff8f7!important;color:#a84a3b!important;
    }

    .admin-shell.admin-home-redesign .table-wrap{
      border:1px solid #e8ece4!important;border-radius:8px!important;background:#fff!important;overflow:auto!important;
    }
    .admin-shell.admin-home-redesign .management-table th{
      background:#f7f8f5!important;color:#7b8178!important;border-color:#e4e8df!important;
      font-size:11.5px!important;text-transform:uppercase!important;
    }
    .admin-shell.admin-home-redesign .management-table td{
      background:#fff!important;color:#444a42!important;border-color:#eef0eb!important;font-size:12px!important;
    }
    .admin-shell.admin-home-redesign .management-table tbody tr:hover td{background:#fbfdf7!important}
    .admin-shell.admin-home-redesign .management-table td b{color:#20241f!important}

    .admin-shell.admin-home-redesign .trainer-main-avatar,
    .admin-shell.admin-home-redesign .routine-exercise-number{
      background:#111311!important;color:#c9f45a!important;
    }
    .admin-shell.admin-home-redesign .trainer-main-top>div:nth-child(2)>span,
    .admin-shell.admin-home-redesign .routine-exercises-editor>header span,
    .admin-shell.admin-home-redesign .admin-request-context span,
    .admin-shell.admin-home-redesign .feedback-admin-head span{
      color:#647a2d!important;
    }
    .admin-shell.admin-home-redesign .trainer-main-status,
    .admin-shell.admin-home-redesign .feedback-admin-actions>span.done{
      background:#effbd0!important;color:#587221!important;
    }
    .admin-shell.admin-home-redesign .trainer-main-note,
    .admin-shell.admin-home-redesign .admin-request-context{
      background:#f8fce9!important;border-color:#dfe7c8!important;box-shadow:none!important;
    }
    .admin-shell.admin-home-redesign .admin-request-context{border-left:4px solid #c9f45a!important}

    .admin-shell.admin-home-redesign .feedback-admin-list>article{
      border-left:4px solid #c9f45a!important;border-radius:9px!important;
    }
    .admin-shell.admin-home-redesign .feedback-admin-list>article.reviewed{border-left-color:#91ad3c!important}

    .admin-shell.admin-home-redesign .config-hero,
    .admin-shell.admin-home-redesign .mg-business-head{
      border:1px solid #e5e9df!important;border-radius:10px!important;background:#fff!important;box-shadow:none!important;
    }
    .admin-shell.admin-home-redesign .config-eyebrow,
    .admin-shell.admin-home-redesign .mg-business-head>div>span{
      color:#647a2d!important;
    }

    .admin-shell.admin-home-redesign .status-active,
    .admin-shell.admin-home-redesign .status-paid,
    .admin-shell.admin-home-redesign .plan-pill{
      background:#effbd0!important;color:#587221!important;border-color:#dfe8c2!important;
    }

    @media(max-width:800px){
      .admin-shell.admin-home-redesign .management-grid,
      .admin-shell.admin-home-redesign .trainer-single-layout{grid-template-columns:1fr!important}
    }

    /* CURRENT_WORKSPACE_HARD_RESET_2026_11_07 */
    .admin-shell.admin-home-redesign .mg-current-workspace{
      min-width:0!important;
      display:block!important;
      color:#1d211c!important;
      background:transparent!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace>*{
      max-width:100%!important;
      box-sizing:border-box!important;
    }

    /* Socios: reemplaza por completo el hero azul/rojo antiguo. */
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-shell{gap:12px!important;padding-bottom:20px!important}
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-hero{
      min-height:auto!important;padding:16px 18px!important;border:1px solid #e5e9df!important;border-radius:10px!important;
      background:#fff!important;color:#1d211c!important;box-shadow:0 4px 16px rgba(24,29,20,.035)!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-hero:after{display:none!important}
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-hero-copy>span{
      color:#647a2d!important;font-size:7px!important;letter-spacing:1px!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-hero-copy h2{
      margin:4px 0!important;color:#1d211c!important;font-size:18px!important;letter-spacing:0!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-hero-copy p{
      color:#898f86!important;font-size:12px!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-new{
      min-height:36px!important;padding:0 12px!important;border:1px solid #111311!important;border-radius:7px!important;
      background:#111311!important;color:#c9f45a!important;font-size:12px!important;box-shadow:none!important;transform:none!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-stats{gap:9px!important}
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-stats article{
      min-height:74px!important;padding:12px!important;border:1px solid #e5e9df!important;border-radius:9px!important;background:#fff!important;box-shadow:none!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-stat-icon,
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-stat-icon.success,
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-stat-icon.muted{
      width:36px!important;height:36px!important;flex:0 0 36px!important;border-radius:8px!important;background:#effbd0!important;color:#5d7624!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-stats small{color:#898f86!important;font-size:7px!important}
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-stats b{color:#1d211c!important;font-size:17px!important}
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-stats p{color:#92988f!important;font-size:11.5px!important}
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-card{
      border:1px solid #e5e9df!important;border-radius:10px!important;background:#fff!important;box-shadow:0 4px 16px rgba(24,29,20,.035)!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-toolbar{
      padding:11px 12px!important;border-bottom:1px solid #eef1ea!important;background:#fff!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-search,
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-filter,
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-refresh{
      min-height:36px!important;border:1px solid #dfe4da!important;border-radius:7px!important;background:#fbfcfa!important;color:#50564e!important;box-shadow:none!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-search:focus-within{
      border-color:#a7c94b!important;box-shadow:0 0 0 3px rgba(201,244,90,.16)!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-table th{
      background:#f7f8f5!important;color:#7b8178!important;border-color:#e4e8df!important;font-size:11.5px!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-table td{
      color:#444a42!important;border-color:#eef0eb!important;font-size:12px!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-table tbody tr:hover{background:#fbfdf7!important}
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-person>span{
      border-radius:8px!important;background:#111311!important;color:#c9f45a!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-person b,
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-contact b,
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-dni{color:#282d27!important}
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-status{
      background:#effbd0!important;color:#587221!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-status i{background:#98b936!important}
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-actions .view,
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-actions .edit{
      border-color:#dde2d8!important;background:#fff!important;color:#41473f!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-actions .danger{
      border-color:#efd8d3!important;background:#fff8f7!important;color:#a84a3b!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .clients-v3-footer{
      background:#fafbf8!important;border-top:1px solid #eef1ea!important;
    }

    /* Editor de socio: mismo panel nuevo, sin cabecera azul. */
    .admin-shell.admin-home-redesign .mg-current-workspace .client-editor-backdrop,
    .admin-shell.admin-home-redesign .mg-current-workspace .client360-backdrop,
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-detail-overlay{
      background:rgba(10,12,9,.42)!important;backdrop-filter:blur(3px)!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .client-editor-panel,
    .admin-shell.admin-home-redesign .mg-current-workspace .client360-panel,
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-detail-panel{
      background:#f5f6f2!important;box-shadow:-18px 0 48px rgba(20,24,18,.18)!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .client-editor-head,
    .admin-shell.admin-home-redesign .mg-current-workspace .client360-head{
      padding:17px 18px!important;border:1px solid #e5e9df!important;border-radius:10px!important;
      background:#fff!important;color:#1d211c!important;box-shadow:none!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .client-editor-head>div>span,
    .admin-shell.admin-home-redesign .mg-current-workspace .client360-head span{
      color:#647a2d!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .client-editor-head h2,
    .admin-shell.admin-home-redesign .mg-current-workspace .client360-head h2{
      color:#1d211c!important;font-size:18px!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .client-editor-head p,
    .admin-shell.admin-home-redesign .mg-current-workspace .client360-head p{
      color:#898f86!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .client-editor-head>button,
    .admin-shell.admin-home-redesign .mg-current-workspace .client360-head>button{
      background:#f1f3ee!important;color:#5c6359!important;border:1px solid #e2e6dd!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .client-editor-section,
    .admin-shell.admin-home-redesign .mg-current-workspace .client360-kpis article,
    .admin-shell.admin-home-redesign .mg-current-workspace .client360-profile>article,
    .admin-shell.admin-home-redesign .mg-current-workspace .client360-history{
      border:1px solid #e5e9df!important;border-radius:9px!important;background:#fff!important;box-shadow:none!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .client360-kpis article>span{
      background:#effbd0!important;color:#5d7624!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .client360-kpis b,
    .admin-shell.admin-home-redesign .mg-current-workspace .client360-profile b,
    .admin-shell.admin-home-redesign .mg-current-workspace .client360-history b{color:#2a2f28!important}
    .admin-shell.admin-home-redesign .mg-current-workspace .client360-tabs button{
      border:1px solid #dde2d8!important;border-radius:7px!important;background:#fff!important;color:#555c52!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .client360-tabs button.active{
      border-color:#111311!important;background:#111311!important;color:#c9f45a!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .client360-history em{
      background:#effbd0!important;color:#587221!important;
    }

    /* Auditoría: elimina por completo la cabecera azul y botones rojos. */
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-page{gap:12px!important}
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-hero{
      min-height:auto!important;padding:16px 18px!important;border:1px solid #e5e9df!important;border-radius:10px!important;
      background:#fff!important;color:#1d211c!important;box-shadow:0 4px 16px rgba(24,29,20,.035)!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-hero:after{display:none!important}
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-eyebrow{color:#647a2d!important}
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-hero h2{color:#1d211c!important;font-size:18px!important}
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-hero p{color:#898f86!important}
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-export,
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-apply{
      border:1px solid #111311!important;border-radius:7px!important;background:#111311!important;color:#c9f45a!important;box-shadow:none!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-kpis article,
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-filter-card,
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-table-card{
      border:1px solid #e5e9df!important;border-radius:9px!important;background:#fff!important;box-shadow:none!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-kpi-icon.blue,
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-kpi-icon.violet,
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-kpi-icon.amber,
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-kpi-icon.red{
      background:#effbd0!important;color:#5d7624!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-kpis b,
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-filter-head h3,
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-table-head h3{color:#252a24!important}
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-filters input,
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-filters select{
      border-color:#dfe4da!important;border-radius:7px!important;background:#fbfcfa!important;color:#2c312b!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-filters input:focus,
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-filters select:focus{
      border-color:#a7c94b!important;box-shadow:0 0 0 3px rgba(201,244,90,.16)!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-table th{background:#f7f8f5!important;color:#7b8178!important}
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-table td{color:#444a42!important}
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-user>span{
      background:#111311!important;color:#c9f45a!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-detail-btn{
      background:#f1f3ee!important;color:#50574d!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .audit-pagination div button.active{
      background:#111311!important;border-color:#111311!important;color:#c9f45a!important;
    }

    /* Caja/gastos bloqueados y ventas: mismo lenguaje visual actual. */
    .admin-shell.admin-home-redesign .mg-current-workspace .operation-locked-main,
    .admin-shell.admin-home-redesign .mg-current-workspace .operation-locked-side,
    .admin-shell.admin-home-redesign .mg-current-workspace .sales-entry-help,
    .admin-shell.admin-home-redesign .mg-current-workspace .sales-cart-empty,
    .admin-shell.admin-home-redesign .mg-current-workspace .sales-totals>article{
      border:1px solid #e5e9df!important;border-radius:9px!important;background:#fff!important;box-shadow:none!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .operation-locked-icon,
    .admin-shell.admin-home-redesign .mg-current-workspace .sales-entry-help>span{
      background:#effbd0!important;color:#5d7624!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .operation-locked-main>small{color:#647a2d!important}
    .admin-shell.admin-home-redesign .mg-current-workspace .operation-locked-main h2,
    .admin-shell.admin-home-redesign .mg-current-workspace .operation-locked-side h3,
    .admin-shell.admin-home-redesign .mg-current-workspace .sales-cart-empty b,
    .admin-shell.admin-home-redesign .mg-current-workspace .sales-totals>article h2{color:#252a24!important}
    .admin-shell.admin-home-redesign .mg-current-workspace .operation-locked-main p,
    .admin-shell.admin-home-redesign .mg-current-workspace .operation-locked-side>p,
    .admin-shell.admin-home-redesign .mg-current-workspace .sales-cart-empty p{color:#888e85!important}
    .admin-shell.admin-home-redesign .mg-current-workspace .sales-totals>article.sales-total-main{
      border-color:#dfe8c2!important;background:#f8fce9!important;
    }
    .admin-shell.admin-home-redesign .mg-current-workspace .sales-totals>article.sales-total-main p,
    .admin-shell.admin-home-redesign .mg-current-workspace .sales-totals>article.sales-total-main h2{color:#587221!important}

    /* Navegación móvil también deja el azul/rojo viejo. */
    @media(max-width:850px){
      .admin-shell.admin-home-redesign .admin-mobile-modules{
        border-color:#e5e9df!important;border-radius:10px!important;background:#fff!important;box-shadow:none!important;
      }
      .admin-shell.admin-home-redesign .admin-mobile-modules button{
        border-radius:7px!important;background:#f7f8f5!important;color:#687066!important;
      }
      .admin-shell.admin-home-redesign .admin-mobile-modules button.active{
        border-color:#111311!important;background:#111311!important;color:#c9f45a!important;
      }
      .admin-shell.admin-home-redesign .admin-mobile-modules button>i{
        background:#c9f45a!important;color:#111311!important;
      }
    }
  `]
})
export class AdminIntegradoComponent implements OnInit, OnDestroy {
  @Input() seccionInicial = 'dashboard';
  seccion = 'dashboard';
  toast = '';
  error = '';
  dashboard: any = null;
  herramientasAvanzadasAbiertas = false;
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
  reservaEditandoId = 0;
  reservaGuardando = false;
  reservaForm: any = {id_cliente:0,id_clase:0,fecha_clase:''};
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
  cajaCargando = false;
  cajaError = '';
  historialCaja: any[] = [];
  progresoClienteId = 0;
  progresoDatos: any = null;
  medidaForm:any = {peso:null,grasa:null,cintura:null,brazo:null,fecha:new Date().toISOString().slice(0,10)};
  renovacionesDias = 7;
  renovacionesLista:any[] = [];
  documentoClienteId = 0;
  documentoPagoId = 0;
  carnetDatos:any = null;
  comprobanteDatos:any = null;
  backupRestaurarArchivo:File|null = null;
  verificacionEfsrt:any = null;
  verificacionEfsrtCargando = false;
  verificacionEfsrtError = '';
  private fotosDemoInicioIntentadas = false;

  dias = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  titulos: Record<string,[string,string]> = {
    'verificacion-efsrt':['Comprobación EFSRT','Estructura y coherencia de datos reales'],
    dashboard:['Panel Administrador','Datos reales del gimnasio'],
    catalogo:['Todas las funciones','Encuentra los módulos complementarios del gimnasio'],
    aplicaciones:['Aplicaciones','Accesos y módulos del gimnasio'],
    'calendario-admin':['Calendario operativo','Eventos y reservas reales'],
    'tareas-admin':['Tablero de tareas','Tareas y pendientes del equipo'],
    'tablas-admin':['Tablas avanzadas','Búsqueda, filtros y exportación de datos'],
    'componentes-ui':['Componentes UI','Ejemplos interactivos de formularios y controles'],
    clientes:['Socios','Registro y administración de socios'],
    membresias:['Membresías','Asignación, renovación y vigencia de socios'], pagos:['Pagos','Pagos de membresías y compras de socios'],
    planes:['Planes y Precios','Precios, duración y beneficios de membresía'],
    gastos:['Gastos','Registro de egresos de la caja activa'],
    inventario:['Inventario','Productos, stock y control del inventario'],
    kardex:['Kardex y stock','Ajustes manuales y trazabilidad de movimientos de inventario'],
    'historial-ventas':['Historial de Ventas','Consulta de todas las ventas registradas'],
    'reporte-asistencias':['Reporte de Asistencias','Resumen y detalle de asistencias registradas'],
    entrenador:['Entrenadores','Administración del entrenador principal'], clases:['Clases','Programación, horarios y cupos'],
    asistencias:['Asistencias','Control de entradas y salidas'], rutinas:['Rutinas de Entrenamiento','Asignación, ejercicios y seguimiento de rutinas de los socios'], seguimiento:['Seguimiento de Socios','Membresía, asistencia y rutinas por socio'], 'progreso-fisico':['Progreso Físico','Medidas y evolución del socio'], renovaciones:['Renovaciones y Avisos','Vencimientos y comunicación con socios'], 'documentos-socio':['Documentos del Socio','Carnet y comprobantes'], 'mantenimiento-sistema':['Mantenimiento del Sistema','Backups y tareas técnicas'],
    reservas:['Reservas','Reservas creadas desde el portal y control de asistencia'], categorias:['Categorías','Clasificación de productos'],
    productos:['Productos','Registro, precios y control de stock'], proveedores:['Proveedores','Proveedores de productos'],
    compras:['Compras','Ingreso de productos e inventario'], ventas:['Ventas','Ventas de productos y stock'],
    caja:['Caja','Apertura, movimientos y cierre'],
    reportes:['Reportes','Indicadores de rendimiento del gimnasio'], 'reportes-admin':['Reportes Administrativos','Indicadores generales de operación, ventas, socios y asistencia'], usuarios:['Usuarios','Cuentas internas y permisos'],
    comunicacion:['Notificaciones','Avisos que reciben los clientes en su portal'], soporte:['Soporte','Consultas y solicitudes enviadas desde el portal del cliente'],
    opiniones:['Opiniones','Comentarios y calificaciones enviadas desde el portal del cliente'],
    auditoria:['Auditoría','Historial de acciones, usuarios, rutas y resultados del sistema'],
    configuracion:['Configuración','Ajustes generales y mantenimiento del sistema'],
    nutricion:['Nutrición','Planes de alimentación y seguimiento nutricional de los socios'],
    equipos:['Equipos','Máquinas, mantenimiento y estado operativo'],
    eventos:['Eventos del Gimnasio','Actividades, campañas y eventos internos'],
    galeria:['Galería','Contenido visual y fotografías del gimnasio'],
    noticias:['Noticias y Novedades','Anuncios, promociones y novedades del gimnasio'],
    salarios:['Salarios','Remuneraciones y pagos del personal'],
    ingresos:['Ingresos','Ingresos adicionales y conceptos financieros'],
    facturas:['Facturas','Comprobantes, montos y estados de pago']
  };

  sidebarCerrado = false;
  actualizandoDatos = false;
  ultimaActualizacion = '';
  ultimaActualizacionTs = 0;
  dashboardCargando = false;
  dashboardError = '';
  estadoOperativoDashboard: any = null;
  erroresSincronizacion: string[] = [];
  autoRefreshActivo = true;
  busquedaAdmin = '';
  nutricionPreview: any[] = [];
  suiteModules = ['nutricion','equipos','eventos','galeria','noticias','salarios','ingresos','facturas'];
  modulosConVistaPropia = [
    'dashboard','catalogo','aplicaciones','calendario-admin','tareas-admin','tablas-admin','componentes-ui','clientes','membresias','pagos','entrenador','clases','asistencias','seguimiento','progreso-fisico','renovaciones','documentos-socio','mantenimiento-sistema',
    'rutinas','reservas','caja','ventas','historial-ventas','gastos','inventario','productos','kardex',
    'proveedores','compras','categorias','reportes-admin','reporte-asistencias','usuarios',
    'auditoria','configuracion','opiniones'
  ];
  /** Orden de navegación según TEC-SGI-2026, adaptado al gimnasio:
   * Inicio -> acción principal -> gestión operativa -> administración
   * -> extras opcionales. Conserva cada ruta funcional una sola vez.
   */
  readonly menuPrincipal: Array<{
    id:string; titulo:string; icono:string;
    items:Array<{id:string;nombre:string;accion?:'nuevoSocio'}>
  }> = [
    {id:'members',titulo:'Socios y pagos',icono:'♙',items:[
      {id:'clientes',nombre:'Socios'},
      {id:'membresias',nombre:'Membresías'},
      {id:'pagos',nombre:'Pagos'},
      {id:'renovaciones',nombre:'Vencimientos'}
    ]},
    {id:'training',titulo:'Entrenamiento',icono:'✦',items:[
      {id:'reservas',nombre:'Reservas'},
      {id:'asistencias',nombre:'Asistencia'},
      {id:'rutinas',nombre:'Rutinas'},
      {id:'seguimiento',nombre:'Seguimiento'},
      {id:'entrenador',nombre:'Entrenador'}
    ]},
    {id:'operations',titulo:'Productos y ventas',icono:'▦',items:[
      {id:'productos',nombre:'Productos'},
      {id:'ventas',nombre:'Ventas'},
      {id:'compras',nombre:'Compras'},
      {id:'caja',nombre:'Caja'}
    ]},
    {id:'menu',titulo:'Administración',icono:'⚙',items:[
      {id:'reportes-admin',nombre:'Reportes'},
      {id:'reporte-asistencias',nombre:'Reporte de asistencia'},
      {id:'usuarios',nombre:'Usuarios'},
      {id:'configuracion',nombre:'Configuración'}
    ]},
    {id:'apps',titulo:'Más funciones (opcional)',icono:'⊞',items:[
      {id:'planes',nombre:'Planes y tarifas'},
      {id:'documentos-socio',nombre:'Documentos del socio'},
      {id:'progreso-fisico',nombre:'Progreso físico'},
      {id:'clases',nombre:'Clases'},
      {id:'nutricion',nombre:'Nutrición'},
      {id:'inventario',nombre:'Ajustes de inventario'},
      {id:'categorias',nombre:'Categorías'},
      {id:'proveedores',nombre:'Proveedores'},
      {id:'historial-ventas',nombre:'Historial de ventas'},
      {id:'kardex',nombre:'Kardex'},
      {id:'gastos',nombre:'Gastos'},
      {id:'ingresos',nombre:'Ingresos'},
      {id:'facturas',nombre:'Facturación interna'},
      {id:'salarios',nombre:'Salarios'},
      {id:'soporte',nombre:'Soporte'},
      {id:'comunicacion',nombre:'Notificaciones a socios'},
      {id:'opiniones',nombre:'Opiniones'},
      {id:'aplicaciones',nombre:'Aplicaciones'},
      {id:'calendario-admin',nombre:'Calendario'},
      {id:'tareas-admin',nombre:'Tareas'},
      {id:'tablas-admin',nombre:'Tablas'},
      {id:'componentes-ui',nombre:'Componentes'},
      {id:'equipos',nombre:'Equipos'},
      {id:'eventos',nombre:'Eventos'},
      {id:'galeria',nombre:'Galería'},
      {id:'noticias',nombre:'Noticias'}
    ]}
  ];

  // El panel muestra tendencias reales sin obligar a abrir opciones ocultas.
  mostrarGraficosDashboard = true;
  navGroups: Record<string, boolean> = {members:false, training:false, operations:false, menu:false};
  readonly categoriasMenuOpcional: Array<{id:string;nombre:string;items:string[]}> = [
    {id:'personas',nombre:'Socios y actividades',items:['planes','documentos-socio','progreso-fisico','clases','nutricion']},
    {id:'inventario',nombre:'Inventario y finanzas',items:['inventario','categorias','proveedores','historial-ventas','kardex','gastos','ingresos','facturas','salarios']},
    {id:'contacto',nombre:'Atención y comunidad',items:['soporte','comunicacion','opiniones','equipos','eventos','galeria','noticias']},
    {id:'herramientas',nombre:'Herramientas avanzadas',items:['aplicaciones','calendario-admin','tareas-admin','tablas-admin','componentes-ui']}
  ];
  grupoOpcionalAbierto = '';

  get esModuloAdicionalActivo(): boolean {
    return this.menuPrincipal.some(grupo =>
      grupo.id === 'apps' && grupo.items.some(item => item.id === this.seccion));
  }

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
  configCargando = false;
  configDisponible = false;
  configError = '';
  configUltimoGuardado = '';
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
  clienteForm: any = {dni:'',nombres:'',apellidos:'',telefono:'',correo:'',direccion:'',estado:'Activo',crear_acceso:true,nombre_usuario:'',contrasena:''};
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

  constructor(public auth: AuthService, private api: AdminApiService, private router: Router, @Optional() private route?: ActivatedRoute) {}

  ngOnInit(): void {
    // Las rutas directas /productos, /pagos, /reservas, etc. deben abrir su módulo,
    // no volver al resumen por defecto.
    this.seccion = this.normalizarSegcion(this.route?.snapshot?.data?.['seccion'] || this.seccionInicial || 'dashboard');
    this.activarGrupoDeSeccion(this.seccion);
    try{
      this.sidebarCerrado = localStorage.getItem('mallqui_admin_sidebar_closed') === '1';
      this.autoRefreshActivo = localStorage.getItem('mallqui_admin_auto_refresh') !== '0';
      const tema=localStorage.getItem('mallqui_mantis_tema');
      const color=localStorage.getItem('mallqui_mantis_color');
      const densidad=localStorage.getItem('mallqui_mantis_densidad');
      if(tema==='claro'||tema==='oscuro') this.modoDashboard=tema;
      // Mantis es referencia de módulos, NO autorización para sustituir los colores
      // que se eligieron para Mallqui Gym (blanco, negro y verde lima).
      // La versión anterior forzaba el azul en la primera apertura.
      // Revertir esa imposición solo una vez; respetar elecciones posteriores.
      const reparado=localStorage.getItem('mallqui_palette_restored_20261109')==='1';
      const azulImpuesto=localStorage.getItem('mallqui_mantis_reference_v1')==='1' && color==='azul';
      if(!reparado && azulImpuesto){
        this.acentoDashboard='verde';
        localStorage.setItem('mallqui_mantis_color','verde');
      }else if(color==='coral'||color==='azul'||color==='verde'){
        this.acentoDashboard=color;
      }
      if(!reparado)localStorage.setItem('mallqui_palette_restored_20261109','1');
      if(densidad==='normal'||densidad==='compacta') this.densidadDashboard=densidad;
    }catch{
      this.sidebarCerrado = false;
      this.autoRefreshActivo = true;
    }
    this.actualizarDashboardCompleto();
    if (this.seccion !== 'dashboard') this.cargarSegcion(this.seccion);

    // Refresco inteligente: no interrumpe formularios ni trabaja cuando la pestaña está oculta.
    this.autoRefreshId = setInterval(() => {
      if (this.autoRefreshActivo && !document.hidden && !this.actualizandoDatos && this.puedeAutoActualizar) {
        this.actualizarSegcionActual(true);
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
      {claves:['matricular','matricula','nuevo socio','registrar socio'],seccion:'clientes'},
      {claves:['seguimiento','seguimiento socio','seguimiento socios'],seccion:'seguimiento'},
      {claves:['socio','socios','cliente','clientes','miembro','miembros'],seccion:'clientes'},
      {claves:['membresia','membresias'],seccion:'membresias'},
      {claves:['pago','pagos'],seccion:'pagos'},
      {claves:['asistencia','asistencias','entrada','salida','control de acceso'],seccion:'asistencias'},
      {claves:['tarifa','tarifas','plan','planes'],seccion:'planes'},
      {claves:['clase','clases'],seccion:'clases'},
      {claves:['reserva','reservas','agenda'],seccion:'reservas'},
      {claves:['rutina','rutinas'],seccion:'rutinas'},
      {claves:['nutricion','alimentacion','alimentación'],seccion:'nutricion'},
      {claves:['entrenador','entrenadores'],seccion:'entrenador'},
      {claves:['trainer profile','perfil entrenador'],seccion:'entrenador'},
      {claves:['sports components','componentes deportivos','fitness widgets'],seccion:'seguimiento'},
      {claves:['caja','apertura','cierre'],seccion:'caja'},
      {claves:['venta','ventas','punto de venta'],seccion:'ventas'},
      {claves:['gasto','gastos','egreso','egresos'],seccion:'gastos'},
      {claves:['compra','compras'],seccion:'compras'},
      {claves:['proveedor','proveedores'],seccion:'proveedores'},
      {claves:['kardex','movimiento inventario'],seccion:'kardex'},
      {claves:['categoria','categorias'],seccion:'categorias'},
      {claves:['producto','productos','inventario','stock'],seccion:'productos'},
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
      {claves:['members list','lista socios','lista miembros'],seccion:'clientes'},
      {claves:['add member','agregar socio','nuevo socio'],seccion:'clientes'},
      {claves:['edit member','editar socio','editar miembro'],seccion:'clientes'},
      {claves:['invoices list','lista facturas'],seccion:'facturas'},
      {claves:['add invoice','agregar factura','nueva factura'],seccion:'facturas'},
      {claves:['edit invoice','editar factura'],seccion:'facturas'},
      {claves:['tables','tabla','tablas'],seccion:'tablas-admin'},
      {claves:['data table','datatable','filtros tabla'],seccion:'tablas-admin'},
      {claves:['graph','graphs','graficos','gráficos'],seccion:'reportes-admin'},
      {claves:['apex','apex charts'],seccion:'reportes-admin'},
      {claves:['morris','morris charts'],seccion:'reportes-admin'},
      {claves:['mapa','maps','vector maps'],seccion:'dashboard'},
      {claves:['accordion','accordions'],seccion:'dashboard'},
      {claves:['carousel','carrusel'],seccion:'dashboard'},
      {claves:['modal','modals'],seccion:'dashboard'},
      {claves:['popover','popovers'],seccion:'dashboard'},
      {claves:['tabs','pestañas'],seccion:'dashboard'},
      {claves:['tooltip','tooltips'],seccion:'dashboard'},
      {claves:['forms','formularios'],seccion:'configuracion'},
      {claves:['inputs','form inputs'],seccion:'configuracion'},
      {claves:['checkbox','radio'],seccion:'configuracion'},
      {claves:['archivo','file input','upload'],seccion:'mantenimiento-sistema'},
      {claves:['validacion','validaciones'],seccion:'configuracion'},
      {claves:['fecha hora','date time'],seccion:'configuracion'},
      {claves:['input mask','mascaras'],seccion:'configuracion'},
      {claves:['tags','etiquetas'],seccion:'configuracion'},
      {claves:['alerts','alertas'],seccion:'comunicacion'},
      {claves:['avatars','avatares'],seccion:'usuarios'},
      {claves:['badges','insignias'],seccion:'usuarios'},
      {claves:['buttons','botones'],seccion:'configuracion'},
      {claves:['cards','tarjetas'],seccion:'dashboard'},
      {claves:['dropdown','desplegable'],seccion:'configuracion'},
      {claves:['progress','progreso'],seccion:'seguimiento'},
      {claves:['icons','iconos'],seccion:'configuracion'},
      {claves:['account settings','cuenta'],seccion:'configuracion'},
      {claves:['my profile','perfil'],seccion:'configuracion'},
      {claves:['contact','contacto'],seccion:'soporte'},
      {claves:['typography','tipografia'],seccion:'configuracion'},
      {claves:['login signup','autenticacion'],seccion:'configuracion'},
      {claves:['404','page not found'],seccion:'dashboard'},
      {claves:['maintenance','mantenimiento'],seccion:'mantenimiento-sistema'},
      {claves:['configuracion','sistema','ajustes'],seccion:'configuracion'},
      {claves:['dashboard','inicio','panel'],seccion:'dashboard'}
    ];

    const encontrado=destinos.find(x=>x.claves.some(k=>q.includes(k)));
    if(encontrado){
      this.cambiarSegcion(encontrado.seccion);
      this.busquedaAdmin='';
      return;
    }

    this.error='No encontré esa función. Prueba con socios, reservas, caja, ventas, inventario, reportes o sistema.';
  }

  navegarMenu(item:{id:string;nombre:string;accion?:'nuevoSocio'}):void{
    if(item.accion==='nuevoSocio'){
      this.abrirNuevoSocioDesdeDashboard();
      return;
    }
    this.cambiarSegcion(item.id);
  }

  /** Muestra únicamente los accesos del área seleccionada. */
  private activarGrupoDeSeccion(seccion:string):void{
    const grupo=this.menuPrincipal.find(g=>g.id!=='apps' && g.items.some(i=>i.id===seccion && !i.accion));
    Object.keys(this.navGroups).forEach(id=>this.navGroups[id]=false);
    if(grupo)this.navGroups[grupo.id]=true;
  }

  toggleNavGroup(group:string):void{
    if(this.sidebarCerrado){
      this.sidebarCerrado=false;
      try{localStorage.setItem('mallqui_admin_sidebar_closed','0');}catch{}
    }
    const abrir=!this.navGroups[group];
    Object.keys(this.navGroups).forEach(id=>this.navGroups[id]=false);
    this.navGroups[group]=abrir;
  }

  toggleSidebar(): void {
    this.sidebarCerrado = !this.sidebarCerrado;
    try{localStorage.setItem('mallqui_admin_sidebar_closed', this.sidebarCerrado ? '1' : '0');}catch{}
  }

  get etiquetaModuloActual():string{
    const mapa:any={
      clientes:'GESTIÓN DE SOCIOS',membresias:'MEMBRESÍAS',renovaciones:'RENOVACIONES Y AVISOS',pagos:'PAGOS Y COBROS',
      asistencias:'CONTROL DE ASISTENCIA','reporte-asistencias':'REPORTE DE ASISTENCIA',
      entrenador:'EQUIPO DE ENTRENADORES',clases:'CLASES DEL GIMNASIO',reservas:'RESERVAS',rutinas:'RUTINAS',seguimiento:'SEGUIMIENTO', 'progreso-fisico':'PROGRESO FÍSICO',nutricion:'NUTRICIÓN',
      planes:'PLANES Y PRECIOS',ventas:'VENTAS', 'historial-ventas':'HISTORIAL DE VENTAS',
      caja:'CONTROL DE CAJA',gastos:'GASTOS',inventario:'INVENTARIO',productos:'PRODUCTOS',
      kardex:'MOVIMIENTOS DE STOCK',categorias:'CATEGORÍAS',proveedores:'PROVEEDORES',
      compras:'COMPRAS',equipos:'EQUIPOS DEL GIMNASIO',eventos:'EVENTOS',galeria:'GALERÍA',
      noticias:'NOTICIAS',salarios:'SALARIOS',ingresos:'INGRESOS',facturas:'FACTURACIÓN',
      soporte:'ATENCIÓN AL CLIENTE',opiniones:'OPINIONES',comunicacion:'COMUNICACIÓN',
      usuarios:'USUARIOS',auditoria:'AUDITORÍA',configuracion:'CONFIGURACIÓN','documentos-socio':'DOCUMENTOS DEL SOCIO','mantenimiento-sistema':'MANTENIMIENTO DEL SISTEMA','reportes-admin':'REPORTES ADMINISTRATIVOS'
    };
    return mapa[this.seccion]||'MALLQUI GYM';
  }

  get estadoModuloActual():string{
    if(this.seccion==='configuracion')return this.estadoConfiguracionTexto;
    if(['caja','gastos'].includes(this.seccion))return this.cajaCargando?'Consultando caja':this.cajaError?'Caja sin verificar':this.caja?.caja_abierta?'Caja abierta':'Caja sin apertura activa';
    if(['inventario','productos','kardex'].includes(this.seccion)) return (this.dashboard?.inventario?.productos_stock_bajo||0)+' alertas de stock';
    if(['pagos','ventas','ingresos','facturas','salarios','gastos'].includes(this.seccion)) return 'Control financiero';
    if(['clientes','membresias','asistencias','entrenador','clases','reservas','planes'].includes(this.seccion)) return 'Gestión activa';
    return this.estadoOperativoDashboard?.operativo===true?'Sistema verificado'
      :this.estadoOperativoDashboard?.database===true?'MySQL conectado · esquema pendiente':'Estado sin verificar';
  }

  get tituloActual(): string { return this.titulos[this.seccion]?.[0] ?? 'Administrador'; }
  get subtituloActual(): string { return this.titulos[this.seccion]?.[1] ?? ''; }
  get esSegcionSociosSegundaria(): boolean {
    return ['clientes','membresias','asistencias','pagos'].includes(this.seccion);
  }
  get esSegcionServiciosSegundaria(): boolean {
    return ['reservas','rutinas','clases'].includes(this.seccion);
  }
  get esSegcionAtencionSegundaria(): boolean {
    return ['soporte','opiniones','comunicacion'].includes(this.seccion);
  }
  get esSegcionGestionSegundaria(): boolean {
    return ['entrenador','planes','gastos','reportes','reporte-asistencias','usuarios','auditoria','configuracion','caja','ventas','historial-ventas','inventario','kardex','proveedores','compras','categorias','productos','nutricion','equipos','eventos','galeria','noticias','salarios','ingresos','facturas'].includes(this.seccion);
  }

  get puedeAutoActualizar(): boolean {
    return this.seccion === 'dashboard';
  }

  get datosDesactualizados(): boolean {
    return Boolean(this.ultimaActualizacionTs) && (Date.now()-this.ultimaActualizacionTs)>60000;
  }

  private normalizarSegcion(id:string):string{
    if(id==='reportes' || id==='reportes-legacy') return 'reportes-admin';
    if(id==='pagos-admin' || id==='pagos-legacy') return 'pagos';
    if(id==='entrenador-admin' || id==='entrenador-legacy') return 'entrenador';
    if(id==='planes-admin' || id==='planes-legacy') return 'planes';
    if(id==='rutinas-admin' || id==='rutinas-legacy') return 'rutinas';
    if(id==='asistencias-legacy') return 'asistencias';
    if(id==='nutricion-legacy') return 'nutricion';
    if(['members-list','members-cards','add-member','edit-member','edit-member-details'].includes(id)) return 'clientes';
    if(id==='trainer-profile') return 'entrenador';
    if(id==='sports-components') return 'seguimiento';
    if(['invoices-list','invoice-details','add-invoice','create-invoice','edit-invoice'].includes(id)) return 'facturas';
    if(id==='expenses') return 'gastos';
    if(id==='payslip') return 'salarios';
    if(['account-settings','my-profile'].includes(id)) return 'configuracion';
    if(id==='socios-hub') return 'clientes';
    if(id==='servicios') return 'clases';
    if(id==='atencion') return 'soporte';
    if(id==='gestion') return 'caja';
    const validas=[
      'dashboard','aplicaciones','calendario-admin','tareas-admin','tablas-admin','componentes-ui','clientes','membresias','renovaciones','pagos','planes','documentos-socio',
      'clases','reservas','rutinas','seguimiento','progreso-fisico','nutricion','asistencias','reporte-asistencias','entrenador',
      'caja','ventas','historial-ventas','gastos','compras',
      'inventario','productos','categorias','proveedores','kardex','equipos',
      'eventos','galeria','noticias','soporte','opiniones','comunicacion',
      'ingresos','facturas','salarios','reportes-admin','usuarios','auditoria','configuracion','mantenimiento-sistema','verificacion-efsrt'
    ];
    return validas.includes(id) ? id : 'dashboard';
  }

  get moduloActivo():string{
    const s=this.seccion;
    if(s==='dashboard') return 'dashboard';
    if(['aplicaciones','calendario-admin','tareas-admin','tablas-admin','componentes-ui'].includes(s)) return 'aplicaciones';
    if(['clientes','membresias','pagos','planes','renovaciones','documentos-socio'].includes(s)) return 'socios';
    if(['clases','reservas','rutinas','entrenador','seguimiento','progreso-fisico','nutricion','asistencias','reporte-asistencias'].includes(s)) return 'servicios';
    if(['caja','ventas','historial-ventas','gastos','compras'].includes(s)) return 'operacion';
    if(['inventario','productos','kardex','proveedores','categorias','equipos'].includes(s)) return 'inventario';
    if(['eventos','galeria','noticias'].includes(s)) return 'contenido';
    if(['salarios','ingresos','facturas'].includes(s)) return 'finanzas';
    if(['soporte','opiniones','comunicacion'].includes(s)) return 'atencion';
    if(['reportes','reportes-admin'].includes(s)) return 'reportes';
    if(['usuarios','auditoria','configuracion','mantenimiento-sistema'].includes(s)) return 'sistema';
    return 'herramientas';
  }

  get nombreModuloActual():string{
    const nombres:any={
      dashboard:'Panel Principal',
      aplicaciones:'Centro de aplicaciones',
      socios:'Socios y membresías',
      servicios:'Fitness y servicios',
      operacion:'Operación',
      inventario:'Inventario y equipos',
      contenido:'Contenido',
      finanzas:'Finanzas',
      atencion:'Atención al cliente',
      reportes:'Reportes',
      sistema:'Sistema',
      herramientas:'Herramientas'
    };
    return nombres[this.moduloActivo]||'Administración';
  }

  get tabsModuloActual():Array<{id:string,nombre:string}>{
    switch(this.moduloActivo){
      case 'aplicaciones':
        return [
          {id:'aplicaciones',nombre:'Aplicaciones'},
          {id:'calendario-admin',nombre:'Calendario'},
          {id:'tareas-admin',nombre:'Tareas'},
          {id:'tablas-admin',nombre:'Tablas'},
          {id:'componentes-ui',nombre:'Componentes'}
        ];
      case 'socios':
        return [
          {id:'clientes',nombre:'Socios'},
          {id:'membresias',nombre:'Membresías'},
          {id:'renovaciones',nombre:'Renovaciones'},
          {id:'pagos',nombre:'Pagos'},
          {id:'planes',nombre:'Planes'},
          {id:'documentos-socio',nombre:'Documentos'}
        ];
      case 'servicios':
        return [
          {id:'clases',nombre:'Clases'},
          {id:'reservas',nombre:'Agenda'},
          {id:'rutinas',nombre:'Rutinas'},
          {id:'seguimiento',nombre:'Seguimiento'},
          {id:'progreso-fisico',nombre:'Progreso'},
          {id:'asistencias',nombre:'Asistencia'},
          {id:'nutricion',nombre:'Nutrición'},
          {id:'entrenador',nombre:'Entrenador'}
        ];
      case 'operacion':
        return [
          {id:'caja',nombre:'Caja'},
          {id:'ventas',nombre:'Ventas'},
          {id:'historial-ventas',nombre:'Historial'},
          {id:'gastos',nombre:'Gastos'},
          {id:'compras',nombre:'Compras'}
        ];
      case 'inventario':
        return [
          {id:'inventario',nombre:'Inventario'},
          {id:'productos',nombre:'Productos'},
          {id:'categorias',nombre:'Categorías'},
          {id:'proveedores',nombre:'Proveedores'},
          {id:'kardex',nombre:'Kardex'},
          {id:'equipos',nombre:'Equipos'}
        ];
      case 'contenido':
        return [
          {id:'eventos',nombre:'Eventos'},
          {id:'galeria',nombre:'Galería'},
          {id:'noticias',nombre:'Noticias'}
        ];
      case 'finanzas':
        return [
          {id:'ingresos',nombre:'Ingresos'},
          {id:'facturas',nombre:'Facturas'},
          {id:'salarios',nombre:'Salarios'}
        ];
      case 'atencion':
        return [
          {id:'soporte',nombre:'Soporte'},
          {id:'opiniones',nombre:'Opiniones'},
          {id:'comunicacion',nombre:'Notificaciones'}
        ];
      case 'reportes':
        return [
          {id:'reportes-admin',nombre:'Resumen Administrativo'},
          {id:'reporte-asistencias',nombre:'Asistencias'}
        ];
      case 'sistema':
        return [
          {id:'usuarios',nombre:'Usuarios'},
          {id:'auditoria',nombre:'Auditoría'},
          {id:'configuracion',nombre:'Configuración'},
          {id:'mantenimiento-sistema',nombre:'Mantenimiento'}
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
      fitness:'rutinas',
      operacion:'caja',
      inventario:'inventario',
      contenido:'eventos',
      finanzas:'ingresos',
      atencion:'soporte',
      reportes:'reportes-admin',
      sistema:'configuracion',
      herramientas:'tablas-admin'
    };
    this.cambiarSegcion(destino[modulo]||'dashboard');
  }

  badgeModulo(modulo:string):number{
    if(modulo==='socios') {
      return Number(this.dashboard?.membresias?.por_vencer_7_dias||0)
        + Number(this.dashboard?.membresias?.pagos_pendientes||0);
    }
    if(modulo==='servicios') return Number(this.dashboard?.alertas?.rutinas_pendientes||0);
    if(modulo==='inventario') return Number(this.dashboard?.inventario?.productos_stock_bajo||0);
    if(modulo==='atencion') return Number(this.dashboard?.alertas?.soporte_pendiente||0)+Number(this.dashboard?.alertas?.opiniones_pendientes||0);
    return 0;
  }

  badgeTab(id:string):number{
    if(id==='membresias' || id==='renovaciones') return Number(this.dashboard?.membresias?.por_vencer_7_dias||0);
    if(id==='pagos') return Number(this.dashboard?.membresias?.pagos_pendientes||0);
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
    if(tipo==='rutinas'){ this.cambiarSegcion('rutinas'); return; }
    if(tipo==='soporte'){ this.cambiarSegcion('soporte'); return; }
    if(tipo==='opiniones'){ this.cambiarSegcion('opiniones'); return; }
    if(tipo==='inventario'){ this.cambiarSegcion('inventario'); return; }
    if(tipo==='membresias'){ this.cambiarSegcion('membresias'); return; }
    if(tipo==='pagos'){ this.cambiarSegcion('pagos'); return; }
    this.cambiarSegcion('dashboard');
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

  totalActividadOperativa():number{
    return Number(this.dashboard?.asistencias?.hoy||0)
      + Number(this.dashboard?.reservas?.hoy||0)
      + Number(this.dashboard?.ventas?.hoy_cantidad||0);
  }

  porcentajeActividadOperativa(tipo:'asistencias'|'reservas'|'ventas'):number{
    const total=this.totalActividadOperativa();
    // Sin movimientos no se dibujan porcentajes ficticios.
    if(total<=0) return 0;
    const valor=tipo==='asistencias'
      ? Number(this.dashboard?.asistencias?.hoy||0)
      : tipo==='reservas'
        ? Number(this.dashboard?.reservas?.hoy||0)
        : Number(this.dashboard?.ventas?.hoy_cantidad||0);
    return Math.max(0,Math.min(100,Math.round((valor/total)*1000)/10));
  }

  tipoIngresoDashboard: 'total'|'membresias'|'ventas' = 'total';
  modoDashboard: 'claro'|'oscuro' = 'claro';
  densidadDashboard: 'normal'|'compacta' = 'normal';
  acentoDashboard: 'coral'|'azul'|'verde' = 'verde';
  personalizadorAbierto = false;
  avisosAbiertos = false;
  perfilAbiertoMantis = false;
  busquedaAbierta = false;

  get nombreIngresoSeleccionado():string{
    return this.tipoIngresoDashboard==='ventas' ? 'Ventas' : this.tipoIngresoDashboard==='membresias' ? 'Membresías' : 'Total';
  }

  totalIngresoMesSeleccionado():number{
    const ingreso=this.dashboard?.ingresos || {};
    const valor=this.tipoIngresoDashboard==='ventas'
      ? ingreso.ventas_mes : this.tipoIngresoDashboard==='membresias'
        ? ingreso.membresias_mes : ingreso.total_mes;
    return Number.isFinite(Number(valor)) ? Number(valor) : 0;
  }

  ingresosMensualesDashboard(): {mes:string,total:number}[]{
    const datos=this.dashboard?.tendencias?.ingresos_6_meses;
    if(!Array.isArray(datos)) return [];
    return datos.slice(-6).map((item:any)=>({
      mes:String(item?.mes||'Mes'),
      total:Math.max(0,Number(item?.[this.tipoIngresoDashboard])||0)
    }));
  }

  get accesosRapidosDashboard():Array<{id:string,nombre:string}>{
    const query=this.busquedaAdmin.trim().toLocaleLowerCase('es-PE');
    if (!query) return [];
    return Object.entries(this.titulos)
      .filter(([id,info])=>id.toLowerCase().includes(query) || info[0].toLocaleLowerCase('es-PE').includes(query))
      .slice(0,5)
      .map(([id,info])=>({id,nombre:info[0]}));
  }

  get alertasRapidasDashboard():Array<{id:string,nombre:string,cantidad:number,icono:string}>{
    const d=this.dashboard || {};
    return [
      {id:'renovaciones',nombre:'Membresías por vencer',cantidad:Number(d?.membresias?.por_vencer_7_dias||0),icono:'◷'},
      {id:'pagos',nombre:'Pagos pendientes',cantidad:Number(d?.membresias?.pagos_pendientes||0),icono:'S/'},
      {id:'inventario',nombre:'Stock bajo',cantidad:Number(d?.inventario?.productos_stock_bajo||0),icono:'▣'},
      {id:'rutinas',nombre:'Rutinas pendientes',cantidad:Number(d?.alertas?.rutinas_pendientes||0),icono:'🏋'},
      {id:'soporte',nombre:'Solicitudes de soporte',cantidad:Number(d?.alertas?.soporte_pendiente||0),icono:'✉'},
      {id:'opiniones',nombre:'Opiniones pendientes',cantidad:Number(d?.alertas?.opiniones_pendientes||0),icono:'★'}
    ].filter(aviso=>aviso.cantidad>0);
  }

  cerrarMenusMantis():void{
    this.busquedaAbierta=false;
    this.avisosAbiertos=false;
    this.perfilAbiertoMantis=false;
  }

  abrirBuscadorMantis():void{
    this.cerrarMenusMantis();
    this.busquedaAbierta=true;
  }

  alternarAlertasMantis():void{
    const abierto=!this.avisosAbiertos;
    this.cerrarMenusMantis();
    this.avisosAbiertos=abierto;
  }

  alternarPerfilMantis():void{
    const abierto=!this.perfilAbiertoMantis;
    this.cerrarMenusMantis();
    this.perfilAbiertoMantis=abierto;
  }

  abrirPersonalizadorMantis():void{
    this.cerrarMenusMantis();
    this.personalizadorAbierto=true;
  }

  irAAccesoRapido(id:string):void{
    this.cerrarMenusMantis();
    this.cambiarSegcion(id);
    this.busquedaAdmin='';
  }

  guardarAparienciaMantis(tipo:'tema'|'color'|'densidad',valor:string):void{
    if(tipo==='tema' && (valor==='claro'||valor==='oscuro')) this.modoDashboard=valor;
    if(tipo==='color' && (valor==='coral'||valor==='azul'||valor==='verde')) this.acentoDashboard=valor;
    if(tipo==='densidad' && (valor==='normal'||valor==='compacta')) this.densidadDashboard=valor;
    try{
      localStorage.setItem('mallqui_mantis_tema',this.modoDashboard);
      localStorage.setItem('mallqui_mantis_color',this.acentoDashboard);
      localStorage.setItem('mallqui_mantis_densidad',this.densidadDashboard);
    }catch{}
  }

  @HostListener('document:keydown.escape')
  cerrarControlesConEscape():void{
    this.cerrarMenusMantis();
    this.personalizadorAbierto=false;
  }

  restablecerAparienciaMantis():void{
    this.guardarAparienciaMantis('tema','claro');
    this.guardarAparienciaMantis('color','verde');
    this.guardarAparienciaMantis('densidad','normal');
    this.sidebarCerrado=false;
    try{localStorage.setItem('mallqui_admin_sidebar_closed','0');}catch{}
  }

  maxIngresoGrafico():number{
    const valores=this.ingresosMensualesDashboard().map(m=>m.total);
    return Math.max(0,...valores);
  }

  puntosIngresosDashboard(): {x:number,y:number}[]{
    const datos=this.ingresosMensualesDashboard();
    const max=Math.max(1,...datos.map(m=>m.total));
    return datos.map((m,i)=>({
      x:50+(datos.length>1 ? 637*i/(datos.length-1) : 0),
      y:207-(m.total/max)*150
    }));
  }

  lineaIngresosDashboard():string{
    return this.puntosIngresosDashboard()
      .map(p=>p.x.toFixed(2)+','+p.y.toFixed(2))
      .join(' ');
  }

  areaIngresosDashboard():string{
    const puntos=this.puntosIngresosDashboard();
    if(!puntos.length) return '';
    return 'M'+puntos[0].x.toFixed(2)+' 207 L'
      +puntos.map(p=>p.x.toFixed(2)+' '+p.y.toFixed(2)).join(' L')
      +' L'+puntos[puntos.length-1].x.toFixed(2)+' 207 Z';
  }

  progresoSemanal():number{
    const total=(this.dashboard?.tendencias?.asistencias_7_dias||[])
      .reduce((sum:number,x:any)=>sum+Number(x?.total||0),0);
    const objetivo=35;
    return Math.max(0,Math.min(100,Math.round((total/objetivo)*100)));
  }

  /** Altura relativa basada exclusivamente en el histórico devuelto por Laravel. */
  alturaIngresoKpi(valor:any):number{
    const valores=this.ingresosMensualesDashboard().map(item=>Number(item.total)||0);
    if(!valores.length) return 0;
    const max=Math.max(1,...valores);
    const dato=Math.max(0,Number(valor)||0);
    return Math.min(100,(dato/max)*100);
  }

  destinoActividadDashboard(tipo:any):string{
    const valor=String(tipo||'').toLowerCase();
    if(valor.includes('reserva')) return 'reservas';
    if(valor.includes('pago')) return 'pagos';
    if(valor.includes('venta')||valor.includes('producto')) return 'ventas';
    if(valor.includes('rutina')) return 'rutinas';
    if(valor.includes('asistencia')) return 'asistencias';
    if(valor.includes('soporte')||valor.includes('consulta')) return 'soporte';
    if(valor.includes('membresia')||valor.includes('membresía')) return 'membresias';
    return 'reportes-admin';
  }

  iconoActividadDashboard(tipo:any):string{
    const ruta=this.destinoActividadDashboard(tipo);
    if(ruta==='reservas') return '◫';
    if(ruta==='pagos'||ruta==='ventas') return 'S/';
    if(ruta==='rutinas') return '✦';
    if(ruta==='asistencias') return '✓';
    if(ruta==='soporte') return '✉';
    if(ruta==='membresias') return '♙';
    return '▥';
  }

  alturaAsistenciaSemana(total:any):number{
    const datos=this.diasActividadDashboard().map((x:any)=>Number(x?.total||0));
    const max=Math.max(1,...datos);
    const valor=Math.max(0,Number(total||0));
    return valor<=0 ? 0 : Math.max(0,Math.min(100,(valor/max)*100));
  }

  exportarDashboardCsv():void{
    if(!this.dashboard){
      this.error='Primero carga el resumen del dashboard. No se exportarán indicadores sin datos.';
      return;
    }
    const d=this.dashboard;
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
    this.actualizarDashboardCompleto();
  }

  /**
   * Un 0 significa "sin movimientos" solamente cuando existe la fuente.
   * Si falta la tabla en el MySQL local, se muestra "—" en lugar de inventar
   * que las reservas, asistencias o cobros están funcionando.
   */
  fuenteKpiDisponible(tipo:'socios'|'reservas'|'asistencias'|'ingresos'):boolean {
    if(!this.dashboard) return false;
    const tablas=this.dashboard?.fuente?.tablas_detectadas;
    if(!Array.isArray(tablas)) return true; // Compatibilidad con API de versiones anteriores.
    const disponibles=new Set(tablas.map((tabla:any)=>String(tabla).toLowerCase()));
    const candidatos:Record<string,string[]>={
      socios:['clientes','socios','app_clientes','app_socios'],
      reservas:['reservas','app_reservas'],
      asistencias:['asistencias','app_asistencias'],
      ingresos:['pagos_membresia','pagos','app_pagos_membresia','app_pagos','ventas','app_ventas']
    };
    return candidatos[tipo].some(nombre=>disponibles.has(nombre));
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

  get rutinasActivasDashboard(): any[] {
    return this.rutinas.filter((r:any)=>String(r?.estado||'Activo').toLowerCase()==='activo').slice(0,3);
  }

  get fechaDashboard(): string {
    return new Intl.DateTimeFormat('es-PE',{
      weekday:'long',day:'2-digit',month:'long',year:'numeric'
    }).format(new Date());
  }

  totalAlertasDashboard(): number {
    const totalOriginal=this.dashboard?.alertas?.total;
    const totalBackend=Number(totalOriginal);
    if(totalOriginal!==null && totalOriginal!==undefined &&
       totalOriginal!=='' && Number.isFinite(totalBackend)) {
      return Math.max(0,totalBackend);
    }

    const a=this.dashboard?.alertas || {};
    return Number(a.rutinas_pendientes||0)
      + Number(a.soporte_pendiente||0)
      + Number(a.opiniones_pendientes||0)
      + Number(this.dashboard?.inventario?.productos_stock_bajo||0)
      + Number(this.dashboard?.membresias?.por_vencer_7_dias||0)
      + Number(this.dashboard?.membresias?.pagos_pendientes||0);
  }

  get sistemaSincronizado(): boolean {
    return Boolean(this.estadoOperativoDashboard?.api)
      && Boolean(this.estadoOperativoDashboard?.database)
      && Boolean(this.estadoOperativoDashboard?.operativo)
      && !this.dashboardError
      && !!this.dashboard
      && this.erroresSincronizacion.length===0
      && this.ultimaActualizacionTs>0;
  }

  get mensajeSincronizacion(): string {
    const faltantes=Array.isArray(this.estadoOperativoDashboard?.faltantes)
      ? this.estadoOperativoDashboard.faltantes
      : [];
    if(faltantes.length) return 'Faltan '+faltantes.length+' requisitos de tablas o columnas en MySQL. Haz respaldo antes de ejecutar sistema:preparar.';
    if(this.erroresSincronizacion.length) return 'Falló: '+this.erroresSincronizacion.join(', ');
    if(this.sistemaSincronizado) return 'API, dashboard y base de datos sincronizados';
    return 'Revisar conexión y esquema funcional';
  }

  actualizarDashboardCompleto(): void {
    if(this.actualizandoDatos) return;

    this.actualizandoDatos=true;
    this.dashboardCargando=!this.dashboard;
    this.error='';
    this.dashboardError='';
    const errores:string[]=[];

    const seguro=(nombre:string, observable:any, fallback:any)=>
      observable.pipe(catchError((e:any)=>{
        errores.push(nombre);
        if(nombre==='dashboard'){
          this.dashboardError=e?.error?.mensaje ?? e?.error?.message ?? 'No se pudo cargar el resumen administrativo.';
        }
        return of(fallback);
      }));

    forkJoin({
      estado: seguro('estado del sistema',this.api.estadoOperativo(),{api:false,database:false,operativo:false,faltantes:[]}),
      dashboard: seguro('dashboard',this.api.dashboard(),null),
      clientes: seguro('socios',this.api.clientes(),[]),
      planes: seguro('planes',this.api.membresiasDisponibles(),[]),
      membresias: seguro('membresías',this.api.clienteMembresias(),[]),
      pagos: seguro('pagos',this.api.pagos(),[]),
      productos: seguro('productos',this.api.productos(),[]),
      reservas: seguro('reservas',this.api.reservas(),[]),
      rutinas: seguro('rutinas',this.api.rutinas(),[]),
      asistencias: seguro('asistencias',this.api.asistencias(),[]),
      entrenadores: seguro('entrenador',this.api.entrenadores(),[]),
      clases: seguro('clases',this.api.clases(),[]),
      caja: seguro('caja',this.api.cajaActual(),{caja_abierta:false,caja:null})
    }).subscribe({
      next:(r:any)=>{
        this.estadoOperativoDashboard=r.estado;
        // Nunca conservar cifras antiguas tras una respuesta fallida del resumen.
        this.dashboard=r.dashboard || null;
        this.clientes=Array.isArray(r.clientes)?r.clientes:[];
        this.planesMembresia=Array.isArray(r.planes)?r.planes:[];
        this.membresiasDisponibles=this.planesMembresia.filter((x:any)=>String(x?.estado||'').toLowerCase()==='activo');
        this.membresiasCliente=Array.isArray(r.membresias)?r.membresias:[];
        this.pagos=Array.isArray(r.pagos)?r.pagos:[];
        this.productos=Array.isArray(r.productos)?r.productos:[];
        this.reservas=Array.isArray(r.reservas)?r.reservas:[];
        this.rutinas=Array.isArray(r.rutinas)?r.rutinas:[];
        this.asistencias=Array.isArray(r.asistencias)?r.asistencias:[];
        this.entrenadores=Array.isArray(r.entrenadores)?r.entrenadores:[];
        this.clases=Array.isArray(r.clases)?r.clases:[];
        this.caja=r.caja;

        const principal=this.entrenadores.find((e:any)=>String(e?.estado||'').toLowerCase()==='activo') ?? this.entrenadores[0];
        if(principal){
          if(!this.claseForm.id_entrenador) this.claseForm.id_entrenador=principal.id_entrenador;
          if(!this.rutinaForm.id_entrenador) this.rutinaForm.id_entrenador=principal.id_entrenador;
        }

        this.erroresSincronizacion=errores;
        this.dashboardCargando=false;
        this.actualizandoDatos=false;
        this.ultimaActualizacionTs=Date.now();
        this.ultimaActualizacion=new Date(this.ultimaActualizacionTs).toLocaleTimeString('es-PE');

        if(errores.length){
          this.error='No se pudieron sincronizar: '+errores.join(', ')+'.';
        }
        // La vista inicial también completa las imágenes de las fichas
        // originales de prueba; antes solo lo hacía la vista Productos.
        if(this.seccion==='dashboard') this.revisarFotosDemoDelInicio();
      },
      error:(e:any)=>{
        this.dashboardCargando=false;
        this.actualizandoDatos=false;
        this.erroresSincronizacion=['sincronización general'];
        this.dashboardError=e?.error?.mensaje ?? e?.error?.message ?? 'No se pudo sincronizar el dashboard.';
        this.mostrarError(e);
      }
    });
  }

  get membresiasPorVencerDashboard(): any[] {
    const datos=this.dashboard?.membresias?.detalle_por_vencer;
    return Array.isArray(datos) ? datos : [];
  }

  /** El API devuelve hasta ocho detalles, pero puede haber más vencimientos. */
  get totalMembresiasPorVencerDashboard(): number {
    const total=Number(this.dashboard?.membresias?.por_vencer_7_dias);
    const listado=this.membresiasPorVencerDashboard.length;
    return Number.isFinite(total) ? Math.max(0, listado, total) : listado;
  }

  abrirAlertasDashboard(): void {
    if(this.membresiasPorVencerDashboard.length || Number(this.dashboard?.membresias?.por_vencer_7_dias||0)>0){
      this.cambiarSegcion('renovaciones');
      return;
    }
    if(Number(this.dashboard?.alertas?.rutinas_pendientes||0)>0){
      this.cambiarSegcion('rutinas');
      return;
    }
    if(Number(this.dashboard?.inventario?.productos_stock_bajo||0)>0){
      this.cambiarSegcion('inventario');
      return;
    }
    if(Number(this.dashboard?.alertas?.soporte_pendiente||0)>0){
      this.cambiarSegcion('soporte');
      return;
    }
    if(Number(this.dashboard?.alertas?.opiniones_pendientes||0)>0){
      this.cambiarSegcion('opiniones');
      return;
    }
    if(Number(this.dashboard?.membresias?.pagos_pendientes||0)>0){
      this.cambiarSegcion('pagos');
      return;
    }
    this.cambiarSegcion('comunicacion');
  }

  cargarSeguimiento(): void {
    this.cargarClientes();
    this.cargarMembresias();
    this.cargarAsistencias();
    this.cargarRutinas();
    this.cargarDashboard();
  }

  private idClienteSeguimiento(valor:any): number {
    return Number(valor?.id_cliente ?? valor?.cliente?.id_cliente ?? valor?.cliente_id ?? 0);
  }

  membresiaSeguimiento(cliente:any): any {
    const id=Number(cliente?.id_cliente||0);
    const candidatas=this.membresiasCliente
      .filter((m:any)=>this.idClienteSeguimiento(m)===id)
      .sort((a:any,b:any)=>String(b?.fecha_fin||'').localeCompare(String(a?.fecha_fin||'')));
    return candidatas.find((m:any)=>String(m?.estado||'Activo').toLowerCase()==='activo') || candidatas[0] || null;
  }

  diasMembresiaSeguimiento(cliente:any): number|null {
    const fechaFin=this.membresiaSeguimiento(cliente)?.fecha_fin;
    if(!fechaFin) return null;
    const fin=new Date(String(fechaFin)+'T23:59:59');
    if(Number.isNaN(fin.getTime())) return null;
    const hoy=new Date();
    hoy.setHours(0,0,0,0);
    return Math.ceil((fin.getTime()-hoy.getTime())/86400000);
  }

  asistenciasClienteSeguimiento(cliente:any): number {
    const id=Number(cliente?.id_cliente||0);
    return this.asistencias.filter((a:any)=>this.idClienteSeguimiento(a)===id).length;
  }

  rutinasClienteSeguimiento(cliente:any): number {
    const id=Number(cliente?.id_cliente||0);
    return this.rutinas.filter((r:any)=>this.idClienteSeguimiento(r)===id && String(r?.estado||'Activo').toLowerCase()!=='inactivo').length;
  }

  esMembresiaPorVencer(cliente:any): boolean {
    const dias=this.diasMembresiaSeguimiento(cliente);
    return dias !== null && dias >= 0 && dias <= 7;
  }

  estadoSeguimiento(cliente:any): string {
    const m=this.membresiaSeguimiento(cliente);
    if(!m) return 'Sin membresía';
    const dias=this.diasMembresiaSeguimiento(cliente);
    if(dias!==null && dias<0) return 'Vencida';
    if(dias!==null && dias<=7) return 'Por vencer';
    return 'Al día';
  }

  renovarDesdeSeguimiento(cliente:any): void {
    this.cambiarSegcion('membresias');
    setTimeout(()=>{ this.membresiaForm.id_cliente=Number(cliente?.id_cliente||0); },0);
  }

  cargarProgresoFisico(): void {
    if(!this.progresoClienteId){ this.progresoDatos=null; return; }
    this.api.progresoGym(Number(this.progresoClienteId)).subscribe({
      next:(r:any)=>this.progresoDatos=r,
      error:e=>this.mostrarError(e)
    });
  }

  guardarMedidaProgreso(): void {
    if(!this.progresoClienteId){ this.error='Selecciona un socio.'; return; }
    const payload={...this.medidaForm,socio_id:Number(this.progresoClienteId)};
    this.api.guardarMedidaGym(payload).subscribe({
      next:(r:any)=>{
        this.ok(r?.mensaje||'Medición registrada.');
        this.medidaForm={peso:null,grasa:null,cintura:null,brazo:null,fecha:new Date().toISOString().slice(0,10)};
        this.cargarProgresoFisico();
      },
      error:e=>this.mostrarError(e)
    });
  }

  eliminarMedidaProgreso(id:number): void {
    if(!id || !confirm('¿Eliminar esta medición?')) return;
    this.api.eliminarMedidaGym(id).subscribe({
      next:()=>{this.ok('Medición eliminada.');this.cargarProgresoFisico();},
      error:e=>this.mostrarError(e)
    });
  }

  cargarRenovaciones(): void {
    this.api.vencimientosWhatsappGym(Number(this.renovacionesDias||7)).subscribe({
      next:(r:any[])=>this.renovacionesLista=Array.isArray(r)?r:[],
      error:e=>{this.renovacionesLista=[];this.mostrarError(e);}
    });
  }

  get renovacionesConTelefono(): number {
    return this.renovacionesLista.filter((v:any)=>!!String(v?.telefono||'').trim()).length;
  }

  get renovacionesConWhatsapp(): number {
    return this.renovacionesLista.filter((v:any)=>!!String(v?.whatsapp_api_key||'').trim()).length;
  }

  configurarWhatsapp(v:any): void {
    const key=prompt('Ingresa la API Key de WhatsApp para '+String(v?.nombre||'este socio')+':',String(v?.whatsapp_api_key||''));
    if(key===null) return;
    const limpia=key.trim();
    if(!limpia){this.error='La API Key no puede estar vacía.';return;}
    this.api.guardarWhatsappKeyGym(Number(v.id),limpia).subscribe({
      next:()=>{this.ok('WhatsApp configurado.');this.cargarRenovaciones();},
      error:e=>this.mostrarError(e)
    });
  }

  enviarAvisoWhatsapp(v:any): void {
    this.api.enviarWhatsappGym(Number(v.id)).subscribe({
      next:(r:any)=>this.ok(r?.mensaje||'Aviso enviado.'),
      error:e=>this.mostrarError(e)
    });
  }

  enviarAvisosTodos(): void {
    if(!this.renovacionesLista.length){this.ok('No hay vencimientos para avisar.');return;}
    if(!confirm('¿Enviar avisos a todos los socios configurados?')) return;
    this.api.enviarWhatsappTodosGym(Number(this.renovacionesDias||7)).subscribe({
      next:(r:any)=>this.ok((r?.mensaje||'Proceso terminado.')+' Enviados: '+Number(r?.enviados||0)+'.'),
      error:e=>this.mostrarError(e)
    });
  }

  abrirRenovacionSocio(v:any): void {
    this.cambiarSegcion('membresias');
    const socio=this.clientes.find((c:any)=>Number(c?.id_cliente)===Number(v?.id));
    setTimeout(()=>{this.membresiaForm.id_cliente=Number(socio?.id_cliente||v?.id||0);},0);
  }

  generarCarnetSocio(): void {
    if(!this.documentoClienteId) return;
    this.api.carnetGym(Number(this.documentoClienteId)).subscribe({
      next:(r:any)=>this.carnetDatos=r,
      error:e=>this.mostrarError(e)
    });
  }

  generarComprobanteMembresia(): void {
    if(!this.documentoPagoId) return;
    const registro=this.pagos.find((p:any)=>Number(p.id_pago)===Number(this.documentoPagoId));
    if(!registro || registro.estado_pago!=='Completado'){
      this.comprobanteDatos=null;
      this.error='Selecciona un pago confirmado para consultar la constancia.';
      return;
    }
    this.verComprobantePago(registro);
  }

  verComprobantePago(pago:any):void {
    if(!pago?.id_pago || pago.estado_pago!=='Completado'){
      this.error='Todavía no existe un pago confirmado para generar la constancia.';
      this.comprobanteDatos=null;
      return;
    }
    this.comprobanteDatos=null;
    this.api.comprobantePago(Number(pago.id_pago)).subscribe({
      next:(r:any)=>{
        if(r?.estado_pago!=='Completado'){
          this.error='El pago no está confirmado.';
          return;
        }
        this.comprobanteDatos=r;
        this.error='';
      },
      error:e=>this.mostrarError(e)
    });
  }

  /** Crea una hoja imprimible con el pago comprobado por Laravel, sin servicios web externos. */
  imprimirComprobantePago():void {
    const pago=this.comprobanteDatos;
    if(!pago || pago.estado_pago!=='Completado'){
      this.error='Primero consulta un pago confirmado.';
      return;
    }
    const escapar=(valor:any):string=>String(valor??'').replace(/[&<>"']/g, (car:string)=>{
      const mapa:Record<string,string>={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
      return mapa[car]||car;
    });
    const total=Number(pago.monto||0);
    const empresa=pago.empresa||{};
    const ventana=window.open('','_blank','width=620,height=760');
    if(!ventana){
      this.error='El navegador bloqueó la ventana de impresión. Permite ventanas emergentes para esta página.';
      return;
    }
    const html=[
      '<!doctype html><html lang="es"><head><meta charset="utf-8">',
      '<title>Constancia '+escapar(pago.numero_comprobante)+'</title>',
      '<style>@page{size:A4;margin:15mm}body{font:14px Arial,sans-serif;max-width:680px;margin:24px auto;color:#1d2837}',
      'header{text-align:center;border-bottom:2px solid #1677ff;padding-bottom:18px}h1{font-size:20px}h2{font-size:16px}',
      'dl{display:grid;grid-template-columns:170px 1fr;gap:9px;border-bottom:1px solid #ccc;padding-bottom:20px}',
      'dt{font-weight:bold}dd{margin:0;overflow-wrap:anywhere}.total{font-size:22px;font-weight:bold;text-align:right}',
      '.nota{background:#f1f4f8;padding:12px;font-size:12px}button{padding:10px 18px;margin:20px 0;background:#1677ff;color:#fff;border:0;border-radius:5px}',
      '@media print{button{display:none}body{margin:0}}</style></head><body>',
      '<header><h1>'+escapar(empresa.nombre||'Mallqui Gym')+'</h1>',
      '<p>CONSTANCIA INTERNA DE PAGO · '+escapar(pago.numero_comprobante)+'</p>',
      '<p>'+escapar(empresa.direccion||'')+'</p></header>',
      '<h2>Datos registrados</h2><dl>',
      '<dt>Cliente</dt><dd>'+escapar(pago.cliente||'-')+'</dd>',
      '<dt>DNI</dt><dd>'+escapar(pago.dni||'-')+'</dd>',
      '<dt>Plan</dt><dd>'+escapar(pago.membresia||'-')+'</dd>',
      '<dt>Fecha</dt><dd>'+escapar(pago.fecha_pago||pago.fecha||'-')+'</dd>',
      '<dt>Método de pago</dt><dd>'+escapar(pago.metodo_pago||'-')+'</dd>',
      '<dt>Operación</dt><dd>'+escapar(pago.numero_operacion||'-')+'</dd>',
      '<dt>Estado</dt><dd>'+escapar(pago.estado_pago)+'</dd></dl>',
      '<p class="total">TOTAL: S/ '+(Number.isFinite(total)?total.toFixed(2):'0.00')+'</p>',
      '<p class="nota">'+escapar(pago.nota_tributaria||'Documento interno, no equivale a un CPE SUNAT.')+'</p>',
      '<button type="button" onclick="window.print()">Imprimir o guardar como PDF</button>',
      '</body></html>'
    ].join('');
    ventana.document.write(html);
    ventana.document.close();
    ventana.focus();
  }

  descargarBackupSistema(): void {
    this.api.backupGym().subscribe({
      next:(blob:Blob)=>{
        const url=URL.createObjectURL(blob);
        const a=document.createElement('a');
        a.href=url;
        a.download='backup-mallqui-gym-'+new Date().toISOString().slice(0,10)+'.sql';
        a.style.display='none';
        document.body.appendChild(a);a.click();document.body.removeChild(a);
        setTimeout(()=>URL.revokeObjectURL(url),0);
        this.ok('Backup descargado correctamente.');
      },
      error:e=>this.mostrarError(e)
    });
  }

  limpiarCacheSistema(): void {
    this.api.limpiarCacheGym().subscribe({
      next:(r:any)=>this.ok(r?.mensaje||'Caché limpiada correctamente.'),
      error:e=>this.mostrarError(e)
    });
  }

  seleccionarBackupRestaurar(event:any): void {
    this.backupRestaurarArchivo=event?.target?.files?.[0]||null;
  }

  restaurarBackupSistema(): void {
    if(!this.backupRestaurarArchivo) return;
    if(!confirm('Esta acción restaurará la base de datos usando el archivo seleccionado. ¿Continuar?')) return;
    this.api.restaurarGym(this.backupRestaurarArchivo).subscribe({
      next:(r:any)=>{this.ok(r?.mensaje||'Backup restaurado.');this.backupRestaurarArchivo=null;this.cargarDashboard();},
      error:e=>this.mostrarError(e)
    });
  }

  /** Agenda real del día: no mezcla reservas antiguas ni futuras. */
  reservasHoyDashboard(): any[] {
    const hoy = new Date();
    const fechaHoy = [
      hoy.getFullYear(),
      String(hoy.getMonth() + 1).padStart(2, '0'),
      String(hoy.getDate()).padStart(2, '0')
    ].join('-');
    return (this.reservas || [])
      .filter((reserva: any) =>
        String(reserva?.fecha_clase || '').slice(0, 10) === fechaHoy &&
        String(reserva?.estado || '').toLowerCase() !== 'cancelada')
      .sort((a: any, b: any) =>
        String(a?.clase?.hora_inicio || '').localeCompare(String(b?.clase?.hora_inicio || '')));
  }

  diasActividadDashboard(): any[] {
    const dias = this.dashboard?.tendencias?.asistencias_7_dias;
    if (Array.isArray(dias) && dias.length) return dias.slice(-7);
    return ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(dia=>({dia,total:0}));
  }

  totalActividadSemanal(): number {
    return this.diasActividadDashboard().reduce((total:number, d:any) => total + Number(d?.total || 0), 0);
  }

  /** Conecta los accesos del panel analítico con los módulos reales existentes. */
  cambiarSeccion(id: string): void {
    this.cambiarSegcion(id);
  }

  cambiarSegcion(id: string): void {
    const destino=this.normalizarSegcion(id);
    if(destino!=='clientes' && this.clienteFormularioAbierto){
      this.cancelarEdicionCliente();
    }
    this.seccion = destino;
    this.error = '';
    this.activarGrupoDeSeccion(destino);
    this.cargarSegcion(destino);
    window.scrollTo({top:0, behavior:'smooth'});
  }

  abrirNuevoSocioDesdeDashboard(): void {
    this.cambiarSegcion('clientes');
    setTimeout(() => this.nuevoCliente(), 0);
  }

  actualizarSegcionActual(silencioso = false): void {
    if (this.actualizandoDatos) return;

    // Inicio necesita validar dashboard + API + esquema + módulos relacionados.
    // Así el auto-refresco no conserva un estado ACTIVO obsoleto.
    if (this.seccion === 'dashboard') {
      this.actualizarDashboardCompleto();
      return;
    }

    if (!silencioso) {
      this.actualizandoDatos = true;
      this.error = '';
    }

    this.cargarDashboard();
    this.cargarSegcion(this.seccion);

    if (!silencioso) {
      setTimeout(() => {
        this.actualizandoDatos = false;
        this.ultimaActualizacion = new Date().toLocaleTimeString('es-PE');
      }, 900);
    }
  }

  private cargarSegcion(id: string): void {
    switch (id) {
      case 'dashboard':
        // Al regresar desde socios, pagos o inventario no conservar listas
        // desactualizadas: sincronizar el resumen y los módulos relacionados.
        this.actualizarDashboardCompleto();
        break;
      case 'aplicaciones':
      case 'calendario-admin':
      case 'tareas-admin':
      case 'tablas-admin':
      case 'componentes-ui':
        // La pantalla hija consulta los datos que necesita en la API.
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
      case 'socios-hub':
        this.cargarSegcion('clientes');
        break;
      case 'servicios':
        this.cargarSegcion('clases');
        break;
      case 'atencion':
        this.cargarSegcion('soporte');
        break;
      case 'gestion':
        this.cargarSegcion('caja');
        break;
      case 'clientes':
        this.cargarClientes();
        break;
      case 'membresias':
        this.cargarClientes();
        this.cargarMembresias();
        this.cargarPagos();
        this.cargarCaja();
        break;
      case 'pagos':
        this.cargarClientes();
        this.cargarMembresias();
        this.cargarPagos();
        this.cargarCaja();
        break;
      case 'entrenador':
        this.cargarEntrenadores();
        this.cargarUsuarios();
        this.cargarDashboard();
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
      case 'seguimiento':
        this.cargarSeguimiento();
        break;
      case 'progreso-fisico':
        this.cargarClientes();
        break;
      case 'renovaciones':
        this.cargarClientes();
        this.cargarMembresias();
        this.cargarRenovaciones();
        break;
      case 'documentos-socio':
        this.cargarClientes();
        this.cargarMembresias();
        this.cargarPagos();
        break;
      case 'mantenimiento-sistema':
        break;
      case 'verificacion-efsrt':
        this.cargarVerificacionEfsrt();
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
      case 'reportes-admin':
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

  /** Los productos del inicio provienen de /api/productos, no de tarjetas de muestra. */
  fotoProductoDisponibleDashboard(foto:any):boolean {
    const valor=String(foto||'').trim();
    return /^data:image\/(?:png|jpe?g|webp);base64,/i.test(valor) ||
      /^\/?assets\/mallqui\/[a-zA-Z0-9_./-]+\.(?:png|jpe?g|webp)$/i.test(valor);
  }

  get productosConImagenDashboard():number {
    return this.productos.filter(p=>this.fotoProductoDisponibleDashboard(p?.foto)).length;
  }

  get productosDestacadosDashboard():any[] {
    return [...this.productos]
      .sort((a,b)=>Number(this.fotoProductoDisponibleDashboard(b?.foto))-Number(this.fotoProductoDisponibleDashboard(a?.foto)))
      .slice(0,4);
  }

  get cajaInconsistente():boolean {
    return this.caja?.caja_abierta===false
      && this.historialCaja.some((registro:any)=>
        String(registro?.estado||'').toLowerCase()==='abierta');
  }

  etiquetaCaja(c:any):string {
    const id=Number(c?.id_caja ?? c?.id ?? 0);
    return Number.isInteger(id) && id>0 ? 'Caja #'+id : 'Caja sin número registrado';
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
    if(!descripcion || !Number.isFinite(monto) || monto<=0){
      this.error='Completa la descripción y un monto válido.';
      return;
    }
    if(this.cajaCargando || this.cajaError || !this.caja?.caja_abierta){
      this.error='Debes comprobar y abrir una caja antes de registrar un gasto.';
      return;
    }
    if(monto>Number(this.caja?.resumen?.monto_esperado||0)){
      this.error='El gasto supera el saldo disponible de la caja.';
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
    if(this.seccion==='dashboard'){
      this.actualizarDashboardCompleto();
      return;
    }
    this.cargarDashboard();
    this.cargarSegcion(this.seccion);
  }

  /** Informe basado exclusivamente en la respuesta actual de MySQL.
   *  No marca semanas como completadas ni reemplaza evidencia del instituto.
   */
  construirInformeEfsrtCsv():string {
    const revision=this.verificacionEfsrt;
    if(!revision || !Array.isArray(revision.semanas) || revision.semanas.length!==11) return '';

    const celda=(valor:any):string=>{
      let texto=String(valor??'').replace(/[\r\n]+/g,' ').trim();
      // Evitar fórmulas de hoja de cálculo cuando se incluyen datos de MySQL.
      if(/^[=+@\-\t]/.test(texto)) texto="'"+texto;
      return '"'+texto.replace(/"/g,'""')+'"';
    };
    const filas:any[][]=[
      ['MALLQUI GYM','REVISIÓN FUNCIONAL DE 11 SEMANAS'],
      ['Fecha de consulta',revision.fecha_revision||''],
      ['Base de datos',revision.base_datos||''],
      ['Alcance','Estructura y alertas verificadas por API; pruebas presenciales pendientes'],
      [],
      ['Semana','Actividad','Estado','Pendientes u observaciones','Módulo'],
      ...revision.semanas.map((semana:any)=>[
        semana.semana,semana.titulo,
        semana.estado==='pendiente'?'Pendiente':'Verificación manual',
        Array.isArray(semana.observaciones)?semana.observaciones.join(' | '):'',
        semana.destino
      ]),
      [],
      ['Módulo','Estado de estructura','Registros','Tablas pendientes']
    ];
    for(const modulo of Array.isArray(revision.modulos)?revision.modulos:[]){
      filas.push([
        modulo.nombre,modulo.estado==='estructura_disponible'?'Disponible':'Incompleta',
        modulo.registros??'Sin tabla',
        Array.isArray(modulo.faltantes)?modulo.faltantes.join(' | '):''
      ]);
    }
    filas.push([],['ACTIVIDADES DE BITÁCORA','Semana','N°','Descripción','Evidencia exigida','Validación']);
    for(const semana of revision.semanas){
      for(const item of Array.isArray(semana.actividades)?semana.actividades:[]){
        filas.push([
          'Bitácora',semana.semana,item.numero,item.actividad,item.evidencia,
          item.estado==='programada_por_validar'?'Programada / no validada':'Requiere comprobación'
        ]);
      }
    }
    filas.push([],['Alertas de datos','Cantidad','Detalle']);
    for(const alerta of Array.isArray(revision.alertas)?revision.alertas:[]){
      filas.push([alerta.tipo,alerta.cantidad,alerta.mensaje]);
    }
    filas.push([],['NOTA','Los resultados no certifican SUNAT, uso sin servidor, pruebas del equipo ni firmas.']);
    return filas.map(fila=>fila.map(celda).join(';')).join('\r\n');
  }

  descargarInformeEfsrt():void {
    const csv=this.construirInformeEfsrtCsv();
    if(!csv){
      this.error='Primero comprueba las 11 semanas con la base de datos conectada.';
      return;
    }
    const enlace=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));
    try {
      const elemento=document.createElement('a');
      elemento.href=enlace;
      elemento.download='mallqui-gym-revision-11-semanas-'+new Date().toISOString().slice(0,10)+'.csv';
      elemento.style.display='none';
      document.body.appendChild(elemento);
      elemento.click();
      document.body.removeChild(elemento);
      this.ok('Revisión de las 11 semanas exportada con datos reales.');
    } finally {
      setTimeout(()=>URL.revokeObjectURL(enlace),0);
    }
  }

  cargarVerificacionEfsrt():void {
    if(this.verificacionEfsrtCargando)return;
    this.verificacionEfsrtCargando=true;
    this.verificacionEfsrtError='';
    this.verificacionEfsrt=null;
    this.api.verificacionEfsrt().subscribe({
      next:(resultado:any)=>{
        this.verificacionEfsrtCargando=false;
        this.verificacionEfsrt=resultado;
      },
      error:(e:any)=>{
        this.verificacionEfsrtCargando=false;
        this.verificacionEfsrt=null;
        this.verificacionEfsrtError=e?.error?.mensaje || 'No se pudo comprobar la base de datos. Revisa Laravel y MySQL.';
      }
    });
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
        this.dashboard=null;
        this.mostrarError(e);
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
    if(!this.caja?.caja_abierta){
      this.error='Abre Caja antes de confirmar un pago en efectivo.';
      return;
    }
    if(!confirm('¿Confirmar que recepción recibió el pago en efectivo?'))return;
    this.api.confirmarPagoPendiente(Number(p.id_pago)).subscribe({
      next:r=>{this.ok(r?.mensaje||'Pago confirmado');this.cargarPagos();this.cargarMembresias();this.cargarCaja();this.cargarDashboard();},
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
        const principal=this.entrenadores.find((e:any)=>String(e?.estado||'').toLowerCase()==='activo') ?? this.entrenadores[0];
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
  cargarReservas(){
    this.api.reservas().subscribe({
      next:r=>this.reservas=Array.isArray(r)?r:[],
      error:e=>{
        this.reservas=[];
        this.mostrarError(e);
      }
    });
  }
  cargarUsuarios(){ this.api.usuarios().subscribe({next:r=>this.usuarios=r,error:e=>this.mostrarError(e)}); }
  cargarOpiniones(){ this.api.opinionesClientes().subscribe({next:r=>this.opiniones=r||[],error:e=>this.mostrarError(e)}); }
  cargarAuditoria(){
    const f:any={};
    if(this.auditoriaFiltros.ruta)f.ruta=this.auditoriaFiltros.ruta;
    if(this.auditoriaFiltros.desde)f.desde=this.auditoriaFiltros.desde;
    if(this.auditoriaFiltros.hasta)f.hasta=this.auditoriaFiltros.hasta;
    this.api.auditorias(f).subscribe({next:r=>{this.auditorias=r;this.auditoriaPagina=1;},error:e=>this.mostrarError(e)});
  }
  /**
   * Ejecutar una única vez en Inicio. Solo afecta códigos y nombres de
   * demostración que valida otra vez la API; nunca toca artículos reales.
   */
  private revisarFotosDemoDelInicio(): void {
    if(this.fotosDemoInicioIntentadas) return;
    const anteriores = new Set([
      'Creatina','Shaker gris','BCAA','Shaker azul','Big M',
      'Collagen Pro','NOXRAGE','Pro Mass XL','AN USA (cajas)',
      'NOXRAGE (presentación alternativa)'
    ]);
    const necesitaRevision = this.productos.some((p:any)=>{
      const codigo=String(p?.codigo_producto||'');
      const nombre=String(p?.nombre_producto||'');
      return /^PROD-(?:00[1-9]|0010|010)$/.test(codigo)
        && (/^Producto Prueba (?:[1-9]|10)$/.test(nombre) || anteriores.has(nombre));
    });
    if(!necesitaRevision) return;
    this.fotosDemoInicioIntentadas=true;
    this.api.completarFotosIniciales().subscribe({
      next:resultado=>{
        if(resultado.actualizados>0){
          this.api.productos().subscribe({
            next:productos=>{ this.productos=Array.isArray(productos)?productos:[]; },
            error:()=>{ this.error='Las fotos se actualizaron, pero falló la recarga del inventario.'; }
          });
        }
        if(resultado.observaciones?.length){
          this.error='Revisión de fotografías: '+resultado.observaciones.join(' ');
        }
      },
      error:e=>{
        this.error=e?.error?.mensaje || 'No fue posible completar fotografías y nombres de prueba en MySQL.';
      }
    });
  }

  cargarProductos(){ this.api.productos().subscribe({next:r=>this.productos=r,error:e=>this.mostrarError(e)}); }
  cargarProveedores(){ this.api.proveedores().subscribe({next:r=>this.proveedores=r,error:e=>this.mostrarError(e)}); }
  cargarCompras(){ this.api.compras().subscribe({next:r=>this.compras=r,error:e=>this.mostrarError(e)}); }
  cargarVentas(){ this.api.ventas().subscribe({next:r=>this.ventas=r,error:e=>this.mostrarError(e)}); }
  cargarKardex(){ this.api.kardex().subscribe({next:r=>this.kardex=r,error:e=>this.mostrarError(e)}); }
  cargarCaja(){
    this.cajaCargando=true;
    this.cajaError='';
    forkJoin({
      actual:this.api.cajaActual(),
      historial:this.api.historialCaja()
    }).subscribe({
      next:({actual,historial})=>{
        this.caja=actual;
        this.historialCaja=Array.isArray(historial)?historial:[];
        this.cajaCargando=false;
      },
      error:e=>{
        this.caja=null;
        this.historialCaja=[];
        this.cajaCargando=false;
        this.cajaError='No se pudieron consultar ambos registros de caja en Laravel y MySQL';
        this.mostrarError(e);
      }
    });
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
    const crearAccesoSolicitado=!this.clienteEditandoId && Boolean(datos.crear_acceso);
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
        const nuevoId=Number(r?.cliente?.id_cliente||0);
        this.cancelarEdicionCliente();
        this.cargarClientes();
        this.cargarDashboard();

        if(!eraEdicion && nuevoId){
          this.cambiarSegcion('membresias');
          setTimeout(()=>{
            this.membresiaForm={...this.membresiaForm,id_cliente:nuevoId};
            this.ok(crearAccesoSolicitado
              ? 'Socio matriculado y acceso creado. Ahora asigna su plan o membresía.'
              : 'Socio matriculado. Ahora asigna su plan o membresía.');
          },0);
          return;
        }

        this.ok(r?.mensaje || 'Cliente actualizado correctamente');
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
    if(this.membresiaForm.metodo_pago==='Efectivo' && !this.caja?.caja_abierta){
      this.error='Abre Caja antes de cobrar una membresía en efectivo. Los pagos digitales no requieren Caja abierta.';
      return;
    }
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
  desactivarPlan(id:number){if(!confirm('¿Desactivar esta tarifa?'))return;this.api.eliminarMembresia(id).subscribe({next:r=>{this.ok(r.mensaje||'Tarifa desactivada');this.cargarMembresias();this.cargarDashboard();},error:e=>this.mostrarError(e)});}

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
    const entrenadorPrincipal=this.entrenadores.find((e:any)=>String(e?.estado||'').toLowerCase()==='activo');
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
  desactivarClase(id:number){ if(!confirm('¿Desactivar esta clase?')) return; this.api.desactivarClase(id).subscribe({next:()=>{this.ok('Clase desactivada');this.cancelarEdicionClase();this.cargarClases();this.cargarReservas();this.cargarDashboard();},error:e=>this.mostrarError(e)}); }

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
  anularCompra(id:number){ if(!confirm('¿Anular esta compra?')) return; this.api.anularCompra(id).subscribe({next:r=>{this.ok(r.mensaje||'Compra anulada');this.cargarCompras();this.cargarProductos();this.cargarKardex();this.cargarDashboard();},error:e=>this.mostrarError(e)}); }

  agregarItemVenta(){ if(!this.ventaForm.id_producto || Number(this.ventaForm.cantidad)<1){this.error='Selecciona producto y cantidad.';return;} const p=this.productos.find(x=>x.id_producto===this.ventaForm.id_producto); if(!p || Number(p.stock)<Number(this.ventaForm.cantidad)){this.error='Stock insuficiente para agregar ese producto.';return;} if(this.ventaItems.some(i=>i.id_producto===this.ventaForm.id_producto)){this.error='Ese producto ya está en el carrito.';return;} this.ventaItems.push({id_producto:this.ventaForm.id_producto,cantidad:Number(this.ventaForm.cantidad)});this.ventaForm.id_producto=0;this.ventaForm.cantidad=1; }
  quitarItemVenta(i:number){this.ventaItems.splice(i,1);}
  get totalVentaPreview():number{return this.ventaItems.reduce((s,i)=>s+(Number(i.cantidad)*this.precioProducto(i.id_producto)),0);}
  get subtotalVentaPreview():number{const f=1+(Number(this.ventaForm.igv_porcentaje||0)/100);return f>0?this.totalVentaPreview/f:this.totalVentaPreview;}
  get igvVentaPreview():number{return this.totalVentaPreview-this.subtotalVentaPreview;}
  registrarVenta(){
    if(!this.caja?.caja_abierta){this.error='Abre Caja antes de registrar una venta.';return;}
    if(!this.ventaForm.id_cliente){this.error='Selecciona el socio que realiza la compra.';return;}
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

  clienteSeleccionadoRutina():any|null {
    return this.clientes.find((c:any)=>
      Number(c.id_cliente)===Number(this.rutinaForm.id_cliente)) || null;
  }

  /** Sugerencias iniciales de la semana 06: se revisan y guardan por el
   * entrenador desde el formulario existente, nunca se almacenan solas.
   * Evitar cargas máximas o rutinas médicas calculadas automáticamente.
   */
  prepararRutinaSegunPerfil():void {
    if (this.rutinaEditandoId) return;
    const cliente=this.clienteSeleccionadoRutina();
    if (!cliente) {
      this.error='Selecciona un socio registrado para preparar su rutina.';
      return;
    }
    if (String(this.rutinaForm.nombre_rutina||'').trim() ||
        this.rutinaDetallesForm.some((d:any)=>String(d.ejercicio||'').trim())) {
      this.error='Ya hay una rutina escrita. Guarda o limpia el formulario antes de generar otra propuesta.';
      return;
    }
    const nivelOriginal=String(cliente.nivel_entrenamiento||'').toLowerCase();
    const nivel=nivelOriginal.includes('avanz')?'Avanzado'
      :nivelOriginal.includes('intermed')?'Intermedio':'Principiante';
    const enfoqueOriginal=String(cliente.enfoque_entrenamiento||'').toLowerCase();
    const tipo=enfoqueOriginal.includes('cardio') || enfoqueOriginal.includes('peso') ||
      enfoqueOriginal.includes('aerob')?'Cardiovascular'
      :enfoqueOriginal.includes('cross')?'Funcional'
      :enfoqueOriginal.includes('masa') || enfoqueOriginal.includes('fuerza')?'Fuerza'
      :enfoqueOriginal.includes('tonif')?'Tonificación':'General';
    const ejercicios:Record<string,string[]>={
      Cardiovascular:['Marcha o caminata controlada','Movilidad de cuerpo completo','Sentadilla asistida'],
      Funcional:['Sentadilla con peso corporal','Remo con banda elástica','Paso lateral controlado'],
      Fuerza:['Sentadilla con peso corporal','Remo con banda elástica','Flexión inclinada'],
      Tonificación:['Sentadilla asistida','Puente de glúteos','Remo con banda elástica'],
      General:['Movilidad articular','Sentadilla asistida','Estiramiento dinámico suave']
    };
    const series=nivel==='Principiante'?2:3;
    const repeticiones=nivel==='Avanzado'?12:10;
    this.rutinaForm.nombre_rutina=`Plan ${tipo} - ${nivel}`;
    this.rutinaForm.objetivo=tipo==='Cardiovascular'?'Mejorar resistencia y movilidad'
      :tipo==='Fuerza'?'Desarrollar fuerza progresivamente'
      :tipo==='Tonificación'?'Mejorar condición muscular'
      :'Mejorar condición física y técnica';
    this.rutinaForm.descripcion=`Propuesta inicial para nivel ${nivel.toLowerCase()}, enfoque ${tipo.toLowerCase()}. El entrenador debe revisar condiciones personales, técnica y progresión antes de asignarla.`;
    this.rutinaDetallesForm=ejercicios[tipo].map(ejercicio=>({
      ejercicio,series,repeticiones,peso_recomendado:null,
      descanso_segundos:60,observaciones:'Ajustar tiempo, carga y técnica con el entrenador.'
    }));
    this.error='';
    this.ok('Propuesta preparada. Revisa los ejercicios antes de asignarla al socio.');
  }

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

  get fechaMinimaReserva():string{
    const hoy=new Date();
    return [
      hoy.getFullYear(),
      String(hoy.getMonth()+1).padStart(2,'0'),
      String(hoy.getDate()).padStart(2,'0')
    ].join('-');
  }

  editarReservaAdmin(reserva:any):void{
    if(!this.reservaAdmiteCambioEstado(reserva)){
      this.error='No se puede editar una reserva finalizada o cancelada.';
      return;
    }
    this.reservaEditandoId=Number(reserva.id_reserva);
    this.reservaForm={
      id_cliente:Number(reserva.id_cliente||reserva.cliente?.id_cliente||0),
      id_clase:Number(reserva.id_clase||reserva.clase?.id_clase||0),
      fecha_clase:String(reserva.fecha_clase||'').slice(0,10)
    };
    this.error='';
    window.scrollTo({top:0,behavior:'smooth'});
  }

  cancelarEdicionReservaAdmin():void{
    this.reservaEditandoId=0;
    this.reservaGuardando=false;
    this.reservaForm={id_cliente:0,id_clase:0,fecha_clase:''};
  }

  guardarReservaAdmin():void{
    if(this.reservaGuardando)return;
    const datos={
      id_cliente:Number(this.reservaForm.id_cliente||0),
      id_clase:Number(this.reservaForm.id_clase||0),
      fecha_clase:String(this.reservaForm.fecha_clase||'').slice(0,10)
    };
    if(!datos.id_cliente||!datos.id_clase||!datos.fecha_clase){
      this.error='Selecciona socio, clase y fecha para guardar la reserva.';
      return;
    }
    if(datos.fecha_clase<this.fechaMinimaReserva){
      this.error='La fecha de la reserva no puede ser anterior a hoy.';
      return;
    }
    const editando=this.reservaEditandoId;
    this.reservaGuardando=true;
    this.error='';
    const peticion=editando
      ?this.api.actualizarReservaAdmin(editando,datos)
      :this.api.crearReservaAdmin(datos);
    peticion.subscribe({
      next:(r:any)=>{
        this.reservaGuardando=false;
        this.cancelarEdicionReservaAdmin();
        this.ok(r?.mensaje||(editando?'Reserva actualizada':'Reserva registrada'));
        this.cargarReservas();
        this.cargarDashboard();
      },
      error:e=>{
        this.reservaGuardando=false;
        this.mostrarError(e);
      }
    });
  }

  cancelarReservaAdmin(reserva:any):void{
    if(!this.reservaAdmiteCambioEstado(reserva))return;
    if(!confirm('¿Cancelar la reserva? Se conservará su historial.'))return;
    this.api.eliminarReservaAdmin(Number(reserva.id_reserva)).subscribe({
      next:(r:any)=>{
        this.ok(r?.mensaje||'Reserva cancelada');
        if(this.reservaEditandoId===Number(reserva.id_reserva))this.cancelarEdicionReservaAdmin();
        this.cargarReservas();
        this.cargarDashboard();
      },
      error:e=>this.mostrarError(e)
    });
  }

  /** Los estados finalizados no deben editarse desde los botones del dashboard. */
  reservaAdmiteCambioEstado(reserva:any):boolean{
    return ['Reservada','Confirmada'].includes(String(reserva?.estado||''));
  }

  cambiarEstadoReserva(id:number,estado:string){
    const reserva=this.reservas.find((r:any)=>Number(r.id_reserva)===Number(id));
    if(reserva && !this.reservaAdmiteCambioEstado(reserva)){
      this.error='La reserva está finalizada o cancelada. Actualiza el listado antes de intentar otra acción.';
      return;
    }
    this.api.cambiarEstadoReserva(id,estado).subscribe({
      next:r=>{this.ok(r.mensaje||'Reserva actualizada');this.cargarReservas();this.cargarDashboard();},
      error:e=>this.mostrarError(e)
    });
  }

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

  abrirCaja(){ this.api.abrirCaja(Number(this.cajaAbrirForm.monto_inicial),this.cajaAbrirForm.observacion).subscribe({next:r=>{this.ok(r.mensaje||'Caja abierta');this.cargarCaja();this.cargarDashboard();},error:e=>this.mostrarError(e)}); }
  movimientoCaja(){ this.api.movimientoCaja(this.movCajaForm.tipo,'Manual',this.movCajaForm.descripcion,Number(this.movCajaForm.monto)).subscribe({next:r=>{this.ok(r.mensaje||'Movimiento registrado');this.movCajaForm={tipo:'Ingreso',monto:0,descripcion:'',origen:'Manual'};this.cargarCaja();this.cargarDashboard();},error:e=>this.mostrarError(e)}); }
  cerrarCaja(){ if(!confirm('¿Cerrar la caja actual?')) return; this.api.cerrarCaja(Number(this.cajaCerrarForm.monto_real),this.cajaCerrarForm.observacion).subscribe({next:r=>{this.ok(r.mensaje||'Caja cerrada');this.cajaCerrarForm={monto_real:0,observacion:''};this.cargarCaja();this.cargarDashboard();},error:e=>this.mostrarError(e)}); }

  private configuracionSinDatos():any {
    // Sólo campos vacíos para el modo diagnóstico; NUNCA se envían como
    // configuración del gimnasio si la consulta MySQL falló.
    return {
      nombre_gimnasio:'',ruc:'',telefono:'',correo:'',direccion:'',
      referencia:'',frase_publicitaria:'',horario_detalle:'',
      tarifa_diaria:null,mensaje_productos:'',hora_apertura:'',
      hora_cierre:'',dias_atencion:[],dias_aviso_vencimiento:null,
      minutos_cancelacion_reserva:null,dias_anticipacion_reserva:null,
      stock_minimo_default:null,notificar_vencimientos:false,
      notificar_stock_bajo:false,notificar_pagos_pendientes:false
    };
  }

  get estadoConfiguracionTexto():string {
    if(this.configCargando) return 'Consultando MySQL';
    if(!this.configDisponible || !this.configEstado) return 'Conexión sin verificar';
    if(this.configEstado?.api!==true || this.configEstado?.mysql!==true) return 'Revisar conexión';
    if(this.configEstado?.operativo===false) return 'MySQL conectado · esquema pendiente';
    if(this.configEstado?.operativo===true) return 'Sistema verificado';
    return 'MySQL conectado · módulos sin verificar';
  }

  /** Revisa también el esquema operativo, no solo si SELECT 1 responde. */
  comprobarEsquemaConfiguracion():void {
    this.api.estadoOperativo().subscribe({
      next:diagnostico=>{
        if(this.configEstado){
          this.configEstado={
            ...this.configEstado,
            operativo:diagnostico?.operativo===true,
            faltantes:Array.isArray(diagnostico?.faltantes)?diagnostico.faltantes:[]
          };
        }
      },
      error:()=>{ if(this.configEstado)this.configEstado={...this.configEstado,operativo:null}; }
    });
  }

  cargarConfiguracion(){
    this.configCargando=true;
    this.configDisponible=false;
    this.configError='';
    this.configEstado=null;
    this.api.configuracion().subscribe({
      next:r=>{
        const cfg=r?.configuracion;
        if(!cfg || !cfg.nombre_gimnasio){
          this.configCargando=false;
          this.configDisponible=false;
          this.configuracionForm=this.configuracionSinDatos();
          this.configError='El servidor no entregó datos confirmados de configuración. Comprueba la base seleccionada por Laravel.';
          return;
        }
        this.configuracionForm={
          ...this.configuracionForm,
          ...cfg,
          hora_apertura:String(cfg.hora_apertura||'').slice(0,5),
          hora_cierre:String(cfg.hora_cierre||'').slice(0,5),
          dias_atencion:Array.isArray(cfg.dias_atencion)?cfg.dias_atencion:[]
        };
        this.configUltimoGuardado=String(cfg.updated_at||'');
        this.configEstado=r?.estado||null;
        this.ultimoRespaldo=r?.ultimo_respaldo||null;
        this.configDisponible=true;
        this.configCargando=false;
        this.comprobarEsquemaConfiguracion();
      },
      error:e=>{
        this.configCargando=false;
        this.configDisponible=false;
        // Evitar confundir los valores predeterminados con datos reales:
        // la pantalla sigue mostrando las secciones, pero vacías.
        this.configuracionForm=this.configuracionSinDatos();
        this.configEstado=null;
        this.configUltimoGuardado='';
        this.ultimoRespaldo=null;
        const estado=Number(e?.status||0);
        const causa=String(e?.error?.codigo||'');
        if(causa==='CONFIGURACION_TABLA_AUSENTE'){
          this.configError='Falta la tabla configuracion_sistema. Respalda MySQL y aplica las migraciones de BACKEND.';
        }else if(causa==='CONFIGURACION_COLUMNAS_AUSENTES'){
          this.configError='Faltan columnas de configuración en MySQL: '+(Array.isArray(e?.error?.faltantes)?e.error.faltantes.join(', '):'revisar las migraciones')+'.';
        }else if(estado===401||estado===403){
          this.configError='Sesión o permisos de administrador no válidos. Vuelve a iniciar sesión.';
        }else if(estado===404){
          this.configError='Laravel no reconoce /api/configuracion. Reinicia el backend actualizado y revisa sus rutas.';
        }else if(estado===0){
          this.configError='No hay conexión con Laravel. Revisa que el backend esté iniciado y que Angular tenga el proxy de API activo.';
        }else{
          this.configError='El servidor respondió HTTP '+(estado||'desconocido')+'. Comprueba conexión, tabla configuracion_sistema y registros de Laravel.';
        }
        this.error=this.configError;
      }
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
    if(!this.configDisponible){
      this.error='Primero carga la configuración real desde MySQL.';
      return;
    }
    if(!String(this.configuracionForm.nombre_gimnasio||'').trim()){
      this.error='Ingresa el nombre del gimnasio.';
      return;
    }
    const ruc=String(this.configuracionForm.ruc||'').trim();
    if(ruc && !/^\d{11}$/.test(ruc)){
      this.error='El RUC debe contener exactamente 11 dígitos, o dejarse vacío.';
      return;
    }
    const inicio=String(this.configuracionForm.hora_apertura||'').slice(0,5);
    const fin=String(this.configuracionForm.hora_cierre||'').slice(0,5);
    if(!/^\d{2}:\d{2}$/.test(inicio) || !/^\d{2}:\d{2}$/.test(fin) || fin<=inicio){
      this.error='La hora de cierre habitual debe ser posterior a la apertura.';
      return;
    }
    if(!Array.isArray(this.configuracionForm.dias_atencion) ||
       this.configuracionForm.dias_atencion.length===0){
      this.error='Selecciona al menos un día de atención.';
      return;
    }
    if(this.configuracionForm.correo &&
       !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(this.configuracionForm.correo).trim())){
      this.error='Ingresa un correo de contacto válido o deja el campo vacío.';
      return;
    }
    this.error='';
    this.configGuardando=true;
    const datos={
      ...this.configuracionForm,
      ruc:ruc||null,
      hora_apertura:inicio,
      hora_cierre:fin
    };
    this.api.guardarConfiguracion(datos).subscribe({
      next:r=>{
        this.configGuardando=false;
        if(!r?.configuracion){
          this.error='El servidor respondió sin confirmar los datos guardados.';
          return;
        }
        this.configuracionForm={
          ...this.configuracionForm,
          ...r.configuracion,
          hora_apertura:String(r.configuracion.hora_apertura||datos.hora_apertura).slice(0,5),
          hora_cierre:String(r.configuracion.hora_cierre||datos.hora_cierre).slice(0,5)
        };
        this.configUltimoGuardado=String(r.configuracion.updated_at||'');
        this.ok('Configuración guardada en MySQL. Se reflejará también en el portal.');
      },
      error:e=>{this.configGuardando=false;this.mostrarError(e);}
    });
  }

  verificarSistemaConfiguracion(){
    this.configAccion='estado';
    this.api.estadoSistema().subscribe({
      next:r=>{
        this.configAccion='';
        this.configEstado=r;
        this.comprobarEsquemaConfiguracion();
        this.ok(r.mysql?'MySQL conectado; revisando la estructura de los módulos.':'La API responde, pero MySQL requiere revisión.');
      },
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
    if(t==='soporte'){ this.cambiarSegcion('soporte'); return; }
    if(t==='reserva'){ this.cambiarSegcion('reservas'); return; }
    if(t==='pago'){ this.cambiarSegcion('pagos'); return; }
    if(t==='opinion'){ this.cambiarSegcion('opiniones'); return; }
  }

  irAlertasPendientes():void{
    if((this.dashboard?.alertas?.rutinas_pendientes ?? 0)>0 || (this.dashboard?.alertas?.soporte_pendiente ?? 0)>0){
      this.cambiarSegcion('soporte');
      return;
    }
    if((this.dashboard?.alertas?.opiniones_pendientes ?? 0)>0){
      this.cambiarSegcion('opiniones');
      return;
    }
    if((this.dashboard?.inventario?.productos_stock_bajo ?? 0)>0){
      this.cambiarSegcion('inventario');
      return;
    }
    if((this.dashboard?.membresias?.por_vencer_7_dias ?? 0)>0){
      this.cambiarSegcion('membresias');
      return;
    }
    this.cambiarSegcion('dashboard');
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
    this.cambiarSegcion('rutinas');
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
  duracionAsistencia(a:any):string{
    if(!a?.fecha_hora_entrada || !a?.fecha_hora_salida) return '-';
    const ini=new Date(a.fecha_hora_entrada).getTime();
    const fin=new Date(a.fecha_hora_salida).getTime();
    if(!Number.isFinite(ini)||!Number.isFinite(fin)||fin<ini) return '-';
    const mins=Math.round((fin-ini)/60000);
    const h=Math.floor(mins/60), m=mins%60;
    return h>0 ? h+'h '+m+'m' : m+'m';
  }

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
