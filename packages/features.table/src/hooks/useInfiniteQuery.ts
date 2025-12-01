import React, { RefObject } from 'react';
import { useInfiniteQuery as useTanStackInfiniteQuery } from '@tanstack/react-query';
import { RolePaymentT } from 'features.table';
import { getAxiosInstance } from 'common.config';
import { paymentsApiConfig, classroomPaymentsApiConfig, UserRoleT } from 'common.api';
import { getRolePaymentsQueryKey } from 'common.services';

export const useInfiniteQuery = (
  parentRef: RefObject<HTMLDivElement | null>,
  role: UserRoleT,
  classroomId?: string,
) => {
  const queryKey = getRolePaymentsQueryKey(role);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useTanStackInfiniteQuery<RolePaymentT<UserRoleT>[], unknown>({
      queryKey: [queryKey, role, classroomId || 'all'],
      queryFn: async ({ pageParam }) => {
        const axiosInst = await getAxiosInstance();
        const url = classroomId
          ? classroomPaymentsApiConfig[queryKey].getUrl(classroomId)
          : paymentsApiConfig[queryKey].getUrl();

        const response = await axiosInst({
          method: paymentsApiConfig[queryKey].method,
          url,
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            cursor: pageParam ?? null,
            limit: 12,
          },
        });

        return response.data;
      },
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => {
        if (!lastPage || lastPage.length === 0) {
          return undefined;
        }
        const lastItem = lastPage[lastPage.length - 1];
        return {
          created_at: lastItem.created_at,
          recipient_invoice_id: lastItem.id,
        };
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

  // Объединяем все страницы в один массив
  const items: RolePaymentT<UserRoleT>[] = React.useMemo(() => {
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
    fetchNextPage,
  };
};
