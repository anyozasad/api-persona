import { Component } from '@angular/core';
import { AdminIntegradoComponent } from '../admin/admin-integrado.component';

@Component({
  selector: 'app-membresias',
  standalone: true,
  imports: [AdminIntegradoComponent],
  templateUrl: './membresias.html',
  styleUrl: './membresias.css'
})
export class Membresias {}
