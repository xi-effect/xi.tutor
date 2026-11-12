import { describe, expect, it } from 'vitest';
import {
  FIRST_STEPS_COLLAPSED,
  TUTOR_FIRST_STEPS,
  countResolvedFirstSteps,
  firstStepsTotal,
  isStudentClassroomBlocked,
  isTutorLessonBlocked,
  pickExpandedStepId,
  type FirstStepMark,
} from '../model';
import { FIRST_STEPS_TOUR_STOPS } from '../tour';
import {
  acknowledgeFirstStepFlag,
  applyRemoteFirstStep,
  commitFirstStep,
  dirtyFirstStepFlags,
  FIRST_STEPS_PROGRESS_EVENT,
  markIntroSeen,
  readFirstStepMarks,
  readIntroSeen,
  type FirstStepsStorage,
} from '../storage';

const memoryStorage = (): FirstStepsStorage => {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
};

describe('первые шаги', () => {
  it('ставит кабинет, звонок и материалы перед приглашением', () => {
    expect(TUTOR_FIRST_STEPS.slice(0, 5)).toEqual([
      'navigation',
      'settings',
      'cabinet',
      'call',
      'workspace',
    ]);
    expect(firstStepsTotal('tutor')).toBe(8);
    expect(firstStepsTotal('student')).toBe(3);
    expect(FIRST_STEPS_TOUR_STOPS.navigation.map((stop) => stop.anchor)).toEqual([
      'sidebar-sections',
      'notifications',
      'user-profile',
      'sidebar-toggle',
    ]);
    expect(FIRST_STEPS_TOUR_STOPS.navigation[3]?.click).toBe('sidebar-toggle');
    expect(FIRST_STEPS_TOUR_STOPS.settings.map((stop) => stop.anchor)).toEqual([
      'user-profile',
      'user-menu',
      'settings-item',
      'support-menu',
    ]);
    expect(FIRST_STEPS_TOUR_STOPS.settings[0]?.click).toBe('open-user-menu');
    expect(FIRST_STEPS_TOUR_STOPS.settings[2]?.click).toBe('hover-support');
    expect(FIRST_STEPS_TOUR_STOPS.cabinet.map((stop) => stop.anchor)).toEqual([
      'classrooms',
      'demo-classroom-card',
      'classroom-nav',
    ]);
    expect(FIRST_STEPS_TOUR_STOPS.cabinet[0]?.click).toBe('open-classrooms');
    expect(FIRST_STEPS_TOUR_STOPS.cabinet[1]?.click).toBe('open-demo-classroom');
    expect(FIRST_STEPS_TOUR_STOPS.invite[0]?.anchor).toBe('students');
  });

  it('считает выполненное и пропущенное разобранными', () => {
    const marks: Record<string, FirstStepMark> = {
      invite: 'done',
      material: 'skipped',
      lesson: 'pending',
    };

    expect(countResolvedFirstSteps(marks, 'tutor')).toBe(2);
    expect(countResolvedFirstSteps({ ...marks, lesson: 'done' }, 'tutor')).toBe(3);
  });

  it('раскрывает первый доступный шаг и уважает ручной выбор', () => {
    const steps = [
      { id: 'join', status: 'done' as const, blocked: false },
      { id: 'classroom', status: 'pending' as const, blocked: true },
      { id: 'schedule', status: 'pending' as const, blocked: false },
    ];

    expect(pickExpandedStepId(steps, null)).toBe('schedule');
    expect(pickExpandedStepId(steps, 'classroom')).toBe('classroom');
    expect(pickExpandedStepId(steps, FIRST_STEPS_COLLAPSED)).toBeNull();
  });

  it('блокирует занятие и кабинет, только когда список точно пуст', () => {
    expect(isTutorLessonBlocked(null)).toBe(false);
    expect(isTutorLessonBlocked(0)).toBe(true);
    expect(isTutorLessonBlocked(1)).toBe(false);
    expect(isStudentClassroomBlocked(0)).toBe(true);
    expect(isStudentClassroomBlocked(2)).toBe(false);
  });

  it('хранит прогресс роли и не даёт пропуску затереть выполнение', () => {
    const storage = memoryStorage();

    expect(commitFirstStep(storage, 7, 'student', 'join', 'done', true)).toBe(true);
    expect(commitFirstStep(storage, 7, 'student', 'join', 'skipped', true)).toBe(false);
    expect(commitFirstStep(storage, 7, 'student', 'schedule', 'skipped', true)).toBe(true);
    expect(commitFirstStep(storage, 7, 'tutor', 'invite', 'done', true)).toBe(true);

    expect(readFirstStepMarks(storage, 7, 'student')).toMatchObject({
      join: 'done',
      classroom: 'pending',
      schedule: 'skipped',
    });
    expect(readFirstStepMarks(storage, 7, 'tutor').invite).toBe('done');
    expect(dirtyFirstStepFlags(storage, 7, 'student')).toEqual([
      'fs.student.join.done',
      'fs.student.schedule.skip',
    ]);
  });

  it('сообщает открытому чек-листу, что отметка изменилась', () => {
    const events: string[] = [];
    const previous = globalThis.window;
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        dispatchEvent: (event: Event) => {
          events.push(event.type);
          return true;
        },
      },
    });

    try {
      expect(commitFirstStep(memoryStorage(), 7, 'tutor', 'navigation', 'done', true)).toBe(true);
      expect(events).toEqual([FIRST_STEPS_PROGRESS_EVENT]);
    } finally {
      Object.defineProperty(globalThis, 'window', { configurable: true, value: previous });
    }
  });

  it('подтягивает серверную отметку и снимает очередь после подтверждения', () => {
    const storage = memoryStorage();

    expect(
      applyRemoteFirstStep(storage, 3, 'tutor', 'material', { done: true, skipped: true }),
    ).toBe(true);
    expect(readFirstStepMarks(storage, 3, 'tutor').material).toBe('done');
    expect(dirtyFirstStepFlags(storage, 3, 'tutor')).toEqual([]);

    commitFirstStep(storage, 3, 'tutor', 'lesson', 'skipped', true);
    acknowledgeFirstStepFlag(storage, 3, 'tutor', 'fs.tutor.lesson.skip');
    expect(dirtyFirstStepFlags(storage, 3, 'tutor')).toEqual([]);
    expect(readFirstStepMarks(storage, 3, 'tutor').lesson).toBe('skipped');
  });

  it('приветствие не сбрасывается, когда отмечается шаг', () => {
    const storage = memoryStorage();

    expect(readIntroSeen(storage, 4, 'tutor')).toBe(false);
    markIntroSeen(storage, 4, 'tutor');
    commitFirstStep(storage, 4, 'tutor', 'invite', 'done', true);
    acknowledgeFirstStepFlag(storage, 4, 'tutor', 'fs.tutor.invite.done');

    expect(readIntroSeen(storage, 4, 'tutor')).toBe(true);
    expect(readFirstStepMarks(storage, 4, 'tutor').invite).toBe('done');
  });

  it('повторное выполнение после пропуска заменяет пропуск', () => {
    const storage = memoryStorage();

    commitFirstStep(storage, 1, 'tutor', 'invite', 'skipped', true);
    expect(commitFirstStep(storage, 1, 'tutor', 'invite', 'done', true)).toBe(true);
    expect(readFirstStepMarks(storage, 1, 'tutor').invite).toBe('done');
  });
});
