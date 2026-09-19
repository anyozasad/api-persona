import { Component } from '@angular/core';
import { AdminIntegradoComponent } from '../admin/admin-integrado.component';

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [AdminIntegradoComponent],
  templateUrl: './caja.html',
  styleUrl: './caja.css'
})
export class Caja {}
