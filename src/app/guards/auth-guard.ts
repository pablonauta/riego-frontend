
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot
} from '@angular/router';

import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

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
  ): Observable<boolean> | boolean {

    if (!this.authService.estaAutenticado()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Los usuarios autenticados pueden consultar su estado.
    if (state.url.startsWith('/autorizacion-pendiente')) {
      return true;
    }

    return this.authService.me().pipe(
      map(usuario => {

        // Primero comprobamos la aprobación.
        if (usuario.estadoAutorizacion !== 'APROBADO') {
          this.router.navigate(['/autorizacion-pendiente']);
          return false;
        }

        // Después comprobamos los roles exigidos por la ruta.
        const rolesRequeridos =
          route.data['roles'] as string[] | undefined;

        if (rolesRequeridos?.length) {
          const autorizado = rolesRequeridos.some(
            rol => usuario.authorities?.includes(rol)
          );

          if (!autorizado) {
            this.router.navigate(['/dashboard']);
            return false;
          }
        }

        return true;
      }),

      catchError(() => {
        this.authService.logout();
        return of(false);
      })
    );
  }
}
