import {Injectable, signal, WritableSignal} from '@angular/core';
import {Invoice} from "../../models/invoice.model";
import {selectInvoiceItemsByIdQuery, selectInvoicesQuery} from "./invoice-queries";
import {mapInvoiceFromRow, mapInvoiceItemFromRow} from "./invoice-data-mapper";

@Injectable({providedIn: 'root'})
export class InvoiceDataService {
  private invoices: WritableSignal<Array<Invoice>> = signal([]);

  async loadInvoices(): Promise<void> {

    const params: any[] = [];
    try {
      const rows = await (window as any).databaseAPI?.executeQuery(selectInvoicesQuery, params);
      if (!rows) {
        throw new Error('API de base de données non disponible');
      }
      const invoices: Invoice[] = [];

      for (const row of rows) {
        const invoice = mapInvoiceFromRow(row);
        const itemsRows = await (window as any).databaseAPI?.executeQuery(selectInvoiceItemsByIdQuery, [invoice.invoiceNumber]);
        invoice.items = itemsRows.map(mapInvoiceItemFromRow);
        invoices.push(invoice);
      }

      console.warn(invoices);

      this.invoices.set(invoices);
    } catch (error) {
      console.error('Erreur lors de la récupération des factures:', error);
      throw error;
    }
  }

  public getInvoices(): Array<Invoice> {
    return this.invoices();
  }
}
