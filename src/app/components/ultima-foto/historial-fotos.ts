import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { LuzFotoItemDto, LuzFotoService } from '../../services/luz-foto';

@Component({
  selector: 'app-historial-fotos',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './historial-fotos.html',
  styleUrls: ['./historial-fotos.css']
})
export class HistorialFotosComponent implements OnInit, OnDestroy {
  @Input({ required: true }) instalacionId!: number;
  @Input({ required: true }) tipo!: string;

  private readonly servicio = inject(LuzFotoService);
  private readonly cantidadPorPagina = 50;

  readonly hoy = new Date().toLocaleDateString('sv-SE');
  readonly fotos = signal<LuzFotoItemDto[]>([]);
  readonly fotoSeleccionada = signal<LuzFotoItemDto | null>(null);
  readonly imagen = signal<string | null>(null);
  readonly pagina = signal(0);
  readonly haySiguiente = signal(false);
  readonly cargando = signal(false);
  readonly cargandoFoto = signal(false);
  readonly error = signal<string | null>(null);
  readonly errorFoto = signal<string | null>(null);

  private rango?: { from: string; to: string };
  private consulta?: Subscription;
  private descarga?: Subscription;

  ngOnInit(): void {
    this.buscar(this.hoy, this.hoy);
  }

  ngOnDestroy(): void {
    this.consulta?.unsubscribe();
    this.limpiarImagen();
  }

  buscar(desde: string, hasta: string): void {
    if (!desde || !hasta || desde > hasta) {
      this.error.set('La fecha Desde debe ser anterior o igual a Hasta.');
      return;
    }

    this.rango = {
      from: new Date(`${desde}T00:00:00`).toISOString(),
      to: new Date(`${hasta}T23:59:59.999`).toISOString()
    };

    this.fotos.set([]);
    this.pagina.set(0);
    this.haySiguiente.set(false);
    this.limpiarImagen();
    this.cargarPagina(0);
  }

  cargarPagina(pagina: number): void {
    if (!this.rango || pagina < 0) return;

    this.consulta?.unsubscribe();
    this.cargando.set(true);
    this.error.set(null);

    const { from, to } = this.rango;
    this.consulta = this.servicio
      .getHistorial(this.instalacionId, this.tipo, from, to, pagina, this.cantidadPorPagina)
      .subscribe({
        next: fotos => {
          this.cargando.set(false);

          // Si la última página tenía 50 fotos exactas, la siguiente llega vacía.
          if (fotos.length === 0 && pagina > this.pagina()) {
            this.haySiguiente.set(false);
            return;
          }

          this.limpiarImagen();
          this.fotos.set(fotos);
          this.pagina.set(pagina);
          this.haySiguiente.set(fotos.length === this.cantidadPorPagina);
        },
        error: () => {
          this.cargando.set(false);
          this.error.set('No se pudo consultar el historial.');
        }
      });
  }

  verFoto(id: string): void {
    this.limpiarImagen();

    const foto = this.fotos().find(item => String(item.id) === id);
    if (!foto) return;

    this.fotoSeleccionada.set(foto);
    this.cargandoFoto.set(true);

    this.descarga = this.servicio.getFotoBlob(foto.url).subscribe({
      next: blob => {
        this.imagen.set(URL.createObjectURL(blob));
        this.cargandoFoto.set(false);
      },
      error: () => {
        this.cargandoFoto.set(false);
        this.errorFoto.set('No se pudo cargar esta captura.');
      }
    });
  }

  private limpiarImagen(): void {
    this.descarga?.unsubscribe();

    const url = this.imagen();
    if (url) URL.revokeObjectURL(url);

    this.imagen.set(null);
    this.fotoSeleccionada.set(null);
    this.cargandoFoto.set(false);
    this.errorFoto.set(null);
  }
}
