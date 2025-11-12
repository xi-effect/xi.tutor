import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import {
  RolePaymentT,
  useUserByRole,
  RoleT,
  mapPaymentStatus,
  getStatusColor,
} from 'features.table';
import { UserRoleT } from 'common.api';
import { UserProfile } from '@xipkg/userprofile';
import { cn } from '@xipkg/utils';

dayjs.locale('ru');

type PaymentProps = {
  payment: RolePaymentT<UserRoleT>;
  currentUserRole: RoleT;
};

const formatPaymentDate = (dateStr: string): string => {
  const date = dayjs(dateStr);
  return date.format('D MMMM, HH:mm');
};

export const Payment = ({ payment, currentUserRole }: PaymentProps) => {
  const formattedDate = formatPaymentDate(payment.created_at);
  const amount = parseFloat(payment.total);
  const statusText = mapPaymentStatus[payment.status];

  // Определяем ID пользователя в зависимости от роли текущего пользователя
  // Если текущий пользователь - ученик, показываем репетитора (tutor_id)
  // Если текущий пользователь - репетитор, показываем ученика (student_id)
  const userId =
    currentUserRole === 'student'
      ? (payment as { tutor_id: number }).tutor_id
      : (payment as { student_id: number }).student_id;

  // Определяем роль пользователя в платеже (противоположную роли текущего пользователя)
  const userRole = currentUserRole === 'tutor' ? 'student' : 'tutor';

  // Получаем данные пользователя
  const userData = useUserByRole(userRole, userId);
  const displayName = userData.data?.display_name;
  const username = userData.data?.username;

  return (
    <div className="border-gray-60 flex min-h-[130px] min-w-[350px] flex-col items-start justify-start gap-2 rounded-2xl border p-4">
      <div className="flex w-full flex-row items-start justify-between gap-2">
        <UserProfile
          size="m"
          userId={userId}
          text={displayName || username || 'Имя не найдено'}
          src={`https://api.sovlium.ru/files/users/${userId}/avatar.webp`}
        />
        <span className={cn('text-m-base text-end font-normal', getStatusColor(payment.status))}>
          {statusText}
        </span>
      </div>
      <span className="text-s-base text-gray-80 mt-auto font-medium">{formattedDate}</span>
      <div className="flex flex-row items-baseline gap-0.5">
        <h3 className="text-h6 font-medium text-gray-100">{amount}</h3>
        <span className="text-m-base text-gray-60 font-medium">₽</span>
      </div>
    </div>
  );
};
