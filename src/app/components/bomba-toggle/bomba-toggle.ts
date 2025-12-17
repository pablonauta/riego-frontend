import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { Bomba, BombaService } from '../../services/bomba';

@Component({
  selector: 'app-bomba-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bomba-toggle.html',
  styleUrls: ['./bomba-toggle.css']
})
export class BombaToggleComponent {

  private bombaService = inject(BombaService);

  @Input({ required: true }) instalacionId!: number;
  @Input({ required: true }) bomba!: Bomba;

  @Output() cambio = new EventEmitter<Bomba>(); // ✅

  loading = signal(false);
  error = signal<string | null>(null);

  toggle(): void {
    this.loading.set(true);
    this.error.set(null);

    const req$ = this.bomba.encendida
      ? this.bombaService.apagar(this.instalacionId, this.bomba.id)
      : this.bombaService.encender(this.instalacionId, this.bomba.id);

    req$
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (updated) => {
          this.bomba = updated;
          this.cambio.emit(updated); // ✅
        },
        error: (e) =>
          this.error.set(e?.error?.message ?? 'Error al cambiar estado')
      });
  }
}
