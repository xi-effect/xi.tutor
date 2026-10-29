import { ClassroomsQueryKey, ClassroomT, ClassroomStatusT, classroomsApiConfig } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError, showSuccess } from '../utils';
import {
  getMonetizationOverride,
  updateMonetizationClassroomStatus,
} from '../subscription/monetizationDevtools';
import { invalidateClassroomCounts } from './useClassroomCounts';
import {
  patchClassroomInLists,
  restoreClassroomLists,
  snapshotClassroomLists,
} from './patchClassroomListCache';

interface UpdateClassroomStatusParams {
  classroomId: number;
  status: ClassroomStatusT;
}

interface MutationContext {
  previousClassroom?: ClassroomT;
  previousLists: ReturnType<typeof snapshotClassroomLists>;
}

export const useUpdateClassroomStatus = () => {
  const queryClient = useQueryClient();

  const updateClassroomStatusMutation = useMutation<
    ClassroomT,
    Error,
    UpdateClassroomStatusParams,
    MutationContext
  >({
    mutationFn: async ({ classroomId, status }: UpdateClassroomStatusParams) => {
      const simulated = updateMonetizationClassroomStatus(classroomId, status);
      if (simulated) return simulated;

      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: classroomsApiConfig[ClassroomsQueryKey.UpdateClassroomStatus].method,
          url: classroomsApiConfig[ClassroomsQueryKey.UpdateClassroomStatus].getUrl(
            classroomId.toString(),
          ),
          data: { status },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return response.data;
      } catch (err) {
        console.error('Ошибка при обновлении статуса кабинета:', err);
        throw err;
      }
    },
    onMutate: async ({ classroomId, status }) => {
      // Отменяем исходящие запросы, чтобы они не перезаписали наш оптимистичный апдейт
      await queryClient.cancelQueries({ queryKey: [ClassroomsQueryKey.GetClassrooms] });
      await queryClient.cancelQueries({ queryKey: [ClassroomsQueryKey.GetClassroom, classroomId] });

      // Сохраняем предыдущие значения для отката
      const previousClassroom = queryClient.getQueryData<ClassroomT>([
        ClassroomsQueryKey.GetClassroom,
        classroomId,
      ]);
      const previousLists = snapshotClassroomLists(queryClient);

      patchClassroomInLists(queryClient, classroomId, { status });

      // Оптимистично обновляем данные конкретного кабинета
      queryClient.setQueryData<ClassroomT>(
        [ClassroomsQueryKey.GetClassroom, classroomId],
        (old) => {
          if (!old) return old;
          return { ...old, status };
        },
      );

      // Возвращаем предыдущие значения для отката в случае ошибки
      return { previousClassroom, previousLists };
    },
    onError: (err, { classroomId }, context) => {
      // В случае ошибки откатываем изменения
      if (context?.previousClassroom) {
        queryClient.setQueryData(
          [ClassroomsQueryKey.GetClassroom, classroomId],
          context.previousClassroom,
        );
      }
      if (context?.previousLists) {
        restoreClassroomLists(queryClient, context.previousLists);
      }

      void invalidateClassroomCounts(queryClient);

      // Показываем toast с ошибкой
      handleError(err, 'classroom');
    },
    onSuccess: (updatedClassroom, { classroomId }) => {
      if (getMonetizationOverride().classroomCatalog) {
        showSuccess('classroom', `Статус кабинета обновлен`);
        return;
      }

      // Если сервер вернул обновленные данные, обновляем кеш
      if (updatedClassroom) {
        queryClient.setQueryData<ClassroomT>(
          [ClassroomsQueryKey.GetClassroom, classroomId],
          updatedClassroom,
        );

        patchClassroomInLists(queryClient, classroomId, updatedClassroom);
      }

      void queryClient.invalidateQueries({ queryKey: [ClassroomsQueryKey.GetClassrooms] });
      void invalidateClassroomCounts(queryClient);

      // Показываем успешное уведомление
      showSuccess('classroom', `Статус кабинета обновлен`);
    },
  });

  return {
    updateClassroomStatus: updateClassroomStatusMutation.mutate,
    isUpdating: updateClassroomStatusMutation.isPending,
    ...updateClassroomStatusMutation,
  };
};
