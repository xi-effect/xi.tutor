import { QueryClient } from '@tanstack/react-query';

/** Ответ свежий и остаётся в кэше без подписчиков. Дольше этого срока следующий заход запрашивает данные снова. */
export const QUERY_FRESHNESS_MS = 1000 * 60 * 30;

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      networkMode: 'offlineFirst',
    },
    queries: {
      networkMode: 'offlineFirst',
      refetchOnWindowFocus: false,
      staleTime: QUERY_FRESHNESS_MS,
      gcTime: QUERY_FRESHNESS_MS,
      retry: false,
    },
  },
});
