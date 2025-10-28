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
