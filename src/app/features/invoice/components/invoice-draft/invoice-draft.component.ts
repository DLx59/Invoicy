import {Component, computed, effect, inject, Signal, signal, WritableSignal} from '@angular/core';
import {Invoice} from "../../models/invoice.model";
import {InvoiceDataService} from "../../../billing/services/invoice-data/invoice-data.service";
import {InvoiceTableComponent} from "../invoice-table/invoice-table.component";

@Component({
  selector: 'app-invoice-draft',
  imports: [
    InvoiceTableComponent
  ],
  templateUrl: './invoice-draft.component.html',
  styleUrl: './invoice-draft.component.scss'
})
export class InvoiceDraftComponent {
  public invoices: WritableSignal<Array<Invoice>> = signal<Array<Invoice>>([]);
  private readonly invoiceDataService: InvoiceDataService = inject(InvoiceDataService);
  public isLoading: Signal<boolean> = computed(() => this.invoiceDataService.getIsLoading());

  constructor() {
    effect(() => {
      this.invoices.set(this.invoiceDataService.getDraftInvoices())
    });
  }
}
