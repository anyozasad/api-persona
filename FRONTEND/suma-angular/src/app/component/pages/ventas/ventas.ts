import { Component } from '@angular/core';
import { AdminIntegradoComponent } from '../admin/admin-integrado.component';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [AdminIntegradoComponent],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css'
})
export class Ventas {}
