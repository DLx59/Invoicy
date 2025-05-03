export interface Address {
  street: string;
  zipCode: string;
  city: string;
  country: string;
}

export interface CompanyInfo {
  id: string;
  name: string;
  address: Address;
  vat: string;
  reference?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface ClientInfo {
  id: string;
  name: string;
  address: Address;
  vat?: string;
  reference?: string;
}

export interface InvoiceItem {
  id: string;
  type: string;
  description: string;
  period: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  totalPriceHt?: number;
}

export interface Invoice {
  invoiceNumber: string;
  issueDate: string;
  deadline: number;
  dueDate: string;
  contractNumber: string;

  isEndOfMonth: boolean;
  isIntracommunity: boolean;
  isPaid: boolean;

  dueAmount: number;
  dueVat: number;

  interventionBy: string;

  issuer: CompanyInfo;
  client: ClientInfo;
  items: InvoiceItem[];

  status: InvoiceStatus
  note?: string;
  terms?: string;
}


export interface Total {
  net: number;
  vat: number;
  amount: number;
}

export enum InvoiceStatus {
  DRAFT = 'Brouillon',
  PENDING = 'En attente',
  PAID = 'Payé',
  CANCELLED = 'Annulé'
}
