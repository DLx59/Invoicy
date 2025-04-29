import {Component, computed, effect, inject, signal, Signal, WritableSignal} from '@angular/core';
import {Invoice} from '../../models/invoice.model';
import {PdfGeneratorService} from '../../services/pdf-generator/pdf-generator.service';
import {ReactiveFormsModule} from '@angular/forms';
import {InvoiceNumberService} from '../../services/invoice-number/invoice-number.service';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {InvoiceFormGroupService} from '../../services/incoice-form-group/invoice-form-group.service';
import {TableModule} from "primeng/table";
import {FloatLabel} from "primeng/floatlabel";
import {Button} from "primeng/button";
import {Textarea} from "primeng/textarea";
import {InputText} from "primeng/inputtext";
import {ProductTableComponent} from "./product-table/product-table.component";
import {Menu} from 'primeng/menu';
import {MenuItem, MessageService} from 'primeng/api';
import {Toast} from 'primeng/toast';
import {ClientInputStateModel, IssuerInputStateModel} from '../../models/input-state.model';

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss'],
  imports: [
    TableModule,
    FloatLabel,
    Button,
    ReactiveFormsModule,
    Textarea,
    InputText,
    CurrencyPipe,
    ProductTableComponent,
    Menu,
    Toast
  ],
  providers: [DatePipe, MessageService],
})
export class InvoiceFormComponent {
  public invoice!: WritableSignal<Invoice>;
  public autoResizeEnabled = signal(false);
  public totalNet: Signal<number> = computed(() =>
    this.invoice().items.reduce((acc, item) => acc + (item.totalPriceHt ?? 0), 0)
  );
  public totalVat: Signal<number> = computed(() =>
    this.invoice().items.reduce((acc, item) => {
      const totalHt = item.totalPriceHt ?? 0;
      const taxRate = item.taxRate ?? 0;
      return acc + totalHt * taxRate;
    }, 0)
  );
  public totalGross: Signal<number> = computed(() =>
    this.totalNet() + this.totalVat()
  );
  public readonly issuerInputState: WritableSignal<IssuerInputStateModel> = signal({
    email: false,
    phone: false,
    reference: false,
    website: false,
  });

  public readonly clientInputState: WritableSignal<ClientInputStateModel> = signal({
    vat: false,
  });

  public issuerOptions: MenuItem[] = [
    {
      label: 'Téléphone',
      icon: 'pi pi-phone',
      command: () => this.addPhoneInput()
    },
    {
      label: 'Site web',
      icon: 'pi pi-globe',
      command: () => this.addWebsiteInput()
    },
    {
      label: 'Email',
      icon: 'pi pi-envelope',
      command: () => this.addEmailInput()
    },
  ];

  public clientOptions: MenuItem[] = [
    {
      label: 'Numéro de TVA',
      icon: 'pi pi-building',
      command: () => this.addVATInput()
    },
  ];

  private readonly invoiceFormGroupService = inject(InvoiceFormGroupService);
  public formGroup = this.invoiceFormGroupService.getFormGroup();
  private readonly datePipe = inject(DatePipe);
  private readonly pdfGeneratorService = inject(PdfGeneratorService);
  private readonly invoiceNumberService = inject(InvoiceNumberService);

  constructor() {
    this.initDefaultInvoice();
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
          clientId: current.client.id,
          clientName: current.client.name,
          clientReference: current.client.reference,
          clientVat: current.client.vat,
          contractNumber: current.contractNumber,
          deadline: current.deadline,
          dueDate: current.dueDate,
          interventionBy: current.interventionBy,
          invoiceNumber: current.invoiceNumber,
          issueDate: current.issueDate,
          issuerAddress: current.issuer.address,
          issuerEmail: current.issuer.email,
          issuerId: current.issuer.id,
          issuerName: current.issuer.name,
          issuerPhone: current.issuer.phone,
          issuerReference: current.issuer.reference,
          issuerVAT: current.issuer.vat,
          issuerWebsite: current.issuer.website,
          note: current.note
        }, {emitEvent: false});
        this.autoResizeEnabled.set(true);
      });
    });

    effect(() => {
      const dueDate = this.dueDate();
      queueMicrotask(() => {
        this.formGroup.get('dueDate')?.setValue(dueDate, {emitEvent: false});
      });
    });
  }

  public downloadPDF(): void {
    this.pdfGeneratorService.generate(this.invoice());

    if (this.isCurrentInvoiceAutoGenerated()) {
      this.invoiceNumberService.incrementCounter();
      const updated = {...this.invoice()};
      updated.invoiceNumber = this.invoiceNumberService.generateNextInvoiceNumber();
      this.invoice.set(updated);
      this.formGroup.get('invoiceNumber')?.setValue(updated.invoiceNumber, {emitEvent: false});
    }
  }

  public resetForm(): void {
    this.invoice.set({
      invoiceNumber: '',
      issueDate: '',
      deadline: 0,
      dueDate: '',
      contractNumber: '',
      client: {
        id: '',
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
        id: '',
        name: '',
        address: '',
        phone: '',
        website: '',
        email: '',
        reference: '',
        vat: ''
      },
      interventionBy: '',
      note: '',
      terms: ''
    });

    this.invoiceFormGroupService.resetFormGroup();
    this.invoiceFormGroupService.initItems(this.invoice().items);
  }

  public addPhoneInput() {
    this.issuerInputState.update((issuerInputStateModel: IssuerInputStateModel) => ({
      ...issuerInputStateModel,
      phone: true
    }))
  }

  public addWebsiteInput() {
    this.issuerInputState.update((issuerInputStateModel: IssuerInputStateModel) => ({
      ...issuerInputStateModel,
      website: true
    }))
  }


  public addEmailInput() {
    this.issuerInputState.update((issuerInputStateModel: IssuerInputStateModel) => ({
      ...issuerInputStateModel,
      email: true
    }))
  }


  public addVATInput() {
    this.clientInputState.update((clientInputStateModel: ClientInputStateModel) => ({
      ...clientInputStateModel,
      vat: true
    }))
  }

  private dueDate(): string {
    const invoice = this.invoice();
    const parts = invoice.issueDate.split('/');

    if (parts.length !== 3) {
      return '';
    }

    const day = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const year = Number(parts[2]);

    const date = new Date(Date.UTC(year, month, day));
    date.setUTCDate(date.getUTCDate() + Number(invoice.deadline));

    return this.datePipe.transform(date, 'dd/MM/yyyy') ?? '';
  }


  private initDefaultInvoice(): void {
    this.invoice = signal<Invoice>({
      invoiceNumber: '',
      issueDate: this.datePipe.transform(new Date(), 'dd/MM/yyyy') ?? '',
      deadline: 30,
      dueDate: '',
      contractNumber: 'CST.2024.08.003',
      client: {
        id: '534998695',
        name: 'Asitix',
        address: '1 Allée de la marque\n59290 Wasquehal',
        reference: 'Condition particulière Annexe 1 du contrat'
      },
      items: [{
        id: crypto.randomUUID(),
        type: 'Prestation',
        description: '21 jours',
        period: 'Mars 2025',
        quantity: 20,
        unitPrice: 500,
        totalPriceHt: 10000,
        taxRate: 0.21
      }],
      issuer: {
        id: '1022.858.268',
        name: 'WTZ SRL',
        address: 'Adresse de WTZ SRL',
        phone: '+33 647 10 97 00',
        reference: '',
        website: 'site-web.com',
        email: 'email@wtz.com',
        vat: 'BE1022858268'
      },
      interventionBy: 'Denis Wojtowicz',
      note: 'Développement Front End Angular\nAstreinte Novembre'
    });
  }

  private updateInvoiceFromForm(form: any): void {
    const updated = {...this.invoice()};
    updated.invoiceNumber = form.invoiceNumber ?? '';
    updated.issueDate = form.issueDate ?? '';
    updated.deadline = form.deadline ?? '';
    updated.dueDate = form.dueDate ?? '';
    updated.contractNumber = form.contractNumber ?? '';
    updated.interventionBy = form.interventionBy ?? '';
    updated.note = form.note ?? '';

    updated.issuer = {
      ...updated.issuer,
      address: form.issuerAddress ?? '',
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
      address: form.clientAddress ?? '',
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

  private isCurrentInvoiceAutoGenerated(): boolean {
    const current = this.invoice().invoiceNumber;
    const expected = this.invoiceNumberService.generateNextInvoiceNumber();
    return current === expected;
  }
}
