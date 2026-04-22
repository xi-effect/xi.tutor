import { useMemo } from 'react';
import { ScrollArea } from '@xipkg/scrollarea';
import { DayLessonListMetaProvider, DayLessonRow } from 'modules.calendar';
import type { ScheduleLessonRow } from 'modules.calendar';

type AllLessonsProps = {
  lessons: ScheduleLessonRow[];
  /**
   * Календарный день списка (для расчёта окончания, если нет `startAt`).
   * Передавайте выбранную в расписании дату.
   */
  dayDate: Date;
  /** Панель действий (начать, иконки препода) на каждой карточке. По умолчанию true */
  showLessonActions?: boolean;
  /** Показать иконки-действия препода по ховеру (при showLessonActions) */
  isTutor?: boolean;
};

function getLessonEnd(lesson: ScheduleLessonRow, dayDate: Date): Date | null {
  const [h, m] = lesson.endTime.split(':').map((x) => parseInt(x, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  if (lesson.startAt != null) {
    const d = new Date(lesson.startAt);
    d.setHours(h, m, 0, 0);
    return d;
  }
  const d = new Date(dayDate);
  d.setHours(0, 0, 0, 0);
  d.setHours(h, m, 0, 0);
  return d;
}

/** Первое занятие в списке, которое ещё не закончилось (текущее или ближайшее) */
function findNearestLessonIndex(lessons: ScheduleLessonRow[], now: Date, dayDate: Date): number {
  for (let i = 0; i < lessons.length; i++) {
    const end = getLessonEnd(lessons[i], dayDate);
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
  isTutor = false,
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
              showActions={showLessonActions}
              isTutor={isTutor && showLessonActions}
              isNearestLesson={nearestIndex >= 0 && index === nearestIndex}
            />
          ))}
        </div>
      </ScrollArea>
    </DayLessonListMetaProvider>
  );
};
