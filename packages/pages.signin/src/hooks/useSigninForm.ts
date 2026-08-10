import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { useSignin, useCurrentUser } from 'common.services';
import { useAuth } from 'common.auth';
import { trackUmamiSession } from 'common.utils';

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

    setIsPending(true);
    try {
      const response: SignInResponse = await signin(email, password);

      // Успешный вход
      if (response.theme) {
        // Здесь можно обработать тему
      }

      await completeSigninSuccess({
        login,
        refetchUser,
        trackUmamiSession,
        navigate,
        redirect: search.redirect,
      });
    } catch (error) {
      handleSigninError(error, { t, setError, toast });
    } finally {
      setIsPending(false);
    }
  };

  return { onSigninForm, isPending };
};
