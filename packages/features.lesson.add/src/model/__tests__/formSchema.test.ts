import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import { createFormSchema } from '../formSchema';
import { MAX_LESSON_DURATION_MINUTES } from '../../utils';

const t = ((key: string) => key) as TFunction;
const schema = createFormSchema(t);

const validBase = {
  title: 'Алгебра',
  description: '',
  studentId: '42',
  startTime: '10:00',
  endTime: '11:00',
  startDate: new Date('2026-04-21T00:00:00'),
  repeatMode: 'none' as const,
  repeatDays: [] as number[],
};

describe('createFormSchema', () => {
  it('принимает валидную форму', () => {
    const result = schema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it('требует title и studentId', () => {
    const result = schema.safeParse({ ...validBase, title: '', studentId: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('title');
      expect(paths).toContain('studentId');
    }
  });

  it('отклоняет title из одних пробелов', () => {
    const result = schema.safeParse({ ...validBase, title: ' ' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.join('.') === 'title')).toBe(true);
    }
  });

  it('обрезает пробелы вокруг title', () => {
    const result = schema.safeParse({ ...validBase, title: '  Алгебра  ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Алгебра');
    }
  });

  it('требует startTime и endTime', () => {
    const result = schema.safeParse({ ...validBase, startTime: '', endTime: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('validation.startTimeRequired');
      expect(messages).toContain('validation.endTimeRequired');
    }
  });

  it('отклоняет одинаковые start и end', () => {
    const result = schema.safeParse({ ...validBase, startTime: '10:00', endTime: '10:00' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === 'validation.endAfterStart')).toBe(true);
    }
  });

  it('отклоняет длительность больше 12 часов', () => {
    const startM = 8 * 60;
    const endM = startM + MAX_LESSON_DURATION_MINUTES + 1;
    const endH = Math.floor(endM / 60);
    const endMin = endM % 60;
    const endTime = `${String(endH).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

    const result = schema.safeParse({ ...validBase, startTime: '08:00', endTime });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === 'validation.maxDuration')).toBe(true);
    }
  });

  it('для weekly требует хотя бы один день', () => {
    const result = schema.safeParse({
      ...validBase,
      repeatMode: 'weekly',
      repeatDays: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === 'validation.repeatDaysRequired')).toBe(
        true,
      );
    }
  });

  it('принимает weekly с выбранными днями', () => {
    const result = schema.safeParse({
      ...validBase,
      repeatMode: 'weekly',
      repeatDays: [0, 2],
    });
    expect(result.success).toBe(true);
  });

  it('для repeating пустая дата окончания означает серию без конца', () => {
    const withoutUntil = schema.safeParse({
      ...validBase,
      repeatMode: 'weekly',
      repeatDays: [0],
      repeatUntil: null,
    });
    expect(withoutUntil.success).toBe(true);
  });

  it('для repeating дата окончания не может быть раньше начала', () => {
    const beforeStart = schema.safeParse({
      ...validBase,
      repeatMode: 'weekly',
      repeatDays: [0],
      repeatUntil: new Date('2026-04-20T00:00:00'),
    });
    expect(beforeStart.success).toBe(false);
    if (!beforeStart.success) {
      expect(
        beforeStart.error.issues.some((i) => i.message === 'validation.repeatUntilBeforeStart'),
      ).toBe(true);
    }

    const sameDay = schema.safeParse({
      ...validBase,
      repeatMode: 'weekly',
      repeatDays: [0],
      repeatUntil: new Date('2026-04-21T18:00:00'),
    });
    expect(sameDay.success).toBe(true);
  });

  it('отклоняет невалидный формат времени', () => {
    const result = schema.safeParse({ ...validBase, startTime: '25:00' });
    expect(result.success).toBe(false);
  });
});
