import { describe, expect, it } from 'vitest';
import { mathFigureShapeProps } from '../MathFigureShape';

describe('mathFigureShapeProps', () => {
  it('подставляет false, если showMedian отсутствует в старой записи', () => {
    expect(mathFigureShapeProps.showMedian.validate(undefined)).toBe(false);
    expect(mathFigureShapeProps.showMedian.validate(null)).toBe(false);
    expect(mathFigureShapeProps.showMedian.validate(true)).toBe(true);
  });

  it('подставляет false, если showBisector отсутствует в старой записи', () => {
    expect(mathFigureShapeProps.showBisector.validate(undefined)).toBe(false);
    expect(mathFigureShapeProps.showBisector.validate(null)).toBe(false);
    expect(mathFigureShapeProps.showBisector.validate(true)).toBe(true);
  });
});
