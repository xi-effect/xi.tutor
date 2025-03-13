import { useState, useTransition } from 'react';
import { FormData } from '../model/formSchema';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useSignin } from 'common.services';
import { useAuth } from 'common.config';

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
  const search = useSearch({ strict: false });

  const onSigninForm = async (data: FormData) => {
    const { email, password } = data;

    startTransition(async () => {
      const response: SignInResponse = await signin(email, password);
      console.log('response', response);

      if (response.status !== 200) {
        setError('Ошибка при авторизации');
        return;
      }

      // При наличии настроек темы можно вызвать соответствующую логику:
      if (response.theme) {
        // Например, установить тему через глобальное состояние или контекст
      }

      // Обработка редиректа. Если в URL присутствует параметр "iid", перенаправляем на /invite, иначе на /communities:
      // const query = new URLSearchParams(window.location.search);
      console.log('search', search);
      login();

      setTimeout(() => {
        navigate({ to: search.redirect || '/' });
      }, 10);
    });
  };

  return { onSigninForm, isPending, error };
};
