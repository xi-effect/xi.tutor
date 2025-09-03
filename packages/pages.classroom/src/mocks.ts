import { ClassroomPropsT } from './types';

export const classroomsMock: ClassroomPropsT[] = [
  {
    id: 1,
    name: 'Анна Смирнова',
    status: 'active',
    kind: 'individual',
    description: 'Подготовка к ЕГЭ по математике',
    created_at: '2025-01-15T10:00:00Z',
    student_id: 42,
  },
  {
    id: 2,
    name: 'Максим Иванов',
    status: 'active',
    kind: 'individual',
    description: 'Подготовка к ОГЭ по русскому языку',
    created_at: '2025-01-16T11:30:00Z',
    student_id: 38,
  },
  {
    id: 3,
    name: 'Елизавета Петрова',
    status: 'active',
    kind: 'individual',
    description: 'Изучение английского языка с нуля',
    created_at: '2025-01-17T09:15:00Z',
    student_id: 45,
  },
  {
    id: 4,
    name: 'Дмитрий Кузнецов',
    status: 'active',
    kind: 'individual',
    description: 'Подготовка к ЕГЭ по физике',
    created_at: '2025-01-18T14:20:00Z',
    student_id: 51,
  },
  {
    id: 5,
    name: 'Андрей Соколов',
    status: 'active',
    kind: 'individual',
    description: 'Подготовка к ЕГЭ по химии',
    created_at: '2025-01-19T16:45:00Z',
    student_id: 47,
  },
  {
    id: 6,
    name: 'Кирилл Лебедев',
    status: 'paused',
    kind: 'individual',
    description: 'Подготовка к ЕГЭ по биологии',
    created_at: '2025-01-20T13:00:00Z',
    student_id: 53,
  },
  {
    id: 7,
    name: 'Наталья Орлова',
    status: 'finished',
    kind: 'individual',
    description: 'Подготовка к ЕГЭ по истории',
    created_at: '2025-01-21T15:30:00Z',
    student_id: 49,
  },
  {
    id: 8,
    name: 'English Group',
    status: 'active',
    kind: 'group',
    description: 'Курс по английскому языку для группы',
    created_at: '2025-01-22T12:00:00Z',
  },
  {
    id: 9,
    name: 'Math Group',
    status: 'active',
    kind: 'group',
    description: 'Курс по математике для группы',
    created_at: '2025-01-23T10:30:00Z',
  },
  {
    id: 10,
    name: 'Physics Group',
    status: 'paused',
    kind: 'group',
    description: 'Курс по физике для группы',
    created_at: '2025-01-24T11:45:00Z',
  },
  {
    id: 11,
    name: 'Chemistry Group',
    status: 'active',
    kind: 'group',
    description: 'Курс по химии для группы',
    created_at: '2025-01-25T14:15:00Z',
  },
  {
    id: 12,
    name: 'Biology Group',
    status: 'paused',
    kind: 'group',
    description: 'Курс по биологии для группы',
    created_at: '2025-01-26T16:30:00Z',
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
