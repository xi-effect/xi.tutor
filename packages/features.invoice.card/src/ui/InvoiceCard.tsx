import { UserProfile } from '@xipkg/userprofile';
import { RolePaymentT, useUserByRole, RoleT, PaymentTypeT } from 'features.table';
import { UserRoleT } from 'common.api';
import { formatPaymentDate } from '../utils';
import { StatusBadge } from './components';
import { RubbleCircle, Card } from '@xipkg/icons';

export type InvoiceCardProps = {
  payment: RolePaymentT<UserRoleT>;
  currentUserRole: RoleT;
  type?: 'full' | 'short';
};

const renderIcon = (paymentType: PaymentTypeT) => {
  switch (paymentType) {
    case 'cash':
      return <RubbleCircle />;
    case 'transfer':
      return <Card />;
    default:
      return null;
  }
};

export const InvoiceCard = ({ payment, currentUserRole, type = 'full' }: InvoiceCardProps) => {
  const formattedDate = formatPaymentDate(payment.created_at);
  const amount = parseFloat(payment.total);

  console.log('payment', payment);

  const userId =
    currentUserRole === 'student'
      ? (payment as { tutor_id: number }).tutor_id
      : (payment as { student_id: number }).student_id;

  const userRole = currentUserRole === 'tutor' ? 'student' : 'tutor';
  const userData = useUserByRole(userRole, userId);
  const displayName = userData.data?.display_name;
  const username = userData.data?.username;

  return (
    <div className="border-gray-60 flex min-h-[130px] min-w-[350px] flex-col items-start justify-start gap-2 rounded-2xl border p-4">
      {type === 'full' && (
        <div className="flex w-full flex-row items-start justify-between gap-2">
          <UserProfile
            size="m"
            userId={userId}
            text={displayName || username || 'Имя не найдено'}
            src={`https://api.sovlium.ru/files/users/${userId}/avatar.webp`}
          />
          <StatusBadge status={payment.status} />
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
