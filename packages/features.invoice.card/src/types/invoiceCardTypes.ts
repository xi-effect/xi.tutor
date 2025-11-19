import { RolePaymentT, RoleT } from 'features.table';
import { UserRoleT } from 'common.api';
import { PaymentApprovalFunctionT, UserData } from 'common.types';

export type InvoiceCardProps = {
  payment: RolePaymentT<UserRoleT>;
  currentUserRole: RoleT;
  type?: 'full' | 'short';
  variant?: 'default' | 'table';
  onApprovePayment?: PaymentApprovalFunctionT['onApprovePayment'] | null;
};

export type CardContentT = {
  type?: InvoiceCardProps['type'];
  payment: InvoiceCardProps['payment'];
  userId: number;
  userData: UserData;
  handleApprove?: InvoiceCardProps['onApprovePayment'];
  currentUserRole?: RoleT;
};
