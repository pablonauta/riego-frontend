import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { EMPTY, Subscription, expand, reduce } from 'rxjs';
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
  private readonly cantidadPorPagina = 500;

  readonly hoy = new Date().toLocaleDateString('sv-SE');
  readonly dias = signal<string[]>([]);
  readonly diaSeleccionado = signal('');
  readonly fotos = signal<LuzFotoItemDto[]>([]);
  readonly fotoSeleccionada = signal<LuzFotoItemDto | null>(null);
  readonly imagen = signal<string | null>(null);
  readonly cargando = signal(false);
  readonly cargandoFoto = signal(false);
  readonly error = signal<string | null>(null);
  readonly errorFoto = signal<string | null>(null);

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

    const dias: string[] = [];
    const fecha = new Date(`${desde}T12:00:00`);
    const fin = new Date(`${hasta}T12:00:00`);

    while (fecha <= fin) {
      dias.push(fecha.toLocaleDateString('sv-SE'));
      fecha.setDate(fecha.getDate() + 1);
    }

    this.dias.set(dias);
    this.seleccionarDia(hasta);
  }

  seleccionarDia(dia: string): void {
    this.consulta?.unsubscribe();
    this.limpiarImagen();
    this.diaSeleccionado.set(dia);
    this.fotos.set([]);
    this.error.set(null);
    this.cargando.set(true);

    const from = new Date(`${dia}T00:00:00`).toISOString();
    const to = new Date(`${dia}T23:59:59.999`).toISOString();
    const pedirPagina = (pagina: number) => this.servicio.getHistorial(
      this.instalacionId, this.tipo, from, to, pagina, this.cantidadPorPagina
    );

    this.consulta = pedirPagina(0).pipe(
      expand((fotos, pagina) => fotos.length === this.cantidadPorPagina
        ? pedirPagina(pagina + 1)
        : EMPTY
      ),
      reduce((todas, pagina) => todas.concat(pagina), [] as LuzFotoItemDto[])
    ).subscribe({
      next: fotos => {
        this.fotos.set(fotos);
        this.cargando.set(false);
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
