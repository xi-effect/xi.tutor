import { PropsWithChildren, ReactElement, useMemo } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { ApiContext, Logger } from './api.context';
import { ApiConfig } from './api-config.types';
import { queryClient } from './query.client';

type Props<MainQueryKey extends string> = {
  config: ApiConfig<MainQueryKey>;
  logger: Logger;
};

export const QueryProvider = <MainQueryKey extends string>({
  children,
  config,
  logger,
}: PropsWithChildren<Props<MainQueryKey>>): null | ReactElement => {
  const value = useMemo(() => ({ config, logger }), [config, logger]);

  return (
    <ApiContext.Provider {...{ value }}>
      <QueryClientProvider {...{ client: queryClient }}>
        {children}
        {import.meta.env.VITE_DEVTOOLS_ENABLED && <ReactQueryDevtools />}
      </QueryClientProvider>
    </ApiContext.Provider>
  );
};
