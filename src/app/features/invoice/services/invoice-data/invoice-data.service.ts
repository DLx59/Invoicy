import { Injectable, signal, WritableSignal } from '@angular/core';
import {Invoice} from "../../models/invoice.model";

@Injectable({ providedIn: 'root' })
export class InvoiceDataService {
  private invoicesSignal: WritableSignal<Array<Invoice>> = signal([]);

  async loadInvoices(): Promise<void> {
    const query = `
      SELECT
        i.id as invoiceId, i.invoiceNumber, i.issueDate, i.deadline, i.dueDate,
        i.dueAmount, i.dueVat, i.isEndOfMonth, i.isIntracommunity, i.isPaid,
        i.contractNumber, i.interventionBy, i.note, i.terms,
        c.id as clientId, c.name as clientName, c.vat as clientVat, c.reference as clientReference,
        c.street as clientStreet, c.zipCode as clientZip, c.city as clientCity, c.country as clientCountry,
        iss.id as issuerId, iss.name as issuerName, iss.vat as issuerVat, iss.reference as issuerReference,
        iss.email as issuerEmail, iss.phone as issuerPhone, iss.website as issuerWebsite,
        iss.street as issuerStreet, iss.zipCode as issuerZip, iss.city as issuerCity, iss.country as issuerCountry
      FROM invoices i
      JOIN clients c ON i.clientId = c.id
      LEFT JOIN issuers iss ON i.issuerId = iss.id
    `;
    const params: any[] = [];
    try {
      const results = await (window as any).databaseAPI?.executeQuery(query, params);
      if (!results) throw new Error('API de base de données non disponible');
      const invoices: Invoice[] = results.map((row: any) => ({
        invoiceNumber: row.invoiceNumber,
        issueDate: row.issueDate,
        deadline: row.deadline,
        dueDate: row.dueDate,
        dueAmount: row.dueAmount,
        dueVat: row.dueVat,
        isEndOfMonth: !!row.isEndOfMonth,
        isIntracommunity: !!row.isIntracommunity,
        isPaid: !!row.isPaid,
        contractNumber: row.contractNumber,
        interventionBy: row.interventionBy,
        note: row.note,
        terms: row.terms,
        client: {
          id: row.clientId,
          name: row.clientName,
          vat: row.clientVat,
          reference: row.clientReference,
          address: {
            street: row.clientStreet,
            zipCode: row.clientZip,
            city: row.clientCity,
            country: row.clientCountry
          }
        },
        issuer: {
          id: row.issuerId,
          name: row.issuerName,
          vat: row.issuerVat,
          reference: row.issuerReference,
          email: row.issuerEmail,
          phone: row.issuerPhone,
          website: row.issuerWebsite,
          address: {
            street: row.issuerStreet,
            zipCode: row.issuerZip,
            city: row.issuerCity,
            country: row.issuerCountry
          }
        },
        items: []
      }));

      this.invoicesSignal.set(invoices);
    } catch (error) {
      console.error('Erreur lors de la récupération des factures:', error);
      throw error;
    }
  }

  public getInvoices(): Array<Invoice> {
    return this.invoicesSignal();
  }
}
