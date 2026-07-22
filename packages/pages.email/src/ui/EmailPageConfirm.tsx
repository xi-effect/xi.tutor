import { useEffect, useState, useMemo } from 'react';
import { EmailPageLayout } from './EmailPageLayout';
import { Button } from '@xipkg/button';
import { useCurrentUser, useEmailConfirmationRequest } from 'common.services';
import { Alert, AlertIcon, AlertContainer, AlertDescription } from '@xipkg/alert';
import { InfoCircle } from '@xipkg/icons';
import {
  PRODUCT_ANALYTICS_EVENTS,
  getOnboardingStepMeta,
  inferEmailConfirmationSource,
  markOnboardingStartedAt,
  resolveOnboardingAnalyticsRole,
  trackOnce,
  trackProductEvent,
} from 'common.utils';

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

// Вычисляет оставшееся время до разрешенной повторной отправки
const calculateTimeRemaining = (allowedAt: string | null | undefined): number => {
  if (!allowedAt) return 0;

  const allowedDate = new Date(allowedAt);
  const now = new Date();
  const diffInSeconds = Math.floor((allowedDate.getTime() - now.getTime()) / 1000);

  return Math.max(0, diffInSeconds);
};

export const EmailPageConfirm = () => {
  const { data: user } = useCurrentUser();
  const email = user?.email || 'вашу почту';
  const { emailConfirmationRequest, isLoading } = useEmailConfirmationRequest();
  const source = inferEmailConfirmationSource();

  useEffect(() => {
    const userRole = resolveOnboardingAnalyticsRole(user?.default_layout);
    const stepMeta = getOnboardingStepMeta('email_confirmation');

    trackOnce('email_confirmation_viewed', () => {
      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.EMAIL_CONFIRMATION_VIEWED, {
        source,
        onboarding_stage: user?.onboarding_stage ?? 'email-confirmation',
      });
    });

    trackOnce('onboarding_started', () => {
      markOnboardingStartedAt();
      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.ONBOARDING_STARTED, {
        user_role: userRole,
        onboarding_stage: user?.onboarding_stage ?? 'email-confirmation',
      });
    });

    trackOnce('onboarding_step_viewed:email_confirmation', () => {
      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.ONBOARDING_STEP_VIEWED, {
        ...stepMeta,
        user_role: userRole,
        onboarding_stage: user?.onboarding_stage ?? 'email-confirmation',
      });
    });
  }, [source, user?.default_layout, user?.onboarding_stage]);

  // Вычисляем оставшееся время на основе данных с бэкенда
  const timeRemaining = useMemo(() => {
    return calculateTimeRemaining(user?.email_confirmation_resend_allowed_at);
  }, [user?.email_confirmation_resend_allowed_at]);

  // Локальное состояние для отображения таймера (обновляется каждую секунду)
  const [displayTimeRemaining, setDisplayTimeRemaining] = useState(timeRemaining);

  // Обновляем отображаемое время при изменении данных пользователя
  useEffect(() => {
    setDisplayTimeRemaining(timeRemaining);
  }, [timeRemaining]);

  // Обновляем таймер каждую секунду
  useEffect(() => {
    if (displayTimeRemaining === 0) return;

    const interval = setInterval(() => {
      setDisplayTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [displayTimeRemaining]);

  const handleConfirm = () => {
    if (isLoading) return;

    // Кнопка кликабельна и при cooldown — чтобы зафиксировать blocked-попытки
    if (displayTimeRemaining > 0) {
      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.EMAIL_CONFIRMATION_RESEND_BLOCKED, {
        reason: 'cooldown',
        cooldown_seconds_left: displayTimeRemaining,
        source,
      });
      return;
    }

    emailConfirmationRequest.mutate();
  };

  const isOnCooldown = displayTimeRemaining > 0;
  const buttonText = isOnCooldown ? 'Отправить ещё раз' : 'Получить новую ссылку';
  const showHint = !isOnCooldown && !isLoading;

  return (
    <EmailPageLayout title="Подтвердите почту">
      <div className="mt-8 flex flex-col items-center gap-1">
        <span className="text-m-base w-full text-center text-gray-100">
          Перейдите по ссылке — отправили её на
        </span>
        <span className="text-m-base w-full text-center text-gray-100">{email}</span>
      </div>
      <Button
        size="m"
        className={`mt-16 h-[48px] w-full rounded-xl${isOnCooldown ? 'opacity-60' : ''}`}
        onClick={handleConfirm}
        disabled={isLoading}
        aria-disabled={isOnCooldown || isLoading}
        data-umami-event="email-confirm-button-resend"
      >
        {buttonText}
      </Button>
      {displayTimeRemaining > 0 && (
        <span className="text-xxs-base text-gray-60 mt-1 w-full text-center">
          Следующее письмо можно отправить через {formatTime(displayTimeRemaining)}
        </span>
      )}
      {showHint && (
        <span className="text-xxs-base text-gray-60 mt-1 w-full text-center">
          Если письмо не пришло, проверьте адрес и нажмите на эту кнопку
        </span>
      )}
      <div className="mt-8">
        <Alert className="h-full w-full" variant="brand">
          <AlertIcon>
            <InfoCircle className="fill-brand-100" />
          </AlertIcon>
          <AlertContainer className="h-full">
            <AlertDescription>
              Если письмо долго не приходит, проверьте папку «Спам» в вашей почте
            </AlertDescription>
          </AlertContainer>
        </Alert>
      </div>
    </EmailPageLayout>
  );
};
