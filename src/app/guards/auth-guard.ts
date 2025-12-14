// src/app/guards/auth-guard.ts
import { Injectable, computed } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  // ✅ Computed reactivo basado en signal del AuthService
  private isAuthenticated = computed(() => {
    return !!this.authService.getToken();
  });

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {

    // ✅ Sin autenticación → login
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    const user = this.authService.getUsuarioActual();

    // ✅ Si el usuario existe pero no verificó email
    if (user && user.emailVerificado === false) {
      this.router.navigate(['/verificacion-pendiente']);
      return false;
    }

    return true;
  }
}
