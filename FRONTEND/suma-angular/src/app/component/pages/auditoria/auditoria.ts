import { Component } from '@angular/core';
import { AdminIntegradoComponent } from '../admin/admin-integrado.component';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [AdminIntegradoComponent],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.css'
})
export class Auditoria {}
