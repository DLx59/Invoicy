import {Component, computed, inject, input, InputSignal} from '@angular/core';
import {NgxExtendedPdfViewerModule} from 'ngx-extended-pdf-viewer';
import {PdfGeneratorService} from '../../pdf/pdf-generator.service';
import {Invoice} from '../../../features/invoice/models/invoice.model';

@Component({
  selector: 'app-pdf-preview',
  imports: [
    NgxExtendedPdfViewerModule
  ],
  templateUrl: './pdf-preview.component.html',
  styleUrl: './pdf-preview.component.scss'
})
export class PdfPreviewComponent {
  public pdfSrc: InputSignal<Blob | string> = input.required<Blob | string>();
}
