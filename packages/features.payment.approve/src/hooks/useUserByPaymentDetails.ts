import { useUserByRole } from 'features.table';
import { RolePaymentT } from 'features.table';

export const useUserByPaymentDetails = (
  paymentDetails: RolePaymentT<'tutor'> | RolePaymentT<'student'>,
) => {
  // Определяем роль на основе наличия полей
  const isTutorPayment = 'student_id' in paymentDetails;

  // Получаем ID пользователя в зависимости от роли
  const userId = isTutorPayment ? paymentDetails.student_id : paymentDetails.tutor_id;

  // Определяем роль для использования правильного хука
  const role = isTutorPayment ? 'student' : 'tutor';

  // Используем useUserByRole с userId напрямую
  const userData = useUserByRole(role, userId);

  return {
    data: userData.data,
    isLoading: userData.isLoading,
    isError: userData.isError,
    role,
    userId,
  };
};
