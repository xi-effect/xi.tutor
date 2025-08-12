import { ClassroomsQueryKey, ClassroomT, ClassroomStatusT } from 'common.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateClassroomStatus = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error, ...rest } = useMutation({
    mutationFn: async ({
      classroomId,
      status,
    }: {
      classroomId: string;
      status: ClassroomStatusT;
    }): Promise<ClassroomT> => {
      // Имитация задержки сети
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Имитация обновления статуса класса
      const updatedClassroom: ClassroomT = {
        id: classroomId,
        name: 'Класс с обновленным статусом',
        status,
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
    updateClassroomStatus: mutate,
    isUpdating: isPending,
    isError,
    error,
    ...rest,
  };
};
