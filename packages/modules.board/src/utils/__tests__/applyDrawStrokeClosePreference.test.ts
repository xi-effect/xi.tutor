import { describe, expect, it } from 'vitest';
import { applyDrawStrokeClosePreference } from '../applyDrawStrokeClosePreference';

describe('applyDrawStrokeClosePreference', () => {
  it('оставляет замыкание, если настройка включена', () => {
    const shape = { type: 'draw', props: { isClosed: true, fill: 'semi' } };
    expect(applyDrawStrokeClosePreference(shape, true)).toBe(shape);
  });

  it('снимает замыкание у карандаша, если настройка выключена', () => {
    const shape = { type: 'draw', props: { isClosed: true, fill: 'semi' } };
    expect(applyDrawStrokeClosePreference(shape, false)).toEqual({
      type: 'draw',
      props: { isClosed: false, fill: 'semi' },
    });
  });

  it('не трогает другие фигуры', () => {
    const shape = { type: 'xi-geo', props: { isClosed: true } };
    expect(applyDrawStrokeClosePreference(shape, false)).toBe(shape);
  });
});
