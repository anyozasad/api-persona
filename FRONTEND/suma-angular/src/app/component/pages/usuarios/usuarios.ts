import { Component } from '@angular/core';
import { AdminIntegradoComponent } from '../admin/admin-integrado.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [AdminIntegradoComponent],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class Usuarios {}
