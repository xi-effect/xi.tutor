import { authApiConfig, AuthQueryKey, UserQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError, showSuccess } from 'common.services';
import {
  PRODUCT_ANALYTICS_EVENTS,
  createAttemptId,
  inferEmailConfirmationSource,
  mapEmailConfirmationError,
  measureDurationMs,
  nextEmailResendAttemptNumber,
  nowMs,
  trackProductEvent,
} from 'common.utils';

export const useEmailConfirmationRequest = () => {
  const queryClient = useQueryClient();

  const emailConfirmationRequestMutation = useMutation({
    mutationFn: async () => {
      const attemptId = createAttemptId();
      const startedAt = nowMs();
      const attemptNumber = nextEmailResendAttemptNumber();
      const source = inferEmailConfirmationSource();

      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.EMAIL_CONFIRMATION_RESEND_SUBMIT, {
        attempt_id: attemptId,
        attempt_number: attemptNumber,
        source,
      });

      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: authApiConfig[AuthQueryKey.EmailConfirmationRequest].method,
          url: authApiConfig[AuthQueryKey.EmailConfirmationRequest].getUrl(),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.EMAIL_CONFIRMATION_RESEND_SUCCEEDED, {
          attempt_id: attemptId,
          duration_ms: measureDurationMs(startedAt),
          attempt_number: attemptNumber,
          source,
        });

        return response;
      } catch (error) {
        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.EMAIL_CONFIRMATION_RESEND_FAILED, {
          attempt_id: attemptId,
          reason: mapEmailConfirmationError(error),
          duration_ms: measureDurationMs(startedAt),
          attempt_number: attemptNumber,
          source,
        });
        throw error;
      }
    },
    onError: (err) => {
      console.log('err', err);
      handleError(err, 'emailConfirmation');
    },
    onSuccess: () => {
      // Инвалидируем данные пользователя после успешного запроса подтверждения email
      queryClient.invalidateQueries({ queryKey: [UserQueryKey.Home] });
      showSuccess('profile', 'Письмо для подтверждения email было отправлено');
    },
    onSettled: () => {
      // Гарантируем, что мутация завершится в любом случае
      // Это помогает React Query правильно обновить состояние мутации
    },
  });

  return {
    emailConfirmationRequest: emailConfirmationRequestMutation,
    isLoading: emailConfirmationRequestMutation.isPending,
    isSuccess: emailConfirmationRequestMutation.isSuccess,
    isError: emailConfirmationRequestMutation.isError,
  };
};
