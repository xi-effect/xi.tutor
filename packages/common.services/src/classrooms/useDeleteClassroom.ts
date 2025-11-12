import { ClassroomsQueryKey, classroomsApiConfig } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError, showSuccess } from 'common.services';

interface DeleteClassroomParams {
  classroomId: number;
}

export const useDeleteClassroom = () => {
  const queryClient = useQueryClient();

  const deleteClassroomMutation = useMutation<void, Error, DeleteClassroomParams>({
    mutationFn: async ({ classroomId }: DeleteClassroomParams) => {
      try {
        const axiosInst = await getAxiosInstance();

        const response = await axiosInst({
          method: classroomsApiConfig[ClassroomsQueryKey.DeleteClassroom].method,
          url: classroomsApiConfig[ClassroomsQueryKey.DeleteClassroom].getUrl(
            classroomId.toString(),
          ),
        });

        return response.data;
      } catch (err) {
        console.error('Ошибка при удалении класса:', err);
        throw err;
      }
    },
    onError: (err) => {
      // Показываем toast с ошибкой
      handleError(err, 'classroom');
    },
    onSuccess: () => {
      // Инвалидируем кеш для обновления данных
      queryClient.invalidateQueries({ queryKey: [ClassroomsQueryKey.GetClassrooms] });

      // Показываем успешное уведомление
      showSuccess('classroom', 'Класс успешно удален');
    },
  });

  return {
    deleteClassroom: deleteClassroomMutation.mutate,
    isDeleting: deleteClassroomMutation.isPending,
    ...deleteClassroomMutation,
  };
};
