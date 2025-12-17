import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BombaService, Bomba } from '../../services/bomba';
import { BombaToggleComponent } from '../../components/bomba-toggle/bomba-toggle';

@Component({
  standalone: true,
  selector: 'app-bombas-page',
  imports: [CommonModule, BombaToggleComponent],
  templateUrl: './bombas.html',
  styleUrls: ['./bombas.css']
})
export class BombasPage implements OnInit {

  private bombaService = inject(BombaService);

  //por ahora fijo (después lo sacamos del usuario / instalación)
  instalacionId = 1;

  bombas = signal<Bomba[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarBombas();
  }

  cargarBombas(): void {
  this.loading.set(true);
  this.error.set(null);

  this.bombaService.listar(this.instalacionId).subscribe({
    next: (data) => this.bombas.set(data ?? []),
    error: () => {
      this.error.set('No se pudieron cargar las bombas');
      this.loading.set(false); // ✅ importante
    },
    complete: () => this.loading.set(false)
  });
}

}
