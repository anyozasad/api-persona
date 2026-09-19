import { Component } from '@angular/core';
import { AdminIntegradoComponent } from '../admin/admin-integrado.component';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [AdminIntegradoComponent],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css'
})
export class Pagos {}
