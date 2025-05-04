import {Component, computed, effect, inject, signal, Signal, WritableSignal} from '@angular/core';
import {DEFAULT_INVOICE, Invoice, Total} from '../../models/invoice.model';
import {FormArray, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {InvoiceNumberService} from '../../services/invoice-number/invoice-number.service';
import {DatePipe} from '@angular/common';
import {InvoiceFormGroupService} from '../../services/incoice-form-group/invoice-form-group.service';
import {TableModule} from "primeng/table";
import {MenuItem, MessageService} from 'primeng/api';
import {Steps} from 'primeng/steps';
import {IssuerInformationComponent} from '../issuer-information/issuer-information.component';
import {ClientInformationComponent} from '../client-information/client-information.component';
import {ContractInformationComponent} from '../contract-information/contract-information.component';
import {ProductComponent} from '../product/product.component';
import {Button} from 'primeng/button';
import {PdfPreviewComponent} from '../../../../shared/components/pdf-preview/pdf-preview.component';
import {PdfGeneratorService} from '../../../../shared/pdf/pdf-generator.service';
import {InvoiceDataService} from "../../services/invoice-data/invoice-data.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss'],
  imports: [
    TableModule,
    ReactiveFormsModule,
    Steps,
    IssuerInformationComponent,
    ClientInformationComponent,
    ContractInformationComponent,
    ProductComponent,
    Button,
    PdfPreviewComponent
  ],
  providers: [DatePipe, MessageService],
})
export class InvoiceFormComponent {
  public autoResizeEnabled = signal(false);
  public menuActive: WritableSignal<number> = signal(0);
  public items: MenuItem[] = [
    {
      label: 'Informations société'
    },
    {
      label: 'Informations client'
    },
    {
      label: 'Informations contrat'
    },
    {
      label: 'Produits/Services'
    },
    {
      label: 'Aperçu'
    }
  ];
  public pdfSrc: WritableSignal<Blob | string> = signal('');
  public canDownloadPdf: WritableSignal<boolean> = signal(false);
  public invoice: WritableSignal<Invoice> = signal<Invoice>(DEFAULT_INVOICE);
  public totalNet: Signal<number> = computed(() => this.invoice().items.reduce((acc, item) => acc + (item.totalPriceHt ?? 0), 0));
  public totalVat: Signal<number> = computed(() => {
    const formArray = this.formGroup.get('items') as FormArray;
    if (this.invoice().isIntracommunity) {
      formArray.controls.forEach(control => {
        const taxRateControl = control.get('taxRate');
        taxRateControl?.setValue(0);
        taxRateControl?.disable();
      });
      return 0;
    } else {
      formArray.controls.forEach(control => {
        control.get('taxRate')?.enable({emitEvent: false});
      });
    }
    return this.invoice().items.reduce((acc, item) => {
      const totalHt: number = item.totalPriceHt ?? 0;
      const taxRate: number = item.taxRate ?? 0;
      return acc + totalHt * taxRate;
    }, 0);
  });
  public totalAmount: Signal<number> = computed(() => this.totalNet() + this.totalVat());
  public total: Signal<Total> = computed(() => ({
    vat: this.totalVat(),
    net: this.totalNet(),
    amount: this.totalAmount()
  }))
  private readonly invoiceFormGroupService = inject(InvoiceFormGroupService);
  public formGroup: FormGroup = this.invoiceFormGroupService.getFormGroup();
  private readonly datePipe: DatePipe = inject(DatePipe);
  private readonly invoiceNumberService: InvoiceNumberService = inject(InvoiceNumberService);
  private readonly pdfGeneratorService: PdfGeneratorService = inject(PdfGeneratorService);
  private route = inject(ActivatedRoute);
  private invoiceDataService = inject(InvoiceDataService);

  constructor() {
    const invoiceNumber = this.route.snapshot.paramMap.get('invoiceNumber');

    if (invoiceNumber) {
      this.invoiceDataService.loadInvoiceById(invoiceNumber).then((invoice: Invoice) => {
        this.invoice.set(invoice);
      });
    }
    this.invoiceFormGroupService.initItems(this.invoice().items);

    if (!this.invoice().invoiceNumber) {
      const updated = {...this.invoice()};
      updated.invoiceNumber = this.invoiceNumberService.generateNextInvoiceNumber();
      this.invoice.set(updated);
      this.formGroup.get('invoiceNumber')?.setValue(updated.invoiceNumber, {emitEvent: false});
    }

    this.formGroup.valueChanges.subscribe(form => this.updateInvoiceFromForm(form));

    effect(() => {
      const current = this.invoice();
      queueMicrotask(() => {
        this.formGroup.patchValue({
          clientAddress: current.client.address,
          clientCity: current.client.address.city,
          clientCountry: current.client.address.country,
          clientId: current.client.id,
          clientName: current.client.name,
          clientReference: current.client.reference,
          clientStreet: current.client.address.street,
          clientVat: current.client.vat,
          clientZipCode: current.client.address.zipCode,
          contractNumber: current.contractNumber,
          deadline: current.deadline,
          dueDate: current.dueDate,
          interventionBy: current.interventionBy,
          invoiceNumber: current.invoiceNumber,
          isPaid: current.isPaid,
          isIntracommunity: current.isIntracommunity,
          issueDate: current.issueDate,
          issuerCity: current.issuer.address.city,
          issuerCountry: current.issuer.address.country,
          issuerEmail: current.issuer.email,
          issuerId: current.issuer.id,
          issuerName: current.issuer.name,
          issuerPhone: current.issuer.phone,
          issuerReference: current.issuer.reference,
          issuerStreet: current.issuer.address.street,
          issuerVAT: current.issuer.vat,
          issuerWebsite: current.issuer.website,
          issuerZipCode: current.issuer.address.zipCode,
          items: current.items,
          note: current.note,
          terms: current.terms
        }, {emitEvent: false});
        this.autoResizeEnabled.set(true);
      });
    });

    effect(() => {
      const isPaid = this.formGroup.get('isPaid')?.value;
      const currentValue = this.formGroup.get('dueAmount')?.value;
      const expectedValue = isPaid ? 0 : this.total().amount;

      if (currentValue !== expectedValue) {
        this.formGroup.get('dueAmount')?.setValue(expectedValue, {emitEvent: false});
        this.invoice.update((invoice) => ({
          ...invoice,
          dueAmount: expectedValue
        }))
      }
    });
  }

  public async vizualisePDF(): Promise<void> {
    try {
      const blob: Blob = await this.pdfGeneratorService.getBlob(this.invoice());
      this.pdfSrc.set(URL.createObjectURL(blob));
    } catch (error) {
      console.error('Erreur de génération PDF', error);
    }
  }

  public downloadPDF() {
    this.pdfGeneratorService.download(this.invoice());
  }

  public onActiveIndexChange(event: number) {
    this.menuActive.set(event);
    this.preparePDF();
  }

  public preparePDF(): void {
    if (this.menuActive() === 4) {
      this.vizualisePDF().then(() => this.canDownloadPdf.set(true)).catch(() => this.canDownloadPdf.set(false));
    }
  }

  public nextStep(): void {
    const current = this.menuActive();
    if (current < this.items.length - 1) {
      this.menuActive.set(current + 1);
    }
    this.preparePDF();
  }

  public prevStep(): void {
    const current = this.menuActive();
    if (current > 0) {
      this.menuActive.set(current - 1);
    }
  }

  public resetForm(): void {
    this.invoice.set(DEFAULT_INVOICE);

    this.invoiceFormGroupService.resetFormGroup();
    this.invoiceFormGroupService.initItems(this.invoice().items);
  }

  private calculateDueDate(issueDate: string, deadline: number, isEndOfMonth: boolean): string {
    const parts = issueDate.split('/');
    if (parts.length !== 3) return '';

    const day = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const year = Number(parts[2]);

    let date = new Date(Date.UTC(year, month, day));
    if (isEndOfMonth) {
      date = new Date(Date.UTC(year, month + 1, 0));
    }
    date.setUTCDate(date.getUTCDate() + deadline);

    return this.datePipe.transform(date, 'dd/MM/yyyy') ?? '';
  }

  private updateInvoiceFromForm(form: any): void {
    const updated = {...this.invoice()};
    updated.contractNumber = form.contractNumber ?? '';
    updated.deadline = form.deadline ?? '';
    updated.dueAmount = form.dueAmount ?? '';
    updated.dueVat = form.dueVat ?? '';
    updated.dueDate = this.calculateDueDate(updated.issueDate, updated.deadline, updated.isEndOfMonth);
    updated.interventionBy = form.interventionBy ?? '';
    updated.invoiceNumber = form.invoiceNumber ?? '';
    updated.isEndOfMonth = form.isEndOfMonth ?? false;
    updated.isPaid = form.isPaid ?? false;
    updated.isIntracommunity = form.isIntracommunity ?? false;
    updated.issueDate = form.issueDate ?? '';
    updated.note = form.note ?? '';
    updated.terms = form.terms ?? '';

    updated.issuer = {
      ...updated.issuer,
      address: {
        city: form.issuerCity || '',
        country: form.issuerCountry || '',
        street: form.issuerStreet || '',
        zipCode: form.issuerZipCode || ''
      },
      email: form.issuerEmail ?? '',
      id: form.issuerId ?? '',
      name: form.issuerName ?? '',
      phone: form.issuerPhone ?? '',
      reference: form.issuerReference ?? '',
      vat: form.issuerVAT ?? '',
      website: form.issuerWebsite ?? ''
    };

    updated.client = {
      ...updated.client,
      address: {
        city: form.clientCity || '',
        country: form.clientCountry || '',
        street: form.clientStreet || '',
        zipCode: form.clientZipCode || ''
      },
      id: form.clientId ?? '',
      name: form.clientName ?? '',
      reference: form.clientReference ?? '',
      vat: form.clientVat ?? ''
    };

    updated.items = form.items.map((item: any) => ({
      description: item.description,
      id: item.id,
      period: item.period,
      quantity: item.quantity,
      taxRate: item.taxRate,
      totalPriceHt: item.quantity * item.unitPrice,
      type: item.type,
      unitPrice: item.unitPrice
    }));

    this.invoice.set(updated);
  }
}
