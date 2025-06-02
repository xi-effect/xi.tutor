/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { z } from 'zod';

const ClassroomPage = lazy(() =>
  import('pages.classroom').then((module) => ({ default: module.ClassroomPage })),
);

const paramsSchema = z.object({
  classroomId: z.string(),
});

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/classrooms/$classroomId')({
  component: CallPage,
  parseParams: (params: Record<string, string>) => paramsSchema.parse(params),
  beforeLoad: () => {
    // console.log('Call', context, location);
  },
});

function CallPage() {
  // @ts-ignore
  // const { callId } = Route.useParams();
  return (
    <>
      <ClassroomPage />
    </>
  );
}
