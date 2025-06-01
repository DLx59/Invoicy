import {Injectable, signal, WritableSignal} from '@angular/core';
import {ClientInfo, Invoice} from "../../../invoice/models/invoice.model";
import {
  selectClientInfosQuery,
  selectDraftInvoicesQuery,
  selectInvoiceByNumberQuery,
  selectInvoiceItemsByIdQuery,
  selectInvoicesQuery
} from "./invoice-queries";
import {mapClientFromRow, mapInvoiceFromRow, mapInvoiceItemFromRow} from "./invoice-data-mapper";

@Injectable({providedIn: 'root'})
export class InvoiceDataService {
  private invoices: WritableSignal<Array<Invoice>> = signal([]);
  private draftInvoices: WritableSignal<Array<Invoice>> = signal([]);
  private isLoading: WritableSignal<boolean> = signal(false);

  public getIsLoading(): boolean {
    return this.isLoading();
  }

  async loadInvoices(): Promise<void> {
    this.isLoading.set(true);
    try {
      const rows = await this.getRowsFromDataBase(selectInvoicesQuery);
      const invoices: Invoice[] = [];

      for (const row of rows) {
        const invoice = mapInvoiceFromRow(row);
        const itemsRows = await this.getRowsFromDataBase(
          selectInvoiceItemsByIdQuery,
          [invoice.invoiceNumber]
        );
        invoice.items = itemsRows.map(mapInvoiceItemFromRow);
        invoices.push(invoice);
      }

      this.invoices.set(invoices);
    } catch (error) {
      console.error('Erreur lors de la récupération des factures :', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadInvoiceById(id: string): Promise<Invoice> {
    const rows = await this.getRowsFromDataBase(selectInvoiceByNumberQuery, [id]);
    if (rows.length === 0) {
      throw new Error('Facture introuvable');
    }

    const invoice = mapInvoiceFromRow(rows[0]);
    const itemsRows = await this.getRowsFromDataBase(
      selectInvoiceItemsByIdQuery,
      [id]
    );
    invoice.items = itemsRows.map(mapInvoiceItemFromRow);
    console.warn(invoice);
    return invoice;
  }

  async loadClients(searchTerms: string = ''): Promise<Array<ClientInfo>> {
    let query = selectClientInfosQuery;
    const params: any[] = [];

    if (searchTerms) {
      query += `
      WHERE c.name      LIKE ?
         OR c.reference LIKE ?
    `;
      params.push(`%${searchTerms}%`, `%${searchTerms}%`);
    }

    const rows = await this.getRowsFromDataBase(query, params);
    return rows.map(mapClientFromRow);
  }

  async loadDraftInvoices(): Promise<void> {
    this.isLoading.set(true);
    try {
      const rows = await this.getRowsFromDataBase(selectDraftInvoicesQuery);
      const invoices: Invoice[] = [];

      for (const row of rows) {
        const invoice = mapInvoiceFromRow(row);
        const itemsRows = await this.getRowsFromDataBase(
          selectInvoiceItemsByIdQuery,
          [invoice.invoiceNumber]
        );
        invoice.items = itemsRows.map(mapInvoiceItemFromRow);
        invoices.push(invoice);
      }

      this.draftInvoices.set(invoices);
    } catch (error) {
      console.error('Erreur lors de la récupération des factures :', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  public getInvoices(): Array<Invoice> {
    console.warn(this.invoices())
    return this.invoices();
  }

  public getDraftInvoices(): Array<Invoice> {
    return this.draftInvoices();
  }

  private async getRowsFromDataBase(query: string, params: any[] = []) {
    const rows = await (window as any).databaseAPI?.executeQuery(query, params);
    if (!rows) {
      throw new Error('API de base de données non disponible');
    }
    return rows;
  }
}
