import { useInfiniteQuery as useTanStackInfiniteQuery } from '@tanstack/react-query';
import { ClassroomPropsT } from '../types';
import { getAxiosInstance } from 'common.config';
import { studentApiConfig, StudentQueryKey, ClassroomT } from 'common.api';
import React from 'react';

// Адаптер для преобразования ClassroomT в ClassroomPropsT
const adaptClassroom = (classroom: ClassroomT): ClassroomPropsT => ({
  id: classroom.id,
  name: classroom.name,
  status: classroom.status,
  kind: classroom.kind,
  description: classroom.description || undefined,
  created_at: classroom.created_at,
  student_id: 'student_id' in classroom ? classroom.student_id : classroom.tutor_id,
  subject_id: classroom.subject_id,
});

export const useInfiniteQueryStudent = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useTanStackInfiniteQuery({
      queryKey: [StudentQueryKey.Classrooms],
      queryFn: async ({ pageParam }) => {
        const axiosInst = await getAxiosInstance();
        const url = studentApiConfig[StudentQueryKey.Classrooms].getUrl();

        const response = await axiosInst({
          method: studentApiConfig[StudentQueryKey.Classrooms].method,
          url,
          params: {
            limit: 20,
            last_opened_before: pageParam,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return response.data as ClassroomT[];
      },
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => {
        if (!lastPage || lastPage.length === 0) {
          return undefined;
        }

        // Используем created_at для пагинации
        const nextParam = lastPage[lastPage.length - 1].created_at;
        return nextParam;
      },
      staleTime: 5 * 60 * 1000, // 5 минут
      gcTime: 10 * 60 * 1000, // 10 минут
    });

  // Объединяем все страницы в один массив и адаптируем типы
  const items: ClassroomPropsT[] = React.useMemo(() => {
    if (!data?.pages) {
      return [];
    }

    const flattened = data.pages.flat();
    return flattened.map(adaptClassroom);
  }, [data?.pages]);

  return {
    items,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  };
};
