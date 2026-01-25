import { TestBed } from '@angular/core/testing';

import { LuzFoto } from './luz-foto';

describe('LuzFoto', () => {
  let service: LuzFoto;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LuzFoto);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
