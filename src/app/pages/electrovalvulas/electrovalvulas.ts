import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { ElectrovalvulaResumen, ValvulaService } from '../../services/valvula';

@Component({
  selector: 'app-electrovalvulas',
  imports: [RouterLink],
  templateUrl: './electrovalvulas.html',
  styleUrl: './electrovalvulas.css',
})
export class Electrovalvulas {
  private readonly valvulaService = inject(ValvulaService);
  private readonly authService = inject(AuthService);
  private readonly destruir = inject(DestroyRef);

  readonly esAdmin =
    this.authService.getUsuarioActual()?.authorities?.includes('ROLE_ADMIN') ?? false;

  readonly electrovalvulas = signal<ElectrovalvulaResumen[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');

  readonly mostrarAlta = signal(false);
  readonly guardando = signal(false);
  readonly errorAlta = signal('');

  constructor() {
    this.valvulaService.listar(1).pipe(takeUntilDestroyed(this.destruir)).subscribe({
      next: lista => {
        this.electrovalvulas.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de electroválvulas.');
        this.cargando.set(false);
      },
    });
  }

  guardarElectrovalvula(nombre: string, habilitada: boolean): void {
    if (!this.esAdmin || this.guardando()) return;

    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      this.errorAlta.set('Ingresá un nombre.');
      return;
    }

    this.errorAlta.set('');
    this.guardando.set(true);

    this.valvulaService.crear(1, nombreLimpio, habilitada)
      .pipe(takeUntilDestroyed(this.destruir))
      .subscribe({
        next: valvula => {
          this.electrovalvulas.set([valvula]);
          this.mostrarAlta.set(false);
          this.guardando.set(false);
        },
        error: respuesta => {
          this.guardando.set(false);

          if (respuesta.status === 409) {
            this.errorAlta.set('La instalación ya tiene una electroválvula. Recargá la página.');
          } else if (respuesta.status === 404) {
            this.errorAlta.set('Verificá que exista la instalación 1 y que Spring tenga el endpoint de alta.');
          } else {
            this.errorAlta.set('No se pudo guardar la electroválvula.');
          }
        },
      });
  }
}
