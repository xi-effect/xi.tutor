import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { useSignin, useCurrentUser } from 'common.services';
import { useAuth } from 'common.auth';
import {
  PRODUCT_ANALYTICS_EVENTS,
  getActivationFlowId,
  getInviteTrackingIdFromContext,
  getOrCreateActivationFlowId,
  inferSigninSource,
  mapSigninError,
  trackProductEvent,
  trackUmamiSession,
} from 'common.utils';

import { FormData } from '../model/formSchema';
import { UseFormSetError } from 'react-hook-form';
import { completeSigninSuccess, handleSigninError } from './signinFormLogic';

type SignInResponse = {
  status: number;
  theme?: string;
};

export const useSigninForm = () => {
  const { t } = useTranslation('signin');

  const [isPending, setIsPending] = useState(false);
  const { signin } = useSignin();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { refetch: refetchUser } = useCurrentUser();

  const search = useSearch({ strict: false }) as { redirect?: string };

  const onSigninForm = async (data: FormData, setError: UseFormSetError<FormData>) => {
    if (isPending) {
      return;
    }

    const { email, password } = data;
    const source = inferSigninSource(search);
    const activationFlowId =
      source === 'invite' ? getOrCreateActivationFlowId() : getActivationFlowId();

    let invite_tracking_id: string | undefined;
    try {
      invite_tracking_id = await getInviteTrackingIdFromContext(search);
    } catch {
      invite_tracking_id = undefined;
    }

    setIsPending(true);
    try {
      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.AUTH_SIGNIN_SUBMIT, {
        source,
        invite_tracking_id,
        activation_flow_id: activationFlowId,
      });

      const response: SignInResponse = await signin(email, password);

      // Успешный вход
      if (response.theme) {
        // Здесь можно обработать тему
      }

      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.AUTH_SIGNIN_SUCCEEDED, {
        source,
        invite_tracking_id,
        activation_flow_id: activationFlowId,
      });

      await completeSigninSuccess({
        login,
        refetchUser,
        trackUmamiSession,
        navigate,
        redirect: search.redirect,
      });
    } catch (error) {
      try {
        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.AUTH_SIGNIN_FAILED, {
          reason: mapSigninError(error),
          source,
          invite_tracking_id,
          activation_flow_id: activationFlowId,
        });
      } catch {
        // Аналитика не должна ломать авторизацию
      }

      handleSigninError(error, { t, setError, toast });
    } finally {
      setIsPending(false);
    }
  };

  return { onSigninForm, isPending };
};
