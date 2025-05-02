import {Component, inject} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {FloatLabel} from 'primeng/floatlabel';
import {InputText} from 'primeng/inputtext';
import {InvoiceFormGroupService} from '../../services/incoice-form-group/invoice-form-group.service';

@Component({
  selector: 'app-client-information',
  imports: [
    ReactiveFormsModule,
    FloatLabel,
    InputText
  ],
  templateUrl: './client-information.component.html',
  styleUrl: './client-information.component.scss'
})
export class ClientInformationComponent {
  private readonly invoiceFormGroupService = inject(InvoiceFormGroupService);
  public formGroup = this.invoiceFormGroupService.getFormGroup();
}
