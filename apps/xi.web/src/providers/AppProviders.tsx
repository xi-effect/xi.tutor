import { QueryProvider } from 'common.config';
import { StrictMode } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { RouterWithAuth } from './RouterWithAuth';

export const AppProviders = () => {
  return (
    <StrictMode>
      <ErrorBoundary>
        <QueryProvider>
          <RouterWithAuth />
        </QueryProvider>
      </ErrorBoundary>
    </StrictMode>
  );
};
