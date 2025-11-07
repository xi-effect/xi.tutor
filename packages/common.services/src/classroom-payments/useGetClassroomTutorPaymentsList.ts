import { classroomPaymentsApiConfig, ClassroomPaymentsQueryKey } from 'common.api';
import { useFetching } from 'common.config';
import { RolePaymentT } from 'common.types';

interface ClassroomTutorPaymentsListParams {
  classroomId: string;
  disabled?: boolean;
}

/**
 * Упрощенный хук для получения первых 50 платежей репетитора
 * Автоматически устанавливает limit=50 и не требует передачи cursor
 */
export const useGetClassroomTutorPaymentsList = ({
  classroomId,
  disabled = false,
}: ClassroomTutorPaymentsListParams) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: classroomPaymentsApiConfig[ClassroomPaymentsQueryKey.TutorPayments].method,
      getUrl: () =>
        classroomPaymentsApiConfig[ClassroomPaymentsQueryKey.TutorPayments].getUrl(classroomId),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    data: {
      limit: 50,
    },
    disabled: disabled,
    queryKey: [ClassroomPaymentsQueryKey.TutorPayments, classroomId, 'list'],
  });

  return {
    data: data as RolePaymentT<'tutor'>[],
    isError,
    isLoading,
    ...rest,
  };
};
