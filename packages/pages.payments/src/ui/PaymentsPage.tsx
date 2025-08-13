import { useState } from 'react';
import { Button } from '@xipkg/button';
import { Plus } from '@xipkg/icons';
import { InvoiceModal } from 'features.invoice';
import { PaymentApproveModal } from 'features.payment.approve';
import { PaymentT } from 'features.table';
import { Header } from './Header';
import { TabsComponent } from './TabsComponent';

export const PaymentsPage = () => {
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentApproveModalOpen, setIsPaymentApproveModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentT | null>(null);

  const onOpenInvoiceModal = () => {
    setIsInvoiceModalOpen(true);
  };

  const onOpenPaymentApproveModal = (payment: PaymentT) => {
    setSelectedPayment(payment);
    setIsPaymentApproveModalOpen(true);
  };

  return (
    <div className="flex flex-col justify-between gap-6 pl-4">
      <div className="flex flex-col gap-6 max-md:gap-4">
        <Header onCreateInvoice={onOpenInvoiceModal} />
        <TabsComponent onApprovePayment={onOpenPaymentApproveModal} />
      </div>

      <div className="xs:hidden flex flex-row items-center justify-end">
        <Button
          size="small"
          className="fixed right-4 bottom-10 z-50 flex h-12 w-12 items-center justify-center rounded-xl"
        >
          <Plus className="fill-brand-0" />
        </Button>
      </div>
      {isPaymentApproveModalOpen && (
        <PaymentApproveModal
          open={isPaymentApproveModalOpen}
          onOpenChange={setIsPaymentApproveModalOpen}
          paymentDetails={selectedPayment}
        />
      )}
      {isInvoiceModalOpen && (
        <InvoiceModal open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen} />
      )}
    </div>
  );
};
