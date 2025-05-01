import { TestBed } from '@angular/core/testing';

import { InvoiceFormGroupService } from './invoice-form-group.service';

describe('InvoiceFormGroupService', () => {
  let service: InvoiceFormGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvoiceFormGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
