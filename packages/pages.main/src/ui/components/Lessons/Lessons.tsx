import { Button } from '@xipkg/button';
import { Group } from '@xipkg/icons';
import { NextLesson } from './NextLesson';
import { AllLessons } from './AllLessons';
import { AddingLessonModal } from 'features.lesson.add';
import { useState } from 'react';

export const Lessons = () => {
  const [open, setOpen] = useState(false);

  const handleOpenAddingModal = () => {
    setOpen(true);
  };

  return (
    <>
      <AddingLessonModal open={open} onOpenChange={setOpen} />
      <div className="bg-gray-0 flex h-[calc(100vh-112px)] flex-col gap-4 rounded-2xl p-4">
        <div className="flex flex-row items-center justify-start gap-2">
          <h2 className="text-xl-base font-medium text-gray-100">Расписание на сегодня</h2>
          <div className="ml-auto">
            <Button
              variant="none"
              className="flex size-8 items-center justify-center rounded-[4px] p-0"
              onClick={handleOpenAddingModal}
            >
              <Group className="fill-gray-60 size-6" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-m-base text-gray-80 font-medium">Ближайшее занятие</h3>
            <NextLesson />
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-m-base text-gray-80 font-medium">Все занятие</h3>
            <AllLessons />
          </div>
        </div>
      </div>
    </>
  );
};
