export const students = [
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
