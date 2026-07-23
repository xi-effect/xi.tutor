import { UserProfile } from '@xipkg/userprofile';
import { Button } from '@xipkg/button';
import { InfoCircle } from '@xipkg/icons';
import { formatPaymentDate } from '../../utils';
import { StatusBadge } from '../components';
import { CardContentT } from '../../types';
import { cn } from '@xipkg/utils';
import { PaymentApproveAction } from 'features.payment.approve';

export const TableCard = ({
  userData,
  userId,
  payment,
  className,
  currentUserRole,
  onViewInvoice,
}: CardContentT) => {
  const formattedDate = formatPaymentDate(payment.created_at);
  const amount = parseFloat(payment.total);

  return (
    <div
      className={cn(
        'border-border-control bg-background-surface relative flex min-h-[112px] cursor-pointer flex-col justify-between gap-2 rounded-2xl border p-4',
        className,
      )}
    >
      <div className="text-s-base text-text-secondary flex flex-row items-baseline gap-1">
        {formattedDate}
      </div>
      <UserProfile
        text={userData?.display_name || userData?.username || 'Имя не найдено'}
        size="m"
        userId={userId}
        classNameText="line-clamp-2 break-words text-text-primary"
        className="h-auto overflow-hidden"
      />
      <div className="mt-2 flex flex-row items-center gap-4">
        <h3 className="text-m-base text-text-primary font-medium">{amount} ₽</h3>
        <StatusBadge status={payment.status} withBg />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="s"
          className="text-text-secondary hover:text-text-link h-8 w-8 rounded-full border-none bg-transparent p-0 shadow-none hover:border-transparent hover:bg-transparent focus-visible:ring-0"
          onClick={() => onViewInvoice?.(payment)}
          aria-label="Просмотреть информацию о счёте"
        >
          <InfoCircle className="fill-icon-secondary h-5 w-5" />
        </Button>
        <PaymentApproveAction payment={payment} isTutor={currentUserRole === 'tutor'} />
      </div>
    </div>
  );
};
