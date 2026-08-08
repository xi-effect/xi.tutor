import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

interface ErrorInviteProps {
  error: AxiosError | Error | string;
}

export const ErrorInvite = ({ error }: ErrorInviteProps) => {
  const { t } = useTranslation('invites');

  const getErrorMessage = () => {
    // Проверяем AxiosError с статусом 409
    if (error instanceof AxiosError && error.response?.status === 409) {
      return t('error.selfInviteTitle');
    }

    // Проверяем строковую ошибку
    if (typeof error === 'string') {
      return error;
    }

    // Проверяем обычную Error с сообщением 'Target is the source'
    if (error instanceof Error && error.message === 'Target is the source') {
      return t('error.selfInviteTitle');
    }

    // Возвращаем сообщение ошибки или дефолтное
    return error instanceof Error ? error.message : t('error.invalid');
  };

  const getErrorDescription = () => {
    // Проверяем обычную Error с сообщением 'Target is the source'
    if (error instanceof Error && error.message === 'Target is the source') {
      return t('error.selfInviteDescription');
    }

    // Проверяем AxiosError с статусом 409
    if (error instanceof AxiosError && error.response?.status === 409) {
      return t('error.selfInviteHint');
    }

    return t('error.askTutor');
  };

  return (
    <div className="flex w-full flex-col gap-4 p-8 text-center sm:w-[400px]">
      <h4 className="text-xl-base text-text-primary dark:text-text-primary font-semibold">
        {getErrorMessage()}
      </h4>
      <span className="text-text-primary dark:text-text-primary">{getErrorDescription()}</span>
    </div>
  );
};
