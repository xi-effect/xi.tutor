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
        'border-gray-30 bg-gray-0 relative flex min-h-[112px] cursor-pointer flex-col justify-between gap-2 rounded-2xl border p-4',
        className,
      )}
    >
      <div className="flex flex-row items-baseline gap-1">{formattedDate}</div>
      <UserProfile
        text={userData?.display_name || userData?.username || 'Имя не найдено'}
        size="m"
        userId={userId}
        classNameText="line-clamp-2 break-words"
        className="h-auto overflow-hidden"
      />
      <div className="mt-2 flex flex-row items-center gap-4">
        <div className="flex flex-row items-baseline gap-0.5">
          <span className="text-brand-100 text-m-base font-normal">{amount}</span>
          <span className="text-brand-40 text-xs-base font-normal">₽</span>
        </div>
        <StatusBadge status={payment.status} />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="s"
          className="text-gray-60 hover:text-brand-100 h-8 w-8 rounded-full border-none bg-transparent p-0 shadow-none hover:border-transparent hover:bg-transparent focus-visible:ring-0"
          onClick={() => onViewInvoice?.(payment)}
          aria-label="Просмотреть информацию о счёте"
        >
          <InfoCircle className="h-5 w-5" />
        </Button>
        <PaymentApproveAction payment={payment} isTutor={currentUserRole === 'tutor'} />
      </div>
    </div>
  );
};
