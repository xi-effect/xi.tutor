import { ClassroomsQueryKey, ClassroomT } from 'common.api';
import { useQuery } from '@tanstack/react-query';

// Моковые данные для кабинетов
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

export const useFetchClassrooms = (
  searchParams?: {
    limit?: number;
    lastOpenedBefore?: string;
  },
  disabled?: boolean,
) => {
  const { data, isError, isLoading, ...rest } = useQuery({
    queryKey: [ClassroomsQueryKey.SearchClassrooms, searchParams],
    queryFn: async () => {
      // Имитация задержки сети
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Фильтрация по параметрам поиска
      let filteredClassrooms = [...mockClassrooms];

      if (searchParams?.limit) {
        filteredClassrooms = filteredClassrooms.slice(0, searchParams.limit);
      }

      return filteredClassrooms;
    },
    enabled: !disabled,
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};
