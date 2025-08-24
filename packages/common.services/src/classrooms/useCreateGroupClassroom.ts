import { ClassroomsQueryKey, ClassroomT } from 'common.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateGroupClassroomData {
  name: string;
  // Добавьте другие необходимые поля для создания группового класса
}

export const useCreateGroupClassroom = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error, ...rest } = useMutation({
    mutationFn: async (data: CreateGroupClassroomData): Promise<ClassroomT> => {
      // Имитация задержки сети
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Создаем моковый новый класс
      const newClassroom: ClassroomT = {
        id: Date.now().toString(),
        name: data.name,
        status: 'studying',
      };

      return newClassroom;
    },
    onSuccess: () => {
      // Инвалидируем кеш списка классов
      queryClient.invalidateQueries({
        queryKey: [ClassroomsQueryKey.SearchClassrooms],
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
