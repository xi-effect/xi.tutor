import { ClassroomsQueryKey, ClassroomT } from 'common.api';
import { useQuery } from '@tanstack/react-query';

// Моковые данные для кабинетов (те же, что и в useFetchClassrooms)
const mockClassrooms: ClassroomT[] = [
  {
    id: 1,
    status: 'active',
    created_at: '2025-01-15T10:00:00Z',
    description: 'Подготовка к ЕГЭ по математике',
    student_id: 42,
    name: 'Анна Смирнова',
    kind: 'individual',
  },
  {
    id: 2,
    status: 'active',
    created_at: '2025-01-16T11:30:00Z',
    description: 'Подготовка к ОГЭ по русскому языку',
    student_id: 38,
    name: 'Максим Иванов',
    kind: 'individual',
  },
  {
    id: 3,
    status: 'active',
    created_at: '2025-01-17T09:15:00Z',
    description: 'Изучение английского языка с нуля',
    student_id: 45,
    name: 'Елизавета Петрова',
    kind: 'individual',
  },
  {
    id: 4,
    status: 'active',
    created_at: '2025-01-18T14:20:00Z',
    description: 'Подготовка к ЕГЭ по физике',
    student_id: 51,
    name: 'Дмитрий Кузнецов',
    kind: 'individual',
  },
  {
    id: 5,
    status: 'active',
    created_at: '2025-01-19T16:45:00Z',
    description: 'Подготовка к ЕГЭ по химии',
    student_id: 47,
    name: 'Андрей Соколов',
    kind: 'individual',
  },
  {
    id: 6,
    status: 'paused',
    created_at: '2025-01-20T13:00:00Z',
    description: 'Подготовка к ЕГЭ по биологии',
    student_id: 53,
    name: 'Кирилл Лебедев',
    kind: 'individual',
  },
  {
    id: 7,
    status: 'finished',
    created_at: '2025-01-21T15:30:00Z',
    description: 'Подготовка к ЕГЭ по истории',
    student_id: 49,
    name: 'Наталья Орлова',
    kind: 'individual',
  },
  {
    id: 8,
    status: 'active',
    created_at: '2025-01-22T12:00:00Z',
    description: 'Курс по английскому языку для группы',
    name: 'English Group',
    kind: 'group',
  },
  {
    id: 9,
    status: 'active',
    created_at: '2025-01-23T10:30:00Z',
    description: 'Курс по математике для группы',
    name: 'Math Group',
    kind: 'group',
  },
  {
    id: 10,
    status: 'paused',
    created_at: '2025-01-24T11:45:00Z',
    description: 'Курс по физике для группы',
    name: 'Physics Group',
    kind: 'group',
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
