/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import { LoadingScreen } from 'common.ui';

const CalendarModule = lazy(() =>
  import('modules.calendar').then((module) => ({ default: module.CalendarModule })),
);

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/calendar/')({
  head: () => ({
    meta: [
      {
        title: 'sovlium | Календарь',
      },
    ],
  }),
  component: CalendarPage,
  // beforeLoad: ({ context, location }) => {
  //   console.log('Calendar', context, location);
  // },
});

function CalendarPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <CalendarModule />
    </Suspense>
  );
}
