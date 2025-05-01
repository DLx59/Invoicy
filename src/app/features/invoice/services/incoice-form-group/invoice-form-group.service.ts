import {computed, Injectable, signal, Signal} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {InvoiceItem} from '../../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceFormGroupService {
  private formGroup: Signal<FormGroup> = signal(this.createFormGroup());
  private originalItems = new Map<number, any>();

  public getFormGroup(): FormGroup {
    return this.formGroup();
  }

  public resetFormGroup(): void {
    this.formGroup().reset();
    (this.formGroup().get('items') as FormArray).clear();
    (this.formGroup().get('items') as FormArray).push(this.createItemFormGroup());
  }

  public addItem(): FormGroup {
    const items = this.getItemsArray();
    const newItem = this.createItemFormGroup();
    items().push(newItem);
    return newItem;
  }

  public removeItem(index: number): void {
    const items = this.getItemsArray();
    if (items().length > 1) {
      items().removeAt(index);
    } else {
      items().clear();
      items().push(this.createItemFormGroup());
    }
  }


  public initItems(items: InvoiceItem[]): void {
    const itemsArray = this.getItemsArray();
    itemsArray().clear();
    items.forEach(item => itemsArray().push(this.createItemFormGroup(item)));
  }

  public getItemsArray(): Signal<FormArray<FormGroup>> {
    return computed(() => this.formGroup().get('items') as FormArray<FormGroup>);
  }

  public storeOriginalItem(index: number, value: any): void {
    this.originalItems.set(index, value);
  }

  public getOriginalItem(index: number): any | undefined {
    return this.originalItems.get(index);
  }

  public clearOriginalItem(index: number): void {
    this.originalItems.delete(index);
  }

  private createFormGroup(): FormGroup {
    return new FormGroup({
      clientAddress: new FormControl<string>('', {nonNullable: true}),
      clientId: new FormControl<string>('', {nonNullable: true}),
      clientName: new FormControl<string>('', {nonNullable: true}),
      clientReference: new FormControl<string>(''),
      clientVat: new FormControl<string>(''),
      contractNumber: new FormControl<string>('', {nonNullable: true}),
      deadline: new FormControl<number>(0, {nonNullable: true}),
      isEndOfMonth: new FormControl<boolean>(false, {nonNullable: true}),
      duAmount: new FormControl<number>(0, {nonNullable: true}),
      dueDate: new FormControl<string>({value: '', disabled: true}, {nonNullable: true}),
      interventionBy: new FormControl<string>('', {nonNullable: true}),
      invoiceNumber: new FormControl<string>('', {nonNullable: true}),
      issueDate: new FormControl<string>('', {nonNullable: true}),
      issuerAddress: new FormControl<string>('', {nonNullable: true}),
      issuerEmail: new FormControl<string>(''),
      issuerId: new FormControl<string>('', {nonNullable: true}),
      issuerName: new FormControl<string>('', {nonNullable: true}),
      issuerPhone: new FormControl<string>(''),
      issuerReference: new FormControl<string>(''),
      issuerVAT: new FormControl<string>('', {nonNullable: true}),
      issuerWebsite: new FormControl<string>(''),
      isPaid: new FormControl<boolean>(false),
      items: new FormArray<FormGroup>([this.createItemFormGroup()]),
      note: new FormControl<string>('', {nonNullable: true}),
      terms: new FormControl<string>('', {nonNullable: true}),
    });
  }

  private bindQuantityAndUnitPriceCalculation(itemFormGroup: FormGroup): void {
    const quantityControl = itemFormGroup.get('quantity');
    const unitPriceControl = itemFormGroup.get('unitPrice');
    const totalPriceHtControl = itemFormGroup.get('totalPriceHt');

    if (quantityControl && unitPriceControl && totalPriceHtControl) {
      const calculateTotal = () => {
        const quantity = quantityControl.value ?? 0;
        const unitPrice = unitPriceControl.value ?? 0;
        const total = quantity * unitPrice;
        totalPriceHtControl.setValue(total, {emitEvent: false});
      };

      quantityControl.valueChanges.subscribe(calculateTotal);
      unitPriceControl.valueChanges.subscribe(calculateTotal);

      calculateTotal();
    }
  }

  private createItemFormGroup(item?: InvoiceItem): FormGroup {
    const formGroup = new FormGroup({
      description: new FormControl<string>(item?.description ?? '', {nonNullable: true}),
      id: new FormControl<string>(item?.id ?? crypto.randomUUID(), {nonNullable: true}),
      period: new FormControl<string>(item?.period ?? '', {nonNullable: true}),
      quantity: new FormControl<number>(item?.quantity ?? 0, {nonNullable: true}),
      taxRate: new FormControl<number>(item?.taxRate ?? 0.21, {nonNullable: true}),
      totalPriceHt: new FormControl<number>({
        value: (item?.quantity ?? 0) * (item?.unitPrice ?? 0),
        disabled: true
      }, {nonNullable: true}),
      type: new FormControl<string>(item?.type ?? '', {nonNullable: true}),
      unitPrice: new FormControl<number>(item?.unitPrice ?? 0, {nonNullable: true}),
    });

    this.bindQuantityAndUnitPriceCalculation(formGroup);

    return formGroup;
  }
}
