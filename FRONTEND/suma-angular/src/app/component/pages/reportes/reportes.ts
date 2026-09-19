import { Component } from '@angular/core';
import { AdminIntegradoComponent } from '../admin/admin-integrado.component';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [AdminIntegradoComponent],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class Reportes {}
