import { ClassroomsQueryKey, ClassroomT, GroupClassroomT } from 'common.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateGroupClassroomData {
  name: string;
  description?: string;
}

export const useCreateGroupClassroom = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error, ...rest } = useMutation({
    mutationFn: async (data: CreateGroupClassroomData): Promise<ClassroomT> => {
      // Имитация задержки сети
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Создаем моковый новый групповой класс
      const newClassroom: GroupClassroomT = {
        id: Date.now(),
        name: data.name,
        status: 'active',
        created_at: new Date().toISOString(),
        description: data.description || null,
        kind: 'group',
      };

      return newClassroom;
    },
    onSuccess: () => {
      // Инвалидируем кеш списка классов
      queryClient.invalidateQueries({
        queryKey: [ClassroomsQueryKey.GetClassrooms],
      });
    },
  });

  return {
    createGroupClassroom: mutate,
    isCreating: isPending,
    isError,
    error,
    ...rest,
  };
};
