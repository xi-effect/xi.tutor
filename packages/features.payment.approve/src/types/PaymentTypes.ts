export type PaymentStatusT = 'paid' | 'processing' | 'unpaid';
export type PaymentTypeT = 'cash' | 'card';

export type PaymentT = {
  id: number;
  idStudent: number;
  idSubject: number;
  datePayment: string;
  amountPayment: number;
  typePayment: PaymentTypeT;
  statusPayment: PaymentStatusT;
};

export type InvoiceItemT = {
  name: string;
  price: string;
  quantity: number;
};

export type InvoiceT = {
  created_at: string;
  comment: string;
};

export type RecipientInvoiceT = {
  payment_type: string | null;
  status: string;
  total: string;
};

export type PaymentDataT = {
  invoice: InvoiceT;
  invoice_items: InvoiceItemT[];
  recipient_invoice: RecipientInvoiceT;
  student_id: number | null;
};
