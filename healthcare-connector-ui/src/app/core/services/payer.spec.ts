import { TestBed } from '@angular/core/testing';

import { Payer } from './payer';

describe('Payer', () => {
  let service: Payer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Payer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
