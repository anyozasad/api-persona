import { Component } from '@angular/core';
import { AdminIntegradoComponent } from '../admin/admin-integrado.component';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [AdminIntegradoComponent],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css'
})
export class Categorias {}
