import { PropsWithChildren, ReactElement } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { queryClient } from './query.client';

export const QueryProvider = ({ children }: PropsWithChildren): null | ReactElement => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {(import.meta.env.VITE_REACT_QUERY_DEVTOOLS_ENABLED === 'true' ||
        import.meta.env.VITE_REACT_QUERY_DEVTOOLS_ENABLED === true) && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
};
