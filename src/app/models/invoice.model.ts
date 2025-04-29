export interface Invoice {
  client: {
    address: string;
    id: string;
    name: string;
    reference?: string;
    vat?: string
  };
  contractNumber: string;
  deadline: number;
  dueDate: string;
  interventionBy: string;
  invoiceNumber: string;
  issueDate: string;
  issuer: {
    address: string;
    email?: string;
    id: string;
    name: string;
    phone?: string;
    reference?: string;
    vat: string
    website?: string;
  };
  items: InvoiceItem[];
  note?: string;
  terms?: string;

}

export interface InvoiceItem {
  description: string;
  id: string;
  period: string;
  quantity: number;
  taxRate: number;
  totalPriceHt?: number;
  type: string
  unitPrice: number;
}
