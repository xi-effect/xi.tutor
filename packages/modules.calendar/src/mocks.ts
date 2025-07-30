// Типы в данном файле не относятся к календарю, поэтому оставляю их здесь.
// В дальнейшем, думаю, хорошо было бы их вынести в общие типы по проекту

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
