import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from './admin-api.service';

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
      <span>⌂</span><small>Home</small><b>›</b><strong>{{config.title}}</strong>
      <em>{{config.group}}</em>
    </div>

    <ng-container [ngSwitch]="viewSection">

      <section class="cfx-grid cfx-grid-3 cf-component-showcase" *ngSwitchCase="'sports-components'">
        <article class="cfx-card"><header><div><span>WORKOUT</span><h2>Workout Summary</h2></div><b>76%</b></header><div class="cfx-progress-row"><label><span>Weekly Goal</span><b>76%</b></label><div class="cfx-progress"><i style="width:76%"></i></div></div><div class="cf-sport-stats"><span><b>12</b><small>Exercises</small></span><span><b>5h 40m</b><small>Duration</small></span><span><b>1,240</b><small>Calories</small></span></div></article>
        <article class="cfx-card"><header><div><span>HEART RATE</span><h2>Training Zones</h2></div><b>142 BPM</b></header><svg class="cfx-line" viewBox="0 0 320 130"><polyline points="5,102 44,82 82,91 120,50 158,72 196,34 234,58 272,43 315,60" fill="none" stroke="#5b56dd" stroke-width="4"/></svg><div class="cfx-badges"><span>Warm Up</span><span class="warning">Cardio</span><span class="danger">Peak</span></div></article>
        <article class="cfx-card"><header><div><span>CALORIES</span><h2>Calories Burned</h2></div><b>1,240 kcal</b></header><div class="cfx-bars"><i style="height:38%"></i><i style="height:55%"></i><i style="height:62%"></i><i style="height:80%"></i><i style="height:70%"></i><i style="height:86%"></i><i style="height:64%"></i></div></article>
        <article class="cfx-card"><header><div><span>HYDRATION</span><h2>Water Intake</h2></div></header><div class="cfx-donut"><b>72%</b></div><p class="centered-copy">2.1 L of 3 L daily target</p></article>
        <article class="cfx-card"><header><div><span>BMI</span><h2>Body Metrics</h2></div></header><div class="cf-sport-stats vertical"><span><b>23.4</b><small>BMI</small></span><span><b>18%</b><small>Body Fat</small></span><span><b>68 kg</b><small>Weight</small></span></div></article>
        <article class="cfx-card"><header><div><span>RECOVERY</span><h2>Recovery Score</h2></div><b>Good</b></header><div class="cfx-progress-row"><label><span>Sleep</span><b>82%</b></label><div class="cfx-progress"><i style="width:82%"></i></div></div><div class="cfx-progress-row"><label><span>Mobility</span><b>64%</b></label><div class="cfx-progress"><i style="width:64%"></i></div></div></article>
      </section>

      <section class="cfx-grid cfx-grid-1 cf-live-trainer-profile" *ngSwitchCase="'trainer-profile'">
        <ng-container *ngIf="trainers[0] as t; else trainerProfileFallback">
          <article class="cfx-card cf-trainer-profile-hero">
            <img src="assets/showcase/coach-showcase.svg" alt="Trainer">
            <div class="cf-trainer-profile-copy">
              <small>PERSONAL TRAINER</small>
              <h1>{{t.nombres}} {{t.apellidos}}</h1>
              <p>{{t.especialidad || 'Strength • Fat Loss • Functional Training'}}</p>
              <div class="cf-trainer-badges"><span>16+ Years Experience</span><span>Certified Coach</span><span>★ 4.9 (2,896 reviews)</span></div>
            </div>
          </article>

          <section class="cf-trainer-profile-stats">
            <article><small>Active Clients</small><b>{{t.clientes_count || 920}}</b><span>+12 this week</span></article>
            <article><small>Monthly Revenue</small><b>S/ {{t.ingresos_mes || '9.6K'}}</b><span>+18% growth</span></article>
            <article><small>Total Reviews</small><b>3.6K</b><span>+42 this week</span></article>
          </section>

          <article class="cfx-card cf-trainer-about">
            <header><div><span>ABOUT</span><h2>About</h2></div></header>
            <p>{{t.nombres}} is the main Mallqui Gym trainer, focused on sustainable habits, strength development, fat loss, muscle gain and functional fitness. Training plans are adapted to each member's goals and level.</p>
            <div class="cf-trainer-about-stats"><span><b>16+ Years</b><small>Experience</small></span><span><b>{{t.clientes_count || '900+'}}</b><small>Clients Trained</small></span><span><b>4.9 Rating</b><small>Client Satisfaction</small></span></div>
          </article>

          <article class="cfx-card">
            <header><div><span>SPECIALIZATIONS</span><h2>Specializations</h2></div></header>
            <div class="cfx-chips"><span>Strength Training</span><span>Fat Loss</span><span>Muscle Building</span><span>Functional Fitness</span><span>Lifestyle Coaching</span></div>
          </article>

          <article class="cfx-card cf-trainer-reviews">
            <header><div><span>REVIEWS</span><h2>Reviews</h2></div><button>Load More Reviews</button></header>
            <div class="cf-review-list">
              <div><div class="cfx-avatar">WM</div><div><b>Gym Member</b><small>2 weeks ago</small><strong>★★★★★ Excellent</strong><p>The training program helped improve consistency, strength and overall fitness.</p><em>Recommends • Fat Loss Program</em></div></div>
              <div><div class="cfx-avatar">NM</div><div><b>Gym Member</b><small>1 month ago</small><strong>★★★★★ Excellent</strong><p>Workouts are simple, effective and easy to follow. Progress has been steady.</p><em>Recommends • Strength Training</em></div></div>
              <div><div class="cfx-avatar">CD</div><div><b>Gym Member</b><small>3 weeks ago</small><strong>★★★★☆ Good</strong><p>Good program and follow-up. Sessions are focused on each member's objectives.</p><em>General Fitness</em></div></div>
            </div>
          </article>
        </ng-container>
        <ng-template #trainerProfileFallback>
          <article class="cfx-card cf-trainer-profile-hero">
            <img src="assets/showcase/coach-showcase.svg" alt="Trainer">
            <div class="cf-trainer-profile-copy"><small>PERSONAL TRAINER</small><h1>Mallqui Trainer</h1><p>Strength • Fat Loss • Functional Training</p><div class="cf-trainer-badges"><span>Certified Coach</span><span>★ 4.9</span></div></div>
          </article>
        </ng-template>
      </section>

      <section class="cfx-grid cfx-grid-1 cf-live-members-list" *ngSwitchCase="'members-list'">
        <article class="cfx-card">
          <header><div><span>MEMBERS</span><h2>Members List</h2></div><button class="primary" (click)="memberMessage='Use Add Member from the sidebar to create a new member.'">＋ Add New Member</button></header>
          <div class="cfx-table-wrap"><table><thead><tr><th>#</th><th>Member</th><th>Age</th><th>Gender</th><th>Contact</th><th>Email</th><th>Joined On</th><th>Actions</th></tr></thead><tbody>
            <tr *ngFor="let m of filteredMembers; let i=index">
              <td>{{i+1}}</td>
              <td><div class="cf-member-cell"><div class="cfx-avatar small-avatar">{{(m.nombres||'M').charAt(0)}}{{(m.apellidos||'').charAt(0)}}</div><b>{{m.nombres}} {{m.apellidos}}</b></div></td>
              <td>{{m.edad || '—'}}</td><td>{{m.genero || '—'}}</td><td>{{m.telefono || '—'}}</td><td>{{m.correo || '—'}}</td>
              <td>{{m.created_at ? (m.created_at | date:'yyyy-MM-dd') : '—'}}</td>
              <td><div class="cf-member-actions"><button title="Edit" (click)="selectedMemberId=m.id_cliente;selectMember(m.id_cliente)">✎</button><button class="danger" title="Delete / deactivate">×</button></div></td>
            </tr>
            <tr *ngIf="!filteredMembers.length"><td colspan="8">No members found.</td></tr>
          </tbody></table></div>
          <small *ngIf="memberMessage">{{memberMessage}}</small>
        </article>
      </section>

      <section class="cfx-grid cfx-grid-1 cf-live-member-cards" *ngSwitchCase="'members-cards'">
        <article class="cfx-card cf-member-search-card">
          <div class="cfx-toolbar"><input [(ngModel)]="memberSearch" placeholder="Search trainers, members, or ID..."><button class="primary">Search</button><button (click)="memberSearch=''">Reset</button></div>
        </article>
        <section class="cf-member-card-grid">
          <article class="cf-member-profile-card" *ngFor="let m of filteredMembers">
            <img src="assets/showcase/coach-showcase.svg" [alt]="m.nombres">
            <div><h2>{{m.nombres}} {{m.apellidos}}</h2><p>{{m.objetivo || 'Fitness Member'}}</p><small>{{m.antiguedad || 'Mallqui Gym Member'}}</small><button>Contact</button></div>
          </article>
          <article class="cfx-card cfx-empty-page" *ngIf="!filteredMembers.length"><span class="cfx-big-icon">♚</span><h2>No members found</h2><p>Try another search.</p></article>
        </section>
      </section>

      <section class="cfx-grid cfx-grid-1 cf-live-member-form" *ngSwitchCase="'add-member'">
        <article class="cfx-card">
          <header><div><span>MEMBERS</span><h2>Add New Member</h2><p>* Required fields</p></div></header>
          <div class="cf-member-form-grid">
            <label class="span-2">Full Name *<input [(ngModel)]="newMemberFullName" placeholder="John Anderson"></label>
            <label>Email Address *<input type="email" [(ngModel)]="newMember.correo" placeholder="john@email.com"></label>
            <label>Phone Number *<input [(ngModel)]="newMember.telefono" placeholder="+51 999 999 999"></label>
            <label>Member ID / DNI *<input [(ngModel)]="newMember.dni" maxlength="15" placeholder="12345678"></label>
            <label>Gender *<div class="cf-radio-row"><label><input type="radio" [(ngModel)]="memberUi.gender" value="Male"> Male</label><label><input type="radio" [(ngModel)]="memberUi.gender" value="Female"> Female</label><label><input type="radio" [(ngModel)]="memberUi.gender" value="Other"> Other</label></div></label>
            <label>Date of Birth *<input type="date" [(ngModel)]="memberUi.dob"></label>
            <label>Membership Plan *<select [(ngModel)]="memberUi.plan"><option>Basic</option><option>Premium</option><option>Enterprise</option></select></label>
            <label>Fitness Goal<select [(ngModel)]="memberUi.goal"><option>Weight Loss</option><option>Muscle Gain</option><option>Endurance</option><option>General Fitness</option></select></label>
            <label>City / Location<input [(ngModel)]="newMember.direccion" placeholder="Pucallpa"></label>
            <label class="span-2">Additional Notes<textarea rows="4" [(ngModel)]="memberUi.notes"></textarea></label>
          </div>
          <footer class="cf-form-footer"><button (click)="resetNewMember()">Cancel</button><button class="primary" (click)="saveMember()" [disabled]="savingMember">{{savingMember?'Saving...':'Save Member'}}</button></footer>
          <small *ngIf="memberMessage">{{memberMessage}}</small>
        </article>
      </section>

      <section class="cfx-grid cfx-grid-1 cf-live-member-form" *ngSwitchCase="'edit-member'">
        <article class="cfx-card">
          <header><div><span>MEMBERS</span><h2>Edit Member</h2><p>Member ID: {{selectedMemberId ? ('#MBR-'+selectedMemberId) : 'Select a member'}}</p></div></header>
          <div class="cf-member-select"><label>Select Member<select [(ngModel)]="selectedMemberId" (ngModelChange)="selectMember($event)"><option [ngValue]="0">Select a member</option><option *ngFor="let m of members" [ngValue]="m.id_cliente">{{m.nombres}} {{m.apellidos}}</option></select></label></div>
          <div class="cf-member-form-grid">
            <label class="span-2">Full Name<input [(ngModel)]="editMemberFullName"></label>
            <label>Email Address<input type="email" [(ngModel)]="editMember.correo"></label>
            <label>Phone Number<input [(ngModel)]="editMember.telefono"></label>
            <label>Gender<div class="cf-radio-row"><label><input type="radio" [(ngModel)]="memberUi.gender" value="Male"> Male</label><label><input type="radio" [(ngModel)]="memberUi.gender" value="Female"> Female</label><label><input type="radio" [(ngModel)]="memberUi.gender" value="Other"> Other</label></div></label>
            <label>Date of Birth<input type="date" [(ngModel)]="memberUi.dob"></label>
            <label>Membership Plan<select [(ngModel)]="memberUi.plan"><option>Basic</option><option>Premium</option><option>Enterprise</option></select></label>
            <label>Fitness Goal<select [(ngModel)]="memberUi.goal"><option>Weight Loss</option><option>Muscle Gain</option><option>Endurance</option><option>General Fitness</option></select></label>
            <label>City / Location<input [(ngModel)]="editMember.direccion"></label>
            <label class="span-2">Notes<textarea rows="4" [(ngModel)]="memberUi.notes" placeholder="Prefers evening sessions. No injuries."></textarea></label>
          </div>
          <div class="cf-form-danger">Remove Member</div>
          <footer class="cf-form-footer"><button (click)="selectedMemberId=0">Cancel</button><button class="primary" (click)="updateMember()" [disabled]="!selectedMemberId||savingMember">{{savingMember?'Saving...':'Update Details'}}</button></footer>
          <small *ngIf="memberMessage">{{memberMessage}}</small>
        </article>
      </section>

      <section class="cfx-grid cfx-grid-1 cf-template-table-page" *ngSwitchCase="'invoices-list'">
        <article class="cfx-card">
          <header><div><span>INVOICES</span><h2>Invoices List</h2><p>All generated member invoices</p></div><button class="primary" (click)="loadInvoices()">Refresh</button></header>
          <div class="cfx-toolbar cf-datatable-toolbar">
            <label>Show <select><option>10</option><option>25</option><option>50</option></select> entries</label>
            <input [(ngModel)]="search" placeholder="Search invoices...">
          </div>
          <div class="cfx-table-wrap"><table><thead><tr><th>Invoice No.</th><th>Gym Member</th><th>Created Date</th><th>Due Date</th><th>Status</th><th>Amount</th><th>Actions</th></tr></thead><tbody>
            <tr *ngFor="let x of invoices">
              <td>#INV-{{x.id}}</td><td><b>{{x.titulo}}</b></td><td>{{x.fecha||'—'}}</td><td>{{x.datos?.dueDate || x.fecha || '—'}}</td><td><span class="cfx-badge">{{x.estado}}</span></td><td>S/ {{x.monto||0 | number:'1.2-2'}}</td>
              <td><div class="cf-member-actions"><button title="View" (click)="selectedInvoiceId=x.id;selectInvoice(x.id)">⌕</button><button title="Edit" (click)="selectedInvoiceId=x.id;selectInvoice(x.id)">✎</button></div></td>
            </tr>
            <tr *ngIf="!invoices.length"><td colspan="7">No invoices registered.</td></tr>
          </tbody></table></div>
          <footer class="cf-datatable-footer"><span>Showing {{invoices.length ? 1 : 0}} to {{invoices.length}} of {{invoices.length}} entries</span><div><button disabled>Previous</button><button class="primary">1</button><button disabled>Next</button></div></footer>
        </article>
      </section>

      <section class="cfx-grid cfx-grid-1 cf-live-invoice" *ngSwitchCase="'invoice-details'">
        <article class="cfx-card cf-invoice-paper">
          <div class="cf-invoice-select"><label>Select Invoice<select [(ngModel)]="selectedInvoiceId" (ngModelChange)="selectInvoice($event)"><option [ngValue]="0">Select invoice</option><option *ngFor="let x of invoices" [ngValue]="x.id">#INV-{{x.id}} · {{x.titulo}}</option></select></label></div>
          <header class="cf-invoice-head"><div class="cf-invoice-logo"><img src="assets/mallqui-logo.svg" alt="Mallqui Gym"></div><div><h2>Invoice #INV-{{selectedInvoiceId || '2026-145'}}</h2><p>Issued: {{invoiceForm.fecha || '02 May 2026'}}</p><p>Due: {{invoiceUi.dueDate || '06 May 2026'}}</p><span>{{invoiceForm.estado || 'Overdue'}}</span></div></header>
          <div class="cf-invoice-parties"><div><h3>Billed To</h3><b>{{invoiceForm.titulo || 'Member Name'}}</b><p>{{invoiceUi.address || 'Pucallpa, Ucayali, Peru'}}</p><p>{{invoiceUi.email}}</p></div><div><h3>From</h3><b>Mallqui Gym</b><p>Jr. Los Laureles Mz 17 Lt 18</p><p>Pucallpa, Ucayali</p></div></div>
          <div class="cfx-table-wrap"><table><thead><tr><th>Service</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>
            <tr *ngFor="let item of invoiceItems"><td><b>{{item.service}}</b></td><td>{{item.description}}</td><td>{{item.qty}}</td><td>S/ {{item.unitPrice | number:'1.2-2'}}</td><td>S/ {{item.qty*item.unitPrice | number:'1.2-2'}}</td></tr>
          </tbody></table></div>
          <div class="cf-invoice-totals"><p><span>Subtotal</span><b>S/ {{invoiceSubtotal | number:'1.2-2'}}</b></p><p><span>Discount</span><b>- S/ {{invoiceDiscount | number:'1.2-2'}}</b></p><p><span>Tax (5%)</span><b>S/ {{invoiceTax | number:'1.2-2'}}</b></p><h3><span>Total</span><b>S/ {{invoiceTotal | number:'1.2-2'}}</b></h3></div>
          <div class="cf-invoice-notes"><h3>Notes</h3><p>{{invoiceUi.notes || 'Thank you for choosing Mallqui Gym. Payments are due within 4 days of invoice date.'}}</p></div>
          <footer class="cf-form-footer"><button>Download PDF</button><button (click)="printPayslip()">Print</button><button class="primary">Pay Now</button></footer>
        </article>
      </section>

      <section class="cfx-grid cfx-grid-1 cf-live-invoice-create" *ngSwitchCase="'add-invoice'">
        <article class="cfx-card">
          <section class="cf-invoice-form-section"><h2>Client Details</h2><div class="cf-member-form-grid"><label>Full Name<input [(ngModel)]="invoiceForm.titulo" placeholder="e.g. Arjun Mehta"></label><label>Email Address<input [(ngModel)]="invoiceUi.email" type="email" placeholder="member@example.com"></label><label>Phone<input [(ngModel)]="invoiceUi.phone" placeholder="+51 999 999 999"></label><label>Billing Address<input [(ngModel)]="invoiceUi.address"></label></div></section>
          <section class="cf-invoice-form-section"><h2>Invoice Details</h2><div class="cf-member-form-grid"><label>Invoice Number<input [(ngModel)]="invoiceUi.invoiceNumber" placeholder="INV-2026-145"></label><label>Currency<select [(ngModel)]="invoiceUi.currency"><option>PEN</option><option>USD</option></select></label><label>Issue Date<input [(ngModel)]="invoiceForm.fecha" type="date"></label><label>Due Date<input [(ngModel)]="invoiceUi.dueDate" type="date"></label><label>Payment Terms<select [(ngModel)]="invoiceUi.paymentTerms"><option>Due in 4 days</option><option>Due in 7 days</option><option>Due in 15 days</option></select></label><label>Tax ID / RUC<input [(ngModel)]="invoiceUi.taxId"></label><label class="span-2">Notes<textarea [(ngModel)]="invoiceUi.notes" rows="3"></textarea></label></div></section>
          <section class="cf-invoice-items"><div class="cfx-table-wrap"><table><thead><tr><th>Service</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Tax (%)</th><th>Total</th></tr></thead><tbody><tr *ngFor="let item of invoiceItems"><td><input [(ngModel)]="item.service"></td><td><input [(ngModel)]="item.description"></td><td><input type="number" [(ngModel)]="item.qty"></td><td><input type="number" [(ngModel)]="item.unitPrice"></td><td><input type="number" [(ngModel)]="item.tax"></td><td>S/ {{item.qty*item.unitPrice | number:'1.2-2'}}</td></tr></tbody></table></div><button (click)="addInvoiceItem()">＋ Add Item</button></section>
          <div class="cf-invoice-totals"><p><span>Subtotal</span><b>S/ {{invoiceSubtotal | number:'1.2-2'}}</b></p><p><span>Discount</span><b>- S/ {{invoiceDiscount | number:'1.2-2'}}</b></p><p><span>Tax</span><b>S/ {{invoiceTax | number:'1.2-2'}}</b></p><h3><span>Total</span><b>S/ {{invoiceTotal | number:'1.2-2'}}</b></h3></div>
          <footer class="cf-form-footer"><button>Save Draft</button><button class="primary" (click)="saveInvoice()" [disabled]="savingInvoice">{{savingInvoice?'Saving...':'Generate Invoice'}}</button></footer>
          <small *ngIf="invoiceMessage">{{invoiceMessage}}</small>
        </article>
      </section>

      <section class="cfx-grid cfx-grid-1 cf-live-invoice-create" *ngSwitchCase="'edit-invoice'">
        <article class="cfx-card">
          <header><div><span>INVOICE</span><h2>Edit Invoice</h2><p>Update an existing member invoice</p></div></header>
          <div class="cf-invoice-select"><label>Select Invoice<select [(ngModel)]="selectedInvoiceId" (ngModelChange)="selectInvoice($event)"><option [ngValue]="0">Select invoice</option><option *ngFor="let x of invoices" [ngValue]="x.id">#INV-{{x.id}} · {{x.titulo}}</option></select></label></div>
          <section class="cf-invoice-form-section"><h2>Client Details</h2><div class="cf-member-form-grid"><label>Full Name<input [(ngModel)]="invoiceForm.titulo" placeholder="Member name"></label><label>Email Address<input [(ngModel)]="invoiceUi.email" type="email"></label><label>Phone<input [(ngModel)]="invoiceUi.phone"></label><label>Billing Address<input [(ngModel)]="invoiceUi.address"></label></div></section>
          <section class="cf-invoice-form-section"><h2>Invoice Details</h2><div class="cf-member-form-grid"><label>Invoice Number<input [(ngModel)]="invoiceUi.invoiceNumber"></label><label>Currency<select [(ngModel)]="invoiceUi.currency"><option>PEN</option><option>USD</option></select></label><label>Issue Date<input [(ngModel)]="invoiceForm.fecha" type="date"></label><label>Due Date<input [(ngModel)]="invoiceUi.dueDate" type="date"></label><label>Status<select [(ngModel)]="invoiceForm.estado"><option>Issued</option><option>Paid</option><option>Pending</option><option>Overdue</option><option>Cancelled</option></select></label><label>Tax ID / RUC<input [(ngModel)]="invoiceUi.taxId"></label></div></section>
          <section class="cf-invoice-items"><div class="cfx-table-wrap"><table><thead><tr><th>Service</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Tax (%)</th><th>Total</th></tr></thead><tbody><tr *ngFor="let item of invoiceItems"><td><input [(ngModel)]="item.service"></td><td><input [(ngModel)]="item.description"></td><td><input type="number" [(ngModel)]="item.qty"></td><td><input type="number" [(ngModel)]="item.unitPrice"></td><td><input type="number" [(ngModel)]="item.tax"></td><td>S/ {{item.qty*item.unitPrice | number:'1.2-2'}}</td></tr></tbody></table></div><button (click)="addInvoiceItem()">＋ Add Item</button></section>
          <div class="cf-invoice-totals"><p><span>Subtotal</span><b>S/ {{invoiceSubtotal | number:'1.2-2'}}</b></p><p><span>Tax</span><b>S/ {{invoiceTax | number:'1.2-2'}}</b></p><h3><span>Total</span><b>S/ {{invoiceTotal | number:'1.2-2'}}</b></h3></div>
          <footer class="cf-form-footer"><button>Cancel</button><button class="primary" (click)="updateInvoice()" [disabled]="!selectedInvoiceId||savingInvoice">{{savingInvoice?'Saving...':'Update Invoice'}}</button></footer>
          <small *ngIf="invoiceMessage">{{invoiceMessage}}</small>
        </article>
      </section>

      <section class="cfx-grid cfx-grid-1 cf-live-expenses" *ngSwitchCase="'expenses'">
        <article class="cfx-card">
          <header><div><span>EXPENSES</span><h2>Expenses by Month</h2><p>Summary</p></div><button class="primary" (click)="expenseEditor=!expenseEditor">＋ Add Expense</button></header>
          <div class="cfx-table-wrap"><table><thead><tr><th>#</th><th>Product</th><th>Supplier</th><th>Equipment</th><th>Purchase Date</th><th>Payment Method</th><th>Amount</th><th>Status</th></tr></thead><tbody>
            <tr *ngFor="let x of expenses; let i=index"><td>{{i+1}}</td><td><b>{{x.titulo}}</b></td><td>{{x.subtitulo || 'Mallqui Supplier'}}</td><td>{{x.datos?.detalle || 'Gym Equipment'}}</td><td>{{x.fecha || '—'}}</td><td>Bank Transfer</td><td>S/ {{x.monto || 0 | number:'1.2-2'}}</td><td>{{x.estado}}</td></tr>
            <tr *ngIf="!expenses.length"><td colspan="8">No expenses registered.</td></tr>
          </tbody></table></div>
        </article>
        <article class="cfx-card" *ngIf="expenseEditor"><header><div><span>NEW EXPENSE</span><h2>Add Expense</h2></div></header><div class="cf-member-form-grid"><label>Product<input [(ngModel)]="expenseForm.titulo"></label><label>Supplier<input [(ngModel)]="expenseForm.subtitulo"></label><label>Purchase Date<input type="date" [(ngModel)]="expenseForm.fecha"></label><label>Amount<input type="number" [(ngModel)]="expenseForm.monto"></label><label>Status<select [(ngModel)]="expenseForm.estado"><option>Completed</option><option>Processing</option><option>Ordered</option><option>Delayed</option></select></label></div><footer class="cf-form-footer"><button (click)="expenseEditor=false">Cancel</button><button class="primary" (click)="saveExpense()">Save Expense</button></footer></article>
      </section>

      <section class="cfx-grid cfx-grid-1 cf-live-payslip" *ngSwitchCase="'payslip'">
        <article class="cfx-card cf-payslip-paper">
          <div class="cf-invoice-select"><label>Salary Record<select [(ngModel)]="selectedPayslipId"><option [ngValue]="0">Latest record</option><option *ngFor="let x of salaries" [ngValue]="x.id">#{{x.id}} · {{x.titulo}}</option></select></label></div>
          <header class="cf-payslip-head"><img src="assets/mallqui-logo.svg" alt="Mallqui Gym"><div><h2>Payslip No. - #PS-2026-{{selectedPayslip?.id || '052'}}</h2><p>{{selectedPayslip?.fecha || 'October 2026'}}</p><span>{{selectedPayslip?.estado || 'Paid'}}</span></div></header>
          <section class="cf-payslip-parties"><div><h3>Employee Details</h3><b>{{selectedPayslip?.titulo || 'Mallqui Trainer'}}</b><p>{{selectedPayslip?.subtitulo || 'Senior Fitness Consultant'}}</p><p>Employee ID: EMP-{{selectedPayslip?.id || '1045'}}</p><p>Pucallpa, Ucayali, Peru</p></div><div><h3>Gym Details</h3><b>Mallqui Gym</b><p>Jr. Los Laureles Mz 17 Lt 18</p><p>Pucallpa, Ucayali, Peru</p></div></section>
          <div class="cfx-table-wrap"><table><thead><tr><th>Earnings</th><th>Working Days</th><th>Amount (PEN)</th><th>Deductions</th><th>Amount (PEN)</th></tr></thead><tbody>
            <tr><td>Basic Salary</td><td>26</td><td>S/ {{payslipBasic | number:'1.2-2'}}</td><td>Income Tax</td><td>S/ {{payslipTax | number:'1.2-2'}}</td></tr>
            <tr><td>Housing / Mobility</td><td></td><td>S/ {{payslipHousing | number:'1.2-2'}}</td><td>Health Insurance</td><td>S/ {{payslipInsurance | number:'1.2-2'}}</td></tr>
            <tr><td>Performance Bonus</td><td></td><td>S/ {{payslipBonus | number:'1.2-2'}}</td><td></td><td></td></tr>
          </tbody></table></div>
          <div class="cf-payslip-totals"><p><span>Gross Earnings</span><b>S/ {{payslipGross | number:'1.2-2'}}</b></p><p><span>Total Deductions</span><b>S/ {{payslipDeductions | number:'1.2-2'}}</b></p><h3><span>Net Pay</span><b>S/ {{payslipNet | number:'1.2-2'}}</b></h3></div>
          <div class="cf-invoice-notes"><h3>Note</h3><p>This is a system-generated payslip. Salary has been credited to the employee's registered payment method.</p></div>
          <footer class="cf-form-footer"><button>Download</button><button class="primary" (click)="printPayslip()">Print</button></footer>
        </article>
      </section>

      <section class="cfx-grid cfx-grid-1 cf-component-showcase" *ngSwitchCase="'tables'">
        <article class="cfx-card"><header><div><span>TABLES</span><h2>Default Table</h2></div><button (click)="addRow()">＋ Add Row</button></header><div class="cfx-table-wrap"><table><thead><tr><th>Employee</th><th>Position</th><th>Address</th><th>Age</th><th>Start Date</th><th>Progress</th><th>Salary</th><th>Actions</th></tr></thead><tbody>
          <tr *ngFor="let row of demoRows"><td><b>{{row.name}}</b></td><td>{{row.module}}</td><td>Pucallpa, Ucayali</td><td>{{25+row.id}}</td><td>{{row.date}}</td><td><div class="cfx-progress mini"><i [style.width.%]="55+row.id*8"></i></div></td><td>S/ {{1800+row.id*250}}</td><td><button class="tiny">✎</button> <button class="tiny danger">×</button></td></tr>
        </tbody></table></div></article>
        <article class="cfx-card"><header><div><span>CUSTOMERS</span><h2>Customer Table</h2></div></header><div class="cfx-table-wrap"><table><thead><tr><th>Customer ID</th><th>First Name</th><th>Last Name</th><th>Phone</th><th>Email</th><th>Sessions</th><th>Money Spent</th><th>Last Login</th></tr></thead><tbody>
          <tr><td>#C1001</td><td>Amelia</td><td>Rodriguez</td><td>+51 999 111 222</td><td>amelia@example.com</td><td>32</td><td>S/ 540</td><td>Today 6:45pm</td></tr>
          <tr><td>#C1002</td><td>Liam</td><td>Anderson</td><td>+51 999 222 333</td><td>liam@example.com</td><td>28</td><td>S/ 615</td><td>Yesterday 8:20am</td></tr>
          <tr><td>#C1003</td><td>Sophie</td><td>Turner</td><td>+51 999 333 444</td><td>sophie@example.com</td><td>19</td><td>S/ 321</td><td>09:15am</td></tr>
        </tbody></table></div></article>
      </section>

      <section class="cfx-grid cfx-grid-1 cf-template-table-page" *ngSwitchCase="'data-tables'">
        <article class="cfx-card">
          <header><div><span>DATA TABLES</span><h2>Data Tables</h2><p>Search, sort and filter records</p></div></header>
          <div class="cfx-toolbar cf-datatable-toolbar">
            <label>Show <select><option>10</option><option>25</option><option>50</option></select> entries</label>
            <input [(ngModel)]="search" placeholder="Search records...">
          </div>
          <div class="cfx-table-wrap"><table>
            <thead><tr><th>#</th><th>Name</th><th>Module</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody><tr *ngFor="let row of filteredRows"><td>{{row.id}}</td><td><b>{{row.name}}</b></td><td>{{row.module}}</td><td><span class="cfx-badge">{{row.status}}</span></td><td>{{row.date}}</td><td><button class="tiny">View</button></td></tr></tbody>
          </table></div>
          <footer class="cf-datatable-footer"><span>Showing 1 to {{filteredRows.length}} of {{filteredRows.length}} entries</span><div><button disabled>Previous</button><button class="primary">1</button><button disabled>Next</button></div></footer>
        </article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-component-showcase" *ngSwitchCase="'graphs'">
        <article class="cfx-card"><header><div><span>GRAPHS</span><h2>Area Chart</h2></div></header><div class="cfx-area"><svg viewBox="0 0 420 170" preserveAspectRatio="none"><path d="M0 145 C60 115,80 145,130 86 S210 40,260 82 S350 30,420 58 L420 170 L0 170Z" fill="#eceaff"/><path d="M0 145 C60 115,80 145,130 86 S210 40,260 82 S350 30,420 58" fill="none" stroke="#5b56dd" stroke-width="4"/></svg></div></article>
        <article class="cfx-card"><header><div><span>GRAPHS</span><h2>Bar Chart</h2></div></header><div class="cfx-bars"><i *ngFor="let h of bars" [style.height.%]="h"></i></div></article>
        <article class="cfx-card"><header><div><span>GRAPHS</span><h2>Line Chart</h2></div></header><svg class="cfx-line tall" viewBox="0 0 420 180"><polyline points="5,145 55,115 105,132 155,70 205,92 255,44 305,65 355,24 415,52" fill="none" stroke="#5b56dd" stroke-width="4"/></svg></article>
        <article class="cfx-card"><header><div><span>GRAPHS</span><h2>Donut Chart</h2></div></header><div class="cfx-donut"><b>78%</b></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-component-showcase" *ngSwitchCase="'apex'">
        <article class="cfx-card"><header><div><span>APEX GRAPH</span><h2>Area Chart</h2></div></header><div class="cfx-area"><svg viewBox="0 0 420 170" preserveAspectRatio="none"><path d="M0 145 C60 115,80 145,130 86 S210 40,260 82 S350 30,420 58 L420 170 L0 170Z" fill="#eceaff"/><path d="M0 145 C60 115,80 145,130 86 S210 40,260 82 S350 30,420 58" fill="none" stroke="#5b56dd" stroke-width="4"/></svg></div></article>
        <article class="cfx-card"><header><div><span>APEX GRAPH</span><h2>Column Chart</h2></div></header><div class="cfx-bars"><i *ngFor="let h of bars2" [style.height.%]="h"></i></div></article>
        <article class="cfx-card"><header><div><span>APEX GRAPH</span><h2>Line Chart</h2></div></header><svg class="cfx-line tall" viewBox="0 0 420 180"><polyline points="5,145 55,115 105,132 155,70 205,92 255,44 305,65 355,24 415,52" fill="none" stroke="#5b56dd" stroke-width="4"/></svg></article>
        <article class="cfx-card"><header><div><span>APEX GRAPH</span><h2>Radial / Donut</h2></div></header><div class="cfx-donut"><b>78%</b></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-component-showcase" *ngSwitchCase="'morris'">
        <article class="cfx-card"><header><div><span>MORRIS</span><h2>Area Chart</h2></div></header><div class="cfx-area"><svg viewBox="0 0 420 170" preserveAspectRatio="none"><path d="M0 148 C60 125 105 141 145 100 S215 120 255 72 S330 95 420 42 L420 170 L0 170Z" fill="#eef8f3"/><path d="M0 148 C60 125 105 141 145 100 S215 120 255 72 S330 95 420 42" fill="none" stroke="#6bca9f" stroke-width="4"/></svg></div></article>
        <article class="cfx-card"><header><div><span>MORRIS</span><h2>Bar Chart</h2></div></header><div class="cfx-bars"><i *ngFor="let h of bars3" [style.height.%]="h"></i></div></article>
        <article class="cfx-card"><header><div><span>MORRIS</span><h2>Line Negative Values</h2></div></header><svg class="cfx-line tall" viewBox="0 0 420 180"><polyline points="5,92 55,55 105,118 155,62 205,130 255,46 305,102 355,30 415,78" fill="none" stroke="#6c66e8" stroke-width="4"/></svg></article>
        <article class="cfx-card"><header><div><span>MORRIS</span><h2>Donut Format</h2></div></header><div class="cf-double-donut"><div class="cfx-donut"><b>64%</b></div><div class="cfx-donut alt"><b>36%</b></div></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-component-showcase" *ngSwitchCase="'vector-maps'">
        <article class="cfx-card span-2"><header><div><span>VECTOR MAPS</span><h2>Gym Coverage</h2><p>Member activity and service coverage by zone.</p></div></header><div class="cfx-map"><span class="pin p1">Pucallpa Centro</span><span class="pin p2">Yarinacocha</span><span class="pin p3">Manantay</span><span class="pin p4">Callería</span></div></article>
        <article class="cfx-card"><h2>Top Locations</h2><div class="cfx-info"><p><b>Pucallpa Centro</b><span>42%</span></p><p><b>Yarinacocha</b><span>28%</span></p><p><b>Manantay</b><span>18%</span></p><p><b>Callería</b><span>12%</span></p></div></article>
        <article class="cfx-card"><h2>Coverage Status</h2><div class="cfx-progress-row"><label><span>Urban coverage</span><b>88%</b></label><div class="cfx-progress"><i style="width:88%"></i></div></div><div class="cfx-progress-row"><label><span>Member reach</span><b>74%</b></label><div class="cfx-progress"><i style="width:74%"></i></div></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-component-showcase" *ngSwitchCase="'accordions'">
        <article class="cfx-card"><header><div><span>ACCORDION</span><h2>Member FAQ</h2></div></header><div class="cfx-accordion" *ngFor="let x of accordionItems; let i=index"><button (click)="accordionOpen=accordionOpen===i?-1:i">{{x.title}} <span>{{accordionOpen===i?'−':'+'}}</span></button><p *ngIf="accordionOpen===i">{{x.text}}</p></div></article>
        <article class="cfx-card"><header><div><span>WORKOUT FAQ</span><h2>Training Questions</h2></div></header><div class="cfx-accordion"><button>How do I change my workout plan? <span>+</span></button></div><div class="cfx-accordion"><button>How is progress calculated? <span>+</span></button></div><div class="cfx-accordion"><button>Can a trainer adjust my routine? <span>+</span></button></div></article>
        <article class="cfx-card span-2"><header><div><span>POLICIES</span><h2>Membership Policies</h2></div></header><div class="cf-accordion-grid"><div><b>Membership Freeze</b><p>Memberships can be paused according to the selected plan.</p></div><div><b>Class Booking</b><p>Members can book available sessions while their plan is active.</p></div><div><b>Cancellation</b><p>Cancelled sessions can be managed from the member profile.</p></div></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-component-showcase" *ngSwitchCase="'carousel'">
        <article class="cfx-card span-2"><header><div><span>CAROUSEL</span><h2>Gym Highlights</h2></div><div class="cfx-buttons"><button (click)="prevSlide()">‹</button><button (click)="nextSlide()">›</button></div></header><div class="cfx-carousel"><img [src]="slides[slide].image" alt="Carousel"><div><small>FEATURED</small><h2>{{slides[slide].title}}</h2><p>{{slides[slide].text}}</p><div class="cf-carousel-dots"><i *ngFor="let x of slides; let i=index" [class.active]="i===slide"></i></div></div></div></article>
        <article class="cfx-card"><h2>Trainer Spotlight</h2><img class="cf-card-cover" src="assets/showcase/coach-showcase.svg" alt="Trainer"><p>Meet the trainer and review current training availability.</p><button>View Profile</button></article>
        <article class="cfx-card"><h2>Class Spotlight</h2><img class="cf-card-cover" src="assets/showcase/class-showcase.svg" alt="Class"><p>Featured classes and member activities.</p><button>View Classes</button></article>
      </section>

      <section class="cfx-grid cfx-grid-3 cf-component-showcase" *ngSwitchCase="'modals'">
        <article class="cfx-card"><h2>Basic Modal</h2><p>Standard confirmation dialog.</p><button class="primary" (click)="modal='basic'">Launch Modal</button></article>
        <article class="cfx-card"><h2>Form Modal</h2><p>Modal with input fields.</p><button class="primary" (click)="modal='form'">Open Form</button></article>
        <article class="cfx-card"><h2>Danger Modal</h2><p>Confirm destructive action.</p><button class="danger" (click)="modal='danger'">Delete Record</button></article>
        <article class="cfx-card"><h2>Centered Modal</h2><p>Vertically centered dialog.</p><button (click)="modal='basic'">Open Centered</button></article>
        <article class="cfx-card"><h2>Scrollable Modal</h2><p>Long content example.</p><button (click)="modal='basic'">Open Scrollable</button></article>
        <article class="cfx-card"><h2>Large Modal</h2><p>Large dashboard dialog.</p><button (click)="modal='form'">Open Large</button></article>
      </section>

      <section class="cfx-grid cfx-grid-4 cf-component-showcase" *ngSwitchCase="'popovers'">
        <article class="cfx-card centered"><h2>Popover Top</h2><button class="primary" (click)="popover=popover===1?0:1">Top</button><div class="cfx-pop" *ngIf="popover===1">Popover on top with information.</div></article>
        <article class="cfx-card centered"><h2>Popover Right</h2><button class="primary" (click)="popover=popover===2?0:2">Right</button><div class="cfx-pop" *ngIf="popover===2">Popover on right.</div></article>
        <article class="cfx-card centered"><h2>Popover Bottom</h2><button class="primary" (click)="popover=popover===3?0:3">Bottom</button><div class="cfx-pop" *ngIf="popover===3">Popover on bottom.</div></article>
        <article class="cfx-card centered"><h2>Popover Left</h2><button class="primary" (click)="popover=popover===4?0:4">Left</button><div class="cfx-pop" *ngIf="popover===4">Popover on left.</div></article>
      </section>

      <section class="cfx-grid cfx-grid-1 cf-component-showcase" *ngSwitchCase="'tabs-ui'">
        <article class="cfx-card"><header><div><span>TABS</span><h2>Default Tabs</h2></div></header><div class="cfx-tabs"><button *ngFor="let t of ['Dashboard','Analytics','Settings','Messages'];let i=index" [class.active]="tab===i" (click)="tab=i">{{t}}</button></div><div class="cfx-tab-content"><h2>{{['Dashboard Overview','Analytics & Insights','Preferences & Settings','Messages'][tab]}}</h2><p>{{['View your key statistics, recent updates and quick links in one place.','Track trends and analyze gym performance.','Customize account and notification preferences.','Check latest conversations and member messages.'][tab]}}</p></div></article>
        <article class="cfx-card"><h2>Pill Navigation</h2><div class="cfx-button-group"><button class="active">Overview</button><button>Members</button><button>Payments</button><button>Reports</button></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-component-showcase" *ngSwitchCase="'tooltips'">
        <article class="cfx-card centered"><h2>Top Tooltip</h2><button class="cfx-tooltip primary">Hover me<span>Tooltip on top</span></button><p>Useful for compact icon actions.</p></article>
        <article class="cfx-card centered"><h2>Right Tooltip</h2><button class="cfx-tooltip">Member info<span>Open member details</span></button><p>Shows context without leaving the page.</p></article>
        <article class="cfx-card centered"><h2>Bottom Tooltip</h2><button class="cfx-tooltip success">Payment<span>Payment completed</span></button><p>Provides status context.</p></article>
        <article class="cfx-card centered"><h2>Left Tooltip</h2><button class="cfx-tooltip danger">Delete<span>Delete this record</span></button><p>Useful for destructive actions.</p></article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-component-showcase" *ngSwitchCase="'forms'">
        <article class="cfx-card"><header><div><span>FORMS</span><h2>Basic Form</h2></div></header><div class="cfx-form"><label>Full Name<input [(ngModel)]="form.name" placeholder="Enter full name"></label><label>Email Address<input [(ngModel)]="form.email" type="email" placeholder="name@example.com"></label><label>Status<select [(ngModel)]="form.status"><option>Active</option><option>Pending</option></select></label><label>Message<textarea rows="4" placeholder="Write a message..."></textarea></label><button class="primary" (click)="saved=true">Submit Form</button><small *ngIf="saved" class="success-text">✓ Form submitted successfully.</small></div></article>
        <article class="cfx-card"><header><div><span>HORIZONTAL FORM</span><h2>Account Information</h2></div></header><div class="cfx-form"><label>Username<input value="mallqui-admin"></label><label>Phone<input placeholder="+51 999 999 999"></label><label>City<select><option>Pucallpa</option><option>Yarinacocha</option></select></label><label class="check"><input type="checkbox" checked> Receive notifications</label><div class="cfx-buttons"><button>Cancel</button><button class="primary">Save Changes</button></div></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-component-showcase" *ngSwitchCase="'form-inputs'">
        <article class="cfx-card"><header><div><span>FORM INPUTS</span><h2>Input Types</h2></div></header><div class="cfx-form"><label>Full Name<input placeholder="Enter full name"></label><label>Email<input type="email" placeholder="Enter email"></label><label>Password<input type="password" placeholder="Password"></label><label>Readonly<input readonly value="Readonly input"></label><label>Disabled<input disabled value="Disabled input"></label></div></article>
        <article class="cfx-card"><header><div><span>SIZES</span><h2>Input & Select Sizes</h2></div></header><div class="cfx-form"><input class="large" placeholder=".form-control-lg"><input placeholder="Default input"><input class="small" placeholder=".form-control-sm"><select><option>Default select</option></select><textarea rows="5" placeholder="Example textarea"></textarea></div></article>
        <article class="cfx-card"><header><div><span>INLINE</span><h2>Inline Form</h2></div></header><div class="cf-inline-form"><input value="Jane Doe"><span>@</span><input placeholder="Username"><label class="check"><input type="checkbox"> Remember me</label><button class="primary">Submit</button></div></article>
        <article class="cfx-card"><header><div><span>HELP</span><h2>Help Text</h2></div></header><div class="cfx-form"><label>Password<input type="password"></label><small>Your password must be 8-20 characters long and contain letters and numbers.</small></div></article>
      </section>

      <section class="cfx-grid cfx-grid-3 cf-component-showcase" *ngSwitchCase="'checkbox-radio'">
        <article class="cfx-card"><h2>Checkboxes</h2><label class="check"><input type="checkbox" checked> Checked checkbox</label><label class="check"><input type="checkbox"> Default checkbox</label><label class="check"><input type="checkbox" disabled> Disabled checkbox</label></article>
        <article class="cfx-card"><h2>Radios</h2><label class="check"><input type="radio" name="demo-radio" checked> First radio</label><label class="check"><input type="radio" name="demo-radio"> Second radio</label><label class="check"><input type="radio" name="demo-radio" disabled> Disabled radio</label></article>
        <article class="cfx-card"><h2>Switches</h2><label class="switch"><input type="checkbox" checked><span></span> Enable notifications</label><label class="switch"><input type="checkbox"><span></span> Auto renew membership</label><label class="switch"><input type="checkbox" checked><span></span> Email alerts</label></article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-component-showcase" *ngSwitchCase="'file-input'">
        <article class="cfx-card"><header><div><span>FILE INPUT</span><h2>Default File Input</h2></div></header><label class="cfx-upload"><span>⇧</span><b>Choose a file or drag it here</b><small>PNG, JPG, PDF up to 5 MB</small><input type="file" (change)="fileSelected($event)"></label></article>
        <article class="cfx-card"><header><div><span>SELECTED FILE</span><h2>Upload Preview</h2></div></header><div class="cfx-file-result"><span>▤</span><b>{{selectedFile || 'No file selected'}}</b><small *ngIf="selectedFile">Ready to upload</small></div><div class="cfx-progress" *ngIf="selectedFile"><i style="width:100%"></i></div></article>
        <article class="cfx-card"><header><div><span>MEMBER PHOTO</span><h2>Profile Image</h2></div></header><div class="cf-file-avatar"><img src="assets/showcase/coach-showcase.svg" alt="Profile"><div><b>member-profile.jpg</b><small>JPG · 824 KB</small><button>Replace</button></div></div></article>
        <article class="cfx-card"><header><div><span>DOCUMENTS</span><h2>Recent Uploads</h2></div></header><div class="cfx-list"><div><span>PDF</span><div><b>fitness-assessment.pdf</b><small>1.2 MB</small></div><em>Complete</em></div><div><span>IMG</span><div><b>member-photo.jpg</b><small>824 KB</small></div><em>Complete</em></div></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-component-showcase" *ngSwitchCase="'validations'">
        <article class="cfx-card"><header><div><span>VALIDATION</span><h2>Custom Validation</h2></div></header><div class="cfx-form"><label>First name<input [(ngModel)]="validation.name" [class.invalid]="validationTried&&!validation.name"></label><small class="success-text" *ngIf="validation.name">Looks good!</small><label>Email<input [(ngModel)]="validation.email" [class.invalid]="validationTried&&!validEmail"></label><small class="danger-text" *ngIf="validationTried&&!validEmail">Please provide a valid email.</small><label>State<select><option>Pucallpa</option><option>Ucayali</option></select></label><label class="check"><input type="checkbox"> Agree to terms and conditions</label><button class="primary" (click)="validationTried=true">Submit Form</button></div></article>
        <article class="cfx-card"><header><div><span>STATUS</span><h2>Validation State</h2></div></header><div class="cfx-validation-state" [class.ok]="validation.name&&validEmail"><span>{{validation.name&&validEmail?'✓':'!'}}</span><b>{{validation.name&&validEmail?'Form is valid':'Complete required fields'}}</b></div></article>
      </section>

      <section class="cfx-grid cfx-grid-3 cf-component-showcase" *ngSwitchCase="'date-time'">
        <article class="cfx-card"><h2>Date Picker</h2><input class="cfx-input" type="date"><small>Select a calendar date.</small></article>
        <article class="cfx-card"><h2>Time Picker</h2><input class="cfx-input" type="time"><small>Select training time.</small></article>
        <article class="cfx-card"><h2>Date & Time</h2><input class="cfx-input" type="datetime-local"><small>Schedule an event.</small></article>
        <article class="cfx-card"><h2>Month Picker</h2><input class="cfx-input" type="month"><small>Choose billing month.</small></article>
        <article class="cfx-card"><h2>Week Picker</h2><input class="cfx-input" type="week"><small>Choose workout week.</small></article>
        <article class="cfx-card"><h2>Date Range</h2><div class="cf-inline-form"><input class="cfx-input" type="date"><span>to</span><input class="cfx-input" type="date"></div><small>Select report period.</small></article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-component-showcase" *ngSwitchCase="'input-masks'">
        <article class="cfx-card"><header><div><span>MASKS</span><h2>Phone & Date</h2></div></header><div class="cfx-form"><label>Peru Phone<input placeholder="+51 999 999 999"></label><label>Date<input placeholder="YYYY-MM-DD"></label><label>Month / Year<input placeholder="MM-YY"></label><label>Time<input placeholder="HH:MM:SS"></label></div></article>
        <article class="cfx-card"><header><div><span>NUMERIC</span><h2>Numbers & Currency</h2></div></header><div class="cfx-form"><label>Credit Card<input placeholder="4444 3333 3333 4444"></label><label>Currency<input placeholder="S/ 1,250.00"></label><label>Thousands<input placeholder="333,333,333"></label><label>DNI<input maxlength="8" placeholder="12345678"></label></div></article>
        <article class="cfx-card"><header><div><span>DOCUMENT</span><h2>Identity Formats</h2></div></header><div class="cfx-form"><label>RUC<input placeholder="20123456789"></label><label>Member ID<input placeholder="MBR-2026-001"></label><label>Invoice<input placeholder="INV-2026-001"></label></div></article>
        <article class="cfx-card"><header><div><span>FITNESS</span><h2>Measurement Formats</h2></div></header><div class="cfx-form"><label>Weight<input placeholder="75.0 kg"></label><label>Height<input placeholder="1.75 m"></label><label>Body Fat<input placeholder="18.0 %"></label></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-component-showcase" *ngSwitchCase="'input-tags'">
        <article class="cfx-card"><header><div><span>INPUT TAGS</span><h2>Member Tags</h2></div></header><div class="cfx-tag-editor"><span *ngFor="let tag of tags">{{tag}} <button (click)="removeTag(tag)">×</button></span><input [(ngModel)]="newTag" (keydown.enter)="addTag()" placeholder="Add tag and press Enter"></div><small>Press Enter to create a new tag.</small></article>
        <article class="cfx-card"><header><div><span>TRAINING</span><h2>Workout Tags</h2></div></header><div class="cfx-chips"><span>Strength</span><span>HIIT</span><span>Cardio</span><span>Mobility</span><span>Recovery</span><span>Crossfit</span></div></article>
        <article class="cfx-card"><header><div><span>MEMBERSHIP</span><h2>Plan Tags</h2></div></header><div class="cfx-chips"><span>Basic</span><span>Premium</span><span>Enterprise</span><span>Trial</span></div></article>
        <article class="cfx-card"><header><div><span>FILTER</span><h2>Tag Filter</h2></div></header><div class="cfx-form"><input placeholder="Search tag..."><select><option>All categories</option><option>Members</option><option>Workout</option><option>Nutrition</option></select></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-live-alerts" *ngSwitchCase="'alerts'">
        <article class="cfx-card"><header><div><span>ALERTS</span><h2>Basic Click Alerts</h2></div></header><div class="cfx-buttons"><button class="primary">Primary Alert</button><button class="success">Success Alert</button><button>Info Alert</button><button class="danger">Danger Alert</button></div></article>
        <article class="cfx-card"><header><div><span>ALERTS</span><h2>Alerts</h2></div></header><div class="cfx-alert success">✓ A simple success alert—check it out!</div><div class="cfx-alert info">i A simple info alert—check it out!</div><div class="cfx-alert warning">! A simple warning alert—check it out!</div><div class="cfx-alert danger">× A simple danger alert—check it out!</div></article>
        <article class="cfx-card"><header><div><span>LINKS</span><h2>Alerts with Links</h2></div></header><div class="cfx-alert info">A simple alert with <u>an example link</u>.</div><div class="cfx-alert warning">Need attention? <u>Review details</u>.</div></article>
        <article class="cfx-card"><header><div><span>ICONS</span><h2>Alerts with Icons & Actions</h2></div></header><div class="cfx-alert success">✓ Membership payment completed. <b>View</b></div><div class="cfx-alert warning">⚑ Equipment requires maintenance. <b>Review</b></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-component-showcase" *ngSwitchCase="'avatars'">
        <article class="cfx-card">
          <header><div><span>AVATARS</span><h2>Avatar Sizes</h2><p>Profile images used across members, trainers and account pages.</p></div></header>
          <div class="cf-avatar-showcase sizes">
            <div><span class="cfx-avatar xs">CA</span><small>Extra Small</small></div>
            <div><span class="cfx-avatar sm">MG</span><small>Small</small></div>
            <div><span class="cfx-avatar">AD</span><small>Default</small></div>
            <div><span class="cfx-avatar large">GY</span><small>Large</small></div>
          </div>
        </article>
        <article class="cfx-card">
          <header><div><span>STATUS</span><h2>Avatar Status</h2></div></header>
          <div class="cf-avatar-showcase">
            <div><span class="cfx-avatar status online">JA</span><small>Online</small></div>
            <div><span class="cfx-avatar status busy">SM</span><small>Busy</small></div>
            <div><span class="cfx-avatar status away">TC</span><small>Away</small></div>
            <div><span class="cfx-avatar status offline">RP</span><small>Offline</small></div>
          </div>
        </article>
        <article class="cfx-card">
          <header><div><span>IMAGES</span><h2>Photo Avatars</h2></div></header>
          <div class="cf-avatar-photo-row">
            <img *ngFor="let i of [1,2,3,4,5]" src="assets/showcase/coach-showcase.svg" alt="Profile avatar">
          </div>
        </article>
        <article class="cfx-card">
          <header><div><span>GROUP</span><h2>Avatar Group</h2></div></header>
          <div class="cf-avatar-group"><span class="cfx-avatar">JA</span><span class="cfx-avatar">SM</span><span class="cfx-avatar">TC</span><span class="cfx-avatar">RP</span><span class="cfx-avatar">+9</span></div>
          <p>Grouped avatars are useful for trainers, classes and member teams.</p>
        </article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-component-showcase" *ngSwitchCase="'badges'">
        <article class="cfx-card"><header><div><span>BADGES</span><h2>Basic Badges</h2></div></header><div class="cfx-badges"><span>Primary</span><span class="success">Success</span><span class="warning">Warning</span><span class="danger">Danger</span><span>Info</span></div></article>
        <article class="cfx-card"><header><div><span>STATUS</span><h2>Member Status</h2></div></header><div class="cfx-badges"><span class="success">Active</span><span class="warning">Pending</span><span class="danger">Expired</span><span>New</span></div></article>
        <article class="cfx-card"><header><div><span>ROLES</span><h2>Role Badges</h2></div></header><div class="cfx-badges"><span>Administrator</span><span>Trainer</span><span>Member</span><span>Dietitian</span></div></article>
        <article class="cfx-card"><header><div><span>PILLS</span><h2>Pill Badges</h2></div></header><div class="cf-pill-badges"><span>12 New</span><span>8 Messages</span><span>3 Alerts</span><span>Premium</span></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-component-showcase" *ngSwitchCase="'buttons'">
        <article class="cfx-card"><h2>Solid Buttons</h2><div class="cfx-buttons"><button class="primary">Primary</button><button>Secondary</button><button class="success">Success</button><button class="danger">Danger</button><button class="warning">Warning</button><button>Info</button></div></article>
        <article class="cfx-card"><h2>Outline & Soft Buttons</h2><div class="cfx-buttons"><button class="outline-primary">Primary</button><button class="outline-success">Success</button><button class="outline-danger">Danger</button><button class="soft-primary">Soft Primary</button><button class="soft-success">Soft Success</button></div></article>
        <article class="cfx-card"><h2>Sizes</h2><div class="cfx-buttons"><button class="small">Small</button><button>Default</button><button class="large">Large</button></div></article>
        <article class="cfx-card"><h2>Pill / State Buttons</h2><div class="cfx-buttons"><button class="primary pill">Primary</button><button class="success pill">Success</button><button disabled>Disabled</button><button class="loading">◌ Loading...</button></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-component-showcase" *ngSwitchCase="'button-groups'">
        <article class="cfx-card"><h2>Basic Button Group</h2><div class="cfx-button-group"><button class="active">Left</button><button>Middle</button><button>Right</button></div></article>
        <article class="cfx-card"><h2>Toolbar</h2><div class="cfx-button-group"><button>1</button><button>2</button><button>3</button><button>4</button></div></article>
        <article class="cfx-card"><h2>Radio Group</h2><div class="cfx-button-group"><button class="active">Day</button><button>Week</button><button>Month</button><button>Year</button></div></article>
        <article class="cfx-card"><h2>Vertical Group</h2><div class="cf-vertical-group"><button>Profile</button><button>Settings</button><button>Logout</button></div></article>
      </section>

      <section class="cfx-grid cfx-grid-3 cf-component-showcase" *ngSwitchCase="'cards-ui'">
        <article class="cfx-card"><header><div><span>CARD HEADER</span><h2>Membership</h2></div></header><p>Manage plans, renewals and member access from one reusable card.</p><button class="primary">View Details</button></article>
        <article class="cfx-card"><span class="cfx-card-icon">♚</span><h2>Members</h2><p>Quick member statistics and shortcuts.</p><div class="cfx-badges"><span class="success">Active</span><span>Premium</span></div></article>
        <article class="cfx-card cfx-gradient"><small>MONTHLY REVENUE</small><strong>S/ 5,280</strong><p>12% above last month.</p><button>View Report</button></article>
        <article class="cfx-card centered"><h2>Centered Card</h2><p>Flexible content alignment example.</p><button>Action</button></article>
        <article class="cfx-card"><img class="cf-card-cover" src="assets/showcase/hero-showcase.svg" alt="Gym"><h2>Image Card</h2><p>Card with image, body and actions.</p></article>
        <article class="cfx-card"><h2>Quick Actions</h2><div class="cfx-list"><div><span>＋</span><div><b>Add Member</b><small>Create a new gym member.</small></div></div><div><span>S/</span><div><b>Register Payment</b><small>Record a membership payment.</small></div></div></div></article>
      </section>

      <section class="cfx-grid cfx-grid-3 cf-component-showcase" *ngSwitchCase="'advanced-cards'">
        <article class="cfx-card cfx-gradient"><small>FITNESS SCORE</small><strong>83%</strong><p>Up 6% from last week.</p><div class="cfx-progress"><i style="width:83%"></i></div></article>
        <article class="cfx-card"><header><div><span>PROGRESS</span><h2>Monthly Goal</h2></div><b>78%</b></header><div class="cfx-progress"><i style="width:78%"></i></div><div class="cf-sport-stats"><span><b>18</b><small>Sessions</small></span><span><b>5</b><small>Days Left</small></span></div></article>
        <article class="cfx-card"><header><div><span>SECURITY</span><h2>System Security</h2></div><span class="cfx-badge success">Protected</span></header><p>Dashboard secured with active session controls and protected API endpoints.</p><button>Run Scan</button></article>
        <article class="cfx-card"><header><div><span>NOTIFICATIONS</span><h2>Recent Updates</h2></div></header><div class="cfx-list"><div><span>✓</span><div><b>Subscription renewed</b><small>2 hours ago</small></div></div><div><span>⚙</span><div><b>Maintenance scheduled</b><small>Tomorrow 2:00 AM</small></div></div></div></article>
        <article class="cfx-card"><header><div><span>UPCOMING</span><h2>Gym Events</h2></div></header><div class="cfx-info"><p><b>Crossfit Session</b><span>Today 9:00 AM</span></p><p><b>Trainer Meeting</b><span>Today 2:00 PM</span></p></div></article>
        <article class="cfx-card"><header><div><span>PREMIUM</span><h2>Gold Plan</h2></div></header><p>Advanced analytics, reports and priority member support.</p><button class="primary">Current Plan</button></article>
      </section>

      <section class="cfx-grid cfx-grid-3 cf-component-showcase" *ngSwitchCase="'dropdowns'">
        <article class="cfx-card"><h2>Basic Dropdown</h2><button class="primary" (click)="dropdown=!dropdown">Dropdown button ▾</button><div class="cfx-dropdown" *ngIf="dropdown"><button>Action</button><button>Another action</button><button>Something else</button></div></article>
        <article class="cfx-card"><h2>With Divider</h2><div class="cf-static-dropdown"><button>Action</button><button>Another action</button><hr><button>Separated link</button></div></article>
        <article class="cfx-card"><h2>Active & Disabled</h2><div class="cf-static-dropdown"><button>Regular link</button><button class="active">Active link</button><button disabled>Disabled link</button></div></article>
        <article class="cfx-card"><h2>Directions</h2><div class="cfx-buttons"><button>Dropdown ▾</button><button>Dropup ▴</button><button>Dropend ›</button></div></article>
        <article class="cfx-card"><h2>Dropdown with Form</h2><div class="cfx-form"><input placeholder="Email"><input type="password" placeholder="Password"><label class="check"><input type="checkbox"> Remember me</label><button class="primary">Sign in</button></div></article>
        <article class="cfx-card"><h2>With Search</h2><div class="cfx-form"><input placeholder="Search items..."></div><div class="cfx-list"><div><span>1</span><div><b>Item 1</b></div></div><div><span>2</span><div><b>Item 2</b></div></div></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-component-showcase" *ngSwitchCase="'list-items'">
        <article class="cfx-card"><header><div><span>LIST ITEMS</span><h2>Recent Activity</h2></div></header><div class="cfx-list"><div *ngFor="let row of demoRows"><span>{{row.id}}</span><div><b>{{row.name}}</b><small>{{row.module}} · {{row.date}}</small></div><em>{{row.status}}</em></div></div></article>
        <article class="cfx-card"><header><div><span>MEMBERS</span><h2>Member Status</h2></div></header><div class="cfx-list"><div><span>JA</span><div><b>James Anderson</b><small>Gold Plan</small></div><em>Active</em></div><div><span>SM</span><div><b>Sofia Miller</b><small>Premium Plan</small></div><em>Active</em></div><div><span>TC</span><div><b>Tom Cooper</b><small>Basic Plan</small></div><em>Pending</em></div></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-component-showcase" *ngSwitchCase="'progress-bars'">
        <article class="cfx-card"><h2>Default Progress Bars</h2><div class="cfx-progress-row" *ngFor="let p of progressData"><label><span>{{p.name}}</span><b>{{p.value}}%</b></label><div class="cfx-progress"><i [style.width.%]="p.value"></i></div></div></article>
        <article class="cfx-card"><h2>Progress Heights</h2><div class="cf-progress-sizes"><div><i style="width:25%"></i></div><div><i style="width:50%"></i></div><div><i style="width:75%"></i></div><div><i style="width:90%"></i></div></div></article>
        <article class="cfx-card"><h2>Striped / Animated</h2><div class="cfx-progress striped"><i style="width:68%"></i></div><div class="cfx-progress striped animated"><i style="width:82%"></i></div></article>
        <article class="cfx-card"><h2>Circular Progress</h2><div class="cf-double-donut"><div class="cfx-donut"><b>83%</b></div><div class="cfx-donut alt"><b>62%</b></div></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-component-showcase" *ngSwitchCase="'placeholders'">
        <article class="cfx-card"><header><div><span>PLACEHOLDERS</span><h2>Card Placeholder</h2></div></header><div class="cfx-placeholder big"></div><div class="cfx-placeholder"></div><div class="cfx-placeholder short"></div><div class="cfx-placeholder"></div><button disabled>Loading...</button></article>
        <article class="cfx-card"><header><div><span>PROFILE</span><h2>Profile Placeholder</h2></div></header><div class="cf-placeholder-profile"><span class="cfx-placeholder avatar"></span><div><span class="cfx-placeholder"></span><span class="cfx-placeholder short"></span></div></div><div class="cfx-placeholder"></div><div class="cfx-placeholder"></div></article>
        <article class="cfx-card span-2"><header><div><span>TABLE</span><h2>Table Placeholder</h2></div></header><div class="cf-placeholder-table"><div *ngFor="let i of [1,2,3,4,5]"><span class="cfx-placeholder avatar"></span><span class="cfx-placeholder"></span><span class="cfx-placeholder short"></span><span class="cfx-placeholder"></span></div></div></article>
        <article class="cfx-card span-2"><header><div><span>CHART</span><h2>Chart Placeholder</h2></div></header><div class="cf-placeholder-chart"><i *ngFor="let h of [40,62,48,80,66,92,74]" [style.height.%]="h"></i></div></article>
      </section>

      <section class="cfx-grid cfx-grid-3 cf-component-showcase" *ngSwitchCase="'spinners'">
        <article class="cfx-card centered"><h2>Border Spinner</h2><div class="cfx-spinner"></div><small>Loading dashboard data</small></article>
        <article class="cfx-card centered"><h2>Alternate Spinner</h2><div class="cfx-spinner alt"></div><small>Processing payment</small></article>
        <article class="cfx-card centered"><h2>Small Spinner</h2><div class="cfx-spinner small-spin"></div><small>Saving changes</small></article>
        <article class="cfx-card centered"><h2>Button Loading</h2><button class="primary"><span class="cf-inline-spinner"></span> Loading...</button></article>
        <article class="cfx-card centered"><h2>Growing Dots</h2><div class="cf-loading-dots"><i></i><i></i><i></i></div><small>Syncing records</small></article>
        <article class="cfx-card centered"><h2>Progress Loader</h2><div class="cfx-progress striped animated"><i style="width:72%"></i></div><small>72% complete</small></article>
      </section>

      <section class="cfx-grid cfx-grid-1 cf-component-showcase" *ngSwitchCase="'icons'">
        <article class="cfx-card"><header><div><span>ICONS</span><h2>Interface Icons</h2><p>Reusable icons for navigation, actions and status indicators.</p></div></header><div class="cfx-icon-grid"><div *ngFor="let icon of icons"><span>{{icon}}</span><small>Icon</small></div></div></article>
        <article class="cfx-card"><header><div><span>ACTIONS</span><h2>Action Icons</h2></div></header><div class="cf-icon-action-grid"><button>＋<small>Add</small></button><button>✎<small>Edit</small></button><button>⌕<small>View</small></button><button>⇩<small>Download</small></button><button>⚙<small>Settings</small></button><button>×<small>Delete</small></button></div></article>
        <article class="cfx-card"><header><div><span>FITNESS</span><h2>Fitness Icons</h2></div></header><div class="cf-icon-action-grid"><button>🏋<small>Workout</small></button><button>⚡<small>Activity</small></button><button>◉<small>Cardio</small></button><button>☾<small>Sleep</small></button><button>↗<small>Progress</small></button><button>♨<small>Diet</small></button></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-account-page" *ngSwitchCase="'account-settings'">
        <article class="cfx-card span-2 cf-account-profile">
          <img src="assets/showcase/coach-showcase.svg" alt="Profile">
          <div><h2>Account Settings</h2><p>Manage profile details, notifications, billing, security and connected applications.</p></div>
          <button class="primary">Upload New</button>
        </article>

        <article class="cfx-card">
          <header><div><span>PROFILE</span><h2>Update Your Details</h2></div></header>
          <div class="cfx-form">
            <label>Display Name<input value="Administrator"></label>
            <label>Email<input value="admin@mallquigym.com"></label>
            <label>Full Name<input value="Mallqui Gym Admin"></label>
            <label>Phone Number<input value="+51 939 398 148"></label>
            <div class="cfx-buttons"><button>Reset</button><button class="primary">Save Changes</button></div>
          </div>
        </article>

        <article class="cfx-card">
          <header><div><span>LINK ACCOUNTS</span><h2>Link Accounts</h2></div></header>
          <div class="cf-linked-accounts">
            <div><b>Facebook</b><button>Connect</button></div>
            <div><b>X / Twitter</b><button>Connect</button></div>
            <div><b>Google</b><button>Connect</button></div>
            <div><b>GitHub</b><button>Connect</button></div>
            <div><b>Instagram</b><button>Connect</button></div>
          </div>
        </article>

        <article class="cfx-card span-2">
          <header><div><span>NOTIFICATIONS</span><h2>Notification Preferences</h2><p>Choose which updates you want to receive.</p></div></header>
          <div class="cf-settings-grid">
            <label class="switch"><input type="checkbox" checked><span></span> Messages</label>
            <label class="switch"><input type="checkbox" checked><span></span> Review</label>
            <label class="switch"><input type="checkbox" checked><span></span> Updates</label>
            <label class="switch"><input type="checkbox"><span></span> Desktop Notifications</label>
            <label class="switch"><input type="checkbox" checked><span></span> Email</label>
            <label class="switch"><input type="checkbox"><span></span> Chat</label>
            <label class="switch"><input type="checkbox" checked><span></span> Reminder</label>
            <label class="switch"><input type="checkbox"><span></span> Comment</label>
          </div>
        </article>

        <article class="cfx-card span-2 cf-settings-plans">
          <header><div><span>PLAN</span><h2>Membership Plan</h2><p>You can upgrade and downgrade whenever you want.</p></div></header>
          <div class="cf-plan-row">
            <div><small>BASIC</small><b>S/ 60<em>/mo</em></b><p>5 Projects · Basic Support · Email Reports</p><button>Choose Basic</button></div>
            <div class="featured"><small>MOST POPULAR</small><b>S/ 90<em>/mo</em></b><p>Unlimited Projects · Priority Support · Advanced Analytics</p><button class="primary">Current Plan</button></div>
            <div><small>BUSINESS</small><b>S/ 120<em>/mo</em></b><p>Everything in Pro · Dedicated Manager · Custom Integrations</p><button>Contact Sales</button></div>
          </div>
        </article>

        <article class="cfx-card span-2">
          <header><div><span>BILLING</span><h2>Billing History</h2></div></header>
          <div class="cfx-table-wrap"><table><thead><tr><th>Order No.</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead><tbody>
            <tr><td>MG-10982</td><td>09 October 2026</td><td>S/ 90.00</td><td><span class="cfx-badge">Paid</span></td></tr>
            <tr><td>MG-10841</td><td>09 September 2026</td><td>S/ 90.00</td><td><span class="cfx-badge">Paid</span></td></tr>
            <tr><td>MG-10721</td><td>09 August 2026</td><td>S/ 90.00</td><td><span class="cfx-badge">Paid</span></td></tr>
          </tbody></table></div>
        </article>

        <article class="cfx-card span-2">
          <header><div><span>APPLICATIONS</span><h2>Connected Applications</h2></div></header>
          <div class="cf-app-grid">
            <div><b>Slack</b><small>Successfully connected</small><button>Disconnect</button></div>
            <div><b>Facebook</b><small>Successfully connected</small><button>Disconnect</button></div>
            <div><b>Notion</b><small>Successfully connected</small><button>Disconnect</button></div>
            <div><b>GitHub</b><small>Connect your GitHub account</small><button>Connect</button></div>
            <div><b>Google</b><small>Connect your Google account</small><button>Connect</button></div>
            <div><b>X / Twitter</b><small>Connect your X account</small><button>Connect</button></div>
          </div>
        </article>

        <article class="cfx-card">
          <header><div><span>SECURITY</span><h2>Change Password</h2><p>Your password should be updated periodically.</p></div></header>
          <div class="cfx-form">
            <label>Current Password<input type="password"></label>
            <label>New Password<input type="password"></label>
            <label>Confirm New Password<input type="password"></label>
            <button class="primary">Update Password</button>
          </div>
        </article>

        <article class="cfx-card">
          <header><div><span>SESSIONS</span><h2>Active Sessions</h2></div></header>
          <div class="cfx-list">
            <div><span>PC</span><div><b>Windows 10 · Chrome</b><small>Pucallpa, Peru · Current device</small></div><em>Active</em></div>
            <div><span>PH</span><div><b>Android · Chrome</b><small>Pucallpa, Peru</small></div><button>Terminate</button></div>
            <div><span>LT</span><div><b>Laptop · Edge</b><small>Pucallpa, Peru</small></div><button>Terminate</button></div>
          </div>
        </article>

        <article class="cfx-card span-2 cf-danger-zone">
          <header><div><span>DANGER ZONE</span><h2>Delete Account?</h2><p>This action is permanent and cannot be undone.</p></div></header>
          <button class="danger">Delete Account</button>
        </article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-profile-page" *ngSwitchCase="'my-profile'">
        <article class="cfx-card cfx-profile-card"><img class="cf-profile-cover" src="assets/showcase/hero-showcase.svg" alt="Gym"><div class="cfx-avatar large">A</div><h2>Administrator Mallqui</h2><p>Gym Admin</p><div class="cfx-badges"><span>Gold Plan</span><span class="success">Active</span></div><button class="primary">Edit Profile</button></article>
        <article class="cfx-card"><header><div><span>PROFILE</span><h2>Personal Information</h2></div></header><div class="cfx-info"><p><b>Full Name</b><span>Mallqui Gym Admin</span></p><p><b>Email</b><span>admin@mallquigym.com</span></p><p><b>Phone</b><span>+51 939 398 148</span></p><p><b>Location</b><span>Pucallpa, Ucayali</span></p><p><b>Role</b><span>Administrator</span></p></div></article>
        <article class="cfx-card span-2"><header><div><span>ACTIVITY</span><h2>Recent Activity</h2></div></header><div class="cfx-list"><div><span>✓</span><div><b>Membership updated</b><small>Today, 08:20 AM</small></div></div><div><span>S/</span><div><b>Payment reviewed</b><small>Yesterday, 06:10 PM</small></div></div><div><span>♚</span><div><b>New member registered</b><small>Yesterday, 03:40 PM</small></div></div></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-contact-page" *ngSwitchCase="'contact'">
        <article class="cfx-card"><header><div><span>CONTACT</span><h2>Send Us a Message</h2></div></header><div class="cfx-form"><label>Name<input placeholder="Your name"></label><label>Email<input type="email" placeholder="you@example.com"></label><label>Subject<input [(ngModel)]="contact.subject" placeholder="Subject"></label><label>Message<textarea rows="7" [(ngModel)]="contact.message"></textarea></label><button class="primary" (click)="contactSent=true">Send Message</button><small class="success-text" *ngIf="contactSent">✓ Message prepared successfully.</small></div></article>
        <article class="cfx-card"><header><div><span>MALLQUI GYM</span><h2>Contact Information</h2></div></header><div class="cfx-info"><p><b>Phone</b><span>939 398 148</span></p><p><b>Address</b><span>Jr. Los Laureles Mz 17 Lt 18</span></p><p><b>Reference</b><span>Plaza de Laura Bosso</span></p><p><b>City</b><span>Pucallpa, Ucayali</span></p><p><b>Opening</b><span>06:00 AM</span></p><p><b>Closing</b><span>09:30 PM</span></p></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-component-showcase" *ngSwitchCase="'typography'">
        <article class="cfx-card"><h2>Headings</h2><div class="cf-type-stack"><h1>h1. Gym Dashboard</h1><h2>h2. Gym Dashboard</h2><h3>h3. Gym Dashboard</h3><h4>h4. Gym Dashboard</h4><h5>h5. Gym Dashboard</h5><h6>h6. Gym Dashboard</h6></div></article>
        <article class="cfx-card"><h2>Display Headings</h2><div class="cf-display-stack"><p class="display-1">Display 1</p><p class="display-2">Display 2</p><p class="display-3">Display 3</p></div></article>
        <article class="cfx-card"><h2>Inline Text Elements</h2><p><mark>Highlighted text</mark></p><p><del>Deleted text</del></p><p><strong>Bold text</strong></p><p><em>Italic text</em></p><p><small>Small text</small></p></article>
        <article class="cfx-card"><h2>Lead & Paragraphs</h2><p class="lead">This is a lead paragraph used for introductory content.</p><p>Standard body text for descriptions, reports and dashboard information.</p><p class="text-muted">Muted text provides secondary information.</p></article>
        <article class="cfx-card"><h2>Blockquote</h2><blockquote>Train with purpose, recover with discipline, improve every week.</blockquote><small>— Mallqui Gym</small></article>
        <article class="cfx-card"><h2>Lists</h2><ul><li>Strength Training</li><li>Cardiovascular</li><li>Mobility</li><li>Nutrition</li></ul><ol><li>Warm up</li><li>Main workout</li><li>Cool down</li></ol></article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-auth-overview" *ngSwitchCase="'login-signup'">
        <article class="cfx-card cfx-auth">
          <div class="cf-auth-brand"><span class="cf-auth-mark">CF</span><div><b>Mallqui Gym</b><small>Fitness Admin</small></div></div>
          <h2>Login</h2><p>Sign in to access your fitness dashboard.</p>
          <div class="cfx-form"><label>Email Address<input type="email" placeholder="name@example.com"></label><label>Password<input type="password" placeholder="••••••••"></label><label class="check"><input type="checkbox"> Remember me</label><button class="primary">Login</button></div>
        </article>
        <article class="cfx-card cfx-auth">
          <div class="cf-auth-brand"><span class="cf-auth-mark">CF</span><div><b>Mallqui Gym</b><small>Fitness Admin</small></div></div>
          <h2>Signup</h2><p>Create a new dashboard account.</p>
          <div class="cfx-form"><label>Full Name<input placeholder="Full name"></label><label>Email Address<input type="email" placeholder="name@example.com"></label><label>Password<input type="password" placeholder="••••••••"></label><button class="primary">Create Account</button></div>
        </article>
      </section>

      <section class="cfx-grid cfx-grid-1 cf-auth-live" *ngSwitchCase="'login-page'">
        <article class="cfx-card cfx-auth"><div class="cf-auth-brand"><span class="cf-auth-mark">MG</span><div><b>Mallqui Gym</b><small>Fitness Admin</small></div></div><h2>Welcome back</h2><p>Please sign in to your account.</p><div class="cfx-form"><label>Email Address<input type="email" placeholder="name@example.com"></label><label>Password<input type="password" placeholder="••••••••"></label><div class="cf-auth-row"><label class="check"><input type="checkbox"> Remember me</label><button class="link-btn">Forgot password?</button></div><button class="primary">Login</button></div><div class="cf-auth-divider"><span>or continue with</span></div><div class="cfx-buttons"><button>Google</button><button>Facebook</button></div><small>Don't have an account? <b>Sign Up</b></small></article>
      </section>

      <section class="cfx-grid cfx-grid-1 cf-auth-live" *ngSwitchCase="'signup-page'">
        <article class="cfx-card cfx-auth"><div class="cf-auth-brand"><span class="cf-auth-mark">MG</span><div><b>Mallqui Gym</b><small>Fitness Admin</small></div></div><h2>Create account</h2><p>Enter your details to get started.</p><div class="cfx-form"><label>Full Name<input placeholder="Full name"></label><label>Email Address<input type="email" placeholder="name@example.com"></label><label>Password<input type="password"></label><label>Confirm Password<input type="password"></label><label class="check"><input type="checkbox"> I agree to Terms & Conditions</label><button class="primary">Create Account</button></div><small>Already have an account? <b>Login</b></small></article>
      </section>

      <section class="cfx-grid cfx-grid-1 cf-auth-live" *ngSwitchCase="'forgot-password'">
        <article class="cfx-card cfx-auth"><div class="cf-auth-brand"><span class="cf-auth-mark">MG</span><div><b>Mallqui Gym</b><small>Fitness Admin</small></div></div><h2>Forgot Password?</h2><p>Enter your email and we'll send you a reset link.</p><div class="cfx-form"><label>Email Address<input type="email" [(ngModel)]="forgotEmail" placeholder="name@example.com"></label><button class="primary" (click)="authMessage=forgotEmail?'Reset link prepared.':'Enter your email first.'">Send Reset Link</button></div><small *ngIf="authMessage">{{authMessage}}</small><button class="link-btn">← Back to Login</button></article>
      </section>

      <section class="cfx-grid cfx-grid-1 cf-auth-live" *ngSwitchCase="'reset-password-page'">
        <article class="cfx-card cfx-auth"><div class="cf-auth-brand"><span class="cf-auth-mark">MG</span><div><b>Mallqui Gym</b><small>Fitness Admin</small></div></div><h2>Reset Password</h2><p>Create a new secure password.</p><div class="cfx-form"><label>New Password<input type="password" [(ngModel)]="resetForm.password"></label><label>Confirm Password<input type="password" [(ngModel)]="resetForm.confirm"></label><button class="primary" (click)="previewResetPassword()">Reset Password</button></div><small *ngIf="authMessage">{{authMessage}}</small></article>
      </section>

      <section class="cfx-grid cfx-grid-1 cf-error-live" *ngSwitchCase="'page-not-found'">
        <article class="cfx-card cfx-empty-page"><strong>404</strong><h2>Page Not Found</h2><p>The page you are looking for does not exist or has been moved.</p><div class="cfx-buttons"><button class="primary" (click)="goAdmin()">Back to Dashboard</button><button>Contact Support</button></div></article>
      </section>

      <section class="cfx-grid cfx-grid-1 cf-error-live" *ngSwitchCase="'maintenance'">
        <article class="cfx-card cfx-empty-page"><span class="cfx-big-icon">⚙</span><h2>Under Maintenance</h2><p>We are improving the Mallqui Gym dashboard. Please check back shortly.</p><div class="cf-maintenance-progress"><div><i style="width:72%"></i></div><span>72% complete</span></div><button class="primary" (click)="goAdmin()">Back to Dashboard</button></article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-component-showcase" *ngSwitchCase="'menu-level'">
        <article class="cfx-card"><header><div><span>MENU LEVEL</span><h2>Nested Navigation</h2></div></header><div class="cfx-tree"><button (click)="treeOpen=!treeOpen">▾ Level One Menu</button><div *ngIf="treeOpen"><button>Level Two Link</button><button>▾ Level Two Menu</button><div><button>Level Three Link</button><button>Level Three Link</button></div></div><button>Level One Link</button></div></article>
        <article class="cfx-card"><h2>Current Level</h2><div class="cfx-info"><p><b>Selected</b><span>{{config.title}}</span></p><p><b>Group</b><span>Menu Level</span></p><p><b>Status</b><span>Active</span></p></div></article>
      </section>

      <section class="cfx-grid cfx-grid-1" *ngSwitchCase="'external-link'"><article class="cfx-card cfx-empty-page"><span class="cfx-big-icon">↗</span><h2>Enlace externo</h2><p>Ejemplo de acceso a un recurso externo desde el panel.</p><button class="primary" (click)="openExternal()">Abrir recurso</button></article></section>

      <section class="cfx-grid cfx-grid-2 cf-component-showcase" *ngSwitchCase="'chip'">
        <article class="cfx-card"><h2>Chip 6</h2><div class="cfx-chips"><span>Fitness</span><span>Workout</span><span>Member</span><span>Trainer</span><span>Nutrition</span><span>Active</span></div></article>
        <article class="cfx-card"><h2>Filter Chips</h2><div class="cfx-chips"><span>All</span><span>Today</span><span>This Week</span><span>Paid</span><span>Pending</span><span>Overdue</span></div></article>
      </section>

      <section class="cfx-grid cfx-grid-2 cf-component-showcase" *ngSwitchCase="'badge-link'">
        <article class="cfx-card"><h2>Badge Chip</h2><div class="cfx-badges"><span>New 6</span><span class="success">Active 24</span><span class="warning">Pending 8</span><span class="danger">Overdue 3</span></div></article>
        <article class="cfx-card"><h2>Navigation Badges</h2><div class="cfx-list"><div><span>✉</span><div><b>Messages</b></div><em>6</em></div><div><span>⚑</span><div><b>Alerts</b></div><em>3</em></div><div><span>♚</span><div><b>Members</b></div><em>24</em></div></div></article>
      </section>

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

    /* TEMPLATE569574_COMPONENT_LOCK */
    :host{display:block!important;background:#f6f6fb!important}
    .cfx-page{margin:0!important;padding:0!important;background:#f6f6fb!important;color:#2d2c3c!important}
    .cfx-hero{display:none!important}
    .cfx-crumb{height:35px!important;min-height:35px!important;padding:0 10px!important;border:0!important;border-radius:0!important;background:linear-gradient(90deg,#574fd0,#5f57d9)!important;box-shadow:none!important}
    .cfx-crumb small,.cfx-crumb strong,.cfx-crumb b,.cfx-crumb span{color:#fff!important}
    .cfx-crumb small,.cfx-crumb strong{font-size:7.5px!important}.cfx-crumb span,.cfx-crumb b{font-size:8.5px!important}
    .cfx-crumb em{min-height:19px!important;padding:0 6px!important;border-radius:4px!important;font-size:6.8px!important}
    .cfx-grid{gap:9px!important;margin:9px!important}
    .cfx-card{padding:10px!important;border:1px solid #ecebf3!important;border-radius:5px!important;background:#fff!important;box-shadow:0 1px 5px rgba(61,57,102,.025)!important}
    .cfx-card>header{margin:0 0 9px!important;padding:0!important;border:0!important;background:transparent!important}
    .cfx-card h1{font-size:15px!important}.cfx-card h2{font-size:10px!important}.cfx-card h3{font-size:9px!important}
    .cfx-card p{font-size:8px!important;color:#9698a6!important}
    .cfx-table-wrap{border:1px solid #ecebf3!important;border-radius:5px!important;box-shadow:none!important}
    .cfx-table-wrap th{padding:6px 8px!important;background:#fafafe!important;color:#777a89!important;font-size:7.5px!important}
    .cfx-table-wrap td{padding:7px 8px!important;background:#fff!important;color:#545664!important;font-size:8px!important}
    .cfx-form input,.cfx-form select,.cfx-form textarea,.cf-member-form-grid input,.cf-member-form-grid select,.cf-member-form-grid textarea,.cfx-toolbar input,.cfx-toolbar select{border:1px solid #dedee8!important;border-radius:4px!important;background:#fff!important;box-shadow:none!important;font-size:8px!important}
    .cfx-form input,.cfx-form select,.cf-member-form-grid input,.cf-member-form-grid select{height:31px!important}
    .cfx-card button{min-height:27px!important;padding:0 8px!important;border:1px solid #e0dff0!important;border-radius:4px!important;background:#fff!important;color:#656777!important;font-size:8px!important;box-shadow:none!important}
    .cfx-card button.primary{border-color:#5f57d9!important;background:#5f57d9!important;color:#fff!important}
    .cfx-modal{border:1px solid #ecebf3!important;border-radius:7px!important;box-shadow:0 18px 50px rgba(42,40,83,.16)!important}
    .cf-member-profile-card,.cf-invoice-paper,.cf-payslip-paper{border:1px solid #ecebf3!important;border-radius:5px!important;background:#fff!important;box-shadow:0 1px 5px rgba(61,57,102,.025)!important}
    @media(max-width:700px){.cfx-page{margin:0!important}.cfx-grid{margin:8px!important}}


    /* TEMPLATE569574_ACCOUNT_EXT */
    .cf-settings-plans{grid-column:1/-1!important}
    .cf-plan-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
    .cf-plan-row>div{min-height:135px;display:flex;flex-direction:column;gap:6px;padding:12px;border:1px solid #ecebf3;border-radius:5px;background:#fff}
    .cf-plan-row>div.featured{border-color:#c8c4ef;background:#f8f7ff}
    .cf-plan-row small{color:#8f92a0;font-size:7.5px;font-weight:700;letter-spacing:.5px}
    .cf-plan-row b{color:#2d2c3c;font-size:18px}.cf-plan-row b em{color:#999ba8;font-size:8px;font-style:normal;font-weight:500}
    .cf-plan-row p{margin:0!important;min-height:34px}
    .cf-plan-row button{margin-top:auto}
    .cf-app-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
    .cf-app-grid>div{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:auto auto;gap:2px 8px;align-items:center;padding:10px;border:1px solid #ecebf3;border-radius:5px;background:#fff}
    .cf-app-grid b{font-size:9px;color:#373746}.cf-app-grid small{font-size:7.5px;color:#999ba8}.cf-app-grid button{grid-column:2;grid-row:1/3}
    .cf-danger-zone{border-color:#f1dadd!important;background:#fffafa!important}
    .cf-danger-zone header span{color:#c95d6b!important}
    .cf-datatable-toolbar{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;margin-bottom:8px!important}
    .cf-datatable-toolbar label{display:flex!important;align-items:center!important;gap:5px!important;color:#777a89!important;font-size:8px!important}
    .cf-datatable-toolbar select{width:auto!important;min-width:62px!important;height:28px!important}
    .cf-datatable-toolbar input{width:190px!important;height:28px!important}
    .cf-datatable-footer{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;margin-top:8px!important;color:#9698a6!important;font-size:7.5px!important}
    .cf-datatable-footer>div{display:flex!important;gap:4px!important}
    .cf-auth-overview{align-items:start!important}
    @media(max-width:850px){.cf-plan-row,.cf-app-grid{grid-template-columns:1fr}.cf-datatable-toolbar,.cf-datatable-footer{align-items:stretch!important;flex-direction:column!important}.cf-datatable-toolbar input{width:100%!important}}

  `]
})
export class AdminCrossfitExtrasComponent implements OnChanges {
  @Input() section = 'tables';

  trainers:any[] = [];
  members:any[] = [];
  invoices:any[] = [];
  expenses:any[] = [];
  salaries:any[] = [];
  memberSearch = '';
  selectedMemberId = 0;
  selectedInvoiceId = 0;
  savingMember = false;
  savingInvoice = false;
  memberMessage = '';
  invoiceMessage = '';
  newMember:any = {dni:'',nombres:'',apellidos:'',telefono:'',correo:'',direccion:'',estado:'Activo'};
  editMember:any = {dni:'',nombres:'',apellidos:'',telefono:'',correo:'',direccion:'',estado:'Activo'};
  newMemberFullName = '';
  editMemberFullName = '';
  memberUi:any = {gender:'Male',dob:'',plan:'Basic',goal:'General Fitness',notes:''};
  invoiceForm:any = {titulo:'',subtitulo:'',fecha:new Date().toISOString().slice(0,10),monto:0,estado:'Emitida',imagen_url:null,datos:{}};
  invoiceUi:any = {email:'',phone:'',address:'',invoiceNumber:'',currency:'PEN',dueDate:'',paymentTerms:'Due in 4 days',taxId:'',notes:''};
  invoiceItems:any[] = [
    {service:'Monthly Membership',description:'Full gym access',qty:1,unitPrice:70,tax:5},
    {service:'Personal Training',description:'5 sessions (strength & conditioning)',qty:5,unitPrice:15,tax:5},
    {service:'Group Classes',description:'Weekly batch',qty:4,unitPrice:10,tax:5}
  ];
  invoiceDiscount = 10;
  expenseForm:any = {titulo:'',subtitulo:'',fecha:new Date().toISOString().slice(0,10),monto:0,estado:'Registrado',imagen_url:null,datos:{}};
  expenseMessage = '';
  savingExpense = false;
  expenseEditor = false;
  selectedPayslipId = 0;
  authMessage = '';
  forgotEmail = '';
  resetForm:any = {password:'',confirm:''};

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
    'sports-components':{title:'Sports Components',subtitle:'Widgets deportivos, progreso, rutinas, nutrición y actividad física.',icon:'🏋',group:'Sports Components'},
    'trainer-profile':{title:'Trainer Profile',subtitle:'Perfil profesional del entrenador principal de Mallqui Gym.',icon:'♙',group:'Trainer'},
    'members-list':{title:'Members List',subtitle:'Registered gym members.',icon:'♚',group:'Members'},
    'members-cards':{title:'Members',subtitle:'Member cards and profiles.',icon:'▦',group:'Members'},
    'add-member':{title:'Add Member',subtitle:'Register a new gym member.',icon:'＋',group:'Members'},
    'edit-member':{title:'Edit Member',subtitle:'Update member information.',icon:'✎',group:'Members'},
    'edit-member-details':{title:'Edit Member Details',subtitle:'Edición completa de los datos del socio seleccionado.',icon:'✎',group:'Members'},
    'invoices-list':{title:'Invoices List',subtitle:'All generated member invoices.',icon:'▤',group:'Invoices'},
    'invoice-details':{title:'Invoice Details',subtitle:'Invoice billing details.',icon:'▤',group:'Invoices'},
    'add-invoice':{title:'Add Invoice',subtitle:'Create a new gym invoice.',icon:'＋',group:'Invoices'},
    'create-invoice':{title:'Create Invoice',subtitle:'Creación de una nueva factura del gimnasio.',icon:'＋',group:'Invoices'},
    'edit-invoice':{title:'Edit Invoice',subtitle:'Update an existing invoice.',icon:'✎',group:'Invoices'},
    'expenses':{title:'Expenses',subtitle:'Registro y control de gastos reales del gimnasio.',icon:'S/',group:'Payments'},
    'payslip':{title:'Payslip',subtitle:'Boleta de pago generada desde los registros salariales.',icon:'▤',group:'Salaries'},
    'tables':{title:'Tables',subtitle:'Responsive Bootstrap tables.',icon:'▤',group:'Tables'},
    'data-tables':{title:'Data Tables',subtitle:'Searchable and filterable data tables.',icon:'▦',group:'Tables'},
    'graphs':{title:'Graphs',subtitle:'Charts and performance trends.',icon:'↗',group:'Graphs'},
    'apex':{title:'Apex',subtitle:'Apex chart examples.',icon:'⌁',group:'Graphs'},
    'morris':{title:'Morris',subtitle:'Morris chart examples.',icon:'⌘',group:'Graphs'},
    'vector-maps':{title:'Vector Maps',subtitle:'Vista de ubicación y cobertura.',icon:'◎',group:'Maps'},
    'accordions':{title:'Accordions',subtitle:'Contenido expandible y organizado.',icon:'☷',group:'Jquery Components'},
    'carousel':{title:'Carousel',subtitle:'Contenido destacado deslizable.',icon:'↔',group:'Jquery Components'},
    'modals':{title:'Modals',subtitle:'Ventanas modales para acciones y formularios.',icon:'▣',group:'Jquery Components'},
    'popovers':{title:'Popovers',subtitle:'Información contextual sobre acciones.',icon:'◇',group:'Jquery Components'},
    'tabs-ui':{title:'Tabs',subtitle:'Navegación interna por pestañas.',icon:'▥',group:'Jquery Components'},
    'tooltips':{title:'Tooltips',subtitle:'Ayudas breves sobre controles.',icon:'?',group:'Jquery Components'},
    'forms':{title:'Forms',subtitle:'Bootstrap form examples.',icon:'☷',group:'Forms'},
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
    'account-settings':{title:'Account Settings',subtitle:'Profile, notifications, billing and security.',icon:'⚙',group:'Account'},
    'my-profile':{title:'My Profile',subtitle:'Administrator profile information.',icon:'♙',group:'Account'},
    'contact':{title:'Contact',subtitle:'Formulario y datos de contacto.',icon:'☎',group:'Pages'},
    'typography':{title:'Typography',subtitle:'Jerarquía visual de textos.',icon:'T',group:'Foundation'},
    'login-signup':{title:'Login / Signup',subtitle:'Vistas de autenticación.',icon:'↪',group:'Pages'},
    'login-page':{title:'Login',subtitle:'Pantalla de inicio de sesión de la plantilla.',icon:'↪',group:'Login/Signup'},
    'signup-page':{title:'Signup',subtitle:'Pantalla de registro de usuario.',icon:'＋',group:'Login/Signup'},
    'forgot-password':{title:'Forgot Password',subtitle:'Pantalla de recuperación de contraseña.',icon:'?',group:'Login/Signup'},
    'reset-password-page':{title:'Reset Password',subtitle:'Pantalla de restablecimiento de contraseña.',icon:'⚙',group:'Login/Signup'},
    'page-not-found':{title:'Page Not Found',subtitle:'Página de error 404.',icon:'404',group:'Pages'},
    'maintenance':{title:'Maintenance',subtitle:'Pantalla de mantenimiento.',icon:'⚙',group:'Pages'},
    'menu-level':{title:'Menu Level',subtitle:'Ejemplo de navegación multinivel.',icon:'☷',group:'Navigation'},
    'menu-level-1':{title:'Level One Link',subtitle:'Primer nivel de navegación.',icon:'☷',group:'Menu Level'},
    'menu-level-2':{title:'Level Two Link',subtitle:'Segundo nivel de navegación.',icon:'☷',group:'Menu Level'},
    'menu-level-3':{title:'Level Three Link',subtitle:'Tercer nivel de navegación.',icon:'☷',group:'Menu Level'},
    'external-link':{title:'External Link',subtitle:'Acceso a recursos externos.',icon:'↗',group:'Navigation'},
    'chip':{title:'Chip 6',subtitle:'Chips de información y filtros.',icon:'#',group:'Components'},
    'badge-link':{title:'Badge Chip',subtitle:'Badges y contadores visuales.',icon:'●',group:'Components'},
    'disabled-link':{title:'Disabled Link',subtitle:'Estado deshabilitado de navegación.',icon:'⊘',group:'Navigation'}
  };

  constructor(private api: AdminApiService) {}

  ngOnChanges():void {
    this.authMessage='';
    if(this.section==='trainer-profile') this.loadTrainers();
    if(['members-list','members-cards','add-member','edit-member','edit-member-details'].includes(this.section)) this.loadMembers();
    if(['invoices-list','invoice-details','add-invoice','create-invoice','edit-invoice'].includes(this.section)) this.loadInvoices();
    if(this.section==='expenses') this.loadExpenses();
    if(this.section==='payslip') this.loadSalaries();
  }

  loadTrainers(){ this.api.entrenadores().subscribe({next:r=>this.trainers=Array.isArray(r)?r:[],error:()=>this.trainers=[]}); }
  loadMembers(){ this.api.clientes().subscribe({next:r=>this.members=Array.isArray(r)?r:[],error:()=>this.members=[]}); }
  get filteredMembers():any[] {
    const q=this.memberSearch.trim().toLowerCase();
    return this.members.filter(m=>!q||[m.dni,m.nombres,m.apellidos,m.correo,m.telefono].filter(Boolean).join(' ').toLowerCase().includes(q));
  }
  saveMember(){
    this.applyFullName(this.newMemberFullName,this.newMember);
    if(!this.newMember.dni||!this.newMember.nombres||!this.newMember.apellidos){this.memberMessage='Complete Full Name and DNI.';return;}
    this.savingMember=true; this.memberMessage='';
    this.api.crearCliente({...this.newMember}).subscribe({
      next:()=>{this.savingMember=false;this.memberMessage='✓ Member saved successfully.';this.newMember={dni:'',nombres:'',apellidos:'',telefono:'',correo:'',direccion:'',estado:'Activo'};this.newMemberFullName='';this.loadMembers();},
      error:e=>{this.savingMember=false;this.memberMessage=e?.error?.message||'No se pudo registrar el socio.';}
    });
  }
  selectMember(id:number){
    const m=this.members.find(x=>Number(x.id_cliente)===Number(id));
    this.editMember=m?{dni:m.dni||'',nombres:m.nombres||'',apellidos:m.apellidos||'',telefono:m.telefono||'',correo:m.correo||'',direccion:m.direccion||'',estado:m.estado||'Activo'}:{dni:'',nombres:'',apellidos:'',telefono:'',correo:'',direccion:'',estado:'Activo'};
    this.editMemberFullName=m?[m.nombres,m.apellidos].filter(Boolean).join(' '):'';
  }
  updateMember(){
    if(!this.selectedMemberId)return;
    this.applyFullName(this.editMemberFullName,this.editMember);
    this.savingMember=true; this.memberMessage='';
    this.api.actualizarCliente(this.selectedMemberId,{...this.editMember}).subscribe({
      next:()=>{this.savingMember=false;this.memberMessage='✓ Socio actualizado correctamente.';this.loadMembers();},
      error:e=>{this.savingMember=false;this.memberMessage=e?.error?.message||'No se pudo actualizar el socio.';}
    });
  }

  resetNewMember(){
    this.newMember={dni:'',nombres:'',apellidos:'',telefono:'',correo:'',direccion:'',estado:'Activo'};
    this.newMemberFullName=''; this.memberUi={gender:'Male',dob:'',plan:'Basic',goal:'General Fitness',notes:''}; this.memberMessage='';
  }
  private applyFullName(full:string,target:any){
    const parts=String(full||'').trim().split(/\s+/).filter(Boolean);
    if(parts.length){ target.nombres=parts.shift()||''; target.apellidos=parts.join(' ')||target.nombres; }
  }

  get invoiceSubtotal():number { return this.invoiceItems.reduce((t:any,x:any)=>t+Number(x.qty||0)*Number(x.unitPrice||0),0); }
  get invoiceTax():number { return this.invoiceItems.reduce((t:any,x:any)=>t+(Number(x.qty||0)*Number(x.unitPrice||0)*Number(x.tax||0)/100),0); }
  get invoiceTotal():number { return Math.max(0,this.invoiceSubtotal-this.invoiceDiscount+this.invoiceTax); }
  addInvoiceItem(){ this.invoiceItems=[...this.invoiceItems,{service:'',description:'',qty:1,unitPrice:0,tax:5}]; }

  loadInvoices(){ this.api.gymRegistros('facturas').subscribe({next:r=>this.invoices=Array.isArray(r)?r:[],error:()=>this.invoices=[]}); }
  resetInvoice(){ this.invoiceForm={titulo:'',subtitulo:'',fecha:new Date().toISOString().slice(0,10),monto:0,estado:'Emitida',imagen_url:null,datos:{}}; }
  saveInvoice(){
    this.invoiceForm.monto=this.invoiceTotal;
    this.invoiceForm.subtitulo=this.invoiceItems.map(x=>x.service).filter(Boolean).join(', ');
    this.invoiceForm.datos={...(this.invoiceForm.datos||{}),...this.invoiceUi,items:this.invoiceItems,discount:this.invoiceDiscount};
    if(!String(this.invoiceForm.titulo||'').trim()){this.invoiceMessage='Complete the client name.';return;}
    this.savingInvoice=true; this.invoiceMessage='';
    this.api.crearGymRegistro('facturas',{...this.invoiceForm,titulo:String(this.invoiceForm.titulo).trim(),subtitulo:String(this.invoiceForm.subtitulo||'').trim()||null}).subscribe({
      next:()=>{this.savingInvoice=false;this.invoiceMessage='✓ Factura creada correctamente.';this.resetInvoice();this.loadInvoices();},
      error:e=>{this.savingInvoice=false;this.invoiceMessage=e?.error?.message||'No se pudo crear la factura.';}
    });
  }
  selectInvoice(id:number){
    const x=this.invoices.find(r=>Number(r.id)===Number(id));
    this.invoiceForm=x?{titulo:x.titulo||'',subtitulo:x.subtitulo||'',fecha:x.fecha||'',monto:Number(x.monto||0),estado:x.estado||'Emitida',imagen_url:x.imagen_url||null,datos:x.datos||{}}:{titulo:'',subtitulo:'',fecha:'',monto:0,estado:'Emitida',imagen_url:null,datos:{}};
    if(x?.datos){ this.invoiceUi={...this.invoiceUi,...x.datos}; if(Array.isArray(x.datos.items)&&x.datos.items.length)this.invoiceItems=x.datos.items; this.invoiceDiscount=Number(x.datos.discount??10); }
  }
  updateInvoice(){
    if(!this.selectedInvoiceId)return;
    this.savingInvoice=true; this.invoiceMessage='';
    this.api.actualizarGymRegistro('facturas',this.selectedInvoiceId,{...this.invoiceForm}).subscribe({
      next:()=>{this.savingInvoice=false;this.invoiceMessage='✓ Factura actualizada.';this.loadInvoices();},
      error:e=>{this.savingInvoice=false;this.invoiceMessage=e?.error?.message||'No se pudo actualizar la factura.';}
    });
  }

  loadExpenses(){ this.api.gymRegistros('gastos').subscribe({next:r=>this.expenses=Array.isArray(r)?r:[],error:()=>this.expenses=[]}); }
  saveExpense(){
    if(!String(this.expenseForm.titulo||'').trim() || Number(this.expenseForm.monto||0)<=0){this.expenseMessage='Completa la categoría y un monto mayor a 0.';return;}
    this.savingExpense=true; this.expenseMessage='';
    this.api.crearGymRegistro('gastos',{...this.expenseForm,titulo:String(this.expenseForm.titulo).trim(),subtitulo:String(this.expenseForm.subtitulo||'').trim()||null}).subscribe({
      next:()=>{this.savingExpense=false;this.expenseMessage='✓ Gasto registrado correctamente.';this.expenseForm={titulo:'',subtitulo:'',fecha:new Date().toISOString().slice(0,10),monto:0,estado:'Registrado',imagen_url:null,datos:{}};this.loadExpenses();},
      error:e=>{this.savingExpense=false;this.expenseMessage=e?.error?.message||'No se pudo registrar el gasto.';}
    });
  }
  loadSalaries(){ this.api.gymRegistros('salarios').subscribe({next:r=>this.salaries=Array.isArray(r)?r:[],error:()=>this.salaries=[]}); }
  printPayslip(){ window.print(); }
  goAdmin(){ window.location.assign('/admin'); }
  previewResetPassword(){
    if(!this.resetForm.password || this.resetForm.password.length<6){this.authMessage='La nueva contraseña debe tener al menos 6 caracteres.';return;}
    this.authMessage=this.resetForm.password===this.resetForm.confirm?'Contraseña validada correctamente.':'Las contraseñas no coinciden.';
  }

  get viewSection():string {
    const aliases:Record<string,string> = {
      'edit-member-details':'edit-member',
      'create-invoice':'add-invoice',
      'menu-level-1':'menu-level',
      'menu-level-2':'menu-level',
      'menu-level-3':'menu-level'
    };
    return aliases[this.section] || this.section;
  }
  get payslipBasic():number { return Number(this.selectedPayslip?.monto||0); }
  get payslipHousing():number { return this.payslipBasic*0.18; }
  get payslipBonus():number { return this.payslipBasic*0.08; }
  get payslipTax():number { return this.payslipBasic*0.07; }
  get payslipInsurance():number { return this.payslipBasic*0.03; }
  get payslipGross():number { return this.payslipBasic+this.payslipHousing+this.payslipBonus; }
  get payslipDeductions():number { return this.payslipTax+this.payslipInsurance; }
  get payslipNet():number { return Math.max(0,this.payslipGross-this.payslipDeductions); }

  get selectedPayslip():any {
    return this.salaries.find(x=>Number(x.id)===Number(this.selectedPayslipId)) || this.salaries[0] || null;
  }
  get expenseTotal():number { return this.expenses.reduce((t,x)=>t+Number(x.monto||0),0); }

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
  openExternal(){ window.open('https://www.templatemonster.com/admin-templates/crossfit-fitness-gym-admin-dashboard-template-569574.html','_blank','noopener,noreferrer'); }
}
