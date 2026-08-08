import { Logo } from 'common.ui';
import { Button } from '@xipkg/button';
import { useNavigate } from '@tanstack/react-router';
import { useEmailChange } from 'common.services';
import { useEffect, useRef } from 'react';
import { SupportPageShell } from 'modules.navigation';
import { useTranslation } from 'react-i18next';
import { useConfirmEmailToken } from './useConfirmEmailToken';

const Loading = () => {
  return (
    <div className="flex justify-center">
      <div
        className="text-text-link inline-block size-6 animate-spin rounded-full border-[3px] border-current border-t-transparent"
        role="status"
        aria-label="loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export const EmailPageConfirm = () => {
  const { t } = useTranslation('emailConfirm');
  const navigate = useNavigate();
  const emailToken = useConfirmEmailToken();
  const { emailChange } = useEmailChange();
  const lastEmailIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Вызываем мутацию только если token изменился (из path или query), это первый рендер и мутация не выполняется
    if (
      emailToken &&
      emailToken !== lastEmailIdRef.current &&
      !emailChange.isPending &&
      !emailChange.isSuccess &&
      !emailChange.isError
    ) {
      lastEmailIdRef.current = emailToken;

      // Используем mutateAsync для явной обработки ошибок
      emailChange.mutateAsync({ token: emailToken }).catch((err) => {
        // Явно обрабатываем ошибку, чтобы гарантировать завершение мутации
        console.error('Email confirmation error:', err);
      });
    }
    // emailChange.mutateAsync - стабильная функция из React Query, не требует включения в зависимости
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailToken, emailChange.isPending, emailChange.isSuccess, emailChange.isError]);

  // Используем состояние мутации напрямую
  const isLoading = emailChange.isPending;
  const isSuccess = emailChange.isSuccess;
  const hasError = emailChange.isError || !!emailChange.error;

  return (
    <SupportPageShell>
      <div className="flex w-full flex-1 flex-col items-center justify-center p-1 py-4">
        <div className="xs:border xs:border-border-default xs:rounded-2xl flex min-h-[348px] w-full max-w-[420px] bg-transparent">
          <div className="xs:p-8 flex w-full flex-col items-center p-4">
            <div className="h-8">
              <Logo height={32} width={108} />
            </div>
            {isLoading && (
              <div className="mt-4 flex items-center justify-center py-8">
                <Loading />
              </div>
            )}
            {isSuccess && !isLoading && (
              <div
                id="title"
                className="text-l-base text-text-primary mt-4 flex items-center justify-center py-8 font-semibold"
              >
                {t('success')}
              </div>
            )}
            {hasError && !isLoading && (
              <div id="title" className="text-l-base text-text-primary mt-4 font-semibold">
                {t('error')}
              </div>
            )}
            {isSuccess && !isLoading && (
              <Button
                size="m"
                className="h-[48px] w-full rounded-xl"
                onClick={() => navigate({ to: '/' })}
              >
                {t('backToApp')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </SupportPageShell>
  );
};
