import {Component, inject, input, Signal} from '@angular/core';
import {FormArray, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {TableModule} from 'primeng/table';
import {FloatLabel} from 'primeng/floatlabel';
import {InputText} from 'primeng/inputtext';
import {CurrencyPipe, PercentPipe} from '@angular/common';
import {Button} from 'primeng/button';
import {Ripple} from 'primeng/ripple';
import {InvoiceFormGroupService} from '../../../services/incoice-form-group/invoice-form-group.service';

@Component({
  selector: 'app-product-table',
  imports: [
    TableModule,
    FloatLabel,
    InputText,
    CurrencyPipe,
    PercentPipe,
    Button,
    Ripple,
    ReactiveFormsModule
  ],
  templateUrl: './product-table.component.html',
  styleUrl: './product-table.component.scss'
})
export class ProductTableComponent {
  public invoice: any = input.required();
  private readonly invoiceFormGroupService = inject(InvoiceFormGroupService);
  public items: Signal<FormArray<FormGroup>> = this.invoiceFormGroupService.getItemsArray();


  public trackByItemId(index: number, item: FormGroup): string {
    return item.get('id')?.value;
  }

  public addItem(): void {
    this.invoiceFormGroupService.addItem();
  }

  public removeItem(index: number): void {
    this.invoiceFormGroupService.removeItem(index);
  }

  public onEditInit(row: FormGroup): void {
    const index = this.items().controls.indexOf(row);
    this.invoiceFormGroupService.storeOriginalItem(index, {...row.value});
  }

  public onEditSave(row: FormGroup): void {
    const index = this.items().controls.indexOf(row);
    this.invoiceFormGroupService.clearOriginalItem(index);
  }

  public onEditCancel(row: FormGroup, index: number): void {
    const original = this.invoiceFormGroupService.getOriginalItem(index);

    if (original) {
      row.get('quantity')?.disable({emitEvent: false});
      row.get('unitPrice')?.disable({emitEvent: false});

      row.patchValue(original, {emitEvent: false});

      row.get('quantity')?.enable({emitEvent: false});
      row.get('unitPrice')?.enable({emitEvent: false});

      this.invoice.update((prev:any) => {
        const updatedItems = [...prev.items];
        updatedItems[index] = {
          ...updatedItems[index],
          quantity: original.quantity,
          unitPrice: original.unitPrice,
          totalPriceHt: original.quantity * original.unitPrice
        };
        return {...prev, items: updatedItems};
      });

      this.invoiceFormGroupService.clearOriginalItem(index);

    }
  }
}
