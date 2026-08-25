import { describe, expect, it } from 'vitest';
import type { Awareness } from 'y-protocols/awareness';
import { BOARD_TIMER_UI_AWARENESS_KEY, readTimerUiVisible } from '../useBoardTimer';

function awarenessWithStates(states: Record<number, unknown>): Awareness {
  const map = new Map(Object.entries(states).map(([id, state]) => [Number(id), state]));
  return {
    getStates: () => map,
  } as unknown as Awareness;
}

describe('readTimerUiVisible', () => {
  it('скрыт, если никто не публиковал видимость', () => {
    expect(readTimerUiVisible(awarenessWithStates({ 1: {} }))).toBe(false);
  });

  it('берёт последнюю запись по updatedAt — закрытие ученика скрывает таймер у учителя', () => {
    const awareness = awarenessWithStates({
      1: {
        [BOARD_TIMER_UI_AWARENESS_KEY]: { isVisible: true, updatedAt: 100 },
      },
      2: {
        [BOARD_TIMER_UI_AWARENESS_KEY]: { isVisible: false, updatedAt: 200 },
      },
    });

    expect(readTimerUiVisible(awareness)).toBe(false);
  });

  it('повторное открытие с более новым updatedAt снова показывает панель', () => {
    const awareness = awarenessWithStates({
      1: {
        [BOARD_TIMER_UI_AWARENESS_KEY]: { isVisible: false, updatedAt: 200 },
      },
      2: {
        [BOARD_TIMER_UI_AWARENESS_KEY]: { isVisible: true, updatedAt: 300 },
      },
    });

    expect(readTimerUiVisible(awareness)).toBe(true);
  });
});
