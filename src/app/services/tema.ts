import { DOCUMENT, inject, Injectable, signal } from '@angular/core';

const CLAVE_TEMA = 'planteraan.tema';
type Tema = 'claro' | 'oscuro';

@Injectable({ providedIn: 'root' })
export class TemaService {
  private readonly documento = inject(DOCUMENT);
  private readonly temaActual = signal<Tema>('claro');
  readonly tema = this.temaActual.asReadonly();

  constructor() {
    try {
      if (this.documento.defaultView?.localStorage.getItem(CLAVE_TEMA) === 'oscuro') {
        this.aplicar('oscuro');
      }
    } catch {
      // El navegador puede bloquear el almacenamiento local.
    }
  }

  alternar(): void {
    const tema = this.tema() === 'oscuro' ? 'claro' : 'oscuro';
    this.aplicar(tema);

    try {
      this.documento.defaultView?.localStorage.setItem(CLAVE_TEMA, tema);
    } catch {
      // La elección sigue activa en esta página.
    }
  }

  private aplicar(tema: Tema): void {
    this.documento.documentElement.dataset['tema'] = tema;
    this.temaActual.set(tema);
  }
}
