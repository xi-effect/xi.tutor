import { classroomsApiConfig, ClassroomsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError, showSuccess } from '../utils';
import {
  activateMonetizationClassrooms,
  getMonetizationOverride,
} from '../subscription/monetizationDevtools';
import { invalidateClassroomCounts } from './useClassroomCounts';

const jsonHeaders = {
  'Content-Type': 'application/json',
};

export const useActivateClassrooms = () => {
  const queryClient = useQueryClient();

  const activateClassroomsMutation = useMutation<void, Error, number[]>({
    mutationFn: async (classroomIds) => {
      if (activateMonetizationClassrooms(classroomIds)) return;

      const axiosInst = await getAxiosInstance();
      const { method, getUrl } = classroomsApiConfig[ClassroomsQueryKey.UpdateClassroomStatus];

      for (const classroomId of classroomIds) {
        await axiosInst({
          method,
          url: getUrl(classroomId.toString()),
          data: { status: 'active' },
          headers: jsonHeaders,
        });
      }
    },
    onSuccess: () => {
      if (getMonetizationOverride().classroomCatalog) {
        showSuccess('classroom', 'Выбранные кабинеты снова активны');
        return;
      }

      void queryClient.invalidateQueries({ queryKey: [ClassroomsQueryKey.GetClassrooms] });
      void queryClient.invalidateQueries({ queryKey: [ClassroomsQueryKey.GetClassroom] });
      void invalidateClassroomCounts(queryClient);
      showSuccess('classroom', 'Выбранные кабинеты снова активны');
    },
    onError: (err) => {
      void queryClient.invalidateQueries({ queryKey: [ClassroomsQueryKey.GetClassrooms] });
      void queryClient.invalidateQueries({ queryKey: [ClassroomsQueryKey.GetClassroom] });
      void invalidateClassroomCounts(queryClient);
      handleError(err, 'classroom');
    },
  });

  return {
    activateClassrooms: activateClassroomsMutation.mutate,
    isActivating: activateClassroomsMutation.isPending,
  };
};
