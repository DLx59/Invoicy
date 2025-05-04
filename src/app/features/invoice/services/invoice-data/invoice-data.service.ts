import {Injectable, signal, WritableSignal} from '@angular/core';
import {Invoice} from "../../models/invoice.model";
import {
  selectDraftInvoicesQuery,
  selectInvoiceByNumberQuery,
  selectInvoiceItemsByIdQuery,
  selectInvoicesQuery
} from "./invoice-queries";
import {mapInvoiceFromRow, mapInvoiceItemFromRow} from "./invoice-data-mapper";

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
      this.invoices.set(invoices);
    } catch (error) {
      console.error('Erreur lors de la récupération des factures:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadInvoiceById(id: string): Promise<Invoice> {
    const rows = await (window as any).databaseAPI?.executeQuery(selectInvoiceByNumberQuery, [id]);
    if (!rows || rows.length === 0) throw new Error('Facture introuvable');
    const invoice = mapInvoiceFromRow(rows[0]);
    const itemsRows = await (window as any).databaseAPI?.executeQuery(selectInvoiceItemsByIdQuery, [id]);
    invoice.items = itemsRows.map(mapInvoiceItemFromRow);
    console.warn(invoice)
    return invoice;
  }

  async loadDraftInvoices() {
    this.isLoading.set(true);
    const params: any[] = [];
    try {
      const rows = await (window as any).databaseAPI?.executeQuery(selectDraftInvoicesQuery, params);
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
      this.draftInvoices.set(invoices);
    } catch (error) {
      console.error('Erreur lors de la récupération des factures:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  public getInvoices(): Array<Invoice> {
    return this.invoices();
  }

  public getDraftInvoices(): Array<Invoice> {
    return this.draftInvoices();
  }
}
