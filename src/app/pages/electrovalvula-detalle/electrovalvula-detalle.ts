import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { catchError, finalize, map, of, startWith, Subject, switchMap } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { ValvulaService } from '../../services/valvula';
import type {
  AccionValvula,
  HistorialElectrovalvulaPagina,
  ResultadoEvento,
} from '../../services/valvula';

interface ConsultaHistorial {
  pagina: number;
  resultado?: ResultadoEvento;
}

@Component({
  selector: 'app-electrovalvula-detalle',
  imports: [DatePipe],
  templateUrl: './electrovalvula-detalle.html',
  styleUrl: './electrovalvula-detalle.css',
})
export class ElectrovalvulaDetalle {
  private readonly ruta = inject(ActivatedRoute);
  private readonly valvulaService = inject(ValvulaService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly consultas = new Subject<ConsultaHistorial>();

  readonly historial = signal<HistorialElectrovalvulaPagina | null>(null);
  readonly filtro = signal<ResultadoEvento | undefined>(undefined);
  readonly cargando = signal(true);
  readonly error = signal('');

  readonly ordenPendiente = signal<AccionValvula | null>(null);
  readonly mensajeOrden = signal('');

  get puedeOperar(): boolean {
    const roles: string[] = this.authService.getUsuarioActual()?.authorities ?? [];
    return roles.includes('ROLE_ADMIN') || roles.includes('ROLE_OPERADOR');
  }

  constructor() {
    this.ruta.paramMap.pipe(
      switchMap(parametros => {
        const id = Number(parametros.get('id'));

        if (!Number.isSafeInteger(id) || id <= 0) {
          return of({ historial: null, error: 'El ID de la electroválvula no es válido.' });
        }

        const primeraPagina: ConsultaHistorial = { pagina: 0 };

        return this.consultas.pipe(
          startWith(primeraPagina),
          switchMap(({ pagina, resultado }) => {
            this.filtro.set(resultado);
            this.cargando.set(true);
            this.error.set('');

            return this.valvulaService.consultarHistorial(1, id, pagina, resultado).pipe(
              map(historial => ({ historial, error: '' })),
              catchError(() => of({
                historial: null,
                error: 'No se pudo cargar el historial de la electroválvula.',
              })),
            );
          }),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(({ historial, error }) => {
      this.historial.set(historial);
      this.error.set(error);
      this.cargando.set(false);
    });
  }

  cambiarFiltro(resultado?: ResultadoEvento): void {
    this.consultas.next({ pagina: 0, resultado });
  }

  irAPagina(pagina: number): void {
    const historial = this.historial();

    if (this.cargando() || !historial || pagina < 0 || pagina >= historial.totalPaginas) {
      return;
    }

    this.consultas.next({ pagina, resultado: this.filtro() });
  }

  operarValvula(accion: AccionValvula): void {
    if (!this.puedeOperar || this.ordenPendiente()) return;

    const id = Number(this.ruta.snapshot.paramMap.get('id'));

    this.ordenPendiente.set(accion);
    this.mensajeOrden.set('');

    this.valvulaService.listar(1).pipe(
      switchMap(lista => {
        const valvula = lista.find(item => item.id === id);

        if (!valvula) {
          throw new Error('La electroválvula no está registrada en la instalación 1.');
        }

        if (accion === 'ABRIR' && !valvula.habilitada) {
          throw new Error('La electroválvula está deshabilitada. Podés solicitar el cierre.');
        }

        return this.valvulaService.operar(accion);
      }),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.ordenPendiente.set(null)),
    ).subscribe({
      next: respuesta => {
        const resultado = respuesta.resultado === 'CONFIRMADO'
          ? 'Orden confirmada'
          : 'Orden sin confirmar';
        const estado = respuesta.estado === 'DESCONOCIDA'
          ? 'desconocido'
          : respuesta.estado.toLowerCase();

        this.mensajeOrden.set(
          `${resultado}. Estado informado: ${estado}. Evento ${respuesta.eventoId}.`,
        );
        this.consultas.next({ pagina: 0, resultado: this.filtro() });
      },
      error: (error: unknown) => {
        if (error instanceof HttpErrorResponse) {
          this.mensajeOrden.set(error.status === 404
            ? 'El control de la válvula no está disponible en este servidor.'
            : 'No se pudo obtener el resultado de la orden.');
        } else {
          this.mensajeOrden.set(error instanceof Error
            ? error.message
            : 'No se pudo enviar la orden.');
        }
      },
    });
  }
}
