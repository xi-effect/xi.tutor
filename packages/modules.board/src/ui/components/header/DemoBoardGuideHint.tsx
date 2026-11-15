import { useEffect, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Button } from '@xipkg/button';
import {
  FIRST_STEPS_TOUR_EVENT,
  clearFirstStepsTour,
  readFirstStepsTour,
  trackFirstStepsAction,
} from 'common.services';
import { useTranslation } from 'react-i18next';

/** После звонка и доски: напоминание, что знакомство можно продолжить на главной. */
export const DemoBoardGuideHint = () => {
  const { t } = useTranslation('board');
  const navigate = useNavigate();
  const { classroomId } = useParams({ strict: false });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      const session = readFirstStepsTour();
      const sameClassroom =
        session?.classroomId == null || String(session.classroomId) === String(classroomId);
      const matches =
        session?.step === 'call' &&
        session.callPhase === 'board-hint' &&
        Boolean(classroomId) &&
        sameClassroom;
      setOpen(Boolean(matches));
    };

    sync();
    window.addEventListener(FIRST_STEPS_TOUR_EVENT, sync);
    return () => window.removeEventListener(FIRST_STEPS_TOUR_EVENT, sync);
  }, [classroomId]);

  if (!open) return null;

  const dismiss = () => {
    clearFirstStepsTour();
    setOpen(false);
  };

  return (
    <section
      className="bg-background-surface border-border-default pointer-events-auto relative z-[80] mt-3 flex w-[min(320px,calc(100vw-2rem))] flex-col gap-2 rounded-2xl border p-3 shadow-lg"
      aria-label={t('header.guideTitle')}
    >
      <h2 className="text-text-primary text-sm font-medium">{t('header.guideTitle')}</h2>
      <p className="text-text-secondary text-xs leading-4">{t('header.guideBody')}</p>
      <Button
        type="button"
        variant="primary"
        size="s"
        className="h-8 self-start rounded-full px-3 text-xs"
        onClick={() => {
          const role = readFirstStepsTour()?.role ?? 'tutor';
          trackFirstStepsAction(role, 'board_hint_home');
          dismiss();
          void navigate({ to: '/' });
        }}
      >
        {t('header.guideHome')}
      </Button>
    </section>
  );
};
