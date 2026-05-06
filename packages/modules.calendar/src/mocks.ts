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
    id: 'student-1',
    name: 'Анна Смирнова (Групповое • Practice english)',
    subject: {
      id: 'subj-1',
      name: 'Английский язык',
      variant: 'Занятие на 40 минут',
      pricePerLesson: 600,
      unpaidLessonsAmount: 1,
    },
  },
  {
    id: 'student-2',
    name: 'Максим Иванов',
    subject: {
      id: 'subj-2',
      name: 'Математика',
      variant: 'Занятие на 60 минут',
      pricePerLesson: 1000,
    },
  },
];

/** Понедельник текущей недели (weekStartsOn: 1) */
const getWeekStart = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

/** Понедельник недели со сдвигом от якорной (текущей) */
const mondayWithOffset = (anchorMonday: Date, weekOffset: number): Date => {
  const d = new Date(anchorMonday);
  d.setDate(anchorMonday.getDate() + weekOffset * 7);
  return d;
};

type LessonSeed = {
  id: string;
  /** 0 = пн … 6 = вс */
  dayIndex: number;
  start: [number, number];
  end: [number, number];
  classroomId?: number;
  subject: string;
  studentName: string;
  description: string;
  lessonType?: 'individual' | 'group';
};

const REAL_CLASSROOM_IDS = [
  710, 708, 476, 457, 456, 452, 451, 450, 449, 448, 447, 446, 445, 444, 443, 388, 379, 378, 377,
  376,
];

const getClassroomIdBySeedId = (seedId: string): number => {
  const hash = [...seedId].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return REAL_CLASSROOM_IDS[hash % REAL_CLASSROOM_IDS.length];
};

const mkLessons = (monday: Date, seeds: LessonSeed[]): ICalendarEvent[] =>
  seeds.map((s) => {
    const start = new Date(monday);
    start.setDate(monday.getDate() + s.dayIndex);
    start.setHours(s.start[0], s.start[1], 0, 0);
    const end = new Date(monday);
    end.setDate(monday.getDate() + s.dayIndex);
    end.setHours(s.end[0], s.end[1], 0, 0);
    return {
      id: s.id,
      title: s.description,
      start,
      end,
      type: 'lesson' as const,
      lessonInfo: {
        studentName: s.studentName,
        subject: s.subject,
        lessonType: s.lessonType ?? 'individual',
        description: s.description,
        classroomId: s.classroomId ?? getClassroomIdBySeedId(s.id),
      },
    };
  });

const SUBJECTS_ROT = [
  'Математика',
  'Физика',
  'Химия',
  'Биология',
  'История',
  'География',
  'Литература',
  'Информатика',
  'Английский',
];

/** Много карточек в один день — для проверки общего скролла */
const mkDenseDay = (
  monday: Date,
  dayIndex: number,
  idPrefix: string,
  count: number,
): ICalendarEvent[] => {
  const seeds: LessonSeed[] = [];
  for (let i = 0; i < count; i++) {
    const h = 8 + (i % 12);
    const m = (i % 2) * 30;
    const eh = Math.min(h + 1, 22);
    seeds.push({
      id: `${idPrefix}-${i + 1}`,
      dayIndex,
      start: [h, m],
      end: [eh, m],
      classroomId: REAL_CLASSROOM_IDS[i % REAL_CLASSROOM_IDS.length],
      subject: SUBJECTS_ROT[i % SUBJECTS_ROT.length],
      studentName: `Ученик ${i + 1}`,
      description: `Блок ${i + 1}`,
    });
  }
  return mkLessons(monday, seeds);
};

/** Несколько занятий строго на календарный «сегодня» (для проверки колонки / подсветки дня) */
const buildTodayMockEvents = (): ICalendarEvent[] => {
  const now = new Date();
  const y = now.getFullYear();
  const mo = now.getMonth();
  const day = now.getDate();
  const at = (h: number, min: number) => new Date(y, mo, day, h, min, 0, 0);

  return [
    {
      id: 'mock-today-1',
      title: 'Математика (мок)',
      start: at(9, 0),
      end: at(10, 0),
      type: 'lesson' as const,
      lessonInfo: {
        studentName: 'Иван Смирнов',
        subject: 'Математика',
        lessonType: 'individual',
        description: 'Подготовка к контрольной',
        classroomId: 710,
      },
    },
    {
      id: 'mock-today-2',
      title: 'Английский (мок)',
      start: at(12, 30),
      end: at(13, 30),
      type: 'lesson' as const,
      lessonInfo: {
        studentName: 'Анна Петрова',
        subject: 'Английский язык',
        lessonType: 'group',
        description: 'Speaking practice',
        classroomId: 708,
      },
    },
    {
      id: 'mock-today-3',
      title: 'Физика (мок)',
      start: at(16, 0),
      end: at(17, 30),
      type: 'lesson' as const,
      lessonInfo: {
        studentName: 'Сергей Кузнецов',
        subject: 'Физика',
        lessonType: 'individual',
        description: 'Электродинамика',
        classroomId: 476,
      },
    },
  ];
};

/**
 * Набор недель относительно текущей — листайте «пред/след неделя», чтобы проверить:
 * пустую неделю, один день, сшитые пустые колонки, «дыры» между занятыми днями, плотное расписание.
 */
const buildScenarioWeeks = (): ICalendarEvent[] => {
  const anchor = getWeekStart(new Date());
  const out: ICalendarEvent[] = [];

  // ── Неделя −4: полностью без занятий (все колонки пустые) ──
  // (событий нет — сценарий «на выбранные дни» при полной пустоте)

  // ── Неделя −3: только четверг с уроками (пн–ср объединённый пустой блок + пустая пт при 5 колонках) ──
  out.push(
    ...mkLessons(mondayWithOffset(anchor, -3), [
      {
        id: 'sc-w-3-thu-1',
        dayIndex: 3,
        start: [10, 0],
        end: [11, 0],
        subject: 'Математика',
        studentName: 'Иван Смирнов',
        description: 'Подготовка к контрольной',
      },
      {
        id: 'sc-w-3-thu-2',
        dayIndex: 3,
        start: [14, 0],
        end: [15, 30],
        subject: 'Физика',
        studentName: 'Анна Петрова',
        description: 'Электричество',
      },
    ]),
  );

  out.push(...mkDenseDay(mondayWithOffset(anchor, -3), 3, 'w-3-thu-d', 20));

  // ── Неделя −2: пн урок; вт–ср пусто (сшивка); чт урок; пт пусто ──
  out.push(
    ...mkLessons(mondayWithOffset(anchor, -2), [
      {
        id: 'sc-w-2-mon',
        dayIndex: 0,
        start: [9, 0],
        end: [10, 0],
        subject: 'Химия',
        studentName: 'Иван Смирнов',
        description: 'Органика',
      },
      {
        id: 'sc-w-2-thu',
        dayIndex: 3,
        start: [13, 0],
        end: [14, 0],
        subject: 'История',
        studentName: 'Максим Иванов',
        description: 'Древний Рим',
      },
    ]),
  );

  out.push(
    ...mkDenseDay(mondayWithOffset(anchor, -2), 0, 'w-2-mon-d', 18),
    ...mkDenseDay(mondayWithOffset(anchor, -2), 3, 'w-2-thu-d', 18),
  );

  // ── Неделя −1: только пятница — один занятый день, остальное пусто ──
  out.push(
    ...mkLessons(mondayWithOffset(anchor, -1), [
      {
        id: 'sc-w-1-fri',
        dayIndex: 4,
        start: [11, 0],
        end: [12, 0],
        subject: 'Английский',
        studentName: 'Елена Михайлова',
        description: 'Speaking club',
        lessonType: 'group',
      },
    ]),
  );

  // ── Неделя 0 (текущая): классическое расписание пн–пт ──
  out.push(
    ...mkLessons(mondayWithOffset(anchor, 0), [
      {
        id: 'card-1',
        dayIndex: 0,
        start: [11, 0],
        end: [12, 0],
        subject: 'Химия',
        studentName: 'Иван Смирнов',
        description: 'Основы органической химии',
      },
      {
        id: 'card-2',
        dayIndex: 0,
        start: [13, 0],
        end: [14, 0],
        subject: 'Физика',
        studentName: 'Анна Петрова',
        description: 'Законы Ньютона',
      },
      {
        id: 'card-3',
        dayIndex: 1,
        start: [15, 0],
        end: [16, 0],
        subject: 'Физика',
        studentName: 'Сергей Кузнецов',
        description: 'Классическая механика',
        lessonType: 'group',
      },
      {
        id: 'card-4',
        dayIndex: 1,
        start: [9, 0],
        end: [10, 0],
        subject: 'Математика',
        studentName: 'Елена Михайлова',
        description: 'Алгебра и геометрия',
      },
      {
        id: 'card-5',
        dayIndex: 2,
        start: [11, 0],
        end: [12, 0],
        subject: 'Биология',
        studentName: 'Сергей Иванов',
        description: 'Эволюционная теория',
      },
      {
        id: 'card-6',
        dayIndex: 2,
        start: [15, 0],
        end: [16, 0],
        subject: 'Биология',
        studentName: 'Мария Васильева',
        description: 'Генетика и ДНК',
        lessonType: 'group',
      },
      {
        id: 'card-7',
        dayIndex: 3,
        start: [15, 0],
        end: [16, 0],
        subject: 'История',
        studentName: 'Максим Иванов',
        description: 'Древний Рим',
      },
      {
        id: 'card-8',
        dayIndex: 4,
        start: [10, 0],
        end: [11, 0],
        subject: 'Химия',
        studentName: 'Иван Смирнов',
        description: 'Разбор домашнего задания',
      },
    ]),
  );

  out.push(
    ...mkDenseDay(mondayWithOffset(anchor, 0), 0, 'w0-mon-d', 22),
    ...mkDenseDay(mondayWithOffset(anchor, 0), 1, 'w0-tue-d', 22),
    ...mkDenseDay(mondayWithOffset(anchor, 0), 2, 'w0-wed-d', 22),
    ...mkDenseDay(mondayWithOffset(anchor, 0), 3, 'w0-thu-d', 22),
    ...mkDenseDay(mondayWithOffset(anchor, 0), 4, 'w0-fri-d', 22),
  );

  // ── Неделя +1: пн–ср пусто (один блок), чт–пт с уроками ──
  out.push(
    ...mkLessons(mondayWithOffset(anchor, 1), [
      {
        id: 'sc-w1-thu-1',
        dayIndex: 3,
        start: [9, 0],
        end: [10, 30],
        subject: 'Физика',
        studentName: 'Пётр Сидоров',
        description: 'Механика',
      },
      {
        id: 'sc-w1-thu-2',
        dayIndex: 3,
        start: [12, 0],
        end: [13, 0],
        subject: 'Математика',
        studentName: 'Ольга Ким',
        description: 'Тригонометрия',
      },
      {
        id: 'sc-w1-fri',
        dayIndex: 4,
        start: [11, 0],
        end: [12, 0],
        subject: 'Литература',
        studentName: 'Иван Смирнов',
        description: 'Тургенев',
      },
    ]),
  );

  out.push(
    ...mkDenseDay(mondayWithOffset(anchor, 1), 3, 'w1-thu-d', 18),
    ...mkDenseDay(mondayWithOffset(anchor, 1), 4, 'w1-fri-d', 18),
  );

  // ── Неделя +2: «шахматка» — пн, ср, пт с уроками; вт и чт пустые по отдельности ──
  out.push(
    ...mkLessons(mondayWithOffset(anchor, 2), [
      {
        id: 'sc-w2-mon',
        dayIndex: 0,
        start: [10, 0],
        end: [11, 0],
        subject: 'Математика',
        studentName: 'Анна Петрова',
        description: 'Производная',
      },
      {
        id: 'sc-w2-wed',
        dayIndex: 2,
        start: [14, 0],
        end: [15, 0],
        subject: 'Информатика',
        studentName: 'Иван Смирнов',
        description: 'Python',
      },
      {
        id: 'sc-w2-fri',
        dayIndex: 4,
        start: [16, 0],
        end: [17, 0],
        subject: 'Химия',
        studentName: 'Иван Смирнов',
        description: 'Лабораторная',
      },
    ]),
  );

  out.push(
    ...mkDenseDay(mondayWithOffset(anchor, 2), 0, 'w2-mon-d', 16),
    ...mkDenseDay(mondayWithOffset(anchor, 2), 2, 'w2-wed-d', 16),
    ...mkDenseDay(mondayWithOffset(anchor, 2), 4, 'w2-fri-d', 16),
  );

  // ── Неделя +3: плотное расписание (много карточек в один день) ──
  out.push(
    ...mkLessons(mondayWithOffset(anchor, 3), [
      {
        id: 'sc-w3-mon-1',
        dayIndex: 0,
        start: [8, 0],
        end: [9, 0],
        subject: 'Математика',
        studentName: 'Иван А.',
        description: 'Урок 1',
      },
      {
        id: 'sc-w3-mon-2',
        dayIndex: 0,
        start: [9, 0],
        end: [10, 0],
        subject: 'Физика',
        studentName: 'Иван Б.',
        description: 'Урок 2',
      },
      {
        id: 'sc-w3-mon-3',
        dayIndex: 0,
        start: [10, 30],
        end: [11, 30],
        subject: 'Химия',
        studentName: 'Иван В.',
        description: 'Урок 3',
      },
      {
        id: 'sc-w3-mon-4',
        dayIndex: 0,
        start: [12, 0],
        end: [13, 30],
        subject: 'Биология',
        studentName: 'Иван Г.',
        description: 'Урок 4',
      },
      {
        id: 'sc-w3-mon-5',
        dayIndex: 0,
        start: [14, 0],
        end: [15, 0],
        subject: 'История',
        studentName: 'Иван Д.',
        description: 'Урок 5',
      },
      {
        id: 'sc-w3-mon-6',
        dayIndex: 0,
        start: [15, 30],
        end: [16, 30],
        subject: 'География',
        studentName: 'Иван Е.',
        description: 'Урок 6',
      },
      {
        id: 'sc-w3-mon-7',
        dayIndex: 0,
        start: [17, 0],
        end: [18, 0],
        subject: 'Литература',
        studentName: 'Иван Ж.',
        description: 'Урок 7',
      },
      {
        id: 'sc-w3-mon-8',
        dayIndex: 0,
        start: [18, 15],
        end: [19, 15],
        subject: 'Английский',
        studentName: 'Иван З.',
        description: 'Урок 8',
      },
      {
        id: 'sc-w3-mon-9',
        dayIndex: 0,
        start: [8, 30],
        end: [9, 15],
        subject: 'Информатика',
        studentName: 'Иван И.',
        description: 'Урок 9',
      },
      {
        id: 'sc-w3-mon-10',
        dayIndex: 0,
        start: [11, 30],
        end: [12, 15],
        subject: 'Обществознание',
        studentName: 'Иван К.',
        description: 'Урок 10',
      },
      {
        id: 'sc-w3-mon-11',
        dayIndex: 0,
        start: [13, 30],
        end: [14, 15],
        subject: 'Физкультура',
        studentName: 'Иван Л.',
        description: 'Урок 11',
      },
      {
        id: 'sc-w3-mon-12',
        dayIndex: 0,
        start: [19, 30],
        end: [20, 30],
        subject: 'Математика',
        studentName: 'Иван М.',
        description: 'Урок 12 (вечер)',
      },
      {
        id: 'sc-w3-mon-13',
        dayIndex: 0,
        start: [7, 0],
        end: [7, 45],
        subject: 'Русский',
        studentName: 'Иван Н.',
        description: 'Урок 13 (рано)',
      },
      {
        id: 'sc-w3-mon-14',
        dayIndex: 0,
        start: [20, 45],
        end: [21, 30],
        subject: 'Физика',
        studentName: 'Иван О.',
        description: 'Урок 14',
      },
      {
        id: 'sc-w3-mon-15',
        dayIndex: 0,
        start: [16, 0],
        end: [16, 45],
        subject: 'Химия',
        studentName: 'Иван П.',
        description: 'Урок 15',
      },
      {
        id: 'sc-w3-mon-16',
        dayIndex: 0,
        start: [17, 30],
        end: [18, 15],
        subject: 'Биология',
        studentName: 'Иван Р.',
        description: 'Урок 16',
      },
      {
        id: 'sc-w3-thu-dense-1',
        dayIndex: 3,
        start: [8, 0],
        end: [9, 0],
        subject: 'Математика',
        studentName: 'Пётр А.',
        description: 'Чт — блок 1',
      },
      {
        id: 'sc-w3-thu-dense-2',
        dayIndex: 3,
        start: [9, 30],
        end: [10, 30],
        subject: 'Физика',
        studentName: 'Пётр Б.',
        description: 'Чт — блок 2',
      },
      {
        id: 'sc-w3-thu-dense-3',
        dayIndex: 3,
        start: [11, 0],
        end: [12, 0],
        subject: 'Химия',
        studentName: 'Пётр В.',
        description: 'Чт — блок 3',
      },
      {
        id: 'sc-w3-thu-dense-4',
        dayIndex: 3,
        start: [13, 0],
        end: [14, 0],
        subject: 'Биология',
        studentName: 'Пётр Г.',
        description: 'Чт — блок 4',
      },
      {
        id: 'sc-w3-thu-dense-5',
        dayIndex: 3,
        start: [15, 0],
        end: [16, 0],
        subject: 'История',
        studentName: 'Пётр Д.',
        description: 'Чт — блок 5',
      },
      {
        id: 'sc-w3-thu-dense-6',
        dayIndex: 3,
        start: [16, 30],
        end: [17, 30],
        subject: 'География',
        studentName: 'Пётр Е.',
        description: 'Чт — блок 6',
      },
      {
        id: 'sc-w3-wed-1',
        dayIndex: 2,
        start: [10, 0],
        end: [11, 0],
        subject: 'География',
        studentName: 'Мария В.',
        description: 'Климат',
      },
      {
        id: 'sc-w3-wed-2',
        dayIndex: 2,
        start: [13, 0],
        end: [14, 0],
        subject: 'Английский',
        studentName: 'Мария В.',
        description: 'Grammar',
      },
      {
        id: 'sc-w3-fri-1',
        dayIndex: 4,
        start: [9, 0],
        end: [10, 0],
        subject: 'Математика',
        studentName: 'Пётр С.',
        description: 'Упражнения',
      },
      {
        id: 'sc-w3-fri-2',
        dayIndex: 4,
        start: [11, 0],
        end: [12, 0],
        subject: 'Физика',
        studentName: 'Пётр С.',
        description: 'Задачи',
      },
      {
        id: 'sc-w3-fri-3',
        dayIndex: 4,
        start: [15, 0],
        end: [16, 0],
        subject: 'Литература',
        studentName: 'Пётр С.',
        description: 'Сочинение',
      },
    ]),
  );

  // ── Неделя +4: только вторник (один день в неделе) ──
  out.push(
    ...mkLessons(mondayWithOffset(anchor, 4), [
      {
        id: 'sc-w4-tue',
        dayIndex: 1,
        start: [12, 0],
        end: [13, 0],
        subject: 'Музыка',
        studentName: 'Ольга Ким',
        description: 'Сольфеджио',
      },
    ]),
  );

  // ── Неделя +5: сб–вс с уроками (для проверки 7 колонок на широком экране) ──
  out.push(
    ...mkLessons(mondayWithOffset(anchor, 5), [
      {
        id: 'sc-w5-sat',
        dayIndex: 5,
        start: [10, 0],
        end: [11, 0],
        subject: 'Математика',
        studentName: 'Иван Смирнов',
        description: 'Репетиция (сб)',
      },
      {
        id: 'sc-w5-sun',
        dayIndex: 6,
        start: [11, 0],
        end: [12, 0],
        subject: 'Физика',
        studentName: 'Анна Петрова',
        description: 'Репетиция (вс)',
      },
    ]),
  );

  // ── Неделя +6: только суббота с двумя уроками (пн–пт пустые) ──
  out.push(
    ...mkLessons(mondayWithOffset(anchor, 6), [
      {
        id: 'sc-w6-sat-1',
        dayIndex: 5,
        start: [9, 0],
        end: [10, 0],
        subject: 'Химия',
        studentName: 'Иван Смирнов',
        description: 'Контрольная работа',
      },
      {
        id: 'sc-w6-sat-2',
        dayIndex: 5,
        start: [14, 0],
        end: [15, 0],
        subject: 'Биология',
        studentName: 'Мария Васильева',
        description: 'Подготовка к экзамену',
      },
    ]),
  );

  return out;
};

/** События вне «сценарных» недель — для месячного вида и крайних дат */
const buildLegacyStaticEvents = (): ICalendarEvent[] => [
  {
    id: 'legacy-1',
    title: 'Дмитрий',
    start: new Date('2025-09-29T17:40:00'),
    end: new Date('2025-09-29T18:40:00'),
    type: 'lesson',
  },
  {
    id: 'legacy-2',
    title: 'Отдых',
    start: new Date('2025-09-30T11:00:00'),
    end: new Date('2025-09-30T13:00:00'),
    type: 'rest',
  },
  {
    id: 'legacy-3',
    title: 'Анна',
    start: new Date('2025-09-28T17:40:00'),
    end: new Date('2025-09-28T18:10:00'),
    type: 'lesson',
    isCancelled: true,
  },
  {
    id: 'legacy-all-day',
    title: 'Отдых',
    start: new Date('2025-09-13'),
    end: new Date('2025-09-13'),
    type: 'rest',
    isAllDay: true,
  },
];

export const MOCK_EVENTS: ICalendarEvent[] = [
  ...buildScenarioWeeks(),
  ...buildTodayMockEvents(),
  ...buildLegacyStaticEvents(),
];
