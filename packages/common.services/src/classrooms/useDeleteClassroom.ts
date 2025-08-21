import { ClassroomsQueryKey } from 'common.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useDeleteClassroom = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error, ...rest } = useMutation({
    mutationFn: async (classroomId: string): Promise<void> => {
      // Имитация задержки сети
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Имитация удаления класса
      console.log(`Удаление класса с ID: ${classroomId}`);
    },
    onSuccess: () => {
      // Инвалидируем кеш списка классов и конкретного класса
      queryClient.invalidateQueries({
        queryKey: [ClassroomsQueryKey.SearchClassrooms],
      });
      queryClient.invalidateQueries({
        queryKey: [ClassroomsQueryKey.GetClassroom],
      });
    },
  });

  return {
    deleteClassroom: mutate,
    isDeleting: isPending,
    isError,
    error,
    ...rest,
  };
};
