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
  url: string; // "/api/luz/fotos/123"
}

@Injectable({
  providedIn: 'root'
})
export class LuzFotoService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Trae metadata de la última foto
   */
  getUltima(instalacionId: number, tipo: string = 'HISTORICO')
    : Observable<LuzFotoItemDto> {

    return this.http.get<LuzFotoItemDto>(
      `${this.apiUrl}/api/luz/fotos/ultima`,
      {
        params: {
          instalacionId,
          tipo
        }
      }
    );
  }

  /**
   * Descarga la imagen real como Blob (con Authorization)
   */
  getFotoBlob(urlRelativa: string): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}${urlRelativa}`,
      { responseType: 'blob' }
    );
  }

  /**
   * Atajo: última foto -> blob -> objectURL
   */
  getUltimaFotoObjectUrl(instalacionId: number, tipo: string = 'HISTORICO')
    : Observable<string> {

    return this.getUltima(instalacionId, tipo).pipe(
      switchMap(dto => this.getFotoBlob(dto.url)),
      map(blob => URL.createObjectURL(blob))
    );
  }
}
