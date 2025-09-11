import { AxiosError } from 'axios';

interface ErrorInviteProps {
  error: AxiosError | Error | string;
}

export const ErrorInvite = ({ error }: ErrorInviteProps) => {
  const getErrorMessage = () => {
    // Проверяем AxiosError с статусом 409
    if (error instanceof AxiosError && error.response?.status === 409) {
      return 'Преподаватель не может принять собственное приглашение';
    }

    // Проверяем строковую ошибку
    if (typeof error === 'string') {
      return error;
    }

    // Проверяем обычную Error с сообщением 'Target is the source'
    if (error instanceof Error && error.message === 'Target is the source') {
      return 'Преподаватель не может принять собственное приглашение';
    }

    // Возвращаем сообщение ошибки или дефолтное
    return error instanceof Error ? error.message : 'Приглашение недействительно';
  };

  const getErrorDescription = () => {
    // Проверяем обычную Error с сообщением 'Target is the source'
    if (error instanceof Error && error.message === 'Target is the source') {
      return 'Вы не можете присоединиться к собственному кабинету';
    }

    // Проверяем AxiosError с статусом 409
    if (error instanceof AxiosError && error.response?.status === 409) {
      return 'Отправьте ссылку приглашения ученику';
    }

    return 'Обратитесь к репетитору за новым приглашением';
  };

  return (
    <div className="flex w-full flex-col gap-4 p-8 text-center sm:w-[400px]">
      <h4 className="text-xl-base font-semibold">{getErrorMessage()}</h4>
      <span>{getErrorDescription()}</span>
    </div>
  );
};
