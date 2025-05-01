import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssuerInformationComponent } from './issuer-information.component';

describe('IssuerInformationComponent', () => {
  let component: IssuerInformationComponent;
  let fixture: ComponentFixture<IssuerInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssuerInformationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IssuerInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
