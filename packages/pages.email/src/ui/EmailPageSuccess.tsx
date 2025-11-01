import { Button } from '@xipkg/button';
import { EmailPageLayout } from './EmailPageLayout';
import { useNavigate } from '@tanstack/react-router';

export const EmailPageSuccess = () => {
  const navigate = useNavigate();

  const handleConfirm = () => {
    navigate({ to: '/welcome/user' });
  };

  return (
    <EmailPageLayout title="Вы подтвердили почту">
      <div className="mt-8 flex flex-col items-center gap-1">
        <span className="text-m-base w-full text-center text-gray-100">Успешных уроков!</span>
      </div>
      <Button size="m" className="mt-16 h-[48px] w-full rounded-xl" onClick={handleConfirm}>
        Продолжить
      </Button>
    </EmailPageLayout>
  );
};
