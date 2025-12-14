import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logout.html',
  styleUrls: ['./logout.css']
})
export class LogoutComponent {

  // ✅ ESTADO MODERNO
  cargando = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  cerrarSesion() {
    this.cargando.set(true);

    // ✅ Limpia el token + usuario (desde AuthService)
    this.authService.logout();

    this.cargando.set(false);
    this.router.navigate(['/login']);
  }
}
