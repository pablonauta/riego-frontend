import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface PuntoLuzDia {
  ts: string;
  indice: number;
}

@Injectable({ providedIn: 'root' })
export class LuzService {
  private readonly http = inject(HttpClient);

  getDia(instalacionId: number, date: string) {
    return this.http.get<PuntoLuzDia[]>(`${environment.apiUrl}/luz/dia`, {
      params: { instalacionId, date }
    });
  }
}
