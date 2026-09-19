import { Component } from '@angular/core';
import { AdminIntegradoComponent } from '../admin/admin-integrado.component';

@Component({
  selector: 'app-asistencias',
  standalone: true,
  imports: [AdminIntegradoComponent],
  templateUrl: './asistencias.html',
  styleUrl: './asistencias.css'
})
export class Asistencias {}
