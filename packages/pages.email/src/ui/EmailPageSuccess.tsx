import { Button } from '@xipkg/button';
import { EmailPageLayout } from './EmailPageLayout';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useEmailConfirmation } from 'common.services';
import { useEmailToken } from './useEmailToken';

const Loading = () => {
  return (
    <div className="flex justify-center">
      <div
        className="text-brand-80 inline-block size-6 animate-spin rounded-full border-[3px] border-current border-t-transparent"
        role="status"
        aria-label="loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export const EmailPageSuccess = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const emailToken = useEmailToken();
  const { isLoading, isSuccess, isError, isAlreadyConfirmed } = useEmailConfirmation(emailToken);

  const handleConfirm = () => {
    navigate({ to: '/welcome/user', search: { ...search } });
  };

  const shouldShowButton = (isSuccess || isAlreadyConfirmed) && !isLoading;

  return (
    <EmailPageLayout title={isLoading ? 'Идёт подтверждение почты' : 'Вы подтвердили почту'}>
      {isLoading && (
        <div className="mt-4 flex h-full items-center justify-center">
          <Loading />
        </div>
      )}
      {isSuccess && !isLoading && (
        <div className="mt-8 flex flex-col items-center gap-1">
          <span className="text-m-base w-full text-center text-gray-100">Успешных уроков!</span>
        </div>
      )}
      {isAlreadyConfirmed && !isLoading && (
        <div className="mt-8 flex flex-col items-center gap-1">
          <span className="text-m-base w-full text-center text-gray-100">
            Почта уже подтверждена
          </span>
        </div>
      )}
      {isError && !isLoading && (
        <div className="mt-8 flex flex-col items-center gap-1">
          <span className="text-m-base w-full text-center text-gray-100">
            Ошибка при подтверждении почты
          </span>
        </div>
      )}
      {shouldShowButton && (
        <Button size="m" className="mt-16 h-[48px] w-full rounded-xl" onClick={handleConfirm}>
          Продолжить
        </Button>
      )}
    </EmailPageLayout>
  );
};
