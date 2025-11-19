import { UserProfile } from '@xipkg/userprofile';
import { renderIcon, formatPaymentDate } from '../../utils';
import { getUserAvatarUrl } from 'common.utils';
import { StatusBadge } from '../components';
import { CardContentT } from '../../types';

export const DefaultCard = ({ type, userData, userId, payment }: CardContentT) => {
  const formattedDate = formatPaymentDate(payment.created_at);
  const amount = parseFloat(payment.total);

  return (
    <div className="border-gray-60 flex min-h-[130px] min-w-[350px] flex-col items-start justify-start gap-2 rounded-2xl border p-4">
      {type === 'full' && (
        <div className="flex w-full flex-row items-start justify-between gap-2">
          <UserProfile
            size="m"
            userId={userId}
            text={userData?.display_name || userData?.username || 'Имя не найдено'}
            src={getUserAvatarUrl(userId)}
            classNameText="line-clamp-2 break-words"
            className="h-auto overflow-hidden"
          />
          <StatusBadge status={payment.status} className="text-right" />
        </div>
      )}
      <div className="text-s-base text-gray-80 mt-auto flex w-full justify-between font-medium">
        <span>{formattedDate}</span>
        {type === 'short' && payment.payment_type && renderIcon(payment.payment_type)}
      </div>
      <div className="flex flex-row items-baseline gap-0.5">
        <h3 className="text-h6 font-medium text-gray-100">{amount}</h3>
        <span className="text-m-base text-gray-60 font-medium">₽</span>
      </div>
    </div>
  );
};
