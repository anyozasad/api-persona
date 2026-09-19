import { Component } from '@angular/core';
import { AdminIntegradoComponent } from '../admin/admin-integrado.component';

@Component({
  selector: 'app-entrenadores',
  standalone: true,
  imports: [AdminIntegradoComponent],
  templateUrl: './entrenadores.html',
  styleUrl: './entrenadores.css'
})
export class Entrenadores {}
