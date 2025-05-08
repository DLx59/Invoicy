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

export const DEFAULT_INVOICE: Invoice = {
  invoiceNumber: '',
  issueDate: new Date().toISOString(),
  deadline: 0,
  dueAmount: 0,
  dueVat: 0,
  dueDate: new Date().toISOString(),
  isEndOfMonth: false,
  isIntracommunity: false,
  isPaid: false,
  contractNumber: '',
  client: {
    id: '',
    name: '',
    address: {
      city: '',
      country: '',
      street: '',
      zipCode: ''
    },
    reference: ''
  },
  status: InvoiceStatus.DRAFT,
  items: [{
    id: crypto.randomUUID(),
    type: '',
    description: '',
    period: '',
    quantity: 0,
    unitPrice: 0,
    taxRate: 0.21,
    totalPriceHt: 0
  }],
  issuer: {
    id: '',
    name: '',
    address: {
      city: '',
      country: '',
      street: '',
      zipCode: ''
    },
    phone: '',
    website: '',
    email: '',
    reference: '',
    vat: ''
  },
  interventionBy: '',
  note: '',
  terms: ''
}
