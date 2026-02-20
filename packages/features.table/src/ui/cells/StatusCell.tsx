import { PaymentApproveAction, ApprovePaymentPropsT } from 'features.payment.approve';
import { StatusBadge } from 'features.invoice.card';

export const StatusCell = ({ payment, isTutor = false }: ApprovePaymentPropsT) => {
  if (!payment) {
    return null;
  }

  return (
    <div className="flex flex-row items-center justify-between gap-4">
      <StatusBadge status={payment.status} className="p-0" />
      <PaymentApproveAction payment={payment} isTutor={isTutor} type="table" />
    </div>
  );
};
