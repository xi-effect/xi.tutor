import { classroomsApiConfig, ClassroomsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError } from 'common.services';

export interface CreateGroupRequest {
  subject_id: number;
  name: string;
}

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  const createGroupMutation = useMutation({
    mutationFn: async (data: CreateGroupRequest) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: classroomsApiConfig[ClassroomsQueryKey.CreateGroupClassroom].method,
          url: classroomsApiConfig[ClassroomsQueryKey.CreateGroupClassroom].getUrl(),
          data,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return response;
      } catch (err) {
        console.error('Ошибка при создании группы:', err);
        throw err;
      }
    },
    onMutate: async (data) => {
      // Отменяем любые исходящие запросы для получения списка классов
      await queryClient.cancelQueries({ queryKey: [ClassroomsQueryKey.GetClassrooms] });

      // Получаем предыдущие данные
      const previousClassrooms = queryClient.getQueryData([ClassroomsQueryKey.GetClassrooms]);

      // Оптимистично обновляем кэш
      queryClient.setQueryData([ClassroomsQueryKey.GetClassrooms], (old: unknown) => {
        if (!old || !Array.isArray(old)) return old;

        // Добавляем новую группу в список (оптимистичное обновление)
        const newGroup = {
          id: Date.now(), // временный ID
          name: data.name,
          subject_id: data.subject_id,
          is_optimistic: true, // флаг для идентификации оптимистичного обновления
        };

        return [...old, newGroup];
      });

      return { previousClassrooms };
    },
    onError: (err, _data, context) => {
      // В случае ошибки возвращаем предыдущие данные
      if (context?.previousClassrooms) {
        queryClient.setQueryData([ClassroomsQueryKey.GetClassrooms], context.previousClassrooms);
      }

      handleError(err, 'createGroup');
    },
    onSuccess: () => {
      // При успешном создании инвалидируем кэш для получения актуальных данных
      queryClient.invalidateQueries({ queryKey: [ClassroomsQueryKey.GetClassrooms] });
    },
  });

  return { ...createGroupMutation };
};
