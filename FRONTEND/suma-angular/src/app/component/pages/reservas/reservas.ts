import { Component } from '@angular/core';
import { AdminIntegradoComponent } from '../admin/admin-integrado.component';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [AdminIntegradoComponent],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css'
})
export class Reservas {}
