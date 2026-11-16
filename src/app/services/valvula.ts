import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export type AccionValvula = 'ABRIR' | 'CERRAR';
export type EstadoValvula = 'ABIERTA' | 'CERRADA' | 'DESCONOCIDA';

export interface ElectrovalvulaResumen {
  id: number;
  nombre: string;
  habilitada: boolean;
}

export interface ResultadoValvula {
  eventoId: number;
  estado: EstadoValvula;
  resultado: 'CONFIRMADO' | 'NO_CONFIRMADO';
}

export type ResultadoEvento = 'PENDIENTE' | 'CONFIRMADO' | 'NO_CONFIRMADO';

export interface EventoElectrovalvulaResumen {
  id: number;
  usuario: string;
  accion: AccionValvula;
  resultado: ResultadoEvento;
  estadoInformado: EstadoValvula;
  solicitadoEn: string;
  resueltoEn: string | null;
  detalle: string | null;
}

export interface HistorialElectrovalvulaPagina {
  eventos: EventoElectrovalvulaResumen[];
  pagina: number;
  totalPaginas: number;
  totalEventos: number;
}

@Injectable({ providedIn: 'root' })
export class ValvulaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/admin/hardware`;

  listar(instalacionId: number) {
    return this.http.get<ElectrovalvulaResumen[]>(
      `${environment.apiUrl}/admin/instalaciones/${instalacionId}/electrovalvulas`
    );
  }

    consultarHistorial(
    instalacionId: number,
    electrovalvulaId: number,
    pagina = 0,
    resultado?: ResultadoEvento,
  ) {
    const url =
      `${environment.apiUrl}/admin/instalaciones/${instalacionId}` +
      `/electrovalvulas/${electrovalvulaId}/historial`;

    let params = new HttpParams().set('pagina', pagina);

    if (resultado) {
      params = params.set('resultado', resultado);
    }

    return this.http.get<HistorialElectrovalvulaPagina>(url, { params });
  }


  crear(instalacionId: number, nombre: string, habilitada: boolean) {
  return this.http.post<ElectrovalvulaResumen>(
    `${environment.apiUrl}/admin/instalaciones/${instalacionId}/electrovalvulas`,
    { nombre, habilitada },
  );
}

  consultarEstado() {
    return this.http.get<{ conectado: boolean; valvula: EstadoValvula }>(
      `${this.url}/diagnostico`
    );
  }

  operar(accion: AccionValvula) {
    return this.http.post<ResultadoValvula>(`${this.url}/valvula`, { accion });
  }
}
