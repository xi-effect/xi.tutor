import clsx from 'clsx';
import { getStatusColor } from '../../utils';
import { mapPaymentStatus } from 'common.types';
import { PaymentApproveButton, ApprovePaymentPropsT } from 'features.payment.approve';

export const StatusCell = ({
  status,
  onApprovePayment,
  isTutor = false,
  id,
}: ApprovePaymentPropsT) => {
  const statusText = mapPaymentStatus[status];

  if (!statusText) {
    throw new Error('Paiment Status not found');
  }

  return (
    <div className="flex flex-row items-center justify-between gap-8">
      <div className={clsx('font-normal', 'text-m-base', getStatusColor(status))}>{statusText}</div>
      <PaymentApproveButton
        status={status}
        onApprovePayment={onApprovePayment}
        isTutor={isTutor}
        id={id}
      />
    </div>
  );
};
