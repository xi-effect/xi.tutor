import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import { createMovingFormSchema } from '../formSchema';
import { MAX_LESSON_DURATION_MINUTES } from '../../utils/utils';

const t = ((key: string) => key) as TFunction;

const validBase = {
  startDate: new Date('2026-04-21T00:00:00'),
  startTime: '10:00',
  endTime: '11:00',
  moveMode: 'single' as const,
  repeatWeekdays: [] as number[],
};

describe('createMovingFormSchema', () => {
  it('принимает валидный one-off перенос', () => {
    const schema = createMovingFormSchema('one-off', t);
    expect(schema.safeParse(validBase).success).toBe(true);
  });

  it('требует startTime и endTime', () => {
    const schema = createMovingFormSchema('one-off', t);
    const result = schema.safeParse({ ...validBase, startTime: '', endTime: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('validation.startTimeRequired');
      expect(messages).toContain('validation.endTimeRequired');
    }
  });

  it('отклоняет нулевую и слишком большую длительность', () => {
    const schema = createMovingFormSchema('one-off', t);
    expect(schema.safeParse({ ...validBase, endTime: '10:00' }).success).toBe(false);

    const endM = 8 * 60 + MAX_LESSON_DURATION_MINUTES + 1;
    const endTime = `${String(Math.floor(endM / 60)).padStart(2, '0')}:${String(endM % 60).padStart(2, '0')}`;
    expect(schema.safeParse({ ...validBase, startTime: '08:00', endTime }).success).toBe(false);
  });

  it('для recurring + single_and_next требует дни недели', () => {
    const schema = createMovingFormSchema('recurring', t);
    const withoutDays = schema.safeParse({
      ...validBase,
      moveMode: 'single_and_next',
      repeatWeekdays: [],
    });
    expect(withoutDays.success).toBe(false);
    if (!withoutDays.success) {
      expect(
        withoutDays.error.issues.some((i) => i.message === 'validation.repeatDaysRequired'),
      ).toBe(true);
    }

    const withDays = schema.safeParse({
      ...validBase,
      moveMode: 'single_and_next',
      repeatWeekdays: [1, 3],
    });
    expect(withDays.success).toBe(true);
  });

  it('для recurring + single_and_next + дата окончания валидирует дату', () => {
    const schema = createMovingFormSchema('recurring', t);
    const withoutUntil = schema.safeParse({
      ...validBase,
      moveMode: 'single_and_next',
      repeatWeekdays: [1],
      repeatEnds: 'date',
      repeatUntil: null,
    });
    expect(withoutUntil.success).toBe(false);

    const beforeStart = schema.safeParse({
      ...validBase,
      moveMode: 'single_and_next',
      repeatWeekdays: [1],
      repeatEnds: 'date',
      repeatUntil: new Date('2026-04-20T00:00:00'),
    });
    expect(beforeStart.success).toBe(false);
    if (!beforeStart.success) {
      expect(
        beforeStart.error.issues.some((i) => i.message === 'validation.repeatUntilBeforeStart'),
      ).toBe(true);
    }
  });

  it('не требует дни для recurring + single', () => {
    const schema = createMovingFormSchema('recurring', t);
    expect(
      schema.safeParse({
        ...validBase,
        moveMode: 'single',
        repeatWeekdays: [],
      }).success,
    ).toBe(true);
  });
});
