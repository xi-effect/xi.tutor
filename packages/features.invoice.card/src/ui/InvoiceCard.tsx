import { useUserByRole } from 'features.table';
import { DefaultCard, TableCard } from './components';
import { InvoiceCardPropsT } from '../types';

export const InvoiceCard = ({
  payment,
  currentUserRole,
  type = 'full',
  variant = 'default',
  className,
}: InvoiceCardPropsT) => {
  const userId =
    currentUserRole === 'student'
      ? (payment as { tutor_id: number }).tutor_id
      : (payment as { student_id: number }).student_id;

  const userRole = currentUserRole === 'tutor' ? 'student' : 'tutor';
  const userData = useUserByRole(userRole, userId);

  return variant === 'table' ? (
    <TableCard
      userData={userData.data}
      userId={userId}
      payment={payment}
      currentUserRole={currentUserRole}
      className={className}
    />
  ) : (
    <DefaultCard
      type={type}
      userData={userData.data}
      userId={userId}
      payment={payment}
      className={className}
    />
  );
};
