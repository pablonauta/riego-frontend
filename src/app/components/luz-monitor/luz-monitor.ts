import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { LuzService, PuntoLuzDia } from '../../services/luz';

const zonaHoraria = 'America/Montevideo';
const formatoFecha = new Intl.DateTimeFormat('sv-SE', { timeZone: zonaHoraria });
const formatoHora = new Intl.DateTimeFormat('es-UY', {
  timeZone: zonaHoraria,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23'
});
const minutosPorDia = 24 * 60;
const intervaloMaximoMs = 3 * 60 * 1000;
const indiceMaximo = 1000;

type EstadoLuz =
  | { tipo: 'cargando' | 'error' }
  | { tipo: 'datos'; muestras: PuntoLuzDia[] };

@Component({
  selector: 'app-luz-monitor',
  templateUrl: './luz-monitor.html',
  styleUrl: './luz-monitor.css'
})
export class LuzMonitor {
  private readonly luz = inject(LuzService);

  readonly instalacionId = input.required<number>();
  readonly hoy = formatoFecha.format(new Date());
  readonly fecha = signal(this.hoy);
  readonly area = { x: 58, y: 16, ancho: 720, alto: 210 };
  readonly horas = [0, 6, 12, 18, 24];
  readonly niveles = [0, 250, 500, 750, 1000];

  private readonly consulta = computed(() => ({
    instalacionId: this.instalacionId(),
    fecha: this.fecha()
  }));

  readonly estado = toSignal(
    toObservable(this.consulta).pipe(
      switchMap(({ instalacionId, fecha }) => this.luz.getDia(instalacionId, fecha).pipe(
        map((muestras): EstadoLuz => ({ tipo: 'datos', muestras })),
        catchError(() => of<EstadoLuz>({ tipo: 'error' })),
        startWith<EstadoLuz>({ tipo: 'cargando' })
      ))
    ),
    { initialValue: { tipo: 'cargando' } as EstadoLuz }
  );

  readonly grafica = computed(() => {
    const estado = this.estado();
    if (estado.tipo !== 'datos') return null;

    const puntos = estado.muestras
      .map(({ ts, indice }) => ({ instante: Date.parse(ts), indice }))
      .filter(({ instante, indice }) =>
        Number.isFinite(instante) && Number.isFinite(indice) &&
        indice >= 0 && indice <= indiceMaximo
      )
      .sort((a, b) => a.instante - b.instante);

    const ultima = puntos.at(-1);
    if (!ultima) return null;

    const comandos = puntos.flatMap(({ instante, indice }, i) => {
      const [hora, minuto, segundo] = formatoHora.format(instante).split(':').map(Number);
      const x = this.xParaMinuto(hora * 60 + minuto + segundo / 60);
      const y = this.yParaIndice(indice);
      const punto = `${x.toFixed(2)},${y.toFixed(2)}`;
      const anterior = puntos[i - 1];

      // Cada tramo arranca con un punto visible, aunque tenga una sola muestra.
      return !anterior || instante - anterior.instante > intervaloMaximoMs
        ? [`M${punto}`, `L${punto}`]
        : [`L${punto}`];
    });

    return {
      trazado: comandos.join(' '),
      ultima: ultima.indice,
      horaUltima: formatoHora.format(ultima.instante).slice(0, 5),
      minimo: Math.min(...puntos.map(p => p.indice)),
      maximo: Math.max(...puntos.map(p => p.indice))
    };
  });

  xParaMinuto(minuto: number): number {
    return this.area.x + minuto / minutosPorDia * this.area.ancho;
  }

  yParaIndice(indice: number): number {
    return this.area.y + (1 - indice / indiceMaximo) * this.area.alto;
  }

  cambiarFecha(fecha: string): void {
    if (fecha && fecha <= this.hoy) this.fecha.set(fecha);
  }
}
