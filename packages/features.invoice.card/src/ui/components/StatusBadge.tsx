import { getStatusColor } from 'common.services';
import { PaymentStatusT, mapPaymentStatus } from 'common.types';
import { cn } from '@xipkg/utils';
import { Badge } from '@xipkg/badge';
import { Card, Check, Clock } from '@xipkg/icons';

const statusIcons: Record<PaymentStatusT, React.ReactNode> = {
  wf_receiver_confirmation: <Clock className="fill-brand-80 size-4 shrink-0 dark:fill-[#4554C9]" />,
  wf_sender_confirmation: <Card className="fill-orange-80 size-4 shrink-0 dark:fill-[#B85727]" />,
  complete: <Check className="fill-green-80 size-4 shrink-0 dark:fill-[#2E842E]" />,
};

const baseClassName = 'rounded-lg border-none px-2 py-1 text-s-base font-medium shrink-0 w-fit';

type StatusBadgePropsT = {
  status: PaymentStatusT;
  className?: string;
  withBg?: boolean;
};

export const StatusBadge = ({ status, withBg = true, className }: StatusBadgePropsT) => {
  const statusText = mapPaymentStatus[status];

  return (
    <Badge
      className={cn(
        'flex flex-row items-center gap-2 border-transparent',
        baseClassName,
        getStatusColor(status, withBg),
        className,
      )}
    >
      {statusIcons[status]}
      {statusText}
    </Badge>
  );
};
