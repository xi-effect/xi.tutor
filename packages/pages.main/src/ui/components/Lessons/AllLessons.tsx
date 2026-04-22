import { useMemo } from 'react';
import { ScrollArea } from '@xipkg/scrollarea';
import { DayLessonListMetaProvider, DayLessonRow, getScheduleLessonEndAt } from 'modules.calendar';
import type { ChangeLessonFormData, ScheduleLessonRow } from 'modules.calendar';

type AllLessonsProps = {
  lessons: ScheduleLessonRow[];
  /**
   * Календарный день списка (для расчёта окончания, если нет `startAt`).
   * Передавайте выбранную в расписании дату.
   */
  dayDate: Date;
  /** Панель действий (начать, иконки препода) на каждой карточке. По умолчанию true */
  showLessonActions?: boolean;
  onSaveLesson?: (lesson: ScheduleLessonRow, data: ChangeLessonFormData) => void;
};

/** Первое занятие в списке, которое ещё не закончилось (текущее или ближайшее) */
function findNearestLessonIndex(lessons: ScheduleLessonRow[], now: Date, dayDate: Date): number {
  for (let i = 0; i < lessons.length; i++) {
    const end = getScheduleLessonEndAt(lessons[i], dayDate);
    if (end != null && now < end) {
      return i;
    }
  }
  return -1;
}

export const AllLessons = ({
  lessons,
  dayDate,
  showLessonActions = true,
  onSaveLesson,
}: AllLessonsProps) => {
  const nearestIndex = useMemo(
    () => findNearestLessonIndex(lessons, new Date(), dayDate),
    [lessons, dayDate],
  );

  return (
    <DayLessonListMetaProvider>
      <ScrollArea className="min-h-0 w-full flex-1">
        <div className="flex flex-col pr-3">
          {lessons.map((lesson, index) => (
            <DayLessonRow
              key={lesson.id}
              lesson={lesson}
              lessonDay={dayDate}
              showActions={showLessonActions}
              isNearestLesson={nearestIndex >= 0 && index === nearestIndex}
              onSaveLesson={onSaveLesson}
            />
          ))}
        </div>
      </ScrollArea>
    </DayLessonListMetaProvider>
  );
};
