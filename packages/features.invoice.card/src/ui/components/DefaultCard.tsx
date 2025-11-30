import { UserProfile } from '@xipkg/userprofile';
import { renderIcon, formatPaymentDate } from '../../utils';
import { getUserAvatarUrl } from 'common.utils';
import { StatusBadge } from '../components';
import { CardContentT } from '../../types';
import { cn } from '@xipkg/utils';

export const DefaultCard = ({ type, userData, userId, payment, className }: CardContentT) => {
  const formattedDate = formatPaymentDate(payment.created_at);
  const amount = parseFloat(payment.total);

  return (
    <div
      className={cn(
        'border-gray-60 flex min-h-[130px] min-w-[350px] flex-col items-start justify-start gap-4 rounded-2xl border p-4',
        className,
      )}
    >
      <div className="flex w-full flex-row items-start justify-between gap-2">
        <StatusBadge status={payment.status} withBg={true} className="text-right" />
        {payment.payment_type && renderIcon(payment.payment_type)}
      </div>
      {type === 'full' && (
        <UserProfile
          size="m"
          userId={userId}
          text={userData?.display_name || userData?.username || 'Имя не найдено'}
          src={getUserAvatarUrl(userId)}
          classNameText="line-clamp-2 break-words"
          className="h-auto overflow-hidden"
        />
      )}
      <div className="text-s-base text-gray-80 mt-auto flex w-full flex-col gap-1 font-medium">
        <span>{formattedDate}</span>
        <div className="flex flex-row items-baseline gap-0.5">
          <h3 className="text-h6 font-medium text-gray-100">{amount}</h3>
          <span className="text-m-base text-gray-60 font-medium">₽</span>
        </div>
      </div>
    </div>
  );
};
