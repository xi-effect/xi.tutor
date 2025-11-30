import { mapPaymentStatus, PaymentStatusT, getStatusColor } from 'features.table';
import { cn } from '@xipkg/utils';
import { Badge } from '@xipkg/badge';

interface StatusBadgeProps {
  status: PaymentStatusT;
  className?: string;
  withBg?: boolean;
}

export const StatusBadge = ({ status, withBg = false, className }: StatusBadgeProps) => {
  const statusText = mapPaymentStatus[status];

  return (
    <Badge className={cn('text-sm font-normal', getStatusColor(status, withBg), className)}>
      {statusText}
    </Badge>
  );
};
