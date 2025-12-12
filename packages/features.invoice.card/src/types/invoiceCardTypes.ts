import { RolePaymentT, RoleT } from 'common.types';
import { UserRoleT } from 'common.api';
import { PaymentApprovalFunctionT, UserData, InvoiceCardTypeT } from 'common.types';

export type InvoiceCardPropsT = {
  payment: RolePaymentT<UserRoleT>;
  currentUserRole: RoleT;
  type?: 'full' | 'short';
  variant?: InvoiceCardTypeT;
  onApprovePayment?: PaymentApprovalFunctionT['onApprovePayment'] | null;
  className?: string;
};

export type CardContentT = {
  type?: InvoiceCardPropsT['type'];
  payment: InvoiceCardPropsT['payment'];
  userId: number;
  userData: UserData;
  handleApprove?: InvoiceCardPropsT['onApprovePayment'];
  currentUserRole?: RoleT;
  className?: string;
};
