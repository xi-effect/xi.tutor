// features/auth/hooks/useSignIn.ts
import { useState, useTransition } from 'react';
import { postSignin, SignInResponse } from '../api';
import { FormData } from '../model/formSchema';

export function useSignIn() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSignIn = async (data: FormData, redirect: (url: string) => void) => {
    startTransition(async () => {
      const response: SignInResponse = await postSignin(data);
      if (response.status !== 200) {
        setError('Ошибка при авторизации');
        return;
      }

      // При наличии настроек темы можно вызвать соответствующую логику:
      if (response.theme) {
        // Например, установить тему через глобальное состояние или контекст
      }

      // Обработка редиректа. Если в URL присутствует параметр "iid", перенаправляем на /invite, иначе на /communities:
      const query = new URLSearchParams(window.location.search);
      if (query.has('iid')) {
        redirect(`/invite/${query.get('iid')}`);
      } else {
        redirect('/communities');
      }
    });
  };

  return { onSignIn, isPending, error };
}
