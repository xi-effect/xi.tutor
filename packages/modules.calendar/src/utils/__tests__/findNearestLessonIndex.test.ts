import { describe, expect, it } from 'vitest';
import type { ICalendarEvent, ScheduleLessonRow } from '../../ui/types';
import {
  findNearestCalendarEventId,
  findNearestLessonIndex,
  findNearestVisibleCalendarEventId,
} from '../findNearestLessonIndex';

const makeLesson = (overrides: Partial<ScheduleLessonRow> = {}): ScheduleLessonRow => ({
  id: 1,
  startTime: '10:00',
  endTime: '11:00',
  subject: 'Алгебра',
  studentName: 'Иван',
  studentId: 1,
  ...overrides,
});

const makeEvent = (
  overrides: Partial<ICalendarEvent> & Pick<ICalendarEvent, 'id'>,
): ICalendarEvent => ({
  title: 'Занятие',
  start: new Date('2026-04-21T10:00:00'),
  end: new Date('2026-04-21T11:00:00'),
  ...overrides,
});

describe('findNearestLessonIndex', () => {
  const day = new Date(2026, 3, 21);

  it('возвращает индекс текущего/ближайшего незавершённого занятия', () => {
    const lessons = [
      makeLesson({ id: 1, endTime: '09:00' }),
      makeLesson({ id: 2, endTime: '11:00' }),
      makeLesson({ id: 3, endTime: '13:00' }),
    ];
    const now = new Date(2026, 3, 21, 10, 30);

    expect(findNearestLessonIndex(lessons, now, day)).toBe(1);
  });

  it('возвращает -1, если все занятия уже закончились', () => {
    const lessons = [makeLesson({ endTime: '09:00' }), makeLesson({ endTime: '10:00' })];
    const now = new Date(2026, 3, 21, 12, 0);

    expect(findNearestLessonIndex(lessons, now, day)).toBe(-1);
  });
});

describe('findNearestCalendarEventId', () => {
  it('предпочитает идущее сейчас занятие ближайшему будущему', () => {
    const now = new Date('2026-04-21T10:30:00');
    const events = [
      makeEvent({
        id: 'past',
        start: new Date('2026-04-21T08:00:00'),
        end: new Date('2026-04-21T09:00:00'),
      }),
      makeEvent({
        id: 'ongoing',
        start: new Date('2026-04-21T10:00:00'),
        end: new Date('2026-04-21T11:00:00'),
      }),
      makeEvent({
        id: 'upcoming',
        start: new Date('2026-04-21T12:00:00'),
        end: new Date('2026-04-21T13:00:00'),
      }),
    ];

    expect(findNearestCalendarEventId(events, now)).toBe('ongoing');
  });

  it('берёт ближайшее upcoming, если сейчас ничего не идёт', () => {
    const now = new Date('2026-04-21T09:00:00');
    const events = [
      makeEvent({
        id: 'later',
        start: new Date('2026-04-21T14:00:00'),
        end: new Date('2026-04-21T15:00:00'),
      }),
      makeEvent({
        id: 'sooner',
        start: new Date('2026-04-21T11:00:00'),
        end: new Date('2026-04-21T12:00:00'),
      }),
    ];

    expect(findNearestCalendarEventId(events, now)).toBe('sooner');
  });

  it('игнорирует cancelled и all-day', () => {
    const now = new Date('2026-04-21T10:30:00');
    const events = [
      makeEvent({
        id: 'cancelled',
        isCancelled: true,
        start: new Date('2026-04-21T10:00:00'),
        end: new Date('2026-04-21T11:00:00'),
      }),
      makeEvent({
        id: 'all-day',
        isAllDay: true,
        start: new Date('2026-04-21T00:00:00'),
        end: new Date('2026-04-21T23:59:00'),
      }),
      makeEvent({
        id: 'ok',
        start: new Date('2026-04-21T12:00:00'),
        end: new Date('2026-04-21T13:00:00'),
      }),
    ];

    expect(findNearestCalendarEventId(events, now)).toBe('ok');
  });
});

describe('findNearestVisibleCalendarEventId', () => {
  it('возвращает id только если ближайшее видно', () => {
    const now = new Date('2026-04-21T10:30:00');
    const all = [
      makeEvent({
        id: 'ongoing',
        start: new Date('2026-04-21T10:00:00'),
        end: new Date('2026-04-21T11:00:00'),
      }),
    ];

    expect(findNearestVisibleCalendarEventId(all, all, now)).toBe('ongoing');
    expect(findNearestVisibleCalendarEventId(all, [], now)).toBeNull();
  });
});
