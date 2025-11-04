import { Logo } from 'common.ui';
import { Button } from '@xipkg/button';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useEmailChange } from 'common.services';
import { useEffect, useRef } from 'react';

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

export const EmailPageConfirm = () => {
  const navigate = useNavigate();

  const { emailId } = useParams({ strict: false });

  const { emailChange } = useEmailChange();
  const lastEmailIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Вызываем мутацию только если emailId изменился, это первый рендер и мутация не выполняется
    if (
      emailId &&
      emailId !== lastEmailIdRef.current &&
      !emailChange.isPending &&
      !emailChange.isSuccess &&
      !emailChange.isError
    ) {
      lastEmailIdRef.current = emailId;

      // Используем mutateAsync для явной обработки ошибок
      emailChange.mutateAsync({ token: emailId }).catch((err) => {
        // Явно обрабатываем ошибку, чтобы гарантировать завершение мутации
        console.error('Email confirmation error:', err);
      });
    }
    // emailChange.mutateAsync - стабильная функция из React Query, не требует включения в зависимости
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailId, emailChange.isPending, emailChange.isSuccess, emailChange.isError]);

  // Используем состояние мутации напрямую
  const isLoading = emailChange.isPending;
  const isSuccess = emailChange.isSuccess;
  const hasError = emailChange.isError || !!emailChange.error;

  return (
    <div className="xs:h-screen dark:bg-gray-0 flex h-dvh w-screen flex-col flex-wrap content-center justify-center p-1">
      <div className="xs:border xs:border-gray-10 xs:rounded-2xl dark:bg-gray-5 flex min-h-[348px] w-full max-w-[420px]">
        <div className="xs:p-8 flex h-full w-full flex-col items-center">
          <div className="h-8">
            <Logo height={32} width={108} />
          </div>
          {isLoading && (
            <div className="mt-4 flex h-full items-center justify-center">
              <Loading />
            </div>
          )}
          {isSuccess && !isLoading && (
            <div
              id="title"
              className="text-l-base mt-4 flex flex-1 items-center justify-center font-semibold text-gray-100"
            >
              Почта подтверждена
            </div>
          )}
          {hasError && !isLoading && (
            <div id="title" className="text-l-base mt-4 font-semibold text-gray-100">
              Ошибка при подтверждении почты
            </div>
          )}
          {isSuccess && !isLoading && (
            <Button
              size="m"
              className="h-[48px] w-full rounded-xl"
              onClick={() => navigate({ to: '/' })}
            >
              Вернуться в приложение
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
