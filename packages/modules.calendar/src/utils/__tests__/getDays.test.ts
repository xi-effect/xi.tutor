import { describe, expect, it } from 'vitest';
import { getDaysFrom, getMonthDays, getWeekDays, getWeeksRangeDays } from '../getDays';

describe('getDays', () => {
  it('getWeekDays возвращает 7 дней с понедельника', () => {
    // среда 22.04.2026
    const days = getWeekDays(new Date(2026, 3, 22));
    expect(days).toHaveLength(7);
    expect(days[0].getDay()).toBe(1); // пн
    expect(days[6].getDay()).toBe(0); // вс
  });

  it('getMonthDays начинается с понедельника календарной сетки', () => {
    const days = getMonthDays(new Date(2026, 3, 1));
    expect(days[0].getDay()).toBe(1);
    expect(days.length % 7).toBe(0);
  });

  it('getDaysFrom берёт ровно count дней', () => {
    const start = new Date(2026, 3, 21);
    const days = getDaysFrom(start, 5);
    expect(days).toHaveLength(5);
    expect(days[0].getDate()).toBe(21);
    expect(days[4].getDate()).toBe(25);
  });

  it('getWeeksRangeDays склеивает недели вокруг якоря', () => {
    const days = getWeeksRangeDays(new Date(2026, 3, 22), 1, 1);
    expect(days).toHaveLength(21);
  });
});
