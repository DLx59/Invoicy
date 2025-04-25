export interface Invoice {
  invoiceNumber: string;
  issueDate: string;
  deadline: number;
  dueDate: string;
  contractNumber: string;
  client: {
    name: string;
    address: string;
    reference: string;
  };
  items: InvoiceItem[];
  issuer: {
    name: string;
    address: string;
    phone: string;
    website: string;
    email: string;
    reference: string;
  };
  interventionBy: string;
  note?: string;
  terms?: string;
}

export interface InvoiceItem {
  id: string;
  type: string
  description: string;
  period: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  totalPriceHt?: number;
}
