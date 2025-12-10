import { mapPaymentStatus } from 'common.types';
import { PaymentApproveAction, ApprovePaymentPropsT } from 'features.payment.approve';

export const StatusCell = ({ payment, status, isTutor = false }: ApprovePaymentPropsT) => {
  const statusText = mapPaymentStatus[status];

  if (!statusText) {
    throw new Error('Paiment Status not found');
  }

  return (
    <div className="flex flex-row items-center justify-between gap-8">
      <PaymentApproveAction payment={payment} isTutor={isTutor} />
    </div>
  );
};
