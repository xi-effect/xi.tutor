export type PaymentPropsT = {
  id: number;
  idStudent: number;
  idSubject: number;
  datePayment: string;
  amountPayment: number;
  typePayment: 'cash' | 'card';
  statusPayment: 'paid' | 'processing' | 'unpaid';
  last_opened_at: string;
};
