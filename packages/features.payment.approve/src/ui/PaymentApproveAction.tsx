import { useState } from 'react';
import { PaymentApproveButton, PaymentApproveModal } from '.';
import { PaymentApproveActionPropsT } from '../types';

export const PaymentApproveAction = ({ payment, isTutor, type }: PaymentApproveActionPropsT) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleModalState = () => setIsOpen((prev) => !prev);

  if (!payment) return null;

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
