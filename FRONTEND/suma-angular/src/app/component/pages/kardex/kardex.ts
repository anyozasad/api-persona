import { Component } from '@angular/core';
import { AdminIntegradoComponent } from '../admin/admin-integrado.component';

@Component({
  selector: 'app-kardex',
  standalone: true,
  imports: [AdminIntegradoComponent],
  templateUrl: './kardex.html',
  styleUrl: './kardex.css'
})
export class Kardex {}
