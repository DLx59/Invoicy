import {Component, input, output} from '@angular/core';
import {Dialog} from 'primeng/dialog';
import {NgxExtendedPdfViewerModule} from 'ngx-extended-pdf-viewer';
import {Button} from 'primeng/button';

@Component({
  selector: 'app-pdf-preview-modal',
  imports: [
    Dialog,
    NgxExtendedPdfViewerModule,
    Button
  ],
  templateUrl: './pdf-preview-modal.component.html',
  styleUrl: './pdf-preview-modal.component.scss'
})
export class PdfPreviewModalComponent {
  public showDialog = input<boolean>(false)
  public invoiceNumber = input<string>('')
  public pdfSrc = input.required<Blob | string>();
  public isOpen = output<boolean>();
  public onDownload = output<void>();
}
