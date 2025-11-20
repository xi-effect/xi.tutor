import { RolePaymentT, RoleT } from 'features.table';
import { UserRoleT } from 'common.api';
import { PaymentApprovalFunctionT, UserData } from 'common.types';

export type InvoiceCardPropsT = {
  payment: RolePaymentT<UserRoleT>;
  currentUserRole: RoleT;
  type?: 'full' | 'short';
  variant?: 'default' | 'table';
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
