import { QueryProvider } from 'common.config';
import { StrictMode } from 'react';
import { RouterWithAuth } from './RouterWithAuth';

export const AppProviders = () => {
  return (
    <StrictMode>
      <QueryProvider>
        <RouterWithAuth />
      </QueryProvider>
    </StrictMode>
  );
};
