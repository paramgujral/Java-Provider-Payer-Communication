import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PayerWorkflowService } from './payer.service';

describe('PayerWorkflowService', () => {
  let service: PayerWorkflowService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PayerWorkflowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
