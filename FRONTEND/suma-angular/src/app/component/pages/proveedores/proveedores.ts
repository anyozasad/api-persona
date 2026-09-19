import { Component } from '@angular/core';
import { AdminIntegradoComponent } from '../admin/admin-integrado.component';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [AdminIntegradoComponent],
  templateUrl: './proveedores.html',
  styleUrl: './proveedores.css'
})
export class Proveedores {}
