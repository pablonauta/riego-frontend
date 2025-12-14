import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment'; // <-- tu ruta que ya te funcionó

@Injectable({ providedIn: 'root' })
export class AuthService {

  // Si apiUrl está vacío (dev): usa proxy con /api
  // Si apiUrl tiene dominio (prod): pega directo al backend
  private apiBase = environment.apiUrl
    ? `${environment.apiUrl}/api`
    : '/api';

  constructor(private http: HttpClient, private router: Router) {}

  login(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiBase}/auth/login`, payload);
  }

  register(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiBase}/auth/register`, payload);
  }

  solicitarRecuperacion(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiBase}/auth/forgot-password`, { email });
  }

  resetPassword(payload: { token: string; password: string; password_confirmation: string; }): Observable<any> {
    return this.http.post<any>(`${this.apiBase}/auth/reset-password`, payload);
  }

  // ---------- MANEJO DE SESIÓN (LOCALSTORAGE) ----------

  guardarSesion(token: string, usuario: any): void {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsuarioActual(): any | null {
    const raw = localStorage.getItem('usuario');
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  // ---------- HELPERS ÚTILES ----------

  estaAutenticado(): boolean {
    return !!this.getToken();
  }
}
