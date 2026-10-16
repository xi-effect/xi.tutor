import { describe, expect, it } from 'vitest';
import { getEventDateKeys } from '../eventsStore';

describe('getEventDateKeys', () => {
  it('кладёт занятие только в день начала', () => {
    const keys = getEventDateKeys({
      start: new Date(2026, 9, 12, 20, 40),
      end: new Date(2026, 9, 12, 22, 0),
    });
    expect(keys).toEqual(['2026-10-12']);
  });

  it('не дублирует карточку на следующий день, если конец ровно в полночь', () => {
    const keys = getEventDateKeys({
      start: new Date(2026, 9, 12, 22, 40),
      end: new Date(2026, 9, 13, 0, 0),
    });
    expect(keys).toEqual(['2026-10-12']);
  });

  it('оставляет занятие через полночь в колонке дня начала', () => {
    const keys = getEventDateKeys({
      start: new Date(2026, 9, 12, 23, 0),
      end: new Date(2026, 9, 13, 1, 0),
    });
    expect(keys).toEqual(['2026-10-12']);
  });
});
