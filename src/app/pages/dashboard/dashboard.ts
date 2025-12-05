// src/app/pages/dashboard/dashboard.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard {

  private authService = inject(AuthService);

  nombreUsuario: string | null = null;
  email: string | null = null;
  emailVerificado: boolean | null = null;

  constructor() {
    const user = this.authService.getUsuarioActual();

    this.nombreUsuario   = user?.nombre ?? null;
    this.email           = user?.email ?? null;
    this.emailVerificado = user?.emailVerificado ?? null;
  }
}
