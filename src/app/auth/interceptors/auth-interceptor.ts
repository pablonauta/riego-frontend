import { inject } from '@angular/core';
import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';

import { AuthService } from '../../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): any => {

   const publicPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/resend-verification'
  ];

  if (publicPaths.some(p => req.url.includes(p))) {
    return next(req);
  }

  const authService = inject(AuthService);
  const token = authService.getToken();

  // Si no hay token, sigue sin tocar nada
  if (!token) {
    return next(req);
  }

  // Clonamos la request y agregamos Authorization
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};
