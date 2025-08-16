import { useInfiniteQuery as useTanStackInfiniteQuery } from '@tanstack/react-query';
import { RefObject } from 'react';
import { ClassroomPropsT } from '../types';
import { getAxiosInstance } from 'common.config';
import { classroomsApiConfig, ClassroomsQueryKey } from 'common.api';
import React from 'react';

export const useInfiniteQuery = (parentRef: RefObject<HTMLDivElement | null>) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useTanStackInfiniteQuery({
      queryKey: [ClassroomsQueryKey.SearchClassrooms],
      queryFn: async ({ pageParam }) => {
        const axiosInst = await getAxiosInstance();
        const url = classroomsApiConfig[ClassroomsQueryKey.SearchClassrooms].getUrl();

        const response = await axiosInst({
          method: classroomsApiConfig[ClassroomsQueryKey.SearchClassrooms].method,
          url,
          data: {
            limit: 20,
            last_opened_before: pageParam,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return response.data;
      },
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => {
        if (!lastPage || lastPage.length === 0) {
          return undefined;
        }

        // Предполагаем, что API возвращает поле для пагинации
        // Адаптируйте под реальную структуру ответа API
        const nextParam = lastPage[lastPage.length - 1].last_opened_at;
        return nextParam;
      },
      staleTime: 5 * 60 * 1000, // 5 минут
      gcTime: 10 * 60 * 1000, // 10 минут
    });

  // Обработчик скролла для автоматической загрузки следующей страницы
  React.useEffect(() => {
    const handleScroll = () => {
      if (!parentRef.current || isFetchingNextPage || !hasNextPage) {
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;

      if (distanceToBottom < 100) {
        fetchNextPage();
      }
    };

    const el = parentRef.current;
    if (!el) return;

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [parentRef, fetchNextPage, isFetchingNextPage, hasNextPage]);

  // Объединяем все страницы в один массив
  const items: ClassroomPropsT[] = React.useMemo(() => {
    if (!data?.pages) {
      return [];
    }

    const flattened = data.pages.flat();
    return flattened;
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
