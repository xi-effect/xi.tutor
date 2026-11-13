import { useEffect, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Button } from '@xipkg/button';
import { FIRST_STEPS_TOUR_EVENT, clearFirstStepsTour, readFirstStepsTour } from 'common.services';
import { useTranslation } from 'react-i18next';

/** Последний кадр шага звонка: подсказка на демодоске и возврат к гайду на главной. */
export const DemoBoardGuideHint = ({ offset }: { offset: number }) => {
  const { t } = useTranslation('board');
  const navigate = useNavigate();
  const { classroomId, boardId } = useParams({ strict: false });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      const session = readFirstStepsTour();
      const matches =
        session?.callPhase === 'board-hint' &&
        session.classroomId === classroomId &&
        session.boardId === boardId;
      setOpen(Boolean(matches));
    };

    sync();
    window.addEventListener(FIRST_STEPS_TOUR_EVENT, sync);
    return () => window.removeEventListener(FIRST_STEPS_TOUR_EVENT, sync);
  }, [boardId, classroomId]);

  if (!open) return null;

  return (
    <section
      className="bg-background-surface border-border-default pointer-events-auto absolute left-4 z-[80] flex w-[min(320px,calc(100vw-2rem))] flex-col gap-2 rounded-2xl border p-3 shadow-lg"
      style={{ top: offset + 64 }}
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
          clearFirstStepsTour();
          setOpen(false);
          void navigate({ to: '/' });
        }}
      >
        {t('header.guideHome')}
      </Button>
    </section>
  );
};
