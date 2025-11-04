import { Button } from '@xipkg/button';
import { EmailPageLayout } from './EmailPageLayout';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useOnboardingTransition } from 'common.services';

export const EmailPageSuccess = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const { transitionStage } = useOnboardingTransition('user-information', 'forwards');

  const handleConfirm = async () => {
    try {
      await transitionStage.mutateAsync();
      // Небольшая задержка для обновления данных пользователя
      await new Promise((resolve) => setTimeout(resolve, 100));
      navigate({ to: '/welcome/user', search: { ...search } });
    } catch {
      return;
    }
  };

  const isLoading = transitionStage.isPending;

  return (
    <EmailPageLayout title="Вы подтвердили почту">
      <div className="mt-8 flex flex-col items-center gap-1">
        <span className="text-m-base w-full text-center text-gray-100">Успешных уроков!</span>
      </div>
      <Button
        size="m"
        className="mt-16 h-[48px] w-full rounded-xl"
        onClick={handleConfirm}
        disabled={isLoading}
      >
        Продолжить
      </Button>
    </EmailPageLayout>
  );
};
