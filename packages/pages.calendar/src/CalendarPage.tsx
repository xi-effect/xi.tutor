import { useState } from 'react';
import { AddingLessonModal } from 'features.lesson.add';
import { CalendarModule } from 'modules.calendar';

export const CalendarPage = () => {
  const [addingModalOpen, setAddingModalOpen] = useState(false);
  const [initialDate, setInitialDate] = useState<Date | null>(null);

  const handleAddLessonClick = (date?: Date) => {
    setInitialDate(date ?? null);
    setAddingModalOpen(true);
  };

  return (
    <>
      <AddingLessonModal
        open={addingModalOpen}
        onOpenChange={setAddingModalOpen}
        dayLessons={[]}
        initialDate={initialDate}
      />
      <CalendarModule onAddLessonClick={handleAddLessonClick} />
    </>
  );
};
