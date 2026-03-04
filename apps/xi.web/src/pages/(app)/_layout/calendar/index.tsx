/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy, useState } from 'react';
import { LoadingScreen } from 'common.ui';
import { AddingLessonModal } from 'features.lesson.add';

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
  const [addingModalOpen, setAddingModalOpen] = useState(false);

  return (
    <Suspense fallback={<LoadingScreen />}>
      <AddingLessonModal open={addingModalOpen} onOpenChange={setAddingModalOpen} dayLessons={[]} />
      <CalendarModule onAddLessonClick={() => setAddingModalOpen(true)} />
    </Suspense>
  );
}
