import { useEffect, useState } from 'react';
import { EmailPageLayout } from './EmailPageLayout';
import { Button } from '@xipkg/button';
import { useCurrentUser, useEmailConfirmationRequest } from 'common.services';

const INITIAL_TIMER_SECONDS = 10 * 60; // 10 минут в секундах

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

export const EmailPageConfirm = () => {
  const { data: user } = useCurrentUser();
  const email = user?.email || '';
  const [timeRemaining, setTimeRemaining] = useState(0);
  const { emailConfirmationRequest, isLoading } = useEmailConfirmationRequest();

  useEffect(() => {
    if (timeRemaining === 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  // Останавливаем таймер во время загрузки
  useEffect(() => {
    if (isLoading && timeRemaining > 0) {
      setTimeRemaining(0);
    }
  }, [isLoading, timeRemaining]);

  // Запускаем таймер после успешной отправки
  useEffect(() => {
    if (emailConfirmationRequest.isSuccess) {
      setTimeRemaining(INITIAL_TIMER_SECONDS);
    }
  }, [emailConfirmationRequest.isSuccess]);

  const handleConfirm = () => {
    if (timeRemaining > 0 || isLoading) return;
    emailConfirmationRequest.mutate();
  };

  const isButtonDisabled = timeRemaining > 0 || isLoading;
  const buttonText = timeRemaining > 0 ? 'Отправить ещё раз' : 'Получить новую ссылку';
  const showHint = timeRemaining === 0 && !isLoading;

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
        className="mt-16 h-[48px] w-full rounded-xl"
        onClick={handleConfirm}
        disabled={isButtonDisabled}
      >
        {buttonText}
      </Button>
      {timeRemaining > 0 && (
        <span className="text-xxs-base text-gray-60 mt-1 w-full text-center">
          Следующее письмо можно отправить через {formatTime(timeRemaining)}
        </span>
      )}
      {showHint && (
        <span className="text-xxs-base text-gray-60 mt-1 w-full text-center">
          Если письмо не пришло, проверьте адрес и нажмите на эту кнопку
        </span>
      )}
    </EmailPageLayout>
  );
};
