import { UserProfile } from '@xipkg/userprofile';
import { formatPaymentDate } from '../../utils';
import { StatusBadge } from '../components';
// import { Button } from '@xipkg/button';
// import { Edit, Trash } from '@xipkg/icons';
import { CardContentT } from '../../types';
import { cn } from '@xipkg/utils';

export const TableCard = ({ userData, userId, payment, className }: CardContentT) => {
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
      {/* Кнопка подтверждения оплаты и удаления/редактирования пока скрыты */}
      {/* {payment.status !== 'complete' && (
            <Button
              variant="ghost"
              size="s"
              className="text-brand-100 bg-brand-0 hover:bg-brand-20/40 mt-2 rounded-lg"
              onClick={handleApprove}
            >
              Подтвердить
            </Button>
          )}
          {currentUserRole === 'tutor' && (
            <div className="absolute top-4 right-4 flex flex-col items-center justify-between gap-2">
              <Button className="size-8 rounded-lg p-0" variant="ghost" size="s">
                <Trash className="fill-gray-60 size-4" />
              </Button>
              <Button className="size-8 rounded-lg p-0" variant="ghost" size="s">
                <Edit className="fill-gray-60 size-4" />
              </Button>
            </div>
          )} */}
    </div>
  );
};
