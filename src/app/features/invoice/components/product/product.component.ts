import {Component, inject, input, InputSignal, output, OutputEmitterRef} from '@angular/core';
import {Checkbox, CheckboxChangeEvent} from "primeng/checkbox";
import {FloatLabel} from "primeng/floatlabel";
import {InputGroup} from "primeng/inputgroup";
import {InputGroupAddon} from "primeng/inputgroupaddon";
import {InputNumber} from "primeng/inputnumber";
import {ProductTableComponent} from "../product-table/product-table.component";
import {Invoice, Total} from '../../models/invoice.model';
import {InvoiceFormGroupService} from '../../services/incoice-form-group/invoice-form-group.service';
import {ReactiveFormsModule} from '@angular/forms';
import {SummaryComponent} from '../summary/summary.component';

@Component({
  selector: 'app-product',
  imports: [
    Checkbox,
    FloatLabel,
    InputGroup,
    InputGroupAddon,
    InputNumber,
    ProductTableComponent,
    ReactiveFormsModule,
    SummaryComponent
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent {
  public invoice: InputSignal<Invoice> = input.required<Invoice>();
  public total: InputSignal<Total> = input.required<Total>();
  public isIntracommunity: OutputEmitterRef<number> = output<number>()
  private readonly invoiceFormGroupService = inject(InvoiceFormGroupService);
  public formGroup = this.invoiceFormGroupService.getFormGroup();

  public isAllreadyPaid(event: CheckboxChangeEvent): void {
    this.formGroup.get('dueAmount')?.setValue(this.total().amount);
    this.formGroup.get('isPaid')?.setValue(event.checked);
    this.formGroup.get('dueAmount')?.enable();
    if (event.checked) {
      this.formGroup.get('dueAmount')?.setValue(0);
      this.formGroup.get('dueAmount')?.disable();
    }
    this.formGroup.updateValueAndValidity();
  }
}
