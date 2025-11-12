import { ClassroomsQueryKey, ClassroomT, ClassroomStatusT, classroomsApiConfig } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError, showSuccess } from 'common.services';

interface UpdateIndividualClassroomData {
  name?: string;
  status?: ClassroomStatusT;
  description?: string;
  subject_id?: number | null;
}

interface UpdateIndividualClassroomParams {
  classroomId: number;
  data: UpdateIndividualClassroomData;
}

interface MutationContext {
  previousClassroom?: ClassroomT;
  previousClassrooms?: ClassroomT[];
  previousInfiniteData?: {
    pages: ClassroomT[][];
    pageParams: (string | undefined)[];
  };
}

// Тип для данных infinite query
type InfiniteQueryData = {
  pages: ClassroomT[][];
  pageParams: (string | undefined)[];
};

// Проверка, является ли данные infinite query
const isInfiniteQueryData = (data: unknown): data is InfiniteQueryData => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'pages' in data &&
    'pageParams' in data &&
    Array.isArray((data as InfiniteQueryData).pages)
  );
};

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
      const previousInfiniteData = queryClient.getQueryData<InfiniteQueryData>([
        ClassroomsQueryKey.GetClassrooms,
      ]);

      // Оптимистично обновляем данные класса в списке
      queryClient.setQueryData(
        [ClassroomsQueryKey.GetClassrooms],
        (old: ClassroomT[] | InfiniteQueryData | undefined) => {
          if (!old) return old;

          // Если это infinite query формат
          if (isInfiniteQueryData(old)) {
            return {
              ...old,
              pages: old.pages.map((page) =>
                page.map((classroom) =>
                  classroom.id === classroomId ? { ...classroom, ...data } : classroom,
                ),
              ),
            };
          }

          // Если это обычный массив
          if (Array.isArray(old)) {
            return old.map((classroom) =>
              classroom.id === classroomId ? { ...classroom, ...data } : classroom,
            );
          }

          return old;
        },
      );

      // Оптимистично обновляем данные конкретного класса
      queryClient.setQueryData<ClassroomT>(
        [ClassroomsQueryKey.GetClassroom, classroomId],
        (old) => {
          if (!old) return old;
          return { ...old, ...data };
        },
      );

      // Возвращаем предыдущие значения для отката в случае ошибки
      return { previousClassroom, previousClassrooms, previousInfiniteData };
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
      if (context?.previousInfiniteData) {
        queryClient.setQueryData([ClassroomsQueryKey.GetClassrooms], context.previousInfiniteData);
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
        queryClient.setQueryData(
          [ClassroomsQueryKey.GetClassrooms],
          (old: ClassroomT[] | InfiniteQueryData | undefined) => {
            if (!old) return old;

            // Если это infinite query формат
            if (isInfiniteQueryData(old)) {
              return {
                ...old,
                pages: old.pages.map((page) =>
                  page.map((classroom) =>
                    classroom.id === classroomId ? updatedClassroom : classroom,
                  ),
                ),
              };
            }

            // Если это обычный массив
            if (Array.isArray(old)) {
              return old.map((classroom) =>
                classroom.id === classroomId ? updatedClassroom : classroom,
              );
            }

            return old;
          },
        );
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
