import { useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import type { UseFormSetError } from 'react-hook-form';
import { useAuth } from 'common.auth';
import {
  PRODUCT_ANALYTICS_EVENTS,
  createAttemptId,
  getHttpStatusGroup,
  getInviteTrackingIdFromContext,
  getOrCreateActivationFlowId,
  getInviteCodeFromSearch,
  getInviteFunnelEventProps,
  inferSignupEntryPoint,
  mapSignupError,
  measureDurationMs,
  nextSignupAttemptNumber,
  nowMs,
  trackProductEvent,
} from 'common.utils';

import { FormData } from '../model/formSchema';
import {
  applySignupSuccessSideEffects,
  getSignupSuccessNavigation,
  handleSignupError,
} from './signupFormLogic';

export const useSignupForm = () => {
  const { t } = useTranslation('signup');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup } = useAuth();
  const { mutate, isPending } = signup;

  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as {
    redirect?: string;
    invite?: string;
    from?: string;
  };

  const onSignupForm = async (data: FormData, setFormError: UseFormSetError<FormData>) => {
    if (isPending || isSubmitting) {
      return;
    }

    const activationFlowId = getOrCreateActivationFlowId();
    const entryPoint = inferSignupEntryPoint(search);
    const hasInvite = Boolean(getInviteCodeFromSearch(search));
    const attemptId = createAttemptId();
    const attemptNumber = nextSignupAttemptNumber();
    const startedAt = nowMs();

    setIsSubmitting(true);

    let invite_tracking_id: string | undefined;
    try {
      invite_tracking_id = await getInviteTrackingIdFromContext(search);
    } catch {
      invite_tracking_id = undefined;
    }

    const funnel = getInviteFunnelEventProps(false);

    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.AUTH_SIGNUP_SUBMIT, {
      activation_flow_id: activationFlowId,
      attempt_id: attemptId,
      entry_point: entryPoint,
      attempt_number: attemptNumber,
      invite_tracking_id,
      ...funnel,
      has_invite: hasInvite,
    });

    mutate(data, {
      onSuccess: () => {
        setIsSubmitting(false);
        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.AUTH_SIGNUP_SUCCEEDED, {
          activation_flow_id: activationFlowId,
          attempt_id: attemptId,
          entry_point: entryPoint,
          duration_ms: measureDurationMs(startedAt),
          confirmation_required: true,
          attempt_number: attemptNumber,
          invite_tracking_id,
          ...funnel,
          has_invite: hasInvite,
        });

        applySignupSuccessSideEffects({
          setPreviousPath:
            typeof window !== 'undefined'
              ? (path) => sessionStorage.setItem('previousPath', path)
              : undefined,
          reachRegistrationGoal:
            typeof window !== 'undefined' && window.ym
              ? () => window.ym?.(103653512, 'reachGoal', 'registration_complete')
              : undefined,
        });

        navigate(getSignupSuccessNavigation(search));
      },

      onError: (err: AxiosError | Error) => {
        setIsSubmitting(false);
        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.AUTH_SIGNUP_FAILED, {
          activation_flow_id: activationFlowId,
          attempt_id: attemptId,
          reason: mapSignupError(err),
          duration_ms: measureDurationMs(startedAt),
          http_status_group: getHttpStatusGroup(err),
          entry_point: entryPoint,
          attempt_number: attemptNumber,
          invite_tracking_id,
          ...funnel,
          has_invite: hasInvite,
        });

        handleSignupError(err, { t, setFormError, toast, setError });
      },
    });
  };

  return { onSignupForm, isPending: isPending || isSubmitting, error };
};
