import {Component, inject, input, InputSignal, signal, WritableSignal} from '@angular/core';
import {TableModule} from "primeng/table";
import {Tag} from "primeng/tag";
import {Button} from "primeng/button";
import {CurrencyPipe, DatePipe} from "@angular/common";
import {Invoice, InvoiceStatus} from "../../models/invoice.model";
import {PdfGeneratorService} from "../../../../shared/pdf/pdf-generator.service";
import {PdfPreviewModalComponent} from "../../../../shared/components/pdf-preview-modal/pdf-preview-modal.component";
import {Ripple} from "primeng/ripple";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";

@Component({
  selector: 'app-invoice-table',
  imports: [
    TableModule,
    Tag,
    Button,
    CurrencyPipe,
    DatePipe,
    PdfPreviewModalComponent,
    Ripple
  ],
  templateUrl: './invoice-table.component.html',
  styleUrl: './invoice-table.component.scss'
})
export class InvoiceTableComponent {
  public invoices: InputSignal<Array<Invoice>> = input.required<Array<Invoice>>();
  public selectedInvoice: WritableSignal<Invoice | null> = signal(null);
  public pdfGeneratorService: PdfGeneratorService = inject(PdfGeneratorService);
  public pdfSrc: WritableSignal<Blob | string> = signal('');
  public showPdfPreviewModal: WritableSignal<boolean> = signal(false);
  private readonly router: Router = inject(Router);

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
    this.router.navigate(['/invoice', invoice.invoiceNumber]);
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

  public refreshPdfDialogState(event: boolean) {
    this.showPdfPreviewModal.set(event);
  }
}
