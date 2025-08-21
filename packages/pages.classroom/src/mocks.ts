import { ClassroomPropsT } from './types';

export const classroomsMock: ClassroomPropsT[] = [
  {
    id: 1,
    name: 'Анна Смирнова',
    status: 'study',
  },
  {
    id: 2,
    name: 'Максим Иванов',
    status: 'study',
  },
  {
    id: 3,
    name: 'Елизавета Петрова',
    status: 'study',
  },
  {
    id: 4,
    name: 'Дмитрий Кузнецов',
    status: 'study',
  },
  {
    id: 5,
    name: 'Андрей Соколов',
    status: 'study',
  },
  {
    id: 6,
    name: 'Кирилл Лебедев',
    status: 'pause',
  },
  {
    id: 7,
    name: 'Наталья Орлова',
    status: 'completed',
  },
  {
    id: 8,
    name: 'English Group',
    status: 'study',
    groupSize: 4,
  },
  {
    id: 9,
    name: 'Удаленный пользователь',
    status: 'completed',
    deleted: true,
  },

  {
    id: 10,
    name: 'Удаленный пользователь',
    status: 'pause',
    deleted: true,
  },
  {
    id: 11,
    name: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
    status: 'study',
    groupSize: 4,
  },
  {
    id: 12,
    name: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
    status: 'pause',
  },
];

export type BoardT = {
  id: number;
  name: string;
  updated_at: string;
  created_at: string;
  kind: string;
  last_opened_at: string;
};

export type NoteT = {
  id: number;
  name: string;
  updated_at: string;
  created_at: string;
  kind: string;
  last_opened_at: string;
};

export const boardsMock: BoardT[] = [
  {
    id: 1,
    name: 'Алгебра - Квадратные уравнения',
    updated_at: '2024-01-15T10:30:00Z',
    created_at: '2024-01-10T10:30:00Z',
    kind: 'board',
    last_opened_at: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    name: 'Геометрия - Теорема Пифагора',
    updated_at: '2024-01-14T14:20:00Z',
    created_at: '2024-01-09T14:20:00Z',
    kind: 'board',
    last_opened_at: '2024-01-14T14:20:00Z',
  },
  {
    id: 3,
    name: 'Физика - Законы Ньютона',
    updated_at: '2024-01-13T09:15:00Z',
    created_at: '2024-01-08T09:15:00Z',
    kind: 'board',
    last_opened_at: '2024-01-13T09:15:00Z',
  },
  {
    id: 4,
    name: 'Химия - Периодическая таблица',
    updated_at: '2024-01-12T16:45:00Z',
    created_at: '2024-01-07T16:45:00Z',
    kind: 'board',
    last_opened_at: '2024-01-12T16:45:00Z',
  },
  {
    id: 5,
    name: 'История - Древний Рим',
    updated_at: '2024-01-11T11:30:00Z',
    created_at: '2024-01-06T11:30:00Z',
    kind: 'board',
    last_opened_at: '2024-01-11T11:30:00Z',
  },
  {
    id: 6,
    name: 'Литература - Анализ стихотворения',
    updated_at: '2024-01-10T13:25:00Z',
    created_at: '2024-01-05T13:25:00Z',
    kind: 'board',
    last_opened_at: '2024-01-10T13:25:00Z',
  },
  {
    id: 7,
    name: 'Биология - Строение клетки',
    updated_at: '2024-01-09T15:40:00Z',
    created_at: '2024-01-04T15:40:00Z',
    kind: 'board',
    last_opened_at: '2024-01-09T15:40:00Z',
  },
  {
    id: 8,
    name: 'География - Климатические пояса',
    updated_at: '2024-01-08T12:10:00Z',
    created_at: '2024-01-03T12:10:00Z',
    kind: 'board',
    last_opened_at: '2024-01-08T12:10:00Z',
  },
  {
    id: 9,
    name: 'Информатика - Алгоритмы',
    updated_at: '2024-01-07T08:55:00Z',
    created_at: '2024-01-02T08:55:00Z',
    kind: 'board',
    last_opened_at: '2024-01-07T08:55:00Z',
  },
  {
    id: 10,
    name: 'Английский - Грамматика Present Perfect',
    updated_at: '2024-01-06T17:20:00Z',
    created_at: '2024-01-01T17:20:00Z',
    kind: 'board',
    last_opened_at: '2024-01-06T17:20:00Z',
  },
];

export const notesMock: NoteT[] = [
  {
    id: 1,
    name: 'Конспект по алгебре',
    updated_at: '2024-01-15T12:32:00Z',
    created_at: '2024-01-10T12:32:00Z',
    kind: 'note',
    last_opened_at: '2024-01-15T12:32:00Z',
  },
  {
    id: 2,
    name: 'Формулы по физике',
    updated_at: '2024-01-14T15:45:00Z',
    created_at: '2024-01-09T15:45:00Z',
    kind: 'note',
    last_opened_at: '2024-01-14T15:45:00Z',
  },
  {
    id: 3,
    name: 'Грамматические правила',
    updated_at: '2024-01-13T09:20:00Z',
    created_at: '2024-01-08T09:20:00Z',
    kind: 'note',
    last_opened_at: '2024-01-13T09:20:00Z',
  },
  {
    id: 4,
    name: 'Исторические даты',
    updated_at: '2024-01-12T14:10:00Z',
    created_at: '2024-01-07T14:10:00Z',
    kind: 'note',
    last_opened_at: '2024-01-12T14:10:00Z',
  },
  {
    id: 5,
    name: 'Химические формулы',
    updated_at: '2024-01-11T11:30:00Z',
    created_at: '2024-01-06T11:30:00Z',
    kind: 'note',
    last_opened_at: '2024-01-11T11:30:00Z',
  },
  {
    id: 6,
    name: 'Литературные термины',
    updated_at: '2024-01-10T16:25:00Z',
    created_at: '2024-01-05T16:25:00Z',
    kind: 'note',
    last_opened_at: '2024-01-10T16:25:00Z',
  },
  {
    id: 7,
    name: 'Географические названия',
    updated_at: '2024-01-09T13:40:00Z',
    created_at: '2024-01-04T13:40:00Z',
    kind: 'note',
    last_opened_at: '2024-01-09T13:40:00Z',
  },
  {
    id: 8,
    name: 'Биологические термины',
    updated_at: '2024-01-08T10:15:00Z',
    created_at: '2024-01-03T10:15:00Z',
    kind: 'note',
    last_opened_at: '2024-01-08T10:15:00Z',
  },
  {
    id: 9,
    name: 'Программирование на Python',
    updated_at: '2024-01-07T17:50:00Z',
    created_at: '2024-01-02T17:50:00Z',
    kind: 'note',
    last_opened_at: '2024-01-07T17:50:00Z',
  },
  {
    id: 10,
    name: 'Правила русского языка',
    updated_at: '2024-01-06T12:05:00Z',
    created_at: '2024-01-01T12:05:00Z',
    kind: 'note',
    last_opened_at: '2024-01-06T12:05:00Z',
  },
];
