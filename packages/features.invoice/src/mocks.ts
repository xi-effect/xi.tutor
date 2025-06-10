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
        price: 600,
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
        price: 1000,
      },
      {
        id: crypto.randomUUID(),
        name: 'Физика',
        variant: 'Занятие на 90 минут',
        price: 1350,
      },
    ],
  },
];
