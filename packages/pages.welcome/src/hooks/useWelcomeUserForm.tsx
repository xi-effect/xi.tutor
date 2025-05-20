import { useState, useTransition } from 'react';
import { useNavigate } from '@tanstack/react-router';
// import { AxiosError } from 'axios';
// import { toast } from 'sonner';

export const useWelcomeUserForm = () => {
  const [isPending] = useTransition();
  const [error] = useState<string | null>(null);
  const navigate = useNavigate();

  // const errorMap: Record<string, string> = {
  // 'Username already in use': 'Такое имя пользователя уже занято',
  // 'Authorization is missing': 'Требуется авториация',
  // 'Session is invalid': 'Сессия недействительна',
  // 'Validation Error': 'Ошибка валидации'
  // };

  const onWelcomeUserForm = () => {
    navigate({
      to: '/welcome/role',
    });
    // const { mutate } = updateProfile;

    // startTransition(() => {
    //   mutate(data, {
    //     onSuccess: () => {
    //       navigate({
    //         to: '/welcome/role',
    //       });
    //     },

    //     onError: (error: AxiosError | Error) => {
    //       let customError = '';

    //       if (error instanceof AxiosError) {
    //         const errorDetail: string = error.response?.data?.detail;
    //         customError = errorMap[errorDetail] || 'Неизвестная ошибка Axios';

    //         if (!errorMap[errorDetail]) {
    //           console.error('Неизвестная ошибка Axios:', error);
    //         }
    //       } else {
    //         console.error('Неизвестная ошибка:', error);
    //         customError = 'Неизвестная ошибка';
    //       }

    //       toast(customError);
    //       setError(customError);
    //     },
    //   });
    // });
  };

  return { onWelcomeUserForm, isPending, error };
};
