import { UserProfile } from '@xipkg/userprofile';
import { renderIcon } from '../../utils';
import { getUserAvatarUrl } from 'common.utils';
import { StatusBadge } from '../components';
import { CardContentT } from '../../types';
import { cn } from '@xipkg/utils';
import { PaymentApproveAction } from 'features.payment.approve';

export const DefaultCard = ({
  type,
  userData,
  userId,
  payment,
  className,
  currentUserRole,
  withoutPaymentType = false,
}: CardContentT) => {
  const amount = parseFloat(payment.total);

  return (
    <div
      className={cn(
        'border-gray-30 hover:border-brand-80 flex min-h-[130px] w-[260px] min-w-[260px] flex-1 flex-col items-start justify-start gap-4 rounded-2xl border px-5 py-4 transition-all duration-200 ease-linear xl:w-[280px] xl:min-w-[280px]',
        className,
      )}
    >
      <div className="flex w-full flex-row items-start justify-between gap-2">
        <StatusBadge status={payment.status} withBg={true} className="text-right" />
        {payment.payment_type && !withoutPaymentType && renderIcon(payment.payment_type)}
      </div>
      {type === 'full' && (
        <div className="flex w-full flex-row items-center justify-between gap-2">
          <UserProfile
            size="m"
            userId={userId}
            text={userData?.display_name || userData?.username || 'Имя не найдено'}
            src={getUserAvatarUrl(userId)}
            classNameText="line-clamp-2 break-words"
            className="h-auto overflow-hidden"
          />
          <div className="flex flex-row items-baseline gap-0.5">
            <h3 className="text-m-base font-medium text-gray-100">{amount} ₽</h3>
          </div>
        </div>
      )}
      <div className="text-s-base text-gray-80 mt-auto flex w-full flex-col gap-1 font-medium">
        <PaymentApproveAction payment={payment} isTutor={currentUserRole === 'tutor'} />
      </div>
    </div>
  );
};
