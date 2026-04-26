import { RolePaymentT, RoleT } from 'common.types';
import { UserRoleT } from 'common.api';
import { PaymentApprovalFunctionT, UserData, InvoiceCardTypeT } from 'common.types';

export type InvoiceCardPropsT = {
  payment: RolePaymentT<UserRoleT>;
  currentUserRole: RoleT;
  type?: 'full' | 'short';
  variant?: InvoiceCardTypeT;
  onApprovePayment?: PaymentApprovalFunctionT['onApprovePayment'] | null;
  onViewInvoice?: ((payment: RolePaymentT<UserRoleT>) => void) | null;
  className?: string;
  withoutPaymentType?: boolean;
};

export type CardContentT = {
  withoutPaymentType?: boolean;
  type?: InvoiceCardPropsT['type'];
  payment: InvoiceCardPropsT['payment'];
  userId: number;
  userData: UserData;
  handleApprove?: InvoiceCardPropsT['onApprovePayment'];
  onViewInvoice?: InvoiceCardPropsT['onViewInvoice'];
  currentUserRole?: RoleT;
  className?: string;
};
