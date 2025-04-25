import { TestBed } from '@angular/core/testing';

import { InvoiceNumberService } from './invoice-number.service';

describe('InvoiceNumberService', () => {
  let service: InvoiceNumberService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvoiceNumberService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
