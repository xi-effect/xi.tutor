import { useEffect, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { FirstStepsContinueHint } from 'common.ui';
import {
  FIRST_STEPS_TOUR_EVENT,
  clearFirstStepsTour,
  readFirstStepsTour,
  trackFirstStepsAction,
} from 'common.services';

/** После звонка и доски: напоминание, что знакомство можно продолжить на главной. */
export const DemoBoardGuideHint = () => {
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
    <FirstStepsContinueHint
      className="relative z-[80] mt-3"
      onHome={() => {
        const role = readFirstStepsTour()?.role ?? 'tutor';
        trackFirstStepsAction(role, 'board_hint_home');
        dismiss();
        void navigate({ to: '/' });
      }}
    />
  );
};
