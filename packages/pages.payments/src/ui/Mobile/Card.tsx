import { Button } from '@xipkg/button';
import { Edit, Trash } from '@xipkg/icons';
import { formatDate } from '../../utils';
import {
  mapPaymentStatus,
  RolePaymentT,
  type RoleT,
  getStatusColor,
  useUserByRole,
} from 'features.table';
import { UserProfile } from '@xipkg/userprofile';
import { cn } from '@xipkg/utils';
import { type TabsComponentPropsT } from '../../types';
import { UserRoleT } from '../../../../common.api/src/types';

export type CardPropsT = {
  payment: RolePaymentT<UserRoleT>;
  userId: number;
  currentUserRole: RoleT;
  onApprovePayment: TabsComponentPropsT['onApprovePayment'];
};

export const Card = ({ payment, userId, currentUserRole, onApprovePayment }: CardPropsT) => {
  const { created_at, total, status } = { ...payment };
  const statusText = mapPaymentStatus[payment.status];
  const userData = useUserByRole(currentUserRole === 'student' ? 'tutor' : 'student', userId);
  const username = userData.data?.username;

  const handleApprove = () => onApprovePayment(payment);

  return (
    <div className="border-gray-30 bg-gray-0 relative flex min-h-[112px] cursor-pointer flex-col justify-between gap-2 rounded-2xl border p-4">
      <div className="flex flex-row items-baseline gap-1">{formatDate(created_at)}</div>
      <UserProfile
        text={username || 'Имя не найдено'}
        size="m"
        userId={userId}
        className="flex-1"
      />
      <div className="mt-2 flex flex-row items-baseline gap-1">
        <span className="text-brand-100 text-m-base font-normal">{total} </span>
        <span className="text-brand-40 text-xs-base font-normal">₽</span>
        <div className={cn('text-m-base ml-4 font-normal', getStatusColor(status))}>
          {statusText}
        </div>
      </div>
      {status !== 'complete' && (
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
      )}
    </div>
  );
};
