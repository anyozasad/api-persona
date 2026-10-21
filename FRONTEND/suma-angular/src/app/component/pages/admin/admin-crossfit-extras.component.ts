import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface ExtraConfig {
  title: string;
  subtitle: string;
  icon: string;
  group: string;
}

@Component({
  selector: 'app-admin-crossfit-extras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <section class="cfx-page" *ngIf="config">
    <div class="cfx-crumb">
      <span>⌂</span><small>Inicio</small><b>›</b><strong>{{config.title}}</strong>
      <em>{{config.group}}</em>
    </div>

    <section class="cfx-hero">
      <div>
        <span class="cfx-kicker">MALLQUI GYM · {{config.group | uppercase}}</span>
        <h1>{{config.title}}</h1>
        <p>{{config.subtitle}}</p>
        <div class="cfx-metrics">
          <article><i>{{config.icon}}</i><b>{{metric1}}</b><small>Elementos</small></article>
          <article><i>✓</i><b>Activo</b><small>Estado</small></article>
          <article><i>▦</i><b>Responsive</b><small>Diseño</small></article>
          <article><i>⚡</i><b>Bootstrap UI</b><small>Referencia</small></article>
        </div>
      </div>
      <aside>
        <div class="cfx-art-orb one"></div>
        <div class="cfx-art-orb two"></div>
        <div class="cfx-art-card"><span>{{config.icon}}</span><b>{{config.title}}</b><small>Mallqui Gym</small></div>
        <div class="cfx-art-chart"><i style="height:38%"></i><i style="height:62%"></i><i style="height:48%"></i><i style="height:82%"></i><i style="height:70%"></i></div>
      </aside>
    </section>

    <ng-container [ngSwitch]="section">

      <section class="cfx-grid cfx-grid-2" *ngSwitchCase="'tables'">
        <article class="cfx-card span-2">
          <header><div><span>TABLES</span><h2>Tabla administrativa</h2></div><button (click)="addRow()">＋ Agregar fila</button></header>
          <div class="cfx-table-wrap">
            <table>
              <thead><tr><th>Nombre</th><th>Módulo</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr></thead>
              <tbody><tr *ngFor="let row of demoRows">
                <td><b>{{row.name}}</b></td><td>{{row.module}}</td><td><span class="cfx-badge success">{{row.status}}</span></td><td>{{row.date}}</td>
                <td><button class="tiny" (click)="row.status=row.status==='Activo'?'Revisión':'Activo'">Editar</button></td>
              </tr></tbody>
            </table>
          </div>
        </article>
      </section>

      <section class="cfx-grid cfx-grid-2" *ngSwitchCase="'data-tables'">
        <article class="cfx-card span-2">
          <header><div><span>DATA TABLE</span><h2>Buscar y filtrar registros</h2></div></header>
          <div class="cfx-toolbar"><input [(ngModel)]="search" placeholder="Buscar registro..."><select [(ngModel)]="filter"><option value="">Todos</option><option>Activo</option><option>Pendiente</option></select></div>
          <div class="cfx-table-wrap"><table>
            <thead><tr><th>ID</th><th>Nombre</th><th>Módulo</th><th>Estado</th><th>Fecha</th></tr></thead>
            <tbody><tr *ngFor="let row of filteredRows"><td>#{{row.id}}</td><td><b>{{row.name}}</b></td><td>{{row.module}}</td><td><span class="cfx-badge">{{row.status}}</span></td><td>{{row.date}}</td></tr></tbody>
          </table></div>
        </article>
      </section>

      <section class="cfx-grid cfx-grid-3" *ngSwitchCase="'graphs'">
        <article class="cfx-card"><header><div><span>BAR CHART</span><h2>Rendimiento</h2></div></header><div class="cfx-bars"><i *ngFor="let h of bars" [style.height.%]="h"></i></div></article>
        <article class="cfx-card"><header><div><span>LINE CHART</span><h2>Tendencia</h2></div></header><svg class="cfx-line" viewBox="0 0 300 130"><polyline points="10,105 55,75 100,90 145,42 190,64 235,28 290,55" fill="none" stroke="#5b56dd" stroke-width="4"/></svg></article>
        <article class="cfx-card"><header><div><span>DONUT</span><h2>Distribución</h2></div></header><div class="cfx-donut"><b>78%</b></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2" *ngSwitchCase="'apex'">
        <article class="cfx-card"><header><div><span>APEX STYLE</span><h2>Área mensual</h2></div></header><div class="cfx-area"><svg viewBox="0 0 420 170" preserveAspectRatio="none"><path d="M0 145 C60 115,80 145,130 86 S210 40,260 82 S350 30,420 58 L420 170 L0 170Z" fill="#eceaff"/><path d="M0 145 C60 115,80 145,130 86 S210 40,260 82 S350 30,420 58" fill="none" stroke="#5b56dd" stroke-width="4"/></svg></div></article>
        <article class="cfx-card"><header><div><span>APEX STYLE</span><h2>Barras</h2></div></header><div class="cfx-bars"><i *ngFor="let h of bars2" [style.height.%]="h"></i></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2" *ngSwitchCase="'morris'">
        <article class="cfx-card"><header><div><span>MORRIS STYLE</span><h2>Línea de actividad</h2></div></header><svg class="cfx-line tall" viewBox="0 0 420 180"><polyline points="5,150 55,115 105,132 155,70 205,92 255,44 305,65 355,24 415,52" fill="none" stroke="#6c66e8" stroke-width="4"/></svg></article>
        <article class="cfx-card"><header><div><span>MORRIS STYLE</span><h2>Área comparativa</h2></div></header><div class="cfx-bars"><i *ngFor="let h of bars3" [style.height.%]="h"></i></div></article>
      </section>

      <section class="cfx-grid cfx-grid-1" *ngSwitchCase="'vector-maps'">
        <article class="cfx-card">
          <header><div><span>VECTOR MAP</span><h2>Ubicación y cobertura</h2></div></header>
          <div class="cfx-map"><div class="pin p1">1</div><div class="pin p2">2</div><div class="pin p3">3</div><span>PUCALLPA · UCAYALI</span></div>
        </article>
      </section>

      <section class="cfx-grid cfx-grid-2" *ngSwitchCase="'accordions'">
        <article class="cfx-card span-2"><header><div><span>ACCORDIONS</span><h2>Preguntas del sistema</h2></div></header>
          <div class="cfx-accordion" *ngFor="let item of accordionItems; let i=index">
            <button (click)="accordionOpen=accordionOpen===i?-1:i"><b>{{item.q}}</b><span>{{accordionOpen===i?'−':'＋'}}</span></button>
            <p *ngIf="accordionOpen===i">{{item.a}}</p>
          </div>
        </article>
      </section>

      <section class="cfx-grid cfx-grid-1" *ngSwitchCase="'carousel'">
        <article class="cfx-card"><header><div><span>CAROUSEL</span><h2>Contenido destacado</h2></div></header>
          <div class="cfx-carousel"><button (click)="prevSlide()">‹</button><div><span>{{slides[slide].icon}}</span><h2>{{slides[slide].title}}</h2><p>{{slides[slide].text}}</p></div><button (click)="nextSlide()">›</button></div>
        </article>
      </section>

      <section class="cfx-grid cfx-grid-3" *ngSwitchCase="'modals'">
        <article class="cfx-card"><h2>Modal básico</h2><p>Ejemplo de confirmación.</p><button class="primary" (click)="modal='basic'">Abrir modal</button></article>
        <article class="cfx-card"><h2>Modal de formulario</h2><p>Entrada rápida de datos.</p><button class="primary" (click)="modal='form'">Abrir formulario</button></article>
        <article class="cfx-card"><h2>Modal de alerta</h2><p>Confirmación visual.</p><button class="danger" (click)="modal='danger'">Abrir alerta</button></article>
      </section>

      <section class="cfx-grid cfx-grid-3" *ngSwitchCase="'popovers'">
        <article class="cfx-card"><h2>Popover superior</h2><button class="primary" (click)="popover=popover===1?0:1">Mostrar</button><div class="cfx-pop" *ngIf="popover===1">Información rápida del módulo.</div></article>
        <article class="cfx-card"><h2>Popover lateral</h2><button class="primary" (click)="popover=popover===2?0:2">Mostrar</button><div class="cfx-pop" *ngIf="popover===2">Acción administrativa disponible.</div></article>
        <article class="cfx-card"><h2>Popover de estado</h2><button class="primary" (click)="popover=popover===3?0:3">Mostrar</button><div class="cfx-pop" *ngIf="popover===3">Sistema operativo.</div></article>
      </section>

      <section class="cfx-grid cfx-grid-1" *ngSwitchCase="'tabs-ui'">
        <article class="cfx-card"><header><div><span>TABS</span><h2>Navegación interna</h2></div></header>
          <div class="cfx-tabs"><button *ngFor="let t of ['General','Actividad','Seguridad','Historial'];let i=index" [class.active]="tab===i" (click)="tab=i">{{t}}</button></div>
          <div class="cfx-tab-content"><h2>{{['General','Actividad','Seguridad','Historial'][tab]}}</h2><p>Contenido de ejemplo para esta pestaña del sistema.</p></div>
        </article>
      </section>

      <section class="cfx-grid cfx-grid-4" *ngSwitchCase="'tooltips'">
        <article class="cfx-card centered" *ngFor="let t of ['Socios','Pagos','Rutinas','Reportes']"><button class="cfx-tooltip">{{t}}<span>Ir a {{t}}</span></button></article>
      </section>

      <section class="cfx-grid cfx-grid-2" *ngSwitchCase="'forms'">
        <article class="cfx-card"><header><div><span>FORM</span><h2>Formulario básico</h2></div></header><div class="cfx-form"><label>Nombre<input [(ngModel)]="form.name" placeholder="Nombre"></label><label>Correo<input [(ngModel)]="form.email" type="email" placeholder="correo@ejemplo.com"></label><label>Estado<select [(ngModel)]="form.status"><option>Activo</option><option>Pendiente</option></select></label><button class="primary" (click)="saved=true">Guardar</button><small *ngIf="saved">✓ Formulario validado.</small></div></article>
        <article class="cfx-card"><header><div><span>FORM</span><h2>Observaciones</h2></div></header><div class="cfx-form"><label>Fecha<input type="date"></label><label>Tipo<select><option>General</option><option>Administrativo</option></select></label><label>Detalle<textarea rows="5"></textarea></label></div></article>
      </section>

      <section class="cfx-grid cfx-grid-3" *ngSwitchCase="'form-inputs'">
        <article class="cfx-card"><h2>Text inputs</h2><div class="cfx-form"><input placeholder="Texto"><input type="email" placeholder="Email"><input type="number" placeholder="Número"></div></article>
        <article class="cfx-card"><h2>Selects</h2><div class="cfx-form"><select><option>Socio</option><option>Entrenador</option></select><select><option>Activo</option><option>Inactivo</option></select></div></article>
        <article class="cfx-card"><h2>Textarea</h2><div class="cfx-form"><textarea rows="6" placeholder="Escribe una observación..."></textarea></div></article>
      </section>

      <section class="cfx-grid cfx-grid-3" *ngSwitchCase="'checkbox-radio'">
        <article class="cfx-card"><h2>Checkbox</h2><label class="check"><input type="checkbox" checked> Socio activo</label><label class="check"><input type="checkbox"> Recibir alertas</label></article>
        <article class="cfx-card"><h2>Radio</h2><label class="check"><input type="radio" name="r" checked> Administrador</label><label class="check"><input type="radio" name="r"> Entrenador</label></article>
        <article class="cfx-card"><h2>Switch</h2><label class="switch"><input type="checkbox" checked><span></span> Sistema habilitado</label></article>
      </section>

      <section class="cfx-grid cfx-grid-2" *ngSwitchCase="'file-input'">
        <article class="cfx-card"><header><div><span>UPLOAD</span><h2>Cargar archivo</h2></div></header><label class="cfx-upload"><span>⇧</span><b>Selecciona un archivo</b><small>Imagen, PDF o documento</small><input type="file" (change)="fileSelected($event)"></label></article>
        <article class="cfx-card"><h2>Archivo seleccionado</h2><div class="cfx-file-result"><span>▤</span><b>{{selectedFile || 'Ningún archivo'}}</b></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2" *ngSwitchCase="'validations'">
        <article class="cfx-card"><header><div><span>VALIDATION</span><h2>Validación de formulario</h2></div></header><div class="cfx-form"><label>Nombre *<input [(ngModel)]="validation.name" [class.invalid]="validationTried&&!validation.name"></label><label>Correo *<input [(ngModel)]="validation.email" [class.invalid]="validationTried&&!validEmail"></label><button class="primary" (click)="validationTried=true">Validar</button><small *ngIf="validationTried&&validation.name&&validEmail">✓ Datos correctos.</small></div></article>
        <article class="cfx-card"><h2>Estado</h2><div class="cfx-validation-state" [class.ok]="validation.name&&validEmail"><span>{{validation.name&&validEmail?'✓':'!'}}</span><b>{{validation.name&&validEmail?'Formulario válido':'Completa los campos'}}</b></div></article>
      </section>

      <section class="cfx-grid cfx-grid-3" *ngSwitchCase="'date-time'">
        <article class="cfx-card"><h2>Fecha</h2><input class="cfx-input" type="date"></article>
        <article class="cfx-card"><h2>Hora</h2><input class="cfx-input" type="time"></article>
        <article class="cfx-card"><h2>Fecha y hora</h2><input class="cfx-input" type="datetime-local"></article>
      </section>

      <section class="cfx-grid cfx-grid-2" *ngSwitchCase="'input-masks'">
        <article class="cfx-card"><h2>Formatos</h2><div class="cfx-form"><label>DNI<input maxlength="8" placeholder="12345678"></label><label>Teléfono<input placeholder="+51 999 999 999"></label></div></article>
        <article class="cfx-card"><h2>Finanzas</h2><div class="cfx-form"><label>Moneda<input placeholder="S/ 0.00"></label><label>Fecha<input placeholder="21/10/2026"></label></div></article>
      </section>

      <section class="cfx-grid cfx-grid-1" *ngSwitchCase="'input-tags'">
        <article class="cfx-card"><header><div><span>TAGS</span><h2>Etiquetas</h2></div></header><div class="cfx-tag-editor"><span *ngFor="let tag of tags">{{tag}} <button (click)="removeTag(tag)">×</button></span><input [(ngModel)]="newTag" (keydown.enter)="addTag()" placeholder="Agregar etiqueta y Enter"></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2" *ngSwitchCase="'alerts'">
        <article class="cfx-card span-2"><div class="cfx-alert success">✓ Operación completada correctamente.</div><div class="cfx-alert info">i Información disponible para el administrador.</div><div class="cfx-alert warning">! Hay elementos que requieren revisión.</div><div class="cfx-alert danger">× No se pudo completar una operación de ejemplo.</div></article>
      </section>

      <section class="cfx-grid cfx-grid-4" *ngSwitchCase="'avatars'">
        <article class="cfx-card centered" *ngFor="let a of ['CA','MG','AD','GY']"><div class="cfx-avatar">{{a}}</div><b>Usuario {{a}}</b></article>
      </section>

      <section class="cfx-grid cfx-grid-2" *ngSwitchCase="'badges'">
        <article class="cfx-card"><h2>Estados</h2><div class="cfx-badges"><span class="success">Activo</span><span class="warning">Pendiente</span><span class="danger">Vencido</span><span>Nuevo</span></div></article>
        <article class="cfx-card"><h2>Roles</h2><div class="cfx-badges"><span>Administrador</span><span>Entrenador</span><span>Socio</span></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2" *ngSwitchCase="'buttons'">
        <article class="cfx-card"><h2>Botones</h2><div class="cfx-buttons"><button class="primary">Primario</button><button>Secundario</button><button class="success">Aceptar</button><button class="danger">Eliminar</button></div></article>
        <article class="cfx-card"><h2>Tamaños</h2><div class="cfx-buttons"><button class="small">Pequeño</button><button>Normal</button><button class="large">Grande</button></div></article>
      </section>

      <section class="cfx-grid cfx-grid-1" *ngSwitchCase="'button-groups'">
        <article class="cfx-card"><h2>Grupos de botones</h2><div class="cfx-button-group"><button class="active">Día</button><button>Semana</button><button>Mes</button><button>Año</button></div></article>
      </section>

      <section class="cfx-grid cfx-grid-3" *ngSwitchCase="'cards-ui'">
        <article class="cfx-card"><span class="cfx-card-icon">♚</span><h2>Socios</h2><p>Tarjeta administrativa.</p></article><article class="cfx-card"><span class="cfx-card-icon">S/</span><h2>Ventas</h2><p>Tarjeta financiera.</p></article><article class="cfx-card"><span class="cfx-card-icon">▦</span><h2>Stock</h2><p>Tarjeta de inventario.</p></article>
      </section>

      <section class="cfx-grid cfx-grid-2" *ngSwitchCase="'advanced-cards'">
        <article class="cfx-card cfx-gradient"><small>INGRESOS DEL MES</small><strong>S/ 528.00</strong><p>Resumen administrativo</p></article><article class="cfx-card"><header><div><span>PROGRESS</span><h2>Meta mensual</h2></div><b>78%</b></header><div class="cfx-progress"><i style="width:78%"></i></div></article>
      </section>

      <section class="cfx-grid cfx-grid-3" *ngSwitchCase="'dropdowns'">
        <article class="cfx-card"><h2>Dropdown</h2><button class="primary" (click)="dropdown=!dropdown">Opciones ▾</button><div class="cfx-dropdown" *ngIf="dropdown"><button>Editar</button><button>Duplicar</button><button>Eliminar</button></div></article>
        <article class="cfx-card"><h2>Select</h2><select class="cfx-input"><option>Socios</option><option>Entrenadores</option></select></article>
        <article class="cfx-card"><h2>Acciones</h2><button>Más acciones ▾</button></article>
      </section>

      <section class="cfx-grid cfx-grid-1" *ngSwitchCase="'list-items'">
        <article class="cfx-card"><header><div><span>LIST</span><h2>Actividad reciente</h2></div></header><div class="cfx-list"><div *ngFor="let row of demoRows"><span>{{row.id}}</span><div><b>{{row.name}}</b><small>{{row.module}} · {{row.date}}</small></div><em>{{row.status}}</em></div></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2" *ngSwitchCase="'progress-bars'">
        <article class="cfx-card"><h2>Progreso de objetivos</h2><div class="cfx-progress-row" *ngFor="let p of progressData"><label><span>{{p.name}}</span><b>{{p.value}}%</b></label><div class="cfx-progress"><i [style.width.%]="p.value"></i></div></div></article>
        <article class="cfx-card"><h2>Progreso circular</h2><div class="cfx-donut"><b>83%</b></div></article>
      </section>

      <section class="cfx-grid cfx-grid-3" *ngSwitchCase="'placeholders'">
        <article class="cfx-card" *ngFor="let i of [1,2,3]"><div class="cfx-placeholder big"></div><div class="cfx-placeholder"></div><div class="cfx-placeholder short"></div></article>
      </section>

      <section class="cfx-grid cfx-grid-4" *ngSwitchCase="'spinners'">
        <article class="cfx-card centered" *ngFor="let i of [1,2,3,4]"><span class="cfx-spinner" [class.alt]="i%2===0"></span><b>Cargando</b></article>
      </section>

      <section class="cfx-grid cfx-grid-1" *ngSwitchCase="'icons'">
        <article class="cfx-card"><header><div><span>ICONS</span><h2>Biblioteca de iconos</h2></div></header><div class="cfx-icon-grid"><div *ngFor="let icon of icons"><span>{{icon}}</span><small>Icon</small></div></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2" *ngSwitchCase="'account-settings'">
        <article class="cfx-card"><header><div><span>ACCOUNT</span><h2>Cuenta</h2></div></header><div class="cfx-form"><label>Nombre<input value="Administrador"></label><label>Correo<input value="admin@mallquigym.com"></label><label>Idioma<select><option>Español</option><option>English</option></select></label><button class="primary">Guardar cambios</button></div></article>
        <article class="cfx-card"><header><div><span>SECURITY</span><h2>Seguridad</h2></div></header><div class="cfx-form"><label>Contraseña actual<input type="password"></label><label>Nueva contraseña<input type="password"></label><button>Cambiar contraseña</button></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2" *ngSwitchCase="'my-profile'">
        <article class="cfx-card cfx-profile-card"><div class="cfx-avatar large">A</div><h2>Administrador Mallqui</h2><p>Gym Admin</p><div class="cfx-badges"><span>Administrador</span><span class="success">Activo</span></div></article>
        <article class="cfx-card"><header><div><span>PROFILE</span><h2>Información</h2></div></header><div class="cfx-info"><p><b>Rol</b><span>Administrador</span></p><p><b>Sistema</b><span>Mallqui Gym</span></p><p><b>Estado</b><span>En línea</span></p></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2" *ngSwitchCase="'contact'">
        <article class="cfx-card"><header><div><span>CONTACT</span><h2>Enviar mensaje</h2></div></header><div class="cfx-form"><label>Asunto<input [(ngModel)]="contact.subject"></label><label>Mensaje<textarea rows="6" [(ngModel)]="contact.message"></textarea></label><button class="primary" (click)="contactSent=true">Enviar</button><small *ngIf="contactSent">✓ Mensaje preparado.</small></div></article>
        <article class="cfx-card"><h2>Mallqui Gym</h2><div class="cfx-info"><p><b>Centro</b><span>Pucallpa</span></p><p><b>Atención</b><span>Administración</span></p><p><b>Canal</b><span>Panel interno</span></p></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2" *ngSwitchCase="'typography'">
        <article class="cfx-card"><h1>Heading H1</h1><h2>Heading H2</h2><h3>Heading H3</h3><h4>Heading H4</h4><p>Texto normal para contenidos administrativos.</p><small>Texto secundario y metadatos.</small></article>
        <article class="cfx-card"><blockquote>“Disciplina, constancia y progreso.”</blockquote><p><b>Negrita</b> · <em>Cursiva</em> · <u>Subrayado</u></p></article>
      </section>

      <section class="cfx-grid cfx-grid-2" *ngSwitchCase="'login-signup'">
        <article class="cfx-card cfx-auth"><h2>Iniciar sesión</h2><div class="cfx-form"><label>Usuario<input placeholder="Usuario"></label><label>Contraseña<input type="password" placeholder="••••••••"></label><button class="primary">Entrar</button></div></article>
        <article class="cfx-card cfx-auth"><h2>Crear cuenta</h2><div class="cfx-form"><label>Nombre<input></label><label>Correo<input type="email"></label><label>Contraseña<input type="password"></label><button>Registrarse</button></div></article>
      </section>

      <section class="cfx-grid cfx-grid-1" *ngSwitchCase="'page-not-found'"><article class="cfx-card cfx-empty-page"><strong>404</strong><h2>Página no encontrada</h2><p>La ruta solicitada no existe.</p><button class="primary">Volver al dashboard</button></article></section>

      <section class="cfx-grid cfx-grid-1" *ngSwitchCase="'maintenance'"><article class="cfx-card cfx-empty-page"><span class="cfx-big-icon">⚙</span><h2>Sistema en mantenimiento</h2><p>Página de mantenimiento del panel.</p><div class="cfx-progress"><i style="width:68%"></i></div></article></section>

      <section class="cfx-grid cfx-grid-2" *ngSwitchCase="'menu-level'">
        <article class="cfx-card"><h2>Menú nivel 1</h2><div class="cfx-tree"><button (click)="treeOpen=!treeOpen">▾ Administración</button><div *ngIf="treeOpen"><button>Socios</button><button>Finanzas</button><button>Inventario</button></div></div></article>
        <article class="cfx-card"><h2>Menú nivel 2</h2><div class="cfx-tree"><button>▸ Configuración</button><button>▸ Seguridad</button></div></article>
      </section>

      <section class="cfx-grid cfx-grid-1" *ngSwitchCase="'external-link'"><article class="cfx-card cfx-empty-page"><span class="cfx-big-icon">↗</span><h2>Enlace externo</h2><p>Ejemplo de acceso a un recurso externo desde el panel.</p><button class="primary">Abrir recurso</button></article></section>

      <section class="cfx-grid cfx-grid-2" *ngSwitchCase="'chip'"><article class="cfx-card"><h2>Chips</h2><div class="cfx-chips"><span>Socio ×</span><span>VIP ×</span><span>Entrenamiento ×</span><span>Activo ×</span></div></article><article class="cfx-card"><h2>Filtros</h2><div class="cfx-chips"><span>Hoy</span><span>Semana</span><span>Mes</span></div></article></section>

      <section class="cfx-grid cfx-grid-2" *ngSwitchCase="'badge-link'"><article class="cfx-card"><h2>Badges de estado</h2><div class="cfx-badges"><span>Nuevo</span><span class="success">Activo</span><span class="warning">Pendiente</span><span class="danger">Bloqueado</span></div></article><article class="cfx-card"><h2>Contadores</h2><div class="cfx-badges"><span>Mensajes 4</span><span>Alertas 2</span></div></article></section>

      <section class="cfx-grid cfx-grid-1" *ngSwitchCase="'disabled-link'"><article class="cfx-card cfx-empty-page"><span class="cfx-big-icon">⊘</span><h2>Enlace deshabilitado</h2><p>Este elemento se muestra desactivado como en la plantilla.</p><button disabled>No disponible</button></article></section>

      <section class="cfx-grid cfx-grid-2" *ngSwitchDefault>
        <article class="cfx-card"><header><div><span>{{config.group}}</span><h2>{{config.title}}</h2></div></header><p>Este módulo ya forma parte del kit visual Crossfit de Mallqui Gym.</p></article>
        <article class="cfx-card"><div class="cfx-bars"><i *ngFor="let h of bars" [style.height.%]="h"></i></div></article>
      </section>
    </ng-container>

    <div class="cfx-modal-backdrop" *ngIf="modal" (click)="modal=''"></div>
    <section class="cfx-modal" *ngIf="modal">
      <header><h2>{{modal==='danger'?'Confirmar acción':(modal==='form'?'Formulario rápido':'Modal')}}</h2><button (click)="modal=''">×</button></header>
      <div *ngIf="modal==='form'" class="cfx-form"><label>Nombre<input></label><label>Detalle<textarea rows="4"></textarea></label></div>
      <p *ngIf="modal!=='form'">{{modal==='danger'?'Esta acción requiere confirmación.':'Contenido del modal administrativo.'}}</p>
      <footer><button (click)="modal=''">Cancelar</button><button class="primary" (click)="modal=''">Aceptar</button></footer>
    </section>
  </section>
  `,
  styles: [`
    :host{display:block}
    .cfx-page{margin:0 -24px 18px;background:#f5f6fb;color:#2e2d3d}
    .cfx-crumb{min-height:49px;display:flex;align-items:center;gap:10px;padding:0 30px;background:linear-gradient(90deg,#5550d6,#5f5ae1);color:#fff}
    .cfx-crumb small{color:#dbd9ff;font-size:9px}.cfx-crumb b{color:#cbc8f5}.cfx-crumb strong{font-size:10px}.cfx-crumb em{margin-left:auto;min-height:27px;display:inline-flex;align-items:center;padding:0 12px;border:1px solid rgba(255,255,255,.2);border-radius:4px;color:#fff;font-size:8px;font-style:normal}
    .cfx-hero{min-height:250px;display:grid;grid-template-columns:minmax(0,1.18fr) minmax(330px,.82fr);overflow:hidden;margin:0 24px;border-radius:0 0 11px 11px;background:#fff;box-shadow:0 5px 15px rgba(76,72,126,.04)}
    .cfx-hero>div{padding:32px 34px}.cfx-kicker{display:block;color:#5b56dd;font-size:8px;font-weight:900;letter-spacing:1px}.cfx-hero h1{margin:5px 0;color:#2d2c3b;font-size:28px}.cfx-hero p{margin:0;color:#777b8b;font-size:10px}
    .cfx-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-top:28px}.cfx-metrics article{min-width:0;min-height:66px;display:grid;grid-template-columns:38px minmax(0,1fr);align-items:center;gap:8px;padding:8px 10px;border:1px solid #e8e8f0;border-radius:999px}.cfx-metrics i{width:36px;height:36px;display:grid;place-items:center;border-radius:50%;background:#efefff;color:#5b56dd;font-style:normal}.cfx-metrics b,.cfx-metrics small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cfx-metrics b{color:#5551d9;font-size:11px}.cfx-metrics small{display:block;margin-top:2px;color:#8b8f9e;font-size:7px}
    .cfx-hero>aside{position:relative;overflow:hidden;background:#f7f6ff}.cfx-art-orb{position:absolute;border-radius:50%;background:#ebe9ff}.cfx-art-orb.one{width:220px;height:220px;right:-40px;top:-65px}.cfx-art-orb.two{width:170px;height:170px;left:25px;bottom:-65px;background:#e8f4e4}.cfx-art-card{position:absolute;left:46px;top:55px;width:155px;height:115px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:15px;background:#fff;box-shadow:0 16px 35px rgba(86,82,160,.12);transform:rotate(-4deg)}.cfx-art-card span{font-size:28px}.cfx-art-card b{margin-top:7px;font-size:11px}.cfx-art-card small{color:#9699a7;font-size:7px}.cfx-art-chart{position:absolute;right:44px;bottom:38px;width:170px;height:95px;display:flex;align-items:flex-end;gap:10px}.cfx-art-chart i{flex:1;border-radius:6px 6px 0 0;background:#7973e8}
    .cfx-grid{display:grid;gap:14px;margin:16px 24px 0}.cfx-grid-1{grid-template-columns:1fr}.cfx-grid-2{grid-template-columns:repeat(2,minmax(0,1fr))}.cfx-grid-3{grid-template-columns:repeat(3,minmax(0,1fr))}.cfx-grid-4{grid-template-columns:repeat(4,minmax(0,1fr))}.span-2{grid-column:1/-1}
    .cfx-card{position:relative;min-width:0;min-height:170px;padding:17px;border:1px solid #e7e7ef;border-radius:10px;background:#fff;box-shadow:0 4px 13px rgba(75,70,126,.025)}.cfx-card>header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}.cfx-card>header span{color:#5b56dd;font-size:7px;font-weight:900}.cfx-card h2,.cfx-card h3{margin:0;color:#2e2d3d}.cfx-card h2{font-size:14px}.cfx-card p{color:#7f8392;font-size:9px;line-height:1.5}
    button{font:inherit}.cfx-card button,.cfx-modal button{min-height:34px;padding:0 11px;border:1px solid #dfe1e9;border-radius:8px;background:#fff;color:#5e6373;font-size:8px;font-weight:700;cursor:pointer}.cfx-card button.primary,.cfx-modal button.primary{border-color:#5b56dd;background:#5b56dd;color:#fff}.cfx-card button.danger{border-color:#f0cfd4;background:#fff6f7;color:#c94b5b}.cfx-card button.success{border-color:#bde6d2;background:#edfaf4;color:#30865d}.cfx-card button:disabled{opacity:.45;cursor:not-allowed}
    .cfx-table-wrap{overflow:auto;border:1px solid #e8e9ef;border-radius:9px}.cfx-table-wrap table{width:100%;border-collapse:collapse;min-width:650px}.cfx-table-wrap th,.cfx-table-wrap td{padding:10px 11px;border-bottom:1px solid #eeeff3;text-align:left;font-size:8px}.cfx-table-wrap th{background:#f8f8fb;color:#838796;font-size:7px}.cfx-badge,.cfx-badges span{display:inline-flex;align-items:center;min-height:23px;padding:0 8px;border-radius:999px;background:#efefff;color:#5b56dd;font-size:7px;font-weight:800}.cfx-badge.success,.cfx-badges .success{background:#eaf8f2;color:#3c936a}.cfx-badges .warning{background:#fff6e8;color:#b87825}.cfx-badges .danger{background:#fff0f2;color:#c2495a}
    .cfx-toolbar{display:flex;gap:8px;margin-bottom:12px}.cfx-toolbar input,.cfx-toolbar select,.cfx-input{height:36px;box-sizing:border-box;border:1px solid #dfe1e9;border-radius:8px;background:#fff;padding:0 10px;color:#454958;font-size:8px;outline:0}.cfx-toolbar input{flex:1}
    .cfx-bars{height:150px;display:flex;align-items:flex-end;justify-content:space-around;gap:10px;margin-top:22px}.cfx-bars i{flex:1;max-width:30px;min-height:12%;border-radius:6px 6px 0 0;background:#bcb8f0}.cfx-bars i:nth-child(2n){background:#6c66e6}.cfx-line{width:100%;height:150px;margin-top:18px}.cfx-line.tall{height:175px}.cfx-donut{width:130px;height:130px;display:grid;place-items:center;margin:22px auto 0;border-radius:50%;background:conic-gradient(#5b56dd 0 78%,#ecebfa 78% 100%);position:relative}.cfx-donut:after{content:'';position:absolute;width:88px;height:88px;border-radius:50%;background:#fff}.cfx-donut b{position:relative;z-index:1;color:#5b56dd;font-size:20px}.cfx-area svg{width:100%;height:180px;margin-top:15px}
    .cfx-map{position:relative;min-height:340px;border-radius:10px;background:radial-gradient(circle at 30% 30%,#e9e7ff,transparent 30%),linear-gradient(135deg,#f4f3ff,#e9f5e6);overflow:hidden}.cfx-map:before{content:'UCAYALI';position:absolute;left:32%;top:39%;font-size:54px;font-weight:900;color:rgba(91,86,221,.08);transform:rotate(-12deg)}.cfx-map>span{position:absolute;left:22px;bottom:18px;color:#5b56dd;font-size:9px;font-weight:800}.pin{position:absolute;width:30px;height:30px;display:grid;place-items:center;border-radius:50% 50% 50% 0;background:#5b56dd;color:#fff;transform:rotate(-45deg);font-size:8px}.pin::first-letter{transform:rotate(45deg)}.p1{left:38%;top:44%}.p2{left:58%;top:31%}.p3{left:66%;top:58%}
    .cfx-accordion{border-bottom:1px solid #ececf2}.cfx-accordion>button{width:100%;display:flex;align-items:center;justify-content:space-between;border:0;background:#fff;padding:10px 0}.cfx-accordion p{padding:0 0 12px;margin:0}.cfx-carousel{min-height:270px;display:grid;grid-template-columns:48px 1fr 48px;align-items:center;background:#f7f6ff;border-radius:10px}.cfx-carousel>div{text-align:center}.cfx-carousel span{font-size:50px}.cfx-carousel h2{margin-top:10px}.cfx-pop{margin-top:10px;padding:10px;border:1px solid #dfdef3;border-radius:8px;background:#f7f6ff;color:#5c6070;font-size:8px}
    .cfx-tabs{display:flex;gap:6px;border-bottom:1px solid #e9e9ef}.cfx-tabs button{border:0;border-radius:7px 7px 0 0}.cfx-tabs button.active{background:#5b56dd;color:#fff}.cfx-tab-content{padding:20px 5px}.centered{text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}.cfx-tooltip{position:relative}.cfx-tooltip span{visibility:hidden;position:absolute;left:50%;bottom:120%;transform:translateX(-50%);padding:6px 8px;border-radius:6px;background:#282737;color:#fff;white-space:nowrap;font-size:7px}.cfx-tooltip:hover span{visibility:visible}
    .cfx-form{display:grid;gap:11px}.cfx-form label{display:grid;gap:5px;color:#5e6272;font-size:8px;font-weight:700}.cfx-form input,.cfx-form select,.cfx-form textarea{width:100%;box-sizing:border-box;border:1px solid #dfe1e9;border-radius:8px;background:#fff;padding:9px;color:#383b49;font-size:8px;outline:0}.cfx-form input,.cfx-form select{height:37px}.cfx-form .invalid{border-color:#d94f61;background:#fff8f9}.check,.switch{display:flex;align-items:center;gap:8px;margin:11px 0;color:#5e6272;font-size:9px}.switch span{width:38px;height:21px;border-radius:999px;background:#d8dae2;position:relative}.switch input:checked+span{background:#5b56dd}.switch span:after{content:'';position:absolute;left:3px;top:3px;width:15px;height:15px;border-radius:50%;background:#fff}.switch input:checked+span:after{left:20px}
    .cfx-upload{min-height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:2px dashed #d8d6f1;border-radius:10px;background:#faf9ff;cursor:pointer}.cfx-upload span{font-size:28px;color:#5b56dd}.cfx-upload b{margin:7px 0}.cfx-upload small{color:#9598a6}.cfx-upload input{display:none}.cfx-file-result{min-height:140px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px}.cfx-file-result span{font-size:30px;color:#5b56dd}.cfx-validation-state{min-height:140px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;border-radius:10px;background:#fff3f5;color:#c94b5b}.cfx-validation-state.ok{background:#eefaf4;color:#3d9068}.cfx-validation-state span{font-size:32px}
    .cfx-tag-editor{min-height:80px;display:flex;align-items:center;flex-wrap:wrap;gap:7px;padding:10px;border:1px solid #dfe1e9;border-radius:9px}.cfx-tag-editor>span,.cfx-chips span{display:inline-flex;align-items:center;gap:4px;min-height:28px;padding:0 9px;border-radius:999px;background:#efefff;color:#5b56dd;font-size:8px}.cfx-tag-editor span button{min-height:0;padding:0;border:0;background:transparent}.cfx-tag-editor input{flex:1;min-width:150px;border:0;outline:0}.cfx-alert{padding:11px 13px;margin:8px 0;border-radius:8px;font-size:8px;font-weight:700}.cfx-alert.success{background:#eaf8f2;color:#3c9068}.cfx-alert.info{background:#efefff;color:#5b56dd}.cfx-alert.warning{background:#fff6e8;color:#ae762b}.cfx-alert.danger{background:#fff0f2;color:#c44c5c}
    .cfx-avatar{width:54px;height:54px;display:grid;place-items:center;border-radius:50%;background:#5b56dd;color:#fff;font-size:13px;font-weight:900}.cfx-avatar.large{width:90px;height:90px;font-size:25px}.cfx-badges,.cfx-buttons,.cfx-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:15px}.cfx-button-group{display:inline-flex;margin-top:15px}.cfx-button-group button{border-radius:0}.cfx-button-group button:first-child{border-radius:8px 0 0 8px}.cfx-button-group button:last-child{border-radius:0 8px 8px 0}.cfx-button-group .active{background:#5b56dd;color:#fff}.cfx-card-icon{width:42px;height:42px;display:grid;place-items:center;border-radius:10px;background:#efefff;color:#5b56dd}.cfx-gradient{background:linear-gradient(135deg,#5b56dd,#7771eb);color:#fff}.cfx-gradient strong{display:block;margin:10px 0;font-size:28px}.cfx-gradient p,.cfx-gradient small{color:#e8e6ff}
    .cfx-progress{height:9px;overflow:hidden;border-radius:999px;background:#ececf3}.cfx-progress i{height:100%;display:block;border-radius:999px;background:#5b56dd}.cfx-dropdown{position:absolute;left:17px;top:100px;z-index:4;width:130px;padding:6px;border:1px solid #e2e3ea;border-radius:8px;background:#fff;box-shadow:0 12px 28px rgba(51,48,90,.13)}.cfx-dropdown button{width:100%;border:0;text-align:left}.cfx-list>div{min-height:54px;display:grid;grid-template-columns:34px 1fr auto;align-items:center;gap:9px;border-bottom:1px solid #eeeff3}.cfx-list>div>span{width:30px;height:30px;display:grid;place-items:center;border-radius:8px;background:#efefff;color:#5b56dd}.cfx-list div div{display:flex;flex-direction:column}.cfx-list small{color:#9093a1;font-size:7px}.cfx-list em{color:#5b56dd;font-size:7px;font-style:normal}.cfx-progress-row{margin:15px 0}.cfx-progress-row label{display:flex;justify-content:space-between;margin-bottom:5px;font-size:8px}
    .cfx-placeholder{height:12px;margin:10px 0;border-radius:5px;background:linear-gradient(90deg,#eeeef4,#f8f8fb,#eeeef4);background-size:200% 100%;animation:shine 1.4s infinite}.cfx-placeholder.big{height:90px}.cfx-placeholder.short{width:55%}@keyframes shine{to{background-position:-200% 0}}.cfx-spinner{width:38px;height:38px;border:4px solid #e8e7f6;border-top-color:#5b56dd;border-radius:50%;animation:spin .8s linear infinite}.cfx-spinner.alt{border-top-color:#ff9b43}@keyframes spin{to{transform:rotate(360deg)}}.cfx-icon-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:10px}.cfx-icon-grid>div{min-height:72px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px solid #e8e8ef;border-radius:9px}.cfx-icon-grid span{font-size:20px;color:#5b56dd}.cfx-icon-grid small{margin-top:5px;color:#9699a7}
    .cfx-profile-card{text-align:center}.cfx-profile-card .cfx-avatar{margin:0 auto}.cfx-info p{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #ececf2;font-size:8px}.cfx-info p span{color:#818594}.cfx-auth{max-width:440px;justify-self:center;width:100%;box-sizing:border-box}.cfx-empty-page{min-height:310px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.cfx-empty-page strong{font-size:80px;color:#5b56dd}.cfx-big-icon{font-size:55px;color:#5b56dd}.cfx-tree{display:grid;gap:6px}.cfx-tree>div{display:grid;gap:5px;padding-left:18px}
    .cfx-modal-backdrop{position:fixed;inset:0;z-index:7000;background:rgba(28,27,47,.45)}.cfx-modal{position:fixed;z-index:7001;left:50%;top:50%;width:min(480px,calc(100% - 30px));transform:translate(-50%,-50%);padding:18px;border-radius:12px;background:#fff;box-shadow:0 30px 80px rgba(30,27,70,.28)}.cfx-modal header,.cfx-modal footer{display:flex;align-items:center;justify-content:space-between;gap:10px}.cfx-modal footer{justify-content:flex-end;margin-top:15px}
    @media(max-width:1100px){.cfx-hero{grid-template-columns:1fr 300px}.cfx-metrics{grid-template-columns:1fr 1fr}.cfx-grid-4{grid-template-columns:1fr 1fr}.cfx-grid-3{grid-template-columns:1fr 1fr}.cfx-icon-grid{grid-template-columns:repeat(5,1fr)}}
    @media(max-width:800px){.cfx-hero{grid-template-columns:1fr}.cfx-hero>aside{display:none}.cfx-grid-2,.cfx-grid-3,.cfx-grid-4{grid-template-columns:1fr}.cfx-icon-grid{grid-template-columns:repeat(4,1fr)}}
    @media(max-width:700px){.cfx-page{margin-left:-12px;margin-right:-12px}.cfx-hero,.cfx-grid{margin-left:12px;margin-right:12px}.cfx-crumb{padding:0 14px}.cfx-crumb em{display:none}.cfx-metrics{grid-template-columns:1fr 1fr}.cfx-icon-grid{grid-template-columns:repeat(3,1fr)}}
  `]
})
export class AdminCrossfitExtrasComponent {
  @Input() section = 'tables';

  search = '';
  filter = '';
  tab = 0;
  slide = 0;
  modal = '';
  popover = 0;
  dropdown = false;
  treeOpen = true;
  accordionOpen = 0;
  saved = false;
  selectedFile = '';
  validationTried = false;
  newTag = '';
  contactSent = false;

  form:any = {name:'',email:'',status:'Activo'};
  validation:any = {name:'',email:''};
  contact:any = {subject:'',message:''};

  bars = [34,58,46,78,64,86,55];
  bars2 = [48,68,37,82,59,74,51];
  bars3 = [30,52,71,44,86,63,76];
  progressData = [{name:'Socios activos',value:82},{name:'Meta de ventas',value:68},{name:'Asistencia',value:74},{name:'Rutinas',value:56}];
  tags = ['Fitness','Socios','Mallqui Gym','Activo'];
  icons = ['⌂','♚','♙','✓','★','▦','▣','◫','◇','◆','↗','⚙','⌘','☷','♨','◎','S/','＋','!','●','▤','⌁','⇧','⊘'];
  slides = [
    {icon:'🏋',title:'Entrenamiento',text:'Gestión de rutinas y progreso.'},
    {icon:'🥗',title:'Nutrición',text:'Planes alimenticios y seguimiento.'},
    {icon:'📊',title:'Reportes',text:'Indicadores del gimnasio.'}
  ];
  accordionItems = [
    {q:'¿Cómo registro un socio?',a:'Usa el módulo Socios y selecciona Nuevo cliente.'},
    {q:'¿Cómo veo los pagos?',a:'Abre Pagos desde el menú lateral.'},
    {q:'¿Cómo reviso el inventario?',a:'Ingresa al módulo Inventario para productos, stock y movimientos.'}
  ];

  demoRows:any[] = [
    {id:1,name:'Registro de socio',module:'Socios',status:'Activo',date:'21/10/2026'},
    {id:2,name:'Pago de membresía',module:'Pagos',status:'Activo',date:'20/10/2026'},
    {id:3,name:'Rutina semanal',module:'Entrenamiento',status:'Pendiente',date:'19/10/2026'},
    {id:4,name:'Control de stock',module:'Inventario',status:'Activo',date:'18/10/2026'}
  ];

  configs:Record<string,ExtraConfig> = {
    'tables':{title:'Tables',subtitle:'Tablas administrativas con estructura responsive.',icon:'▤',group:'Tables'},
    'data-tables':{title:'Data Tables',subtitle:'Búsqueda, filtros y organización de registros.',icon:'▦',group:'Tables'},
    'graphs':{title:'Graphs',subtitle:'Visualización de métricas y tendencias.',icon:'↗',group:'Graphs'},
    'apex':{title:'Apex Charts',subtitle:'Gráficos modernos para indicadores.',icon:'⌁',group:'Graphs'},
    'morris':{title:'Morris Charts',subtitle:'Gráficos comparativos y tendencias.',icon:'⌘',group:'Graphs'},
    'vector-maps':{title:'Vector Maps',subtitle:'Vista de ubicación y cobertura.',icon:'◎',group:'Maps'},
    'accordions':{title:'Accordions',subtitle:'Contenido expandible y organizado.',icon:'☷',group:'UI Elements'},
    'carousel':{title:'Carousel',subtitle:'Contenido destacado deslizable.',icon:'↔',group:'UI Elements'},
    'modals':{title:'Modals',subtitle:'Ventanas modales para acciones y formularios.',icon:'▣',group:'UI Elements'},
    'popovers':{title:'Popovers',subtitle:'Información contextual sobre acciones.',icon:'◇',group:'UI Elements'},
    'tabs-ui':{title:'Tabs',subtitle:'Navegación interna por pestañas.',icon:'▥',group:'UI Elements'},
    'tooltips':{title:'Tooltips',subtitle:'Ayudas breves sobre controles.',icon:'?',group:'UI Elements'},
    'forms':{title:'Forms',subtitle:'Formularios administrativos completos.',icon:'☷',group:'Forms'},
    'form-inputs':{title:'Form Inputs',subtitle:'Campos de entrada para formularios.',icon:'⌨',group:'Forms'},
    'checkbox-radio':{title:'Checkbox & Radio',subtitle:'Controles de selección.',icon:'✓',group:'Forms'},
    'file-input':{title:'File Input',subtitle:'Carga de imágenes y documentos.',icon:'⇧',group:'Forms'},
    'validations':{title:'Validations',subtitle:'Validación visual de formularios.',icon:'✓',group:'Forms'},
    'date-time':{title:'Date Time Pickers',subtitle:'Selección de fechas y horarios.',icon:'◷',group:'Forms'},
    'input-masks':{title:'Input Masks',subtitle:'Formatos para DNI, teléfono y moneda.',icon:'⌘',group:'Forms'},
    'input-tags':{title:'Input Tags',subtitle:'Etiquetas y clasificación rápida.',icon:'#',group:'Forms'},
    'alerts':{title:'Alerts',subtitle:'Mensajes de éxito, información y error.',icon:'!',group:'Components'},
    'avatars':{title:'Avatars',subtitle:'Representación visual de usuarios.',icon:'♙',group:'Components'},
    'badges':{title:'Badges',subtitle:'Estados, roles y etiquetas.',icon:'●',group:'Components'},
    'buttons':{title:'Buttons',subtitle:'Botones y acciones del sistema.',icon:'＋',group:'Components'},
    'button-groups':{title:'Button Groups',subtitle:'Acciones agrupadas.',icon:'▦',group:'Components'},
    'cards-ui':{title:'Cards',subtitle:'Tarjetas para contenido e indicadores.',icon:'▤',group:'Components'},
    'advanced-cards':{title:'Advanced Cards',subtitle:'Tarjetas avanzadas para métricas.',icon:'★',group:'Components'},
    'dropdowns':{title:'Dropdowns',subtitle:'Menús de acciones desplegables.',icon:'▾',group:'Components'},
    'list-items':{title:'List Items',subtitle:'Listas de actividad y elementos.',icon:'☷',group:'Components'},
    'progress-bars':{title:'Progress Bars',subtitle:'Indicadores visuales de progreso.',icon:'↗',group:'Components'},
    'placeholders':{title:'Placeholders',subtitle:'Estados de carga del contenido.',icon:'▭',group:'Components'},
    'spinners':{title:'Spinners',subtitle:'Indicadores animados de carga.',icon:'◌',group:'Components'},
    'icons':{title:'Icons',subtitle:'Biblioteca visual para el dashboard.',icon:'★',group:'Foundation'},
    'account-settings':{title:'Account Settings',subtitle:'Preferencias y seguridad de la cuenta.',icon:'⚙',group:'Account'},
    'my-profile':{title:'My Profile',subtitle:'Información del perfil administrador.',icon:'♙',group:'Account'},
    'contact':{title:'Contact',subtitle:'Formulario y datos de contacto.',icon:'☎',group:'Pages'},
    'typography':{title:'Typography',subtitle:'Jerarquía visual de textos.',icon:'T',group:'Foundation'},
    'login-signup':{title:'Login / Signup',subtitle:'Vistas de autenticación.',icon:'↪',group:'Pages'},
    'page-not-found':{title:'Page Not Found',subtitle:'Página de error 404.',icon:'404',group:'Pages'},
    'maintenance':{title:'Maintenance',subtitle:'Pantalla de mantenimiento.',icon:'⚙',group:'Pages'},
    'menu-level':{title:'Menu Level',subtitle:'Ejemplo de navegación multinivel.',icon:'☷',group:'Navigation'},
    'external-link':{title:'External Link',subtitle:'Acceso a recursos externos.',icon:'↗',group:'Navigation'},
    'chip':{title:'Chip',subtitle:'Chips de información y filtros.',icon:'#',group:'Components'},
    'badge-link':{title:'Badge',subtitle:'Badges y contadores visuales.',icon:'●',group:'Components'},
    'disabled-link':{title:'Disabled Link',subtitle:'Estado deshabilitado de navegación.',icon:'⊘',group:'Navigation'}
  };

  get config():ExtraConfig { return this.configs[this.section] || this.configs['tables']; }
  get metric1():string {
    const map:any={'tables':'4 filas','data-tables':String(this.filteredRows.length),'icons':String(this.icons.length),'forms':'2 forms','badges':'7 badges','buttons':'7 botones'};
    return map[this.section] || '100%';
  }
  get filteredRows():any[] {
    const q=this.search.toLowerCase().trim();
    return this.demoRows.filter(r=>(!q||JSON.stringify(r).toLowerCase().includes(q))&&(!this.filter||r.status===this.filter));
  }
  get validEmail():boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.validation.email||''); }

  addRow(){ const id=this.demoRows.length+1; this.demoRows=[...this.demoRows,{id,name:'Nuevo registro '+id,module:'Administración',status:'Activo',date:'21/10/2026'}]; }
  prevSlide(){ this.slide=(this.slide-1+this.slides.length)%this.slides.length; }
  nextSlide(){ this.slide=(this.slide+1)%this.slides.length; }
  fileSelected(e:any){ this.selectedFile=e?.target?.files?.[0]?.name||''; }
  addTag(){ const t=this.newTag.trim(); if(t&&!this.tags.includes(t)) this.tags=[...this.tags,t]; this.newTag=''; }
  removeTag(tag:string){ this.tags=this.tags.filter(t=>t!==tag); }
}
