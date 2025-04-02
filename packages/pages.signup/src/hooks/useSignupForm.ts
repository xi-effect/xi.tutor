import { useState, useTransition } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { useAuth } from 'common.config';

import { FormData } from '../model/formSchema';

export const useSignupForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const { signup } = useAuth();
  const { mutate } = signup;

  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false });

  const onSignupForm = (data: FormData) => {
    startTransition(() => {
      mutate(data, {
        onSuccess: () => {
          if (searchParams.iid && searchParams.community) {
            navigate({
              to: "/welcome/user",
              search: { iid: searchParams.iid, community: searchParams.community },
            });
          } else {
            navigate({
              to: "/welcome/user",
            });
          }
        },

        onError: (error) => {
          let customError = '';

          if (error instanceof AxiosError) {
            switch(error.response?.data?.detail) {
              case 'Username already in use':
                customError = 'Такое имя пользователя уже занято';
                break;
              case 'Email already in use':
                customError = 'Аккаунт с такой почтой уже зарегистрирован';
                break;
              default:
                console.error('Неизвестная ошибка Axios:', error);
                customError = 'Неизвестная ошибка Axios';
            }
          } else {
            console.error('Неизвестная ошибка:', error);
            customError = 'Неизвестная ошибка';
          }

          toast(customError);
          setError(customError);
        }
      });
    }); 
  };

  return { onSignupForm, isPending, error };
};
