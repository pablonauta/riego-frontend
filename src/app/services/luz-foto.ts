
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LuzFotoItemDto {
  id: number;
  instalacionId: number;
  ts: string;
  tipo: string;
  sizeBytes: number;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class LuzFotoService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los datos de la última fotografía.
   */
  getUltima(
    instalacionId: number,
    tipo: string = 'HISTORICO'
  ): Observable<LuzFotoItemDto> {

    return this.http.get<LuzFotoItemDto>(
      `${this.apiUrl}/luz/fotos/ultima`,
      {
        params: {
          instalacionId,
          tipo
        }
      }
    );
  }

  /**
   * Descarga la fotografía como Blob.
   * La URL relativa ya incluye /api.
   */
  getFotoBlob(urlRelativa: string): Observable<Blob> {

    const baseUrl = this.apiUrl.replace(/\/api\/?$/, '');

    return this.http.get(
      `${baseUrl}${urlRelativa}`,
      { responseType: 'blob' }
    );
  }

  /**
   * Obtiene la última fotografía como Object URL.
   */
  getUltimaFotoObjectUrl(
    instalacionId: number,
    tipo: string = 'HISTORICO'
  ): Observable<string> {

    return this.getUltima(instalacionId, tipo).pipe(
      switchMap(dto => this.getFotoBlob(dto.url)),
      map(blob => URL.createObjectURL(blob))
    );
  }
}
