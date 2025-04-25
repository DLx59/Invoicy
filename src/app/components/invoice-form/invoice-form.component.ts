import {Component, computed, effect, inject, signal, Signal, WritableSignal} from '@angular/core';
import {Invoice} from '../../models/invoice.model';
import {PdfGeneratorService} from '../../services/pdf-generator/pdf-generator.service';
import {FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FloatLabel} from 'primeng/floatlabel';
import {InputText} from 'primeng/inputtext';
import {Button, ButtonDirective} from 'primeng/button';
import {Textarea} from 'primeng/textarea';
import {InputMaskModule} from 'primeng/inputmask';
import {InvoiceNumberService} from '../../services/invoice-number/invoice-number.service';
import {CurrencyPipe, DatePipe, NgIf, PercentPipe} from '@angular/common';
import {TableModule} from 'primeng/table';
import {Ripple} from 'primeng/ripple';

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FloatLabel,
    InputText,
    Button,
    Textarea,
    InputMaskModule,
    TableModule,
    ButtonDirective,
    Ripple,
    NgIf,
    CurrencyPipe,
    PercentPipe
  ],
  providers: [DatePipe],
  styleUrls: ['./invoice-form.component.scss']
})
export class InvoiceFormComponent {
  public autoResizeEnabled: WritableSignal<boolean> = signal(false);
  public invoice!: WritableSignal<Invoice>;
  public formGroup = new FormGroup({
    invoiceNumber: new FormControl<string>('', {nonNullable: true}),
    issueDate: new FormControl<string>('', {nonNullable: true}),
    deadline: new FormControl<number>(0, {nonNullable: true}),
    dueDate: new FormControl<string>('', {nonNullable: true}),
    contractNumber: new FormControl<string>('', {nonNullable: true}),
    issuerName: new FormControl<string>('', {nonNullable: true}),
    issuerAddress: new FormControl<string>(' ', {nonNullable: true}),
    issuerPhone: new FormControl<string>('', {nonNullable: true}),
    issuerWebsite: new FormControl<string>('', {nonNullable: true}),
    issuerEmail: new FormControl<string>('', {nonNullable: true}),
    issuerReference: new FormControl<string>('', {nonNullable: true}),
    clientName: new FormControl<string>('', {nonNullable: true}),
    clientAddress: new FormControl<string>('', {nonNullable: true}),
    clientReference: new FormControl<string>('', {nonNullable: true}),
    interventionBy: new FormControl<string>('', {nonNullable: true}),
    note: new FormControl<string>('', {nonNullable: true}),
    items: new FormArray<FormGroup>([
      new FormGroup({
        id: new FormControl<string>(crypto.randomUUID(), {nonNullable: true}),
        type: new FormControl<string>('', {nonNullable: true}),
        description: new FormControl<string>('', {nonNullable: true}),
        period: new FormControl<string>('', {nonNullable: true}),
        quantity: new FormControl<number>(0, {nonNullable: true}),
        unitPrice: new FormControl<number>(0, {nonNullable: true}),
        totalPriceHt: new FormControl<number>({value: 0, disabled: true}, {nonNullable: true}),
        taxRate: new FormControl<number>(0.21, {nonNullable: true})
      })
    ])
  });
  public totalNet: Signal<number> = computed(() => {
    return this.invoice().items.reduce((acc, item) => acc + (item.totalPriceHt ?? 0), 0);
  });
  public totalVat: Signal<number> = computed(() => {
    return this.invoice().items.reduce((acc, item) => {
      const totalHt = item.totalPriceHt ?? 0;
      const taxAmount = totalHt * (item.taxRate ?? 0);
      return acc + taxAmount;
    }, 0);
  });
  public totalGross: Signal<number> = computed(() => this.totalNet() + this.totalVat())
  private readonly datePipe = inject(DatePipe);
  private dueDate: Signal<string> = computed(() => {
    const invoice = this.invoice();
    const issueDateParts = invoice.issueDate.split('/');

    if (issueDateParts.length !== 3) {
      return '';
    }

    const day = Number(issueDateParts[0]);
    const month = Number(issueDateParts[1]) - 1; // mois base 0
    const year = Number(issueDateParts[2]);

    const issue = new Date(Date.UTC(year, month, day));
    issue.setUTCDate(issue.getUTCDate() + Number(invoice.deadline));

    return this.datePipe.transform(issue, 'dd/MM/yyyy') ?? '';
  });
  private readonly pdfGeneratorService = inject(PdfGeneratorService);
  private readonly invoiceNumberService = inject(InvoiceNumberService);
  // Ajouter ces méthodes
  private originalValues = new Map<number, any>();

  constructor() {
    this.initDefaultInvoice();
    this.initFormArrayFromInvoice();

    if (!this.invoice().invoiceNumber) {
      const updatedInvoice = {...this.invoice()};
      updatedInvoice.invoiceNumber = this.invoiceNumberService.generateNextInvoiceNumber();
      this.invoice.set(updatedInvoice);
      this.formGroup.get('invoiceNumber')?.setValue(updatedInvoice.invoiceNumber, {emitEvent: false});
    }

    this.formGroup.valueChanges.subscribe(form => this.updateInvoiceFromForm(form));

    effect(() => {
      const current = this.invoice();
      queueMicrotask(() => {
        this.formGroup.patchValue({
          invoiceNumber: current.invoiceNumber,
          issueDate: current.issueDate,
          deadline: current.deadline,
          dueDate: current.dueDate,
          contractNumber: current.contractNumber,
          interventionBy: current.interventionBy,
          note: current.note,
          issuerName: current.issuer.name,
          issuerAddress: current.issuer.address,
          issuerPhone: current.issuer.phone,
          issuerWebsite: current.issuer.website,
          issuerEmail: current.issuer.email,
          issuerReference: current.issuer.reference,
          clientName: current.client.name,
          clientAddress: current.client.address,
          clientReference: current.client.reference
        }, {emitEvent: false});

        this.autoResizeEnabled.set(true);
      });
    });


    effect(() => {
      const value = this.dueDate();
      queueMicrotask(() => {
        this.formGroup.get('dueDate')?.setValue(value, {emitEvent: false});
      })
    });

  }

  public get items(): FormArray<FormGroup> {
    return this.formGroup.get('items') as FormArray<FormGroup>;
  }

  public onEditInit(row: FormGroup): void {
    const index = this.items.controls.indexOf(row);
    this.originalValues.set(index, {...row.value});
  }

  public onEditCancel(row: FormGroup, index: number): void {
    const original = this.originalValues.get(index);
    if (original) {
      row.get('quantity')?.disable({emitEvent: false});
      row.get('unitPrice')?.disable({emitEvent: false});

      row.patchValue(original, {emitEvent: false});

      row.get('quantity')?.enable({emitEvent: false});
      row.get('unitPrice')?.enable({emitEvent: false});

      this.invoice.update(prev => {
        const updatedItems = [...prev.items];
        updatedItems[index] = {
          ...updatedItems[index],
          quantity: original.quantity,
          unitPrice: original.unitPrice,
          totalPriceHt: original.quantity * original.unitPrice
        };
        return {...prev, items: updatedItems};
      });
    }

    this.originalValues.delete(index);
  }

  public resetForm(): void {
    this.invoice.set({
      invoiceNumber: '',
      issueDate: '',
      deadline: 0,
      dueDate: '',
      contractNumber: '',
      client: {
        name: '',
        address: '',
        reference: ''
      },
      items: [{
        id: crypto.randomUUID(),
        type: '',
        description: '',
        period: '',
        quantity: 0,
        unitPrice: 0,
        taxRate: 0.21,
        totalPriceHt: 0
      }],
      issuer: {
        name: '',
        address: '',
        phone: '',
        website: '',
        email: '',
        reference: ''
      },
      interventionBy: '',
      note: '',
      terms: ''
    });

    this.formGroup.reset();
    this.initFormArrayFromInvoice();
  }

  public onEditSave(row: FormGroup): void {
    const currentValue = row.getRawValue();
    this.invoice.update(prev => {
      const items = [...prev.items];
      const index = items.findIndex(item => item.id === currentValue.id);
      if (index > -1) {
        items[index] = {
          ...currentValue,
          totalPriceHt: currentValue.quantity * currentValue.unitPrice
        };
      }
      return {...prev, items};
    });
  }


  public downloadPDF(): void {
    this.pdfGeneratorService.generate(this.invoice());

    if (this.isCurrentInvoiceAutoGenerated()) {
      this.invoiceNumberService.incrementCounter();
      const updatedInvoice = {...this.invoice()};
      updatedInvoice.invoiceNumber = this.invoiceNumberService.generateNextInvoiceNumber();
      this.invoice.set(updatedInvoice);
      this.formGroup.get('invoiceNumber')?.setValue(updatedInvoice.invoiceNumber, {emitEvent: false});
    }
  }

  public addItem(): void {
    const newItem = new FormGroup({
      id: new FormControl<string>(crypto.randomUUID(), {nonNullable: true}),
      type: new FormControl<string>('', {nonNullable: true}),
      description: new FormControl<string>('', {nonNullable: true}),
      period: new FormControl<string>('', {nonNullable: true}),
      quantity: new FormControl<number>(0, {nonNullable: true}),
      unitPrice: new FormControl<number>(0, {nonNullable: true}),
      totalPriceHt: new FormControl<number>({value: 0, disabled: true}, {nonNullable: true}),
      taxRate: new FormControl<number>(0.21, {nonNullable: true})
    });

    const quantityControl = newItem.get('quantity');
    const unitPriceControl = newItem.get('unitPrice');
    const totalPriceHtControl = newItem.get('totalPriceHt');

    if (quantityControl && unitPriceControl && totalPriceHtControl) {
      const calculateTotal = () => {
        const quantity = quantityControl.value;
        const unitPrice = unitPriceControl.value;
        const total = quantity * unitPrice;
        totalPriceHtControl.setValue(total, {emitEvent: false});
      };

      quantityControl.valueChanges.subscribe(calculateTotal);
      unitPriceControl.valueChanges.subscribe(calculateTotal);
      calculateTotal();
    }

    this.items.push(newItem);
    this.invoice.update(prev => ({
      ...prev,
      items: [...prev.items, newItem.getRawValue()]
    }));

    newItem.valueChanges.subscribe(() => {
      const itemId = newItem.get('id')?.value;
      const index = this.invoice().items.findIndex(item => item.id === itemId);

      if (index !== -1) {
        this.invoice().items[index] = newItem.getRawValue();
      }
    });

    this.formGroup.get('items')?.updateValueAndValidity({onlySelf: true, emitEvent: false});
  }

  public trackByItemId(index: number, item: FormGroup): string {
    return item.get('id')?.value;
  }

  public removeItem(index: number): void {
    const items = this.formGroup.get('items') as FormArray<FormGroup>;
    if (items.length > 1) {
      items.removeAt(index);
      this.invoice.update(prev => {
        const updatedItems = [...prev.items];
        updatedItems.splice(index, 1);
        return {...prev, items: updatedItems};
      });
    }
  }

  private initFormArrayFromInvoice(): void {
    const itemsArray = this.formGroup.get('items') as FormArray<FormGroup>;
    itemsArray.clear();

    this.invoice().items.forEach(item => {
      const newItem = new FormGroup({
        id: new FormControl<string>(item.id, {nonNullable: true}),
        type: new FormControl<string>(item.type ?? '', {nonNullable: true}),
        description: new FormControl<string>(item.description ?? '', {nonNullable: true}),
        period: new FormControl<string>(item.period ?? '', {nonNullable: true}),
        quantity: new FormControl<number>(item.quantity ?? 0, {nonNullable: true}),
        unitPrice: new FormControl<number>(item.unitPrice ?? 0, {nonNullable: true}),
        taxRate: new FormControl<number>(item.taxRate ?? 0.21, {nonNullable: true}),
        totalPriceHt: new FormControl<number>({
          value: item.totalPriceHt ?? 0,
          disabled: true
        }, {nonNullable: true})
      });

      const quantityControl = newItem.get('quantity');
      const unitPriceControl = newItem.get('unitPrice');
      const totalPriceHtControl = newItem.get('totalPriceHt');

      if (quantityControl && unitPriceControl && totalPriceHtControl) {
        const calculateTotal = () => {
          const total = quantityControl.value * unitPriceControl.value;
          totalPriceHtControl.setValue(total, {emitEvent: false});
        };

        quantityControl.valueChanges.subscribe(calculateTotal);
        unitPriceControl.valueChanges.subscribe(calculateTotal);
        calculateTotal();
      }

      newItem.valueChanges.subscribe(() => {
        const itemId = newItem.get('id')?.value;
        const currentInvoice = this.invoice();
        const index = currentInvoice.items.findIndex(i => i.id === itemId);
        if (index !== -1) {
          const updatedItems = [...currentInvoice.items];
          updatedItems[index] = newItem.getRawValue();
          this.invoice.set({...currentInvoice, items: updatedItems});
        }
      });

      itemsArray.push(newItem);
    });
  }

  private initDefaultInvoice(): void {
    this.invoice = signal<Invoice>({
      invoiceNumber: '',
      issueDate: this.datePipe.transform(new Date(), 'dd/MM/yyyy') ?? '',
      deadline: 30,
      dueDate: '01/01/0001',
      contractNumber: 'CST.2024.08.003',
      client: {
        name: 'Asitix',
        address: '1 Allée de la marque\n59290 Wasquehal',
        reference: 'Condition particulière Annexe 1 du contrat'
      },
      items: [{
        id: '17',
        type: 'Prestation',
        description: '21 jours',
        period: 'Mars 2025',
        quantity: 20,
        unitPrice: 500,
        totalPriceHt: 10000,
        taxRate: 0.21
      }],
      issuer: {
        name: 'WTZ SRL',
        address: 'Adresse de WTZ SRL',
        phone: '+33 647 10 97 00',
        reference: '',
        website: 'site-web.com',
        email: 'email@wtz.com'
      },
      interventionBy: 'Denis Wojtowicz',
      note: 'Développement Front End Angular\nAstreinte Novembre'
    });
  }

  private updateInvoiceFromForm(form: any): void {
    const updatedInvoice = {...this.invoice()};

    updatedInvoice.invoiceNumber = form.invoiceNumber ?? '';
    updatedInvoice.issueDate = form.issueDate ?? '';
    updatedInvoice.deadline = form.deadline ?? '';
    updatedInvoice.dueDate = form.dueDate ?? '';
    updatedInvoice.contractNumber = form.contractNumber ?? '';
    updatedInvoice.interventionBy = form.interventionBy ?? '';
    updatedInvoice.note = form.note ?? '';

    updatedInvoice.issuer = {
      ...updatedInvoice.issuer,
      name: form.issuerName ?? '',
      address: form.issuerAddress ?? '',
      phone: form.issuerPhone ?? '',
      website: form.issuerWebsite ?? '',
      email: form.issuerEmail ?? '',
      reference: form.issuerReference ?? ''
    };

    updatedInvoice.client = {
      ...updatedInvoice.client,
      name: form.clientName ?? '',
      address: form.clientAddress ?? '',
      reference: form.clientReference ?? ''
    };

    this.invoice.set(updatedInvoice);
  }

  private isCurrentInvoiceAutoGenerated(): boolean {
    const currentInvoiceNumber = this.invoice().invoiceNumber;
    const expectedInvoiceNumber = this.invoiceNumberService.generateNextInvoiceNumber();
    return currentInvoiceNumber === expectedInvoiceNumber;
  }
}
