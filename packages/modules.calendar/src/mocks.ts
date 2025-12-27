// Типы в данном файле не относятся к календарю, поэтому оставляю их здесь.
// В дальнейшем, думаю, хорошо было бы их вынести в общие типы по проекту

import { ICalendarEvent } from './ui/types';

/**
 * Генерирует моковые события для текущего месяца
 */
const generateMockEventsForCurrentMonth = (): ICalendarEvent[] => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();

  // Получаем количество дней в текущем месяце
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const events: ICalendarEvent[] = [];
  let eventId = 1;

  // Генерируем события на разные дни месяца
  const eventDays = [2, 3, 5, 7, 9, 10, 12, 14, 15, 17, 19, 21, 23, 24, 26, 28].filter(
    (day) => day <= daysInMonth,
  );

  // Имена студентов для уроков
  const studentNames = [
    'Дмитрий',
    'Анна',
    'Елена',
    'Николай',
    'Алексей',
    'Ольга',
    'Владимир',
    'Катерина',
    'Олег',
    'Наталья',
    'Александр',
    'Екатерина',
    'Виктория',
    'Василий',
    'Мария',
    'Иван',
  ];

  // Времена для уроков
  const lessonTimes = [
    { start: 9, end: 11 },
    { start: 10, end: 12 },
    { start: 11, end: 13 },
    { start: 14, end: 16 },
    { start: 15, end: 17 },
    { start: 16, end: 18 },
    { start: 17, end: 19 },
    { start: 18, end: 20 },
  ];

  // Генерируем уроки
  eventDays.forEach((day, index) => {
    const studentName = studentNames[index % studentNames.length];
    const timeSlot = lessonTimes[index % lessonTimes.length];

    // Обычный урок
    events.push({
      id: String(eventId++),
      title: studentName,
      start: new Date(currentYear, currentMonth, day, timeSlot.start, 0),
      end: new Date(currentYear, currentMonth, day, timeSlot.end, 0),
      type: 'lesson',
    });

    // Иногда добавляем второй урок в тот же день
    if (index % 3 === 0 && day <= daysInMonth) {
      const secondTimeSlot = lessonTimes[(index + 1) % lessonTimes.length];
      events.push({
        id: String(eventId++),
        title: studentNames[(index + 1) % studentNames.length],
        start: new Date(currentYear, currentMonth, day, secondTimeSlot.start, 0),
        end: new Date(currentYear, currentMonth, day, secondTimeSlot.end, 0),
        type: 'lesson',
        lessonInfo: {
          studentName: studentNames[(index + 1) % studentNames.length],
          subject: ['математика', 'английский', 'физика', 'химия'][index % 4],
          lessonType: index % 2 === 0 ? 'group' : 'individual',
          paid: index % 3 !== 0,
          complete: day < currentDay,
        },
      });
    }

    // Иногда добавляем отмененный урок
    if (index % 4 === 0 && day <= daysInMonth) {
      events.push({
        id: String(eventId++),
        title: studentNames[(index + 2) % studentNames.length],
        start: new Date(currentYear, currentMonth, day, 13, 0),
        end: new Date(currentYear, currentMonth, day, 14, 0),
        type: 'lesson',
        isCancelled: true,
      });
    }
  });

  // Добавляем дни отдыха (выходные дни)
  const restDays = [6, 13, 20, 27].filter((day) => day <= daysInMonth);
  restDays.forEach((day) => {
    events.push({
      id: String(eventId++),
      title: 'Отдых',
      start: new Date(currentYear, currentMonth, day),
      end: new Date(currentYear, currentMonth, day),
      type: 'rest',
      isAllDay: true,
    });
  });

  // Добавляем несколько коротких перерывов
  const shortRestDays = [4, 11, 18, 25].filter((day) => day <= daysInMonth);
  shortRestDays.forEach((day) => {
    events.push({
      id: String(eventId++),
      title: 'Отдых',
      start: new Date(currentYear, currentMonth, day, 12, 0),
      end: new Date(currentYear, currentMonth, day, 13, 0),
      type: 'rest',
    });
  });

  return events;
};

export type StudentT = {
  id: string;
  name: string;
  subject: SubjectT;
};

type SubjectT = {
  id: string;
  name: string;
  variant: string;
  pricePerLesson: number;
  unpaidLessonsAmount?: number;
};

export const students: StudentT[] = [
  {
    id: crypto.randomUUID(),
    name: 'Анна Смирнова (Групповое • Practice english)',
    subject: {
      id: crypto.randomUUID(),
      name: 'Английский язык',
      variant: 'Занятие на 40 минут',
      pricePerLesson: 600,
      unpaidLessonsAmount: 1,
    },
  },
  {
    id: crypto.randomUUID(),
    name: 'Максим Иванов',
    subject: {
      id: crypto.randomUUID(),
      name: 'Математика',
      variant: 'Занятие на 60 минут',
      pricePerLesson: 1000,
    },
  },
];

// Генерируем моковые события для текущего месяца
export const MOCK_EVENTS: ICalendarEvent[] = generateMockEventsForCurrentMonth();
