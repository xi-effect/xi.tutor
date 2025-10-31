import { Dispatch, SetStateAction } from 'react';
import { EmailPageLayout } from './EmailPageLayout';
import { Button } from '@xipkg/button';

type EmailPageConfirmPropsT = {
  setStatus: Dispatch<SetStateAction<'confirm' | 'success'>>;
};

export const EmailPageConfirm = ({ setStatus }: EmailPageConfirmPropsT) => {
  const handleConfirm = () => {
    setStatus('success');
  };

  return (
    <EmailPageLayout title="Подтвердите почту">
      <div className="mt-8 flex flex-col items-center gap-1">
        <span className="text-m-base w-full text-center text-gray-100">
          Перейдите по ссылке — отправили её на
        </span>
        <span className="text-m-base w-full text-center text-gray-100">example@example.com</span>
      </div>
      <Button size="m" className="mt-16 h-[48px] w-full rounded-xl" onClick={handleConfirm}>
        Получить новую ссылку
      </Button>
      <span className="text-xxs-base text-gray-60 mt-1 w-full text-center">
        Если письмо не пришло, нажми сюда, чтобы отправить ещё раз
      </span>
    </EmailPageLayout>
  );
};
