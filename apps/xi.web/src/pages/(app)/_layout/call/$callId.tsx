/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { LoadingScreen, NotFoundPage } from 'common.ui';
import { useCurrentUser, useGetClassroom, useGetClassroomStudent } from 'common.services';
import { Suspense, lazy } from 'react';
import { z } from 'zod';

const CallModule = lazy(() => import('modules.calls').then((module) => ({ default: module.Call })));

const paramsSchema = z.object({
  callId: z.string(),
});

const searchSchema = z
  .object({
    carouselType: z.enum(['horizontal', 'vertical']).optional(),
    call: z.string().optional(),
    role: z.enum(['tutor', 'student']).optional(),
    read_notification_id: z.string().optional(),
  })
  .passthrough();

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/call/$callId')({
  head: () => ({
    meta: [
      {
        title: 'sovlium | Звонок',
      },
    ],
  }),
  component: CallPage,
  parseParams: (params: Record<string, string>) => paramsSchema.parse(params),
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
});

function CallPage() {
  const { callId } = Route.useParams();
  const classroomId = Number(callId);
  const hasValidId = Number.isFinite(classroomId) && classroomId > 0;

  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const tutorQuery = useGetClassroom(classroomId, isUserLoading || !isTutor || !hasValidId);
  const studentQuery = useGetClassroomStudent(classroomId, isUserLoading || isTutor || !hasValidId);
  const classroomQuery = isTutor ? tutorQuery : studentQuery;

  if (!hasValidId || classroomQuery.isError || (classroomQuery.isFetched && !classroomQuery.data)) {
    return <NotFoundPage withLogo={false} />;
  }

  if (isUserLoading || classroomQuery.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <CallModule />
    </Suspense>
  );
}
