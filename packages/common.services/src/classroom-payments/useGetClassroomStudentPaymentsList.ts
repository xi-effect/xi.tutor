import { classroomPaymentsApiConfig, ClassroomPaymentsQueryKey } from 'common.api';
import { useFetching } from 'common.config';
import { RolePaymentT } from 'common.types';

interface ClassroomStudentPaymentsListParams {
  classroomId: string;
  disabled?: boolean;
}

/**
 * Упрощенный хук для получения первых 50 платежей ученика
 * Автоматически устанавливает limit=50 и не требует передачи cursor
 */
export const useGetClassroomStudentPaymentsList = ({
  classroomId,
  disabled = false,
}: ClassroomStudentPaymentsListParams) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: classroomPaymentsApiConfig[ClassroomPaymentsQueryKey.StudentPayments].method,
      getUrl: () =>
        classroomPaymentsApiConfig[ClassroomPaymentsQueryKey.StudentPayments].getUrl(classroomId),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    data: {
      limit: 50,
    },
    disabled: disabled,
    queryKey: [ClassroomPaymentsQueryKey.StudentPayments, classroomId, 'list'],
  });

  return {
    data: data as RolePaymentT<'student'>[],
    isError,
    isLoading,
    ...rest,
  };
};
