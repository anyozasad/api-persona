import { Component } from '@angular/core';
import { AdminIntegradoComponent } from '../admin/admin-integrado.component';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [AdminIntegradoComponent],
  templateUrl: './compras.html',
  styleUrl: './compras.css'
})
export class Compras {}
