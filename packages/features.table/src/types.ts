export type StudentT = {
  id: string;
  name: string;
  description: string;
  avatarUrl?: string;
};

export type SubjectT = {
  id: string;
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
  id: string;
  idStudent: string;
  idSubject: string;
  datePayment: string;
  amountPayment: number;
  typePayment: PaymentTypeT;
  statusPayment: PaymentStatusT;
};
