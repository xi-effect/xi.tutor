import { DayLessonRow } from 'modules.calendar';
import type { ScheduleLessonRow } from 'modules.calendar';

type AllLessonsProps = {
  lessons: ScheduleLessonRow[];
  /** Показывать кнопки (начать/перенести/удалить) у первого урока. По умолчанию true */
  showFirstLessonActions?: boolean;
};

export const AllLessons = ({ lessons, showFirstLessonActions = true }: AllLessonsProps) => {
  return (
    <div className="flex flex-1 flex-col overflow-auto">
      {lessons.map((lesson, index) => (
        <DayLessonRow
          key={lesson.id}
          lesson={lesson}
          showActions={showFirstLessonActions && index === 0}
        />
      ))}
    </div>
  );
};
