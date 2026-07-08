import { TestBed } from '@angular/core/testing';

import { Communication } from './communication';

describe('Communication', () => {
  let service: Communication;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Communication);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
