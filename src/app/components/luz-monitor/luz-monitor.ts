import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { DIA_MS, FotoperiodoDia, LuzService } from '../../services/luz';

const calendarioLocal = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Montevideo' });
const formatoFecha = new Intl.DateTimeFormat('es-UY', {
  day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC',
});
const formatoEje = new Intl.DateTimeFormat('es-UY', {
  day: '2-digit', month: '2-digit', timeZone: 'UTC',
});
const formatoHoras = new Intl.NumberFormat('es-UY', { maximumFractionDigits: 2 });

type Periodo = { desde: string; hasta: string };
type Estado =
  | { tipo: 'cargando' | 'error' }
  | { tipo: 'datos'; periodo: Periodo; dias: FotoperiodoDia[] };

function diaIso(instante: number): string {
  return new Date(instante).toISOString().slice(0, 10);
}

@Component({
  selector: 'app-luz-monitor',
  templateUrl: './luz-monitor.html',
  styleUrl: './luz-monitor.css',
})
export class LuzMonitor {
  private readonly luz = inject(LuzService);
  readonly instalacionId = input.required<number>();
  readonly hoy = calendarioLocal.format(new Date());
  readonly desde = diaIso(Date.parse(this.hoy) - 30 * DIA_MS);
  readonly hasta = diaIso(Date.parse(this.hoy) - DIA_MS);
  readonly errorPeriodo = signal('');
  readonly diaSeleccionado = signal<number | null>(null);
  readonly vista = { ancho: 820, alto: 265 };
  readonly area = { x: 58, y: 16, ancho: 702, alto: 210 };
  readonly niveles = [0, 6, 12, 18, 24];
  readonly formatoFecha = formatoFecha;
  readonly formatoHoras = formatoHoras;

  private readonly periodo = signal<Periodo>({ desde: this.desde, hasta: this.hasta });
  private readonly consulta = computed(() => ({
    instalacionId: this.instalacionId(),
    periodo: this.periodo(),
  }));

  readonly estado = toSignal(
    toObservable(this.consulta).pipe(
      switchMap(({ instalacionId, periodo }) =>
        this.luz.getFotoperiodo(instalacionId, periodo.desde, periodo.hasta).pipe(
          map((dias): Estado => ({ tipo: 'datos', periodo, dias })),
          catchError(() => of<Estado>({ tipo: 'error' })),
          startWith<Estado>({ tipo: 'cargando' }),
        ),
      ),
    ),
    { initialValue: { tipo: 'cargando' } as Estado },
  );

  readonly grafica = computed(() => {
    const estado = this.estado();
    if (estado.tipo !== 'datos') return null;

    const inicio = Date.parse(estado.periodo.desde);
    const diasTranscurridos = (Date.parse(estado.periodo.hasta) - inicio) / DIA_MS;
    const puntos = new Map<number, number>();

    for (const { dia, horasDeLuz } of estado.dias) {
      if (Number.isFinite(horasDeLuz) && horasDeLuz >= 0 && horasDeLuz <= 24) {
        puntos.set((Date.parse(dia) - inicio) / DIA_MS, horasDeLuz);
      }
    }

    const indices = [...puntos.keys()].sort((a, b) => a - b);
    const ultimo = indices.at(-1);
    if (ultimo === undefined) return null;

    const intervalos = Math.min(diasTranscurridos, 4);
    const marcas = Array.from({ length: intervalos + 1 }, (_, posicion) => {
      const indice = intervalos ? Math.round(posicion * diasTranscurridos / intervalos) : 0;
      const etiqueta = formatoEje.format(inicio + indice * DIA_MS);
      return { indice, etiqueta, x: this.xParaDia(indice, diasTranscurridos) };
    });

    const tendencia = new Map<number, number>();
    for (const indice of indices) {
      const ventana: number[] = [];
      for (let vecino = indice - 3; vecino <= indice + 3; vecino++) {
        const horas = puntos.get(vecino);
        if (horas !== undefined) ventana.push(horas);
      }
      if (ventana.length >= 4) {
        ventana.sort((a, b) => a - b);
        const centro = Math.floor(ventana.length / 2);
        const mediana = ventana.length % 2 === 0
          ? (ventana[centro - 1] + ventana[centro]) / 2
          : ventana[centro];
        tendencia.set(indice, mediana);
      }
    }

    const trazado = (serie: Map<number, number>) => {
      const fechas = [...serie.keys()];
      return fechas.flatMap((indice, posicion) => {
        const x = this.xParaDia(indice, diasTranscurridos);
        const y = this.yParaHoras(serie.get(indice)!);
        const punto = `${x.toFixed(2)},${y.toFixed(2)}`;
        return posicion > 0 && indice - fechas[posicion - 1] === 1
          ? [`L${punto}`]
          : [`M${punto}`, `L${punto}`];
      }).join(' ');
    };

    return {
      inicio, diasTranscurridos, puntos, marcas, tendencia,
      trazadoDiario: trazado(new Map(indices.map(indice => [indice, puntos.get(indice)!]))),
      trazadoSemanal: trazado(tendencia),
      ultimo,
    };
  });

  readonly lectura = computed(() => {
    const grafica = this.grafica();
    if (!grafica) return null;

    const indice = this.diaSeleccionado() ?? grafica.ultimo;
    const horas = grafica.puntos.get(indice);
    return {
      fecha: grafica.inicio + indice * DIA_MS,
      horas,
      mediana: grafica.tendencia.get(indice),
      x: this.xParaDia(indice, grafica.diasTranscurridos),
    };
  });

  consultar(evento: SubmitEvent, desde: string, hasta: string): void {
    evento.preventDefault();

    if (!desde || !hasta || desde > hasta || hasta > this.hoy) {
      this.errorPeriodo.set('Elegí fechas válidas, con Desde anterior o igual a Hasta.');
      return;
    }

    this.errorPeriodo.set('');
    this.diaSeleccionado.set(null);
    this.periodo.set({ desde, hasta });
  }

  marcarDia(evento: PointerEvent, svg: Element): void {
    const grafica = this.grafica();
    if (!grafica) return;

    const rectangulo = svg.getBoundingClientRect();
    const x = (evento.clientX - rectangulo.left) * this.vista.ancho / rectangulo.width;
    const proporcion = (x - this.area.x) / this.area.ancho;
    this.diaSeleccionado.set(proporcion >= 0 && proporcion <= 1
      ? Math.round(proporcion * grafica.diasTranscurridos)
      : null);
  }

  xParaDia(indice: number, diasTranscurridos: number): number {
    return this.area.x + this.area.ancho * (diasTranscurridos ? indice / diasTranscurridos : 0.5);
  }

  yParaHoras(horas: number): number {
    return this.area.y + this.area.alto * (1 - horas / 24);
  }
}
