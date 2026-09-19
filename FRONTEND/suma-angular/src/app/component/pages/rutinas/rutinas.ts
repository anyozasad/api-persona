import { Component } from '@angular/core';
import { AdminIntegradoComponent } from '../admin/admin-integrado.component';

@Component({
  selector: 'app-rutinas',
  standalone: true,
  imports: [AdminIntegradoComponent],
  templateUrl: './rutinas.html',
  styleUrl: './rutinas.css'
})
export class Rutinas {}
