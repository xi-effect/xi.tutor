import { ClassroomsQueryKey, ClassroomT, ClassroomStatusT, classroomsApiConfig } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError, showSuccess } from 'common.services';

interface UpdateIndividualClassroomData {
  name?: string;
  status?: ClassroomStatusT;
  description?: string;
}

interface UpdateIndividualClassroomParams {
  classroomId: number;
  data: UpdateIndividualClassroomData;
}

interface MutationContext {
  previousClassroom?: ClassroomT;
  previousClassrooms?: ClassroomT[];
}

export const useUpdateIndividualClassroom = () => {
  const queryClient = useQueryClient();

  const updateIndividualClassroomMutation = useMutation<
    ClassroomT,
    Error,
    UpdateIndividualClassroomParams,
    MutationContext
  >({
    mutationFn: async ({ classroomId, data }: UpdateIndividualClassroomParams) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: classroomsApiConfig[ClassroomsQueryKey.UpdateIndividualClassroom].method,
          url: classroomsApiConfig[ClassroomsQueryKey.UpdateIndividualClassroom].getUrl(
            classroomId.toString(),
          ),
          data,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return response.data;
      } catch (err) {
        console.error('Ошибка при обновлении индивидуального класса:', err);
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
      const previousClassrooms = queryClient.getQueryData<ClassroomT[]>([
        ClassroomsQueryKey.GetClassrooms,
      ]);

      // Оптимистично обновляем данные класса в списке
      queryClient.setQueryData<ClassroomT[]>([ClassroomsQueryKey.GetClassrooms], (old) => {
        if (!old) return old;
        return old.map((classroom) =>
          classroom.id === classroomId ? { ...classroom, ...data } : classroom,
        );
      });

      // Оптимистично обновляем данные конкретного класса
      queryClient.setQueryData<ClassroomT>(
        [ClassroomsQueryKey.GetClassroom, classroomId],
        (old) => {
          if (!old) return old;
          return { ...old, ...data };
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
      showSuccess('classroom', `Индивидуальный класс обновлен`);
    },
  });

  return {
    updateIndividualClassroom: updateIndividualClassroomMutation.mutate,
    isUpdating: updateIndividualClassroomMutation.isPending,
    ...updateIndividualClassroomMutation,
  };
};
