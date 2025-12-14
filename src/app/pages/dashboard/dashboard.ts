// src/app/pages/dashboard/dashboard.ts
import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

// Componente de logout
import { LogoutComponent } from '../../components/logout/logout';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    LogoutComponent
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard {

  private authService = inject(AuthService);

  // ✅ Signals derivados del AuthService
  usuario = computed(() => this.authService.getUsuarioActual());

  nombreUsuario = computed(() => this.usuario()?.nombre ?? null);
  email = computed(() => this.usuario()?.email ?? null);
  emailVerificado = computed(() => this.usuario()?.emailVerificado ?? null);
}
