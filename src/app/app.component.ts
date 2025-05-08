import {Component, inject} from '@angular/core';
import {TableModule} from 'primeng/table';
import {Router, RouterOutlet} from '@angular/router';
import {InvoiceDataService} from "./features/billing/services/invoice-data/invoice-data.service";
import {MenuComponent} from "./shared/components/menu/menu.component";

@Component({
  selector: 'app-root',
  imports: [
    TableModule,
    RouterOutlet,
    MenuComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private router: Router = inject(Router);
  private readonly invoiceDataService: InvoiceDataService = inject(InvoiceDataService);

  constructor() {
    this.invoiceDataService.loadInvoices().then(() => console.info('Invoices loaded'));
    this.invoiceDataService.loadDraftInvoices().then(() => console.info('Draft invoices loaded'));
  }

  public createInvoice() {
    this.router.navigate(['invoice']);
  }

  public goToInvoiceHistory() {
    this.router.navigate(['invoice-history']);
  }

  public goToInvoiceDraft() {
    this.router.navigate(['invoice-draft']);
  }
}
