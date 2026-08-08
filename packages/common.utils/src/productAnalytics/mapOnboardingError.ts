import type { OnboardingStepFailReason } from './types';

type ErrorLike = {
  message?: string;
  code?: string | number;
  response?: { status?: number };
};

export function mapOnboardingError(error: unknown): OnboardingStepFailReason {
  if (!error || typeof error !== 'object') return 'unknown';

  const err = error as ErrorLike;
  const status = err.response?.status;

  if (status === 400 || status === 422) return 'validation_error';
  if (status && status >= 500) return 'server_error';
  if (!status || err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
    return 'network_error';
  }

  return 'unknown';
}
