export interface Invoice {
  client: {
    address: Address;
    id: string;
    name: string;
    reference?: string;
    vat?: string
  };
  contractNumber: string;
  deadline: number;
  duAmount: number;
  dueDate: string;
  isEndOfMonth: boolean;
  interventionBy: string;
  invoiceNumber: string;
  isPaid: boolean;
  issueDate: string;
  issuer: {
    address: Address;
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

export interface Address {
  street: string;
  city: string;
  country: string;
  zipCode: string;
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
