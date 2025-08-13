import { ScrollArea } from '@xipkg/scrollarea';
import { payments, PaymentT } from 'features.table';

import { Card } from './Card';

export type CardsListProps = {
  onApprovePayment?: (payment: PaymentT) => void;
};

export const CardsList = ({ onApprovePayment }: CardsListProps) => {
  return (
    <ScrollArea className="h-[calc(100vh-204px)] w-full pr-4">
      <div className="max-xs:gap-4 grid grid-cols-1 gap-3 min-[550px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {payments.map((payment, index) => (
          <Card key={index} {...payment} onApprovePayment={() => onApprovePayment?.(payment)} />
        ))}
      </div>
    </ScrollArea>
  );
};
