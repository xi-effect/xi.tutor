import type { StudentT } from './types/InvoiceTypes';

export const students: StudentT[] = [
  {
    id: crypto.randomUUID(),
    name: 'Анна Смирнова (Групповое • Practice english)',
    subjects: [
      {
        id: crypto.randomUUID(),
        name: 'Английский язык',
        variant: 'Занятие на 40 минут',
        pricePerLesson: 600,
        unpaidLessonsAmount: 1,
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    name: 'Максим Иванов',
    subjects: [
      {
        id: crypto.randomUUID(),
        name: 'Математика',
        variant: 'Занятие на 60 минут',
        pricePerLesson: 1000,
      },
      {
        id: crypto.randomUUID(),
        name: 'Физика',
        variant: 'Занятие на 90 минут',
        pricePerLesson: 1350,
        unpaidLessonsAmount: 2,
      },
    ],
  },
];
