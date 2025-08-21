import { ClassroomsQueryKey, ClassroomT } from 'common.api';
import { useQuery } from '@tanstack/react-query';

// Моковые данные для кабинетов (те же, что и в useFetchClassrooms)
const mockClassrooms: ClassroomT[] = [
  {
    id: '1',
    name: 'Математика - 10 класс',
    status: 'studying',
  },
  {
    id: '2',
    name: 'Физика - 11 класс',
    status: 'paused',
  },
  {
    id: '3',
    name: 'Химия - 9 класс',
    status: 'completed',
  },
  {
    id: '4',
    name: 'Биология - 10 класс',
    status: 'studying',
  },
  {
    id: '5',
    name: 'История - 11 класс',
    status: 'studying',
  },
  {
    id: '6',
    name: 'Литература - 9 класс',
    status: 'paused',
  },
  {
    id: '7',
    name: 'География - 10 класс',
    status: 'completed',
  },
  {
    id: '8',
    name: 'Английский язык - 11 класс',
    status: 'studying',
  },
];

export const useGetClassroom = (classroomId: string, disabled?: boolean) => {
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
