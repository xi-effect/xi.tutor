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
