import { describe, expect, it } from 'vitest';
import { draggedBox } from '../draggedBox';

describe('draggedBox', () => {
  it('сохраняет направление протягивания', () => {
    expect(draggedBox({ x: 10, y: 20 }, { x: 40, y: 50 }, false)).toEqual({
      x: 10,
      y: 20,
      w: 30,
      h: 30,
    });
    expect(draggedBox({ x: 10, y: 20 }, { x: 0, y: 5 }, false)).toEqual({
      x: 0,
      y: 5,
      w: 10,
      h: 15,
    });
  });

  it('при фиксации пропорций делает стороны равными', () => {
    expect(draggedBox({ x: 0, y: 0 }, { x: 40, y: 10 }, true)).toEqual({
      x: 0,
      y: 0,
      w: 40,
      h: 40,
    });
  });
});
