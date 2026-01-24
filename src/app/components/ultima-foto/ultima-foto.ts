import { Component, Input, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

export interface LuzFoto {
  id: number;
  instalacionId: number;
  ts: string;
  tipo: string;
  sizeBytes: number;
  url: string;
}

@Component({
  selector: 'app-ultima-foto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ultima-foto.html',
  styleUrls: ['./ultima-foto.css']
})
export class UltimaFotoComponent implements OnInit, OnDestroy {

  @Input({ required: true }) instalacionId!: number;
  @Input() tipo: string = 'HISTORICO';
  @Input() refreshMs = 0;

  foto = signal<LuzFoto | null>(null);
  cargando = signal(false);
  error = signal<string | null>(null);

  private sub?: Subscription;
  private timer?: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargar();

    if (this.refreshMs > 0) {
      this.timer = setInterval(() => this.cargar(), this.refreshMs);
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.timer) clearInterval(this.timer);
  }

  cargar(): void {
    if (!this.instalacionId) return;

    this.cargando.set(true);
    this.error.set(null);

    const params = new HttpParams()
      .set('instalacionId', String(this.instalacionId))
      .set('tipo', this.tipo);

    this.sub?.unsubscribe();

    this.sub = this.http
      .get<LuzFoto>('/api/luz/fotos/ultima', { params })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (resp) => this.foto.set(resp),
        error: () => {
          this.error.set('No se pudo cargar la imagen');
          this.foto.set(null);
        }
      });
  }
}
