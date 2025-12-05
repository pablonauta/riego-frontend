// src/app/services/auth.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { LoginRequest, AuthResponse } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl;

  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY  = 'usuario';

  constructor() {}

  // ============================
  // LOGIN
  // ============================
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, data)
      .pipe(
        tap((resp) => {
          this.guardarSesion(resp);
        })
      );
  }

  guardarSesion(resp: AuthResponse): void {
    // Guardar token siempre
    localStorage.setItem(this.TOKEN_KEY, resp.token);

    // Armar un objeto usuario resumido con lo que venga
    const usuario = {
      nombre:          resp.nombre ?? null,
      email:           resp.email ?? null,
      emailVerificado: resp.emailVerificado ?? null
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(usuario));
  }

  // ============================
  // TOKEN
  // ============================
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  estaLogueado(): boolean {
    return !!this.getToken();
  }

  // ============================
  // USUARIO
  // ============================
  getUsuarioActual(): { nombre: string | null; email: string | null; emailVerificado: boolean | null } | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}
