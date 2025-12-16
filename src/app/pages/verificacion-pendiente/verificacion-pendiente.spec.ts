import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificacionPendiente } from './verificacion-pendiente';

describe('VerificacionPendiente', () => {
  let component: VerificacionPendiente;
  let fixture: ComponentFixture<VerificacionPendiente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificacionPendiente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerificacionPendiente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
