import type { ScheduleLessonRow } from '../../types';
import { DayLessonListMetaProvider } from '../../contexts/DayLessonListMetaContext';
import { ScheduleDateCarousel } from '../ScheduleDateCarousel';
import { DayLessonRow } from '../DayLessonRow';

type DayLessonsPanelProps = {
  selectedDate: Date;
  onSelectedDateChange: (date: Date) => void;
  lessons: ScheduleLessonRow[];
  /** Панель действий на каждой карточке занятия. По умолчанию false */
  showLessonActions?: boolean;
  /** Показать иконки-действия препода по ховеру (при showLessonActions) */
  isTutor?: boolean;
  /** Не показывать заголовок. По умолчанию false */
  withoutTitle?: boolean;
};

/** Виджет: переключатель дней + список занятий на день */
export const DayLessonsPanel = ({
  selectedDate,
  onSelectedDateChange,
  lessons,
  showLessonActions = false,
  isTutor = false,
  withoutTitle = false,
}: DayLessonsPanelProps) => {
  return (
    <DayLessonListMetaProvider>
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {!withoutTitle && (
          <h3 className="text-l-base shrink-0 font-semibold text-gray-100">Занятия на день</h3>
        )}
        <ScheduleDateCarousel
          selectedDate={selectedDate}
          onSelectedDateChange={onSelectedDateChange}
        />
        <div className="flex flex-1 flex-col overflow-auto">
          {lessons.map((lesson) => (
            <DayLessonRow
              key={lesson.id}
              lesson={lesson}
              showActions={showLessonActions}
              isTutor={isTutor && showLessonActions}
            />
          ))}
        </div>
      </div>
    </DayLessonListMetaProvider>
  );
};
