import {Component, computed, effect, inject, Signal, signal, WritableSignal} from '@angular/core';
import {Button} from "primeng/button";
import {Invoice, InvoiceStatus} from "../../../invoice/models/invoice.model";
import {InvoiceDataService} from "../../services/invoice-data/invoice-data.service";
import {CurrencyPipe, DatePipe} from "@angular/common";
import {Menu} from "primeng/menu";
import {MenuItem} from "primeng/api";
import {PdfGeneratorService} from "../../../../shared/pdf/pdf-generator.service";
import {PdfPreviewModalComponent} from "../../../../shared/components/pdf-preview-modal/pdf-preview-modal.component";
import {Tag} from "primeng/tag";

@Component({
  selector: 'app-invoice',
  imports: [
    Button,
    CurrencyPipe,
    DatePipe,
    Menu,
    PdfPreviewModalComponent,
    Tag
  ],
  providers: [CurrencyPipe],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss'
})
export class InvoiceComponent {
  public invoiceDataService = inject(InvoiceDataService);
  public pdfGeneratorService: PdfGeneratorService = inject(PdfGeneratorService);
  public invoices: WritableSignal<Array<Invoice>> = signal([]);
  public pdfSrc: WritableSignal<Blob | string> = signal('');
  public showPdfPreviewModal = signal(false);
  public selectedInvoice: WritableSignal<Invoice | null> = signal(null);
  public isLoading: Signal<boolean> = computed(() => this.invoiceDataService.getIsLoading());
  public items: MenuItem[] = [{
    items: [
      {
        label: 'Finaliser',
        icon: 'pi pi-check'
      },
      {
        label: 'Modifier',
        icon: 'pi pi-pencil'
      },
      {
        label: 'Supprimer',
        icon: 'pi pi-trash'
      },
      {
        label: 'Télécharger',
        icon: 'pi pi-download',
        command: () => {
          this.vizualisePDF();
        }
      }
    ]
  }]

  constructor() {
    effect(() => {
      this.invoices.set(this.invoiceDataService.getInvoices())
    });
  }

  public getSeverityFromInvoiceStatus(status: InvoiceStatus) {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return 'info';
      case InvoiceStatus.PAID:
        return 'success';
      case InvoiceStatus.PENDING:
        return 'warn';
      case InvoiceStatus.CANCELLED:
        return 'danger';
    }
  }

  public async vizualisePDF(): Promise<void> {
    const invoice = this.selectedInvoice();
    if (!invoice) return;
    try {
      const blob: Blob = await this.pdfGeneratorService.getBlob(invoice);
      this.pdfSrc.set(URL.createObjectURL(blob));
      this.showPdfPreviewModal.set(true);
    } catch (error) {
      console.error('Erreur de génération PDF', error);
    }
  }

  public refreshPdfDialogState(event: boolean) {
    this.showPdfPreviewModal.set(event);
  }

  public downloadPDF() {
    const invoice = this.selectedInvoice();
    if (!invoice) return;

    this.pdfGeneratorService.download(invoice);
  }
}
