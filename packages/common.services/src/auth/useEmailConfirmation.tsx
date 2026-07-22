import { useEffect, useRef } from 'react';
import { authApiConfig, AuthQueryKey, UserQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  PRODUCT_ANALYTICS_EVENTS,
  createAttemptId,
  getOnboardingStepMeta,
  getProductAnalyticsRole,
  inferEmailConfirmationSource,
  mapEmailConfirmationError,
  measureDurationMs,
  nowMs,
  trackOnce,
  trackProductEvent,
} from 'common.utils';

export const useEmailConfirmation = (token: string | undefined) => {
  const queryClient = useQueryClient();
  const isValidToken = !!token && token !== 'confirm';
  const attemptRef = useRef<{ attemptId: string; startedAt: number } | null>(null);
  const source = inferEmailConfirmationSource({ hasToken: isValidToken });

  useEffect(() => {
    if (isValidToken && !attemptRef.current) {
      attemptRef.current = {
        attemptId: createAttemptId(),
        startedAt: nowMs(),
      };
    }
  }, [isValidToken]);

  const { error, isLoading, isSuccess, isError } = useQuery({
    queryKey: [AuthQueryKey.EmailConfirmation, token],
    queryFn: async () => {
      if (!attemptRef.current) {
        attemptRef.current = {
          attemptId: createAttemptId(),
          startedAt: nowMs(),
        };
      }

      const axiosInst = await getAxiosInstance();
      const response = await axiosInst({
        method: authApiConfig[AuthQueryKey.EmailConfirmation].method,
        url: authApiConfig[AuthQueryKey.EmailConfirmation].getUrl(),
        data: { token },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
    enabled: isValidToken,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Почта уже подтверждена (сервер вернул 409)
  const isAlreadyConfirmed =
    isError && error instanceof AxiosError && error.response?.status === 409;

  // Инвалидируем данные пользователя после успешного подтверждения
  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: [UserQueryKey.Home] });
    }
  }, [isSuccess, queryClient]);

  useEffect(() => {
    if (!isValidToken || !attemptRef.current) return;

    const { attemptId, startedAt } = attemptRef.current;
    const durationMs = measureDurationMs(startedAt);

    if (isSuccess || isAlreadyConfirmed) {
      trackOnce(`email_confirmation_succeeded:${token}`, () => {
        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.EMAIL_CONFIRMATION_SUCCEEDED, {
          attempt_id: attemptId,
          duration_ms: durationMs,
          already_confirmed: isAlreadyConfirmed,
          source,
        });

        const user = queryClient.getQueryData<{ default_layout?: string }>([UserQueryKey.Home]);
        const role = getProductAnalyticsRole(user?.default_layout);
        const userRole = role === 'tutor' || role === 'student' ? role : 'unknown';
        const stepMeta = getOnboardingStepMeta('email_confirmation');

        trackOnce('onboarding_step_completed:email_confirmation', () => {
          trackProductEvent(PRODUCT_ANALYTICS_EVENTS.ONBOARDING_STEP_COMPLETED, {
            ...stepMeta,
            user_role: userRole,
            onboarding_stage: 'email-confirmation',
          });
        });
      });
      return;
    }

    if (isError && error) {
      trackOnce(`email_confirmation_failed:${token}`, () => {
        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.EMAIL_CONFIRMATION_FAILED, {
          attempt_id: attemptId,
          reason: mapEmailConfirmationError(error),
          duration_ms: durationMs,
          source,
        });
      });
    }
  }, [isValidToken, isSuccess, isAlreadyConfirmed, isError, error, token, source, queryClient]);

  return {
    isLoading,
    isSuccess,
    isError: isError && !isAlreadyConfirmed,
    isAlreadyConfirmed,
  };
};
