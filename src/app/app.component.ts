import {Component, inject} from '@angular/core';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import {InvoiceDataService} from "./features/invoice/services/invoice-data/invoice-data.service";

@Component({
    selector: 'app-root',
    imports: [
        Button,
        TableModule,
        RouterOutlet,
        RouterLink
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    private router: Router = inject(Router);
    private readonly invoiceDataService: InvoiceDataService = inject(InvoiceDataService);

    constructor() {
        this.invoiceDataService.loadInvoices().then(() => console.info('Invoices loaded'));
    }

    public createInvoice() {
        this.router.navigate(['invoice']);
    }
}
