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

export const MOCK_EVENTS: ICalendarEvent[] = [
  {
    id: '1',
    title: 'Дмитрий',
    start: new Date('2025-07-29T17:40:00'),
    end: new Date('2025-07-29T18:40:00'),
    type: 'lesson',
  },
  {
    id: '2',
    title: 'Отдых',
    start: new Date('2025-07-30T11:00:00'),
    end: new Date('2025-07-30T13:00:00'),
    type: 'rest',
  },
  {
    id: '3',
    title: 'Анна',
    start: new Date('2025-08-28T17:40:00'),
    end: new Date('2025-08-28T18:10:00'),
    type: 'lesson',
    isCancelled: true,
  },
  {
    id: '5',
    title: 'Елена',
    start: new Date('2025-08-18T10:00:00'),
    end: new Date('2025-08-18T12:00:00'),
    type: 'lesson',
  },
  {
    id: '6',
    title: 'Николай',
    start: new Date('2025-08-20T14:00:00'),
    end: new Date('2025-08-20T16:00:00'),
    type: 'lesson',
  },
  {
    id: '7',
    title: 'Алексей',
    start: new Date('2025-08-23T09:00:00'),
    end: new Date('2025-08-23T11:00:00'),
    type: 'lesson',
  },
  {
    id: '8',
    title: 'Ольга',
    start: new Date('2025-08-04T15:00:00'),
    end: new Date('2025-08-04T17:00:00'),
    type: 'lesson',
  },
  {
    id: '9',
    title: 'Владимир',
    start: new Date('2025-08-05T10:00:00'),
    end: new Date('2025-08-05T12:00:00'),
    type: 'lesson',
  },
  {
    id: '10',
    title: 'Катерина',
    start: new Date('2025-08-05T14:00:00'),
    end: new Date('2025-08-05T16:00:00'),
    type: 'lesson',
  },
  {
    id: '11',
    title: 'Олег',
    start: new Date('2025-08-23T09:00:00'),
    end: new Date('2025-08-23T11:00:00'),
    type: 'lesson',
  },
  {
    id: '12',
    title: 'Наталья',
    start: new Date('2025-08-07T15:00:00'),
    end: new Date('2025-08-07T17:00:00'),
    type: 'lesson',
  },
  {
    id: '13',
    title: 'Александр',
    start: new Date('2025-08-07T12:00:00'),
    end: new Date('2025-08-07T13:00:00'),
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
    start: new Date('2025-08-10T14:00:00'),
    end: new Date('2025-08-10T16:00:00'),
    type: 'lesson',
    isCancelled: true,
  },
  {
    id: '15',
    title: 'Виктория',
    start: new Date('2025-08-11T09:00:00'),
    end: new Date('2025-08-11T11:00:00'),
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
    start: new Date('2025-08-12T15:00:00'),
    end: new Date('2025-08-12T17:00:00'),
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
    start: new Date('2025-08-13'),
    end: new Date('2025-08-13'),
    type: 'rest',
    isAllDay: true,
  },
  {
    id: '18',
    title: 'Отдых',
    start: new Date('2025-08-06'),
    end: new Date('2025-08-06'),
    type: 'rest',
    isAllDay: true,
  },
  {
    id: '19',
    title: 'Отдых',
    start: new Date('2025-08-15'),
    end: new Date('2025-08-15'),
    type: 'rest',
    isAllDay: true,
  },
  {
    id: '20',
    title: 'Отдых',
    start: new Date('2025-08-16'),
    end: new Date('2025-08-16'),
    type: 'rest',
    isAllDay: true,
  },
];
