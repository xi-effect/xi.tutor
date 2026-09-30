import { useEffect, useRef, useState } from 'react';
import { USER_FLAG_KEYS, useCurrentUser, useDismissibleUserFlag } from 'common.services';
import { useCallStore } from 'modules.calls';
import { TestingEndAnnouncementModal } from './TestingEndAnnouncementModal';

const isReadyTutor = (user: { default_layout: string; onboarding_stage: string } | undefined) =>
  user?.default_layout === 'tutor' &&
  (user.onboarding_stage === 'completed' || user.onboarding_stage === 'training');

export const TestingEndAnnouncementHost = () => {
  const { data: user } = useCurrentUser();
  const inCall = useCallStore((state) => Boolean(state.token));
  const ready = isReadyTutor(user) && !inCall;
  const { visible, dismiss } = useDismissibleUserFlag(
    USER_FLAG_KEYS.SUBSCRIPTION_ANNOUNCEMENT_DISMISSED,
    { enabled: ready },
  );
  const [closedThisVisit, setClosedThisVisit] = useState(false);
  const prevUserIdRef = useRef<number | null>(null);

  useEffect(() => {
    const userId = user?.id ?? null;
    if (prevUserIdRef.current === userId) return;
    prevUserIdRef.current = userId;
    setClosedThisVisit(false);
  }, [user?.id]);

  const open = visible && ready && !closedThisVisit;

  if (!open) return null;

  return (
    <TestingEndAnnouncementModal
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setClosedThisVisit(true);
      }}
      onDismissForever={() => {
        dismiss();
        setClosedThisVisit(true);
      }}
    />
  );
};
