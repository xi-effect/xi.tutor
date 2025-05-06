/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';

import { CalendarModule } from 'modules.calendar';

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/calendar/')({
  component: CalendarPage,
  beforeLoad: ({ context, location }) => {
    console.log('Calendar', context, location);
  },
});

function CalendarPage() {
  return (
    <>
      <CalendarModule />
    </>
  );
}
