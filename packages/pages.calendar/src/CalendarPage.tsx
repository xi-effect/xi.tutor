import { useState } from 'react';
import { AddingLessonModal } from 'features.lesson.add';
import { CalendarModule } from 'modules.calendar';

export const CalendarPage = () => {
  const [addingModalOpen, setAddingModalOpen] = useState(false);

  return (
    <>
      <AddingLessonModal open={addingModalOpen} onOpenChange={setAddingModalOpen} dayLessons={[]} />
      <CalendarModule onAddLessonClick={() => setAddingModalOpen(true)} />
    </>
  );
};
