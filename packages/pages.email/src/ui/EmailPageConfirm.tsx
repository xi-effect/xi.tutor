import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { EmailPageLayout } from './EmailPageLayout';
import { Button } from '@xipkg/button';

type EmailPageConfirmPropsT = {
  setStatus: Dispatch<SetStateAction<'confirm' | 'success'>>;
};

const INITIAL_TIMER_SECONDS = 10 * 60; // 09:38 в секундах

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

export const EmailPageConfirm = ({ setStatus }: EmailPageConfirmPropsT) => {
  const [timeRemaining, setTimeRemaining] = useState(INITIAL_TIMER_SECONDS);

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

  const handleConfirm = () => {
    if (timeRemaining > 0) return;
    setStatus('success');
    setTimeRemaining(INITIAL_TIMER_SECONDS);
  };

  const isButtonDisabled = timeRemaining > 0;

  return (
    <EmailPageLayout title="Подтвердите почту">
      <div className="mt-8 flex flex-col items-center gap-1">
        <span className="text-m-base w-full text-center text-gray-100">
          Перейдите по ссылке — отправили её на
        </span>
        <span className="text-m-base w-full text-center text-gray-100">example@example.com</span>
      </div>
      <Button
        size="m"
        className="mt-16 h-[48px] w-full rounded-xl"
        onClick={handleConfirm}
        disabled={isButtonDisabled}
      >
        Отправить ещё раз
      </Button>
      {isButtonDisabled && (
        <span className="text-xxs-base text-gray-60 mt-1 w-full text-center">
          Следующее письмо можно отправить через {formatTime(timeRemaining)}
        </span>
      )}
    </EmailPageLayout>
  );
};
