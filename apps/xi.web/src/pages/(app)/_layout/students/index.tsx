/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { LoadingScreen } from 'common.ui';
import { Suspense, lazy } from 'react';

const StudentsPage = lazy(() =>
  import('pages.students').then((module) => ({ default: module.StudentsPage })),
);

const Students = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <StudentsPage />
    </Suspense>
  );
};

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/students/')({
  head: () => ({
    meta: [
      {
        title: 'sovlium | Список учеников',
      },
    ],
  }),
  component: Students,
});
