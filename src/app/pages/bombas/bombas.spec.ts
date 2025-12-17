import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bombas } from './bombas';

describe('Bombas', () => {
  let component: Bombas;
  let fixture: ComponentFixture<Bombas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bombas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bombas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
