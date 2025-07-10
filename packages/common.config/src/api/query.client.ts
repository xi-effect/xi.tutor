import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      networkMode: 'offlineFirst',
    },
    queries: {
      networkMode: 'offlineFirst',
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 30, // 30 minutes
      retry: false,
    },
  },
});
