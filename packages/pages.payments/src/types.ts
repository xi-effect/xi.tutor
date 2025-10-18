import { RolePaymentT } from 'features.table';

export type ModalTemplatePropsT = {
  isOpen: boolean;
  onClose: () => void;
  type?: 'add' | 'edit';
  name?: string;
  price?: number;
  id?: number;
};

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

export type TabsComponentPropsT = {
  onApprovePayment: (payment: RolePaymentT) => void;
};
