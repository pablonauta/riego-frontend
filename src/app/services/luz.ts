import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { concatMap, from, map, toArray } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FotoperiodoDia {
  dia: string;
  horasDeLuz: number;
}

export const DIA_MS = 24 * 60 * 60 * 1000;

function fechaIso(instante: number): string {
  return new Date(instante).toISOString();
}

@Injectable({ providedIn: 'root' })
export class LuzService {
  private readonly http = inject(HttpClient);

  getFotoperiodo(instalacionId: number, desde: string, hasta: string) {
    const inicio = Date.parse(desde);
    const fin = Date.parse(hasta);
    const tramos = [];

    for (let primerDia = inicio; primerDia <= fin; primerDia += 30 * DIA_MS) {
      const ultimoDia = Math.min(fin, primerDia + 29 * DIA_MS);
      tramos.push({ primerDia, ultimoDia });
    }

    return from(tramos).pipe(
      concatMap(({ primerDia, ultimoDia }) =>
        this.http.get<FotoperiodoDia[]>(`${environment.apiUrl}/luz/fotoperiodo`, {
          params: {
            instalacionId,
            // El margen evita cortar un día en los bordes si la API agrupa por otro offset.
            from: fechaIso(primerDia - DIA_MS),
            to: fechaIso(ultimoDia + 2 * DIA_MS),
          },
        }).pipe(
          map(dias => dias.filter(({ dia }) => {
            const fecha = Date.parse(dia);
            return fecha >= primerDia && fecha <= ultimoDia;
          })),
        ),
      ),
      toArray(),
      map(tramosRecibidos => tramosRecibidos.flat()),
    );
  }
}
