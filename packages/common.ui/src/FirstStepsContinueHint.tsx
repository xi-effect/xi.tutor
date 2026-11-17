import { Button } from '@xipkg/button';
import { cn } from '@xipkg/utils';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  FIRST_STEPS_TOUR_EVENT,
  clearFirstStepsTour,
  readFirstStepsTour,
  trackFirstStepsAction,
} from 'common.services';

type FirstStepsContinueHintProps = {
  onHome: () => void;
  className?: string;
};

/** Карточка «знакомство можно продолжить на главной» — та же, что после доски. */
export const FirstStepsContinueHint = ({ onHome, className }: FirstStepsContinueHintProps) => {
  const { t } = useTranslation('commonUi');

  return (
    <section
      className={cn(
        'bg-background-surface border-border-default pointer-events-auto flex w-[min(320px,calc(100vw-2rem))] flex-col gap-2 rounded-2xl border p-3 shadow-lg',
        className,
      )}
      aria-label={t('firstStepsContinue.title')}
    >
      <h2 className="text-text-primary text-sm font-medium">{t('firstStepsContinue.title')}</h2>
      <p className="text-text-secondary text-xs leading-4">{t('firstStepsContinue.body')}</p>
      <Button
        type="button"
        variant="primary"
        size="s"
        className="h-8 self-start rounded-full px-3 text-xs"
        onClick={onHome}
      >
        {t('firstStepsContinue.home')}
      </Button>
    </section>
  );
};

/** После шага «Пригласите ученика»: карточка поверх модалки и на странице списка. */
export const StudentsInviteHomeHint = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      const session = readFirstStepsTour();
      setOpen(session?.step === 'invite' && session.homeHint === true);
    };

    sync();
    window.addEventListener(FIRST_STEPS_TOUR_EVENT, sync);
    return () => window.removeEventListener(FIRST_STEPS_TOUR_EVENT, sync);
  }, []);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <FirstStepsContinueHint
      className="fixed right-5 bottom-5 z-[80]"
      onHome={() => {
        const role = readFirstStepsTour()?.role ?? 'tutor';
        trackFirstStepsAction(role, 'invite_hint_home', 'invite');
        clearFirstStepsTour();
        setOpen(false);
        void navigate({ to: '/' });
      }}
    />,
    document.body,
  );
};
