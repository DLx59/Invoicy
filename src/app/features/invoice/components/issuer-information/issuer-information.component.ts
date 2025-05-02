import {Component, inject} from '@angular/core';
import {FloatLabel} from "primeng/floatlabel";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {InputText} from "primeng/inputtext";
import {InvoiceFormGroupService} from '../../services/incoice-form-group/invoice-form-group.service';

@Component({
  selector: 'app-issuer-information',
  imports: [
    FloatLabel,
    FormsModule,
    InputText,
    ReactiveFormsModule
  ],
  templateUrl: './issuer-information.component.html',
  styleUrl: './issuer-information.component.scss'
})
export class IssuerInformationComponent {
  private readonly invoiceFormGroupService = inject(InvoiceFormGroupService);
  public formGroup = this.invoiceFormGroupService.getFormGroup();
}
