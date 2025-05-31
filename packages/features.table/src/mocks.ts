import { PaymentT, SubjectT, StudentT } from './types';

export const students: StudentT[] = [
  {
    id: '1',
    name: 'Анна Смирнова',
    description: 'Индивидуальное',
    avatarUrl: '',
  },
  {
    id: '2',
    name: 'Анна Смирнова',
    description: 'Групповое • Practice english',
    avatarUrl: '',
  },
  {
    id: '3',
    name: 'Максим Иванов',
    description: 'Групповое • Practice english',
    avatarUrl: '',
  },
];

export const subjects: SubjectT[] = [
  {
    id: '1',
    name: 'Английский язык',
  },
  {
    id: '2',
    name: 'Математика',
  },
  {
    id: '3',
    name: 'Физика',
  },
];

export const payments: PaymentT[] = [
  {
    id: '1',
    idStudent: '1',
    idSubject: '1',
    datePayment: '2025-05-24T14:21:00',
    amountPayment: 300,
    typePayment: 'cash',
    statusPayment: 'paid',
  },
  {
    id: '2',
    idStudent: '2',
    idSubject: '1',
    datePayment: '2025-05-24T14:21:00',
    amountPayment: 300,
    typePayment: 'card',
    statusPayment: 'processing',
  },
  {
    id: '3',
    idStudent: '3',
    idSubject: '2',
    datePayment: '2025-05-23T14:21:00',
    amountPayment: 300,
    typePayment: 'card',
    statusPayment: 'unpaid',
  },
  {
    id: '4',
    idStudent: '2',
    idSubject: '1',
    datePayment: '2025-05-23T14:21:00',
    amountPayment: 300,
    typePayment: 'cash',
    statusPayment: 'paid',
  },
  {
    id: '5',
    idStudent: '3',
    idSubject: '1',
    datePayment: '2025-03-12T14:21:00',
    amountPayment: 300,
    typePayment: 'card',
    statusPayment: 'paid',
  },
  {
    id: '6',
    idStudent: '1',
    idSubject: '1',
    datePayment: '2025-05-23T14:21:00',
    amountPayment: 300,
    typePayment: 'cash',
    statusPayment: 'unpaid',
  },
  {
    id: '7',
    idStudent: '2',
    idSubject: '1',
    datePayment: '2025-03-12T14:21:00',
    amountPayment: 300,
    typePayment: 'card',
    statusPayment: 'paid',
  },
  {
    id: '8',
    idStudent: '1',
    idSubject: '2',
    datePayment: '2025-05-23T14:21:00',
    amountPayment: 300,
    typePayment: 'cash',
    statusPayment: 'paid',
  },
  {
    id: '9',
    idStudent: '2',
    idSubject: '1',
    datePayment: '2025-03-12T14:21:00',
    amountPayment: 300,
    typePayment: 'card',
    statusPayment: 'processing',
  },
  {
    id: '10',
    idStudent: '1',
    idSubject: '3',
    datePayment: '2025-05-23T14:21:00',
    amountPayment: 300,
    typePayment: 'cash',
    statusPayment: 'paid',
  },
  {
    id: '11',
    idStudent: '3',
    idSubject: '3',
    datePayment: '2025-03-12T14:21:00',
    amountPayment: 300,
    typePayment: 'card',
    statusPayment: 'unpaid',
  },
];
