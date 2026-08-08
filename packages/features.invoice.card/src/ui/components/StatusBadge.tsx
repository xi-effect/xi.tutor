import { getStatusColor } from 'common.services';
import { PaymentStatusT } from 'common.types';
import { cn } from '@xipkg/utils';
import { Badge } from '@xipkg/badge';
import { Card, Check, Clock } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';

const statusIcons: Record<PaymentStatusT, React.ReactNode> = {
  wf_receiver_confirmation: <Clock className="fill-icon-brand size-4 shrink-0" />,
  wf_sender_confirmation: <Card className="fill-tag-orange-accent size-4 shrink-0" />,
  complete: <Check className="fill-status-success-text size-4 shrink-0" />,
};

const baseClassName = 'rounded-lg border-none px-2 py-1 text-s-base font-medium shrink-0 w-fit';

type StatusBadgePropsT = {
  status: PaymentStatusT;
  className?: string;
  withBg?: boolean;
};

export const StatusBadge = ({ status, withBg = true, className }: StatusBadgePropsT) => {
  const { t } = useTranslation('invoiceCard');
  const statusText = t(`status.${status}`);

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
