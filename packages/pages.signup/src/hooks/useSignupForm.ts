import { useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { useAuth } from 'common.auth';
import {
  PRODUCT_ANALYTICS_EVENTS,
  createAttemptId,
  getHttpStatusGroup,
  getOrCreateActivationFlowId,
  inferSignupEntryPoint,
  mapSignupError,
  measureDurationMs,
  nextSignupAttemptNumber,
  nowMs,
  trackProductEvent,
} from 'common.utils';

import { FormData } from '../model/formSchema';

const errorMap: Record<string, string> = {
  'Username already in use': 'Такое имя пользователя уже занято',
  'Email already in use': 'Аккаунт с такой почтой уже зарегистрирован',
};

export const useSignupForm = () => {
  const [error, setError] = useState<string | null>(null);

  const { signup } = useAuth();
  const { mutate, isPending } = signup;

  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as {
    redirect?: string;
    invite?: string;
    from?: string;
  };

  const onSignupForm = (data: FormData) => {
    if (isPending) {
      return;
    }

    const activationFlowId = getOrCreateActivationFlowId();
    const entryPoint = inferSignupEntryPoint(search);
    const hasInvite = Boolean(search.invite) || entryPoint === 'invite';
    const attemptId = createAttemptId();
    const attemptNumber = nextSignupAttemptNumber();
    const startedAt = nowMs();

    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.AUTH_SIGNUP_SUBMIT, {
      activation_flow_id: activationFlowId,
      attempt_id: attemptId,
      entry_point: entryPoint,
      attempt_number: attemptNumber,
      has_invite: hasInvite,
    });

    mutate(data, {
      onSuccess: () => {
        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.AUTH_SIGNUP_SUCCEEDED, {
          activation_flow_id: activationFlowId,
          attempt_id: attemptId,
          entry_point: entryPoint,
          duration_ms: measureDurationMs(startedAt),
          confirmation_required: true,
          attempt_number: attemptNumber,
          has_invite: hasInvite,
        });

        // Сохраняем предыдущий путь для страницы подтверждения email
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('previousPath', '/signup');
        }

        // Отправляем цель в Яндекс.Метрику
        if (typeof window !== 'undefined' && window.ym) {
          window.ym(103653512, 'reachGoal', 'registration_complete');
        }

        navigate({
          to: '/welcome/email',
          search: {
            ...search,
          },
        });
      },

      onError: (err: AxiosError | Error) => {
        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.AUTH_SIGNUP_FAILED, {
          activation_flow_id: activationFlowId,
          attempt_id: attemptId,
          reason: mapSignupError(err),
          duration_ms: measureDurationMs(startedAt),
          http_status_group: getHttpStatusGroup(err),
          entry_point: entryPoint,
          attempt_number: attemptNumber,
          has_invite: hasInvite,
        });

        let customError = '';

        if (err instanceof AxiosError) {
          const errorDetail: string = err.response?.data?.detail;
          customError = errorMap[errorDetail] || 'Неизвестная ошибка Axios';

          if (!errorMap[errorDetail]) {
            console.error('Неизвестная ошибка Axios:', err);
          }
        } else {
          console.error('Неизвестная ошибка:', err);
          customError = 'Неизвестная ошибка';
        }

        toast(customError);
        setError(customError);
      },
    });
  };

  return { onSignupForm, isPending, error };
};
