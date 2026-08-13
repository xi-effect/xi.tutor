import { ArrowLeft } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const ClassroomBackButton = () => {
  const { t } = useTranslation('classroom');
  const navigate = useNavigate();

  return (
    <Button
      variant="none"
      type="button"
      onClick={() => navigate({ to: '/classrooms' })}
      className="text-text-primary hover:bg-background-subtle flex size-10 shrink-0 items-center justify-center rounded-[10px] p-0"
      aria-label={t('actions.backToClassrooms')}
      data-umami-event="classroom-back-to-classrooms"
    >
      <ArrowLeft size="s" className="h-5 w-5" />
    </Button>
  );
};
