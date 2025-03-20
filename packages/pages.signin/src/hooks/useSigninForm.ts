/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useTransition } from 'react';
import { FormData } from '../model/formSchema';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useSignin } from 'common.services';
import { useAuth } from 'common.config';
import { toast } from 'sonner';

type SignInResponse = {
  status: number;
  theme?: string;
};

export const useSigninForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const { signin } = useSignin();

  const { login } = useAuth();

  const navigate = useNavigate();
  const { redirect }: any = useSearch({ strict: false });

  const onSigninForm = async (data: FormData) => {
    const { email, password } = data;

    startTransition(async () => {
      const response: SignInResponse = await signin(email, password);

      if (response.status !== 200) {
        toast('Ошибка при авторизации');
        setError('Ошибка при авторизации');
        return;
      }

      // При наличии настроек темы можно вызвать соответствующую логику:
      if (response.theme) {
        // Например, установить тему через глобальное состояние или контекст
      }

      login();

      // Специальный костыль, чтобы вызвать редирект после всех перерисовок
      setTimeout(() => {
        navigate({ to: redirect || '/' });
      }, 10);
    });
  };

  return { onSigninForm, isPending, error };
};
