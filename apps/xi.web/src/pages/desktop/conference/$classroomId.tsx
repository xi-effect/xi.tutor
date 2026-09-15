/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { LoadingScreen, NotFoundPage } from 'common.ui';
import { getSovliumDesktop, isElectronConferenceSurface, isElectronShell } from 'common.platform';
import {
  CallsShell,
  useCallStore,
  useStartCall,
} from 'modules.calls';
import { useCurrentUser } from 'common.services';
import { Suspense, lazy, useEffect, useRef } from 'react';
import { z } from 'zod';

const CallModule = lazy(() => import('modules.calls').then((module) => ({ default: module.Call })));

const paramsSchema = z.object({
  classroomId: z.string(),
});

// @ts-ignore
export const Route = createFileRoute('/desktop/conference/$classroomId')({
  head: () => ({
    meta: [
      {
        title: 'sovlium | Конференция',
      },
    ],
  }),
  component: DesktopConferenceRoute,
  parseParams: (params: Record<string, string>) => paramsSchema.parse(params),
});

function DesktopConferenceRoute() {
  if (!isElectronShell() || !isElectronConferenceSurface()) {
    return <NotFoundPage withLogo={false} />;
  }

  return (
    <div className="bg-background-page h-svh w-full overflow-hidden">
      <CallsShell>
        <DesktopConferencePage />
      </CallsShell>
    </div>
  );
}

function DesktopConferencePage() {
  const { classroomId } = Route.useParams();
  const { data: user, isLoading } = useCurrentUser();
  const { startCall } = useStartCall();
  const token = useCallStore((state) => state.token);
  const startedRef = useRef(false);
  const hadTokenRef = useRef(false);

  useEffect(() => {
    if (!user || startedRef.current) return;
    startedRef.current = true;
    void startCall({ classroom_id: classroomId }).catch((error) => {
      console.error('[xi.web] desktop conference failed to start', error);
    });
  }, [classroomId, startCall, user]);

  useEffect(() => {
    if (token) {
      hadTokenRef.current = true;
      return;
    }
    if (!hadTokenRef.current) return;
    void getSovliumDesktop()?.conference.notifyEnded();
  }, [token]);

  if (isLoading || !user) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <CallModule />
    </Suspense>
  );
}
