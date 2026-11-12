
import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-autorizacion-pendiente',
  standalone: true,
  templateUrl: './autorizacion-pendiente.html',
  styleUrls: ['./autorizacion-pendiente.css']
})
export class AutorizacionPendiente implements OnInit {

  estado = signal('PENDIENTE');
  email = signal('');
  consultando = signal(false);
  error = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.consultarEstado();
  }

  consultarEstado(): void {
    this.consultando.set(true);
    this.error.set('');

    this.authService.me().subscribe({
      next: usuario => {
        this.consultando.set(false);
        this.estado.set(usuario.estadoAutorizacion);
        this.email.set(usuario.name);

        if (usuario.estadoAutorizacion === 'APROBADO') {
          this.router.navigate(['/dashboard'], {
            replaceUrl: true
          });
        }
      },
      error: () => {
        this.consultando.set(false);
        this.error.set('No se pudo consultar el estado de tu cuenta.');
      }
    });
  }

  salir(): void {
    this.authService.logout();
  }
}
