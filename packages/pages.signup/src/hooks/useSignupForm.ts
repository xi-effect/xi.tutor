import { useState, useTransition } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { useAuth } from 'common.auth';

import { FormData } from '../model/formSchema';

const errorMap: Record<string, string> = {
  'Username already in use': 'Такое имя пользователя уже занято',
  'Email already in use': 'Аккаунт с такой почтой уже зарегистрирован',
};

export const useSignupForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const { signup } = useAuth();
  const { mutate } = signup;

  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { redirect?: string };

  const onSignupForm = (data: FormData) => {
    startTransition(() => {
      mutate(data, {
        onSuccess: () => {
          navigate({
            to: '/welcome/email/$emailId',
            params: {
              emailId: 'confirm',
            },
            search: {
              ...search,
            },
          });
        },

        onError: (error: AxiosError | Error) => {
          let customError = '';

          if (error instanceof AxiosError) {
            const errorDetail: string = error.response?.data?.detail;
            customError = errorMap[errorDetail] || 'Неизвестная ошибка Axios';

            if (!errorMap[errorDetail]) {
              console.error('Неизвестная ошибка Axios:', error);
            }
          } else {
            console.error('Неизвестная ошибка:', error);
            customError = 'Неизвестная ошибка';
          }

          toast(customError);
          setError(customError);
        },
      });
    });
  };

  return { onSignupForm, isPending, error };
};
