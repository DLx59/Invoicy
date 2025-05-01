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
import {
  ClientInputStateModel,
  defaultClientInputState,
  defaultIssuerInputState,
  IssuerInputStateModel
} from '../../models/input-state.model';
import {DatePicker} from 'primeng/datepicker';
import {InputGroup} from 'primeng/inputgroup';
import {InputGroupAddon} from 'primeng/inputgroupaddon';
import {Checkbox, CheckboxChangeEvent} from 'primeng/checkbox';
import {InputNumber} from 'primeng/inputnumber';
import {PdfPreviewModalComponent} from '../pdf-preview-modal/pdf-preview-modal.component';

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
    Toast,
    DatePicker,
    InputGroup,
    InputGroupAddon,
    Checkbox,
    InputNumber,
    PdfPreviewModalComponent
  ],
  providers: [DatePipe, MessageService],
})
export class InvoiceFormComponent {
  public invoice!: WritableSignal<Invoice>;
  public autoResizeEnabled = signal(false);
  public showPdfPreviewModal = signal(false);
  public totalVat: Signal<number> = computed(() =>
    this.invoice().items.reduce((acc, item) => {
      const totalHt = item.totalPriceHt ?? 0;
      const taxRate = item.taxRate ?? 0;
      return acc + totalHt * taxRate;
    }, 0)
  );
  public issuerOptions: MenuItem[] = [
    {
      label: 'Téléphone',
      icon: 'pi pi-phone',
      command: () => this.addIssuerPhoneInput()
    },
    {
      label: 'Site web',
      icon: 'pi pi-globe',
      command: () => this.addIssuerWebsiteInput()
    },
    {
      label: 'Email',
      icon: 'pi pi-envelope',
      command: () => this.addIssuerEmailInput()
    },
  ];
  public clientOptions: MenuItem[] = [
    {
      label: 'Numéro d\'entreprise',
      icon: 'pi pi-building',
      command: () => this.addCLientIdInput()
    },
    {
      label: 'Numéro de TVA',
      icon: 'pi pi-building',
      command: () => this.addClientVATInput()
    },
  ];
  public readonly issuerInputState: WritableSignal<IssuerInputStateModel> = signal(defaultIssuerInputState);
  public readonly clientInputState: WritableSignal<ClientInputStateModel> = signal(defaultClientInputState);
  public totalNet: Signal<number> = computed(() => this.invoice().items.reduce((acc, item) => acc + (item.totalPriceHt ?? 0), 0));
  public totalGross: Signal<number> = computed(() => this.totalNet() + this.totalVat());
  public pdfSrc: WritableSignal<Blob | string> = signal('');
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
          isPaid: current.isPaid,
          issueDate: current.issueDate,
          issuerAddress: current.issuer.address,
          issuerEmail: current.issuer.email,
          issuerId: current.issuer.id,
          issuerName: current.issuer.name,
          issuerPhone: current.issuer.phone,
          issuerReference: current.issuer.reference,
          issuerVAT: current.issuer.vat,
          issuerWebsite: current.issuer.website,
          note: current.note,
          terms: current.terms
        }, {emitEvent: false});
        this.autoResizeEnabled.set(true);
      });
    });

    effect(() => {
      const isPaid = this.formGroup.get('isPaid')?.value;
      const currentValue = this.formGroup.get('duAmount')?.value;
      const expectedValue = isPaid ? 0 : this.totalNet();

      if (currentValue !== expectedValue) {
        this.formGroup.get('duAmount')?.setValue(expectedValue, {emitEvent: false});
        this.invoice.update((invoice) => ({
          ...invoice,
          duAmount: expectedValue
        }))
      }
    });

  }

  public refreshPdfDialogState(event: boolean) {
    console.warn('refreshPdfDialogState', event);
    this.showPdfPreviewModal.set(event);
  }

  public downloadPDF() {
    this.pdfGeneratorService.download(this.invoice());

    if (this.isCurrentInvoiceAutoGenerated()) {
      this.invoiceNumberService.incrementCounter();
      const updated = {...this.invoice()};
      updated.invoiceNumber = this.invoiceNumberService.generateNextInvoiceNumber();
      this.invoice.set(updated);
      this.formGroup.get('invoiceNumber')?.setValue(updated.invoiceNumber, {emitEvent: false});
    }
  }

  public async vizualisePDF(): Promise<void> {
    try {
      const blob = await this.pdfGeneratorService.getBlob(this.invoice());
      this.pdfSrc.set(URL.createObjectURL(blob));
      this.showPdfPreviewModal.set(true);
    } catch (error) {
      console.error('Erreur de génération PDF', error);
    }
  }

  public resetForm(): void {
    this.invoice.set({
      invoiceNumber: '',
      issueDate: '',
      deadline: 0,
      duAmount: 0,
      dueDate: '',
      isEndOfMonth: false,
      isPaid: false,
      contractNumber: '',
      client: {
        id: '',
        name: '',
        address: {
          city: '',
          country: '',
          street: '',
          zipCode: ''
        },
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
        address: {
          city: '',
          country: '',
          street: '',
          zipCode: ''
        },
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
    this.issuerInputState.set(defaultIssuerInputState);
    this.clientInputState.set(defaultClientInputState);
  }

  public addIssuerPhoneInput() {
    this.issuerInputState.update((issuerInputStateModel: IssuerInputStateModel) => ({
      ...issuerInputStateModel,
      phone: true
    }))
  }

  public addIssuerWebsiteInput() {
    this.issuerInputState.update((issuerInputStateModel: IssuerInputStateModel) => ({
      ...issuerInputStateModel,
      website: true
    }))
  }

  public addIssuerEmailInput() {
    this.issuerInputState.update((issuerInputStateModel: IssuerInputStateModel) => ({
      ...issuerInputStateModel,
      email: true
    }))
  }

  public addClientVATInput() {
    this.clientInputState.update((clientInputStateModel: ClientInputStateModel) => ({
      ...clientInputStateModel,
      vat: true
    }))
  }

  public addCLientIdInput() {
    this.clientInputState.update((clientInputStateModel: ClientInputStateModel) => ({
      ...clientInputStateModel,
      id: true
    }))
  }

  public isEndOfMonth(event: CheckboxChangeEvent): void {
    this.formGroup.get('isEndOfMonth')?.setValue(event.checked);
    this.formGroup.updateValueAndValidity();
  }

  public isAllreadyPaid(event: CheckboxChangeEvent): void {
    this.formGroup.get('duAmount')?.setValue(this.totalNet());
    this.formGroup.get('isPaid')?.setValue(event.checked);
    this.formGroup.get('duAmount')?.enable();
    if (event.checked) {
      this.formGroup.get('duAmount')?.setValue(0);
      this.formGroup.get('duAmount')?.disable();
    }
    this.formGroup.updateValueAndValidity();
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

  private initDefaultInvoice(): void {
    const initialIssueDate = this.datePipe.transform(new Date(), 'dd/MM/yyyy') ?? '';
    const initialDeadline = 30;
    const initialIsEndOfMonth = false;

    this.invoice = signal<Invoice>({
      invoiceNumber: '',
      issueDate: this.datePipe.transform(new Date(), 'dd/MM/yyyy') ?? '',
      deadline: initialDeadline,
      duAmount: 0,
      dueDate: this.calculateDueDate(initialIssueDate, initialDeadline, initialIsEndOfMonth),
      isEndOfMonth: false,
      contractNumber: 'CST.2024.08.003',
      isPaid: false,
      client: {
        id: '534998695',
        name: 'Asitix',
        address: {
          city: 'Wasquehal',
          country: 'France',
          street: '1 Allée de la marque',
          zipCode: '59290'
        },
        reference: 'Condition particulière Annexe 1 du contrat',
        vat: 'FR1234567890'
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
        address: {
          city: 'Bruxelles',
          country: 'Belgique',
          street: ' 206 Chaussée de Roodebeek',
          zipCode: '1200'
        },
        phone: '+33 647 10 97 00',
        reference: '',
        website: 'site-web.com',
        email: 'email@wtz.com',
        vat: 'BE1022858268'
      },
      interventionBy: 'Denis Wojtowicz',
      note: 'Développement Front End Angular\nAstreinte Novembre',
      terms: 'Nos factures sont réglables sans escompte\nTout retard de paiement entraînerait la facturation de 40 € pour poursuite judiciaire\nainsi que des intérêts de retard : Taux de base x 3'
    });
  }

  private updateInvoiceFromForm(form: any): void {
    const updated = {...this.invoice()};
    updated.invoiceNumber = form.invoiceNumber ?? '';
    updated.issueDate = form.issueDate ?? '';
    updated.deadline = form.deadline ?? '';
    updated.duAmount = form.duAmount ?? '';
    updated.dueDate = this.calculateDueDate(updated.issueDate, updated.deadline, updated.isEndOfMonth);
    updated.contractNumber = form.contractNumber ?? '';
    updated.interventionBy = form.interventionBy ?? '';
    updated.note = form.note ?? '';
    updated.terms = form.terms ?? '';
    updated.isEndOfMonth = form.isEndOfMonth ?? false;
    updated.isPaid = form.isPaid ?? false;

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
