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

const searchSchema = z.object({
  tab: z.string().optional(),
});

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/classrooms/$classroomId')({
  component: ClassroomPageComponent,
  parseParams: (params: Record<string, string>) => paramsSchema.parse(params),
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
  beforeLoad: () => {
    // console.log('Classroom', context, location);
  },
});

function ClassroomPageComponent() {
  return (
    <>
      <ClassroomPage />
    </>
  );
}
