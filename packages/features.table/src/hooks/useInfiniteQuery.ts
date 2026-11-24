import {
  useInfiniteQuery as useTanStackInfiniteQuery,
  type InfiniteData,
} from '@tanstack/react-query';
import {
  INVOICES_SEARCH_DEFAULT_LIMIT,
  UserRoleT,
  buildInvoiceSearchRequest,
  classroomPaymentsApiConfig,
  getNextRecipientInvoicesCursor,
  paymentsApiConfig,
  serializeInvoiceFilters,
  type InvoiceSearchFilters,
  type RecipientInvoiceCursor,
} from 'common.api';
import { getAxiosInstance, QUERY_FRESHNESS_MS } from 'common.config';
import { getRolePaymentsQueryKey } from 'common.services';
import { RolePaymentT } from 'features.table';
import React, { RefObject } from 'react';

export const useInfiniteQuery = (
  parentRef: RefObject<HTMLDivElement | null>,
  role: UserRoleT,
  classroomId?: string,
  enabled = true,
  filters?: InvoiceSearchFilters,
) => {
  const queryKey = getRolePaymentsQueryKey(role);
  const filterKey = serializeInvoiceFilters(role, filters);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useTanStackInfiniteQuery<
      RolePaymentT<UserRoleT>[],
      Error,
      InfiniteData<RolePaymentT<UserRoleT>[], RecipientInvoiceCursor | undefined>,
      readonly unknown[],
      RecipientInvoiceCursor | undefined
    >({
      queryKey: [queryKey, role, classroomId || 'all', filterKey],
      enabled,
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
          data: buildInvoiceSearchRequest(
            role,
            pageParam ?? null,
            INVOICES_SEARCH_DEFAULT_LIMIT,
            filters,
          ),
        });

        return response.data;
      },
      initialPageParam: undefined,
      getNextPageParam: (lastPage) =>
        getNextRecipientInvoicesCursor(lastPage, INVOICES_SEARCH_DEFAULT_LIMIT),
      staleTime: QUERY_FRESHNESS_MS,
      gcTime: QUERY_FRESHNESS_MS,
    });

  // Обработчик скролла для автоматической загрузки следующей страницы
  React.useEffect(() => {
    if (!parentRef.current) return;
    const el = parentRef.current;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;

      if (distanceToBottom < 100 && hasNextPage && !isFetchingNextPage) {
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
