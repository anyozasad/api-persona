import { Component } from '@angular/core';
import { AdminIntegradoComponent } from '../admin/admin-integrado.component';

@Component({
  selector: 'app-clases',
  standalone: true,
  imports: [AdminIntegradoComponent],
  templateUrl: './clases.html',
  styleUrl: './clases.css'
})
export class Clases {}
