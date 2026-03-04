import type { ScheduleLessonRow } from '../../types';
import { ScheduleDateCarousel } from '../ScheduleDateCarousel';
import { DayLessonRow } from '../DayLessonRow';

type DayLessonsPanelProps = {
  selectedDate: Date;
  onSelectedDateChange: (date: Date) => void;
  lessons: ScheduleLessonRow[];
  /** Показывать кнопки действий у первого урока. По умолчанию false */
  showFirstLessonActions?: boolean;
  /** Не показывать заголовок. По умолчанию false */
  withoutTitle?: boolean;
};

/** Виджет: переключатель дней + список занятий на день */
export const DayLessonsPanel = ({
  selectedDate,
  onSelectedDateChange,
  lessons,
  showFirstLessonActions = false,
  withoutTitle = false,
}: DayLessonsPanelProps) => {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {!withoutTitle && (
        <h3 className="text-l-base shrink-0 font-semibold text-gray-100">Занятия на день</h3>
      )}
      <ScheduleDateCarousel
        selectedDate={selectedDate}
        onSelectedDateChange={onSelectedDateChange}
      />
      <div className="flex flex-1 flex-col overflow-auto">
        {lessons.map((lesson, index) => (
          <DayLessonRow
            key={lesson.id}
            lesson={lesson}
            showActions={showFirstLessonActions && index === 0}
          />
        ))}
      </div>
    </div>
  );
};
