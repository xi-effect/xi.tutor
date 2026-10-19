import { ClassroomsQueryKey, ClassroomT, ClassroomStatusT, classroomsApiConfig } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError, showSuccess } from 'common.services';
import {
  patchClassroomInLists,
  restoreClassroomLists,
  snapshotClassroomLists,
} from './patchClassroomListCache';

interface UpdateGroupClassroomData {
  name?: string;
  status?: ClassroomStatusT;
  description?: string;
  subject_id?: number | null;
}

interface UpdateGroupClassroomParams {
  classroomId: number;
  data: UpdateGroupClassroomData;
}

interface MutationContext {
  previousClassroom?: ClassroomT;
  previousLists: ReturnType<typeof snapshotClassroomLists>;
}

export const useUpdateGroupClassroom = () => {
  const queryClient = useQueryClient();

  const updateGroupClassroomMutation = useMutation<
    ClassroomT,
    Error,
    UpdateGroupClassroomParams,
    MutationContext
  >({
    mutationFn: async ({ classroomId, data }: UpdateGroupClassroomParams) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: classroomsApiConfig[ClassroomsQueryKey.UpdateGroupClassroom].method,
          url: classroomsApiConfig[ClassroomsQueryKey.UpdateGroupClassroom].getUrl(
            classroomId.toString(),
          ),
          data,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return response.data;
      } catch (err) {
        console.error('Ошибка при обновлении группового кабинета:', err);
        throw err;
      }
    },
    onMutate: async ({ classroomId, data }) => {
      // Отменяем исходящие запросы, чтобы они не перезаписали наш оптимистичный апдейт
      await queryClient.cancelQueries({ queryKey: [ClassroomsQueryKey.GetClassrooms] });
      await queryClient.cancelQueries({ queryKey: [ClassroomsQueryKey.GetClassroom, classroomId] });

      // Сохраняем предыдущие значения для отката
      const previousClassroom = queryClient.getQueryData<ClassroomT>([
        ClassroomsQueryKey.GetClassroom,
        classroomId,
      ]);
      const previousLists = snapshotClassroomLists(queryClient);

      patchClassroomInLists(queryClient, classroomId, data);

      // Оптимистично обновляем данные конкретного кабинета
      queryClient.setQueryData<ClassroomT>(
        [ClassroomsQueryKey.GetClassroom, classroomId],
        (old) => {
          if (!old) return old;
          return { ...old, ...data };
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

      // Показываем toast с ошибкой
      handleError(err, 'classroom');
    },
    onSuccess: (updatedClassroom, { classroomId }) => {
      // Если сервер вернул обновленные данные, обновляем кеш
      if (updatedClassroom) {
        queryClient.setQueryData<ClassroomT>(
          [ClassroomsQueryKey.GetClassroom, classroomId],
          updatedClassroom,
        );

        patchClassroomInLists(queryClient, classroomId, updatedClassroom);
      }

      // Показываем успешное уведомление
      showSuccess('classroom', `Групповой кабинет обновлен`);
    },
  });

  return {
    updateGroupClassroom: updateGroupClassroomMutation.mutate,
    isUpdating: updateGroupClassroomMutation.isPending,
    ...updateGroupClassroomMutation,
  };
};
