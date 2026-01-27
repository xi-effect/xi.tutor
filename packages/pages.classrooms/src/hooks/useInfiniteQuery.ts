import { useInfiniteQuery as useTanStackInfiniteQuery } from '@tanstack/react-query';
import { classroomsApiConfig, ClassroomsQueryKey, ClassroomT } from 'common.api';
import { getAxiosInstance } from 'common.config';
import React, { RefObject } from 'react';
import { ClassroomPropsT } from '../types';

// Адаптер для преобразования ClassroomT в ClassroomPropsT
const adaptClassroom = (classroom: ClassroomT): ClassroomPropsT => ({
  id: classroom.id,
  name: classroom.name,
  status: classroom.status,
  kind: classroom.kind,
  description: classroom.description || undefined,
  created_at: classroom.created_at,
  student_id: 'student_id' in classroom ? classroom.student_id : undefined,
  subject_id: classroom.subject_id,
});

export const useInfiniteQuery = (parentRef: RefObject<HTMLDivElement | null>) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useTanStackInfiniteQuery({
      queryKey: [ClassroomsQueryKey.GetClassrooms],
      queryFn: async ({ pageParam }) => {
        const axiosInst = await getAxiosInstance();
        const url = classroomsApiConfig[ClassroomsQueryKey.GetClassrooms].getUrl();

        const response = await axiosInst({
          method: classroomsApiConfig[ClassroomsQueryKey.GetClassrooms].method,
          url,
          params: {
            limit: 20,
            created_before: pageParam,
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

        const nextParam = lastPage[lastPage.length - 1].created_at;
        return nextParam;
      },
      staleTime: 5 * 60 * 1000, // 5 минут
      gcTime: 10 * 60 * 1000, // 10 минут
    });

  // Обработчик скролла для автоматической загрузки следующей страницы
  React.useEffect(() => {
    if (!parentRef.current) return;
    const el = parentRef.current;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;

      if (distanceToBottom < 100 && !isFetchingNextPage) {
        fetchNextPage();
      }
    };

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [parentRef, fetchNextPage, isFetchingNextPage, hasNextPage]);

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
  };
};
