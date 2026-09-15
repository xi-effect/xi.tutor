import { describe, expect, it } from 'vitest';
import type { ScheduleLessonRow } from '../../ui/types';
import {
  interleaveLessonRowsWithFreeTimeGaps,
  interleaveWithFreeTimeGaps,
} from '../interleaveWithFreeTimeGaps';

const at = (hours: number, minutes = 0) => new Date(2026, 3, 21, hours, minutes, 0, 0);

describe('interleaveWithFreeTimeGaps', () => {
  it('не вставляет окно между стыкующимися слотами', () => {
    const items = [
      { id: 'a', start: at(16), end: at(17) },
      { id: 'b', start: at(17), end: at(18) },
    ];
    const feed = interleaveWithFreeTimeGaps(items, (item) => item);
    expect(feed.map((entry) => entry.kind)).toEqual(['item', 'item']);
  });

  it('вставляет окно между разрывом', () => {
    const items = [
      { id: 'a', start: at(16), end: at(17) },
      { id: 'b', start: at(20), end: at(21) },
    ];
    const feed = interleaveWithFreeTimeGaps(items, (item) => item);
    expect(feed).toHaveLength(3);
    expect(feed[1]).toMatchObject({ kind: 'gap', start: at(17), end: at(20) });
  });

  it('считает занятость по позднейшему окончанию при пересечении', () => {
    const items = [
      { id: 'a', start: at(16), end: at(18) },
      { id: 'b', start: at(17), end: at(17, 30) },
      { id: 'c', start: at(20), end: at(21) },
    ];
    const feed = interleaveWithFreeTimeGaps(items, (item) => item);
    expect(feed.map((entry) => entry.kind)).toEqual(['item', 'overlap', 'item', 'gap', 'item']);
    const gap = feed.find((entry) => entry.kind === 'gap');
    expect(gap).toMatchObject({ kind: 'gap', start: at(18), end: at(20) });
  });

  it('вставляет предупреждение при полном наложении', () => {
    const items = [
      { id: 'a', start: at(10), end: at(10, 30) },
      { id: 'b', start: at(10), end: at(11) },
    ];
    const feed = interleaveWithFreeTimeGaps(items, (item) => item);
    expect(feed[1]).toMatchObject({ kind: 'overlap', start: at(10), end: at(10, 30) });
  });
});

describe('interleaveLessonRowsWithFreeTimeGaps', () => {
  const day = new Date(2026, 3, 21);

  const lesson = (overrides: Partial<ScheduleLessonRow>): ScheduleLessonRow => ({
    id: 1,
    startTime: '10:00',
    endTime: '11:00',
    subject: 'Алгебра',
    studentName: 'Иван',
    studentId: 1,
    ...overrides,
  });

  it('строит окно по startTime/endTime', () => {
    const feed = interleaveLessonRowsWithFreeTimeGaps(
      [
        lesson({ id: 1, startTime: '16:00', endTime: '17:00' }),
        lesson({ id: 2, startTime: '20:00', endTime: '21:00' }),
      ],
      day,
    );
    expect(feed[1]?.kind).toBe('gap');
    if (feed[1]?.kind === 'gap') {
      expect(feed[1].start.getHours()).toBe(17);
      expect(feed[1].end.getHours()).toBe(20);
    }
  });
});
