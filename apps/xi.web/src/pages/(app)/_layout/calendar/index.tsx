/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';

const CalendarModule = lazy(() =>
  import('modules.calendar').then((module) => ({ default: module.CalendarModule })),
);

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/calendar/')({
  component: CalendarPage,
  beforeLoad: ({ context, location }) => {
    console.log('Calendar', context, location);
  },
});

function CalendarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">Загрузка календаря...</div>
      }
    >
      <CalendarModule />
    </Suspense>
  );
}
