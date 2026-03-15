// Типы в данном файле не относятся к календарю, поэтому оставляю их здесь.
// В дальнейшем, думаю, хорошо было бы их вынести в общие типы по проекту

import { ICalendarEvent } from './ui/types';

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

/** Возвращает понедельник текущей недели (weekStartsOn: 1) */
const getWeekStart = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Пн = 1, Вс = 0
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

/** Карточки занятий на текущую неделю — всегда видны при открытии календаря */
const getLessonCardMocks = (): ICalendarEvent[] => {
  const mon = getWeekStart(new Date());
  const day = (d: number, h: number, min: number) => {
    const x = new Date(mon);
    x.setDate(mon.getDate() + d);
    x.setHours(h, min, 0, 0);
    return x;
  };
  return [
    {
      id: 'card-1',
      title: 'Основы органической химии',
      start: day(0, 11, 0),
      end: day(0, 12, 0),
      type: 'lesson',
      lessonInfo: {
        studentName: 'Иван Смирнов',
        subject: 'Химия',
        lessonType: 'individual',
        description: 'Основы органической химии',
      },
    },
    {
      id: 'card-2',
      title: 'Законы Ньютона',
      start: day(0, 13, 0),
      end: day(0, 14, 0),
      type: 'lesson',
      lessonInfo: {
        studentName: 'Анна Петрова',
        subject: 'Физика',
        lessonType: 'individual',
        description: 'Законы Ньютона',
      },
    },
    {
      id: 'card-3',
      title: 'Классическая механика',
      start: day(1, 15, 0),
      end: day(1, 16, 0),
      type: 'lesson',
      lessonInfo: {
        studentName: 'Сергей Кузнецов',
        subject: 'Физика',
        lessonType: 'group',
        description: 'Классическая механика',
      },
    },
    {
      id: 'card-4',
      title: 'Алгебра и геометрия',
      start: day(1, 9, 0),
      end: day(1, 10, 0),
      type: 'lesson',
      lessonInfo: {
        studentName: 'Елена Михайлова',
        subject: 'Математика',
        lessonType: 'individual',
        description: 'Алгебра и геометрия',
      },
    },
    {
      id: 'card-5',
      title: 'Эволюционная теория',
      start: day(2, 11, 0),
      end: day(2, 12, 0),
      type: 'lesson',
      lessonInfo: {
        studentName: 'Сергей Иванов',
        subject: 'Биология',
        lessonType: 'individual',
        description: 'Эволюционная теория',
      },
    },
    {
      id: 'card-6',
      title: 'Генетика и ДНК',
      start: day(2, 15, 0),
      end: day(2, 16, 0),
      type: 'lesson',
      lessonInfo: {
        studentName: 'Мария Васильева',
        subject: 'Биология',
        lessonType: 'group',
        description: 'Генетика и ДНК',
      },
    },
    {
      id: 'card-7',
      title: 'Древний Рим',
      start: day(3, 15, 0),
      end: day(3, 16, 0),
      type: 'lesson',
      lessonInfo: {
        studentName: 'Максим Иванов',
        subject: 'История',
        lessonType: 'individual',
        description: 'Древний Рим',
      },
    },
    {
      id: 'card-8',
      title: 'Разбор домашнего задания',
      start: day(4, 10, 0),
      end: day(4, 11, 0),
      type: 'lesson',
      lessonInfo: {
        studentName: 'Иван Смирнов',
        subject: 'Химия',
        lessonType: 'individual',
        description: 'Разбор домашнего задания',
      },
    },
  ];
};

export const MOCK_EVENTS: ICalendarEvent[] = [
  ...getLessonCardMocks(),
  {
    id: '1',
    title: 'Дмитрий',
    start: new Date('2025-09-29T17:40:00'),
    end: new Date('2025-09-29T18:40:00'),
    type: 'lesson',
  },
  {
    id: '2',
    title: 'Отдых',
    start: new Date('2025-09-30T11:00:00'),
    end: new Date('2025-09-30T13:00:00'),
    type: 'rest',
  },
  {
    id: '3',
    title: 'Анна',
    start: new Date('2025-09-28T17:40:00'),
    end: new Date('2025-09-28T18:10:00'),
    type: 'lesson',
    isCancelled: true,
  },
  {
    id: '5',
    title: 'Елена',
    start: new Date('2025-09-18T10:00:00'),
    end: new Date('2025-09-18T12:00:00'),
    type: 'lesson',
  },
  {
    id: '6',
    title: 'Николай',
    start: new Date('2025-09-20T14:00:00'),
    end: new Date('2025-09-20T16:00:00'),
    type: 'lesson',
  },
  {
    id: '7',
    title: 'Алексей',
    start: new Date('2025-09-23T09:00:00'),
    end: new Date('2025-09-23T11:00:00'),
    type: 'lesson',
  },
  {
    id: '8',
    title: 'Ольга',
    start: new Date('2025-10-04T15:00:00'),
    end: new Date('2025-10-04T17:00:00'),
    type: 'lesson',
  },
  {
    id: '9',
    title: 'Владимир',
    start: new Date('2025-09-05T10:00:00'),
    end: new Date('2025-09-05T12:00:00'),
    type: 'lesson',
  },
  {
    id: '10',
    title: 'Катерина',
    start: new Date('2025-09-05T14:00:00'),
    end: new Date('2025-09-05T16:00:00'),
    type: 'lesson',
  },
  {
    id: '11',
    title: 'Олег',
    start: new Date('2025-09-23T09:00:00'),
    end: new Date('2025-09-23T11:00:00'),
    type: 'lesson',
  },
  {
    id: '12',
    title: 'Наталья',
    start: new Date('2025-09-07T15:00:00'),
    end: new Date('2025-09-07T17:00:00'),
    type: 'lesson',
  },
  {
    id: '13',
    title: 'Александр',
    start: new Date('2025-09-07T12:00:00'),
    end: new Date('2025-09-07T13:00:00'),
    type: 'lesson',
    lessonInfo: {
      studentName: 'Александр',
      subject: 'физика',
      lessonType: 'group',
      paid: true,
      complete: true,
    },
  },
  {
    id: '14',
    title: 'Екатерина',
    start: new Date('2025-09-10T14:00:00'),
    end: new Date('2025-09-10T16:00:00'),
    type: 'lesson',
    isCancelled: true,
  },
  {
    id: '15',
    title: 'Виктория',
    start: new Date('2025-09-11T09:00:00'),
    end: new Date('2025-09-11T11:00:00'),
    type: 'lesson',
    lessonInfo: {
      studentName: 'Виктория',
      subject: 'испанский язык',
      lessonType: 'group',
      paid: false,
      complete: false,
    },
  },
  {
    id: '16',
    title: 'Василий',
    start: new Date('2025-09-12T15:00:00'),
    end: new Date('2025-09-12T17:00:00'),
    type: 'lesson',
    lessonInfo: {
      studentName: 'Василий',
      subject: 'алгебра',
      lessonType: 'individual',
      paid: true,
      complete: false,
    },
  },
  {
    id: '17',
    title: 'Отдых',
    start: new Date('2025-09-13'),
    end: new Date('2025-09-13'),
    type: 'rest',
    isAllDay: true,
  },
  {
    id: '18',
    title: 'Отдых',
    start: new Date('2025-09-06'),
    end: new Date('2025-09-06'),
    type: 'rest',
    isAllDay: true,
  },
  {
    id: '19',
    title: 'Отдых',
    start: new Date('2025-09-15'),
    end: new Date('2025-09-15'),
    type: 'rest',
    isAllDay: true,
  },
  {
    id: '20',
    title: 'Отдых',
    start: new Date('2025-09-16'),
    end: new Date('2025-09-16'),
    type: 'rest',
    isAllDay: true,
  },
];
