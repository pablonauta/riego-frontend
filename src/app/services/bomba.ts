import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ModoBomba = 'MANUAL' | 'PROGRAMADO' | 'AUTOMATICO';

export interface Bomba {
  id: number;
  instalacionId: number;
  nombre: string;
  pin: string;
  habilitada: boolean;
  encendida: boolean;
  modo: ModoBomba;
}

@Injectable({ providedIn: 'root' })
export class BombaService {
  private http = inject(HttpClient);

  listar(instalacionId: number): Observable<Bomba[]> {
    return this.http.get<Bomba[]>(
      `/api/instalaciones/${instalacionId}/bombas`
    );
  }

  encender(instalacionId: number, bombaId: number): Observable<Bomba> {
    return this.http.post<Bomba>(
      `/api/instalaciones/${instalacionId}/bombas/${bombaId}/encender`,
      null
    );
  }

  apagar(instalacionId: number, bombaId: number): Observable<Bomba> {
    return this.http.post<Bomba>(
      `/api/instalaciones/${instalacionId}/bombas/${bombaId}/apagar`,
      null
    );
  }
}
