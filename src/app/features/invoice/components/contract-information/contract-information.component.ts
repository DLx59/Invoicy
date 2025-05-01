import {Component, inject} from '@angular/core';
import {Checkbox, CheckboxChangeEvent} from "primeng/checkbox";
import {DatePicker} from "primeng/datepicker";
import {FloatLabel} from "primeng/floatlabel";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {InputGroup} from "primeng/inputgroup";
import {InputGroupAddon} from "primeng/inputgroupaddon";
import {InputText} from "primeng/inputtext";
import {Textarea} from "primeng/textarea";
import {InvoiceFormGroupService} from '../../services/incoice-form-group/invoice-form-group.service';

@Component({
  selector: 'app-contract-information',
  imports: [
    Checkbox,
    DatePicker,
    FloatLabel,
    FormsModule,
    InputGroup,
    InputGroupAddon,
    InputText,
    ReactiveFormsModule
  ],
  templateUrl: './contract-information.component.html',
  styleUrl: './contract-information.component.scss'
})
export class ContractInformationComponent {
  private readonly invoiceFormGroupService = inject(InvoiceFormGroupService);
  public formGroup = this.invoiceFormGroupService.getFormGroup();

  public isEndOfMonth(event: CheckboxChangeEvent): void {
    this.formGroup.get('isEndOfMonth')?.setValue(event.checked);
    this.formGroup.updateValueAndValidity();
  }

}
