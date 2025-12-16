import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verificacion-pendiente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './verificacion-pendiente.html',
  styleUrls: ['./verificacion-pendiente.css']
})
export class VerificacionPendienteComponent {

  loading = signal(false);
  mensaje = signal<string | null>(null);
  error = signal<string | null>(null);

  // email que vamos a usar para reenviar
  email = signal<string>('');

  constructor(private authService: AuthService) {
    // si querés, podés recuperar el email guardado al fallar login
    const guardado = localStorage.getItem('email-pendiente');
    if (guardado) this.email.set(guardado);
  }

  reenviarEmail() {
    if (!this.email()) {
      this.error.set('Ingresá tu email.');
      return;
    }

    this.loading.set(true);
    this.mensaje.set(null);
    this.error.set(null);

    this.authService.reenviarVerificacionEmail(this.email()).subscribe({
      next: (resp: any) => {
        this.mensaje.set(resp?.message ?? 'Email reenviado correctamente.');
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo reenviar el email.');
        this.loading.set(false);
      }
    });
  }
}
