import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

// 👇 Tipo común para respuestas simples del backend
type ApiMessageResponse = {
  message?: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiBase = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  // ---------- AUTH ----------

  login(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiBase}/auth/login`, payload);
  }

  register(payload: any): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(
      `${this.apiBase}/auth/register`,
      payload
    );
  }

  solicitarRecuperacion(email: string): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(
      `${this.apiBase}/auth/forgot-password`,
      { email }
    );
  }

  resetPassword(payload: any): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(
      `${this.apiBase}/auth/reset-password`,
      payload
    );
  }

  // ---------- MANEJO DE SESIÓN ----------

 guardarSesion(token: string, usuario?: any | null): void {
  localStorage.setItem('token', token);

  if (usuario) localStorage.setItem('usuario', JSON.stringify(usuario));
  else localStorage.removeItem('usuario');
}

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsuarioActual(): any | null {
    const raw = localStorage.getItem('usuario');
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  reenviarVerificacionEmail(email: string) {
    return this.http.post(
     `${this.apiBase}/auth/resend-verification`,
    { email }
  );
}

  logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  this.router.navigate(['/login'], { replaceUrl: true });
}

 estaAutenticado(): boolean {
  return !!localStorage.getItem('token');
}

 me() {
  return this.http.get<{
    name: string;
    principalClass: string;
    authorities: string[];
  }>('/api/auth/me');
}
}
