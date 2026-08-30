import { Component, type ReactNode } from 'react';
import * as Sentry from '@sentry/browser';
import { ErrorPage, LoadingScreen } from 'common.ui';
import { isStaleChunkError, isStaleChunkReloadPending, reloadOnceOnStaleChunk } from 'common.utils';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  staleChunkReloadFailed: boolean;
}

/**
 * ErrorBoundary компонент для перехвата ошибок React
 * Автоматически отправляет ошибки в GlitchTip через Sentry
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, staleChunkReloadFailed: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    if (reloadOnceOnStaleChunk(error) || isStaleChunkReloadPending()) {
      return;
    }

    if (isStaleChunkError(error)) {
      this.setState({ staleChunkReloadFailed: true });
    }

    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, staleChunkReloadFailed: false });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (
        !this.state.staleChunkReloadFailed &&
        (isStaleChunkReloadPending() || isStaleChunkError(this.state.error))
      ) {
        return <LoadingScreen />;
      }

      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      return (
        <ErrorPage
          title="Произошла ошибка"
          errorCode={500}
          text={this.state.error.message || 'Что-то пошло не так'}
        />
      );
    }

    return this.props.children;
  }
}
