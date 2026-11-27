import { describe, expect, it } from 'vitest';
import {
  clampPlaybackTime,
  planRemoteSync,
  timeFromPointer,
  updateClockOffset,
} from '../syncPlayback';

const local = (
  patch: Partial<{ currentTime: number; duration: number; paused: boolean }> = {},
) => ({
  currentTime: 10,
  duration: 120,
  paused: false,
  ...patch,
});

describe('updateClockOffset', () => {
  it('оставляет оценку с наименьшей задержкой сети', () => {
    const first = updateClockOffset(null, 1_000, 600);
    const faster = updateClockOffset(first, 2_000, 1_920);
    const slower = updateClockOffset(faster, 3_000, 2_700);

    expect(first).toBe(-400);
    expect(faster).toBe(-80);
    expect(slower).toBe(-80);
  });

  it('сбрасывает оценку, если часы отправителя скакнули вперёд', () => {
    expect(updateClockOffset(-80, 5_000, 20_000)).toBe(15_000);
  });
});

describe('planRemoteSync', () => {
  it('не убегает вперёд из-за чужих часов', () => {
    const tutorTs = 1_000_000;
    const studentNow = 997_000;
    const offset = updateClockOffset(null, studentNow, tutorTs);

    const plan = planRemoteSync(
      { playing: true, time: 10, ts: tutorTs },
      local({ currentTime: 0, paused: true }),
      studentNow,
      offset,
    );

    expect(plan).toEqual({ kind: 'play', seekTo: 10 });
  });

  it('на следующем пульсе не перематывает, если локально уже там же', () => {
    const offset = 3_000;
    const plan = planRemoteSync(
      { playing: true, time: 12, ts: 1_002_000 },
      local({ currentTime: 12, paused: false }),
      999_000,
      offset,
    );

    expect(plan).toEqual({ kind: 'play', seekTo: null });
  });

  it('перематывает, когда слушатель отстал заметно', () => {
    const plan = planRemoteSync(
      { playing: true, time: 40, ts: 5_000 },
      local({ currentTime: 30, paused: false }),
      5_100,
      0,
    );

    expect(plan.kind).toBe('play');
    if (plan.kind === 'play') expect(plan.seekTo).toBeCloseTo(40.1, 5);
  });

  it('не запускает запись прошлого урока', () => {
    const now = 200_000;
    const plan = planRemoteSync(
      { playing: true, time: 15, ts: now - 120_000 },
      local({ currentTime: 0, paused: true }),
      now,
      0,
    );

    expect(plan).toEqual({ kind: 'pause', time: 15 });
  });

  it('на паузе ставит сохранённую позицию', () => {
    const plan = planRemoteSync(
      { playing: false, time: 22, ts: 5_000 },
      local({ currentTime: 40, paused: false }),
      5_200,
      0,
    );

    expect(plan).toEqual({ kind: 'pause', time: 22 });
  });

  it('живое сообщение с большой задержкой сдвигает не больше чем на 2.5 с', () => {
    const now = 50_000;
    const plan = planRemoteSync(
      { playing: true, time: 8, ts: now - 10_000 },
      local({ currentTime: 8, paused: true }),
      now,
      0,
    );

    expect(plan).toEqual({ kind: 'play', seekTo: 10.5 });
  });
});

describe('timeFromPointer', () => {
  it('переводит палец в секунды и зажимает края', () => {
    const rect = { left: 100, width: 200 };
    expect(timeFromPointer(100, rect, 60)).toBe(0);
    expect(timeFromPointer(200, rect, 60)).toBe(30);
    expect(timeFromPointer(400, rect, 60)).toBe(60);
    expect(timeFromPointer(50, rect, 60)).toBe(0);
  });

  it('без длительности или ширины остаётся в начале', () => {
    expect(timeFromPointer(10, { left: 0, width: 100 }, 0)).toBe(0);
    expect(timeFromPointer(10, { left: 0, width: 0 }, 40)).toBe(0);
  });
});

describe('clampPlaybackTime', () => {
  it('не даёт уйти за длительность и в NaN', () => {
    expect(clampPlaybackTime(150, 120)).toBe(120);
    expect(clampPlaybackTime(-5, 120)).toBe(0);
    expect(clampPlaybackTime(Number.NaN, 120)).toBe(0);
    expect(clampPlaybackTime(12, Number.POSITIVE_INFINITY)).toBe(12);
  });
});
