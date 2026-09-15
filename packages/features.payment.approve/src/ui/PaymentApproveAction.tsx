import { useState } from 'react';
import { PaymentApproveButton, PaymentApproveModal } from '.';
import { PaymentApproveActionPropsT } from '../types';
import { useIsClassroomOnPause } from 'common.services';

export const PaymentApproveAction = ({ payment, isTutor, type }: PaymentApproveActionPropsT) => {
  const [isOpen, setIsOpen] = useState(false);
  const isClassroomPaused = useIsClassroomOnPause(payment?.classroom_id);

  const handleModalState = () => setIsOpen((prev) => !prev);

  if (!payment || isClassroomPaused) return null;

  return (
    <>
      <PaymentApproveButton
        status={payment.status}
        onApprovePayment={handleModalState}
        isTutor={isTutor}
        id={payment.id}
        classroomId={payment.classroom_id}
        type={type}
      />
      {isOpen && payment && (
        <PaymentApproveModal
          open={isOpen}
          onOpenChange={handleModalState}
          paymentDetails={payment}
          recipientInvoiceId={payment.id}
        />
      )}
    </>
  );
};
