import {Address, Invoice, InvoiceItem, InvoiceStatus} from "../../models/invoice.model";

export function mapInvoiceFromRow(row: any): Invoice {
  return {
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
    status: InvoiceStatus[row.status as keyof typeof InvoiceStatus] ?? InvoiceStatus.DRAFT,
    client: mapClientFromRow(row),
    issuer: mapIssuerFromRow(row),
    items: []
  };
}
export function mapClientFromRow(row: any): Invoice['client'] {
  return {
    id: row.clientId,
    name: row.clientName,
    vat: row.clientVat,
    reference: row.clientReference,
    address: mapAddressFromRow(row, 'client')
  };
}

export function mapIssuerFromRow(row: any): Invoice['issuer'] {
  return {
    id: row.issuerId,
    name: row.issuerName,
    vat: row.issuerVat,
    reference: row.issuerReference,
    email: row.issuerEmail,
    phone: row.issuerPhone,
    website: row.issuerWebsite,
    address: mapAddressFromRow(row, 'issuer')
  };
}

export function mapAddressFromRow(row: any, prefix: 'client' | 'issuer'): Address {
  return {
    street: row[`${prefix}Street`],
    zipCode: row[`${prefix}Zip`],
    city: row[`${prefix}City`],
    country: row[`${prefix}Country`]
  };
}

export function mapInvoiceItemFromRow(row: any): InvoiceItem {
  return {
    id: row.id,
    type: row.type,
    description: row.description,
    period: row.period,
    quantity: row.quantity,
    unitPrice: row.unitPrice,
    taxRate: row.taxRate,
    totalPriceHt: row.totalPriceHt ?? row.unitPrice * row.quantity
  };
}
