/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClassroomsQueryKey, ClassroomT, IndividualClassroomT } from 'common.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateIndividualClassroomData {
  name?: string;
  status?: string;
  description?: string;
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
      const updatedClassroom: IndividualClassroomT = {
        id: classroomId,
        name: data.name || 'Обновленный класс',
        status: (data.status as any) || 'active',
        created_at: new Date().toISOString(),
        description: data.description || 'Описание обновленного класса',
        kind: 'individual',
        student_id: 1,
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
    updateIndividualClassroom: mutate,
    isUpdating: isPending,
    isError,
    error,
    ...rest,
  };
};
