import { ClassroomsQueryKey, ClassroomT } from 'common.api';
import { useQuery } from '@tanstack/react-query';

// Моковые данные для кабинетов (те же, что и в useFetchClassrooms)
const mockClassrooms: ClassroomT[] = [
  {
    id: 1,
    name: 'Анна Смирнова',
    status: 'study',
  },
  {
    id: 2,
    name: 'Максим Иванов',
    status: 'study',
  },
  {
    id: 3,
    name: 'Елизавета Петрова',
    status: 'study',
  },
  {
    id: 4,
    name: 'Дмитрий Кузнецов',
    status: 'study',
  },
  {
    id: 5,
    name: 'Андрей Соколов',
    status: 'study',
  },
  {
    id: 6,
    name: 'Кирилл Лебедев',
    status: 'pause',
  },
  {
    id: 7,
    name: 'Наталья Орлова',
    status: 'completed',
  },
  {
    id: 8,
    name: 'English Group',
    status: 'study',
    groupSize: 4,
  },
];

export const useGetClassroom = (classroomId: number, disabled?: boolean) => {
  const { data, isError, isLoading, ...rest } = useQuery({
    queryKey: [ClassroomsQueryKey.GetClassroom, classroomId],
    queryFn: async () => {
      // Имитация задержки сети
      await new Promise((resolve) => setTimeout(resolve, 800));
      return mockClassrooms.find((classroom) => classroom.id === classroomId) || null;
    },
    enabled: !disabled && !!classroomId,
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};
