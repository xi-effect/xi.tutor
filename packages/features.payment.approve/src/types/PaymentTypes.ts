import { PaymentStatusT, RolePaymentT, InvoiceCardTypeT } from 'common.types';
import { UserRoleT } from 'common.api';

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

export type ApprovePaymentPropsT = {
  payment: RolePaymentT<UserRoleT> | null;
  status: PaymentStatusT;
  isTutor?: boolean;
  onApprovePayment: () => void;
  id?: number;
};

export type PaymentApproveActionPropsT = Pick<ApprovePaymentPropsT, 'payment' | 'isTutor'>;

export type PaymentApproveButtonPropsT = Omit<ApprovePaymentPropsT, 'payment'> & {
  type?: InvoiceCardTypeT;
  classroomId?: number;
};
