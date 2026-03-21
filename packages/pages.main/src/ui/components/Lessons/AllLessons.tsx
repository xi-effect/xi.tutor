import { ScrollArea } from '@xipkg/scrollarea';
import { DayLessonRow } from 'modules.calendar';
import type { ScheduleLessonRow } from 'modules.calendar';

type AllLessonsProps = {
  lessons: ScheduleLessonRow[];
  /** Показывать кнопки (начать/перенести/удалить) у первого урока. По умолчанию true */
  showFirstLessonActions?: boolean;
};

export const AllLessons = ({ lessons, showFirstLessonActions = true }: AllLessonsProps) => {
  return (
    <ScrollArea className="min-h-0 w-full flex-1">
      <div className="flex flex-col pr-3">
        {lessons.map((lesson, index) => (
          <DayLessonRow
            key={lesson.id}
            lesson={lesson}
            showActions={showFirstLessonActions && index === 0}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
