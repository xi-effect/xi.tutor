import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { useSignin } from 'common.services';
import { useAuth } from 'common.auth';

import { FormData } from '../model/formSchema';
import { UseFormSetError } from 'react-hook-form';

type ErrorDetail = 'User not found' | 'Wrong password' | string;

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

      login();

      setTimeout(() => {
        navigate({ to: search.redirect || '/' });
      }, 10);
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const detail: ErrorDetail = error.response?.data?.detail;

        if (status === 401) {
          if (detail === 'User not found') {
            const message = t('errors.not_found_account');
            setError('email', { message });
            toast(message);
            return;
          }

          if (detail === 'Wrong password') {
            const message = t('errors.not_found_password');
            setError('password', { message });
            toast(message);
            return;
          }

          toast(t('errors.error_signin'));
          return;
        }

        if (status === 422) {
          toast(t('errors.validation_error'));
          return;
        }
      }

      toast(t('errors.error_signin'));
    } finally {
      setIsPending(false);
    }
  };

  return { onSigninForm, isPending };
};
