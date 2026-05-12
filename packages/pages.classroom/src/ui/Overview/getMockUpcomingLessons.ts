import type { ScheduleLessonRow } from 'modules.calendar';

/** Временные данные для сводки; заменить ответом API, когда бэкенд будет готов. */
export function getMockUpcomingLessons(classroomId: number): ScheduleLessonRow[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const row = (
    addDays: number,
    hour: number,
    minute: number,
    endHour: number,
    endMinute: number,
    subject: string,
    id: number,
  ): ScheduleLessonRow => {
    const startAt = new Date(today);
    startAt.setDate(startAt.getDate() + addDays);
    startAt.setHours(hour, minute, 0, 0);
    return {
      id,
      classroomId,
      startAt,
      startTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      endTime: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
      subject,
      studentName: 'Ученик',
      studentId: 0,
    };
  };

  return [
    row(3, 13, 0, 14, 0, 'Законы Ньютона', 101),
    row(4, 10, 0, 11, 30, 'Термодинамика', 102),
    row(5, 16, 0, 17, 0, 'Колебания', 103),
    row(6, 9, 0, 10, 0, 'Электричество', 104),
  ];
}
