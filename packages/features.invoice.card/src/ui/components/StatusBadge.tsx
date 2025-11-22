import { mapPaymentStatus, PaymentStatusT, getStatusColor } from 'features.table';
import { cn } from '@xipkg/utils';

interface StatusBadgeProps {
  status: PaymentStatusT;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const statusText = mapPaymentStatus[status];

  return (
    <div className={cn('text-sm font-normal', getStatusColor(status), className)}>{statusText}</div>
  );
};
