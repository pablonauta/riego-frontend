import { TestBed } from '@angular/core/testing';

import { Bomba } from './bomba';

describe('Bomba', () => {
  let service: Bomba;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Bomba);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
