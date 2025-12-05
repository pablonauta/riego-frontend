// src/app/guards/auth-guard.ts
import { Injectable } from '@angular/core';
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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {

    const token = this.authService.getToken();
    const user  = this.authService.getUsuarioActual();

    // Sin token → al login
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    // Más adelante, si querés usar emailVerificado:
    if (user && user.emailVerificado === false) {
      this.router.navigate(['/verificacion-pendiente']);
      return false;
    }

    return true;
  }
}
