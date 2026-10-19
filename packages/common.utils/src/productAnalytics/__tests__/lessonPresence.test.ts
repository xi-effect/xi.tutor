import { describe, expect, it } from 'vitest';
import { createLessonOverlapState, updateLessonOverlap } from '../lessonPresence';

const MINUTE = 60_000;

describe('updateLessonOverlap', () => {
  it('не закрывает пороги, пока tutor один', () => {
    const state = createLessonOverlapState();
    const update = updateLessonOverlap(state, 0, 20 * MINUTE);

    expect(update.studentJoined).toBe(false);
    expect(update.reachedThresholds).toEqual([]);
    expect(update.overlapSeconds).toBe(0);
  });

  it('считает 5 и 15 минут только по совместному присутствию', () => {
    const state = createLessonOverlapState();
    const start = 1_000_000;

    const joined = updateLessonOverlap(state, 1, start);
    expect(joined.studentJoined).toBe(true);
    expect(joined.reachedThresholds).toEqual([]);

    const again = updateLessonOverlap(state, 1, start + 1_000);
    expect(again.studentJoined).toBe(false);

    const five = updateLessonOverlap(state, 1, start + 5 * MINUTE);
    expect(five.reachedThresholds).toEqual([5]);

    const fifteen = updateLessonOverlap(state, 1, start + 15 * MINUTE);
    expect(fifteen.reachedThresholds).toEqual([15]);
    expect(fifteen.overlapSeconds).toBe(15 * 60);
  });

  it('не считает стену часов tutor до прихода ученика', () => {
    const state = createLessonOverlapState();
    const start = 0;

    updateLessonOverlap(state, 0, start);
    updateLessonOverlap(state, 0, start + 20 * MINUTE);
    const joined = updateLessonOverlap(state, 1, start + 20 * MINUTE);
    const five = updateLessonOverlap(state, 1, start + 25 * MINUTE);

    expect(joined.studentJoined).toBe(true);
    expect(five.reachedThresholds).toEqual([5]);
    expect(five.overlapSeconds).toBe(5 * 60);
  });

  it('суммирует разрыв внутри одной сессии и не обнуляет эпизод', () => {
    const state = createLessonOverlapState();
    let now = 0;

    updateLessonOverlap(state, 1, now);
    now += 10 * MINUTE;
    const left = updateLessonOverlap(state, 0, now);
    expect(left.reachedThresholds).toEqual([5]);

    now += 30 * MINUTE;
    updateLessonOverlap(state, 1, now);
    now += 5 * MINUTE;
    const update = updateLessonOverlap(state, 1, now);

    expect(update.reachedThresholds).toEqual([15]);
    expect(update.overlapSeconds).toBe(15 * 60);
  });
});
