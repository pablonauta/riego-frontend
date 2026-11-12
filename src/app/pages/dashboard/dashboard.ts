
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';


import { AuthService } from '../../services/auth.service';
import { LogoutComponent } from '../../components/logout/logout';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    LogoutComponent
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard {

  private authService = inject(AuthService);

  get email(): string {
    return this.authService.getUsuarioActual()?.name ?? '';
  }

  get esAdmin(): boolean {
    const usuario = this.authService.getUsuarioActual();

    return usuario?.authorities?.includes('ROLE_ADMIN') ?? false;
  }
}
