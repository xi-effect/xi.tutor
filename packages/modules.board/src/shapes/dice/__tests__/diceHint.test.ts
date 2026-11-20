import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DICE_REROLL_HINT_STORAGE_KEY,
  dismissDiceRerollHint,
  isDiceRerollHintDismissed,
  pickVisibleDiceId,
  placeDiceHint,
} from '../diceHint';

function stubLocalStorage() {
  const mem = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => mem.get(key) ?? null,
    setItem: (key: string, value: string) => {
      mem.set(key, value);
    },
    removeItem: (key: string) => {
      mem.delete(key);
    },
    clear: () => mem.clear(),
    key: () => null,
    length: 0,
  });
}

describe('подсказка переброса кубика', () => {
  beforeEach(() => {
    stubLocalStorage();
  });

  it('показывается, пока пользователь не нажал «Понятно»', () => {
    expect(isDiceRerollHintDismissed()).toBe(false);
    dismissDiceRerollHint();
    expect(localStorage.getItem(DICE_REROLL_HINT_STORAGE_KEY)).toBe('1');
    expect(isDiceRerollHintDismissed()).toBe(true);
  });

  it('держится у того же кубика, пока он в кадре', () => {
    const viewport = { x: 0, y: 0, w: 1000, h: 800 };
    const dice = [
      { id: 'near', bounds: { x: 400, y: 300, w: 100, h: 100 } },
      { id: 'far', bounds: { x: 20, y: 20, w: 100, h: 100 } },
      { id: 'away', bounds: { x: 2000, y: 2000, w: 100, h: 100 } },
    ];

    expect(pickVisibleDiceId(dice, viewport, null)).toBe('near');
    expect(pickVisibleDiceId(dice, viewport, 'far')).toBe('far');
    expect(pickVisibleDiceId(dice, viewport, 'away')).toBe('near');
  });

  it('встаёт справа, а у правого края — слева или снизу', () => {
    const popup = { w: 240, h: 120 };
    const viewport = { w: 800, h: 600 };

    expect(placeDiceHint({ x: 100, y: 200, w: 128, h: 128 }, viewport, popup).side).toBe('right');
    expect(placeDiceHint({ x: 620, y: 200, w: 128, h: 128 }, viewport, popup).side).toBe('left');
    expect(
      placeDiceHint({ x: 300, y: 40, w: 200, h: 80 }, viewport, popup, 12, {
        top: 64,
        right: 16,
        bottom: 72,
        left: 16,
      }).side,
    ).toBe('bottom');
  });
});
