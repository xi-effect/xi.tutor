import { ClassroomsQueryKey, ClassroomT, ClassroomStatusT, classroomsApiConfig } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError, showSuccess } from 'common.services';

interface UpdateClassroomStatusParams {
  classroomId: number;
  status: ClassroomStatusT;
}

interface MutationContext {
  previousClassroom?: ClassroomT;
  previousClassrooms?: ClassroomT[];
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
        console.error('Ошибка при обновлении статуса класса:', err);
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
      const previousClassrooms = queryClient.getQueryData<ClassroomT[]>([
        ClassroomsQueryKey.GetClassrooms,
      ]);

      // Оптимистично обновляем данные класса в списке
      queryClient.setQueryData<ClassroomT[]>([ClassroomsQueryKey.GetClassrooms], (old) => {
        if (!old) return old;
        return old.map((classroom) =>
          classroom.id === classroomId ? { ...classroom, status } : classroom,
        );
      });

      // Оптимистично обновляем данные конкретного класса
      queryClient.setQueryData<ClassroomT>(
        [ClassroomsQueryKey.GetClassroom, classroomId],
        (old) => {
          if (!old) return old;
          return { ...old, status };
        },
      );

      // Возвращаем предыдущие значения для отката в случае ошибки
      return { previousClassroom, previousClassrooms };
    },
    onError: (err, { classroomId }, context) => {
      // В случае ошибки откатываем изменения
      if (context?.previousClassroom) {
        queryClient.setQueryData(
          [ClassroomsQueryKey.GetClassroom, classroomId],
          context.previousClassroom,
        );
      }
      if (context?.previousClassrooms) {
        queryClient.setQueryData([ClassroomsQueryKey.GetClassrooms], context.previousClassrooms);
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

        // Обновляем класс в списке
        queryClient.setQueryData<ClassroomT[]>([ClassroomsQueryKey.GetClassrooms], (old) => {
          if (!old) return old;
          return old.map((classroom) =>
            classroom.id === classroomId ? updatedClassroom : classroom,
          );
        });
      }

      // Показываем успешное уведомление
      showSuccess('classroom', `Статус класса обновлен`);
    },
  });

  return {
    updateClassroomStatus: updateClassroomStatusMutation.mutate,
    isUpdating: updateClassroomStatusMutation.isPending,
    ...updateClassroomStatusMutation,
  };
};
