import {Component, computed, effect, inject, signal, Signal, WritableSignal} from '@angular/core';
import {Invoice} from "../../models/invoice.model";
import {TableModule} from "primeng/table";
import {InvoiceDataService} from "../../../billing/services/invoice-data/invoice-data.service";
import {InvoiceTableComponent} from "../invoice-table/invoice-table.component";

@Component({
  selector: 'app-invoice-listing',
  imports: [
    TableModule,
    InvoiceTableComponent
  ],
  templateUrl: './invoice-listing.component.html',
  styleUrl: './invoice-listing.component.scss'
})
export class InvoiceListingComponent {
  public invoices: WritableSignal<Array<Invoice>> = signal<Array<Invoice>>([]);
  private readonly invoiceDataService: InvoiceDataService = inject(InvoiceDataService);
  public isLoading: Signal<boolean> = computed(() => this.invoiceDataService.getIsLoading());

  constructor() {
    effect(() => {
      this.invoices.set(this.invoiceDataService.getInvoices())
    });
  }
}
