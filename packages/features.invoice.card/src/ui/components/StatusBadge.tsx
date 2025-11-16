import { Badge } from '@xipkg/badge';
import { mapPaymentStatus, PaymentStatusT } from 'features.table';

const mapPaymentStyles = {
  complete: {
    variant: 'success',
    className: 'text-green-80 bg-green-0',
  },
  wf_sender_confirmation: {
    variant: 'warning',
    className: 'text-orange-80 bg-orange-0',
  },
  wf_receiver_confirmation: {
    variant: 'default',
    className: 'text-brand-80 bg-brand-0',
  },
};

export const StatusBadge = ({ status }: { status: PaymentStatusT }) => {
  const statusText = mapPaymentStatus[status];
  const config = mapPaymentStyles[status];

  if (!config) return null;

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} h-auto rounded-lg border-none px-2 py-1 text-center`}
    >
      {statusText}
    </Badge>
  );
};
