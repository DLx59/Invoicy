import {Component, inject, signal, Signal, WritableSignal} from '@angular/core';
import {Invoice, InvoiceStatus} from "../../models/invoice.model";
import {TableModule} from "primeng/table";
import {CurrencyPipe, DatePipe} from "@angular/common";
import {InvoiceDataService} from "../../services/invoice-data/invoice-data.service";
import {Tag} from "primeng/tag";
import {Button} from "primeng/button";
import {Ripple} from "primeng/ripple";
import {PdfPreviewModalComponent} from "../../../../shared/components/pdf-preview-modal/pdf-preview-modal.component";
import {PdfGeneratorService} from "../../../../shared/pdf/pdf-generator.service";

@Component({
  selector: 'app-invoice-listing',
  imports: [
    TableModule,
    DatePipe,
    CurrencyPipe,
    Tag,
    Button,
    Ripple,
    PdfPreviewModalComponent
  ],
  templateUrl: './invoice-listing.component.html',
  styleUrl: './invoice-listing.component.scss'
})
export class InvoiceListingComponent {
  public pdfGeneratorService = inject(PdfGeneratorService);
  public selectedInvoice: WritableSignal<Invoice | null> = signal(null);
  public pdfSrc: WritableSignal<Blob | string> = signal('');
  public showPdfPreviewModal = signal(false);
  private readonly invoiceDataService: InvoiceDataService = inject(InvoiceDataService);
  public invoices: Signal<Array<Invoice>> = signal<Array<Invoice>>(this.invoiceDataService.getInvoices());

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

  public onEdit(invoice: Invoice) {
    console.log(invoice);
  }

  public refreshPdfDialogState(event: boolean) {
    this.showPdfPreviewModal.set(event);
  }

  public async showInvoice(invoice: Invoice): Promise<void> {
    this.selectedInvoice.set(invoice);
    try {
      const blob = await this.pdfGeneratorService.getBlob(invoice);
      this.pdfSrc.set(URL.createObjectURL(blob));
      this.showPdfPreviewModal.set(true);
    } catch (error) {
      console.error('Erreur de génération PDF', error);
    }
  }

  public downloadPDF() {
    if (this.selectedInvoice()) {
      this.pdfGeneratorService.download(this.selectedInvoice()!)
    } else {
      console.error('No invoice selected');
    }
  }
}
