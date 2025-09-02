/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClassroomsQueryKey, ClassroomT } from 'common.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateIndividualClassroomData {
  name?: string;
  status?: string;
  // Добавьте другие необходимые поля для обновления индивидуального класса
}

export const useUpdateIndividualClassroom = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error, ...rest } = useMutation({
    mutationFn: async ({
      classroomId,
      data,
    }: {
      classroomId: number;
      data: UpdateIndividualClassroomData;
    }): Promise<ClassroomT> => {
      // Имитация задержки сети
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Имитация обновления класса
      const updatedClassroom: ClassroomT = {
        id: classroomId,
        name: data.name || 'Обновленный класс',
        status: (data.status as any) || 'studying',
      };

      return updatedClassroom;
    },
    onSuccess: (_, { classroomId }) => {
      // Инвалидируем кеш списка классов и конкретного класса
      queryClient.invalidateQueries({
        queryKey: [ClassroomsQueryKey.SearchClassrooms],
      });
      queryClient.invalidateQueries({
        queryKey: [ClassroomsQueryKey.GetClassroom, classroomId],
      });
    },
  });

  return {
    updateIndividualClassroom: mutate,
    isUpdating: isPending,
    isError,
    error,
    ...rest,
  };
};
