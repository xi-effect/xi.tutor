/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { LoadingScreen } from 'common.ui';

const CalendarPageLazy = lazy(() =>
  import('pages.calendar').then((module) => ({ default: module.CalendarPage })),
);

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/schedule/')({
  head: () => ({
    meta: [
      {
        title: 'sovlium | Календарь',
      },
    ],
  }),
  component: () => (
    <Suspense fallback={<LoadingScreen />}>
      <CalendarPageLazy />
    </Suspense>
  ),
});
