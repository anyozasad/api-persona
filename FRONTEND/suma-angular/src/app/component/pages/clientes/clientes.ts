import { Component } from '@angular/core';
import { AdminIntegradoComponent } from '../admin/admin-integrado.component';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [AdminIntegradoComponent],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css'
})
export class Clientes {}
