/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClassroomsQueryKey, ClassroomT, GroupClassroomT } from 'common.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateGroupClassroomData {
  name?: string;
  status?: string;
  description?: string;
}

export const useUpdateGroupClassroom = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error, ...rest } = useMutation({
    mutationFn: async ({
      classroomId,
      data,
    }: {
      classroomId: number;
      data: UpdateGroupClassroomData;
    }): Promise<ClassroomT> => {
      // Имитация задержки сети
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Имитация обновления группового класса
      const updatedClassroom: GroupClassroomT = {
        id: classroomId,
        name: data.name || 'Обновленный групповой класс',
        status: (data.status as any) || 'active',
        created_at: new Date().toISOString(),
        description: data.description || 'Описание обновленного группового класса',
        kind: 'group',
        tutor_id: 0,
      };

      return updatedClassroom;
    },
    onSuccess: (_, { classroomId }) => {
      // Инвалидируем кеш списка классов и конкретного класса
      queryClient.invalidateQueries({
        queryKey: [ClassroomsQueryKey.GetClassrooms],
      });
      queryClient.invalidateQueries({
        queryKey: [ClassroomsQueryKey.GetClassroom, classroomId],
      });
    },
  });

  return {
    updateGroupClassroom: mutate,
    isUpdating: isPending,
    isError,
    error,
    ...rest,
  };
};
