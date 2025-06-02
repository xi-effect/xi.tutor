export type StudentT = {
  id: number;
  name: string;
  description: string;
  avatarUrl?: string;
};

export type SubjectT = {
  id: number;
  name: string;
};

export type PaymentStatusT = 'paid' | 'processing' | 'unpaid';

export const mapPaymentStatus: Record<PaymentStatusT, string> = {
  paid: 'оплачен',
  processing: 'ожидает подтверждения',
  unpaid: 'ждет оплаты',
};

export type PaymentTypeT = 'cash' | 'card';

export const mapPaymentType: Record<PaymentTypeT, string> = {
  cash: 'наличные',
  card: 'перевод',
};

export type PaymentT = {
  id: number;
  idStudent: number;
  idSubject: number;
  datePayment: string;
  amountPayment: number;
  typePayment: PaymentTypeT;
  statusPayment: PaymentStatusT;
};
