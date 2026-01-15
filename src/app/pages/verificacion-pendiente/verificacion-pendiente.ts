import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './verificacion-pendiente.html',
  styleUrls: ['./verificacion-pendiente.css']
})
export class VerificacionPendienteComponent {
  email = signal(localStorage.getItem('pendingVerificationEmail') ?? '');
  loading = signal(false);
  mensaje = signal('');
  error = signal('');

  constructor(private http: HttpClient) {}

  reenviarEmail() {
    this.mensaje.set('');
    this.error.set('');

    const emailValue = this.email().trim();
    if (!emailValue) {
      this.error.set('Ingresá tu email para reenviar la verificación.');
      return;
    }

    this.loading.set(true);

    this.http.post<{ message: string }>('/api/auth/resend-verification', { email: emailValue })
      .subscribe({
        next: (r) => {
          this.mensaje.set(r.message || 'Te reenviamos el email de verificación.');
          localStorage.setItem('pendingVerificationEmail', emailValue);
          this.loading.set(false);
        },
        error: (e) => {
          this.error.set(e?.error?.message || 'No se pudo reenviar. Probá más tarde.');
          this.loading.set(false);
        }
      });
  }
}
